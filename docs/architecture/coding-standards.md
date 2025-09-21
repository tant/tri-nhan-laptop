# Coding Standards

## Overview
This document defines the coding standards for the Vietnamese Laptop Repair Shop Management System to ensure consistent, maintainable, and high-quality code.

## Code Formatting & Linting

### Biome Configuration
We use **Biome** (v1.9.4) for both linting and formatting, replacing ESLint and Prettier.

**Key Settings**:
- **Indentation**: Tabs (not spaces)
- **Quote Style**: Double quotes for JavaScript/TypeScript
- **Auto Import Organization**: Enabled
- **Recommended Rules**: Applied

**Commands**:
```bash
pnpm lint      # Run linter
pnpm format    # Format code
pnpm check     # Run both lint and format
```

### Auto-generated Files
**Ignore from linting**: `src/routeTree.gen.ts` and other `.gen.ts` files

## TypeScript Standards

### Type Safety
- **Strict mode enabled** - No `any` types unless absolutely necessary
- **Explicit return types** for functions when not obvious
- **Interface over type** for object definitions
- **Proper null/undefined handling**

### Component Props
```typescript
// ✅ Good - Explicit interface
interface DashboardProps {
  stats: StatItem[]
  recentTickets: TicketItem[]
}

export function DashboardPage({ stats, recentTickets }: DashboardProps) {
  // Component implementation
}

// ❌ Avoid - Inline types for complex props
export function DashboardPage({ stats, recentTickets }: {
  stats: { title: string; value: string }[];
  recentTickets: any[]
}) {
  // Component implementation
}
```

## React Component Standards

### Component Structure
**Standard component structure**:
```typescript
// 1. Imports (grouped and organized)
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 2. Types/Interfaces
interface ComponentProps {
  title: string
  children: React.ReactNode
}

// 3. Component implementation
export function ComponentName({ title, children }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState("")

  // 3b. Event handlers
  const handleClick = () => {
    // Handler logic
  }

  // 3c. Render logic
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
```

### Component Naming
- **PascalCase** for component names: `DashboardPage`, `LoginForm`
- **Descriptive names** that explain purpose
- **Page suffix** for page-level components: `HomePage`, `AdminPage`
- **kebab-case** for shadcn/ui components: `dropdown-menu.tsx`

### Function vs Class Components
- **Always use function components** with hooks
- **No class components** in new code
- **Use React.memo()** for performance optimization when needed

## Import Organization

### Import Order
```typescript
// 1. React imports
import { useState, useEffect } from "react"

// 2. External libraries
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// 3. Internal UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 4. Internal components
import { AppSidebar } from "@/components/app-sidebar"

// 5. Icons
import { Users, Wrench } from "lucide-react"

// 6. Types/Utils
import { cn } from "@/lib/utils"
import type { ComponentProps } from "./types"
```

### Import Grouping
- **Group related imports** using object destructuring
- **Use absolute imports** with `@/` prefix
- **Separate by blank lines** between groups

## Styling Standards

### Tailwind CSS Usage
```typescript
// ✅ Good - Use cn() utility for conditional classes
<div className={cn(
  "base classes here",
  isActive && "active classes",
  variant === "primary" && "primary classes"
)}>

// ✅ Good - Group related classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// ❌ Avoid - Long unorganized class strings
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
```

### Component Variants
Use **class-variance-authority (CVA)** for component variants:

```typescript
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## State Management

### Local State
```typescript
// ✅ Good - Descriptive state names
const [isLoading, setIsLoading] = useState(false)
const [ticketData, setTicketData] = useState<TicketData | null>(null)

// ❌ Avoid - Generic names
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
```

### Form State
Use **React Hook Form + Zod** for forms:

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  customerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  phoneNumber: z.string().regex(/^(09|03|07|08|05)\d{8}$/, "Số điện thoại không hợp lệ"),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    customerName: "",
    phoneNumber: "",
  },
})
```

## Error Handling

### Try-Catch Blocks
```typescript
// ✅ Good - Specific error handling
try {
  const result = await supabase.from("tickets").insert(ticketData)
  if (result.error) throw result.error
  setTickets(prev => [...prev, result.data])
} catch (error) {
  console.error("Failed to create ticket:", error)
  toast.error("Không thể tạo phiếu sửa chữa. Vui lòng thử lại.")
}

// ❌ Avoid - Silent failures
try {
  await supabase.from("tickets").insert(ticketData)
} catch (error) {
  // Silent failure
}
```

## Vietnamese Localization Standards

### Text Content
- **All user-facing text in Vietnamese**
- **Business terminology consistency**:
  - `phiếu sửa chữa` (repair tickets)
  - `khách hàng` (customers)
  - `linh kiện` (parts)
  - `tình trạng` (status)

### Data Validation
```typescript
// Vietnamese phone number validation
const phoneRegex = /^(09|03|07|08|05)\d{8}$/

// Vietnamese-specific error messages
const errorMessages = {
  required: "Trường này là bắt buộc",
  invalidPhone: "Số điện thoại không hợp lệ",
  invalidEmail: "Email không hợp lệ",
}
```

## Performance Standards

### Component Optimization
```typescript
// ✅ Good - Memoize expensive calculations
const expensiveValue = useMemo(() =>
  tickets.filter(ticket => ticket.status === "pending").length,
  [tickets]
)

// ✅ Good - Memoize callbacks
const handleTicketUpdate = useCallback((ticketId: string, updates: TicketUpdate) => {
  setTickets(prev => prev.map(ticket =>
    ticket.id === ticketId ? { ...ticket, ...updates } : ticket
  ))
}, [])
```

### Bundle Size
- **Use dynamic imports** for large components
- **Tree-shake unused utilities**
- **Optimize images and assets**

## Testing Standards

### Component Testing
```typescript
import { render, screen } from "@testing-library/react"
import { DashboardPage } from "./DashboardPage"

describe("DashboardPage", () => {
  it("renders stats correctly", () => {
    render(<DashboardPage />)
    expect(screen.getByText("Phiếu hôm nay")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
  })
})
```

### Testing Commands
```bash
pnpm test      # Run tests
pnpm test:watch # Run tests in watch mode
```

## File Organization

### Folder Structure
- **Group by feature**, not by file type
- **Co-locate related files**
- **Use index files** for clean imports

### File Naming
- **PascalCase** for components: `DashboardPage.tsx`
- **camelCase** for utilities: `formatCurrency.ts`
- **kebab-case** for routes: `khach-hang.tsx`

## Comments and Documentation

### When to Comment
```typescript
// ✅ Good - Explain complex business logic
// Calculate total repair cost including parts and labor
const totalCost = parts.reduce((sum, part) => sum + part.price, 0) + laborCost

// ✅ Good - Document Vietnamese business rules
// Vietnamese phone numbers start with 09, 03, 07, 08, or 05
const phoneRegex = /^(09|03|07|08|05)\d{8}$/

// ❌ Avoid - Obvious comments
// Set loading to true
setLoading(true)
```

### JSDoc for Complex Functions
```typescript
/**
 * Validates Vietnamese phone number format
 * @param phone - Phone number string
 * @returns true if valid Vietnamese mobile number
 */
function validateVietnamesePhone(phone: string): boolean {
  return /^(09|03|07|08|05)\d{8}$/.test(phone)
}
```

## Git Commit Standards

### Commit Message Format
```
type(scope): description

feat(dashboard): add repair ticket quick actions
fix(login): resolve authentication redirect issue
docs(readme): update installation instructions
refactor(components): extract common form validation
```

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance tasks

## Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Vietnamese localization consistency
- [ ] Performance considerations
- [ ] Accessibility (shadcn/ui components)
- [ ] Test coverage for new features
- [ ] Biome linting passes
- [ ] No console.log statements in production code