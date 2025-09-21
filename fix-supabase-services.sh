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

# Check database connection
echo "🔐 Checking database connection..."
if docker exec supabase-db-dev psql -U postgres -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database connection working"
else
    echo "❌ Cannot connect to database"
    exit 1
fi

# Check and fix auth schema if needed
echo "🔧 Checking auth service setup..."
auth_schema_exists=$(docker exec supabase-db-dev psql -U postgres -d postgres -t -c "
    SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth');
" 2>/dev/null | xargs || echo "f")

if [ "$auth_schema_exists" = "t" ]; then
    # Check if auth service migrations are stuck
    migration_count=$(docker exec supabase-db-dev psql -U postgres -d postgres -t -c "
        SELECT COUNT(*) FROM auth.schema_migrations;
    " 2>/dev/null | xargs || echo "0")

    if [ "$migration_count" = "0" ]; then
        echo "🔧 Auth schema exists but migrations not tracked - cleaning up for fresh start..."
        docker exec supabase-db-dev psql -U postgres -d postgres -c "DROP SCHEMA IF EXISTS auth CASCADE;" 2>/dev/null || true
        echo "✅ Auth schema cleaned - service will recreate it"
    else
        echo "✅ Auth schema properly initialized"
    fi
else
    echo "ℹ️  Auth schema will be created by GoTrue service"
fi

# Start/restart auth service with proper sequencing
echo "🔄 Managing auth service..."
if container_running "supabase-auth-dev"; then
    if container_healthy "supabase-auth-dev"; then
        echo "✅ Auth service is healthy"
    else
        echo "🔧 Stopping and restarting auth service for clean startup..."
        docker stop supabase-auth-dev
        sleep 2
        docker start supabase-auth-dev

        # Wait for auth service to become healthy with longer timeout
        echo "⏳ Waiting for auth service to initialize (this may take a while)..."
        local retries=0
        local max_retries=60  # Increased timeout for migration processing

        while [ $retries -lt $max_retries ]; do
            sleep 3
            if container_healthy "supabase-auth-dev"; then
                echo "✅ Auth service is now healthy"
                break
            fi
            retries=$((retries + 1))
            echo "   Attempt $retries/$max_retries..."
        done

        if [ $retries -eq $max_retries ]; then
            echo "⚠️  Auth service taking longer than expected - check logs with: docker logs supabase-auth-dev"
        fi
    fi
else
    echo "🔧 Starting auth service..."
    docker start supabase-auth-dev
    echo "⏳ Auth service starting..."
fi

# Start realtime service (depends on auth being ready)
echo "🔄 Managing realtime service..."
if container_running "supabase-realtime-dev"; then
    if container_healthy "supabase-realtime-dev"; then
        echo "✅ Realtime service is healthy"
    else
        echo "🔧 Restarting realtime service..."
        docker restart "supabase-realtime-dev"

        # Wait for realtime to become healthy
        echo "⏳ Waiting for realtime service..."
        local retries=0
        local max_retries=30

        while [ $retries -lt $max_retries ]; do
            sleep 2
            if container_healthy "supabase-realtime-dev"; then
                echo "✅ Realtime service is now healthy"
                break
            fi
            retries=$((retries + 1))
            echo "   Attempt $retries/$max_retries..."
        done

        if [ $retries -eq $max_retries ]; then
            echo "⚠️  Realtime service taking longer than expected"
        fi
    fi
else
    echo "🔧 Starting realtime service..."
    docker start "supabase-realtime-dev"
fi

# Start all remaining services in correct order
echo "🚀 Starting all remaining services..."

# Start core services first (order matters!)
services_to_start=(
    "supabase-rest-dev"
    "supabase-meta-dev"
    "supabase-storage-dev"
    "supabase-edge-functions-dev"
    "supabase-kong-dev"
    "supabase-studio-dev"
    "try-vite-app-dev-1"
)

for service in "${services_to_start[@]}"; do
    if docker ps -a --format "table {{.Names}}" | grep -q "$service"; then
        if ! container_running "$service"; then
            echo "🔧 Starting $service..."
            docker start "$service" > /dev/null 2>&1 || echo "⚠️  Could not start $service"
        else
            echo "✅ $service is running"
        fi
    else
        echo "ℹ️  $service container not found"
    fi
done

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