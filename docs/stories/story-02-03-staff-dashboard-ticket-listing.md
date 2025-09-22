# Story 02.3: Staff Dashboard & Ticket Listing

## User Story

**As a** repair shop staff member,
**I want** a comprehensive dashboard với intelligent ticket listing và management features,
**So that** tôi có thể efficiently track workload, prioritize tasks, và monitor shop performance.

## Story Context

**Dashboard Philosophy:**
- Overview-first design với actionable insights
- Role-based view customization (staff vs shop_owner)
- Real-time data với performance optimization
- Mobile-first responsive design cho on-the-go access
- Quick actions cho common operations

**Business Intelligence:**
- Today's priorities và overdue items
- Workload distribution và team collaboration
- Customer satisfaction indicators
- Performance metrics và trend analysis

## Acceptance Criteria

### **Dashboard Overview Requirements:**

**AC-DO1: Key Performance Indicators**
```gherkin
GIVEN staff member accessing dashboard
WHEN KPI widgets are displayed
THEN shows today's ticket metrics:
  - New tickets received today
  - Tickets completed today
  - Tickets awaiting customer approval
  - Tickets ready for pickup
  - Overdue tickets (past SLA)
AND metrics update in real-time
AND data is accurate to within 30 seconds
```

**AC-DO2: Quick Action Panel**
```gherkin
GIVEN dashboard main view
WHEN quick actions are displayed
THEN prominent "New Ticket" button available
AND quick status updates for recent tickets
AND shortcut to customer lookup
AND access to daily task checklist
AND emergency/priority ticket alerts
```

**AC-DO3: Staff Performance Overview**
```gherkin
GIVEN staff dashboard view
WHEN performance data is shown
THEN displays assigned ticket count
AND average completion time
AND customer satisfaction rating
AND productivity trends (weekly/monthly)
AND team comparison metrics (if shop_owner)
```

### **Ticket Listing Requirements:**

**AC-TL1: Advanced Filtering System**
```gherkin
GIVEN ticket listing page
WHEN filters are applied
THEN filter by status (multiple selection)
AND filter by assigned staff member
AND filter by date range (created, updated, due)
AND filter by customer phone/name
AND filter by device type
AND filter by priority level
AND filters persist across sessions
AND filter combinations work correctly
```

**AC-TL2: Smart Search Functionality**
```gherkin
GIVEN ticket search interface
WHEN search is performed
THEN search by ticket code (exact match)
AND search by customer phone (partial match)
AND search by customer name (fuzzy search)
AND search by device model (partial match)
AND search by issue description (full-text)
AND search results highlight matching terms
AND search history is maintained
```

**AC-TL3: Sorting & Pagination**
```gherkin
GIVEN large number of tickets
WHEN listing is displayed
THEN sort by creation date (newest/oldest)
AND sort by last update time
AND sort by status priority
AND sort by assigned staff
AND sort by customer name
AND pagination với configurable page sizes (25/50/100)
AND total count displayed
AND infinite scroll option for mobile
```

**AC-TL4: Ticket List Display Optimization**
```gherkin
GIVEN ticket listing view
WHEN tickets are displayed
THEN shows essential info: ticket code, customer name, device, status, assigned staff, last update
AND status is color-coded và easily recognizable
AND overdue tickets are visually highlighted
AND priority tickets are marked distinctly
AND row actions available: view, edit, status change
AND bulk selection for mass operations
```

### **Dashboard Customization Requirements:**

**AC-DC1: Widget Configuration**
```gherkin
GIVEN dashboard customization mode
WHEN user personalizes layout
THEN widgets can be reordered via drag-and-drop
AND widgets can be resized (where applicable)
AND widgets can be hidden/shown based on role
AND widget settings are saved per user
AND reset to default option available
```

**AC-DC2: Role-based View Differences**
```gherkin
GIVEN different user roles
WHEN dashboard is displayed
THEN staff sees personal workload focus
AND shop_owner sees team management overview
AND shop_owner gets additional widgets: team performance, revenue metrics, inventory alerts
AND sensitive financial data only visible to shop_owner
AND admin functions clearly separated
```

**AC-DC3: Notification & Alert System**
```gherkin
GIVEN dashboard notification system
WHEN alerts are triggered
THEN overdue ticket alerts are prominent
AND customer pickup reminders displayed
AND low inventory warnings shown (shop_owner)
AND system maintenance notifications visible
AND alerts can be dismissed/acknowledged
AND notification preferences can be configured
```

### **Performance & Responsiveness Requirements:**

**AC-PR1: Dashboard Load Performance**
```gherkin
GIVEN dashboard access
WHEN page loads
THEN initial load completes within 2 seconds
AND progressive data loading for secondary widgets
AND skeleton loading states during data fetch
AND graceful degradation if some data unavailable
AND caching strategy for frequently accessed data
```

**AC-PR2: Real-time Data Updates**
```gherkin
GIVEN dashboard active sessions
WHEN data changes occur
THEN new tickets appear immediately
AND status changes reflect across all connected clients
AND assignment changes trigger notifications
AND counter updates happen without page refresh
AND real-time updates don't disrupt user interaction
```

**AC-PR3: Mobile Responsiveness**
```gherkin
GIVEN mobile device access
WHEN dashboard is used
THEN layout adapts to small screens
AND touch-friendly interface elements
AND swipe gestures for navigation
AND critical information prioritized
AND performance remains acceptable on mobile
```

### **Analytics & Reporting Requirements:**

**AC-AR1: Operational Analytics**
```gherkin
GIVEN analytics widget on dashboard
WHEN operational data is displayed
THEN shows ticket volume trends (daily/weekly)
AND average repair time by device type
AND status bottleneck identification
AND staff workload distribution
AND customer satisfaction trends
```

**AC-AR2: Business Intelligence**
```gherkin
GIVEN shop_owner dashboard view
WHEN business metrics are shown
THEN revenue trends và monthly comparisons
AND most common repair types
AND peak hours/days analysis
AND customer retention metrics
AND profitability by repair type
```

**AC-AR3: Export & Reporting**
```gherkin
GIVEN reporting requirements
WHEN export functions are used
THEN ticket data export to CSV/Excel
AND dashboard snapshots for presentations
AND custom date range reports
AND filtered data export capabilities
AND automated daily/weekly summary emails
```

### **Collaborative Features Requirements:**

**AC-CF1: Team Communication**
```gherkin
GIVEN collaborative work environment
WHEN team features are used
THEN activity feed shows recent team actions
AND @mention system for staff communication
AND ticket assignment notifications
AND shared notes/announcements visible
AND team status indicators (online/busy/away)
```

**AC-CF2: Workload Management**
```gherkin
GIVEN team workload balancing
WHEN assignment decisions are made
THEN workload distribution visualization
AND auto-suggestion for ticket assignments
AND capacity alerts when staff overloaded
AND easy ticket reassignment functionality
AND load balancing recommendations
```

## Technical Implementation Details

### **Dashboard Data Hook:**
```typescript
export function useDashboardData() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch KPI data
        const kpiData = await Promise.all([
          getTodayTicketStats(),
          getOverdueTickets(),
          getTicketsReadyForPickup(),
          getAwaitingApprovalTickets()
        ]);

        // Fetch personal workload
        const personalData = await Promise.all([
          getAssignedTickets(user.id),
          getPersonalPerformanceMetrics(user.id)
        ]);

        // Fetch team data if shop owner
        let teamData = null;
        if (user.role === 'shop_owner') {
          teamData = await Promise.all([
            getTeamPerformanceMetrics(),
            getInventoryAlerts(),
            getRevenueMetrics()
          ]);
        }

        setDashboardData({
          kpi: {
            todayStats: kpiData[0],
            overdueTickets: kpiData[1],
            readyForPickup: kpiData[2],
            awaitingApproval: kpiData[3]
          },
          personal: {
            assignedTickets: personalData[0],
            performance: personalData[1]
          },
          team: teamData ? {
            performance: teamData[0],
            inventory: teamData[1],
            revenue: teamData[2]
          } : null
        });

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const subscriptions = [
      supabase
        .channel('dashboard-tickets')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'repair_tickets'
        }, handleTicketChange)
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user]);

  return { dashboardData, isLoading };
}
```

### **Ticket Listing Component:**
```typescript
export function TicketListingView() {
  const [filters, setFilters] = useState<TicketFilters>({
    status: [],
    assignedTo: null,
    dateRange: null,
    searchTerm: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'updated_at',
    direction: 'desc'
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  const {
    tickets,
    totalCount,
    isLoading,
    pagination,
    setPagination
  } = useTicketListing({ filters, sortConfig });

  const handleBulkStatusUpdate = async (newStatus: TicketStatus) => {
    try {
      await Promise.all(
        selectedTickets.map(ticketId =>
          updateTicketStatus(ticketId, newStatus)
        )
      );

      toast.success(`Đã cập nhật ${selectedTickets.length} phiếu sang "${getStatusLabel(newStatus)}"`);
      setSelectedTickets([]);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hàng loạt');
    }
  };

  const handleSearch = useMemo(
    () => debounce((searchTerm: string) => {
      setFilters(prev => ({ ...prev, searchTerm }));
    }, 300),
    []
  );

  return (
    <div className="ticket-listing">
      {/* Filter Bar */}
      <TicketFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTickets.length}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkAssignment={handleBulkAssignment}
          onClearSelection={() => setSelectedTickets([])}
        />
      )}

      {/* Ticket Table */}
      <TicketTable
        tickets={tickets}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        selectedTickets={selectedTickets}
        onSelectionChange={setSelectedTickets}
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
    </div>
  );
}
```

### **Dashboard Widget System:**
```typescript
interface WidgetProps {
  title: string;
  data: any;
  isLoading?: boolean;
  error?: string;
  refreshData?: () => void;
}

export function DashboardWidget({ title, data, isLoading, error, refreshData }: WidgetProps) {
  return (
    <Card className="dashboard-widget">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {refreshData && (
            <Button variant="ghost" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refreshData} />
        ) : (
          <WidgetContent data={data} />
        )}
      </CardContent>
    </Card>
  );
}

// Specific widgets
export function TodayStatsWidget({ data }: { data: TodayStats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Phiếu mới"
        value={data.newTickets}
        trend={data.newTicketsTrend}
        icon={<Plus className="h-4 w-4" />}
      />
      <StatCard
        label="Hoàn thành"
        value={data.completedTickets}
        trend={data.completedTrend}
        icon={<CheckCircle className="h-4 w-4" />}
      />
      <StatCard
        label="Chờ nhận"
        value={data.readyForPickup}
        urgent={data.readyForPickup > 5}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        label="Quá hạn"
        value={data.overdueTickets}
        urgent={data.overdueTickets > 0}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Staff Dashboard & Ticket Listing**
```typescript
describe('Staff Dashboard & Ticket Listing', () => {
  test('AC-DO1: KPI widgets display correctly', async () => {
    // Mock dashboard data
    mockSupabaseQuery('dashboard_stats', {
      newTickets: 5,
      completedTickets: 8,
      readyForPickup: 3,
      overdueTickets: 1
    });

    const { getByTestId } = render(<StaffDashboard />);

    await waitFor(() => {
      expect(getByTestId('new-tickets-count')).toHaveTextContent('5');
      expect(getByTestId('completed-tickets-count')).toHaveTextContent('8');
      expect(getByTestId('ready-pickup-count')).toHaveTextContent('3');
      expect(getByTestId('overdue-count')).toHaveTextContent('1');
    });
  });

  test('AC-TL1: Advanced filtering works correctly', async () => {
    const { getByTestId, getByText } = render(<TicketListingView />);

    // Apply multiple filters
    fireEvent.click(getByTestId('status-filter'));
    fireEvent.click(getByText('Đang sửa chữa'));
    fireEvent.click(getByText('Chờ linh kiện'));

    fireEvent.change(getByTestId('assigned-to-filter'), {
      target: { value: 'staff-123' }
    });

    // Verify API call với correct filters
    await waitFor(() => {
      expect(mockSupabaseQuery).toHaveBeenCalledWith(
        'repair_tickets',
        expect.objectContaining({
          status: ['in_repair', 'waiting_parts'],
          assigned_to: 'staff-123'
        })
      );
    });
  });

  test('AC-TL2: Smart search functionality', async () => {
    const { getByTestId } = render(<TicketListingView />);
    const searchInput = getByTestId('search-input');

    // Test ticket code search
    fireEvent.change(searchInput, { target: { value: 'LRP-2025-000001' } });

    await waitFor(() => {
      expect(mockSupabaseQuery).toHaveBeenCalledWith(
        'repair_tickets',
        expect.objectContaining({
          ticket_code: { eq: 'LRP-2025-000001' }
        })
      );
    });

    // Test fuzzy customer name search
    fireEvent.change(searchInput, { target: { value: 'Nguyen Van' } });

    await waitFor(() => {
      expect(mockSupabaseQuery).toHaveBeenCalledWith(
        'customers',
        expect.objectContaining({
          full_name: { ilike: '%Nguyen Van%' }
        })
      );
    });
  });

  test('AC-PR2: Real-time updates work correctly', async () => {
    const { getByTestId } = render(<StaffDashboard />);

    // Simulate real-time ticket creation
    act(() => {
      mockSupabaseRealtimeUpdate('repair_tickets', {
        event: 'INSERT',
        new: {
          id: 'new-ticket-123',
          ticket_code: 'LRP-2025-000002',
          status: 'device_received'
        }
      });
    });

    await waitFor(() => {
      expect(getByTestId('new-tickets-count')).toHaveTextContent('6'); // Incremented
    });
  });

  test('AC-DC1: Widget configuration persists', async () => {
    const { getByTestId } = render(<DashboardWithCustomization />);

    // Enter customization mode
    fireEvent.click(getByTestId('customize-dashboard'));

    // Hide a widget
    fireEvent.click(getByTestId('hide-revenue-widget'));

    // Save configuration
    fireEvent.click(getByTestId('save-configuration'));

    // Reload component
    cleanup();
    const { queryByTestId } = render(<DashboardWithCustomization />);

    expect(queryByTestId('revenue-widget')).not.toBeInTheDocument();
  });

  test('AC-CF1: Team communication features', async () => {
    const { getByTestId, getByText } = render(<StaffDashboard />);

    // Test @mention in activity feed
    fireEvent.click(getByTestId('activity-feed'));

    expect(getByText(/@Nguyễn Văn A đã cập nhật phiếu/)).toBeInTheDocument();

    // Test notification for assignment
    act(() => {
      mockSupabaseRealtimeUpdate('repair_tickets', {
        event: 'UPDATE',
        new: { assigned_to: currentUser.id },
        old: { assigned_to: 'other-user' }
      });
    });

    await waitFor(() => {
      expect(getByTestId('assignment-notification')).toBeInTheDocument();
    });
  });

  test('AC-PR1: Dashboard load performance', async () => {
    const startTime = Date.now();

    render(<StaffDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // < 2 seconds requirement
  });
});
```

### **Performance Optimization:**
```typescript
// Memoized widgets to prevent unnecessary re-renders
export const TodayStatsWidget = memo(({ data }: { data: TodayStats }) => {
  return (
    <div className="stats-grid">
      {/* Widget content */}
    </div>
  );
});

// Virtual scrolling for large ticket lists
export function VirtualizedTicketList({ tickets }: { tickets: RepairTicket[] }) {
  return (
    <VirtualList
      height={600}
      itemCount={tickets.length}
      itemSize={80}
      itemData={tickets}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <TicketListItem ticket={data[index]} />
        </div>
      )}
    </VirtualList>
  );
}

// Efficient search với debouncing and caching
export function useSearchWithCache(searchTerm: string) {
  const [cache, setCache] = useState<Map<string, any>>(new Map());

  const debouncedSearch = useMemo(
    () => debounce(async (term: string) => {
      if (cache.has(term)) {
        return cache.get(term);
      }

      const results = await searchTickets(term);
      setCache(prev => new Map(prev).set(term, results));
      return results;
    }, 300),
    [cache]
  );

  return debouncedSearch;
}
```

## Definition of Done

- [ ] **AC-DO1:** KPI widgets display correctly và update real-time
- [ ] **AC-DO2:** Quick action panel functional
- [ ] **AC-DO3:** Staff performance overview complete
- [ ] **AC-TL1:** Advanced filtering system working
- [ ] **AC-TL2:** Smart search functionality implemented
- [ ] **AC-TL3:** Sorting & pagination functional
- [ ] **AC-TL4:** Ticket list display optimized
- [ ] **AC-DC1:** Widget configuration persists
- [ ] **AC-DC2:** Role-based view differences implemented
- [ ] **AC-DC3:** Notification & alert system functional
- [ ] **AC-PR1:** Dashboard load performance meets requirements
- [ ] **AC-PR2:** Real-time data updates working
- [ ] **AC-PR3:** Mobile responsiveness verified
- [ ] **AC-AR1:** Operational analytics available
- [ ] **AC-AR2:** Business intelligence for shop owners
- [ ] **AC-AR3:** Export & reporting functional
- [ ] **AC-CF1:** Team communication features working
- [ ] **AC-CF2:** Workload management tools available
- [ ] **Performance Tests:** Load testing với 1000+ tickets
- [ ] **Usability Tests:** User experience validation
- [ ] **Accessibility Tests:** WCAG 2.1 compliance

## Risk Mitigation

- **Primary Risk:** Dashboard performance degradation với large datasets
- **Mitigation:** Virtual scrolling, data pagination, caching strategies
- **Rollback Plan:** Fallback to simple list views, performance monitoring alerts

## Story Dependencies

- **Prerequisites:** Story 02.2 (Ticket Status Workflow)
- **Enables:** Advanced reporting, team management features
- **Estimated Effort:** 4-5 days
- **Priority:** High (core staff productivity tool)