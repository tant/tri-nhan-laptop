-- Post-GoTrue initialization fixes
-- This script should be run after GoTrue has created its migrations

-- Fix auth.jwt() function ownership if it exists
DO $$
BEGIN
  -- Check if auth.jwt function exists and fix ownership
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'jwt'
  ) THEN
    EXECUTE 'ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin';
    RAISE NOTICE 'Fixed auth.jwt() function ownership';
  ELSE
    RAISE NOTICE 'auth.jwt() function not found - will be created by GoTrue';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not fix auth.jwt() ownership: %', SQLERRM;
END
$$;

-- Create additional schemas that services might need
CREATE SCHEMA IF NOT EXISTS _realtime;
GRANT ALL ON SCHEMA _realtime TO postgres, supabase_admin;
GRANT USAGE ON SCHEMA _realtime TO authenticator, anon, authenticated, service_role;

-- Grant necessary permissions for realtime
GRANT ALL ON SCHEMA realtime TO postgres, supabase_admin;
GRANT USAGE ON SCHEMA realtime TO authenticator, anon, authenticated, service_role;

RAISE NOTICE 'Post-GoTrue fixes completed';