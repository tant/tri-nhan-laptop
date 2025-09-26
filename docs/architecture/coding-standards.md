# Coding Standards

## Overview
This document defines the coding standards for the Vietnamese Laptop Repair Management System project. These standards ensure consistency, maintainability, and quality across the codebase.

## Language Standards

### TypeScript
- **Required**: All source files must be TypeScript (`.ts` or `.tsx`)
- **Strict Mode**: TypeScript strict mode enabled with additional linting rules
- **No Unused Variables**: `noUnusedLocals` and `noUnusedParameters` enabled
- **Type Safety**: No `any` types unless absolutely necessary with proper justification

### Code Formatting

#### Biome Configuration
- **Formatter**: Biome formatter enabled for consistent formatting
- **Indent Style**: Tab indentation (configured in `biome.json`)
- **Quote Style**: Double quotes for JavaScript/TypeScript
- **Import Organization**: Automatic import sorting enabled

#### Biome Linting Rules (Customized)
```json
{
  "suspicious/noArrayIndexKey": "off", // Array indices as React keys allowed for skeleton loaders
  "suspicious/noExplicitAny": "off", // Explicit any types permitted where needed
  "a11y/useKeyWithClickEvents": "off", // Click events without keyboard support allowed
  "a11y/useFocusableInteractive": "off", // Interactive elements without focus allowed
  "a11y/noLabelWithoutControl": "off", // Labels without form controls allowed
  "correctness/useExhaustiveDependencies": "warn", // Hook dependency suggestions only
  "correctness/noUnusedVariables": "warn", // Unused variables as warnings only
  "correctness/noUnusedImports": "warn", // Unused imports as warnings only
  "style/noNonNullAssertion": "off" // Non-null assertions allowed where needed
}
```

#### File Exclusions
```json
{
  "ignore": [
    "src/routeTree.gen.ts", // Auto-generated TanStack Router file
    "tests/**/*", // All test files excluded from linting
    "**/*.test.*", // Test files with any extension
    "**/*.spec.*", // Spec files
    "**/setupTests.*", // Test setup files
    "**/vitest.config.*", // Vitest configuration files
    "**/test-setup.*" // Additional test setup files
  ]
}
```

#### Code Style Rules
```typescript
// ✅ Good - Proper TypeScript interface
interface RepairTicket {
  id: string;
  customerPhone: string;
  status: RepairStatus;
}

// ✅ Acceptable - Array indices for skeleton components
{Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
  <SkeletonCard key={key} />
))}

// ✅ Acceptable - Prefix unused variables with underscore
const _unusedParam = getValue(); // Won't trigger linting error

// ❌ Bad - Using any without justification
interface RepairTicket {
  id: any;
  data: any;
}
```

## File Organization

### Import Order
1. React imports
2. Third-party library imports
3. Internal imports (using `@/` alias)
4. Type-only imports (if separate)

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase";
```

### File Naming
- **Components**: PascalCase (e.g., `PartsPage.tsx`, `CustomerForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `use-parts-management.ts`)
- **Utilities**: kebab-case (e.g., `repair-workflow.ts`)
- **Types**: camelCase (e.g., `types.ts`)

## Component Standards

### React Components
- **Function Components**: Use function declaration syntax
- **Props Interface**: Define props interface for all components
- **Export Pattern**: Named export preferred

```typescript
interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerData) => void;
}

export function CustomerForm({ customer, onSubmit }: CustomerFormProps) {
  // Component implementation
}
```

### Component Structure
1. Imports
2. Type definitions
3. Component function
4. Export statement

### Hooks
- **Custom Hooks**: Start with `use` prefix
- **Return Object**: Use object destructuring for multiple returns
- **Error Handling**: Always include error state management

```typescript
export function usePartsManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    loading,
    error,
    // ... other returns
  };
}
```

## Database & API Standards

### Supabase Integration
- **Type Safety**: Use generated types from `@/lib/supabase`
- **Error Handling**: Always handle Supabase errors properly
- **Vietnamese Messages**: Convert error messages to Vietnamese for user-facing components

```typescript
// ✅ Good - Proper error handling
const { data, error } = await supabase
  .from("parts")
  .select("*");

if (error) {
  console.error("Database error:", error);
  setError(new Error("Không thể tải dữ liệu linh kiện"));
  return;
}
```

### Database Operations
- **RLS Compliance**: Ensure all queries respect Row Level Security
- **Transaction Safety**: Use transactions for multi-table operations
- **Performance**: Include appropriate `select()` clauses to limit data transfer

## Testing Standards

### Test Organization
- **E2E Tests**: Located in `/tests/e2e/`
- **Test Framework**: Playwright for end-to-end testing
- **Test Naming**: Descriptive test names with user actions

```typescript
test("should successfully login with valid credentials", async ({ page }) => {
  // Test implementation
});
```

### Test Requirements
- **Vietnamese UI Testing**: Verify Vietnamese text displays correctly
- **Mobile Testing**: Include responsive design tests
- **Error Scenarios**: Test error states and recovery
- **Integration Testing**: Verify component interactions

## Vietnamese Localization Standards

### Text Content
- **Primary Language**: All user-facing text in Vietnamese
- **Technical Terms**: Use appropriate Vietnamese technical terminology
- **Error Messages**: Provide clear Vietnamese error messages
- **Currency**: Format currency as Vietnamese Dong (VND)

### Data Formatting
```typescript
// ✅ Good - Vietnamese formatting
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN").format(date);
```

## Performance Standards

### Code Optimization
- **Bundle Size**: Monitor and optimize bundle size
- **Lazy Loading**: Use dynamic imports for large components
- **Database Queries**: Optimize queries and use appropriate indexes
- **Real-time Updates**: Use Supabase subscriptions efficiently

### Performance Targets
- **Initial Load**: < 2 seconds for main application
- **Search Results**: < 1 second for parts/customer search
- **Database Operations**: < 500ms for standard CRUD operations

### Biome Auto-fix
- **Run auto-fix**: `pnpm biome check --write`
- **Unsafe fixes**: `pnpm biome check --write --unsafe`
- **Check only**: `pnpm run lint`

## Security Standards

### Authentication
- **Supabase Auth**: Use Supabase authentication exclusively
- **Role-based Access**: Implement proper role checking
- **Session Management**: Handle session persistence properly

### Data Security
- **RLS Policies**: All tables must have appropriate RLS policies
- **Input Validation**: Validate all user inputs with Zod schemas
- **Error Information**: Don't expose sensitive information in errors

## Commit Standards

### Commit Messages
- **Format**: `type: description`
- **Types**: feat, fix, refactor, test, docs, style
- **Vietnamese Context**: Include Vietnamese context when relevant

```
feat: add Vietnamese parts search with compatibility filtering
fix: resolve stock level calculation for repair workflow
test: add E2E tests for customer management in Vietnamese
```

### Code Review
- **Type Safety**: Verify TypeScript compliance
- **Vietnamese Support**: Check Vietnamese text and formatting
- **Testing**: Ensure adequate test coverage
- **Performance**: Review for performance implications

## Error Handling Standards

### Error Messages
- **User-Facing**: Always in Vietnamese with helpful guidance
- **Development**: Technical details in English for debugging
- **Logging**: Include context for troubleshooting

```typescript
// ✅ Good - Proper error handling
try {
  await updatePartStock(partId, newStock);
} catch (error) {
  console.error("Stock update failed:", error);
  showError("Không thể cập nhật tồn kho. Vui lòng thử lại.");
}
```

## Documentation Standards

### Code Comments
- **JSDoc**: Use for public functions and complex logic
- **Vietnamese Business Logic**: Comment Vietnamese business rules
- **TODO**: Mark temporary solutions clearly

### README Files
- **Setup Instructions**: Clear setup steps in English
- **Business Context**: Vietnamese business context where relevant
- **Architecture**: Document major architectural decisions