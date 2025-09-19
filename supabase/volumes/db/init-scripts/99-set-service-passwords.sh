#!/bin/bash
set -e

# This script will be executed after all init scripts are done
echo "Setting passwords for service users..."

# Set password for auth admin user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER USER supabase_auth_admin WITH PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER authenticator WITH PASSWORD '$POSTGRES_PASSWORD';
    ALTER USER supabase_storage_admin WITH PASSWORD '$POSTGRES_PASSWORD';
EOSQL

echo "Service user passwords set successfully!"