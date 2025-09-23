# Vietnamese Laptop Repair Shop Management System

## Project Overview

This is a full-stack web application for managing a Vietnamese laptop repair shop. The system provides both customer-facing and staff-facing interfaces with comprehensive business management features.

### Key Technologies
- **Frontend**: React 19, TypeScript, TanStack Router, Vite
- **UI Framework**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Infrastructure**: Docker containerized services
- **Development Tools**: Biome (linting/formatting), Vitest (testing)

### Core Features
- Customer portal for repair ticket lookup
- Repair ticket management with status tracking
- Parts inventory management with stock alerts
- Customer database management
- Staff dashboard with statistics
- Admin panel for system configuration
- Role-based access control (shop owner, manager, technician, staff)
- Real-time updates across all clients
- Vietnamese localization throughout the application

## Project Structure

```
├── src/
│   ├── routes/                 # File-based routing (TanStack Router)
│   ├── components/
│   │   ├── pages/              # Page components for business logic
│   │   ├── ui/                 # shadcn/ui component library
│   │   └── customer-portal/    # Customer-facing components
│   ├── lib/                    # Utility functions and Supabase client
│   ├── hooks/                  # Custom React hooks
│   └── contexts/               # React context providers
├── supabase/                   # Database schema and Supabase configuration
├── public/                     # Static assets
├── docs/                       # Documentation
├── Dockerfile                  # Multi-stage Docker configuration
├── docker-compose.yml          # Single environment configuration
├── Makefile                    # Development workflow commands
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite build configuration
└── .env                        # Environment variables (single file)
```

## Development Workflow

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ & pnpm
- Git

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd laptop-repair-shop
make setup

# Start environment with phased approach (single environment for both dev and prod)
make env    # Phase 1: Environment Bring-up
make init   # Phase 2: Basic Initialization
make data   # Phase 3: Sample Data (optional)

# Access the application:
# - React App: http://localhost:3001
# - Supabase Studio: http://localhost:3010
# - API Gateway: http://localhost:8000
```

## Building and Running

### Development Commands
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build
```

### Testing
```bash
pnpm test       # Run unit tests
pnpm test:ui    # Run tests with UI
pnpm test:watch # Run tests in watch mode
```

### Code Quality
```bash
pnpm lint       # Lint code with Biome
pnpm format     # Format code with Biome
pnpm check      # Check both lint and format
```

## Environment Configuration

All configuration is consolidated in a single `.env` file:

```bash
# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
POSTGRES_DB=postgres

# JWT & Authentication
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration (Kong endpoint - aggregates all Supabase services)
SUPABASE_PUBLIC_URL=http://localhost:8000
KONG_HTTP_PORT=8000

# Shop Admin Account
SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
SHOP_ADMIN_PASSWORD=AdminPass123!
```

## Docker Services

The application runs in a single multi-container Docker environment with the following external access points:

- **app**: React application (port 3001)
- **supabase-kong**: API Gateway - aggregates ALL Supabase services (ports 8000/8443)
- **supabase-db**: PostgreSQL database (port 5432)
- **supabase-studio**: Database management UI (port 3010)

All other Supabase services (auth, rest, storage, realtime, functions, imgproxy, meta) are internal-only and accessed via Kong.

## Application Pages

### Customer Portal (/)
- Repair ticket lookup by phone number
- Service history display
- Customer feedback submission

### Staff Dashboard (/dashboard)
- Daily statistics and performance metrics
- Recent repairs and pending tasks
- Quick access to all major functions

### Repair Management (/phieu)
- Complete CRUD operations for repair tickets
- Status tracking and update history
- Parts assignment and labor tracking

### Parts Inventory (/linh-kien)
- Inventory tracking with real-time stock levels
- Low-stock alerts and reorder points
- Parts usage history

### Customer Management (/khach-hang)
- Customer information and contact management
- Repair history and service records

### Admin Panel (/admin)
- User management and role assignment
- System settings and configuration

### Authentication (/login, /setup)
- Staff login with role-based access control
- Initial system setup with admin account creation

## Database Schema

### Core Tables
- `user_profiles` - Staff management with role-based permissions
- `customers` - Customer information and contact details (phone as primary key)
- `repairs` - Repair tickets with status tracking (LRP-YYYY-###### format)
- `repair_status_logs` - Audit trail for status changes
- `parts` - Inventory management with virtual stock (10000 default)
- `repair_parts` - Parts used in specific repairs

### User Roles
- **shop_owner**: Complete system access
- **manager**: Staff management and financial reporting
- **technician**: Repair handling with limited inventory access
- **staff**: Basic repair ticket operations

## Development Conventions

### Code Quality Standards
- TypeScript strict mode enabled
- Biome for linting and formatting (replaces ESLint/Prettier)
- Vitest with jsdom for React component testing
- Path aliases: `@/*` maps to `src/*`

### Adding New Features

#### Adding New Routes
1. Create a new file in `src/routes/`
2. TanStack Router automatically generates the route configuration
3. Create corresponding page component in `src/components/pages/`
4. Import and use the page component in the route file

#### Adding New UI Components
1. Use shadcn to add base components: `pnpx shadcn@latest add [component]`
2. Create custom components in `src/components/` if needed
3. Follow existing patterns for Vietnamese localization

#### Database Changes
1. Access Supabase Studio at http://localhost:3010
2. Make schema changes through the UI or SQL editor
3. The REST API is automatically updated via PostgREST

## Troubleshooting

### Common Issues

#### Environment Reset
```bash
# Complete environment reset (WARNING: deletes ALL data!)
make clean

# Clean database data only
make clean-data

# Verify clean state
docker ps -a       # Should show no project containers
docker volume ls   # Should show no project volumes
ls supabase/volumes/  # Should be empty or non-existent
```

#### Port Conflicts
```bash
# Stop conflicting services
make down

# Check what's using ports
docker ps
netstat -tulpn | grep :3001
```

#### Clean Reinitialization
```bash
# Full cleanup and fresh start
make clean
make setup
make env
make init
make data  # Optional: add sample data
```

## Qwen Added Memories
- Never remove Docker images when working with this project
