# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vietnamese laptop repair shop management system built with React 19, TypeScript, TanStack Router, and Supabase. The application runs in Docker containers with a full Supabase backend stack.

## Essential Commands

### Development
```bash
# Start development environment (React dev server + Supabase services)
make dev

# Stop development environment
make dev-down

# Show development logs
make dev-logs

# Quick aliases
make start  # Same as make dev
make stop   # Same as make dev-down
```

### Production
```bash
# Start production environment
make up

# Stop production environment
make down

# Rebuild production environment
make rebuild
```

### Frontend Development
```bash
# Install dependencies
pnpm install

# Run development server (without Docker)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
pnpm check
```

### Database Management
```bash
# Open Supabase Studio (database UI)
make studio  # Opens http://localhost:3010

# Reset database (WARNING: deletes all data)
make db-reset

# Backup database
make db-backup

# Clean all Docker resources
make clean
```

### shadcn/ui Components
```bash
# Add new shadcn components
npx shadcn@latest add [component-name]
```

## Architecture

### Docker Services Architecture
The application runs in a multi-container Docker environment with the following services:

- **app-dev**: React development server (port 3000)
- **supabase-kong-dev**: API Gateway (ports 8000/8443)
- **supabase-auth-dev**: Authentication service
- **supabase-rest-dev**: Auto-generated REST API
- **supabase-db-dev**: PostgreSQL database (port 5433)
- **supabase-studio-dev**: Database management UI (port 3010)
- **supabase-storage-dev**: File storage service
- **realtime-dev**: Real-time subscriptions
- **functions-dev**: Edge functions runtime

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
1. Use shadcn to add base components: `npx shadcn@latest add [component]`
2. Create custom components in `src/components/` if needed
3. Follow the existing patterns for Vietnamese localization

### Database Changes
1. Access Supabase Studio at http://localhost:3010
2. Make schema changes through the UI or SQL editor
3. The REST API is automatically updated via PostgREST

### Environment Configuration
- **Development**: Uses `docker-compose.dev.yml` with `.env.supabase`
- **Production**: Uses `docker-compose.yml` with `.env.supabase`
- Database data is separated between dev and production volumes

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

## Important Notes
- The application currently uses mock data for demonstration
- All pages are designed with real business workflows in mind
- Authentication is currently stub implementation - needs Supabase Auth integration
- File permissions may require `make fix-permissions` if developing on Linux/WSL