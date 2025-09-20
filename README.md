# 🔧 Vietnamese Laptop Repair Shop Management System

A modern, full-stack management system for Vietnamese laptop repair shops built with **React 19**, **TypeScript**, **TanStack Router**, and **Supabase**. Features a complete Docker containerized backend with real-time capabilities and Vietnamese localization.

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
cd try-vite

# Create required directories
make setup

# Start development environment (includes database initialization)
make dev
```

### 2. Access the Application
The `make dev` command now automatically handles all initialization and service fixes:
- **React App (Development)**: http://localhost:3000
- **Supabase Studio (Database UI)**: http://localhost:3010
- **API Gateway**: http://localhost:8000

## 📖 Available Commands

### Development Workflow
```bash
# Start development environment (React dev server + Supabase services)
make dev

# Stop development environment
make dev-down

# Show development logs
make dev-logs

# Quick aliases
make start    # Same as make dev
make stop     # Same as make dev-down
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
# Start production environment
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

# Reset database (WARNING: deletes all data)
make db-reset

# Backup database
make db-backup

# Clean all Docker resources
make clean
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
The application runs in a multi-container Docker environment:

- **app-dev**: React development server (port 3000)
- **supabase-kong-dev**: API Gateway (ports 8000/8443)
- **supabase-auth-dev**: User authentication service
- **supabase-rest-dev**: Auto-generated REST API from database schema
- **supabase-db-dev**: PostgreSQL database (port 5433)
- **supabase-studio-dev**: Database management UI (port 3010)
- **supabase-storage-dev**: File storage service
- **realtime-dev**: Real-time subscriptions
- **functions-dev**: Edge functions runtime

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

### Development vs Production

**Development Environment** (`make dev`):
- Uses `docker-compose.dev.yml` with `.env.supabase`
- React dev server with hot reload
- Database on port 5433 (to avoid conflicts)
- Separate data volumes for development

**Production Environment** (`make up`):
- Uses `docker-compose.yml` with `.env.supabase`
- Built React app served by nginx on port 3001
- Database on standard port 5432
- Optimized containers for production

### Key Environment Variables
```bash
# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
POSTGRES_DB=postgres

# JWT & Authentication
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
SUPABASE_PUBLIC_URL=http://localhost:8000
KONG_HTTP_PORT=8000

# Shop Admin Account
SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
SHOP_ADMIN_PASSWORD=AdminPass123!
SHOP_ADMIN_NAME=Shop Manager
SHOP_ADMIN_ROLE=shop_owner
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

#### Clean Reinitialization
For a completely fresh start:
```bash
# Full cleanup
make clean

# Clean database data
make clean-data

# Start fresh
make dev
```

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