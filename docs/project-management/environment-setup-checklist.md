# Environment Setup Checklist - From Zero to Running
**Project:** Vietnamese Laptop Repair Shop Management System
**Purpose:** Clean installation guide for complete development environment
**Target:** Fresh system with no existing Docker/Supabase installation

## 🎯 Pre-Setup Requirements

### System Prerequisites
- [ ] Linux/WSL2, macOS, or Windows with Docker Desktop support
- [ ] Minimum 8GB RAM, 20GB free disk space
- [ ] Internet connection for downloading images
- [ ] Node.js 18+ installed (for pnpm)
- [ ] Git installed and configured

### Clean Slate Verification
- [ ] No existing Docker containers running (`docker ps` shows empty)
- [ ] No existing Docker volumes (`docker volume ls` shows empty)
- [ ] No existing Supabase installations
- [ ] Clean project directory

## 📦 Step 1: Docker Installation & Setup

### Docker Installation
```bash
# Check if Docker is installed
docker --version

# If not installed, install Docker Desktop or Docker Engine
# Follow official Docker installation guide for your OS
```

### Docker Verification
- [ ] Docker daemon running
- [ ] Docker Compose available (`docker-compose --version`)
- [ ] User has Docker permissions (no sudo required)
- [ ] Docker can pull images (`docker pull hello-world`)

## 🏗️ Step 2: Project Environment Setup

### Repository Preparation
```bash
# Navigate to project root
cd /home/tan/work/try-vite

# Verify project structure
ls -la
# Should see: docker-compose.dev.yml, package.json, src/, docs/

# Install Node dependencies
pnpm install
```

### Environment Files Check
- [ ] `.env.supabase` exists with correct variables
- [ ] `docker-compose.dev.yml` configured properly
- [ ] `Makefile` contains development commands
- [ ] Project dependencies installed

## 🚀 Step 3: Docker Development Environment

### Initial Docker Setup
```bash
# Clean any existing containers/volumes (since you cleaned up)
docker system prune -a -f
docker volume prune -f

# Start development environment
make dev

# Alternative if make fails:
docker-compose -f docker-compose.dev.yml up -d
```

### Service Health Verification
- [ ] `app-dev` container running (React development server)
- [ ] `supabase-kong-dev` container running (API Gateway)
- [ ] `supabase-auth-dev` container running (Authentication)
- [ ] `supabase-rest-dev` container running (REST API)
- [ ] `supabase-db-dev` container running (PostgreSQL)
- [ ] `supabase-studio-dev` container running (Database UI)
- [ ] `supabase-storage-dev` container running (File storage)
- [ ] `realtime-dev` container running (Real-time features)

### Service Access Verification
```bash
# Check all services are responding
curl http://localhost:3000    # React app
curl http://localhost:8000    # Supabase API Gateway
curl http://localhost:3010    # Supabase Studio
```

## 🗄️ Step 4: Database Setup & Initialization

### Supabase Studio Access
- [ ] Open http://localhost:3010 in browser
- [ ] Supabase Studio loads successfully
- [ ] Can connect to local database
- [ ] Database dashboard accessible

### Database Schema Creation
```sql
-- Core tables creation (run in Supabase Studio SQL editor)

-- Users table (for staff authentication)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('shop_owner', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test data insertion
INSERT INTO customers (full_name, phone_number, email)
VALUES ('Nguyễn Văn Test', '0123456789', 'test@example.com');
```

### Database Verification
- [ ] Tables created successfully
- [ ] Test data inserted and visible
- [ ] Database relationships working
- [ ] Indexes created for performance

## 🔐 Step 5: Authentication Setup

### Supabase Auth Configuration
- [ ] Auth service responding at http://localhost:9999
- [ ] Email/password authentication enabled
- [ ] Test user registration working
- [ ] Test user login working
- [ ] JWT tokens generated correctly

### Authentication Test
```bash
# Test auth endpoint
curl -X POST http://localhost:8000/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'
```

## 🧪 Step 6: Development Workflow Setup

### React Application Verification
- [ ] React app builds successfully (`pnpm build`)
- [ ] Development server starts (`pnpm dev`)
- [ ] Hot reload working
- [ ] TypeScript compilation working
- [ ] Linting passes (`pnpm lint`)

### API Integration Test
```typescript
// Test Supabase client connection
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://localhost:8000',
  'your-anon-key'
)

// Test database query
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .limit(1)

console.log('Database test:', { data, error })
```

## ✅ Step 7: Environment Validation

### Complete System Test
- [ ] All Docker services healthy (`docker ps`)
- [ ] React app accessible at http://localhost:3000
- [ ] Supabase Studio accessible at http://localhost:3010
- [ ] Database queries working through Studio
- [ ] API endpoints responding
- [ ] No error logs in containers

### Performance Check
```bash
# Check container resource usage
docker stats

# Check logs for errors
make dev-logs

# Alternative:
docker-compose -f docker-compose.dev.yml logs
```

## 🔧 Troubleshooting Common Issues

### Docker Issues
**Problem:** Containers won't start
```bash
# Solution: Check ports and restart
docker-compose -f docker-compose.dev.yml down
docker system prune -f
make dev
```

**Problem:** Permission denied errors
```bash
# Solution: Fix Docker permissions
sudo usermod -aG docker $USER
# Logout and login again
```

### Supabase Issues
**Problem:** Database connection failed
```bash
# Solution: Check database container
docker logs supabase-db-dev
# Restart if needed
docker restart supabase-db-dev
```

**Problem:** Studio not accessible
```bash
# Solution: Check studio container and port
docker logs supabase-studio-dev
netstat -tulpn | grep :3010
```

### React Application Issues
**Problem:** App won't start
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules
pnpm install
pnpm dev
```

## 📋 Daily Development Startup

### Quick Start Routine
```bash
# 1. Navigate to project
cd /home/tan/work/try-vite

# 2. Start all services
make dev

# 3. Verify services (wait 30 seconds for startup)
curl http://localhost:3000
curl http://localhost:3010

# 4. Start development
pnpm dev  # If running React outside Docker
```

### End of Day Routine
```bash
# Stop development environment
make dev-down

# Alternative:
docker-compose -f docker-compose.dev.yml down
```

---

## 🎯 Success Criteria

✅ **Environment Ready When:**
- All 8 Docker services running without errors
- React app loads with no console errors
- Supabase Studio accessible and functional
- Database schema created and test data accessible
- Authentication system working
- Development workflow established

**Next Step:** Begin Sprint 1 Day 1 tasks with confidence! 🚀