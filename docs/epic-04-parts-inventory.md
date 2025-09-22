# Epic 04: Parts Inventory & Cost Management

## Epic Goal

Xây dựng hệ thống quản lý linh kiện và chi phí sửa chữa, với inventory tracking đơn giản phù hợp với small business operations.

## Epic Description

**Bối cảnh hệ thống:**
- Simplified inventory management (không phức tạp)
- Parts usage tracking trong repair tickets
- Cost calculation và pricing management
- Current stock mặc định 10000 (ảo) cho development

**Chi tiết Epic:**
- **Mục tiêu:** Quản lý inventory và cost effectively cho shop operations
- **Phạm vi:** Parts catalog, usage tracking, pricing, basic inventory alerts
- **Kết quả:** Staff có thể track parts usage và manage costs accurately

## Stories

### 1. **Story 4.1:** Parts Catalog Management
- Parts database với categories (screen, keyboard, battery, etc.)
- Brand và model compatibility tracking
- Supplier information management
- Basic CRUD operations cho parts

### 2. **Story 4.2:** Parts Usage in Repair Tickets
- Add parts to repair tickets với simplified JSON structure
- Cost calculation dựa trên parts used
- Quantity tracking và unit pricing
- Parts usage history cho analytics

### 3. **Story 4.3:** Inventory Tracking & Alerts
- Basic stock level monitoring
- Low stock alerts (threshold-based)
- Parts usage reporting
- Simple reorder suggestions

### 4. **Story 4.4:** Cost Management & Pricing
- Total cost calculation cho repair tickets
- Deposit và payment tracking
- Profit margin analysis (basic)
- Price history cho parts

## Technical Implementation

**Database Structure (Simplified):**
```sql
-- Parts table
CREATE TABLE parts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  model_compatibility TEXT[], -- Array of compatible models
  current_stock INTEGER DEFAULT 10000, -- Simplified stock
  unit_cost DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  supplier_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking in repair_tickets
ALTER TABLE repair_tickets ADD COLUMN parts_used JSONB;
-- Format: [{"part_id": "uuid", "name": "Screen 15.6\"", "quantity": 1, "unit_price": 150000}]
```

**Frontend Components:**
```typescript
<PartsManagement />
<PartsCatalog />
<PartsUsageForm />
<InventoryAlerts />
<CostCalculator />
<StockLevelIndicator />
```

**Business Logic:**
```typescript
// Cost calculation
interface PartUsage {
  part_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Auto-calculate total cost
function calculateTicketCost(partsUsed: PartUsage[], laborCost: number): number {
  const partsCost = partsUsed.reduce((sum, part) => sum + part.total, 0);
  return partsCost + laborCost;
}
```

**Inventory Management:**
- Current stock tracking (simplified)
- Usage logs cho audit trail
- Reorder alerts based on thresholds
- Monthly usage reports

## User Experience Flow

**Parts Management Workflow:**
1. **Catalog:** Staff browse parts database với search/filter
2. **Add to Ticket:** Select parts durante repair ticket creation/editing
3. **Calculate Cost:** Auto-calculate total cost including labor
4. **Stock Update:** Log usage (manual stock adjustment for now)
5. **Alerts:** Notification when stock thấp

**Inventory Monitoring:**
- Dashboard widget showing low stock alerts
- Monthly usage trends
- Most commonly used parts
- Cost tracking per ticket

## Definition of Done

- [ ] Parts catalog với đầy đủ CRUD operations
- [ ] Parts usage integration trong repair tickets
- [ ] Cost calculation working correctly
- [ ] Stock level tracking và alerts functional
- [ ] Usage reporting available
- [ ] Inventory dashboard widgets complete
- [ ] Mobile-friendly parts selection interface
- [ ] Data validation cho pricing và quantities

## Technical Constraints

**Simplified Approach:**
- Stock levels ảo (10000 default) cho MVP
- Manual stock adjustments trong admin interface
- Không auto-deduct stock khi sử dụng parts
- Basic reporting (không advanced analytics)

**Future Enhancements (NOT in this epic):**
- Real-time stock synchronization
- Automatic reordering
- Supplier integration
- Advanced cost analytics

## Risk Mitigation

- **Primary Risk:** Inventory tracking complexity overwhelming small business
- **Mitigation:** Keep interface simple, focus on essential features only
- **Rollback Plan:** Manual parts tracking trong notes field nếu needed

## Success Criteria

Parts inventory system functional:
1. Staff có thể easily manage parts catalog
2. Parts usage accurately tracked trong tickets
3. Cost calculations reflect actual business model
4. Inventory alerts help prevent stockouts
5. Simple interface không overwhelm staff with complexity