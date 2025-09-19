-- Create auth schema and JWT function (simple version for development)
CREATE SCHEMA IF NOT EXISTS auth;

-- Simple JWT function for development
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB
    LANGUAGE sql STABLE
    AS $$
    SELECT '{}'::jsonb
$$;