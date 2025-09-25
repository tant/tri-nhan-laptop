# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vietnamese Laptop Repair Shop Management System - A React/TypeScript frontend application that connects to a local Supabase development environment. This is a complete business management system for a small laptop repair shop.

## Development Commands

### Primary Development Workflow
```bash
# Start Supabase backend (required first)
pnpm run db:start

# Start frontend development server
pnpm run dev

# Stop Supabase when done
pnpm run db:stop
```

### Database Management
```bash
pnpm run db:reset    # Reset database and apply migrations/seed data
pnpm run db:status   # Check Supabase services status
pnpm run create-admin # Create admin user from environment variables
```

**Important Notes:**
- If `db:reset` fails due to migration errors, seed data can be inserted manually
- Row Level Security (RLS) policies are required for public API access
- Test data includes repair tickets: LRP-2025-000001 (0901234567) and LRP-2025-000002 (0912345678)

### Code Quality
```bash
pnpm run lint        # Run Biome linting
pnpm run format      # Format code with Biome
pnpm run check       # Run Biome check (lint + format)
pnpm run build       # Build production bundle with TypeScript check
```

**Note**: Biome is configured to ignore test files (`tests/**/*`, `**/*.test.*`, `**/*.spec.*`) to focus code quality checks on production code only. Test files are handled separately by the testing framework.

### Testing
```bash
# Unit Tests (Vitest)
pnpm run test:unit         # Run unit tests
pnpm run test:unit:watch   # Run unit tests in watch mode
pnpm run test:ui           # Run tests with UI

# All Tests
pnpm run test:all          # Run unit tests
pnpm run test              # Default: run unit tests only
```

## Architecture Overview

### Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + TanStack Router
- **UI**: shadcn/ui components with Tailwind CSS 4.0
- **Backend**: Local Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod validation
- **Data Tables**: TanStack Table
- **Testing**: Vitest + React Testing Library
- **Code Quality**: Biome (ESLint + Prettier replacement)

### Key Architectural Patterns

#### Database Integration
- **Supabase Client**: `src/lib/supabase.ts` - Centralized client with Vietnamese repair shop schema types
- **Type Safety**: Complete TypeScript types for all database tables (customers, repair_tickets, parts, user_profiles)
- **Row Level Security**: Public policies enabled for repair ticket lookup API access
- **Real-time**: Live updates for repair ticket status changes
- **Foreign Key Relationships**: Use explicit foreign key names when multiple relationships exist between tables

#### Authentication & Authorization
- **Context**: `src/contexts/auth-context.tsx` - Supabase Auth with role-based access
- **Protected Routes**: `src/components/protected-route.tsx` - Role validation wrapper
- **User Roles**: `shop_owner` (admin) and `staff` - no permission granularity
- **Admin Creation**: Environment-driven admin user creation scripts

#### Routing Structure
- **File-based Routing**: TanStack Router with code splitting
- **Public Routes**: `/` (home), `/login`, `/setup` (first-time setup)
- **Authenticated Routes**: `/dashboard`, `/phieu`, `/khach-hang`, `/linh-kien`, `/admin`, `/analytics`
- **Route Guards**: All authenticated routes require login + role validation

#### Data Layer Patterns
- **Custom Hooks**: Business logic encapsulated in hooks (e.g., `use-repair-workflow.ts`)
- **Optimistic Updates**: `use-optimistic-mutation.ts` for responsive UI
- **Error Handling**: Centralized Supabase error mapping to Vietnamese messages
- **Loading States**: Skeleton loaders for all data-heavy components

### Database Schema (Key Tables)

#### Core Business Tables
- **customers**: Phone number as primary key, customer information
- **repair_tickets**: Main business entity with complex status workflow (16 statuses)
- **parts**: Inventory management with compatibility metadata
- **user_profiles**: Staff accounts linked to Supabase Auth

#### Business Logic
- **Ticket Codes**: Auto-generated format `LRP-YYYY-XXXXXX` via PostgreSQL functions
- **Status Workflow**: 16-state repair process with conditional transitions
- **Real-time Updates**: Supabase channels for live status updates
- **File Storage**: Private storage for repair photos/documents

## Environment Configuration

### Required Environment Variables
```env
# Supabase Connection (from pnpx supabase start)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from_supabase_start>
VITE_SERVICE_ROLE_KEY=<from_supabase_start>

# Admin User Creation
SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
SHOP_ADMIN_PASSWORD=AdminPass123!
SHOP_ADMIN_NAME="Shop Manager"
SHOP_ADMIN_ROLE=shop_owner

# Application Settings
VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
VITE_DEFAULT_CURRENCY=VND
VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
VITE_DEFAULT_LOCALE=vi-VN
```

### Development Setup Dependencies
- **Supabase Local**: Requires Docker (7GB+ RAM) for PostgreSQL, Auth, Storage, etc.
- **Database Initialization**: Migration + seed data in `supabase/migrations/` and `supabase/seed.sql`
- **Admin User**: Created via scripts that read environment variables

## Key File Locations

### Core Configuration
- `src/lib/supabase.ts` - Database client and TypeScript types
- `src/contexts/auth-context.tsx` - Authentication state management
- `vite.config.ts` - Vite configuration with TanStack Router plugin

### Business Logic
- `src/hooks/use-repair-workflow.ts` - Repair ticket status management
- `src/hooks/use-analytics.ts` - Business reporting and metrics
- `src/hooks/use-notifications.ts` - Real-time notification system

### Page Components
- `src/routes/` - File-based routing with TanStack Router
- `src/components/pages/` - Main page components
- `src/components/ui/` - shadcn/ui component library

### Database
- `supabase/migrations/` - Database schema migrations
- `supabase/seed.sql` - Sample data for development
- `scripts/create-admin.js` - Admin user creation utility

## Development Workflow

### First-Time Setup
1. Install dependencies: `pnpm install`
2. Initialize Supabase: `pnpx supabase init` (creates supabase/ directory)
3. Start Supabase services: `pnpm run db:start`
4. Create admin user: `pnpm run create-admin`
5. Start development: `pnpm run dev`

### Daily Development
1. Start Supabase: `pnpm run db:start`
2. Verify services: `pnpm run db:status`
3. Start frontend: `pnpm run dev`
4. Access points:
   - App: http://localhost:5173
   - Supabase Studio: http://127.0.0.1:54323
   - API: http://127.0.0.1:54321

### Database Changes
- Schema changes require new migrations in `supabase/migrations/`
- Reset database: `pnpm run db:reset` (applies all migrations + seed data)
- TypeScript types are manually maintained in `src/lib/supabase.ts`

### Troubleshooting Database Issues
If database reset fails or public lookup returns empty results:
1. **Manual seed data insertion**: Insert test data directly via Docker container
2. **RLS Policy Setup**: Ensure public policies exist for `repair_tickets` and `customers` tables
3. **Connection Issues**: Restart Supabase completely with `db:stop` then `db:start`
4. **Available Test Data**:
   - Phone: 0901234567, Ticket: LRP-2025-000001 (Nguyễn Văn An - Dell)
   - Phone: 0912345678, Ticket: LRP-2025-000002 (Trần Thị Bình - HP)

### Common Frontend Issues Fixed
**Database Schema Relationship Issues:**
- Fixed relationship ambiguity between `repair_tickets` and `user_profiles` tables
- Use specific foreign key relationships: `user_profiles!repair_tickets_assigned_technician_id_fkey(*)`
- Added missing `part_number` column to parts table
- Fixed invalid Supabase queries using column-to-column comparisons (use client-side filtering instead)

**Query Pattern Fixes:**
- ❌ Invalid: `.or("current_stock.lte.min_stock_level,current_stock.eq.0")`
- ✅ Correct: Fetch all data, then filter client-side with `part.current_stock <= part.min_stock_level`

## Vietnamese Business Context

### Domain-Specific Features
- **Customer Identification**: Phone numbers as primary keys (Vietnamese business practice)
- **Repair Workflow**: 16-status Vietnamese repair process with timeout guidelines
- **Inventory Management**: Parts compatibility with Vietnamese laptop models
- **Currency/Locale**: VND currency, Vietnamese timezone, vi-VN locale throughout

### User Interface Language
- **Primary Language**: Vietnamese (all UI text, error messages, status labels)
- **Technical Terms**: Mix of Vietnamese business terms and English technical terms
- **Date/Time**: Vietnamese format with Asia/Ho_Chi_Minh timezone

This application is specifically designed for Vietnamese laptop repair shops and includes domain-specific business logic that should be preserved when making changes.
- to memorize every time you change code and script, make sure to check and update documents and testscript to reflex final changes. I just need to current best version, the changes is not quite needed