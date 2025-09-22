# Story 04.1: Parts Catalog Management

## User Story

**As a** shop owner or staff member,
**I want** a comprehensive parts catalog management system với inventory tracking,
**So that** tôi có thể efficiently manage parts inventory, track compatibility, và maintain accurate cost information.

## Story Context

**Simplified Inventory Philosophy:**
- Parts catalog với category organization
- Brand và model compatibility tracking
- Basic stock management (virtual stock for MVP)
- Supplier information management
- Simple pricing structure với cost và sale price

**Business Integration:**
- Integration với repair ticket parts usage
- Inventory alerts cho low stock items
- Supplier management và reorder capabilities
- Cost tracking cho profit analysis

## Acceptance Criteria

### **Parts Catalog CRUD Requirements:**

**AC-PC1: Parts Catalog Creation**
```gherkin
GIVEN staff member có parts management access
WHEN creating new part in catalog
THEN can input complete part information:
  - Part name (required)
  - Category selection (screen, keyboard, battery, memory, storage, motherboard, other)
  - Brand name
  - Part number or SKU
  - Model compatibility (array of compatible laptop models)
  - Supplier information
  - Unit cost (purchase price)
  - Unit price (sale price to customers)
  - Current stock quantity (defaults to 10000 for MVP)
  - Minimum stock threshold
  - Part condition (new, refurbished, used)
AND validation ensures required fields are completed
AND duplicate part detection prevents errors
```

**AC-PC2: Parts Information Display**
```gherkin
GIVEN parts catalog viewing
WHEN parts list is displayed
THEN shows organized part information:
  - Parts grouped by category
  - Search functionality across name, brand, model compatibility
  - Filter by category, brand, condition, stock level
  - Sort by name, price, stock quantity, last updated
  - Part details: name, brand, current stock, unit price
  - Stock level indicators (good, low, out of stock)
  - Last updated timestamp
AND pagination for large inventories
AND export capabilities for inventory reports
```

**AC-PC3: Parts Catalog Editing**
```gherkin
GIVEN existing parts in catalog
WHEN editing part information
THEN allows updates to:
  - All part details except system-generated fields
  - Stock quantity adjustments với reason tracking
  - Price updates với effective date
  - Supplier information changes
  - Compatibility list modifications
  - Part status (active, discontinued, out of stock)
AND edit history is maintained for audit
AND price change history is tracked
AND bulk editing capabilities for similar parts
```

**AC-PC4: Parts Deletion & Deactivation**
```gherkin
GIVEN part removal requirements
WHEN deactivating or deleting parts
THEN provides appropriate options:
  - Soft delete (deactivation) for parts used in existing tickets
  - Hard delete only for unused parts
  - Bulk deactivation for discontinued parts
  - Deactivation reason tracking
  - Impact assessment before deletion (shows affected tickets)
AND referential integrity is maintained
AND deactivated parts are hidden from new ticket creation
AND historical data remains accessible
```

### **Category Management Requirements:**

**AC-CM1: Category Organization**
```gherkin
GIVEN parts categorization needs
WHEN managing categories
THEN provides structured categories:
  - Primary categories: Screen, Keyboard, Battery, Memory, Storage, Motherboard, Other
  - Subcategory support (Screen: LCD, LED, OLED)
  - Category descriptions và typical price ranges
  - Category-specific attributes (Screen: size, resolution)
  - Custom categories for shop-specific needs
AND category hierarchy is intuitive
AND category statistics (part count, total value)
```

**AC-CM2: Category-Based Features**
```gherkin
GIVEN category-specific functionality
WHEN using category features
THEN provides category-appropriate tools:
  - Category-specific search filters
  - Compatibility checking based on category
  - Category-based pricing guidelines
  - Category inventory reports
  - Category-specific low stock alerts
AND category metrics và analytics
AND category-based supplier management
```

### **Compatibility Management Requirements:**

**AC-CMP1: Model Compatibility Tracking**
```gherkin
GIVEN laptop model compatibility requirements
WHEN managing part compatibility
THEN supports comprehensive compatibility:
  - Multiple laptop models per part
  - Brand và model number combinations
  - Compatibility notes (special requirements, limitations)
  - Universal parts (compatible với all models)
  - Partial compatibility (works but với limitations)
AND compatibility search functionality
AND compatibility validation during ticket creation
```

**AC-CMP2: Compatibility Validation**
```gherkin
GIVEN part selection for specific laptop
WHEN checking compatibility
THEN validates compatibility automatically:
  - Shows compatible parts for selected laptop model
  - Warns about incompatible parts
  - Suggests alternative compatible parts
  - Shows compatibility confidence level
  - Allows override với warning acknowledgment
AND compatibility database is maintainable
AND machine learning for compatibility suggestions (future)
```

### **Supplier Management Requirements:**

**AC-SM1: Supplier Information Management**
```gherkin
GIVEN supplier relationship management
WHEN managing supplier data
THEN tracks comprehensive supplier information:
  - Supplier name và contact information
  - Lead times for different parts
  - Payment terms và credit arrangements
  - Quality ratings và performance history
  - Preferred supplier designation
  - Supplier-specific part numbers
AND supplier performance analytics
AND supplier communication log
```

**AC-SM2: Supplier-Part Relationships**
```gherkin
GIVEN supplier-part associations
WHEN managing supplier relationships
THEN supports multiple suppliers per part:
  - Primary và secondary supplier designation
  - Supplier-specific pricing
  - Lead time tracking by supplier
  - Quality ratings per supplier
  - Availability status by supplier
AND supplier comparison tools
AND automatic reorder suggestions
```

### **Pricing Management Requirements:**

**AC-PM1: Cost & Pricing Structure**
```gherkin
GIVEN pricing management needs
WHEN managing part costs và prices
THEN supports comprehensive pricing:
  - Unit cost (what shop pays supplier)
  - Unit price (what shop charges customer)
  - Markup percentage calculation
  - Bulk pricing tiers
  - Special pricing for warranty repairs
  - Labor charges for installation
AND pricing history tracking
AND profit margin analysis
```

**AC-PM2: Price Update Management**
```gherkin
GIVEN price change requirements
WHEN updating prices
THEN handles price changes appropriately:
  - Effective date for price changes
  - Bulk price updates by percentage or amount
  - Price change approval workflow (shop owner)
  - Impact analysis before price changes
  - Customer notification for significant changes
AND price change audit trail
AND automated pricing rules (future)
```

### **Inventory Tracking Requirements:**

**AC-IT1: Stock Level Management**
```gherkin
GIVEN inventory tracking needs
WHEN managing stock levels
THEN provides accurate tracking:
  - Current stock quantity display
  - Stock adjustments với reason codes
  - Stock movement history
  - Minimum threshold alerts
  - Stock valuation (cost basis)
  - Physical count reconciliation
AND stock level accuracy validation
AND inventory variance reporting
```

**AC-IT2: Stock Movement Tracking**
```gherkin
GIVEN stock movement requirements
WHEN tracking inventory changes
THEN logs all stock movements:
  - Usage in repair tickets (automatic deduction)
  - Manual adjustments với reasons
  - Supplier deliveries (stock increases)
  - Damaged or defective parts (write-offs)
  - Returns to supplier
  - Transfer between locations (if applicable)
AND movement audit trail
AND movement pattern analysis
```

### **Search & Filter Requirements:**

**AC-SF1: Advanced Search Functionality**
```gherkin
GIVEN parts search requirements
WHEN searching for parts
THEN provides comprehensive search:
  - Text search across name, brand, part number
  - Category và subcategory filtering
  - Brand filtering với multi-select
  - Price range filtering
  - Stock level filtering (in stock, low stock, out of stock)
  - Compatibility filtering by laptop model
  - Supplier filtering
AND search result relevance ranking
AND saved search capabilities
```

**AC-SF2: Quick Access Features**
```gherkin
GIVEN efficient parts access needs
WHEN using quick access features
THEN provides shortcuts:
  - Recently used parts
  - Frequently used parts
  - Low stock parts alert widget
  - Quick add to ticket functionality
  - Barcode scanning for part lookup (mobile)
  - Favorite parts bookmarking
AND personalized recommendations
AND usage pattern learning
```

### **Reporting & Analytics Requirements:**

**AC-RA1: Inventory Reports**
```gherkin
GIVEN inventory reporting needs
WHEN generating reports
THEN provides comprehensive reports:
  - Current inventory valuation
  - Low stock report với reorder suggestions
  - Parts usage frequency analysis
  - Supplier performance report
  - Price change impact analysis
  - Inventory turnover metrics
AND customizable report parameters
AND automated report scheduling
```

**AC-RA2: Cost Analysis Reports**
```gherkin
GIVEN cost analysis requirements
WHEN analyzing costs
THEN provides financial insights:
  - Parts cost as percentage of repair revenue
  - Most profitable parts analysis
  - Markup percentage analysis by category
  - Supplier cost comparison
  - Inventory holding cost analysis
  - Parts waste và damage tracking
AND profitability optimization recommendations
AND trend analysis capabilities
```

## Technical Implementation Details

### **Parts Model & Schema:**
```typescript
interface Part {
  id: string;
  name: string;
  category: PartCategory;
  subcategory?: string;
  brand?: string;
  part_number?: string;
  model_compatibility: string[];
  supplier_info: {
    primary_supplier: string;
    secondary_suppliers: string[];
    lead_time_days: number;
    supplier_part_number?: string;
  };
  pricing: {
    unit_cost: number;
    unit_price: number;
    markup_percentage: number;
    bulk_pricing?: BulkPricing[];
  };
  inventory: {
    current_stock: number;
    minimum_threshold: number;
    reorder_point: number;
    reorder_quantity: number;
  };
  condition: 'new' | 'refurbished' | 'used';
  status: 'active' | 'discontinued' | 'out_of_stock';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

type PartCategory =
  | 'screen'
  | 'keyboard'
  | 'battery'
  | 'memory'
  | 'storage'
  | 'motherboard'
  | 'cooling'
  | 'other';

interface BulkPricing {
  min_quantity: number;
  unit_price: number;
}
```

### **Parts Management Component:**
```typescript
export function PartsManagement() {
  const [parts, setParts] = useState<Part[]>([]);
  const [filters, setFilters] = useState<PartFilters>({
    category: '',
    brand: '',
    stockLevel: '',
    searchTerm: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  const {
    filteredParts,
    isLoading,
    totalCount,
    pagination,
    setPagination
  } = usePartsListing({ filters, sortConfig });

  const handlePartCreate = async (partData: CreatePartData) => {
    try {
      const newPart = await createPart(partData);
      setParts(prev => [...prev, newPart]);
      toast.success('Đã thêm linh kiện mới');
    } catch (error) {
      toast.error('Không thể thêm linh kiện');
    }
  };

  const handleBulkStockUpdate = async (stockUpdates: StockUpdate[]) => {
    try {
      await Promise.all(
        stockUpdates.map(update => updatePartStock(update.partId, update.quantity, update.reason))
      );
      toast.success(`Đã cập nhật tồn kho cho ${stockUpdates.length} linh kiện`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật tồn kho');
    }
  };

  return (
    <div className="parts-management">
      <div className="parts-header">
        <h1>Quản lý linh kiện</h1>
        <div className="header-actions">
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm linh kiện
          </Button>
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import danh sách
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <PartsFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        categories={PART_CATEGORIES}
        brands={AVAILABLE_BRANDS}
      />

      {/* Quick Stats */}
      <PartsStatsWidget
        totalParts={totalCount}
        lowStockCount={parts.filter(p => p.inventory.current_stock <= p.inventory.minimum_threshold).length}
        totalValue={parts.reduce((sum, p) => sum + (p.inventory.current_stock * p.pricing.unit_cost), 0)}
        categoriesCount={new Set(parts.map(p => p.category)).size}
      />

      {/* Bulk Actions */}
      {selectedParts.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedParts.length}
          onBulkStockUpdate={handleBulkStockUpdate}
          onBulkPriceUpdate={handleBulkPriceUpdate}
          onBulkDeactivate={handleBulkDeactivate}
          onClearSelection={() => setSelectedParts([])}
        />
      )}

      {/* Parts Table */}
      <PartsTable
        parts={filteredParts}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        selectedParts={selectedParts}
        onSelectionChange={setSelectedParts}
        onPartEdit={handlePartEdit}
        onStockAdjust={handleStockAdjust}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        current={pagination.page}
        total={totalCount}
        pageSize={pagination.pageSize}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      {/* Modals */}
      <PartCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handlePartCreate}
      />

      <PartEditModal
        isOpen={editModalOpen}
        part={editingPart}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handlePartUpdate}
      />
    </div>
  );
}
```

### **Parts Search & Filter Hook:**
```typescript
export function usePartsListing({ filters, sortConfig }: UsePartsListingParams) {
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const fetchParts = async () => {
      setIsLoading(true);
      try {
        const query = supabase
          .from('parts')
          .select('*', { count: 'exact' });

        // Apply filters
        if (debouncedFilters.searchTerm) {
          query.or(`name.ilike.%${debouncedFilters.searchTerm}%,brand.ilike.%${debouncedFilters.searchTerm}%,part_number.ilike.%${debouncedFilters.searchTerm}%`);
        }

        if (debouncedFilters.category) {
          query.eq('category', debouncedFilters.category);
        }

        if (debouncedFilters.brand) {
          query.eq('brand', debouncedFilters.brand);
        }

        if (debouncedFilters.stockLevel) {
          switch (debouncedFilters.stockLevel) {
            case 'in_stock':
              query.gt('current_stock', 0);
              break;
            case 'low_stock':
              query.lte('current_stock', query.select('minimum_threshold'));
              break;
            case 'out_of_stock':
              query.eq('current_stock', 0);
              break;
          }
        }

        // Apply sorting
        query.order(sortConfig.field, { ascending: sortConfig.direction === 'asc' });

        // Apply pagination
        query.range(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize - 1
        );

        const { data, error, count } = await query;

        if (error) throw error;

        setParts(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Failed to fetch parts:', error);
        toast.error('Không thể tải danh sách linh kiện');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, [debouncedFilters, sortConfig, pagination]);

  return {
    parts,
    isLoading,
    totalCount,
    pagination,
    setPagination
  };
}
```

### **Automated Testing Scenarios:**

**Test Suite: Parts Catalog Management**
```typescript
describe('Parts Catalog Management', () => {
  test('AC-PC1: Parts catalog creation', async () => {
    const { getByLabelText, getByRole } = render(<PartCreateModal isOpen={true} />);

    // Fill in part information
    fireEvent.change(getByLabelText('Tên linh kiện'), {
      target: { value: 'Màn hình laptop 15.6 inch' }
    });
    fireEvent.change(getByLabelText('Danh mục'), {
      target: { value: 'screen' }
    });
    fireEvent.change(getByLabelText('Thương hiệu'), {
      target: { value: 'Samsung' }
    });
    fireEvent.change(getByLabelText('Giá nhập'), {
      target: { value: '1500000' }
    });
    fireEvent.change(getByLabelText('Giá bán'), {
      target: { value: '2000000' }
    });

    fireEvent.click(getByRole('button', { name: 'Thêm linh kiện' }));

    await waitFor(() => {
      expect(mockCreatePart).toHaveBeenCalledWith({
        name: 'Màn hình laptop 15.6 inch',
        category: 'screen',
        brand: 'Samsung',
        pricing: {
          unit_cost: 1500000,
          unit_price: 2000000,
          markup_percentage: 33.33
        }
      });
    });
  });

  test('AC-PC2: Parts information display', async () => {
    const mockParts = [
      {
        id: 'part-1',
        name: 'Màn hình Dell 15.6"',
        category: 'screen',
        brand: 'Dell',
        inventory: { current_stock: 5, minimum_threshold: 2 },
        pricing: { unit_price: 2000000 }
      },
      {
        id: 'part-2',
        name: 'Bàn phím HP',
        category: 'keyboard',
        brand: 'HP',
        inventory: { current_stock: 1, minimum_threshold: 3 },
        pricing: { unit_price: 500000 }
      }
    ];

    mockFetchParts.mockResolvedValue(mockParts);

    render(<PartsManagement />);

    await waitFor(() => {
      expect(screen.getByText('Màn hình Dell 15.6"')).toBeInTheDocument();
      expect(screen.getByText('Bàn phím HP')).toBeInTheDocument();
    });

    // Check stock indicators
    expect(screen.getByText('5')).toBeInTheDocument(); // Good stock
    expect(screen.getByText('1')).toHaveClass('low-stock'); // Low stock indicator
  });

  test('AC-SF1: Advanced search functionality', async () => {
    render(<PartsManagement />);

    // Test text search
    const searchInput = screen.getByPlaceholderText('Tìm kiếm linh kiện...');
    fireEvent.change(searchInput, { target: { value: 'màn hình' } });

    // Test category filter
    const categoryFilter = screen.getByLabelText('Danh mục');
    fireEvent.change(categoryFilter, { target: { value: 'screen' } });

    // Test brand filter
    const brandFilter = screen.getByLabelText('Thương hiệu');
    fireEvent.change(brandFilter, { target: { value: 'Dell' } });

    await waitFor(() => {
      expect(mockFetchParts).toHaveBeenCalledWith({
        searchTerm: 'màn hình',
        category: 'screen',
        brand: 'Dell'
      });
    });
  });

  test('AC-CMP1: Model compatibility tracking', async () => {
    render(<PartEditModal part={mockPart} isOpen={true} />);

    const compatibilityInput = screen.getByLabelText('Tương thích với');
    fireEvent.change(compatibilityInput, {
      target: { value: 'Dell Inspiron 15, HP Pavilion 15, Lenovo IdeaPad 3' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      expect(mockUpdatePart).toHaveBeenCalledWith(
        expect.objectContaining({
          model_compatibility: ['Dell Inspiron 15', 'HP Pavilion 15', 'Lenovo IdeaPad 3']
        })
      );
    });
  });

  test('AC-IT1: Stock level management', async () => {
    render(<PartsManagement />);

    // Find stock adjustment button
    const adjustButton = screen.getByRole('button', { name: 'Điều chỉnh tồn kho' });
    fireEvent.click(adjustButton);

    // Stock adjustment modal
    const quantityInput = screen.getByLabelText('Số lượng điều chỉnh');
    fireEvent.change(quantityInput, { target: { value: '10' } });

    const reasonSelect = screen.getByLabelText('Lý do điều chỉnh');
    fireEvent.change(reasonSelect, { target: { value: 'stock_receipt' } });

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));

    await waitFor(() => {
      expect(mockUpdatePartStock).toHaveBeenCalledWith('part-1', 10, 'stock_receipt');
    });
  });

  test('AC-PM1: Cost & pricing structure', async () => {
    const mockPart = {
      name: 'Test Part',
      pricing: {
        unit_cost: 1000000,
        unit_price: 1500000,
        markup_percentage: 50
      }
    };

    render(<PartEditModal part={mockPart} isOpen={true} />);

    // Check markup calculation
    expect(screen.getByDisplayValue('50%')).toBeInTheDocument();

    // Update cost and check auto-calculation
    const costInput = screen.getByLabelText('Giá nhập');
    fireEvent.change(costInput, { target: { value: '1200000' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('25%')).toBeInTheDocument(); // Markup recalculated
    });
  });

  test('AC-RA1: Inventory reports generation', async () => {
    render(<InventoryReports />);

    // Generate low stock report
    fireEvent.click(screen.getByText('Báo cáo tồn kho thấp'));

    await waitFor(() => {
      expect(mockGenerateReport).toHaveBeenCalledWith('low_stock');
    });

    // Check report content
    expect(screen.getByText('Danh sách linh kiện tồn kho thấp')).toBeInTheDocument();
    expect(screen.getByText('Gợi ý đặt hàng')).toBeInTheDocument();
  });

  test('AC-IT2: Stock movement tracking', async () => {
    const mockMovements = [
      {
        id: 'mv-1',
        type: 'usage',
        quantity: -2,
        reason: 'Used in repair ticket LRP-2025-000001',
        timestamp: '2025-01-22T10:00:00Z'
      },
      {
        id: 'mv-2',
        type: 'receipt',
        quantity: 10,
        reason: 'Supplier delivery',
        timestamp: '2025-01-21T14:00:00Z'
      }
    ];

    render(<StockMovementHistory partId="part-1" />);

    await waitFor(() => {
      expect(screen.getByText('Used in repair ticket LRP-2025-000001')).toBeInTheDocument();
      expect(screen.getByText('Supplier delivery')).toBeInTheDocument();
      expect(screen.getByText('-2')).toHaveClass('quantity-decrease');
      expect(screen.getByText('+10')).toHaveClass('quantity-increase');
    });
  });
});
```

### **Database Schema Extensions:**
```sql
-- Parts catalog table
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category part_category NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  part_number VARCHAR(100),
  model_compatibility TEXT[],
  supplier_info JSONB,
  pricing JSONB NOT NULL,
  inventory JSONB NOT NULL,
  condition part_condition DEFAULT 'new',
  status part_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Part categories enum
CREATE TYPE part_category AS ENUM (
  'screen', 'keyboard', 'battery', 'memory', 'storage',
  'motherboard', 'cooling', 'other'
);

-- Part conditions enum
CREATE TYPE part_condition AS ENUM ('new', 'refurbished', 'used');

-- Part status enum
CREATE TYPE part_status AS ENUM ('active', 'discontinued', 'out_of_stock');

-- Stock movements tracking
CREATE TABLE part_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  movement_type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  ticket_id UUID REFERENCES repair_tickets(id),
  moved_by UUID REFERENCES user_profiles(id),
  moved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE movement_type AS ENUM (
  'usage', 'receipt', 'adjustment', 'return', 'damage', 'transfer'
);

-- Indexes for performance
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_brand ON parts(brand);
CREATE INDEX idx_parts_search ON parts USING gin(to_tsvector('vietnamese', name || ' ' || COALESCE(brand, '')));
CREATE INDEX idx_stock_movements_part ON part_stock_movements(part_id, moved_at);
```

## Definition of Done

- [ ] **AC-PC1:** Parts catalog creation functional
- [ ] **AC-PC2:** Parts information display complete
- [ ] **AC-PC3:** Parts catalog editing working
- [ ] **AC-PC4:** Parts deletion & deactivation implemented
- [ ] **AC-CM1:** Category organization functional
- [ ] **AC-CM2:** Category-based features working
- [ ] **AC-CMP1:** Model compatibility tracking implemented
- [ ] **AC-CMP2:** Compatibility validation functional
- [ ] **AC-SM1:** Supplier information management complete
- [ ] **AC-SM2:** Supplier-part relationships working
- [ ] **AC-PM1:** Cost & pricing structure implemented
- [ ] **AC-PM2:** Price update management functional
- [ ] **AC-IT1:** Stock level management working
- [ ] **AC-IT2:** Stock movement tracking implemented
- [ ] **AC-SF1:** Advanced search functionality complete
- [ ] **AC-SF2:** Quick access features working
- [ ] **AC-RA1:** Inventory reports functional
- [ ] **AC-RA2:** Cost analysis reports implemented
- [ ] **Unit Tests:** All CRUD operations tested
- [ ] **Integration Tests:** Parts usage in tickets verified
- [ ] **Performance Tests:** Large inventory handling validated
- [ ] **Data Migration:** Import/export capabilities tested

## Risk Mitigation

- **Primary Risk:** Inventory data inconsistency affecting repair operations
- **Mitigation:** Comprehensive validation, audit trails, backup procedures
- **Rollback Plan:** Stock movement reversal capabilities, data restore procedures

## Story Dependencies

- **Prerequisites:** Epic 01 complete (database schema, authentication)
- **Enables:** Story 04.2 (Parts Usage in Repair Tickets)
- **Estimated Effort:** 4-5 days
- **Priority:** High (foundation for inventory management)