-- Supabase required roles and users setup
-- This file creates the necessary users that Supabase services expect

-- Create required roles for Supabase services
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN;
    END IF;

    -- Create users that Supabase services connect with using a placeholder password
    -- The actual password will be set using ALTER USER commands
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
        CREATE USER authenticator WITH LOGIN PASSWORD 'temp_password' CREATEDB;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE USER supabase_admin WITH LOGIN PASSWORD 'temp_password' SUPERUSER;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE USER supabase_auth_admin WITH LOGIN PASSWORD 'temp_password';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE USER supabase_storage_admin WITH LOGIN PASSWORD 'temp_password';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_realtime_admin') THEN
        CREATE USER supabase_realtime_admin WITH LOGIN PASSWORD 'temp_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT anon, authenticated, service_role TO authenticator;
GRANT anon, authenticated, service_role TO supabase_admin;
GRANT anon, authenticated, service_role TO supabase_auth_admin;
GRANT anon, authenticated, service_role TO supabase_storage_admin;
GRANT anon, authenticated, service_role TO supabase_realtime_admin;

-- Grant superuser to admin accounts
ALTER USER supabase_admin CREATEDB CREATEROLE;
ALTER USER supabase_auth_admin CREATEDB;
ALTER USER supabase_storage_admin CREATEDB SUPERUSER;
ALTER USER supabase_realtime_admin CREATEDB;