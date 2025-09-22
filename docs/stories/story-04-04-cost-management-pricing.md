# Story 04.4: Cost Management & Pricing System
**Epic:** 04 - Parts Inventory & Cost Management
**Story Points:** 13
**Priority:** High
**Dependencies:** Story 04.1, 04.2, 04.3

## Mô tả (Description)
Là một chủ cửa hàng sửa chữa laptop, tôi cần một hệ thống quản lý chi phí và định giá linh kiện toàn diện để tối ưu hóa lợi nhuận, theo dõi xu hướng giá, quản lý nhiều mức giá, và phân tích hiệu quả tài chính của từng loại linh kiện, giúp tôi đưa ra quyết định kinh doanh thông minh và cạnh tranh hiệu quả trên thị trường.

## Acceptance Criteria

### AC 04.4.1: Cost Analysis & Profitability Tracking
**Given** hệ thống có dữ liệu lịch sử mua và bán linh kiện
**When** tôi truy cập trang "Phân tích Chi phí" (Cost Analysis)
**Then** hệ thống hiển thị:
- Biểu đồ biên lợi nhuận theo từng loại linh kiện
- Tỷ lệ markup trung bình và đề xuất tối ưu
- Top 10 linh kiện có lợi nhuận cao nhất/thấp nhất
- Xu hướng chi phí nhập hàng theo thời gian (7 ngày, 30 ngày, 90 ngày)
- Chi phí trung bình, thấp nhất, cao nhất cho mỗi loại linh kiện

```typescript
interface CostAnalytics {
  part_id: string;
  part_name: string;
  total_purchased: number;
  total_sold: number;
  average_cost: number;
  average_selling_price: number;
  profit_margin: number;
  markup_percentage: number;
  recommended_markup: number;
  cost_trend: 'increasing' | 'decreasing' | 'stable';
  profitability_score: number; // 1-100
}

// React Component với Chart.js
const CostAnalyticsDashboard: React.FC = () => {
  const { analytics, loading } = useCostAnalytics();

  return (
    <div className="space-y-6">
      <ProfitMarginChart data={analytics.profit_margins} />
      <CostTrendChart data={analytics.cost_trends} />
      <TopPerformingPartsTable data={analytics.top_performers} />
    </div>
  );
};
```

### AC 04.4.2: Dynamic Pricing Strategy Management
**Given** tôi là quản lý kho với quyền thiết lập giá
**When** tôi tạo chiến lược định giá mới
**Then** hệ thống cho phép:
- Thiết lập pricing rules dựa trên cost-plus, market-based, hoặc value-based
- Cấu hình auto-pricing với minimum/maximum margins
- Áp dụng seasonal pricing và promotional discounts
- Thiết lập tiered pricing cho khách hàng VIP/thường/sỉ
- Schedule price changes với effective dates

```typescript
interface PricingStrategy {
  id: string;
  name: string;
  strategy_type: 'cost_plus' | 'market_based' | 'value_based' | 'competitive';
  base_markup_percentage: number;
  minimum_margin: number;
  maximum_margin: number;
  customer_tiers: {
    retail: number;    // Giá lẻ
    wholesale: number; // Giá sỉ
    vip: number;      // Giá VIP
  };
  seasonal_adjustments: {
    season: string;
    adjustment_percentage: number;
    start_date: string;
    end_date: string;
  }[];
  auto_adjust_enabled: boolean;
  market_factor_weight: number; // 0-1
}

const PricingStrategyForm: React.FC = () => {
  const { createStrategy, updateStrategy } = usePricingStrategies();

  const handleStrategySubmit = async (data: PricingStrategy) => {
    await createStrategy(data);
    toast.success('Chiến lược định giá đã được tạo thành công');
  };

  return (
    <form onSubmit={handleSubmit(handleStrategySubmit)}>
      <PricingRulesBuilder />
      <CustomerTierPricing />
      <SeasonalAdjustments />
      <AutoPricingSettings />
    </form>
  );
};
```

### AC 04.4.3: Multi-tier Pricing & Customer Segmentation
**Given** cửa hàng có nhiều loại khách hàng (lẻ, sỉ, VIP, đối tác)
**When** nhân viên tạo quote hoặc invoice cho khách hàng
**Then** hệ thống tự động:
- Áp dụng mức giá phù hợp với tier của khách hàng
- Hiển thị all available pricing tiers cho comparison
- Cho phép override pricing với approval workflow
- Tính toán volume discounts tự động
- Track pricing effectiveness theo customer segment

```typescript
interface CustomerTier {
  id: string;
  name: string;
  discount_percentage: number;
  minimum_order_value: number;
  volume_discount_tiers: {
    quantity_threshold: number;
    additional_discount: number;
  }[];
  payment_terms: number; // days
  credit_limit: number;
}

interface PriceCalculation {
  base_price: number;
  customer_tier_discount: number;
  volume_discount: number;
  seasonal_adjustment: number;
  promotional_discount: number;
  final_price: number;
  profit_margin: number;
  approval_required: boolean;
}

const PriceCalculator: React.FC<{partId: string, customerId: string, quantity: number}> =
  ({ partId, customerId, quantity }) => {
  const { calculatePrice } = usePriceCalculator();
  const pricing = calculatePrice(partId, customerId, quantity);

  return (
    <div className="pricing-breakdown">
      <PriceBreakdown pricing={pricing} />
      <CustomerTierInfo customerId={customerId} />
      <VolumeDiscountCalculator quantity={quantity} />
      {pricing.approval_required && <ApprovalWorkflow />}
    </div>
  );
};
```

### AC 04.4.4: Supplier Cost Tracking & Purchase Analytics
**Given** cửa hàng mua linh kiện từ nhiều nhà cung cấp khác nhau
**When** tôi xem báo cáo "Supplier Performance & Costs"
**Then** hệ thống hiển thị:
- So sánh giá từng supplier cho cùng một linh kiện
- Lịch sử thay đổi giá của từng supplier
- Supplier reliability score (delivery time, quality, price stability)
- Cost variance analysis và outlier detection
- Recommendations cho supplier selection

```typescript
interface SupplierCostAnalysis {
  supplier_id: string;
  supplier_name: string;
  parts_supplied: {
    part_id: string;
    part_name: string;
    current_price: number;
    price_history: {
      date: string;
      price: number;
      quantity_purchased: number;
    }[];
    price_trend: 'increasing' | 'decreasing' | 'stable';
    price_volatility: number; // standard deviation
    last_purchase_date: string;
    average_delivery_time: number;
    quality_score: number; // 1-10
  }[];
  overall_cost_competitiveness: number; // 1-10
  reliability_score: number; // 1-10
  payment_terms: string;
  total_spent_ytd: number;
}

const SupplierCostDashboard: React.FC = () => {
  const { suppliers, loading } = useSupplierAnalytics();

  return (
    <div className="supplier-analytics">
      <SupplierComparisonTable suppliers={suppliers} />
      <PriceVolatilityChart suppliers={suppliers} />
      <SupplierScorecardGrid suppliers={suppliers} />
      <CostOutlierAlerts suppliers={suppliers} />
    </div>
  );
};
```

### AC 04.4.5: Cost Forecasting & Budget Planning
**Given** hệ thống có dữ liệu lịch sử chi phí và consumption patterns
**When** tôi truy cập module "Dự báo Chi phí" (Cost Forecasting)
**Then** hệ thống:
- Dự báo chi phí nhập hàng cho 3-6 tháng tới dựa trên trends
- Identify seasonal cost patterns và demand fluctuations
- Provide budget recommendations cho từng category linh kiện
- Alert về potential cost increases hoặc supply shortages
- Generate procurement calendar with optimal timing

```typescript
interface CostForecast {
  period: string; // 'monthly' | 'quarterly' | 'yearly'
  forecasts: {
    part_category: string;
    current_monthly_cost: number;
    forecasted_costs: {
      month: string;
      predicted_cost: number;
      confidence_interval: [number, number];
      key_factors: string[];
    }[];
    seasonal_factors: {
      month: number;
      seasonal_multiplier: number;
    }[];
    risk_factors: {
      factor: string;
      impact_probability: number;
      cost_impact_percentage: number;
    }[];
  }[];
  total_budget_recommendation: number;
  cash_flow_projections: {
    month: string;
    inbound_costs: number;
    outbound_revenue: number;
    net_cash_flow: number;
  }[];
}

const CostForecastingDashboard: React.FC = () => {
  const { forecast, generateForecast } = useCostForecasting();

  return (
    <div className="forecasting-dashboard">
      <ForecastChart data={forecast.forecasts} />
      <SeasonalPatternsAnalysis data={forecast} />
      <BudgetRecommendations forecast={forecast} />
      <RiskFactorAnalysis risks={forecast.forecasts.flatMap(f => f.risk_factors)} />
      <ProcurementCalendar forecast={forecast} />
    </div>
  );
};
```

### AC 04.4.6: ROI Analysis & Investment Optimization
**Given** cửa hàng đầu tư tiền vào inventory
**When** tôi analyze ROI performance
**Then** hệ thống tính toán và hiển thị:
- ROI cho từng category linh kiện (revenue/investment ratio)
- Inventory turnover rates và optimal stock levels
- Cash conversion cycle analysis
- Dead stock identification và liquidation recommendations
- Investment efficiency scoring cho procurement decisions

```typescript
interface ROIAnalysis {
  part_category: string;
  total_investment: number;
  total_revenue: number;
  roi_percentage: number;
  inventory_turnover: number; // times per year
  average_holding_period: number; // days
  cash_conversion_cycle: number; // days
  dead_stock_value: number;
  dead_stock_percentage: number;
  optimal_stock_level: number;
  current_stock_level: number;
  efficiency_score: number; // 1-100
  recommendations: {
    action: 'increase_stock' | 'decrease_stock' | 'liquidate' | 'maintain';
    reason: string;
    potential_impact: number;
  }[];
}

const ROIDashboard: React.FC = () => {
  const { roiData, optimizationSuggestions } = useROIAnalysis();

  return (
    <div className="roi-dashboard">
      <ROIOverviewCards data={roiData} />
      <InventoryTurnoverChart data={roiData} />
      <CashConversionAnalysis data={roiData} />
      <DeadStockAlert items={roiData.filter(item => item.dead_stock_percentage > 10)} />
      <OptimizationRecommendations suggestions={optimizationSuggestions} />
    </div>
  );
};
```

### AC 04.4.7: Competitive Pricing Intelligence
**Given** thị trường có nhiều cửa hàng cạnh tranh
**When** tôi cần thiết lập giá cạnh tranh
**Then** hệ thống cung cấp:
- Price comparison với market rates (manual input hoặc web scraping)
- Competitive positioning analysis (higher/lower/similar pricing)
- Market share impact predictions khi thay đổi giá
- Price elasticity analysis cho demand forecasting
- Competitor price alert system

```typescript
interface CompetitiveAnalysis {
  part_id: string;
  our_price: number;
  market_data: {
    competitor_name: string;
    price: number;
    availability: boolean;
    last_updated: string;
    source: 'manual' | 'web_scraping' | 'partner_api';
  }[];
  market_position: 'lowest' | 'below_average' | 'average' | 'above_average' | 'highest';
  price_elasticity: number; // demand sensitivity to price changes
  recommended_price: number;
  potential_revenue_impact: {
    price_change_percentage: number;
    demand_change_percentage: number;
    revenue_change_amount: number;
  }[];
}

const CompetitivePricingTool: React.FC = () => {
  const { competitiveData, updateMarketPrices } = useCompetitiveIntelligence();

  return (
    <div className="competitive-pricing">
      <MarketPositionChart data={competitiveData} />
      <CompetitorPriceTable competitors={competitiveData.market_data} />
      <PriceElasticityAnalysis elasticity={competitiveData.price_elasticity} />
      <RevenueImpactCalculator scenarios={competitiveData.potential_revenue_impact} />
      <PriceRecommendationEngine data={competitiveData} />
    </div>
  );
};
```

### AC 04.4.8: Financial Reporting & Tax Compliance
**Given** cửa hàng cần báo cáo tài chính và tuân thủ thuế
**When** tôi tạo báo cáo tài chính
**Then** hệ thống generate:
- Detailed cost of goods sold (COGS) reports
- Inventory valuation reports (FIFO/LIFO/Weighted Average)
- Tax-compliant transaction logs với VAT calculations
- Profit & Loss statements by product categories
- Export formats cho accounting software (Excel, PDF, API)

```typescript
interface FinancialReport {
  report_type: 'cogs' | 'inventory_valuation' | 'profit_loss' | 'tax_compliance';
  period: {
    start_date: string;
    end_date: string;
  };
  inventory_method: 'fifo' | 'lifo' | 'weighted_average';
  data: {
    total_revenue: number;
    total_cogs: number;
    gross_profit: number;
    gross_margin_percentage: number;
    inventory_value: number;
    tax_details: {
      vat_collected: number;
      vat_paid: number;
      net_vat_liability: number;
      taxable_revenue: number;
      deductible_costs: number;
    };
    category_breakdown: {
      category: string;
      revenue: number;
      cogs: number;
      profit: number;
      margin_percentage: number;
    }[];
  };
  compliance_status: 'compliant' | 'needs_review' | 'non_compliant';
}

const FinancialReportGenerator: React.FC = () => {
  const { generateReport, exportReport } = useFinancialReporting();

  return (
    <div className="financial-reporting">
      <ReportTypeSelector />
      <DateRangePicker />
      <InventoryMethodSelector />
      <ReportPreview />
      <ExportOptions formats={['pdf', 'excel', 'csv', 'api']} />
      <TaxComplianceChecker />
    </div>
  );
};
```

### AC 04.4.9: Cost Control & Budget Alerts
**Given** cửa hàng có ngân sách hạn chế
**When** chi phí vượt quá ngưỡng đã thiết lập
**Then** hệ thống:
- Gửi real-time alerts khi budget utilization > 80%
- Block purchase orders nếu vượt quá approved budget
- Provide alternative suppliers với lower costs
- Suggest inventory optimization để reduce carrying costs
- Generate exception reports cho management review

```typescript
interface BudgetControl {
  budget_period: 'monthly' | 'quarterly' | 'yearly';
  categories: {
    category: string;
    allocated_budget: number;
    spent_amount: number;
    utilization_percentage: number;
    projected_overspend: number;
    alert_threshold: number; // percentage
    approval_required_above: number;
    automatic_block_above: number;
  }[];
  alerts: {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    category: string;
    current_amount: number;
    threshold_amount: number;
    suggested_actions: string[];
    created_at: string;
  }[];
}

const BudgetControlDashboard: React.FC = () => {
  const { budgetStatus, alerts, updateBudgetLimits } = useBudgetControl();

  return (
    <div className="budget-control">
      <BudgetUtilizationChart data={budgetStatus.categories} />
      <AlertsPanel alerts={alerts} />
      <BudgetLimitsConfiguration onUpdate={updateBudgetLimits} />
      <CostOptimizationSuggestions />
      <ExceptionReportsGrid />
    </div>
  );
};
```

### AC 04.4.10: Cost Optimization Recommendations
**Given** hệ thống có AI analysis capabilities
**When** system analyzes cost patterns và performance
**Then** hệ thống đề xuất:
- Optimal procurement quantities để minimize carrying costs
- Supplier consolidation opportunities
- Slow-moving inventory liquidation strategies
- Pricing adjustments để improve margins
- Process improvements để reduce operational costs

```typescript
interface CostOptimization {
  recommendation_type: 'procurement' | 'supplier' | 'inventory' | 'pricing' | 'process';
  recommendations: {
    id: string;
    title: string;
    description: string;
    potential_savings: number;
    implementation_effort: 'low' | 'medium' | 'high';
    risk_level: 'low' | 'medium' | 'high';
    time_to_implement: string;
    success_probability: number;
    impact_categories: string[];
    action_items: {
      task: string;
      responsible: string;
      deadline: string;
      status: 'pending' | 'in_progress' | 'completed';
    }[];
  }[];
  total_potential_savings: number;
  prioritized_actions: string[];
}

const CostOptimizationEngine: React.FC = () => {
  const { optimizations, implementRecommendation } = useCostOptimization();

  return (
    <div className="cost-optimization">
      <OptimizationSummaryCards data={optimizations} />
      <RecommendationsTable
        recommendations={optimizations.recommendations}
        onImplement={implementRecommendation}
      />
      <ImpactAnalysisChart data={optimizations} />
      <ActionItemsTracker recommendations={optimizations.recommendations} />
    </div>
  );
};
```

## Database Schema Extensions

```sql
-- Cost Management Tables
CREATE TABLE cost_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  strategy_type VARCHAR(20) NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES parts(id),
  supplier_id UUID,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  effective_date TIMESTAMP NOT NULL,
  price_change_reason VARCHAR(200),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  budget_period VARCHAR(20) NOT NULL,
  allocated_amount DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  alert_threshold DECIMAL(5,2) DEFAULT 80, -- percentage
  approval_threshold DECIMAL(5,2) DEFAULT 90,
  block_threshold DECIMAL(5,2) DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cost_optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  potential_savings DECIMAL(10,2),
  implementation_effort VARCHAR(10),
  risk_level VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  implemented_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_price_history_part_date ON price_history(part_id, effective_date DESC);
CREATE INDEX idx_budget_allocations_period ON budget_allocations(budget_period, category);
CREATE INDEX idx_cost_recommendations_status ON cost_optimization_recommendations(status, created_at);

-- RLS Policies
ALTER TABLE cost_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Enable read access for authenticated users
CREATE POLICY "Enable read for authenticated users" ON cost_strategies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON price_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON budget_allocations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read for authenticated users" ON cost_optimization_recommendations FOR SELECT USING (auth.role() = 'authenticated');

-- Enable write access for managers
CREATE POLICY "Enable write for managers" ON cost_strategies FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));
CREATE POLICY "Enable write for managers" ON price_history FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));
CREATE POLICY "Enable write for managers" ON budget_allocations FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));
CREATE POLICY "Enable write for managers" ON cost_optimization_recommendations FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));
```

## Testing Scenarios

### Unit Tests
```typescript
describe('Cost Management & Pricing', () => {
  test('calculates multi-tier pricing correctly', async () => {
    const pricing = await calculatePrice('part-123', 'customer-vip', 50);
    expect(pricing.final_price).toBeLessThan(pricing.base_price);
    expect(pricing.customer_tier_discount).toBeGreaterThan(0);
    expect(pricing.volume_discount).toBeGreaterThan(0);
  });

  test('generates accurate cost forecasts', async () => {
    const forecast = await generateCostForecast('quarterly');
    expect(forecast.forecasts).toHaveLength(3); // 3 months
    expect(forecast.total_budget_recommendation).toBeGreaterThan(0);
  });

  test('identifies cost optimization opportunities', async () => {
    const optimizations = await analyzeCostOptimization();
    expect(optimizations.recommendations.length).toBeGreaterThan(0);
    expect(optimizations.total_potential_savings).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
describe('Cost Management Integration', () => {
  test('budget alerts trigger correctly', async () => {
    await simulatePurchase(8500); // 85% of 10000 budget
    const alerts = await getBudgetAlerts();
    expect(alerts).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        category: 'laptop_parts'
      })
    );
  });

  test('competitive pricing updates market position', async () => {
    await updateCompetitorPrice('part-123', 'competitor-a', 150000);
    const analysis = await getCompetitiveAnalysis('part-123');
    expect(analysis.market_position).toBe('above_average');
  });
});
```

### E2E Tests
```typescript
describe('Cost Management E2E', () => {
  test('manager can create and apply pricing strategy', async () => {
    await loginAsManager();
    await page.goto('/cost-management/pricing-strategies');

    await page.click('[data-testid="create-strategy"]');
    await page.fill('[data-testid="strategy-name"]', 'Premium Pricing');
    await page.selectOption('[data-testid="strategy-type"]', 'value_based');
    await page.fill('[data-testid="base-markup"]', '40');

    await page.click('[data-testid="save-strategy"]');
    await expect(page.locator('.success-message')).toContainText('thành công');

    // Apply to parts
    await page.goto('/parts');
    await page.click('[data-testid="apply-pricing-strategy"]');
    await page.selectOption('[data-testid="strategy-select"]', 'Premium Pricing');
    await page.click('[data-testid="apply-to-selected"]');

    await expect(page.locator('.pricing-updated')).toBeVisible();
  });

  test('cost forecasting generates accurate reports', async () => {
    await loginAsManager();
    await page.goto('/cost-management/forecasting');

    await page.selectOption('[data-testid="forecast-period"]', 'quarterly');
    await page.click('[data-testid="generate-forecast"]');

    await expect(page.locator('[data-testid="forecast-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-recommendation"]')).toContainText('₫');

    const exportButton = page.locator('[data-testid="export-forecast"]');
    await expect(exportButton).toBeEnabled();
  });
});
```

## Performance Requirements
- Cost calculations phải complete trong <500ms
- Financial reports generation trong <3 seconds cho 1 năm data
- Budget alerts phải trigger trong <1 second sau transaction
- Pricing updates phải propagate trong <200ms
- Competitive analysis phải refresh trong <2 seconds
- ROI dashboard phải load trong <1.5 seconds

## Security Requirements
- Pricing strategies chỉ accessible bởi managers và admins
- Financial data phải encrypted at rest và in transit
- Budget information cần audit logging cho tất cả changes
- Cost data phải có access controls theo user roles
- Export functionality cần rate limiting (5 exports/hour/user)

## Accessibility Requirements
- Tất cả charts phải có alternative text descriptions
- Color-coding phải có additional visual indicators
- Keyboard navigation cho tất cả interactive elements
- Screen reader support cho financial data tables
- High contrast mode cho dashboard elements

## Mobile Optimization
- Cost summaries phải readable trên mobile screens
- Charts phải responsive và touch-friendly
- Quick actions accessible via swipe gestures
- Offline capability cho basic cost lookups
- Performance optimized cho slower mobile connections