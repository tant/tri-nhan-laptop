# Source Tree Structure

## Overview
This document outlines the complete source code organization for the Vietnamese Laptop Repair Management System. The structure follows React best practices with clear separation of concerns and logical grouping.

## Project Root Structure

```
try-vite/
├── .bmad-core/              # BMAD agent configurations
├── .github/                 # GitHub workflows and templates
├── .tanstack/              # TanStack Router cache
├── docs/                   # Project documentation
│   ├── architecture/       # Architecture documentation
│   ├── stories/            # User stories for development
│   ├── prd.md             # Product Requirements Document
│   ├── env.md             # Environment setup guide
│   └── project-brief.md   # Project overview
├── node_modules/           # Package dependencies
├── public/                 # Static assets
├── scripts/                # Build and setup scripts
├── src/                   # Source code (detailed below)
├── supabase/              # Supabase configuration and migrations
├── test-results/          # Test output and reports
├── tests/                 # Test files
├── package.json           # Project configuration and dependencies
├── tsconfig.json          # TypeScript configuration
├── biome.json             # Code formatting and linting
├── vite.config.ts         # Vite build configuration
└── playwright.config.ts   # E2E testing configuration
```

## Source Code Structure (`src/`)

### Component Organization

```
src/
├── api/                        # API layer components
│   └── public/                 # Public API endpoints
├── components/
│   ├── customers/              # Customer management components
│   │   ├── CustomerPrivacyManager.tsx
│   │   ├── ContactManagement.tsx
│   │   ├── CustomerProfileForm.tsx
│   │   └── PhoneInput.tsx
│   ├── notifications/          # Notification system components
│   │   └── NotificationBell.tsx
│   ├── pages/                  # Main page components
│   │   ├── AdminPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PartsPage.tsx
│   │   ├── RepairTicketsPage.tsx
│   │   └── SetupPage.tsx
│   ├── parts/                  # Parts management components
│   │   └── PartsInventoryManager.tsx
│   ├── tickets/                # Repair ticket components
│   │   ├── CreateTicketForm.tsx
│   │   ├── EditTicketForm.tsx
│   │   └── TicketDetailView.tsx
│   ├── ui/                     # Reusable UI components (shadcn/ui)
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── textarea.tsx
│   │   └── toaster.tsx
│   ├── app-sidebar.tsx         # Main navigation sidebar
│   ├── protected-route.tsx     # Authentication guards
│   └── theme-provider.tsx      # Theme management component
```

### Business Logic & Utilities

```
src/
├── contexts/
│   └── auth-context.tsx        # Authentication context provider
├── hooks/                      # Custom React hooks
│   ├── use-customer-history.ts # Customer history management
│   ├── use-customers.ts        # Customer data management
│   ├── use-mobile.ts           # Mobile responsiveness
│   ├── use-notifications.ts    # Notification management
│   ├── use-parts.ts            # Parts inventory hooks
│   ├── use-repair-tickets.ts   # Repair ticket management
│   ├── use-sync-manager.ts     # Data synchronization
│   ├── use-ticket-activity.ts  # Ticket activity tracking
│   └── use-toast.ts            # Toast notifications
├── lib/                        # Core utilities and configurations
│   ├── analytics/              # Business analytics utilities
│   ├── audit/                  # Audit trail functionality
│   ├── devices/                # Device management utilities
│   │   └── vietnamese-brands.ts # Vietnamese laptop brands
│   ├── financial/              # Financial calculations
│   ├── privacy/                # Privacy and data protection
│   ├── problem-analysis/       # Issue analysis utilities
│   ├── security/               # Security utilities
│   ├── translation/            # Localization utilities
│   ├── validation/             # Data validation
│   ├── warranty/               # Warranty management
│   ├── workflow/               # Repair workflow logic
│   ├── supabase.ts            # Supabase client and type definitions
│   ├── utils.ts               # General utility functions
│   └── types.ts               # Global TypeScript types
```

### Routing Structure

```
src/routes/
├── __root.tsx                  # Root layout component
├── index.tsx                   # Home page (public repair lookup)
├── login.tsx                   # Authentication page
├── dashboard.tsx               # Main dashboard (protected)
├── admin.tsx                   # Administration panel (shop owner only)
├── analytics.tsx               # Business analytics (protected)
├── khach-hang/                 # Customer management (Vietnamese routes)
│   ├── index.tsx              # Main customers list
│   ├── new.tsx                # Create new customer
│   ├── $id.tsx                # View specific customer details
│   └── $id.edit.tsx           # Edit existing customer
├── phieu-sua-chua/             # Repair tickets routing (Vietnamese routes)
│   ├── index.tsx              # Main repair tickets list
│   ├── new.tsx                # Create new repair ticket
│   ├── $id.tsx                # View specific ticket details
│   └── $id.edit.tsx           # Edit existing ticket
├── ton-kho/                    # Inventory management (Vietnamese routes)
│   ├── index.tsx              # Main inventory dashboard
│   ├── new.tsx                # Add new inventory item
│   ├── $id.tsx                # View specific item details
│   └── $id.edit.tsx           # Edit existing inventory item
├── cua-hang/                   # Shop management (Vietnamese routes)
│   ├── index.tsx              # Main shop settings
│   ├── settings.tsx           # Shop configuration
│   ├── staff.tsx              # Staff management
│   └── reports.tsx            # Shop reports and analytics
├── setup.tsx                  # Initial setup page
└── routeTree.gen.ts           # Auto-generated route tree
```

## Key Directory Purposes

### `/components/pages/`
**Purpose**: Main page-level components that represent complete application screens
**Patterns**:
- Each page component handles its own data fetching
- Integration with protected routes for authentication
- Vietnamese UI text and business logic

### `/components/ui/`
**Purpose**: Reusable UI components following shadcn/ui patterns
**Patterns**:
- Composable component variants using `class-variance-authority`
- Accessibility-first design with Radix UI primitives
- Consistent styling with Tailwind CSS

### `/hooks/`
**Purpose**: Custom React hooks encapsulating business logic
**Patterns**:
- Data fetching and state management
- Supabase integration patterns
- Error handling and loading states
- Vietnamese business rule implementations

### `/lib/`
**Purpose**: Core utilities, configurations, and shared business logic
**Key Files**:
- `supabase.ts`: Database client, types, and error handling
- `repair-workflow.ts`: 16-state repair process logic
- `utils.ts`: General-purpose utility functions

### `/contexts/`
**Purpose**: React Context providers for global state management
**Current Contexts**:
- `auth-context.tsx`: Authentication state and user management

## File Naming Conventions

### Components
- **Page Components**: `PascalCase.tsx` (e.g., `DashboardPage.tsx`)
- **UI Components**: `kebab-case.tsx` (e.g., `data-table.tsx`)
- **Feature Components**: `PascalCase.tsx` (e.g., `RepairTicketForm.tsx`)

### Hooks
- **Custom Hooks**: `kebab-case.ts` with `use-` prefix (e.g., `use-parts-management.ts`)

### Utilities
- **Library Files**: `kebab-case.ts` (e.g., `repair-workflow.ts`)
- **Type Files**: `types.ts`

### Routes
- **English Routes**: `kebab-case.tsx` (e.g., `dashboard.tsx`)
- **Vietnamese Routes**: `kebab-case.tsx` with Vietnamese terms (e.g., `khach-hang.tsx`)

## Import Path Patterns

### Absolute Imports
Uses TypeScript path mapping with `@/` alias for clean imports:

```typescript
// ✅ Good - Using path alias
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

// ❌ Bad - Relative imports from deep paths
import { Button } from "../../../components/ui/button";
```

### Import Organization
1. React imports
2. Third-party library imports
3. Internal component imports
4. Internal utility imports
5. Type-only imports

## Component Patterns

### Page Component Structure
```typescript
// Standard page component pattern
export function CustomersPage() {
  // 1. State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Custom hooks
  const { user } = useAuth();

  // 3. Effects and data fetching
  useEffect(() => {
    loadCustomers();
  }, []);

  // 4. Event handlers
  const handleCustomerCreate = (customer: Customer) => {
    // Implementation
  };

  // 5. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Hook Structure
```typescript
// Standard hook pattern
export function usePartsManagement() {
  // 1. State
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2. Business logic functions
  const loadParts = async () => {
    // Implementation
  };

  // 3. Return interface
  return {
    parts,
    loading,
    error,
    loadParts,
    // ... other exports
  };
}
```

## Database Integration Patterns

### Type Safety
All database operations use generated TypeScript types from `@/lib/supabase`:

```typescript
import type { Database } from "@/lib/supabase";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type NewCustomer = Database["public"]["Tables"]["customers"]["Insert"];
```

### Error Handling
Consistent error handling with Vietnamese user messages:

```typescript
try {
  const { data, error } = await supabase
    .from("customers")
    .select("*");

  if (error) {
    console.error("Database error:", error);
    throw new Error("Không thể tải danh sách khách hàng");
  }
} catch (error) {
  setError(error);
}
```

## Vietnamese Business Context

### Route Names
Vietnamese route names reflect business terminology:
- `/khach-hang` - Customer management with nested routes:
  - `/khach-hang` - Main customers list and overview
  - `/khach-hang/new` - Create new customer profile
  - `/khach-hang/[id]` - View specific customer details
  - `/khach-hang/[id]/edit` - Edit existing customer information
- `/phieu-sua-chua` - Repair tickets management with nested routes:
  - `/phieu-sua-chua` - Main repair tickets list and overview
  - `/phieu-sua-chua/new` - Create new repair ticket form
  - `/phieu-sua-chua/[id]` - View specific repair ticket details
  - `/phieu-sua-chua/[id]/edit` - Edit existing repair ticket
- `/ton-kho` - Inventory management with nested routes:
  - `/ton-kho` - Main inventory dashboard and parts list
  - `/ton-kho/new` - Add new inventory item or parts
  - `/ton-kho/[id]` - View specific item details and stock history
  - `/ton-kho/[id]/edit` - Edit existing inventory item information
- `/cua-hang` - Shop management with nested routes:
  - `/cua-hang` - Main shop overview and dashboard
  - `/cua-hang/settings` - Shop configuration and preferences
  - `/cua-hang/staff` - Staff management and permissions
  - `/cua-hang/reports` - Shop analytics and business reports

### Customer Management Routing Pattern
The customer management feature uses a comprehensive nested routing structure:

**List & Overview** (`/khach-hang`):
- Main customers dashboard with searchable table
- Customer filtering and sorting capabilities
- Customer statistics and overview metrics

**Create New Customer** (`/khach-hang/new`):
- Customer registration form
- Vietnamese phone number validation
- Address and contact information capture
- Service preferences setup

**View Customer Details** (`/khach-hang/[id]`):
- Complete customer profile display
- Repair history and service timeline
- Device ownership and warranty information
- Communication log and notes

**Edit Customer Information** (`/khach-hang/[id]/edit`):
- Modify customer contact details
- Update service preferences
- Manage customer notes and tags
- Address and billing information updates

### Repair Tickets Routing Pattern
The repair tickets feature uses a comprehensive nested routing structure:

**List & Overview** (`/phieu-sua-chua`):
- Main dashboard with tickets table
- Search and filtering capabilities
- Status overview and statistics

**Create New Ticket** (`/phieu-sua-chua/new`):
- Multi-step ticket creation form
- Vietnamese device information input
- Customer integration and validation
- Draft saving functionality

**View Ticket Details** (`/phieu-sua-chua/[id]`):
- Complete ticket information display
- Status history and timeline
- Parts and costs breakdown
- Customer communication log

**Edit Existing Ticket** (`/phieu-sua-chua/[id]/edit`):
- Modify ticket information
- Update status and priority
- Add notes and documentation
- Manage parts and costs

### Inventory Management Routing Pattern
The inventory management feature uses a comprehensive nested routing structure:

**Dashboard & List** (`/ton-kho`):
- Main inventory dashboard with parts overview
- Stock levels and low-stock alerts
- Parts search and filtering capabilities

**Add New Item** (`/ton-kho/new`):
- New inventory item registration form
- Parts compatibility and specifications
- Initial stock level and pricing setup

**View Item Details** (`/ton-kho/[id]`):
- Complete item information display
- Stock history and movement tracking
- Supplier information and ordering details

**Edit Item Information** (`/ton-kho/[id]/edit`):
- Modify item specifications and details
- Update pricing and stock information
- Manage supplier relationships and notes

### Shop Management Routing Pattern
The shop management feature uses a comprehensive nested routing structure:

**Main Overview** (`/cua-hang`):
- Shop dashboard with key metrics
- Business performance overview
- Quick access to management functions

**Shop Settings** (`/cua-hang/settings`):
- Shop configuration and preferences
- Business information and contact details
- Operating hours and service settings

**Staff Management** (`/cua-hang/staff`):
- Employee profiles and permissions
- Role assignments and access control
- Staff performance and scheduling

**Business Reports** (`/cua-hang/reports`):
- Financial analytics and reporting
- Service performance metrics
- Customer satisfaction tracking

### Component Naming
Components include Vietnamese business context where appropriate while maintaining English technical names for development clarity.

## Testing Structure

### Test Organization
```
tests/
├── e2e/                       # End-to-end tests
│   ├── auth.test.ts          # Authentication flows
│   ├── parts-search.test.ts  # Parts search functionality
│   └── repair-workflow.test.ts # Repair process testing
└── unit/                     # Unit tests (if added)
```

### Test Patterns
- Vietnamese UI text verification
- Mobile responsiveness testing
- Integration testing across workflow states
- Performance benchmarking