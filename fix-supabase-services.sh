#!/bin/bash
# Supabase Service Fix Automation
# This script automatically fixes common startup issues after 'make dev'

set -e

echo "🔧 Supabase Service Fix Automation"
echo "=================================="

# Function to check if container is running
container_running() {
    docker ps --format "table {{.Names}}" | grep -q "$1"
}

# Function to check if container is healthy
container_healthy() {
    docker inspect --format='{{.State.Health.Status}}' "$1" 2>/dev/null | grep -q "healthy"
}

# Function to wait for database to be ready
wait_for_database() {
    echo "⏳ Waiting for database to be ready..."
    local retries=0
    local max_retries=30

    while [ $retries -lt $max_retries ]; do
        if docker exec supabase-db-dev pg_isready -U postgres > /dev/null 2>&1; then
            echo "✅ Database is ready"
            return 0
        fi
        retries=$((retries + 1))
        echo "   Attempt $retries/$max_retries - waiting 2 seconds..."
        sleep 2
    done

    echo "❌ Database failed to become ready after $max_retries attempts"
    return 1
}

# Check if development environment is running
if ! container_running "supabase-db-dev"; then
    echo "❌ Supabase development environment not running"
    echo "   Please run 'make dev' first"
    exit 1
fi

# Wait for database to be ready
wait_for_database

# Check if passwords need to be set
echo "🔐 Checking service user passwords..."
if docker exec supabase-db-dev psql -U postgres -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    # Check if authenticator has password
    auth_has_password=$(docker exec supabase-db-dev psql -U postgres -d postgres -t -c "SELECT rolpassword IS NOT NULL FROM pg_authid WHERE rolname = 'authenticator';" | xargs)

    if [ "$auth_has_password" = "f" ]; then
        echo "🔧 Setting service user passwords..."
        docker exec supabase-db-dev psql -U supabase_admin -d postgres -c "
            ALTER USER supabase_auth_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            ALTER USER authenticator WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            ALTER USER supabase_storage_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
        "
        echo "✅ Service user passwords set"
    else
        echo "✅ Service user passwords already set"
    fi
else
    echo "❌ Cannot connect to database"
    exit 1
fi

# Fix JWT function ownership if needed
echo "🔧 Checking JWT function ownership..."
jwt_owner=$(docker exec supabase-db-dev psql -U postgres -d postgres -t -c "
    SELECT pg_get_userbyid(proowner)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'jwt'
" 2>/dev/null | xargs || echo "")

if [ "$jwt_owner" = "supabase_auth_admin" ]; then
    echo "✅ JWT function ownership correct"
elif [ -n "$jwt_owner" ]; then
    echo "🔧 Fixing JWT function ownership..."
    docker exec supabase-db-dev psql -U supabase_admin -d postgres -c "ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;"
    echo "✅ JWT function ownership fixed"
else
    echo "ℹ️  JWT function not found (will be created by GoTrue)"
fi

# Restart auth service if it's not healthy
echo "🔄 Checking auth service health..."
if container_running "supabase-auth-dev"; then
    if container_healthy "supabase-auth-dev"; then
        echo "✅ Auth service is healthy"
    else
        echo "🔧 Restarting auth service..."
        docker restart supabase-auth-dev

        # Wait for auth service to become healthy
        echo "⏳ Waiting for auth service to become healthy..."
        local retries=0
        local max_retries=30

        while [ $retries -lt $max_retries ]; do
            sleep 2
            if container_healthy "supabase-auth-dev"; then
                echo "✅ Auth service is now healthy"
                break
            fi
            retries=$((retries + 1))
            echo "   Attempt $retries/$max_retries..."
        done

        if [ $retries -eq $max_retries ]; then
            echo "⚠️  Auth service did not become healthy, but fixes have been applied"
        fi
    fi
else
    echo "⚠️  Auth service not running"
fi

# Start Kong and React app if they're not running
echo "🚀 Starting remaining services..."

# Always start Kong
if ! container_running "supabase-kong-dev"; then
    echo "🔧 Starting supabase-kong-dev..."
    docker start "supabase-kong-dev" > /dev/null 2>&1 || echo "⚠️  Could not start supabase-kong-dev"
else
    echo "✅ supabase-kong-dev is running"
fi

# Only start React app if it exists (not in backend-only mode)
if docker ps -a --format "table {{.Names}}" | grep -q "try-vite-app-dev-1"; then
    if ! container_running "try-vite-app-dev-1"; then
        echo "🔧 Starting try-vite-app-dev-1..."
        docker start "try-vite-app-dev-1" > /dev/null 2>&1 || echo "⚠️  Could not start try-vite-app-dev-1"
    else
        echo "✅ try-vite-app-dev-1 is running"
    fi
else
    echo "ℹ️  React app container not found (backend-only mode)"
fi

echo ""
echo "🎉 Supabase service fixes completed!"
echo ""
echo "📊 Service Status:"
make status

echo ""
echo "🌐 Quick Access:"
if docker ps -a --format "table {{.Names}}" | grep -q "try-vite-app-dev-1"; then
    echo "• React App: http://localhost:3000"
else
    echo "• React App: Run 'pnpm dev' → http://localhost:5173"
fi
echo "• Supabase Studio: http://localhost:3010"
echo "• API Gateway: http://localhost:8000"