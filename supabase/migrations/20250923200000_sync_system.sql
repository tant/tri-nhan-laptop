-- Real-Time Synchronization System Migration
-- Implements sync events, session management, and conflict resolution

-- Create sync events table for tracking all system changes
CREATE TABLE IF NOT EXISTS sync_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('status_update', 'ticket_update', 'user_action', 'system_event')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('repair_ticket', 'customer', 'part_usage', 'comment')),
  entity_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sync sessions table for managing active user sessions
CREATE TABLE IF NOT EXISTS sync_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sync conflicts table for tracking resolution
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  local_version INTEGER NOT NULL,
  remote_version INTEGER NOT NULL,
  local_data JSONB NOT NULL,
  remote_data JSONB NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolution_strategy TEXT CHECK (resolution_strategy IN ('local_wins', 'remote_wins', 'merge', 'user_choice')),
  resolved_data JSONB,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add version column to main tables for conflict detection
DO $$
BEGIN
  -- Add version to repair_tickets if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repair_tickets' AND column_name = 'version'
  ) THEN
    ALTER TABLE repair_tickets ADD COLUMN version INTEGER DEFAULT 1;
  END IF;

  -- Add version to customers if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'version'
  ) THEN
    ALTER TABLE customers ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sync_events_entity ON sync_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_timestamp ON sync_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sync_events_session ON sync_events (session_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_user ON sync_events (user_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_type ON sync_events (type);

CREATE INDEX IF NOT EXISTS idx_sync_sessions_user ON sync_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_active ON sync_sessions (active);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_last_seen ON sync_sessions (last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity ON sync_conflicts (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_unresolved ON sync_conflicts (resolved) WHERE resolved = false;

-- Function to auto-increment version on updates
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = COALESCE(OLD.version, 0) + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for version increment
DROP TRIGGER IF EXISTS trigger_repair_tickets_version ON repair_tickets;
CREATE TRIGGER trigger_repair_tickets_version
  BEFORE UPDATE ON repair_tickets
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

DROP TRIGGER IF EXISTS trigger_customers_version ON customers;
CREATE TRIGGER trigger_customers_version
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- Function to clean old sync events (keep last 1000 per entity)
CREATE OR REPLACE FUNCTION cleanup_sync_events()
RETURNS void AS $$
BEGIN
  -- Delete sync events older than 7 days, keeping at least 100 per entity
  DELETE FROM sync_events
  WHERE id IN (
    SELECT id FROM (
      SELECT id,
        ROW_NUMBER() OVER (
          PARTITION BY entity_type, entity_id
          ORDER BY timestamp DESC
        ) as rn
      FROM sync_events
      WHERE timestamp < NOW() - INTERVAL '7 days'
    ) ranked
    WHERE rn > 100
  );

  -- Clean up old resolved conflicts (older than 30 days)
  DELETE FROM sync_conflicts
  WHERE resolved = true
    AND resolved_at < NOW() - INTERVAL '30 days';

  -- Clean up inactive sessions (older than 1 day)
  DELETE FROM sync_sessions
  WHERE active = false
    AND last_seen < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to get active sessions
CREATE OR REPLACE FUNCTION get_active_sessions()
RETURNS TABLE (
  session_id TEXT,
  user_id UUID,
  user_name TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  context JSONB,
  session_duration INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as session_id,
    s.user_id,
    s.user_name,
    s.connected_at,
    s.last_seen,
    s.context,
    s.last_seen - s.connected_at as session_duration
  FROM sync_sessions s
  WHERE s.active = true
    AND s.last_seen > NOW() - INTERVAL '5 minutes'
  ORDER BY s.last_seen DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve sync conflicts automatically
CREATE OR REPLACE FUNCTION auto_resolve_conflict(
  p_conflict_id TEXT,
  p_strategy TEXT DEFAULT 'remote_wins'
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_record sync_conflicts%ROWTYPE;
  resolved_data JSONB;
  table_name TEXT;
BEGIN
  -- Get conflict details
  SELECT * INTO conflict_record
  FROM sync_conflicts
  WHERE id = p_conflict_id AND resolved = false;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Determine table name from entity type
  table_name := CASE conflict_record.entity_type
    WHEN 'repair_ticket' THEN 'repair_tickets'
    WHEN 'customer' THEN 'customers'
    WHEN 'part_usage' THEN 'part_usage'
    WHEN 'comment' THEN 'ticket_comments'
    ELSE NULL
  END;

  IF table_name IS NULL THEN
    RETURN false;
  END IF;

  -- Apply resolution strategy
  IF p_strategy = 'local_wins' THEN
    resolved_data := conflict_record.local_data;
  ELSIF p_strategy = 'remote_wins' THEN
    resolved_data := conflict_record.remote_data;
  ELSIF p_strategy = 'merge' THEN
    -- Simple merge: remote data wins for conflicting fields
    resolved_data := conflict_record.local_data || conflict_record.remote_data;
  ELSE
    RETURN false;
  END IF;

  -- Update the entity with resolved data
  EXECUTE format(
    'UPDATE %I SET %s, version = $1, updated_at = NOW() WHERE id = $2',
    table_name,
    (
      SELECT string_agg(
        format('%I = ($3->>%L)::%s', key, key,
          CASE
            WHEN value::text ~ '^[0-9]+$' THEN 'INTEGER'
            WHEN value::text ~ '^[0-9]+\.[0-9]+$' THEN 'DECIMAL'
            WHEN value::text ~ '^(true|false)$' THEN 'BOOLEAN'
            WHEN value::text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN 'TIMESTAMP WITH TIME ZONE'
            ELSE 'TEXT'
          END
        ),
        ', '
      )
      FROM jsonb_each(resolved_data) AS t(key, value)
      WHERE key NOT IN ('id', 'created_at')
    )
  ) USING conflict_record.remote_version, conflict_record.entity_id, resolved_data;

  -- Mark conflict as resolved
  UPDATE sync_conflicts
  SET resolved = true,
      resolution_strategy = p_strategy,
      resolved_data = resolved_data,
      resolved_at = NOW()
  WHERE id = p_conflict_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error auto-resolving conflict %: %', p_conflict_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to broadcast sync events via pg_notify
CREATE OR REPLACE FUNCTION notify_sync_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for real-time updates
  PERFORM pg_notify(
    'sync_realtime',
    json_build_object(
      'event_id', NEW.id,
      'type', NEW.type,
      'entity_type', NEW.entity_type,
      'entity_id', NEW.entity_id,
      'user_id', NEW.user_id,
      'user_name', NEW.user_name,
      'session_id', NEW.session_id,
      'timestamp', NEW.timestamp,
      'data', NEW.data
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sync event notifications
DROP TRIGGER IF EXISTS trigger_notify_sync_event ON sync_events;
CREATE TRIGGER trigger_notify_sync_event
  AFTER INSERT ON sync_events
  FOR EACH ROW
  EXECUTE FUNCTION notify_sync_event();

-- Function to update session last_seen timestamp
CREATE OR REPLACE FUNCTION update_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session updates
DROP TRIGGER IF EXISTS trigger_update_session_last_seen ON sync_sessions;
CREATE TRIGGER trigger_update_session_last_seen
  BEFORE UPDATE ON sync_sessions
  FOR each ROW
  EXECUTE FUNCTION update_session_last_seen();

-- Function to get sync statistics
CREATE OR REPLACE FUNCTION get_sync_stats(
  time_range INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
  total_events INTEGER,
  events_by_type JSONB,
  active_sessions INTEGER,
  total_conflicts INTEGER,
  resolved_conflicts INTEGER,
  avg_resolution_time INTERVAL,
  most_active_users JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH event_stats AS (
    SELECT
      COUNT(*)::INTEGER as total,
      json_agg(
        json_build_object(
          'type', type,
          'count', type_count
        )
      ) as by_type
    FROM (
      SELECT type, COUNT(*) as type_count
      FROM sync_events
      WHERE timestamp > NOW() - time_range
      GROUP BY type
    ) t
  ),
  session_stats AS (
    SELECT COUNT(*)::INTEGER as active
    FROM sync_sessions
    WHERE active = true
      AND last_seen > NOW() - INTERVAL '5 minutes'
  ),
  conflict_stats AS (
    SELECT
      COUNT(*)::INTEGER as total,
      COUNT(*) FILTER (WHERE resolved = true)::INTEGER as resolved,
      AVG(resolved_at - created_at) as avg_time
    FROM sync_conflicts
    WHERE created_at > NOW() - time_range
  ),
  user_stats AS (
    SELECT json_agg(
      json_build_object(
        'user_name', user_name,
        'event_count', event_count
      ) ORDER BY event_count DESC
    ) as top_users
    FROM (
      SELECT user_name, COUNT(*) as event_count
      FROM sync_events
      WHERE timestamp > NOW() - time_range
      GROUP BY user_name
      ORDER BY event_count DESC
      LIMIT 5
    ) u
  )
  SELECT
    COALESCE(e.total, 0),
    COALESCE(e.by_type, '[]'::jsonb),
    COALESCE(s.active, 0),
    COALESCE(c.total, 0),
    COALESCE(c.resolved, 0),
    c.avg_time,
    COALESCE(u.top_users, '[]'::jsonb)
  FROM event_stats e
  CROSS JOIN session_stats s
  CROSS JOIN conflict_stats c
  CROSS JOIN user_stats u;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_conflicts TO authenticated;

GRANT EXECUTE ON FUNCTION cleanup_sync_events() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_resolve_conflict(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sync_stats(INTERVAL) TO authenticated;

-- Create view for sync event analytics
CREATE OR REPLACE VIEW v_sync_analytics AS
SELECT
  DATE_TRUNC('hour', timestamp) as hour,
  type,
  entity_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(EXTRACT(EPOCH FROM (NOW() - timestamp))) as avg_age_seconds
FROM sync_events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', timestamp), type, entity_type
ORDER BY hour DESC, event_count DESC;

GRANT SELECT ON v_sync_analytics TO authenticated;

-- Schedule cleanup job (requires pg_cron extension in production)
-- SELECT cron.schedule('cleanup-sync-events', '0 2 * * *', 'SELECT cleanup_sync_events();');

-- Create initial admin session tracking
INSERT INTO sync_sessions (
  id,
  user_id,
  user_name,
  connected_at,
  last_seen,
  active,
  context
)
SELECT
  'admin-session-' || gen_random_uuid()::text,
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  NOW(),
  NOW(),
  false,
  '{"initial": true}'::jsonb
FROM auth.users
WHERE email = 'admin@laptoprepair.vn'
ON CONFLICT (id) DO NOTHING;