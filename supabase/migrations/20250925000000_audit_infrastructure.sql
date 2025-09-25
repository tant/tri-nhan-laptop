-- Audit Infrastructure for Phase 2 Completion
-- Comprehensive audit logging for customer data access and security

-- Create audit_logs table for all system access tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_type TEXT NOT NULL, -- 'customer', 'repair_ticket', 'phone_number', etc.
    resource_id TEXT NOT NULL,   -- Customer phone, ticket code, etc. (masked for privacy)
    action TEXT NOT NULL,        -- 'view', 'search', 'create', 'update', 'delete', 'lookup'
    performed_by UUID REFERENCES auth.users(id),
    performed_by_role TEXT,      -- 'shop_owner', 'staff', 'public' for anonymous lookups
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    metadata JSONB,              -- Additional context data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance on common queries
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Create customer_access_logs for specific customer data access tracking
CREATE TABLE IF NOT EXISTS customer_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_phone_masked TEXT NOT NULL, -- Masked phone number for privacy
    access_type TEXT NOT NULL,           -- 'profile_view', 'history_view', 'search', 'public_lookup'
    accessed_by UUID REFERENCES auth.users(id),
    access_source TEXT NOT NULL,         -- 'admin_panel', 'public_interface', 'api'
    data_accessed JSONB,                 -- What specific data was accessed
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    privacy_consent_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for customer access tracking
CREATE INDEX idx_customer_access_phone ON customer_access_logs(customer_phone_masked);
CREATE INDEX idx_customer_access_user ON customer_access_logs(accessed_by);
CREATE INDEX idx_customer_access_created_at ON customer_access_logs(created_at);

-- Create rate_limit_tracking table for abuse prevention
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,           -- IP address or user ID
    identifier_type TEXT NOT NULL,      -- 'ip', 'user', 'phone'
    endpoint TEXT NOT NULL,             -- API endpoint or action being rate limited
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for rate limiting lookups
CREATE UNIQUE INDEX idx_rate_limit_unique ON rate_limit_tracking(identifier, endpoint, window_start);
CREATE INDEX idx_rate_limit_window ON rate_limit_tracking(window_end);

-- Enable Row Level Security on audit tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (only admin/shop_owner can read)
CREATE POLICY "audit_logs_select_policy" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'shop_owner'
            AND user_profiles.is_active = true
        )
    );

-- RLS Policies for customer_access_logs (admin/shop_owner can read)
CREATE POLICY "customer_access_logs_select_policy" ON customer_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('shop_owner', 'staff')
            AND user_profiles.is_active = true
        )
    );

-- RLS Policies for rate_limit_tracking (system use only, no direct access)
CREATE POLICY "rate_limit_tracking_system_only" ON rate_limit_tracking
    FOR ALL USING (false);

-- Create function to log audit entries
CREATE OR REPLACE FUNCTION log_audit_entry(
    p_resource_type TEXT,
    p_resource_id TEXT,
    p_action TEXT,
    p_performed_by UUID DEFAULT auth.uid(),
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
    user_role TEXT;
BEGIN
    -- Get user role if user is authenticated
    IF p_performed_by IS NOT NULL THEN
        SELECT role INTO user_role
        FROM user_profiles
        WHERE id = p_performed_by AND is_active = true;
    ELSE
        user_role := 'public';
    END IF;

    -- Insert audit log entry
    INSERT INTO audit_logs (
        resource_type,
        resource_id,
        action,
        performed_by,
        performed_by_role,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_resource_type,
        p_resource_id,
        p_action,
        p_performed_by,
        COALESCE(user_role, 'unknown'),
        p_ip_address,
        p_user_agent,
        p_metadata
    ) RETURNING id INTO audit_id;

    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log customer access
CREATE OR REPLACE FUNCTION log_customer_access(
    p_customer_phone_masked TEXT,
    p_access_type TEXT,
    p_access_source TEXT,
    p_data_accessed JSONB DEFAULT NULL,
    p_accessed_by UUID DEFAULT auth.uid(),
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    access_id UUID;
BEGIN
    INSERT INTO customer_access_logs (
        customer_phone_masked,
        access_type,
        accessed_by,
        access_source,
        data_accessed,
        ip_address,
        user_agent
    ) VALUES (
        p_customer_phone_masked,
        p_access_type,
        p_accessed_by,
        p_access_source,
        p_data_accessed,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO access_id;

    RETURN access_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_identifier_type TEXT,
    p_endpoint TEXT,
    p_window_minutes INTEGER DEFAULT 60,
    p_max_requests INTEGER DEFAULT 100
) RETURNS JSONB AS $$
DECLARE
    current_window_start TIMESTAMP WITH TIME ZONE;
    current_window_end TIMESTAMP WITH TIME ZONE;
    current_count INTEGER;
    blocked_until TIMESTAMP WITH TIME ZONE;
    rate_limit_record RECORD;
BEGIN
    -- Calculate current window
    current_window_start := DATE_TRUNC('hour', NOW()) +
                           (EXTRACT(MINUTE FROM NOW())::INTEGER / p_window_minutes) *
                           (p_window_minutes * INTERVAL '1 minute');
    current_window_end := current_window_start + (p_window_minutes * INTERVAL '1 minute');

    -- Check for existing rate limit record
    SELECT * INTO rate_limit_record
    FROM rate_limit_tracking
    WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start = current_window_start;

    IF rate_limit_record IS NOT NULL THEN
        -- Update existing record
        current_count := rate_limit_record.request_count + 1;

        UPDATE rate_limit_tracking
        SET request_count = current_count,
            updated_at = NOW()
        WHERE id = rate_limit_record.id;

        blocked_until := rate_limit_record.blocked_until;
    ELSE
        -- Create new record
        current_count := 1;

        INSERT INTO rate_limit_tracking (
            identifier,
            identifier_type,
            endpoint,
            request_count,
            window_start,
            window_end
        ) VALUES (
            p_identifier,
            p_identifier_type,
            p_endpoint,
            current_count,
            current_window_start,
            current_window_end
        );
    END IF;

    -- Check if rate limit exceeded
    IF current_count > p_max_requests THEN
        -- Block until end of current window
        blocked_until := current_window_end;

        UPDATE rate_limit_tracking
        SET blocked_until = blocked_until
        WHERE identifier = p_identifier
        AND endpoint = p_endpoint
        AND window_start = current_window_start;

        RETURN jsonb_build_object(
            'allowed', false,
            'current_count', current_count,
            'max_requests', p_max_requests,
            'window_end', current_window_end,
            'blocked_until', blocked_until,
            'reset_time', current_window_end
        );
    END IF;

    -- Request allowed
    RETURN jsonb_build_object(
        'allowed', true,
        'current_count', current_count,
        'max_requests', p_max_requests,
        'window_end', current_window_end,
        'remaining', p_max_requests - current_count,
        'reset_time', current_window_end
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_audit_entry TO authenticated;
GRANT EXECUTE ON FUNCTION log_customer_access TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated, anon;

-- Clean up old rate limit entries (function for maintenance)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_tracking() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limit_tracking
    WHERE window_end < NOW() - INTERVAL '24 hours';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment the tables
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for all system access and actions';
COMMENT ON TABLE customer_access_logs IS 'Specific tracking for customer data access and privacy compliance';
COMMENT ON TABLE rate_limit_tracking IS 'Rate limiting tracking and abuse prevention system';