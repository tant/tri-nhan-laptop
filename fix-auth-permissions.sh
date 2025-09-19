#!/bin/bash
# Script to fix auth permissions after database is ready

echo "Waiting for database to be ready..."
sleep 10

echo "Fixing auth.jwt() function ownership..."
docker exec supabase-db-dev psql -U postgres -d postgres -c "
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'jwt'
  ) THEN
    ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;
    RAISE NOTICE 'Fixed auth.jwt() function ownership';
  ELSE
    RAISE NOTICE 'auth.jwt() function not found yet';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not fix auth.jwt() ownership: %', SQLERRM;
END
\$\$;" 2>/dev/null

echo "Creating realtime schema..."
docker exec supabase-db-dev psql -U postgres -d postgres -c "
CREATE SCHEMA IF NOT EXISTS _realtime;
GRANT ALL ON SCHEMA _realtime TO postgres, supabase_admin;
GRANT USAGE ON SCHEMA _realtime TO authenticator, anon, authenticated, service_role;
" 2>/dev/null

echo "Database fixes applied"