# Story 03.1: Public Ticket Lookup System

## User Story

**As a** customer,
**I want** to lookup my repair ticket status using my phone number without requiring account registration,
**So that** tôi có thể easily track repair progress và know when my device is ready for pickup.

## Story Context

**Customer-First Design:**
- No authentication required - simplicity first
- Phone number as only identifier (matches Vietnamese business practice)
- Customer-friendly status translations
- Clear information hierarchy với essential details only
- Mobile-optimized cho on-the-go checking

**Security & Privacy:**
- Public access với carefully filtered data
- No internal information exposure
- Rate limiting to prevent abuse
- Data protection for customer privacy

## Acceptance Criteria

### **Search Interface Requirements:**

**AC-SI1: Phone Number Search Interface**
```gherkin
GIVEN customer accessing ticket lookup page
WHEN search interface is displayed
THEN shows prominent phone number input field
AND input accepts Vietnamese phone formats
AND search is triggered by "Enter" key or search button
AND clear placeholder text: "Nhập số điện thoại để tra cứu phiếu sửa chữa"
AND search history is not stored (privacy)
```

**AC-SI2: Input Validation & Formatting**
```gherkin
GIVEN phone number input
WHEN customer enters phone number
THEN auto-formats input với spaces (0901 234 567)
AND accepts formats: 0xxx xxx xxx, +84 xxx xxx xxx, 0xx xxx xxxx
AND invalid format shows helpful error message
AND validation happens in real-time
AND international format is converted to local format
```

**AC-SI3: Search Experience Optimization**
```gherkin
GIVEN customer search interaction
WHEN search is performed
THEN search loads within 2 seconds
AND loading indicator shows during search
AND empty results show helpful message
AND search can be performed multiple times
AND no rate limiting for reasonable usage (<10 searches/minute)
```

### **Search Results Requirements:**

**AC-SR1: Ticket Results Display**
```gherkin
GIVEN valid phone number search
WHEN tickets are found
THEN displays all tickets for that phone number
AND tickets sorted by most recent first
AND each ticket shows: ticket code, device type, customer-friendly status, date created
AND ticket count displayed: "Tìm thấy X phiếu sửa chữa"
AND pagination if more than 10 tickets
```

**AC-SR2: Customer-Friendly Status Translation**
```gherkin
GIVEN ticket status display
WHEN internal status is translated
THEN status translations are customer-appropriate:
  - device_received → "Đã tiếp nhận thiết bị"
  - preliminary_inspection → "Đang kiểm tra ban đầu"
  - awaiting_repair_plan → "Đang lập kế hoạch sửa chữa"
  - approved_for_repair → "Đã xác nhận sửa chữa"
  - in_diagnosis → "Đang chẩn đoán sự cố"
  - waiting_parts → "Đang đặt hàng linh kiện"
  - in_repair → "Đang thực hiện sửa chữa"
  - quality_testing → "Đang kiểm tra chất lượng"
  - ready_for_pickup → "Sẵn sàng nhận máy"
  - completed → "Đã hoàn thành"
  - cannot_repair → "Không thể sửa chữa"
  - cancelled_by_customer → "Đã hủy theo yêu cầu"
AND status includes estimated timeframe where appropriate
```

**AC-SR3: Essential Information Display**
```gherkin
GIVEN ticket detail view
WHEN customer views ticket information
THEN shows customer-relevant information only:
  - Ticket code và creation date
  - Device type và model (if provided)
  - Current status với clear description
  - Last update timestamp
  - Warranty expiration date (if applicable)
  - Contact information for questions
AND hides internal information: cost, staff notes, photos, assigned technician
```

### **No Results & Error Handling Requirements:**

**AC-NR1: No Results Handling**
```gherkin
GIVEN phone number search với no results
WHEN search completes
THEN shows friendly "no tickets found" message
AND suggests double-checking phone number
AND provides shop contact information
AND suggests visiting shop if device was dropped off
AND maintains positive, helpful tone
```

**AC-NR2: Error State Management**
```gherkin
GIVEN search system errors
WHEN errors occur
THEN network errors show retry option
AND server errors show generic "system temporarily unavailable"
AND search remains functional after error recovery
AND error messages are in Vietnamese
AND contact information provided for urgent needs
```

**AC-NR3: Invalid Input Handling**
```gherkin
GIVEN invalid phone number input
WHEN validation fails
THEN shows specific error message for format issue
AND highlights invalid characters
AND provides example of correct format
AND error message disappears when input is corrected
AND search button remains disabled until valid input
```

### **Ticket Detail View Requirements:**

**AC-TD1: Individual Ticket Information**
```gherkin
GIVEN customer clicking on specific ticket
WHEN ticket detail is displayed
THEN shows expanded ticket information
AND includes repair progress timeline (customer-appropriate milestones)
AND displays warranty information clearly
AND shows next expected step (if applicable)
AND provides estimated completion date (if available)
```

**AC-TD2: Communication Information**
```gherkin
GIVEN ticket detail view
WHEN customer needs to contact shop
THEN prominent shop contact information displayed
AND business hours clearly shown
AND location/address information
AND preferred communication methods
AND emergency contact (if applicable)
```

**AC-TD3: Warranty Information Display**
```gherkin
GIVEN completed ticket với warranty
WHEN warranty information is shown
THEN warranty period clearly displayed
AND warranty terms summary (customer-friendly)
AND warranty expiration date
AND instructions for warranty claims
AND contact information for warranty issues
```

### **Mobile Optimization Requirements:**

**AC-MO1: Mobile-First Design**
```gherkin
GIVEN mobile device access
WHEN ticket lookup is used
THEN layout optimized for small screens
AND touch-friendly input elements
AND readable font sizes without zooming
AND fast loading on mobile connections
AND works well on both iOS and Android browsers
```

**AC-MO2: Mobile Interaction Patterns**
```gherkin
GIVEN mobile user interactions
WHEN using lookup system
THEN phone input triggers numeric keyboard
AND search results are easy to scroll
AND tap targets are appropriately sized
AND swipe gestures work for navigation
AND back button behavior is correct
```

**AC-MO3: Offline Capability**
```gherkin
GIVEN poor mobile connectivity
WHEN customer attempts lookup
THEN previous search results cached for offline viewing
AND offline indicator shown when no connection
AND automatic retry when connection restored
AND graceful degradation of features
```

### **Performance Requirements:**

**AC-PR1: Search Performance**
```gherkin
GIVEN customer search requests
WHEN performance is measured
THEN search results load within 2 seconds
AND page initial load under 3 seconds
AND images/assets optimized for mobile
AND minimal data usage for mobile users
AND search works reliably under normal load
```

**AC-PR2: Caching & Optimization**
```gherkin
GIVEN repeated searches and page loads
WHEN caching is utilized
THEN static assets cached appropriately
AND search results cached for 5 minutes
AND page reload minimizes data transfer
AND CDN usage for static content
AND progressive loading for better perceived performance
```

### **Security & Privacy Requirements:**

**AC-SP1: Data Protection**
```gherkin
GIVEN public access to customer data
WHEN security measures are applied
THEN no sensitive information exposed in public API
AND customer personal data filtered from results
AND search logs do not store phone numbers
AND rate limiting prevents data harvesting
AND HTTPS required for all communications
```

**AC-SP2: Abuse Prevention**
```gherkin
GIVEN potential system abuse
WHEN protection measures are active
THEN search rate limited to prevent enumeration
AND suspicious activity detection
AND IP-based throttling for excessive requests
AND no bulk data export capabilities
AND search results limited to prevent scraping
```

## Technical Implementation Details

### **Public Search API:**
```typescript
// Public search function with privacy filtering
export async function searchPublicTickets(phone: string): Promise<PublicTicketView[]> {
  // Validate phone number format
  if (!isValidVietnamesePhone(phone)) {
    throw new Error('Invalid phone number format');
  }

  // Apply rate limiting
  await checkRateLimit(getClientIP(), 'ticket_search');

  // Search with privacy-filtered fields
  const { data, error } = await supabase
    .rpc('public_ticket_search', { search_phone: phone });

  if (error) throw error;

  return data.map(ticket => ({
    ticket_code: ticket.ticket_code,
    device_type: ticket.device_type,
    device_model: ticket.device_model,
    status_display: translateStatusForCustomer(ticket.status),
    created_at: ticket.created_at,
    last_updated: ticket.updated_at,
    warranty_until: ticket.warranty_until,
    estimated_completion: calculateEstimatedCompletion(ticket)
  }));
}

// Customer-friendly status translation
function translateStatusForCustomer(internalStatus: TicketStatus): string {
  const translations: Record<TicketStatus, string> = {
    device_received: 'Đã tiếp nhận thiết bị',
    preliminary_inspection: 'Đang kiểm tra ban đầu',
    awaiting_repair_plan: 'Đang lập kế hoạch sửa chữa',
    approved_for_repair: 'Đã xác nhận sửa chữa',
    in_diagnosis: 'Đang chẩn đoán sự cố',
    waiting_parts: 'Đang đặt hàng linh kiện',
    in_repair: 'Đang thực hiện sửa chữa',
    quality_testing: 'Đang kiểm tra chất lượng',
    ready_for_pickup: 'Sẵn sàng nhận máy',
    completed: 'Đã hoàn thành',
    cannot_repair: 'Không thể sửa chữa',
    cancelled_by_customer: 'Đã hủy theo yêu cầu',
    repair_failed: 'Gặp khó khăn trong sửa chữa',
    customer_no_show: 'Chờ khách hàng liên hệ',
    ready_for_return: 'Sẵn sàng trả máy',
    abandoned: 'Vui lòng liên hệ cửa hàng'
  };

  return translations[internalStatus] || 'Đang xử lý';
}
```

### **Ticket Lookup Component:**
```typescript
export function PublicTicketLookup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResults, setSearchResults] = useState<PublicTicketView[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    const formatted = formatVietnamesePhone(value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSearch = async () => {
    if (!isValidVietnamesePhone(phoneNumber)) {
      setError('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchPublicTickets(phoneNumber);
      setSearchResults(results);
    } catch (error) {
      if (error.message.includes('rate limit')) {
        setError('Quá nhiều lần tra cứu. Vui lòng thử lại sau ít phút.');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ cửa hàng.');
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="public-ticket-lookup">
      <div className="search-section">
        <h1 className="page-title">Tra cứu phiếu sửa chữa</h1>
        <p className="page-description">
          Nhập số điện thoại để kiểm tra tình trạng thiết bị của bạn
        </p>

        <div className="search-form">
          <div className="phone-input-group">
            <Input
              type="tel"
              placeholder="Nhập số điện thoại (VD: 0901 234 567)"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="phone-input"
              disabled={isSearching}
            />
            <Button
              onClick={handleSearch}
              disabled={!phoneNumber || isSearching}
              className="search-button"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tìm...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Tra cứu
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="search-results">
          {searchResults.length > 0 ? (
            <>
              <h2 className="results-title">
                Tìm thấy {searchResults.length} phiếu sửa chữa
              </h2>
              <div className="ticket-list">
                {searchResults.map(ticket => (
                  <PublicTicketCard key={ticket.ticket_code} ticket={ticket} />
                ))}
              </div>
            </>
          ) : (
            <NoResultsMessage phoneNumber={phoneNumber} />
          )}
        </div>
      )}

      <ContactInformation />
    </div>
  );
}
```

### **Database Function for Public Search:**
```sql
-- Public ticket search function với privacy filtering
CREATE OR REPLACE FUNCTION public_ticket_search(search_phone VARCHAR(20))
RETURNS TABLE (
  ticket_code VARCHAR(20),
  device_type VARCHAR(100),
  device_model VARCHAR(100),
  status ticket_status,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  warranty_until DATE
) SECURITY DEFINER AS $$
BEGIN
  -- Apply rate limiting (implement in application layer)

  RETURN QUERY
  SELECT
    rt.ticket_code,
    rt.device_type,
    rt.device_model,
    rt.status,
    rt.created_at,
    rt.updated_at,
    rt.warranty_until
  FROM repair_tickets rt
  WHERE rt.customer_phone = search_phone
  ORDER BY rt.created_at DESC
  LIMIT 50; -- Prevent excessive data exposure

END;
$$ LANGUAGE plpgsql;

-- Grant execution to anon role
GRANT EXECUTE ON FUNCTION public_ticket_search(VARCHAR) TO anon;
```

### **Automated Testing Scenarios:**

**Test Suite: Public Ticket Lookup System**
```typescript
describe('Public Ticket Lookup System', () => {
  test('AC-SI1: Phone number search interface', async () => {
    const { getByPlaceholderText, getByRole } = render(<PublicTicketLookup />);

    expect(getByPlaceholderText(/Nhập số điện thoại/)).toBeInTheDocument();
    expect(getByRole('button', { name: /Tra cứu/ })).toBeInTheDocument();

    // Test Enter key trigger
    const input = getByPlaceholderText(/Nhập số điện thoại/);
    fireEvent.change(input, { target: { value: '0901234567' } });
    fireEvent.keyPress(input, { key: 'Enter' });

    expect(mockSearchTickets).toHaveBeenCalledWith('0901234567');
  });

  test('AC-SI2: Input validation & formatting', async () => {
    const { getByPlaceholderText } = render(<PublicTicketLookup />);
    const input = getByPlaceholderText(/Nhập số điện thoại/);

    // Test auto-formatting
    fireEvent.change(input, { target: { value: '0901234567' } });
    expect(input.value).toBe('0901 234 567');

    // Test international format conversion
    fireEvent.change(input, { target: { value: '+84901234567' } });
    expect(input.value).toBe('0901 234 567');

    // Test invalid format
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText(/số điện thoại hợp lệ/)).toBeInTheDocument();
    });
  });

  test('AC-SR2: Customer-friendly status translation', () => {
    expect(translateStatusForCustomer('device_received')).toBe('Đã tiếp nhận thiết bị');
    expect(translateStatusForCustomer('in_repair')).toBe('Đang thực hiện sửa chữa');
    expect(translateStatusForCustomer('ready_for_pickup')).toBe('Sẵn sàng nhận máy');
    expect(translateStatusForCustomer('completed')).toBe('Đã hoàn thành');
  });

  test('AC-SR3: Essential information display only', async () => {
    const mockTickets = [
      {
        ticket_code: 'LRP-2025-000001',
        device_type: 'Laptop',
        status_display: 'Đang sửa chữa',
        created_at: '2025-01-22T10:00:00Z',
        warranty_until: '2025-07-22'
      }
    ];

    mockSearchPublicTickets.mockResolvedValue(mockTickets);

    const { getByText, queryByText } = render(<PublicTicketLookup />);

    // Perform search
    const input = screen.getByPlaceholderText(/Nhập số điện thoại/);
    fireEvent.change(input, { target: { value: '0901234567' } });
    fireEvent.click(screen.getByRole('button', { name: /Tra cứu/ }));

    await waitFor(() => {
      // Should show customer-relevant info
      expect(getByText('LRP-2025-000001')).toBeInTheDocument();
      expect(getByText('Laptop')).toBeInTheDocument();
      expect(getByText('Đang sửa chữa')).toBeInTheDocument();

      // Should NOT show internal info
      expect(queryByText(/total_cost/)).not.toBeInTheDocument();
      expect(queryByText(/assigned_to/)).not.toBeInTheDocument();
      expect(queryByText(/internal_notes/)).not.toBeInTheDocument();
    });
  });

  test('AC-NR1: No results handling', async () => {
    mockSearchPublicTickets.mockResolvedValue([]);

    const { getByText } = render(<PublicTicketLookup />);

    // Perform search
    const input = screen.getByPlaceholderText(/Nhập số điện thoại/);
    fireEvent.change(input, { target: { value: '0987654321' } });
    fireEvent.click(screen.getByRole('button', { name: /Tra cứu/ }));

    await waitFor(() => {
      expect(getByText(/Không tìm thấy phiếu sửa chữa/)).toBeInTheDocument();
      expect(getByText(/Liên hệ cửa hàng/)).toBeInTheDocument();
    });
  });

  test('AC-SP2: Rate limiting protection', async () => {
    mockSearchPublicTickets.mockRejectedValue(new Error('rate limit'));

    const { getByText } = render(<PublicTicketLookup />);

    // Perform search
    const input = screen.getByPlaceholderText(/Nhập số điện thoại/);
    fireEvent.change(input, { target: { value: '0901234567' } });
    fireEvent.click(screen.getByRole('button', { name: /Tra cứu/ }));

    await waitFor(() => {
      expect(getByText(/Quá nhiều lần tra cứu/)).toBeInTheDocument();
    });
  });

  test('AC-PR1: Search performance', async () => {
    const startTime = Date.now();

    mockSearchPublicTickets.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve([]), 1500))
    );

    const { getByRole } = render(<PublicTicketLookup />);

    const input = screen.getByPlaceholderText(/Nhập số điện thoại/);
    fireEvent.change(input, { target: { value: '0901234567' } });
    fireEvent.click(getByRole('button', { name: /Tra cứu/ }));

    await waitFor(() => {
      expect(screen.getByText(/Không tìm thấy/)).toBeInTheDocument();
    });

    const searchTime = Date.now() - startTime;
    expect(searchTime).toBeLessThan(2000); // < 2 seconds requirement
  });

  test('AC-MO1: Mobile-first design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });

    const { container } = render(<PublicTicketLookup />);

    expect(container.firstChild).toHaveClass('mobile-optimized');

    const phoneInput = screen.getByPlaceholderText(/Nhập số điện thoại/);
    expect(phoneInput).toHaveAttribute('type', 'tel');
  });
});
```

### **Rate Limiting Implementation:**
```typescript
// Simple in-memory rate limiting (production would use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(clientId: string, action: string) {
  const key = `${clientId}:${action}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
    return;
  }

  if (record.count >= maxRequests) {
    throw new Error('Rate limit exceeded');
  }

  record.count++;
  rateLimitStore.set(key, record);
}
```

## Definition of Done

- [ ] **AC-SI1:** Phone number search interface functional
- [ ] **AC-SI2:** Input validation & formatting working
- [ ] **AC-SI3:** Search experience optimized
- [ ] **AC-SR1:** Ticket results display correct
- [ ] **AC-SR2:** Customer-friendly status translation implemented
- [ ] **AC-SR3:** Essential information display only
- [ ] **AC-NR1:** No results handling friendly
- [ ] **AC-NR2:** Error state management robust
- [ ] **AC-NR3:** Invalid input handling clear
- [ ] **AC-TD1:** Individual ticket information complete
- [ ] **AC-TD2:** Communication information prominent
- [ ] **AC-TD3:** Warranty information clear
- [ ] **AC-MO1:** Mobile-first design implemented
- [ ] **AC-MO2:** Mobile interaction patterns optimized
- [ ] **AC-MO3:** Offline capability functional
- [ ] **AC-PR1:** Search performance meets requirements
- [ ] **AC-PR2:** Caching & optimization implemented
- [ ] **AC-SP1:** Data protection enforced
- [ ] **AC-SP2:** Abuse prevention active
- [ ] **Security Tests:** Privacy filtering validation
- [ ] **Performance Tests:** Load testing under traffic
- [ ] **Mobile Tests:** Cross-device compatibility
- [ ] **Accessibility Tests:** Screen reader compatibility

## Risk Mitigation

- **Primary Risk:** Data privacy breach or system abuse
- **Mitigation:** Multiple security layers, rate limiting, comprehensive filtering
- **Rollback Plan:** Disable public lookup, fallback to phone-based inquiries

## Story Dependencies

- **Prerequisites:** Epic 01 complete (database, RLS policies)
- **Enables:** Public customer service capabilities
- **Estimated Effort:** 3-4 days
- **Priority:** High (customer service improvement)