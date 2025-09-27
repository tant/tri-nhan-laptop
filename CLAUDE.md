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

**Phase 3.4.2 Testing Infrastructure Enhancements:**
- **Vietnamese Locale Testing**: Comprehensive utilities for Vietnamese business validation, phone numbers, currency formatting, and date/time handling
- **Enhanced Supabase Mocking**: Type-safe mock infrastructure with Vietnamese business context
- **Component Unit Tests**: Tests for Vietnamese-specific UI components (data tables, forms, status displays)
- **Hook Unit Tests**: Tests for business logic hooks (repair CRUD, customer CRUD, optimistic mutations)
- **Integration Tests**: End-to-end testing of critical Vietnamese business workflows
- **Test Data Generation**: Realistic Vietnamese customer and repair ticket data for testing

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
- **Performance Optimizations**:
  - localStorage caching for user profiles (prevents redundant DB calls)
  - Request deduplication (prevents concurrent duplicate profile fetches)
  - Cache-first authentication (instant role validation)
  - Fallback mechanisms (works during DB timeouts)

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

#### Phase 3.4.1 Type Safety Enhancements
- **Enhanced TypeScript Configuration**: Stricter compiler options with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and improved error detection
- **Comprehensive Type Guards**: Runtime validation for Vietnamese phone numbers, repair ticket codes, currency amounts, and business entities
- **Generic Component Types**: Reusable TypeScript generics for data tables, forms, and Vietnamese business components
- **Supabase Query Types**: Strengthened database operation types with Vietnamese business context and enhanced error handling
- **JSDoc Documentation**: Comprehensive API documentation for all exported functions with examples and version tracking

### Database Schema (Key Tables)

#### Core Business Tables
- **customers**: Phone number as primary key, customer information
- **repair_tickets**: Main business entity with complex status workflow (16 statuses)
  - **CRITICAL**: Contains both `issue_description` (staff technical diagnosis) and `customer_description` (customer's original problem description)
  - Both fields are required - do NOT create tickets without `customer_description`
  - **Comprehensive fields**: labor costs, overhead, taxes, discounts, customer satisfaction, follow-up tracking, recurring issue detection
  - **Relationships**: Links to devices, previous repairs, technicians, cost breakdowns
- **parts**: Inventory management with compatibility metadata
- **user_profiles**: Staff accounts linked to Supabase Auth

#### Extended Database Schema Features
- **Cost Management**: Detailed cost breakdown (labor, parts, overhead, taxes, discounts)
- **Customer Experience**: Satisfaction ratings, feedback, follow-up requirements
- **Service Intelligence**: Recurring issue tracking, complexity levels, repair categories
- **Audit Trail**: Version tracking, status logs, cost change history
- **Device Management**: Device registration and tracking across multiple repairs
- **Financial Tracking**: Quote approvals, payment methods, receipt management

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

### Phase 3.4 Enhanced Architecture (New Files)

#### Type Safety & Validation (Phase 3.4.1)
- `src/lib/type-guards.ts` - Runtime type validation for Vietnamese business entities
- `src/lib/validation/phone-vietnamese.ts` - Vietnamese phone number validation and formatting
- `src/lib/validation/currency-vietnamese.ts` - VND currency validation and formatting
- `src/lib/supabase-types.ts` - Enhanced Supabase operation types with error handling
- `src/lib/database-types.ts` - Consolidated database entity types
- `src/lib/formatting.ts` - Vietnamese locale formatting utilities with JSDoc documentation

#### Testing Infrastructure (Phase 3.4.2)
- `tests/utils/supabase-mock.ts` - Type-safe Supabase mocking with Vietnamese business context
- `tests/utils/vietnamese-locale-testing.ts` - Comprehensive Vietnamese locale testing utilities
- `tests/hooks/` - Hook unit tests for business logic (repair CRUD, customer CRUD, optimistic mutations)
- `tests/components/` - Component unit tests for Vietnamese-specific UI components
- `tests/integration/` - Integration tests for critical Vietnamese business workflows
- `tests/examples/` - Example tests demonstrating Vietnamese locale testing best practices

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

### CRITICAL Database Schema Requirements
**repair_tickets Table Must Have Required Fields:**
- `issue_description` (TEXT NOT NULL) - Staff technical diagnosis and analysis
- `customer_description` (TEXT NOT NULL) - Customer's original problem description in their own words
- `priority` (repair_priority NOT NULL DEFAULT 'normal') - Priority level: low, normal, high, urgent

**When creating tickets, ALL required fields must be provided:**
```sql
INSERT INTO repair_tickets (..., issue_description, customer_description, priority, ...)
VALUES (..., 'Technical diagnosis', 'Customer description', 'normal', ...);
```

**Frontend code expects all required fields - missing `customer_description` or `priority` will cause insert failures!**

### Schema Validation Checklist
Before making database changes, verify:
1. ✅ TypeScript types in `src/lib/supabase.ts` match actual database schema
2. ✅ All NOT NULL columns are included in Insert types as required fields
3. ✅ Seed data includes all required columns with valid sample data
4. ✅ Frontend forms collect data for all required fields
5. ✅ API endpoints handle both `issue_description` and `customer_description`

**To check current schema:** `docker exec supabase_db_try-vite psql -U postgres -d postgres -c "\d repair_tickets"`

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
- **FIXED 2025-09-25**: Added missing `customer_description` column to `repair_tickets` table - was causing "Could not find the 'customer_description' column" errors on ticket creation

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

## Code Quality & Linting Standards

### Biome Configuration Notes
The following rules are configured to work with this codebase:

- **suspicious/noArrayIndexKey**: Disabled - Array indices as React keys are allowed for skeleton loaders
- **suspicious/noExplicitAny**: Disabled - Explicit `any` types are permitted where needed
- **a11y rules**: Disabled - Accessibility warnings turned off for faster development
- **correctness/useExhaustiveDependencies**: Warning only - Hook dependency suggestions
- **correctness/noUnusedVariables**: Warning only - Won't block development

### When Writing Code
- Use `Array.from({ length: n }, (_, i) => key-${i})` pattern for skeleton components
- Prefix unused variables with underscore: `const _unusedVar = value;`
- Hook dependencies as warnings - address if causing issues
- Auto-fix with: `pnpm biome check --write`

## Phase 3.4 Development Guidelines

### Type Safety Best Practices (Phase 3.4.1)
- **Always use type guards**: Import and use type guards from `src/lib/type-guards.ts` for runtime validation
- **Vietnamese data validation**: Use Vietnamese-specific validators for phone numbers, currency, and business entities
- **Generic components**: Leverage generic types for reusable components with proper constraints
- **JSDoc documentation**: Add comprehensive JSDoc comments for all exported functions with examples
- **Error handling**: Use typed error handling with `SupabaseResult<T>` and `VietnameseBusinessError`

```typescript
// Example: Proper type guard usage
import { isValidVietnamesePhone, isCustomer } from '@/lib/type-guards';

function processCustomerPhone(phone: unknown) {
  if (!isValidVietnamesePhone(phone)) {
    throw new Error('Invalid Vietnamese phone number');
  }
  // phone is now typed as string and validated
}
```

### Testing Best Practices (Phase 3.4.2)
- **Vietnamese locale testing**: Use utilities from `tests/utils/vietnamese-locale-testing.ts`
- **Mock Vietnamese business data**: Use `VietnameseMockDataGenerator` for realistic test data
- **Component testing**: Test Vietnamese-specific formatting and validation in components
- **Hook testing**: Use enhanced Supabase mocking for hook unit tests
- **Integration testing**: Test complete Vietnamese business workflows end-to-end

```typescript
// Example: Vietnamese locale testing
import VietnameseLocaleUtils from 'tests/utils/vietnamese-locale-testing';

it('should format Vietnamese currency correctly', () => {
  const amount = 1500000;
  const formatted = VietnameseLocaleUtils.currency.testVNDFormatting(amount);
  VietnameseLocaleUtils.assertions.assertVietnameseCurrencyFormat(formatted, amount);
});
```

### Component Development Patterns (Phase 3.4.3)
- **Vietnamese business context**: Always consider Vietnamese locale requirements
- **Type-safe props**: Use generic types for reusable components
- **Error boundaries**: Implement Vietnamese error messages for user-facing errors
- **Loading states**: Use skeleton loaders for better UX during data loading
- **Optimistic updates**: Use `useOptimisticMutation` for responsive UI interactions

### Database Integration Guidelines
- **Required fields validation**: Always validate Vietnamese business requirements
- **Phone number handling**: Use `toStorageFormat()` for database storage and `formatForDisplay()` for UI
- **Currency validation**: Validate VND amounts are positive and follow Vietnamese business rules
- **Error handling**: Map Supabase errors to Vietnamese user-friendly messages
- **Real-time updates**: Implement Supabase real-time subscriptions for live data updates