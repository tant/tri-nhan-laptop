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
├── components/
│   ├── analytics/              # Business analytics components
│   │   └── analytics-dashboard.tsx
│   ├── customer-portal/        # Public-facing customer components
│   │   ├── service-history-display.tsx
│   │   └── feedback-dialog.tsx
│   ├── notifications/          # Notification system components
│   ├── pages/                  # Main page components
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── PartsPage.tsx
│   │   ├── RepairTicketsPage.tsx
│   │   └── HomePage.tsx
│   ├── repair-workflow/        # Repair process components
│   ├── ui/                     # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── sidebar.tsx
│   ├── app-sidebar.tsx         # Main navigation sidebar
│   ├── error-boundary.tsx     # Error handling components
│   ├── network-status.tsx     # Network connectivity status
│   ├── protected-route.tsx    # Authentication guards
│   └── skeleton-loaders.tsx   # Loading state components
```

### Business Logic & Utilities

```
src/
├── contexts/
│   └── auth-context.tsx        # Authentication context provider
├── hooks/                      # Custom React hooks
│   ├── use-analytics.ts        # Business analytics hooks
│   ├── use-customer-portal.ts  # Customer-facing functionality
│   ├── use-notifications.ts    # Notification management
│   ├── use-parts-management.ts # Parts inventory hooks
│   ├── use-repair-workflow.ts  # Repair process hooks
│   └── use-optimistic-mutation.ts # Optimistic UI updates
├── lib/                        # Core utilities and configurations
│   ├── supabase.ts            # Supabase client and type definitions
│   ├── utils.ts               # General utility functions
│   ├── types.ts               # Global TypeScript types
│   ├── setup.ts               # Application setup utilities
│   └── repair-workflow.ts     # Repair workflow business logic
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
├── khach-hang.tsx              # Customer management (Vietnamese route)
├── phieu-sua-chua.tsx         # Repair tickets (Vietnamese route)
├── ton-kho.tsx                # Inventory management (Vietnamese route)
├── cua-hang.tsx               # Shop management (Vietnamese route)
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
- `/khach-hang` - Customer management
- `/phieu-sua-chua` - Repair tickets
- `/ton-kho` - Inventory
- `/cua-hang` - Shop management

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