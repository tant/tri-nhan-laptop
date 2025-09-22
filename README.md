# 🔧 Vietnamese Laptop Repair Shop Management System

A modern, full-stack management system for Vietnamese laptop repair shops built with **React 19**, **TypeScript**, **TanStack Router**, and **Supabase**. Features a complete Docker containerized backend with real-time capabilities and Vietnamese localization.

This system follows a **phased environment setup** approach with three distinct phases:
1. **Environment Bring-up** (`make env`) - Start all Docker services and infrastructure
2. **Basic Initialization** (`make init`) - Create essential accounts and basic system configuration
3. **Sample Data** (`make data`) - Populate system with sample/demo data for development and testing

## 🌟 Features

### 🏪 Business Management
- **Customer Portal** - Customers can lookup repair tickets by phone number
- **Repair Ticket Management** - Complete CRUD operations for repair tracking
- **Parts Inventory** - Stock management with low-stock alerts
- **Customer Database** - Comprehensive customer information management
- **Staff Dashboard** - Overview with statistics and daily summaries
- **Admin Panel** - System administration and user management

### 🛠️ Technical Features
- **Real-time Updates** - Live data synchronization across all clients
- **Role-based Access Control** - Shop owner, manager, technician, and staff roles
- **File Storage** - Upload repair images and documents
- **Vietnamese Localization** - All UI text and business terminology in Vietnamese
- **Mobile-First Design** - Responsive design optimized for tablets and mobile devices
- **Dark/Light Mode** - Theme switching support

### 🏗️ Architecture
- **Frontend**: React 19 with TanStack Router for file-based routing
- **Backend**: Complete Supabase stack (PostgreSQL, Auth, Storage, Real-time)
- **UI Framework**: shadcn/ui components with Tailwind CSS v4
- **Development**: Docker containers with hot-reload and development tools
- **Type Safety**: Full TypeScript coverage with strict mode

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** - For running the complete stack
- **Node.js 20+** & **pnpm** - For frontend development
- **Git** - For version control

### 1. Clone and Setup
```bash
git clone <repository-url>
cd laptop-repair-shop

# Create required directories
make setup

# Start environment with phased approach
make env    # Phase 1: Environment Bring-up
make init   # Phase 2: Basic Initialization
make data   # Phase 3: Sample Data (optional)
```

### 2. Access the Application
The `make dev` command automatically handles all initialization and service fixes:
- **React App (Development)**: http://localhost:3000
- **Supabase Studio (Database UI)**: http://localhost:3010
- **API Gateway**: http://localhost:8000

### ✅ Current Status (Fully Working)
- **JWT Authentication**: ✅ Working and tested
- **API Gateway**: ✅ Kong properly configured with CORS
- **Database**: ✅ PostgreSQL with Vietnamese repair shop schema
- **Customer Portal**: ✅ Ticket lookup functionality working
- **Environment**: ✅ Single `.env` file consolidation complete
- **Security**: ✅ Production template with secure secrets
- **All Services**: ✅ Docker containers healthy and stable

## 📖 Available Commands

### Environment Management (Single Environment)
```bash
# Phase 1: Environment Bring-up - Start all Docker services and infrastructure
make env

# Phase 2: Basic Initialization - Create essential accounts and basic system configuration
make init

# Phase 3: Sample Data - Populate system with sample/demo data for development and testing
make data

# Start environment with all phases (shortcut)
make up

# Stop all services
make down

# Show logs from all services
make logs

# Rebuild and restart environment
make rebuild

# Quick aliases
make start    # Same as make up
make stop     # Same as make down
```

### Frontend Development

**Option 1: Docker Development (Recommended)**
```bash
# Start full development environment with hot reload
make dev

# Your code changes in src/ automatically reflect in the browser
# React app runs at http://localhost:3000
```

**Option 2: Local Development (Alternative)**
```bash
# If you previously ran "make dev", stop it first:
make dev-down

# 1. Start only Supabase backend services (excludes React app container)
make backend-only

# 2. Install dependencies locally and run React app on host
pnpm install
pnpm dev  # Runs on http://localhost:5173 (Vite default port)

# 3. Development commands
pnpm build    # Build for production
pnpm test     # Run tests
pnpm lint     # Lint with Biome
pnpm format   # Format with Biome
pnpm check    # Check both lint and format
```

**Note**: This avoids port conflicts by running React locally (port 5173) while Supabase services run in Docker.

### 🔄 Switching Between Development Modes

**From Docker to Local Development:**
```bash
make dev-down        # Stop Docker development
make backend-only    # Start only backend services
pnpm dev            # Start React locally
```

**From Local to Docker Development:**
```bash
# Stop local React (Ctrl+C in terminal)
make dev-down        # Stop backend services
make dev            # Start full Docker development
```

### Production Deployment
```bash
# Start production environment (all-in-one)
make up

# Stop production environment
make down

# Rebuild production environment
make rebuild
```

### Database Management
```bash
# Open Supabase Studio (database UI)
make studio   # Opens http://localhost:3010

# Complete environment reset (WARNING: deletes ALL data!)
make clean

# Clean database data directories only
make clean-data

# Backup database
make db-backup
```

### Component Development
```bash
# Add new shadcn/ui components
pnpx shadcn@latest add [component-name]

# Examples:
pnpx shadcn@latest add button
pnpx shadcn@latest add dialog
pnpx shadcn@latest add table
```

## 🏗️ Project Architecture

### Frontend Structure
```
src/
├── routes/                 # File-based routing (TanStack Router)
│   ├── __root.tsx         # Root layout with header and navigation
│   ├── index.tsx          # Home page (customer portal)
│   ├── dashboard.tsx      # Management dashboard
│   ├── phieu.tsx          # Repair tickets management
│   ├── linh-kien.tsx      # Parts inventory
│   ├── khach-hang.tsx     # Customer management
│   ├── login.tsx          # Staff authentication
│   ├── setup.tsx          # Initial system setup
│   └── admin.tsx          # System administration
├── components/
│   ├── pages/             # Page components for business logic
│   ├── ui/                # shadcn/ui component library
│   ├── Header.tsx         # Main navigation header
│   └── AppInitializer.tsx # App-wide initialization
├── lib/
│   └── utils.ts           # Utility functions
└── hooks/                 # Custom React hooks
```

### Backend Services (Docker)
The application runs in a single multi-container Docker environment with the following external access points:

- **app**: React application (port 3001)
- **supabase-kong**: API Gateway - aggregates ALL Supabase services (ports 8000/8443)
- **supabase-db**: PostgreSQL database (port 5432)
- **supabase-studio**: Database management UI (port 3010)

All other Supabase services (auth, rest, storage, realtime, functions, imgproxy, meta) are internal-only and accessed via Kong.

### Database Schema
The system includes a comprehensive database schema for laptop repair shops:

#### Core Tables
- **`user_profiles`** - Staff management with role-based permissions
- **`customers`** - Customer information and contact details
- **`repairs`** - Repair tickets with status tracking
- **`repair_status_logs`** - Audit trail for status changes
- **`parts`** - Inventory management with stock levels
- **`repair_parts`** - Parts used in specific repairs

#### User Roles
- **shop_owner**: Complete system access, can manage all users
- **manager**: Staff management and financial reporting access
- **technician**: Repair handling with limited inventory access
- **staff**: Basic repair ticket operations

## 🛠️ Development Workflow

### Adding New Routes
1. Create a new file in `src/routes/` (e.g., `src/routes/new-page.tsx`)
2. TanStack Router automatically generates the route configuration
3. Create corresponding page component in `src/components/pages/`
4. Import and use the page component in the route file

### Adding New UI Components
1. Use shadcn to add base components: `pnpx shadcn@latest add [component]`
2. Create custom components in `src/components/` if needed
3. Follow existing patterns for Vietnamese localization

### Database Changes
1. Access Supabase Studio at http://localhost:3010
2. Make schema changes through the UI or SQL editor
3. The REST API is automatically updated via PostgREST

### Code Quality Standards
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Biome**: Used for linting and formatting (replaces ESLint/Prettier)
- **Vitest**: Test runner with jsdom environment for React components
- **Path Aliases**: `@/*` maps to `src/*` for clean imports

## 🌍 Vietnamese Localization

The application is fully localized for Vietnamese laptop repair shops:

- **UI Language**: All text, labels, and messages in Vietnamese
- **Business Terminology**: Specific vocabulary for laptop repair industry
- **Date/Currency**: Vietnamese formatting conventions
- **Mock Data**: Vietnamese names, addresses, and realistic business data

## 📱 Application Pages

### 1. Home (/) - Customer Portal
- Customers can lookup repair tickets by phone number
- Clean, simple interface for non-technical users
- Shows repair status and estimated completion

### 2. Setup (/setup) - Initial Configuration
- First-time system setup with admin account creation
- Configures basic shop information
- Creates initial user roles and permissions

### 3. Login (/login) - Staff Authentication
- Staff login with role-based access control
- Integration with Supabase Auth
- Automatic redirection based on user role

### 4. Dashboard (/dashboard) - Management Overview
- Daily statistics and performance metrics
- Recent repairs and pending tasks
- Quick access to all major functions

### 5. Repair Tickets (/phieu) - Ticket Management
- Complete CRUD operations for repair tickets
- Status tracking and update history
- Parts assignment and labor tracking

### 6. Parts Inventory (/linh-kien) - Stock Management
- Inventory tracking with real-time stock levels
- Low-stock alerts and reorder points
- Parts usage history and supplier information

### 7. Customer Management (/khach-hang) - Customer Database
- Customer information and contact management
- Repair history and service records
- Customer communication tracking

### 8. Admin (/admin) - System Administration
- User management and role assignment
- System settings and configuration
- Shop information and preferences

## 🔧 Environment Configuration

### Single Environment Model
This system uses a **single environment model** (no separate dev/prod) with a single `.env` file for all configuration.

### External Access Points
- **App**: Port 3001 - React application for end users
- **Supabase API**: Port 8000 HTTP, 8443 HTTPS - Kong gateway (aggregates ALL Supabase services)
- **Studio**: Port 3010 - Database management UI (for admin access)
- **All other services**: Internal-only, accessed via Kong or not exposed

### Kong Architecture (CRITICAL)
Kong is Supabase's INTERNAL API Gateway that aggregates ALL Supabase services through a single endpoint:
- Your React app connects ONLY to Kong endpoint (`localhost:8000`)
- Kong handles internal routing to individual Supabase services
- Your app does NOT need its own reverse proxy/Kong instance
- External reverse proxy responsibility is handled outside the Docker stack

### Single Environment File Configuration

**All configuration is consolidated in a single `.env` file:**

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

# Frontend Environment Variables (All managed in .env)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🐛 Troubleshooting

### Common Issues

#### Manual Service Fixes (Legacy)
**Note**: These manual steps are no longer needed as they're automated in `make dev`

If you encounter service issues, you can manually run the fix script:
```bash
# Manual service fixes (usually not needed)
./fix-supabase-services.sh
```

#### Permission Denied on Database Volumes
**Problem**: Cannot delete database directories without sudo

**Solution**:
```bash
make fix-permissions
# or manually:
docker run --rm -v "$(pwd)/supabase/volumes/db:/data" alpine:latest chown -R 1000:1000 /data/data /data/data-dev
```

#### Port Conflicts
**Problem**: `port is already allocated` error

**Solution**:
```bash
# Stop conflicting services
make dev-down  # Stop development environment
make down      # Stop production environment

# Check what's using ports
docker ps
netstat -tulpn | grep :3000
```

#### Environment Reset Requirements
The system provides a complete reset mechanism for testing environment build-up process:

```bash
# Complete environment reset and rebuild
make clean          # Remove all containers, volumes, networks, data
make env           # Fresh build and start infrastructure
make init          # Create admin account
make data          # Add sample data (optional)

# Verify clean state
docker ps -a       # Should show no project containers
docker volume ls   # Should show no project volumes
ls supabase/volumes/  # Should be empty or non-existent
```

**Safety Considerations:**
- **Data loss warning:** Reset command will permanently delete ALL data
- **Confirmation prompt:** Required before executing
- **Production protection:** Clearly marked as development/testing only

## 📝 Contributing

### Development Setup
1. **Fork and clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Start development environment**: `make dev`
4. **Set up database** (first time): See initialization steps above
5. **Make changes** following the code quality standards
6. **Test thoroughly** with `pnpm test` and `pnpm check`
7. **Submit pull request** with clear description

### Code Standards
- **TypeScript**: Use strict typing, avoid `any`
- **React**: Follow React 19 best practices with hooks
- **Styling**: Use Tailwind CSS utilities, avoid custom CSS
- **Components**: Prefer shadcn/ui components, create custom sparingly
- **Vietnamese**: All user-facing text must be in Vietnamese
- **Comments**: Code should be self-documenting, minimal comments

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Check code quality
pnpm check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TanStack** - For the excellent router and development tools
- **Supabase** - For the complete backend-as-a-service platform
- **shadcn/ui** - For the beautiful and accessible component library
- **Tailwind CSS** - For the utility-first CSS framework
- **Biome** - For fast and reliable linting and formatting

## 📞 Support

For support and questions:
1. **Check the documentation** in `/supabase/README.md` for detailed backend setup
2. **Review the CLAUDE.md** file for development guidelines
3. **Search existing issues** in the repository
4. **Create a new issue** with detailed description and reproduction steps

---

**Built with ❤️ for Vietnamese laptop repair shops**