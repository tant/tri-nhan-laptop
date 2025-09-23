#!/bin/bash
set -e

# Set the correct passwords for Supabase users
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Update passwords for all Supabase users
    ALTER USER authenticator PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER supabase_admin PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER supabase_auth_admin PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER supabase_storage_admin PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER supabase_realtime_admin PASSWORD '$POSTGRES_PASSWORD';
EOSQL