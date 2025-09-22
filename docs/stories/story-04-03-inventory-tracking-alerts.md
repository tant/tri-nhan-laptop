# Story 04.3: Inventory Tracking & Alerts System

## User Story

**As a** shop owner or manager,
**I want** comprehensive inventory tracking với automated alerts và reorder management,
**So that** tôi có thể maintain optimal stock levels, prevent stockouts, và optimize inventory investment.

## Story Context

**Inventory Management Philosophy:**
- Proactive inventory management với automated alerts
- Simple but effective tracking for small business
- Cost-effective inventory optimization
- Supplier relationship management
- Business intelligence for purchasing decisions

**Alert & Notification Strategy:**
- Real-time low stock alerts
- Predictive reorder notifications
- Cost variance alerts
- Supplier performance tracking
- Dashboard integration với visual indicators

## Acceptance Criteria

### **Stock Level Monitoring Requirements:**

**AC-SLM1: Real-time Stock Tracking**
```gherkin
GIVEN inventory management system
WHEN stock levels change
THEN tracks changes in real-time:
  - Current stock quantity updates immediately
  - Stock movement history maintained
  - Stock valuation calculations updated
  - Critical stock level identification
  - Stock aging analysis available
AND all changes are timestamped
AND change attribution is logged
```

**AC-SLM2: Stock Level Categorization**
```gherkin
GIVEN stock level analysis
WHEN categorizing inventory status
THEN provides clear categorization:
  - Good stock: Above minimum threshold + safety margin
  - Low stock: Below minimum threshold but above critical
  - Critical stock: Approaching zero or emergency levels
  - Out of stock: Zero quantity available
  - Overstock: Significantly above maximum recommended levels
AND visual indicators for each category
AND category-based reporting capabilities
```

**AC-SLM3: Stock Movement Analytics**
```gherkin
GIVEN stock movement data
WHEN analyzing inventory patterns
THEN provides comprehensive analytics:
  - Daily/weekly/monthly consumption rates
  - Seasonal usage pattern identification
  - Fast-moving vs slow-moving parts analysis
  - Stock turnover rate calculations
  - Lead time impact on stock requirements
AND predictive analytics for future needs
AND optimization recommendations
```

### **Alert System Requirements:**

**AC-AS1: Automated Low Stock Alerts**
```gherkin
GIVEN inventory alert system
WHEN stock levels trigger alerts
THEN generates appropriate notifications:
  - Low stock warnings when below minimum threshold
  - Critical stock alerts for emergency levels
  - Out of stock notifications for zero inventory
  - Overstock alerts for excessive inventory
  - Expiring stock alerts (if applicable)
AND alerts are sent via multiple channels (dashboard, email, SMS)
AND alert escalation for critical situations
```

**AC-AS2: Configurable Alert Thresholds**
```gherkin
GIVEN alert configuration needs
WHEN setting up inventory alerts
THEN allows customizable thresholds:
  - Minimum stock level per part
  - Critical stock level per part
  - Maximum stock level recommendations
  - Alert frequency settings
  - Alert recipient configurations
  - Category-specific alert rules
AND threshold adjustment based on usage patterns
AND seasonal threshold modifications
```

**AC-AS3: Alert Management Interface**
```gherkin
GIVEN alert management requirements
WHEN managing inventory alerts
THEN provides comprehensive interface:
  - Active alerts dashboard with priorities
  - Alert history và resolution tracking
  - Alert snooze và acknowledgment capabilities
  - Bulk alert actions
  - Alert performance analytics
AND alert effectiveness measurement
AND false positive reduction tools
```

### **Reorder Management Requirements:**

**AC-RM1: Automated Reorder Suggestions**
```gherkin
GIVEN reorder management system
WHEN stock reaches reorder points
THEN provides intelligent suggestions:
  - Optimal reorder quantity calculations
  - Lead time considerations
  - Economic order quantity (EOQ) recommendations
  - Supplier selection suggestions
  - Bulk purchase opportunity identification
AND cost-benefit analysis for reorder decisions
AND integration với supplier catalogs
```

**AC-RM2: Purchase Order Generation**
```gherkin
GIVEN purchase order requirements
WHEN creating purchase orders
THEN facilitates order creation:
  - Auto-populated purchase orders
  - Supplier contact information integration
  - Order tracking capabilities
  - Delivery scheduling coordination
  - Cost comparison across suppliers
AND order approval workflow
AND purchase order history management
```

**AC-RM3: Supplier Performance Tracking**
```gherkin
GIVEN supplier management needs
WHEN tracking supplier performance
THEN monitors key metrics:
  - Delivery time accuracy
  - Order fulfillment rates
  - Quality consistency ratings
  - Price competitiveness analysis
  - Communication responsiveness
AND supplier scorecard generation
AND supplier relationship optimization
```

### **Inventory Valuation Requirements:**

**AC-IV1: Cost Basis Tracking**
```gherkin
GIVEN inventory valuation needs
WHEN calculating inventory value
THEN provides accurate valuation:
  - FIFO (First In, First Out) cost calculations
  - Average cost method support
  - Current replacement cost tracking
  - Inventory aging impact on valuation
  - Write-off và damage cost tracking
AND multiple valuation method comparisons
AND valuation trend analysis
```

**AC-IV2: Financial Impact Analysis**
```gherkin
GIVEN financial analysis requirements
WHEN analyzing inventory impact
THEN provides financial insights:
  - Inventory turnover ratio calculations
  - Carrying cost analysis
  - Dead stock identification
  - Inventory investment optimization
  - Cash flow impact assessment
AND ROI analysis for inventory decisions
AND cost reduction recommendations
```

### **Reporting & Dashboard Requirements:**

**AC-RD1: Inventory Dashboard**
```gherkin
GIVEN inventory dashboard requirements
WHEN displaying inventory overview
THEN provides comprehensive dashboard:
  - Real-time stock level indicators
  - Alert summary với priority levels
  - Top low-stock items
  - Recent stock movements
  - Inventory value summary
  - Reorder suggestions panel
AND customizable dashboard widgets
AND role-based dashboard views
```

**AC-RD2: Inventory Reports**
```gherkin
GIVEN inventory reporting needs
WHEN generating reports
THEN provides detailed reports:
  - Inventory valuation reports
  - Stock movement reports
  - Supplier performance reports
  - Reorder recommendation reports
  - Cost analysis reports
  - Inventory aging reports
AND customizable report parameters
AND automated report scheduling
```

**AC-RD3: Trend Analysis**
```gherkin
GIVEN trend analysis requirements
WHEN analyzing inventory trends
THEN provides trend insights:
  - Stock level trends over time
  - Usage pattern seasonality
  - Cost trend analysis
  - Supplier price trends
  - Inventory efficiency improvements
AND predictive trend forecasting
AND trend-based recommendations
```

### **Integration Requirements:**

**AC-IR1: Parts Usage Integration**
```gherkin
GIVEN parts usage integration
WHEN parts are consumed in repairs
THEN updates inventory automatically:
  - Real-time stock deduction
  - Usage pattern learning
  - Consumption rate calculations
  - Repair frequency impact analysis
  - Customer demand forecasting
AND seamless integration với repair workflow
AND usage variance analysis
```

**AC-IR2: Supplier System Integration**
```gherkin
GIVEN supplier integration needs
WHEN integrating với supplier systems
THEN supports data exchange:
  - Electronic catalog updates
  - Price list synchronization
  - Availability status updates
  - Order status tracking
  - Invoice processing automation
AND standardized integration protocols
AND error handling for integration failures
```

### **Mobile & Accessibility Requirements:**

**AC-MA1: Mobile Inventory Management**
```gherkin
GIVEN mobile inventory needs
WHEN managing inventory on mobile
THEN provides mobile-optimized interface:
  - Mobile stock level checking
  - Photo-based stock verification
  - Barcode scanning for inventory
  - Mobile alert notifications
  - Emergency reorder capabilities
AND offline inventory data access
AND mobile-specific workflow optimization
```

**AC-MA2: Accessibility Features**
```gherkin
GIVEN accessibility requirements
WHEN using inventory interface
THEN supports accessibility:
  - Screen reader compatibility for alerts
  - High contrast mode for dashboards
  - Keyboard navigation support
  - Voice alerts for critical situations
  - Large text options for readability
AND WCAG 2.1 compliance
AND accessibility testing validation
```

## Technical Implementation Details

### **Inventory Alert System:**
```typescript
interface InventoryAlert {
  id: string;
  part_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  threshold_value: number;
  current_value: number;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  escalated: boolean;
}

type AlertType = 'low_stock' | 'critical_stock' | 'out_of_stock' | 'overstock' | 'reorder_suggested';
type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export function InventoryAlertSystem() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [alertFilters, setAlertFilters] = useState({
    severity: '',
    type: '',
    acknowledged: false
  });

  const { unacknowledgedAlerts, criticalAlerts } = useMemo(() => {
    const unacknowledged = alerts.filter(alert => !alert.acknowledged_at);
    const critical = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'emergency');

    return { unacknowledgedAlerts: unacknowledged, criticalAlerts: critical };
  }, [alerts]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await supabase
        .from('inventory_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: getCurrentUserId()
        })
        .eq('id', alertId);

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledged_at: new Date().toISOString() }
          : alert
      ));

      toast.success('Đã xác nhận cảnh báo');
    } catch (error) {
      toast.error('Không thể xác nhận cảnh báo');
    }
  };

  const handleBulkAcknowledge = async (alertIds: string[]) => {
    try {
      await Promise.all(
        alertIds.map(id => handleAcknowledgeAlert(id))
      );
      toast.success(`Đã xác nhận ${alertIds.length} cảnh báo`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xác nhận cảnh báo');
    }
  };

  return (
    <div className="inventory-alert-system">
      <div className="alerts-header">
        <div className="alerts-summary">
          <AlertCountBadge
            count={unacknowledgedAlerts.length}
            type="unacknowledged"
            label="Chưa xử lý"
          />
          <AlertCountBadge
            count={criticalAlerts.length}
            type="critical"
            label="Nghiêm trọng"
          />
        </div>

        <div className="alerts-actions">
          <Button
            variant="outline"
            onClick={() => handleBulkAcknowledge(unacknowledgedAlerts.map(a => a.id))}
            disabled={unacknowledgedAlerts.length === 0}
          >
            Xác nhận tất cả
          </Button>
          <Button onClick={refreshAlerts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      <AlertFilters
        filters={alertFilters}
        onFiltersChange={setAlertFilters}
      />

      <div className="alerts-list">
        {alerts
          .filter(alert => matchesFilters(alert, alertFilters))
          .map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
              onResolve={() => handleResolveAlert(alert.id)}
            />
          ))}
      </div>

      {alerts.length === 0 && (
        <div className="no-alerts">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <p>Không có cảnh báo nào</p>
        </div>
      )}
    </div>
  );
}
```

### **Stock Level Monitoring Hook:**
```typescript
export function useStockMonitoring() {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  // Real-time stock monitoring
  useEffect(() => {
    const stockSubscription = supabase
      .channel('stock-monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parts'
      }, async (payload) => {
        const updatedPart = payload.new as Part;
        await checkStockAlerts(updatedPart);
      })
      .subscribe();

    return () => {
      stockSubscription.unsubscribe();
    };
  }, []);

  const checkStockAlerts = async (part: Part) => {
    const alerts: Partial<InventoryAlert>[] = [];

    // Check low stock
    if (part.inventory.current_stock <= part.inventory.minimum_threshold) {
      alerts.push({
        part_id: part.id,
        alert_type: 'low_stock',
        severity: 'warning',
        message: `${part.name} có tồn kho thấp (${part.inventory.current_stock} còn lại)`,
        threshold_value: part.inventory.minimum_threshold,
        current_value: part.inventory.current_stock
      });
    }

    // Check critical stock
    if (part.inventory.current_stock <= Math.max(1, part.inventory.minimum_threshold * 0.3)) {
      alerts.push({
        part_id: part.id,
        alert_type: 'critical_stock',
        severity: 'critical',
        message: `${part.name} gần hết hàng - cần đặt hàng ngay!`,
        threshold_value: part.inventory.minimum_threshold * 0.3,
        current_value: part.inventory.current_stock
      });
    }

    // Check out of stock
    if (part.inventory.current_stock === 0) {
      alerts.push({
        part_id: part.id,
        alert_type: 'out_of_stock',
        severity: 'emergency',
        message: `${part.name} đã hết hàng hoàn toàn!`,
        threshold_value: 0,
        current_value: 0
      });
    }

    // Check reorder suggestion
    if (part.inventory.current_stock <= part.inventory.reorder_point) {
      alerts.push({
        part_id: part.id,
        alert_type: 'reorder_suggested',
        severity: 'info',
        message: `Gợi ý đặt hàng ${part.name} (EOQ: ${part.inventory.reorder_quantity})`,
        threshold_value: part.inventory.reorder_point,
        current_value: part.inventory.current_stock
      });
    }

    // Create alerts in database
    if (alerts.length > 0) {
      await supabase
        .from('inventory_alerts')
        .insert(alerts);

      // Send notifications
      await sendInventoryNotifications(alerts as InventoryAlert[]);
    }
  };

  const sendInventoryNotifications = async (alerts: InventoryAlert[]) => {
    const criticalAlerts = alerts.filter(alert =>
      alert.severity === 'critical' || alert.severity === 'emergency'
    );

    if (criticalAlerts.length > 0) {
      // Send immediate notifications for critical alerts
      await Promise.all([
        sendEmailNotification(criticalAlerts),
        sendSMSNotification(criticalAlerts),
        sendDashboardNotification(criticalAlerts)
      ]);
    } else {
      // Dashboard notification only for non-critical
      await sendDashboardNotification(alerts);
    }
  };

  return {
    stockLevels,
    alerts,
    checkStockAlerts,
    refreshData: fetchStockData
  };
}
```

### **Reorder Management System:**
```typescript
export function ReorderManagement() {
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const generateReorderSuggestions = async () => {
    try {
      const { data: lowStockParts } = await supabase
        .from('parts')
        .select('*')
        .lte('current_stock', 'minimum_threshold');

      const suggestions: ReorderSuggestion[] = await Promise.all(
        lowStockParts.map(async (part) => {
          const usageRate = await calculateUsageRate(part.id);
          const leadTime = part.supplier_info?.lead_time_days || 7;
          const safetyStock = Math.ceil(usageRate * leadTime * 1.2); // 20% safety margin

          const optimalQuantity = Math.max(
            part.inventory.reorder_quantity,
            safetyStock * 2
          );

          return {
            part_id: part.id,
            part_name: part.name,
            current_stock: part.inventory.current_stock,
            suggested_quantity: optimalQuantity,
            estimated_cost: optimalQuantity * part.pricing.unit_cost,
            priority: calculatePriority(part, usageRate),
            lead_time: leadTime,
            supplier: part.supplier_info?.primary_supplier
          };
        })
      );

      setReorderSuggestions(suggestions.sort((a, b) => b.priority - a.priority));
    } catch (error) {
      toast.error('Không thể tạo gợi ý đặt hàng');
    }
  };

  const createPurchaseOrder = async (suggestions: ReorderSuggestion[]) => {
    try {
      const groupedBySupplier = groupBy(suggestions, 'supplier');

      const purchaseOrders = await Promise.all(
        Object.entries(groupedBySupplier).map(async ([supplier, items]) => {
          const totalCost = items.reduce((sum, item) => sum + item.estimated_cost, 0);

          return await supabase
            .from('purchase_orders')
            .insert({
              supplier_name: supplier,
              total_amount: totalCost,
              status: 'draft',
              items: items.map(item => ({
                part_id: item.part_id,
                quantity: item.suggested_quantity,
                unit_cost: item.estimated_cost / item.suggested_quantity
              }))
            })
            .select()
            .single();
        })
      );

      toast.success(`Đã tạo ${purchaseOrders.length} đơn đặt hàng`);
      return purchaseOrders;

    } catch (error) {
      toast.error('Không thể tạo đơn đặt hàng');
    }
  };

  return (
    <div className="reorder-management">
      <div className="reorder-header">
        <h2>Quản lý đặt hàng</h2>
        <div className="header-actions">
          <Button onClick={generateReorderSuggestions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tạo gợi ý mới
          </Button>
          <Button
            onClick={() => createPurchaseOrder(
              reorderSuggestions.filter(s => selectedSuggestions.includes(s.part_id))
            )}
            disabled={selectedSuggestions.length === 0}
          >
            Tạo đơn đặt hàng
          </Button>
        </div>
      </div>

      <ReorderSummary suggestions={reorderSuggestions} />

      <div className="suggestions-list">
        {reorderSuggestions.map(suggestion => (
          <ReorderSuggestionCard
            key={suggestion.part_id}
            suggestion={suggestion}
            selected={selectedSuggestions.includes(suggestion.part_id)}
            onToggleSelect={(partId) => {
              setSelectedSuggestions(prev =>
                prev.includes(partId)
                  ? prev.filter(id => id !== partId)
                  : [...prev, partId]
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Inventory Tracking & Alerts**
```typescript
describe('Inventory Tracking & Alerts System', () => {
  test('AC-SLM1: Real-time stock tracking', async () => {
    const mockPart = {
      id: 'part-1',
      name: 'Test Part',
      inventory: { current_stock: 5, minimum_threshold: 10 }
    };

    render(<StockMonitoringDashboard />);

    // Simulate stock change
    act(() => {
      mockSupabaseRealtimeUpdate('parts', {
        event: 'UPDATE',
        new: { ...mockPart, inventory: { ...mockPart.inventory, current_stock: 3 } }
      });
    });

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Updated stock level
    });
  });

  test('AC-AS1: Automated low stock alerts', async () => {
    const mockLowStockPart = {
      id: 'part-1',
      name: 'Low Stock Part',
      inventory: { current_stock: 2, minimum_threshold: 5 }
    };

    const mockCheckStockAlerts = jest.fn();
    render(<InventoryAlertSystem />);

    // Trigger stock alert check
    await mockCheckStockAlerts(mockLowStockPart);

    await waitFor(() => {
      expect(mockCreateAlert).toHaveBeenCalledWith({
        part_id: 'part-1',
        alert_type: 'low_stock',
        severity: 'warning',
        message: expect.stringContaining('có tồn kho thấp')
      });
    });
  });

  test('AC-AS2: Configurable alert thresholds', async () => {
    render(<AlertThresholdSettings />);

    // Update minimum threshold
    const thresholdInput = screen.getByLabelText('Ngưỡng tối thiểu');
    fireEvent.change(thresholdInput, { target: { value: '15' } });

    fireEvent.click(screen.getByText('Lưu cài đặt'));

    await waitFor(() => {
      expect(mockUpdatePartThreshold).toHaveBeenCalledWith('part-1', {
        minimum_threshold: 15
      });
    });
  });

  test('AC-RM1: Automated reorder suggestions', async () => {
    const mockUsageData = [
      { part_id: 'part-1', daily_usage: 2.5, lead_time: 7 }
    ];

    mockCalculateUsageRate.mockResolvedValue(2.5);

    render(<ReorderManagement />);

    fireEvent.click(screen.getByText('Tạo gợi ý mới'));

    await waitFor(() => {
      expect(screen.getByText('Gợi ý đặt hàng')).toBeInTheDocument();
      expect(screen.getByText(/Số lượng đề xuất:/)).toBeInTheDocument();
    });

    // Check EOQ calculation
    const suggestedQuantity = screen.getByTestId('suggested-quantity');
    expect(parseInt(suggestedQuantity.textContent!)).toBeGreaterThan(0);
  });

  test('AC-IV1: Cost basis tracking', async () => {
    const mockInventoryData = [
      {
        part_id: 'part-1',
        movements: [
          { type: 'receipt', quantity: 10, unit_cost: 100000, date: '2025-01-01' },
          { type: 'usage', quantity: 3, date: '2025-01-10' },
          { type: 'receipt', quantity: 5, unit_cost: 110000, date: '2025-01-15' }
        ]
      }
    ];

    render(<InventoryValuation />);

    await waitFor(() => {
      // Check FIFO calculation
      expect(screen.getByText('Phương pháp FIFO')).toBeInTheDocument();

      // Should show average cost
      expect(screen.getByText(/Giá trị trung bình:/)).toBeInTheDocument();
    });
  });

  test('AC-RD1: Inventory dashboard', async () => {
    const mockDashboardData = {
      totalValue: 50000000,
      lowStockCount: 3,
      criticalStockCount: 1,
      reorderSuggestions: 5
    };

    render(<InventoryDashboard />);

    await waitFor(() => {
      expect(screen.getByText('50,000,000 ₫')).toBeInTheDocument(); // Total value
      expect(screen.getByText('3')).toBeInTheDocument(); // Low stock count
      expect(screen.getByText('1')).toBeInTheDocument(); // Critical stock count
    });
  });

  test('AC-IR1: Parts usage integration', async () => {
    const mockTicket = { id: 'ticket-1', ticket_code: 'LRP-2025-000001' };
    const mockPartUsage = { part_id: 'part-1', quantity: 2 };

    render(<PartsUsageIntegration />);

    // Simulate parts usage in ticket
    fireEvent.click(screen.getByText('Sử dụng linh kiện'));

    await waitFor(() => {
      expect(mockUpdateStock).toHaveBeenCalledWith('part-1', -2);
      expect(mockLogStockMovement).toHaveBeenCalledWith({
        part_id: 'part-1',
        movement_type: 'usage',
        quantity: -2,
        ticket_id: 'ticket-1'
      });
    });
  });

  test('AC-MA1: Mobile inventory management', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    const { container } = render(<InventoryAlertSystem />);

    expect(container.firstChild).toHaveClass('mobile-optimized');

    // Check mobile-specific features
    expect(screen.getByTestId('mobile-alert-summary')).toBeInTheDocument();
  });

  test('AC-RD3: Trend analysis', async () => {
    const mockTrendData = {
      stockTrends: [
        { date: '2025-01-01', total_value: 45000000 },
        { date: '2025-01-15', total_value: 50000000 },
        { date: '2025-01-30', total_value: 48000000 }
      ]
    };

    render(<InventoryTrendAnalysis />);

    await waitFor(() => {
      expect(screen.getByText('Xu hướng tồn kho')).toBeInTheDocument();
      expect(screen.getByText(/Tăng trưởng 6.7%/)).toBeInTheDocument(); // Trend percentage
    });
  });
});
```

### **Database Schema for Alerts:**
```sql
-- Inventory alerts table
CREATE TABLE inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  escalated BOOLEAN DEFAULT FALSE
);

-- Alert types enum
CREATE TYPE alert_type AS ENUM (
  'low_stock', 'critical_stock', 'out_of_stock', 'overstock', 'reorder_suggested'
);

-- Alert severity enum
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical', 'emergency');

-- Purchase orders table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name VARCHAR(255) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status order_status DEFAULT 'draft',
  items JSONB NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expected_delivery TIMESTAMPTZ,
  received_at TIMESTAMPTZ
);

CREATE TYPE order_status AS ENUM ('draft', 'sent', 'confirmed', 'shipped', 'received', 'cancelled');

-- Indexes for performance
CREATE INDEX idx_inventory_alerts_part ON inventory_alerts(part_id, created_at);
CREATE INDEX idx_inventory_alerts_unresolved ON inventory_alerts(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status, created_at);
```

## Definition of Done

- [ ] **AC-SLM1:** Real-time stock tracking functional
- [ ] **AC-SLM2:** Stock level categorization implemented
- [ ] **AC-SLM3:** Stock movement analytics working
- [ ] **AC-AS1:** Automated low stock alerts functional
- [ ] **AC-AS2:** Configurable alert thresholds implemented
- [ ] **AC-AS3:** Alert management interface complete
- [ ] **AC-RM1:** Automated reorder suggestions working
- [ ] **AC-RM2:** Purchase order generation functional
- [ ] **AC-RM3:** Supplier performance tracking implemented
- [ ] **AC-IV1:** Cost basis tracking accurate
- [ ] **AC-IV2:** Financial impact analysis functional
- [ ] **AC-RD1:** Inventory dashboard complete
- [ ] **AC-RD2:** Inventory reports comprehensive
- [ ] **AC-RD3:** Trend analysis implemented
- [ ] **AC-IR1:** Parts usage integration seamless
- [ ] **AC-IR2:** Supplier system integration working
- [ ] **AC-MA1:** Mobile inventory management optimized
- [ ] **AC-MA2:** Accessibility features implemented
- [ ] **Performance Tests:** Alert system scalability validated
- [ ] **Integration Tests:** Real-time updates accuracy verified
- [ ] **Business Logic Tests:** EOQ calculations và forecasting accurate

## Risk Mitigation

- **Primary Risk:** False alerts overwhelming staff or missing critical stockouts
- **Mitigation:** Intelligent alert thresholds, escalation procedures, alert effectiveness monitoring
- **Rollback Plan:** Manual inventory monitoring procedures, alert system disable capabilities

## Story Dependencies

- **Prerequisites:** Story 04.2 (Parts Usage in Repair Tickets)
- **Enables:** Proactive inventory management
- **Estimated Effort:** 4-5 days
- **Priority:** High (prevents business disruption from stockouts)