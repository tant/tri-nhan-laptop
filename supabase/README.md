# Laptop Repair Shop - Supabase Setup

## Overview

This setup includes a complete Supabase backend for a laptop repair shop management system with:

- **Kong API Gateway**: Entry point with CORS handling and API routing
- **PostgreSQL Database**: Main data storage with custom schema
- **Auth (GoTrue)**: User authentication and authorization
- **REST API (PostgREST)**: Auto-generated REST API from database schema
- **Realtime**: Real-time subscriptions for live updates
- **Storage**: File uploads for repair images and documents
- **Studio**: Database management UI (Supabase Dashboard)
- **Edge Functions**: Serverless functions for custom business logic
- **Meta**: Database schema introspection API

## Quick Start

1. **Setup environment**:
   ```bash
   # Create required directories
   mkdir -p supabase/volumes/storage supabase/volumes/db/data supabase/volumes/db/data-dev

   # Ensure .env file exists with correct configuration
   ```

2. **Start development environment** (fully automated):
   ```bash
   make dev
   ```

   This command automatically:
   - Starts all Docker containers
   - Initializes the database with proper roles and permissions
   - Sets service user passwords
   - Fixes JWT function ownership
   - Restarts services as needed
   - No manual intervention required!

3. **Access services**:
   - React App (Dev): http://localhost:3000 (if using dev container)
   - Supabase Studio: http://localhost:3010
   - Kong API Gateway: http://localhost:8000
   - Database: localhost:5433 (dev) / localhost:5432 (prod)

## Available Commands

```bash
# Development Environment
docker compose -f docker-compose.dev.yml --env-file .env up -d     # Start dev
docker compose -f docker-compose.dev.yml --env-file .env down      # Stop dev
docker compose -f docker-compose.dev.yml --env-file .env logs -f   # Show dev logs

# Production Environment
docker compose --env-file .env up -d      # Start production
docker compose --env-file .env down       # Stop production
docker compose --env-file .env logs -f    # Show production logs
docker compose --env-file .env build app  # Build React app

# Database Management
docker compose --env-file .env down -v --remove-orphans  # Full cleanup
docker run --rm -v "$(pwd)/supabase/volumes/db:/data" alpine:latest sh -c "rm -rf /data/data /data/data-dev && mkdir -p /data/data /data/data-dev && chown -R 1000:1000 /data/data /data/data-dev"  # Clean data directories

# Service Status & Debugging
docker compose --env-file .env ps         # Show service status
docker logs supabase-auth-dev                      # Check auth service logs
docker logs supabase-db-dev                        # Check database logs

# Utilities (if Makefile available)
make dev          # Start development environment
make up           # Start production environment
make clean-data   # Clean database data directories
make fix-permissions  # Fix volume permissions
```

## Environment Configuration

The setup uses `.env` file for configuration. Key variables:

```bash
# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
POSTGRES_DB=postgres

# JWT & Auth
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Endpoints
SUPABASE_PUBLIC_URL=http://localhost:8000
KONG_HTTP_PORT=8000

# Shop Admin Account (Owner/Manager)
SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
SHOP_ADMIN_PASSWORD=AdminPass123!
SHOP_ADMIN_NAME=Shop Manager
SHOP_ADMIN_ROLE=shop_owner
```

## Database Schema

The included schema (`repair_shop_schema.sql`) provides:

### Tables
- `user_profiles` - Staff user management with roles & permissions
- `customers` - Customer information
- `repairs` - Repair tickets
- `repair_status_logs` - Status change history
- `parts` - Inventory management
- `repair_parts` - Parts used in repairs

### User Roles & Permissions
- **shop_owner**: Full access, can create users
- **manager**: Can manage staff and view financials  
- **technician**: Can handle repairs, limited inventory access
- **staff**: Basic repair handling

### Features
- Row Level Security (RLS) enabled
- Role-based access control
- Automatic user profile creation
- Automatic ticket number generation
- Status change logging
- Real-time subscriptions ready
- Sample data included

## Frontend Integration

Install Supabase client:
```bash
pnpm add @supabase/supabase-js
```

### Admin User Setup

The admin user is automatically created during database initialization using the environment variables in `.env`:

- **Email**: `SHOP_ADMIN_EMAIL` (default: admin@laptop-repair-shop.local)
- **Password**: `SHOP_ADMIN_PASSWORD` (default: AdminPass123!)
- **Name**: `SHOP_ADMIN_NAME` (default: Shop Manager)
- **Role**: `SHOP_ADMIN_ROLE` (default: shop_owner)

The admin user is ready to use immediately after running `make dev`.

**Admin can create staff users**:
```javascript
// Call user management function
const { data, error } = await supabase.functions.invoke('user-management', {
  body: {
    email: 'technician@shop.com',
    password: 'TechPass123!',
    full_name: 'John Technician',
    role: 'technician',
    phone: '+1234567890',
    can_manage_inventory: false,
    can_view_financials: false
  }
})
```

### Basic Usage Examples

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://localhost:8000',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

// User login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'staff@shop.com',
  password: 'password'
})

// Create repair ticket
const { data, error } = await supabase
  .from('repairs')
  .insert([{
    customer_id: customerId,
    device_brand: 'Apple',
    device_model: 'MacBook Pro 13"',
    issue_description: 'Screen cracked'
  }])

// Real-time subscriptions
supabase
  .channel('repairs')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'repairs' 
  }, (payload) => {
    console.log('Repair updated:', payload)
  })
  .subscribe()

// File upload
const { data, error } = await supabase.storage
  .from('repair-images')
  .upload(`repairs/${repairId}/before.jpg`, file)
```

## Service Architecture

```
React App (3000/3001) 
    ↓
Kong Gateway (8000) 
    ↓
┌─────────────────────────────────┐
│ Auth (9999)     Storage (5000)  │
│ REST (3000)     Realtime (4000) │
│ Functions       Meta (8080)     │
└─────────────────────────────────┘
    ↓
PostgreSQL (5432/5433)
```

## Development vs Production

### Development (`make dev`)
- Separate containers with `-dev` suffix
- Database on port 5433
- Hot reload for React app
- Separate data volumes

### Production (`make up`)
- Optimized containers
- Database on port 5432  
- Built React app served by nginx
- Shared network for all services

## Troubleshooting

### Common Issues and Solutions

#### 1. **Auth Service Fails to Start (Legacy Issue)**
**Note**: This issue is now automatically fixed by the `make dev` automation.

If you encounter this manually, you can run:
```bash
# Manual fix (usually not needed)
./fix-supabase-services.sh
```

#### 2. **Permission Denied on Database Volumes**
**Symptoms**: `permission denied` when trying to delete database directories

**Solution**: Use Docker container to fix permissions:
```bash
docker run --rm -v "$(pwd)/supabase/volumes/db:/data" alpine:latest chown -R 1000:1000 /data/data /data/data-dev
```

#### 3. **Port Conflicts**
**Symptoms**: `port is already allocated` error

**Solution**: Stop conflicting services or use different ports:
```bash
# Check what's using the ports
docker ps
netstat -tulpn | grep :3010

# Stop dev environment before starting production
docker compose -f docker-compose.dev.yml --env-file .env down
```

#### 4. **Build Fails with "npm not found"**
**Symptoms**: Docker build fails with `npm: not found` in node:20-alpine

**Fixed**: The Dockerfile now includes:
```dockerfile
RUN apk add --no-cache npm && npm install -g pnpm
```

#### 5. **TypeScript Build Errors**
**Symptoms**: Build fails with TypeScript errors in AdminPanel.tsx

**Fixed**:
- Added missing `@supabase/supabase-js` dependency
- Fixed unused variable warnings
- Updated Supabase client with correct anon key

#### 6. **Services Keep Restarting**
**Symptoms**: Auth, REST, or Storage services show "Restarting" status

**Diagnosis**: Check logs to identify the root cause:
```bash
docker logs supabase-auth-dev
docker logs supabase-rest-dev
docker logs supabase-db-dev | grep ERROR
```

**Common causes**:
- Database not ready (wait for health check)
- Missing passwords (see solution #1)
- Environment variable misconfiguration

#### 7. **Supabase Studio Shows "Unhealthy"**
**Symptoms**: Studio accessible but shows unhealthy status

**Usually harmless**: Studio often works fine despite health check failures. Access http://localhost:3010 to verify.

#### 8. **Clean Reinitialization Process**
For a completely fresh start:
```bash
# 1. Full cleanup
make clean

# 2. Start fresh (fully automated)
make dev
```

The automation handles all initialization automatically.

### Verification Commands

Test that everything is working:
```bash
# Check service status
docker compose -f docker-compose.dev.yml --env-file .env ps

# Test API endpoints
curl -s http://localhost:8000/auth/v1/health
curl -s -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" http://localhost:8000/rest/v1/

# Test Studio
curl -s http://localhost:3010 > /dev/null && echo "Studio accessible"
```

## Current Working Status

✅ **Tested and Working** (as of latest update):

### Development Environment
- All Supabase services start and run healthy
- Database initialization with proper roles and permissions
- Auth service connects after password setup
- Kong API Gateway routes requests correctly
- Supabase Studio accessible on port 3010

### Production Environment
- React app builds successfully in Docker
- Production Nginx serving static files on port 3001
- All backend services running and healthy
- API endpoints responding correctly

### Service Endpoints
- **Auth API**: http://localhost:8000/auth/v1/health ✅
- **REST API**: http://localhost:8000/rest/v1/ ✅
- **Supabase Studio**: http://localhost:3010 ✅
- **Production React App**: http://localhost:3001 ✅

### Clean Reinitialization
- Database volumes can be deleted without sudo ✅
- Full cleanup with `docker compose down -v` works ✅
- Fresh initialization works reliably ✅

## Security Configuration

⚠️ **Current Setup Uses Lowered Security for Development**:
- Simplified JWT functions for easier development
- Default demo keys for development (should be changed for production)
- Auth migrations simplified to avoid permission conflicts
- Database user creation streamlined

For production deployment, consider implementing proper security measures.

## File Structure

```
├── docker-compose.yml          # Production setup (✅ tested)
├── docker-compose.dev.yml      # Development setup (✅ tested)
├── .env              # Environment variables (✅ working)
├── Dockerfile                 # React app build (✅ fixed npm issue)
├── .dockerignore              # Excludes volumes (✅ updated)
├── Makefile                   # Quick commands (✅ enhanced)
└── supabase/
    ├── README.md              # This documentation (✅ updated)
    ├── repair_shop_schema.sql # Database schema
    └── volumes/
        ├── api/kong.yml       # Kong configuration (✅ working)
        ├── db/                # Database init scripts (✅ working)
        │   ├── roles.sql      # User roles (✅ fixed LOGIN issues)
        │   ├── jwt.sql        # JWT functions (✅ simplified)
        │   ├── webhooks.sql   # Webhook setup
        │   ├── realtime.sql   # Realtime schema
        │   └── init-scripts/
        │       └── 99-set-service-passwords.sh  # Password setup (✅ working)
        ├── functions/         # Edge functions (✅ basic setup)
        │   └── main/index.ts  # Sample function
        └── storage/           # File storage (✅ permissions fixed)
```

## Next Steps

1. **Production Security**: Implement proper JWT secrets and user management
2. **Database Schema**: Apply the repair shop schema (`repair_shop_schema.sql`)
3. **Edge Functions**: Develop custom business logic functions
4. **Real-time Features**: Set up subscriptions for live updates
5. **File Storage**: Configure buckets for repair images and documents