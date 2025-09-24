-- Ticket Code Generation System Migration
-- Implements LRP-YYYY-XXXXXX format with database sequences and constraints

-- Create sequence table for yearly ticket numbering
CREATE TABLE IF NOT EXISTS ticket_sequences (
  year INTEGER PRIMARY KEY,
  sequence_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on ticket codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_tickets_ticket_code
ON repair_tickets (ticket_code)
WHERE ticket_code IS NOT NULL;

-- Function to generate next ticket code in LRP-YYYY-XXXXXX format
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  next_sequence INTEGER;
  ticket_code TEXT;
  vietnam_timezone TEXT := 'Asia/Ho_Chi_Minh';
BEGIN
  -- Get current year in Vietnamese timezone
  current_year := EXTRACT(YEAR FROM (NOW() AT TIME ZONE vietnam_timezone));

  -- Get or create sequence for current year
  INSERT INTO ticket_sequences (year, sequence_number)
  VALUES (current_year, 0)
  ON CONFLICT (year) DO NOTHING;

  -- Increment sequence and get next number
  UPDATE ticket_sequences
  SET sequence_number = sequence_number + 1,
      updated_at = NOW()
  WHERE year = current_year
  RETURNING sequence_number INTO next_sequence;

  -- Generate ticket code in LRP-YYYY-XXXXXX format
  ticket_code := 'LRP-' || current_year::TEXT || '-' || LPAD(next_sequence::TEXT, 6, '0');

  RETURN ticket_code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate ticket code format
CREATE OR REPLACE FUNCTION validate_ticket_code(code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if code matches LRP-YYYY-XXXXXX pattern
  RETURN code ~ '^LRP-[0-9]{4}-[0-9]{6}$';
END;
$$ LANGUAGE plpgsql;

-- Function to get ticket statistics by year
CREATE OR REPLACE FUNCTION get_ticket_stats_by_year(target_year INTEGER DEFAULT NULL)
RETURNS TABLE (
  year INTEGER,
  total_tickets INTEGER,
  current_sequence INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF target_year IS NULL THEN
    target_year := EXTRACT(YEAR FROM (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'));
  END IF;

  RETURN QUERY
  SELECT
    ts.year,
    COALESCE(COUNT(rt.id), 0)::INTEGER as total_tickets,
    ts.sequence_number as current_sequence,
    ts.updated_at as last_updated
  FROM ticket_sequences ts
  LEFT JOIN repair_tickets rt ON rt.ticket_code LIKE ('LRP-' || ts.year::TEXT || '-%')
  WHERE ts.year = target_year
  GROUP BY ts.year, ts.sequence_number, ts.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate ticket codes
CREATE OR REPLACE FUNCTION auto_generate_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate code if not already provided
  IF NEW.ticket_code IS NULL OR NEW.ticket_code = '' THEN
    NEW.ticket_code := generate_ticket_code();
  END IF;

  -- Validate ticket code format
  IF NOT validate_ticket_code(NEW.ticket_code) THEN
    RAISE EXCEPTION 'Invalid ticket code format: %. Expected format: LRP-YYYY-XXXXXX', NEW.ticket_code;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic ticket code generation
DROP TRIGGER IF EXISTS trigger_auto_generate_ticket_code ON repair_tickets;
CREATE TRIGGER trigger_auto_generate_ticket_code
  BEFORE INSERT ON repair_tickets
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_ticket_code();

-- Add ticket_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repair_tickets' AND column_name = 'ticket_code'
  ) THEN
    ALTER TABLE repair_tickets ADD COLUMN ticket_code TEXT;
  END IF;
END $$;

-- Update existing tickets without codes
DO $$
DECLARE
  ticket_record RECORD;
  new_code TEXT;
BEGIN
  FOR ticket_record IN
    SELECT id, created_at
    FROM repair_tickets
    WHERE ticket_code IS NULL OR ticket_code = ''
    ORDER BY created_at ASC
  LOOP
    -- Set the year context for code generation
    PERFORM set_config('repair_ticket.creation_year',
                      EXTRACT(YEAR FROM ticket_record.created_at)::TEXT,
                      true);

    -- Generate code for historical ticket
    new_code := generate_ticket_code();

    -- Update the ticket
    UPDATE repair_tickets
    SET ticket_code = new_code
    WHERE id = ticket_record.id;
  END LOOP;
END $$;

-- Create index for efficient ticket code searches
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ticket_code_search
ON repair_tickets USING btree (ticket_code text_pattern_ops);

-- Note: Year-based index removed due to immutability constraints
-- Queries by year can use the ticket_code index instead

-- Function to search tickets by code pattern
CREATE OR REPLACE FUNCTION search_tickets_by_code(search_pattern TEXT)
RETURNS TABLE (
  id UUID,
  ticket_code TEXT,
  customer_phone TEXT,
  device_info TEXT,
  current_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rt.id,
    rt.ticket_code,
    rt.customer_phone,
    rt.device_info,
    rt.current_state,
    rt.created_at
  FROM repair_tickets rt
  WHERE rt.ticket_code ILIKE ('%' || search_pattern || '%')
  ORDER BY rt.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get next available ticket code (for preview)
CREATE OR REPLACE FUNCTION preview_next_ticket_code()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  next_sequence INTEGER;
  ticket_code TEXT;
  vietnam_timezone TEXT := 'Asia/Ho_Chi_Minh';
BEGIN
  -- Get current year in Vietnamese timezone
  current_year := EXTRACT(YEAR FROM (NOW() AT TIME ZONE vietnam_timezone));

  -- Get current sequence for the year
  SELECT sequence_number + 1 INTO next_sequence
  FROM ticket_sequences
  WHERE year = current_year;

  -- If no sequence exists for this year, start from 1
  IF next_sequence IS NULL THEN
    next_sequence := 1;
  END IF;

  -- Generate preview ticket code
  ticket_code := 'LRP-' || current_year::TEXT || '-' || LPAD(next_sequence::TEXT, 6, '0');

  RETURN ticket_code;
END;
$$ LANGUAGE plpgsql;

-- Create ticket code constraints
ALTER TABLE repair_tickets
ADD CONSTRAINT chk_ticket_code_format
CHECK (ticket_code IS NULL OR validate_ticket_code(ticket_code));

-- Create notification function for ticket code generation
CREATE OR REPLACE FUNCTION notify_ticket_code_generated()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification about new ticket code
  PERFORM pg_notify(
    'ticket_code_generated',
    json_build_object(
      'ticket_id', NEW.id,
      'ticket_code', NEW.ticket_code,
      'customer_phone', NEW.customer_phone,
      'device_info', NEW.device_info,
      'created_at', NEW.created_at
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket code notifications
DROP TRIGGER IF EXISTS trigger_notify_ticket_code_generated ON repair_tickets;
CREATE TRIGGER trigger_notify_ticket_code_generated
  AFTER INSERT ON repair_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_code_generated();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_ticket_code() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_ticket_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ticket_stats_by_year(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_tickets_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION preview_next_ticket_code() TO authenticated;

-- Insert initial sequence for current year
INSERT INTO ticket_sequences (year, sequence_number)
VALUES (EXTRACT(YEAR FROM NOW()), 0)
ON CONFLICT (year) DO NOTHING;

-- Create view for ticket code analytics
CREATE OR REPLACE VIEW v_ticket_code_analytics AS
SELECT
  ts.year,
  ts.sequence_number as total_generated,
  COUNT(rt.id) as tickets_created,
  ts.sequence_number - COUNT(rt.id) as sequence_gaps,
  MIN(rt.created_at) as first_ticket_date,
  MAX(rt.created_at) as last_ticket_date,
  ts.updated_at as sequence_last_updated
FROM ticket_sequences ts
LEFT JOIN repair_tickets rt ON rt.ticket_code LIKE ('LRP-' || ts.year::TEXT || '-%')
GROUP BY ts.year, ts.sequence_number, ts.updated_at
ORDER BY ts.year DESC;

GRANT SELECT ON v_ticket_code_analytics TO authenticated;