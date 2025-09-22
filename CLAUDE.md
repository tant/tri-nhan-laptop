# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vietnamese laptop repair shop management system built with React 19, TypeScript, TanStack Router, and Supabase. The application runs in Docker containers with a full Supabase backend stack using a single environment for both development and production.

## Essential Commands

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
make start  # Same as make up
make stop   # Same as make down
```

### Frontend Development
```bash
# Install dependencies
pnpm install

# Run development server (without Docker)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test
pnpm test:ui
pnpm test:watch

# Lint and format
pnpm lint
pnpm format
pnpm check
```

### Database Management
```bash
# Open Supabase Studio (database UI)
make studio  # Opens http://localhost:3010

# Complete environment reset (WARNING: deletes ALL data!)
# IMPORTANT: Preserves Docker images for faster rebuilds
make clean

# Clean database data directories only
make clean-data

# Backup database
make db-backup
```

### shadcn/ui Components
```bash
# Add new shadcn components (use pnpx for consistency with pnpm)
pnpx shadcn@latest add [component-name]
```

## Architecture

### Docker Services Architecture
The application runs in a single multi-container Docker environment with the following external access points:

- **app**: React application (port 3001)
- **supabase-kong**: API Gateway - aggregates ALL Supabase services (ports 8000/8443)
- **supabase-db**: PostgreSQL database (port 5432)
- **supabase-studio**: Database management UI (port 3010)

All other Supabase services (auth, rest, storage, realtime, functions, imgproxy, meta) are internal-only and accessed via Kong.

### Frontend Architecture

**File-based Routing**: Uses TanStack Router with file-based routing in `src/routes/`
- Routes are automatically generated from files in the routes directory
- Each route file exports a `Route` object created with `createFileRoute()`
- Layout is defined in `src/routes/__root.tsx`

**Page Components**: Business logic pages are located in `src/components/pages/`
- Each page is a self-contained React component
- Pages use Vietnamese language content for the laptop repair shop domain
- Components use shadcn/ui for consistent styling

**UI Components**: shadcn/ui components are in `src/components/ui/`
- Pre-configured with Tailwind CSS
- Components follow Radix UI patterns
- Includes form handling with react-hook-form and zod validation

### Application Pages Structure
The application has 8 main pages for the laptop repair shop workflow:

1. **Home (/)**: Customer portal for ticket lookup
2. **Setup (/setup)**: Initial system setup with admin authentication
3. **Login (/login)**: Staff authentication
4. **Dashboard (/dashboard)**: Management overview with statistics
5. **Repair Tickets (/phieu)**: Ticket management with CRUD operations
6. **Parts (/linh-kien)**: Inventory management with stock alerts
7. **Customers (/khach-hang)**: Customer database management
8. **Admin (/admin)**: System administration with user/settings management

### State Management
- React 19 built-in state management with useState/useEffect
- TanStack Router handles navigation state
- Supabase client for backend state synchronization
- No external state management library (Redux/Zustand) currently used

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **CSS Variables**: For theme customization
- **Responsive Design**: Mobile-first approach

### Data Layer
- **Supabase**: PostgreSQL database with auto-generated REST API
- **Real-time**: Supabase real-time subscriptions for live updates
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage for file uploads

## Development Workflow

### Adding New Routes
1. Create a new file in `src/routes/` (e.g., `src/routes/new-page.tsx`)
2. TanStack Router automatically generates the route configuration
3. Create corresponding page component in `src/components/pages/`
4. Import and use the page component in the route file

### Adding New UI Components
1. Use shadcn to add base components: `pnpx shadcn@latest add [component]`
2. Create custom components in `src/components/` if needed
3. Follow the existing patterns for Vietnamese localization

### Database Changes
1. Access Supabase Studio at http://localhost:3010
2. Make schema changes through the UI or SQL editor
3. The REST API is automatically updated via PostgREST

### Environment Configuration
- **Single Environment File**: All configuration consolidated in `.env`
- **Single Environment Model**: No separate dev/prod environments
- **Security Template**: `.env` contains all necessary configuration
- All environment variables properly passed to Docker containers

### First-Time Setup (Fully Automated)
The system is completely automated and ready to use:
1. Run `make env` to start all services
2. Database schema automatically created with Vietnamese repair shop data
3. JWT authentication working with proper Kong gateway configuration
4. Service fixes automatically applied via `fix-supabase-services.sh`
5. Edge functions properly configured with main entrypoint
6. No manual intervention required - system works out of the box

## Code Quality
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Biome**: Used for linting and formatting (replaces ESLint/Prettier)
- **Vitest**: Test runner with jsdom environment
- **Path Aliases**: `@/*` maps to `src/*` for clean imports

## Vietnamese Localization
The application uses Vietnamese language throughout:
- All UI text, labels, and messages are in Vietnamese
- Date/currency formatting follows Vietnamese conventions
- Business terminology specific to laptop repair shops
- Mock data includes Vietnamese names and addresses

## Current Status & Important Notes
- **✅ Fully Working System**: All services healthy and functional
- **✅ JWT Authentication**: Working properly with Supabase Auth integration
- **✅ API Gateway**: Kong properly configured with CORS support
- **✅ Database**: Vietnamese repair shop schema with test data
- **✅ Customer Portal**: Ticket lookup functionality working
- **✅ Environment**: Single `.env` file configuration complete
- **✅ Security**: Production template with secure secret management
- **✅ Clean Architecture**: No hardcoded values, proper Docker consolidation

### Technical Achievements
- JWT signature validation resolved
- Edge functions main entrypoint configured
- Environment variables consolidated to single `.env` file
- Production security with secure defaults
- All Docker services using unified environment configuration
- Real Vietnamese test data populated in database
- Comprehensive security practices
- Hardcoded credentials externalized to environment variables
- Clean up scripts preserve Docker images while removing containers/volumes

### Security & Production Ready
- **Secret Management**: Secure environment variable handling
- **Single Environment**: Simplified configuration management
- **No Hardcoded Values**: All credentials properly externalized
- **Clean Architecture**: Single environment file controls entire stack

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

# docker-image-preservation
IMPORTANT: Never remove Docker images when cleaning up the development environment.
- All cleanup commands (make clean, make clean-data) preserve Docker images
- This ensures faster rebuilds and reduces download time
- Images are intentionally preserved for development efficiency
- Only remove containers, volumes, networks, and data directories

# documentation-language-guidelines
When creating documentation for this Vietnamese laptop repair shop project:
- Write documentation in Vietnamese as the primary language
- Keep common technical terms in English (React, Docker, API, database, etc.)
- Keep specific tool/library names in English (Supabase, TanStack Router, shadcn/ui, etc.)
- When uncertain about translation, use both languages: "phiếu sửa chữa (repair ticket)"
- Business terminology should be in Vietnamese (khách hàng, linh kiện, phiếu sửa chữa)
- Code examples, commands, and file paths remain in English
- Technical concepts can be bilingual for clarity