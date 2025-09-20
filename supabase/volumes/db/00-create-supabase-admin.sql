-- Create supabase_admin user first (before migrate.sh runs)
-- This must run before the built-in migrate.sh script

DO $$
BEGIN
    -- Create supabase_admin role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE ROLE supabase_admin NOLOGIN NOINHERIT CREATEROLE CREATEDB;
        -- Set password using environment variable
        EXECUTE format('ALTER ROLE supabase_admin LOGIN PASSWORD %L',
                      COALESCE(current_setting('supabase.postgres_password', true), 'your-super-secret-and-long-postgres-password'));
    END IF;
END
$$;