# Story 04.2: Parts Usage in Repair Tickets

## User Story

**As a** repair technician,
**I want** to easily add và manage parts used in repair tickets với automatic cost calculation,
**So that** tôi có thể accurately track parts usage, calculate total repair costs, và maintain inventory records.

## Story Context

**Parts Integration Philosophy:**
- Seamless integration với repair ticket workflow
- JSONB-based parts usage storage (simplified approach)
- Real-time cost calculation và total update
- Inventory impact tracking và alerts
- Integration với parts catalog management

**Business Workflow Integration:**
- Parts selection during ticket creation hoặc updates
- Automatic cost calculation including labor
- Inventory deduction tracking (virtual for MVP)
- Parts usage history và analytics
- Integration với warranty và customer communications

## Acceptance Criteria

### **Parts Selection & Addition Requirements:**

**AC-PSA1: Parts Catalog Integration**
```gherkin
GIVEN repair ticket editing interface
WHEN adding parts to ticket
THEN provides integrated parts selection:
  - Searchable parts catalog modal
  - Filter by category, brand, compatibility
  - Display parts với current stock levels
  - Show parts pricing và availability
  - Search by part name, brand, or part number
  - Recently used parts quick access
  - Favorite parts shortcuts
AND parts are filtered by laptop model compatibility if specified
AND out-of-stock parts are shown với warnings
```

**AC-PSA2: Parts Addition Interface**
```gherkin
GIVEN parts selection for ticket
WHEN adding parts to repair
THEN provides intuitive interface:
  - Quantity selector với validation
  - Unit price display và editing capability
  - Total cost calculation per part
  - Installation notes field
  - Warranty period selection
  - Condition specification (new, refurbished, used)
AND validation prevents negative quantities
AND alerts for insufficient stock levels
AND bulk parts addition capability
```

**AC-PSA3: Parts Usage Display**
```gherkin
GIVEN ticket với parts usage
WHEN viewing parts list
THEN displays comprehensive information:
  - Part name và brand
  - Quantity used
  - Unit price và total cost
  - Installation date và technician
  - Warranty period
  - Part condition
  - Supplier information (if needed)
AND parts usage timeline tracking
AND parts removal/modification capabilities
```

### **Cost Calculation Requirements:**

**AC-CC1: Automatic Cost Calculation**
```gherkin
GIVEN parts usage in ticket
WHEN calculating ticket costs
THEN automatically calculates:
  - Parts subtotal (sum of all parts costs)
  - Labor cost (manual entry or calculated)
  - Total repair cost (parts + labor)
  - Cost breakdown transparency
  - Tax calculations (if applicable)
  - Discount applications
AND calculations update in real-time
AND cost history maintained for changes
```

**AC-CC2: Dynamic Pricing Updates**
```gherkin
GIVEN parts usage và pricing changes
WHEN part prices are updated
THEN handles pricing appropriately:
  - Uses price at time of usage (locked pricing)
  - Option to update to current pricing
  - Price change impact notification
  - Bulk price update capabilities
  - Customer approval for significant changes
AND pricing audit trail maintained
AND profit margin calculations
```

**AC-CC3: Cost Override Capabilities**
```gherkin
GIVEN special pricing scenarios
WHEN cost adjustments are needed
THEN allows authorized overrides:
  - Manual price adjustment với reason
  - Warranty repair pricing (reduced/free)
  - Special customer pricing
  - Bulk discount applications
  - Manager approval for significant changes
AND override justification required
AND approval workflow compliance
```

### **Inventory Impact Requirements:**

**AC-II1: Stock Level Updates**
```gherkin
GIVEN parts usage in tickets
WHEN parts are consumed
THEN updates inventory accordingly:
  - Virtual stock deduction for MVP
  - Stock movement logging
  - Low stock alerts triggered
  - Reorder point notifications
  - Stock availability validation
AND stock movement audit trail
AND reservation system for pending repairs
```

**AC-II2: Inventory Conflict Handling**
```gherkin
GIVEN inventory conflicts
WHEN stock levels are insufficient
THEN provides conflict resolution:
  - Insufficient stock warnings
  - Alternative parts suggestions
  - Backorder capabilities
  - Partial shipment handling
  - Customer notification options
AND inventory allocation priorities
AND emergency stock procedures
```

**AC-II3: Parts Reversal & Returns**
```gherkin
GIVEN parts return scenarios
WHEN parts need to be returned to inventory
THEN supports return process:
  - Parts removal from tickets
  - Inventory quantity restoration
  - Return reason documentation
  - Condition assessment upon return
  - Restocking fee applications
AND return authorization workflow
AND damaged parts write-off procedures
```

### **Workflow Integration Requirements:**

**AC-WI1: Ticket Status Integration**
```gherkin
GIVEN parts usage và ticket workflow
WHEN ticket status changes
THEN integrates appropriately:
  - Parts selection available during repair planning
  - Parts locked during active repair
  - Parts finalization during completion
  - Parts modification restrictions by status
  - Parts approval workflow integration
AND status-dependent parts operations
AND workflow compliance validation
```

**AC-WI2: Real-time Collaboration**
```gherkin
GIVEN multiple technicians working
WHEN parts are modified
THEN supports collaborative updates:
  - Real-time parts list updates
  - Concurrent editing conflict resolution
  - Parts reservation during selection
  - Team notification of changes
  - Parts allocation coordination
AND collaborative inventory management
AND team communication integration
```

### **Validation & Business Rules Requirements:**

**AC-VBR1: Parts Usage Validation**
```gherkin
GIVEN parts usage business rules
WHEN validating parts operations
THEN enforces appropriate rules:
  - Minimum/maximum quantity limits
  - Compatible parts only for device model
  - Required parts for specific repair types
  - Parts combination validation
  - Quality control requirements
AND business rule configuration
AND exception handling procedures
```

**AC-VBR2: Cost Validation Rules**
```gherkin
GIVEN cost validation requirements
WHEN calculating costs
THEN validates cost parameters:
  - Maximum cost thresholds
  - Unusual markup detection
  - Cost vs estimate variance alerts
  - Minimum profit margin warnings
  - Customer budget compliance
AND cost approval workflows
AND variance explanation requirements
```

### **Analytics & Reporting Requirements:**

**AC-AR1: Parts Usage Analytics**
```gherkin
GIVEN parts usage data
WHEN generating analytics
THEN provides insights:
  - Most frequently used parts
  - Parts usage trends by time period
  - Cost analysis by part category
  - Technician parts usage patterns
  - Customer parts preferences
AND usage forecasting capabilities
AND inventory optimization recommendations
```

**AC-AR2: Cost Analysis Reporting**
```gherkin
GIVEN cost analysis requirements
WHEN generating reports
THEN provides financial insights:
  - Parts cost percentage of total revenue
  - Markup analysis by category
  - Most profitable parts identification
  - Cost variance analysis
  - Supplier cost impact analysis
AND profitability optimization suggestions
AND cost trend predictions
```

### **Mobile & Accessibility Requirements:**

**AC-MA1: Mobile Parts Selection**
```gherkin
GIVEN mobile device usage
WHEN selecting parts
THEN provides mobile-optimized interface:
  - Touch-friendly parts catalog browsing
  - Barcode scanning for part identification
  - Voice input for quantities
  - Swipe gestures for navigation
  - Offline parts catalog access
AND mobile-specific UI optimizations
AND mobile performance optimization
```

**AC-MA2: Accessibility Features**
```gherkin
GIVEN accessibility requirements
WHEN using parts interface
THEN supports accessibility:
  - Screen reader compatibility
  - Keyboard navigation support
  - High contrast mode support
  - Font size adjustment
  - Voice control integration
AND WCAG 2.1 compliance
AND accessibility testing validation
```

## Technical Implementation Details

### **Parts Usage Component:**
```typescript
interface PartUsage {
  part_id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  installation_date?: string;
  warranty_months: number;
  condition: 'new' | 'refurbished' | 'used';
  notes?: string;
  installed_by?: string;
}

export function PartsUsageSection({ ticket, onPartsUpdate }: PartsUsageSectionProps) {
  const [partsUsed, setPartsUsed] = useState<PartUsage[]>(ticket.parts_used || []);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const totalPartsCost = useMemo(() => {
    return partsUsed.reduce((sum, part) => sum + part.total_cost, 0);
  }, [partsUsed]);

  const handleAddPart = async (partData: AddPartData) => {
    try {
      const newPartUsage: PartUsage = {
        part_id: partData.part_id,
        name: partData.name,
        brand: partData.brand,
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        total_cost: partData.quantity * partData.unit_price,
        warranty_months: partData.warranty_months || 0,
        condition: partData.condition,
        notes: partData.notes,
        installation_date: new Date().toISOString(),
        installed_by: currentUser.id
      };

      const updatedParts = [...partsUsed, newPartUsage];
      setPartsUsed(updatedParts);

      // Update ticket với new parts usage
      await onPartsUpdate(updatedParts);

      // Log stock movement
      await logStockMovement({
        part_id: partData.part_id,
        quantity: -partData.quantity,
        movement_type: 'usage',
        ticket_id: ticket.id,
        reason: `Used in repair ticket ${ticket.ticket_code}`
      });

      toast.success('Đã thêm linh kiện vào phiếu sửa chữa');
      setIsAddingPart(false);

    } catch (error) {
      toast.error('Không thể thêm linh kiện');
    }
  };

  const handleRemovePart = async (partIndex: number) => {
    const partToRemove = partsUsed[partIndex];

    try {
      const updatedParts = partsUsed.filter((_, index) => index !== partIndex);
      setPartsUsed(updatedParts);
      await onPartsUpdate(updatedParts);

      // Restore stock
      await logStockMovement({
        part_id: partToRemove.part_id,
        quantity: partToRemove.quantity,
        movement_type: 'return',
        ticket_id: ticket.id,
        reason: `Returned from repair ticket ${ticket.ticket_code}`
      });

      toast.success('Đã xóa linh kiện khỏi phiếu sửa chữa');

    } catch (error) {
      toast.error('Không thể xóa linh kiện');
    }
  };

  const handleUpdatePartQuantity = async (partIndex: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedParts = [...partsUsed];
    const oldQuantity = updatedParts[partIndex].quantity;
    updatedParts[partIndex].quantity = newQuantity;
    updatedParts[partIndex].total_cost = newQuantity * updatedParts[partIndex].unit_price;

    setPartsUsed(updatedParts);
    await onPartsUpdate(updatedParts);

    // Log quantity change
    const quantityDiff = newQuantity - oldQuantity;
    if (quantityDiff !== 0) {
      await logStockMovement({
        part_id: updatedParts[partIndex].part_id,
        quantity: -quantityDiff,
        movement_type: 'adjustment',
        ticket_id: ticket.id,
        reason: `Quantity adjusted in ticket ${ticket.ticket_code}`
      });
    }
  };

  return (
    <Card className="parts-usage-section">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Linh kiện sử dụng
          <div className="parts-summary">
            <span className="parts-count">{partsUsed.length} linh kiện</span>
            <span className="parts-cost">{formatVNDPrice(totalPartsCost)}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Parts List */}
        {partsUsed.length > 0 ? (
          <div className="parts-list">
            {partsUsed.map((part, index) => (
              <PartUsageItem
                key={`${part.part_id}-${index}`}
                part={part}
                onQuantityChange={(newQuantity) => handleUpdatePartQuantity(index, newQuantity)}
                onRemove={() => handleRemovePart(index)}
                canEdit={!ticket.is_completed}
              />
            ))}
          </div>
        ) : (
          <div className="no-parts-message">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p>Chưa có linh kiện nào được sử dụng</p>
          </div>
        )}

        {/* Add Part Button */}
        {!ticket.is_completed && (
          <div className="add-part-section">
            <Button
              onClick={() => setIsAddingPart(true)}
              variant="outline"
              className="add-part-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm linh kiện
            </Button>
          </div>
        )}

        {/* Cost Summary */}
        <div className="cost-summary">
          <div className="cost-line">
            <span>Tổng chi phí linh kiện:</span>
            <span className="cost-amount">{formatVNDPrice(totalPartsCost)}</span>
          </div>
          {ticket.labor_cost && (
            <div className="cost-line">
              <span>Chi phí nhân công:</span>
              <span className="cost-amount">{formatVNDPrice(ticket.labor_cost)}</span>
            </div>
          )}
          <div className="cost-line total-cost">
            <span>Tổng cộng:</span>
            <span className="cost-amount">{formatVNDPrice(totalPartsCost + (ticket.labor_cost || 0))}</span>
          </div>
        </div>
      </CardContent>

      {/* Parts Selection Modal */}
      <PartsSelectionModal
        isOpen={isAddingPart}
        onClose={() => setIsAddingPart(false)}
        onSelectPart={handleAddPart}
        compatibleModels={ticket.device_model ? [ticket.device_model] : []}
      />
    </Card>
  );
}
```

### **Parts Selection Modal:**
```typescript
export function PartsSelectionModal({
  isOpen,
  onClose,
  onSelectPart,
  compatibleModels = []
}: PartsSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  const { parts, isLoading } = usePartsSearch({
    searchTerm,
    category: selectedCategory,
    compatibleModels,
    inStockOnly: true
  });

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
    setCustomPrice(part.pricing.unit_price);
  };

  const handleAddPart = () => {
    if (!selectedPart || quantity <= 0) return;

    onSelectPart({
      part_id: selectedPart.id,
      name: selectedPart.name,
      brand: selectedPart.brand,
      quantity,
      unit_price: customPrice || selectedPart.pricing.unit_price,
      warranty_months: selectedPart.warranty_months || 0,
      condition: selectedPart.condition,
      notes: ''
    });

    // Reset form
    setSelectedPart(null);
    setQuantity(1);
    setCustomPrice(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="parts-selection-modal max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chọn linh kiện</DialogTitle>
        </DialogHeader>

        <div className="parts-selection-content">
          {/* Search và Filters */}
          <div className="search-filters">
            <div className="search-input">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Tìm kiếm linh kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả danh mục</SelectItem>
                <SelectItem value="screen">Màn hình</SelectItem>
                <SelectItem value="keyboard">Bàn phím</SelectItem>
                <SelectItem value="battery">Pin</SelectItem>
                <SelectItem value="memory">RAM</SelectItem>
                <SelectItem value="storage">Ổ cứng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="modal-body">
            {/* Parts List */}
            <div className="parts-list">
              {isLoading ? (
                <PartsListSkeleton />
              ) : (
                <div className="parts-grid">
                  {parts.map(part => (
                    <PartSelectionCard
                      key={part.id}
                      part={part}
                      isSelected={selectedPart?.id === part.id}
                      onClick={() => handlePartSelect(part)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Selection Details */}
            {selectedPart && (
              <div className="selection-details">
                <h3>Chi tiết linh kiện</h3>
                <div className="part-info">
                  <h4>{selectedPart.name}</h4>
                  <p>Thương hiệu: {selectedPart.brand}</p>
                  <p>Tồn kho: {selectedPart.inventory.current_stock}</p>
                  <p>Giá: {formatVNDPrice(selectedPart.pricing.unit_price)}</p>
                </div>

                <div className="quantity-price">
                  <div className="quantity-input">
                    <Label htmlFor="quantity">Số lượng</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedPart.inventory.current_stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="price-input">
                    <Label htmlFor="price">Giá đơn vị</Label>
                    <Input
                      id="price"
                      type="number"
                      value={customPrice || ''}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || null)}
                      placeholder={selectedPart.pricing.unit_price.toString()}
                    />
                  </div>
                </div>

                <div className="total-cost">
                  <strong>
                    Tổng: {formatVNDPrice((customPrice || selectedPart.pricing.unit_price) * quantity)}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleAddPart}
            disabled={!selectedPart || quantity <= 0}
          >
            Thêm vào phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Parts Usage in Repair Tickets**
```typescript
describe('Parts Usage in Repair Tickets', () => {
  test('AC-PSA1: Parts catalog integration', async () => {
    const mockParts = [
      {
        id: 'part-1',
        name: 'Màn hình Dell 15.6"',
        category: 'screen',
        brand: 'Dell',
        inventory: { current_stock: 5 },
        pricing: { unit_price: 2000000 },
        model_compatibility: ['Dell Inspiron 15']
      }
    ];

    mockPartsSearch.mockResolvedValue(mockParts);

    render(<PartsUsageSection ticket={mockTicket} onPartsUpdate={jest.fn()} />);

    fireEvent.click(screen.getByText('Thêm linh kiện'));

    await waitFor(() => {
      expect(screen.getByText('Chọn linh kiện')).toBeInTheDocument();
      expect(screen.getByText('Màn hình Dell 15.6"')).toBeInTheDocument();
    });
  });

  test('AC-CC1: Automatic cost calculation', async () => {
    const mockTicket = {
      id: 'ticket-1',
      parts_used: [
        { name: 'RAM 8GB', quantity: 1, unit_price: 800000, total_cost: 800000 },
        { name: 'SSD 256GB', quantity: 1, unit_price: 1200000, total_cost: 1200000 }
      ],
      labor_cost: 500000
    };

    render(<PartsUsageSection ticket={mockTicket} onPartsUpdate={jest.fn()} />);

    // Check parts subtotal
    expect(screen.getByText('2,000,000 ₫')).toBeInTheDocument(); // Parts total

    // Check total cost
    expect(screen.getByText('2,500,000 ₫')).toBeInTheDocument(); // Total with labor
  });

  test('AC-PSA2: Parts addition interface', async () => {
    render(<PartsSelectionModal isOpen={true} onSelectPart={jest.fn()} />);

    // Select a part
    fireEvent.click(screen.getByText('Màn hình Dell 15.6"'));

    // Adjust quantity
    const quantityInput = screen.getByLabelText('Số lượng');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    // Check total calculation
    expect(screen.getByText('4,000,000 ₫')).toBeInTheDocument();

    // Add part
    fireEvent.click(screen.getByText('Thêm vào phiếu'));

    expect(mockOnSelectPart).toHaveBeenCalledWith({
      part_id: 'part-1',
      name: 'Màn hình Dell 15.6"',
      quantity: 2,
      unit_price: 2000000
    });
  });

  test('AC-II1: Stock level updates', async () => {
    const onPartsUpdate = jest.fn();
    render(<PartsUsageSection ticket={mockTicket} onPartsUpdate={onPartsUpdate} />);

    // Add part
    fireEvent.click(screen.getByText('Thêm linh kiện'));

    // Select part and add
    fireEvent.click(screen.getByText('RAM 8GB'));
    fireEvent.click(screen.getByText('Thêm vào phiếu'));

    await waitFor(() => {
      expect(mockLogStockMovement).toHaveBeenCalledWith({
        part_id: 'part-1',
        quantity: -1,
        movement_type: 'usage',
        ticket_id: 'ticket-1',
        reason: expect.stringContaining('Used in repair ticket')
      });
    });
  });

  test('AC-II3: Parts reversal & returns', async () => {
    const mockTicketWithParts = {
      ...mockTicket,
      parts_used: [
        { part_id: 'part-1', name: 'RAM 8GB', quantity: 1, unit_price: 800000 }
      ]
    };

    const onPartsUpdate = jest.fn();
    render(<PartsUsageSection ticket={mockTicketWithParts} onPartsUpdate={onPartsUpdate} />);

    // Remove part
    fireEvent.click(screen.getByRole('button', { name: /xóa/i }));

    await waitFor(() => {
      expect(mockLogStockMovement).toHaveBeenCalledWith({
        part_id: 'part-1',
        quantity: 1,
        movement_type: 'return',
        ticket_id: 'ticket-1',
        reason: expect.stringContaining('Returned from repair ticket')
      });
    });
  });

  test('AC-VBR1: Parts usage validation', async () => {
    render(<PartsSelectionModal isOpen={true} onSelectPart={jest.fn()} />);

    const quantityInput = screen.getByLabelText('Số lượng');

    // Test negative quantity
    fireEvent.change(quantityInput, { target: { value: '-1' } });
    fireEvent.click(screen.getByText('Thêm vào phiếu'));

    expect(screen.getByText(/số lượng phải lớn hơn 0/i)).toBeInTheDocument();

    // Test quantity exceeding stock
    fireEvent.change(quantityInput, { target: { value: '100' } });

    expect(screen.getByText(/vượt quá tồn kho/i)).toBeInTheDocument();
  });

  test('AC-AR1: Parts usage analytics', async () => {
    const mockAnalytics = {
      mostUsedParts: [
        { name: 'RAM 8GB', usage_count: 15 },
        { name: 'SSD 256GB', usage_count: 12 }
      ],
      costByCategory: {
        memory: 12000000,
        storage: 8000000
      }
    };

    render(<PartsUsageAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Linh kiện sử dụng nhiều nhất')).toBeInTheDocument();
      expect(screen.getByText('RAM 8GB')).toBeInTheDocument();
      expect(screen.getByText('15 lần')).toBeInTheDocument();
    });
  });

  test('AC-MA1: Mobile parts selection', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    const { container } = render(<PartsSelectionModal isOpen={true} />);

    expect(container.firstChild).toHaveClass('mobile-optimized');

    // Test touch-friendly interface
    const partCards = container.querySelectorAll('.part-selection-card');
    partCards.forEach(card => {
      expect(card).toHaveClass('touch-friendly');
    });
  });

  test('AC-WI1: Ticket status integration', async () => {
    const completedTicket = { ...mockTicket, status: 'completed', is_completed: true };

    render(<PartsUsageSection ticket={completedTicket} onPartsUpdate={jest.fn()} />);

    // Should not show add part button for completed tickets
    expect(screen.queryByText('Thêm linh kiện')).not.toBeInTheDocument();

    // Parts should not be editable
    const removeButtons = screen.queryAllByRole('button', { name: /xóa/i });
    expect(removeButtons).toHaveLength(0);
  });
});
```

### **Stock Movement Logging:**
```typescript
export async function logStockMovement({
  part_id,
  quantity,
  movement_type,
  ticket_id,
  reason,
  moved_by
}: StockMovementData) {
  try {
    // Log the movement
    const { error: movementError } = await supabase
      .from('part_stock_movements')
      .insert({
        part_id,
        movement_type,
        quantity,
        reason,
        ticket_id,
        moved_by: moved_by || getCurrentUserId()
      });

    if (movementError) throw movementError;

    // Update part stock (for actual inventory tracking)
    if (movement_type === 'usage' || movement_type === 'adjustment') {
      const { error: stockError } = await supabase
        .rpc('update_part_stock', {
          part_id,
          quantity_change: quantity
        });

      if (stockError) throw stockError;
    }

    // Check for low stock alerts
    await checkLowStockAlert(part_id);

  } catch (error) {
    console.error('Failed to log stock movement:', error);
    throw error;
  }
}

// Database function for atomic stock updates
```

```sql
CREATE OR REPLACE FUNCTION update_part_stock(
  part_id UUID,
  quantity_change INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE parts
  SET
    current_stock = current_stock + quantity_change,
    updated_at = NOW()
  WHERE id = part_id;

  -- Check for negative stock
  IF (SELECT current_stock FROM parts WHERE id = part_id) < 0 THEN
    RAISE EXCEPTION 'Stock cannot be negative for part %', part_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Definition of Done

- [ ] **AC-PSA1:** Parts catalog integration functional
- [ ] **AC-PSA2:** Parts addition interface complete
- [ ] **AC-PSA3:** Parts usage display implemented
- [ ] **AC-CC1:** Automatic cost calculation working
- [ ] **AC-CC2:** Dynamic pricing updates functional
- [ ] **AC-CC3:** Cost override capabilities implemented
- [ ] **AC-II1:** Stock level updates working
- [ ] **AC-II2:** Inventory conflict handling functional
- [ ] **AC-II3:** Parts reversal & returns implemented
- [ ] **AC-WI1:** Ticket status integration working
- [ ] **AC-WI2:** Real-time collaboration functional
- [ ] **AC-VBR1:** Parts usage validation implemented
- [ ] **AC-VBR2:** Cost validation rules working
- [ ] **AC-AR1:** Parts usage analytics functional
- [ ] **AC-AR2:** Cost analysis reporting implemented
- [ ] **AC-MA1:** Mobile parts selection optimized
- [ ] **AC-MA2:** Accessibility features working
- [ ] **Integration Tests:** Parts và tickets integration verified
- [ ] **Performance Tests:** Large parts catalogs handling validated
- [ ] **Business Logic Tests:** Cost calculations và inventory updates accurate

## Risk Mitigation

- **Primary Risk:** Parts usage data inconsistency affecting costs và inventory
- **Mitigation:** Atomic transactions, comprehensive validation, audit trails
- **Rollback Plan:** Stock movement reversal procedures, cost recalculation capabilities

## Story Dependencies

- **Prerequisites:** Story 04.1 (Parts Catalog Management), Epic 02 (Core Repair Workflow)
- **Enables:** Complete repair cost management
- **Estimated Effort:** 4-5 days
- **Priority:** Critical (core business functionality)