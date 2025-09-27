# Development Guidelines for New Team Members

Welcome to the Vietnamese Laptop Repair Shop Management System development team! This guide will help you understand our codebase, development practices, and Vietnamese business context.

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Codebase Architecture](#codebase-architecture)
3. [Vietnamese Business Context](#vietnamese-business-context)
4. [Development Workflow](#development-workflow)
5. [Code Style and Standards](#code-style-and-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Type Safety Practices](#type-safety-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)
10. [Resources and References](#resources-and-references)

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or later)
- **pnpm** (package manager)
- **Docker** (for Supabase local development)
- **Git** (version control)
- **VSCode** (recommended IDE with TypeScript extensions)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd try-vite
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Supabase backend**
   ```bash
   pnpm run db:start
   ```

5. **Create admin user**
   ```bash
   pnpm run create-admin
   ```

6. **Start development server**
   ```bash
   pnpm run dev
   ```

7. **Access the application**
   - App: http://localhost:5173
   - Supabase Studio: http://127.0.0.1:54323

### First Tasks for New Developers

1. **Explore the codebase structure**
2. **Read Vietnamese business logic documentation**
3. **Run existing tests to understand functionality**
4. **Make a small bug fix or feature addition**
5. **Add tests for your changes**

## Codebase Architecture

### Project Structure

```
try-vite/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── pages/          # Page-specific components
│   │   └── vietnamese/     # Vietnamese-specific components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── validation/     # Vietnamese validation utilities
│   │   └── vietnamese/     # Vietnamese business logic
│   ├── routes/             # TanStack Router routes
│   └── styles/             # CSS and styling
├── tests/                  # Test files
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   ├── integration/        # Integration tests
│   └── utils/              # Test utilities
├── docs/                   # Documentation
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── seed.sql           # Sample data
└── scripts/                # Build and utility scripts
```

### Key Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: TanStack Router (file-based)
- **UI**: shadcn/ui + Tailwind CSS 4.0
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library
- **Code Quality**: Biome (ESLint + Prettier replacement)

### Architecture Principles

1. **Vietnamese-First Design**: All business logic considers Vietnamese market requirements
2. **Type Safety**: Comprehensive TypeScript usage with runtime validation
3. **Component Composition**: Reusable, generic components with Vietnamese business context
4. **Hook-Based Logic**: Business logic encapsulated in custom hooks
5. **Optimistic Updates**: Responsive UI with rollback capabilities
6. **Real-time Updates**: Live data synchronization via Supabase

## Vietnamese Business Context

### Why Vietnamese Context Matters

This system is specifically designed for Vietnamese laptop repair shops. Understanding Vietnamese business culture is crucial for effective development.

### Key Vietnamese Business Characteristics

1. **Phone-Centric Customer Identification**
   - Customers are identified by phone numbers, not emails or IDs
   - Vietnamese mobile number format: 10 digits starting with 0
   - Common prefixes: 090, 091, 094, 086, 088, etc.

2. **Family-Oriented Service**
   - Family members often handle repairs for each other
   - Multiple people may be authorized to pick up devices
   - Communication should include family context

3. **Relationship-Based Business**
   - Long-term customer relationships are highly valued
   - Trust and transparency are essential
   - Personal touch in communication is expected

4. **Currency and Pricing**
   - Vietnamese Dong (VND) has no decimal places
   - Common repair prices: 50,000 - 5,000,000 VND
   - Prices typically in 1,000 VND increments
   - Detailed cost breakdown expected

### Essential Vietnamese Patterns

```typescript
// Phone number handling
import { isValidVietnamesePhone, formatPhoneForDisplay } from '@/lib/validation/phone-vietnamese';

// Currency formatting
import { formatVND, validateRepairPrice } from '@/lib/validation/currency-vietnamese';

// Business hours
import { isVietnameseBusinessHours } from '@/lib/vietnamese/business-hours';
```

## Development Workflow

### Daily Development Process

1. **Start your day**
   ```bash
   pnpm run db:start    # Start Supabase
   pnpm run dev         # Start frontend
   ```

2. **Before making changes**
   ```bash
   git pull origin main
   pnpm run test        # Ensure tests pass
   pnpm run check       # Check code quality
   ```

3. **Development cycle**
   - Write/modify code
   - Add/update tests
   - Run tests locally
   - Check code quality
   - Commit changes

4. **Before committing**
   ```bash
   pnpm run lint        # Check linting
   pnpm run format      # Format code
   pnpm run build       # Ensure build works
   pnpm run test        # Run all tests
   ```

### Branch Strategy

- **main**: Production-ready code
- **feature/description**: New features
- **fix/description**: Bug fixes
- **refactor/description**: Code improvements

### Commit Guidelines

Use conventional commits:

```
feat: add Vietnamese phone validation
fix: repair cost calculation for VND
docs: update business logic documentation
test: add integration tests for customer workflow
refactor: improve type safety in repair hooks
```

## Code Style and Standards

### TypeScript Standards

1. **Always use type annotations for function parameters and return types**
   ```typescript
   // ✅ Good
   function createCustomer(phone: string, name: string): Promise<Customer> {
     // implementation
   }

   // ❌ Bad
   function createCustomer(phone, name) {
     // implementation
   }
   ```

2. **Use type guards for runtime validation**
   ```typescript
   import { isValidVietnamesePhone } from '@/lib/type-guards';

   function processPhone(phone: unknown): string {
     if (!isValidVietnamesePhone(phone)) {
       throw new Error('Invalid Vietnamese phone number');
     }
     return phone; // TypeScript knows phone is string
   }
   ```

3. **Prefer interfaces over types for object shapes**
   ```typescript
   // ✅ Good
   interface CustomerData {
     phone: string;
     fullName: string;
     address?: string;
   }

   // ❌ Avoid (unless union types needed)
   type CustomerData = {
     phone: string;
     fullName: string;
     address?: string;
   }
   ```

### Component Standards

1. **Use generic types for reusable components**
   ```typescript
   interface DataTableProps<T> {
     data: T[];
     columns: ColumnDef<T>[];
     onRowClick?: (row: T) => void;
   }

   function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
     // implementation
   }
   ```

2. **Vietnamese business context in props**
   ```typescript
   interface RepairFormProps {
     customerPhone: string; // Vietnamese phone format
     onSubmit: (data: RepairTicketData) => void;
     currency?: 'VND'; // Default to VND
     locale?: 'vi-VN'; // Default to Vietnamese
   }
   ```

3. **Error handling with Vietnamese messages**
   ```typescript
   function CustomerForm() {
     const [error, setError] = useState<string | null>(null);

     const handleSubmit = async (data: CustomerData) => {
       try {
         await createCustomer(data);
       } catch (err) {
         setError('Không thể tạo khách hàng mới. Vui lòng thử lại.');
       }
     };
   }
   ```

### Hook Standards

1. **Encapsulate business logic in hooks**
   ```typescript
   function useRepairTicketCreation() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);

     const createTicket = useCallback(async (data: NewRepairTicket) => {
       setLoading(true);
       setError(null);
       try {
         // Vietnamese business validation
         validateVietnameseRepairData(data);
         // Create ticket
         const result = await supabase.from('repair_tickets').insert(data);
         return result;
       } catch (err) {
         setError(err as Error);
         throw err;
       } finally {
         setLoading(false);
       }
     }, []);

     return { createTicket, loading, error };
   }
   ```

2. **Use optimistic updates for better UX**
   ```typescript
   function useOptimisticCustomerUpdate() {
     return useOptimisticMutation<Customer>({
       table: 'customers',
       onSuccess: (customer) => {
         toast.success(`Đã cập nhật thông tin ${customer.fullName}`);
       },
       onError: (error) => {
         toast.error('Không thể cập nhật thông tin khách hàng');
       },
     });
   }
   ```

## Testing Guidelines

### Test Structure

1. **Test file organization**
   ```
   tests/
   ├── components/           # Component unit tests
   ├── hooks/               # Hook unit tests
   ├── integration/         # Integration tests
   ├── utils/               # Test utilities
   └── examples/            # Example test patterns
   ```

2. **Vietnamese locale testing**
   ```typescript
   import VietnameseLocaleUtils from 'tests/utils/vietnamese-locale-testing';

   describe('Vietnamese Customer Management', () => {
     beforeEach(() => {
       VietnameseLocaleUtils.setup.createVietnameseTestEnvironment();
     });

     it('should validate Vietnamese phone numbers', () => {
       const validPhones = VietnameseLocaleUtils.phone.generateValidPhones(5);
       validPhones.forEach(phone => {
         VietnameseLocaleUtils.assertions.assertValidVietnamesePhone(phone);
       });
     });
   });
   ```

### Testing Patterns

1. **Component testing with Vietnamese context**
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { CustomerForm } from '@/components/CustomerForm';

   test('should display Vietnamese currency format', () => {
     render(<CustomerForm estimatedCost={1500000} />);
     expect(screen.getByText('1.500.000 ₫')).toBeInTheDocument();
   });
   ```

2. **Hook testing with Supabase mocking**
   ```typescript
   import { renderHook } from '@testing-library/react';
   import { useCustomerCrud } from '@/hooks/use-customer-crud';
   import { VietnameseMockDataGenerator } from 'tests/utils/supabase-mock';

   test('should create customer with Vietnamese phone', async () => {
     const { result } = renderHook(() => useCustomerCrud());
     const customerData = VietnameseMockDataGenerator.generateCustomer();

     const customer = await result.current.createCustomer(customerData);
     expect(customer?.phone).toMatch(/^09\d{8}$/);
   });
   ```

### Testing Best Practices

1. **Always test Vietnamese business rules**
2. **Use realistic Vietnamese test data**
3. **Test error cases with Vietnamese error messages**
4. **Include integration tests for complete workflows**
5. **Mock external services (Supabase) appropriately**

## Type Safety Practices

### Runtime Validation

Always validate data at runtime, especially for Vietnamese business rules:

```typescript
import { isValidVietnamesePhone, isCustomer } from '@/lib/type-guards';

function processCustomerData(data: unknown): Customer {
  if (!isCustomer(data)) {
    throw new Error('Invalid customer data');
  }

  if (!isValidVietnamesePhone(data.phone)) {
    throw new Error('Invalid Vietnamese phone number');
  }

  return data; // TypeScript knows this is Customer
}
```

### Generic Types for Vietnamese Business

```typescript
interface VietnameseBusinessEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // Vietnamese-specific fields
  vietnameseNotes?: string;
  locale: 'vi-VN';
}

interface VietnameseCustomer extends VietnameseBusinessEntity {
  phone: string; // Vietnamese format
  fullName: string; // Vietnamese name
  address?: string; // Vietnamese address
}

function createBusinessEntity<T extends VietnameseBusinessEntity>(
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'locale'>
): T {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    locale: 'vi-VN',
  } as T;
}
```

### Error Handling Types

```typescript
interface VietnameseBusinessError {
  code: string;
  message: string; // Vietnamese error message
  englishMessage?: string; // Optional English translation
  field?: string; // Field that caused the error
  context?: Record<string, any>; // Additional context
}

type VietnameseResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: VietnameseBusinessError;
};
```

## Common Patterns

### Vietnamese Phone Number Handling

```typescript
import {
  validateVietnamesePhone,
  normalizePhoneNumber,
  formatPhoneForDisplay
} from '@/lib/validation/phone-vietnamese';

// When storing phone numbers
function saveCustomer(customerData: { phone: string; name: string }) {
  const validation = validateVietnamesePhone(customerData.phone);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalizedPhone = normalizePhoneNumber(customerData.phone);
  return supabase.from('customers').insert({
    ...customerData,
    phone: normalizedPhone, // Store normalized
  });
}

// When displaying phone numbers
function CustomerDisplay({ customer }: { customer: Customer }) {
  const displayPhone = formatPhoneForDisplay(customer.phone);
  return <span>{displayPhone}</span>; // "0901 234 567"
}
```

### Currency Handling

```typescript
import { formatVND, validateRepairPrice } from '@/lib/validation/currency-vietnamese';

function RepairCostDisplay({ amount }: { amount: number }) {
  const validation = validateRepairPrice(amount);
  if (!validation.isValid) {
    return <span className="error">{validation.error}</span>;
  }

  return <span>{formatVND(amount)}</span>; // "1.500.000 ₫"
}
```

### Status Management

```typescript
import { VIETNAMESE_REPAIR_STATUSES } from '@/lib/vietnamese/repair-statuses';

function StatusBadge({ status }: { status: RepairStatus }) {
  const vietnameseLabel = VIETNAMESE_REPAIR_STATUSES[status];
  const statusColor = getStatusColor(status);

  return (
    <Badge className={statusColor}>
      {vietnameseLabel}
    </Badge>
  );
}
```

### Date and Time Formatting

```typescript
import { formatVietnameseDate, isVietnameseBusinessHours } from '@/lib/vietnamese/date-time';

function RepairSchedule({ scheduledDate }: { scheduledDate: Date }) {
  const formattedDate = formatVietnameseDate(scheduledDate);
  const isDuringBusinessHours = isVietnameseBusinessHours(scheduledDate);

  return (
    <div>
      <span>{formattedDate}</span>
      {!isDuringBusinessHours && (
        <span className="warning">Ngoài giờ làm việc</span>
      )}
    </div>
  );
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Phone validation fails**
   ```typescript
   // Problem: Phone number not recognized as valid
   // Solution: Check if using correct Vietnamese format
   const phone = "090 123 4567"; // ❌ Has spaces
   const normalized = normalizePhoneNumber(phone); // ✅ "0901234567"
   ```

2. **Currency formatting issues**
   ```typescript
   // Problem: Wrong currency display
   // Solution: Use Vietnamese currency formatter
   const amount = 1500000.50; // ❌ Has decimals
   const validAmount = Math.round(amount); // ✅ Remove decimals
   const formatted = formatVND(validAmount); // ✅ "1.500.000 ₫"
   ```

3. **Database connection issues**
   ```bash
   # Problem: Supabase not connecting
   # Solution: Restart Supabase services
   pnpm run db:stop
   pnpm run db:start
   pnpm run db:status  # Check if services are running
   ```

4. **Test failures with Vietnamese data**
   ```typescript
   // Problem: Tests fail with Vietnamese characters
   // Solution: Set up Vietnamese test environment
   import { VietnameseTestSetup } from 'tests/utils/vietnamese-locale-testing';

   beforeEach(() => {
     VietnameseTestSetup.createVietnameseTestEnvironment();
   });
   ```

### Debugging Tips

1. **Use browser dev tools to inspect Vietnamese character encoding**
2. **Check network tab for Supabase API calls and responses**
3. **Use React Developer Tools to inspect component state**
4. **Enable TypeScript strict mode errors in IDE**
5. **Use Supabase Studio to inspect database state**

### Getting Help

1. **Check existing documentation**
   - [Vietnamese Business Logic](./vietnamese-business-logic.md)
   - [CLAUDE.md](../CLAUDE.md) for comprehensive setup
   - [Component Composition Patterns](./component-patterns.md)

2. **Search existing code for patterns**
   ```bash
   # Find examples of phone validation
   grep -r "isValidVietnamesePhone" src/

   # Find currency formatting examples
   grep -r "formatVND" src/

   # Find status handling patterns
   grep -r "repair_status" src/
   ```

3. **Ask team members**
   - Share specific error messages
   - Include relevant code snippets
   - Mention what you've already tried

## Resources and References

### Essential Files to Study

1. **`src/lib/type-guards.ts`** - Type validation patterns
2. **`src/lib/validation/phone-vietnamese.ts`** - Phone number handling
3. **`src/hooks/use-repair-tickets-crud.ts`** - CRUD operation patterns
4. **`tests/utils/vietnamese-locale-testing.ts`** - Testing utilities
5. **`src/contexts/auth-context.tsx`** - Context usage patterns

### External Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Router](https://tanstack.com/router/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Vitest Testing Framework](https://vitest.dev/)

### Vietnamese Development Resources

- [Vietnamese Phone Number Formats](https://en.wikipedia.org/wiki/Telephone_numbers_in_Vietnam)
- [Vietnamese Currency Information](https://en.wikipedia.org/wiki/Vietnamese_dong)
- [Vietnamese Business Culture Guide](https://www.hofstede-insights.com/country/vietnam/)

### Development Tools

- **VSCode Extensions**: TypeScript, Tailwind CSS, Git Lens
- **Browser Extensions**: React Developer Tools, Redux DevTools
- **Database Tools**: Supabase Studio, pgAdmin (for advanced queries)

## Next Steps

After reading this guide:

1. **Set up your development environment**
2. **Explore the codebase structure**
3. **Read the Vietnamese business logic documentation**
4. **Make your first small contribution**
5. **Add tests for your changes**
6. **Get code review from team members**

Welcome to the team! We're here to help you succeed in building excellent software for Vietnamese businesses.