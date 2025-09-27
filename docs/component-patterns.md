# Component Composition Patterns and Best Practices

This document describes the component composition patterns, best practices, and architectural decisions used in the Vietnamese Laptop Repair Shop Management System.

## Table of Contents

1. [Component Architecture Overview](#component-architecture-overview)
2. [Vietnamese-Specific Component Patterns](#vietnamese-specific-component-patterns)
3. [Generic Component Patterns](#generic-component-patterns)
4. [Form Component Patterns](#form-component-patterns)
5. [Data Display Patterns](#data-display-patterns)
6. [State Management Patterns](#state-management-patterns)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Performance Optimization Patterns](#performance-optimization-patterns)
9. [Testing Component Patterns](#testing-component-patterns)
10. [Best Practices and Guidelines](#best-practices-and-guidelines)

## Component Architecture Overview

### Design Principles

Our component architecture follows these core principles:

1. **Vietnamese-First Design**: All components consider Vietnamese business context
2. **Type Safety**: Comprehensive TypeScript usage with runtime validation
3. **Composition over Inheritance**: Prefer composable components over deep hierarchies
4. **Single Responsibility**: Each component has one clear purpose
5. **Reusability**: Components are designed for reuse across different contexts
6. **Accessibility**: Components support Vietnamese locale and accessibility standards

### Component Hierarchy

```
src/components/
├── ui/                     # Base UI components (shadcn/ui)
├── vietnamese/             # Vietnamese-specific business components
├── forms/                  # Form-related components
├── data/                   # Data display components
├── layout/                 # Layout and navigation components
├── feedback/               # Loading, error, and feedback components
└── pages/                  # Page-specific composed components
```

## Vietnamese-Specific Component Patterns

### Phone Number Input Component

A specialized input component for Vietnamese phone numbers:

```typescript
// src/components/vietnamese/PhoneInput.tsx
interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoFormat?: boolean; // Auto-format as user types
}

export function PhoneInput({
  value,
  onChange,
  error,
  placeholder = "Số điện thoại",
  required = false,
  autoFormat = true,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(
    autoFormat ? formatPhoneForDisplay(value) : value
  );

  const handleChange = (inputValue: string) => {
    // Normalize input for validation
    const normalized = normalizePhoneNumber(inputValue);

    // Update display value with formatting
    if (autoFormat) {
      setDisplayValue(formatPhoneForDisplay(normalized));
    } else {
      setDisplayValue(inputValue);
    }

    // Pass normalized value to parent
    onChange(normalized);
  };

  const validation = validateVietnamesePhone(value);

  return (
    <div className="space-y-2">
      <Label>
        {placeholder}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        type="tel"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="0901 234 567"
        className={cn(
          error || !validation.isValid ? "border-red-500" : ""
        )}
        maxLength={13} // Formatted length: "0901 234 567"
      />
      {(error || !validation.isValid) && (
        <p className="text-sm text-red-500">
          {error || validation.error}
        </p>
      )}
    </div>
  );
}
```

### Currency Display Component

A component for displaying Vietnamese currency with proper formatting:

```typescript
// src/components/vietnamese/CurrencyDisplay.tsx
interface CurrencyDisplayProps {
  amount: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  size = 'md',
  showSymbol = true,
  className,
}: CurrencyDisplayProps) {
  const formatAmount = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'Chưa định giá';
    }

    if (value === 0) {
      return 'Miễn phí';
    }

    const formatted = new Intl.NumberFormat('vi-VN').format(value);
    return showSymbol ? `${formatted} ₫` : formatted;
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  const validation = amount !== null && amount !== undefined
    ? validateRepairPrice(amount)
    : { isValid: true };

  return (
    <span
      className={cn(
        sizeClasses[size],
        !validation.isValid ? 'text-red-500' : 'text-foreground',
        className
      )}
      title={!validation.isValid ? validation.error : undefined}
    >
      {formatAmount(amount)}
    </span>
  );
}
```

### Status Badge Component

A component for displaying Vietnamese repair statuses:

```typescript
// src/components/vietnamese/StatusBadge.tsx
interface StatusBadgeProps {
  status: RepairStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<RepairStatus, {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  draft: {
    label: 'Phiếu nháp',
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
  },
  device_received: {
    label: 'Đã nhận máy',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
  },
  in_progress: {
    label: 'Đang sửa chữa',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Wrench,
  },
  completed: {
    label: 'Đã hoàn thành',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  // ... other statuses
};

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <Badge className={cn(config.color, sizeClasses[size])}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
```

## Generic Component Patterns

### Data Table Component

A generic, type-safe data table component:

```typescript
// src/components/data/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  filterComponent?: React.ReactNode;
  pagination?: boolean;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error,
  onRowClick,
  onSelectionChange,
  filterComponent,
  pagination = true,
  pageSize = 10,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  if (loading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterComponent && (
        <div className="flex items-center space-x-2">
          {filterComponent}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
```

### Loading Skeleton Component

A flexible skeleton loader for different content types:

```typescript
// src/components/feedback/Skeleton.tsx
interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'form';
  lines?: number;
  className?: string;
}

export function Skeleton({ variant = 'text', lines = 1, className }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded";

  const variants = {
    text: (
      <div className={cn(baseClasses, "h-4 w-full", className)} />
    ),
    card: (
      <div className={cn("space-y-3", className)}>
        <div className={cn(baseClasses, "h-32 w-full")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-4 w-3/4")} />
          <div className={cn(baseClasses, "h-4 w-1/2")} />
        </div>
      </div>
    ),
    table: (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="flex space-x-4">
            <div className={cn(baseClasses, "h-4 w-1/4")} />
            <div className={cn(baseClasses, "h-4 w-1/3")} />
            <div className={cn(baseClasses, "h-4 w-1/6")} />
            <div className={cn(baseClasses, "h-4 w-1/4")} />
          </div>
        ))}
      </div>
    ),
    form: (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className={cn(baseClasses, "h-4 w-1/4")} />
            <div className={cn(baseClasses, "h-10 w-full")} />
          </div>
        ))}
      </div>
    ),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cn(baseClasses, "h-4 w-full")} />
        ))}
      </div>
    );
  }

  return variants[variant];
}
```

## Form Component Patterns

### Vietnamese Customer Form

A comprehensive form for Vietnamese customer data:

```typescript
// src/components/forms/CustomerForm.tsx
interface CustomerFormProps {
  initialData?: Partial<CustomerData>;
  onSubmit: (data: CustomerData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const customerSchema = z.object({
  phone: z.string()
    .min(1, 'Số điện thoại là bắt buộc')
    .refine(isValidVietnamesePhone, 'Số điện thoại không hợp lệ'),
  fullName: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được quá 100 ký tự'),
  address: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type CustomerData = z.infer<typeof customerSchema>;

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CustomerFormProps) {
  const form = useForm<CustomerData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      phone: '',
      fullName: '',
      address: '',
      email: '',
      notes: '',
      ...initialData,
    },
  });

  const handleSubmit = async (data: CustomerData) => {
    try {
      await onSubmit(data);
      form.reset();
      toast.success('Đã lưu thông tin khách hàng');
    } catch (error) {
      toast.error('Không thể lưu thông tin khách hàng');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Số điện thoại <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.phone?.message}
                    autoFormat
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Họ và tên <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nguyễn Văn An"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  disabled={loading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thông tin'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Search and Filter Component

A reusable search and filter component:

```typescript
// src/components/data/SearchAndFilter.tsx
interface SearchAndFilterProps<T> {
  data: T[];
  onFilteredDataChange: (filteredData: T[]) => void;
  searchFields: (keyof T)[];
  filterOptions?: FilterOption<T>[];
  placeholder?: string;
}

interface FilterOption<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  filterFn: (item: T, value: string) => boolean;
}

export function SearchAndFilter<T>({
  data,
  onFilteredDataChange,
  searchFields,
  filterOptions = [],
  placeholder = "Tìm kiếm...",
}: SearchAndFilterProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const applyFilters = useCallback(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const filterOption = filterOptions.find(opt => opt.key === key);
        if (filterOption) {
          filtered = filtered.filter(item => filterOption.filterFn(item, value));
        }
      }
    });

    onFilteredDataChange(filtered);
  }, [data, searchTerm, filters, searchFields, filterOptions, onFilteredDataChange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filterOptions.map((filter) => (
          <Select
            key={filter.key}
            value={filters[filter.key] || ''}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {(searchTerm || Object.values(filters).some(Boolean)) && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Tìm kiếm: {searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSearchTerm('')}
              />
            </Badge>
          )}
          {Object.entries(filters)
            .filter(([, value]) => value)
            .map(([key, value]) => {
              const filter = filterOptions.find(opt => opt.key === key);
              const option = filter?.options.find(opt => opt.value === value);
              return (
                <Badge key={key} variant="secondary" className="gap-1">
                  {filter?.label}: {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange(key, '')}
                  />
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
}
```

## State Management Patterns

### Optimistic Updates with Rollback

A pattern for implementing optimistic updates:

```typescript
// src/components/data/OptimisticDataList.tsx
interface OptimisticDataListProps<T extends { id: string }> {
  data: T[];
  renderItem: (item: T, isOptimistic: boolean) => React.ReactNode;
  onUpdate: (id: string, updates: Partial<T>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function OptimisticDataList<T extends { id: string }>({
  data,
  renderItem,
  onUpdate,
  onDelete,
}: OptimisticDataListProps<T>) {
  const {
    items,
    addOptimisticItem,
    updateOptimisticItem,
    removeOptimisticItem,
    confirmOptimisticItem,
    rollbackOptimisticItem,
    isOptimistic,
  } = useOptimisticList<T>(data);

  const handleUpdate = async (id: string, updates: Partial<T>) => {
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) return;

    // Apply optimistic update
    updateOptimisticItem(id, updates);

    try {
      await onUpdate(id, updates);
      // Optimistic update succeeded, no need to confirm
    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticItem(id);
      toast.error('Không thể cập nhật dữ liệu');
    }
  };

  const handleDelete = async (id: string) => {
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) return;

    // Apply optimistic delete
    removeOptimisticItem(id);

    try {
      await onDelete(id);
      toast.success('Đã xóa thành công');
    } catch (error) {
      // Rollback optimistic delete
      addOptimisticItem(currentItem);
      toast.error('Không thể xóa dữ liệu');
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "transition-opacity",
            isOptimistic(item.id) ? "opacity-70" : "opacity-100"
          )}
        >
          {renderItem(item, isOptimistic(item.id))}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling Patterns

### Error Boundary Component

A robust error boundary for Vietnamese applications:

```typescript
// src/components/feedback/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Đã xảy ra lỗi</h2>
        </div>
        <p className="text-muted-foreground">
          Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>
        <div className="space-y-2">
          <Button onClick={resetError} className="w-full">
            Thử lại
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Chi tiết lỗi (development only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

## Performance Optimization Patterns

### Virtualized List Component

For handling large datasets efficiently:

```typescript
// src/components/data/VirtualizedList.tsx
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return items.slice(startIndex, endIndex + 1).map((item, idx) => ({
      item,
      index: startIndex + idx,
      top: (startIndex + idx) * itemHeight,
    }));
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              width: '100%',
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Component Patterns

### Component Test Utilities

Utilities for testing Vietnamese components:

```typescript
// tests/utils/component-test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { VietnameseTestSetup } from './vietnamese-locale-testing';

interface VietnameseRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  authUser?: AuthUser;
}

function VietnameseTestWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    VietnameseTestSetup.createVietnameseTestEnvironment();
  }, []);

  return (
    <div lang="vi-VN">
      {children}
    </div>
  );
}

export function renderWithVietnameseContext(
  ui: React.ReactElement,
  options: VietnameseRenderOptions = {}
) {
  return render(ui, {
    wrapper: VietnameseTestWrapper,
    ...options,
  });
}

export function createMockVietnameseProps<T>(overrides: Partial<T> = {}): T {
  const baseProps = {
    locale: 'vi-VN',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    ...overrides,
  };

  return baseProps as T;
}

// Component-specific test utilities
export const phoneInputTestUtils = {
  getInput: (container: HTMLElement) =>
    container.querySelector('input[type="tel"]') as HTMLInputElement,

  enterPhone: async (input: HTMLInputElement, phone: string) => {
    await userEvent.clear(input);
    await userEvent.type(input, phone);
  },

  expectValidationError: (container: HTMLElement, error: string) => {
    expect(container).toHaveTextContent(error);
  },
};

export const currencyDisplayTestUtils = {
  expectCurrencyFormat: (container: HTMLElement, amount: number) => {
    const formatted = new Intl.NumberFormat('vi-VN').format(amount);
    expect(container).toHaveTextContent(`${formatted} ₫`);
  },

  expectFreeDisplay: (container: HTMLElement) => {
    expect(container).toHaveTextContent('Miễn phí');
  },
};
```

## Best Practices and Guidelines

### Component Design Principles

1. **Single Responsibility**
   - Each component should have one clear purpose
   - Avoid mixing data fetching with presentation logic
   - Separate business logic into custom hooks

2. **Composition over Props Drilling**
   ```typescript
   // ✅ Good: Use composition
   <Card>
     <CardHeader>
       <CustomerInfo customer={customer} />
     </CardHeader>
     <CardContent>
       <RepairHistory customerId={customer.id} />
     </CardContent>
   </Card>

   // ❌ Avoid: Deep prop drilling
   <CustomerCard
     customer={customer}
     showHistory={true}
     historyProps={{ sortBy: 'date', limit: 10 }}
   />
   ```

3. **Vietnamese Context Awareness**
   ```typescript
   // Always consider Vietnamese business context
   interface ComponentProps {
     // Vietnamese-specific props
     locale?: 'vi-VN';
     currency?: 'VND';
     dateFormat?: 'DD/MM/YYYY';

     // Business context
     customerType?: 'individual' | 'business';
     serviceLevel?: 'standard' | 'premium';
   }
   ```

### Performance Guidelines

1. **Memoization Strategies**
   ```typescript
   // Memoize expensive calculations
   const formattedCurrency = useMemo(() =>
     formatVND(amount), [amount]
   );

   // Memoize callback functions
   const handlePhoneChange = useCallback((phone: string) => {
     setCustomer(prev => ({ ...prev, phone }));
   }, []);

   // Memoize entire components when appropriate
   const CustomerRow = memo(({ customer }: { customer: Customer }) => {
     // Component implementation
   });
   ```

2. **Lazy Loading**
   ```typescript
   // Lazy load heavy components
   const ReportChart = lazy(() => import('./ReportChart'));
   const PrintPreview = lazy(() => import('./PrintPreview'));

   // Use with Suspense
   <Suspense fallback={<Skeleton variant="card" />}>
     <ReportChart data={reportData} />
   </Suspense>
   ```

### Accessibility Guidelines

1. **Vietnamese Language Support**
   ```typescript
   // Always set correct language attributes
   <div lang="vi-VN">
     <label htmlFor="phone">Số điện thoại</label>
     <input
       id="phone"
       type="tel"
       aria-describedby="phone-help"
       placeholder="0901 234 567"
     />
     <div id="phone-help">
       Nhập số điện thoại di động 10 chữ số
     </div>
   </div>
   ```

2. **Keyboard Navigation**
   ```typescript
   // Ensure all interactive elements are keyboard accessible
   <button
     onClick={handleSubmit}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         handleSubmit();
       }
     }}
     aria-label="Lưu thông tin khách hàng"
   >
     Lưu
   </button>
   ```

### Error Handling Guidelines

1. **User-Friendly Vietnamese Error Messages**
   ```typescript
   const ERROR_MESSAGES = {
     network: 'Không thể kết nối mạng. Vui lòng kiểm tra kết nối internet.',
     validation: 'Thông tin nhập vào không hợp lệ. Vui lòng kiểm tra lại.',
     permission: 'Bạn không có quyền thực hiện thao tác này.',
     server: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
   };
   ```

2. **Graceful Degradation**
   ```typescript
   function CustomerList({ customers }: { customers: Customer[] }) {
     if (!customers.length) {
       return (
         <div className="text-center py-8">
           <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
           <p>Chưa có khách hàng nào</p>
           <Button variant="outline" className="mt-4">
             Thêm khách hàng đầu tiên
           </Button>
         </div>
       );
     }

     return (
       <DataTable
         data={customers}
         columns={customerColumns}
       />
     );
   }
   ```

This comprehensive guide provides the foundation for building robust, scalable, and culturally appropriate components for the Vietnamese laptop repair shop management system. Always refer to these patterns when developing new features or refactoring existing components.