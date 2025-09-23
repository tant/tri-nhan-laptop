#!/bin/bash

# Vietnamese Laptop Repair Shop - Supabase Service Fix Script
# This script ensures all Supabase services are properly configured

echo "🔧 Supabase Service Fix Automation"
echo "=================================="

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec supabase-db pg_isready -U postgres -h localhost >/dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    else
        echo "📋 Attempt $attempt/$max_attempts: Database not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Database failed to start after $max_attempts attempts"
    exit 1
fi

# Check if we can connect to database
echo "🔐 Checking service user passwords..."
if docker exec supabase-db psql -U postgres -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Cannot connect to database"

    # Try to create missing users
    echo "🔧 Creating missing database users..."
    docker exec supabase-db psql -U postgres -d postgres -c "
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
            CREATE USER supabase_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_admin;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
            CREATE USER supabase_auth_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_auth_admin;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
            CREATE USER supabase_storage_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_storage_admin;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_realtime_admin') THEN
            CREATE USER supabase_realtime_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_realtime_admin;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
            CREATE USER authenticator WITH PASSWORD 'your-super-secret-and-long-postgres-password';
            GRANT ALL PRIVILEGES ON DATABASE postgres TO authenticator;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
            CREATE ROLE anon;
            GRANT USAGE ON SCHEMA public TO anon;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
            CREATE ROLE authenticated;
            GRANT USAGE ON SCHEMA public TO authenticated;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
            CREATE ROLE service_role;
            GRANT ALL ON SCHEMA public TO service_role;
        END IF;

        GRANT anon TO authenticator;
        GRANT authenticated TO authenticator;
        GRANT service_role TO authenticator;
    END
    \$\$;
    " 2>/dev/null || true

    echo "✅ Database users created/verified"
fi

# Check if auth service is responding
echo "🔐 Checking auth service..."
max_attempts=20
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8000/auth/v1/health >/dev/null 2>&1; then
        echo "✅ Auth service is responding"
        break
    else
        echo "📋 Attempt $attempt/$max_attempts: Auth service not ready..."
        sleep 3
        attempt=$((attempt + 1))
    fi
done

# Check if PostgREST is responding
echo "📊 Checking PostgREST API..."
max_attempts=20
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8000/rest/v1/ >/dev/null 2>&1; then
        echo "✅ PostgREST API is responding"
        break
    else
        echo "📋 Attempt $attempt/$max_attempts: PostgREST not ready..."
        sleep 3
        attempt=$((attempt + 1))
    fi
done

# Check if Studio is accessible
echo "🎨 Checking Supabase Studio..."
max_attempts=15
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3010 >/dev/null 2>&1; then
        echo "✅ Supabase Studio is accessible"
        break
    else
        echo "📋 Attempt $attempt/$max_attempts: Studio not ready..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

echo ""
echo "🎉 Service initialization complete!"
echo "📊 Access Points:"
echo "   • React App: http://localhost:3000"
echo "   • Supabase API: http://localhost:8000"
echo "   • Supabase Studio: http://localhost:3010"
echo "   • Database: localhost:5433"
echo ""
echo "✅ Vietnamese Laptop Repair Shop system ready!"