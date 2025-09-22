# Story 02.1: Ticket Creation & Customer Management

## User Story

**As a** repair shop staff member,
**I want** to create new repair tickets với integrated customer management,
**So that** tôi có thể efficiently process new repair requests và maintain accurate customer records.

## Story Context

**Business Workflow:**
- Customer brings laptop for repair → Staff creates ticket
- Customer lookup by phone (auto-create if new customer)
- Ticket code auto-generation: LRP-YYYY-###### format
- Initial status: device_received
- Basic device info và issue description capture

**Technical Foundation:**
- React form với validation
- Supabase integration cho data persistence
- Real-time ticket code generation
- Customer phone number as primary key
- Integration với database schema từ Story 01.2

## Acceptance Criteria

### **Customer Management Requirements:**

**AC-CM1: Customer Lookup Functionality**
```gherkin
GIVEN staff member creating new ticket
WHEN phone number is entered
THEN system searches for existing customer
AND displays customer info if found (name, address, previous tickets)
AND shows "New Customer" indicator if not found
AND search happens in real-time (debounced input)
```

**AC-CM2: Customer Auto-Creation**
```gherkin
GIVEN new customer phone number
WHEN ticket creation is submitted
THEN new customer record is created automatically
AND customer full_name is required field
AND address field is optional
AND customer creation doesn't block ticket creation
AND creation timestamp is recorded
```

**AC-CM3: Customer Information Display**
```gherkin
GIVEN existing customer found
WHEN customer info is displayed
THEN shows full name, phone, address
AND displays previous ticket count
AND shows last repair date (if any)
AND provides link to customer history
AND allows inline editing of customer details
```

**AC-CM4: Phone Number Validation**
```gherkin
GIVEN phone number input
WHEN validation occurs
THEN Vietnamese mobile format (0xxx xxx xxx) is accepted
AND Vietnamese landline format (0xx xxx xxxx) is accepted
AND international format (+84...) is accepted
AND invalid formats show clear error message
AND formatting is applied automatically (spaces added)
```

### **Ticket Creation Requirements:**

**AC-TC1: Ticket Form Validation**
```gherkin
GIVEN ticket creation form
WHEN form validation occurs
THEN customer phone is required và valid format
AND customer name is required for new customers
AND device type is required (dropdown: Laptop, Desktop, Other)
AND device model is optional but recommended
AND issue description is required (min 10 characters)
AND all validation messages are clear và in Vietnamese
```

**AC-TC2: Ticket Code Generation**
```gherkin
GIVEN new ticket creation
WHEN ticket is saved
THEN ticket code follows format LRP-YYYY-######
AND YYYY is current year
AND ###### is sequential number (6 digits, zero-padded)
AND sequence resets each year (starts from 000001)
AND code generation is atomic (no duplicates)
AND code is displayed immediately after creation
```

**AC-TC3: Initial Ticket Status**
```gherkin
GIVEN new ticket creation
WHEN ticket is successfully created
THEN status is set to 'device_received'
AND created_at timestamp is recorded
AND assigned_to is set to current staff member
AND total_cost defaults to 0
AND parts_used is empty JSON array
AND warranty_until is null (set later)
```

**AC-TC4: Device Information Capture**
```gherkin
GIVEN device information section
WHEN device details are entered
THEN device_type dropdown includes common types
AND device_model is free text với suggestions
AND device serial number field is optional
AND device condition notes field is available
AND all device info is stored với ticket
```

### **Form User Experience Requirements:**

**AC-UX1: Responsive Form Design**
```gherkin
GIVEN ticket creation form on different devices
WHEN form is displayed
THEN layout adapts to mobile screens (responsive)
AND form fields are properly sized và accessible
AND tab navigation works correctly
AND touch inputs are optimized for mobile
AND form submission works on all devices
```

**AC-UX2: Form Auto-Save & Recovery**
```gherkin
GIVEN partially completed form
WHEN browser refresh or navigation occurs
THEN form data is preserved in local storage
AND user can recover unsaved changes
AND auto-save occurs every 30 seconds
AND recovery prompt is shown on return
AND sensitive data is cleared after 24 hours
```

**AC-UX3: Loading States & Feedback**
```gherkin
GIVEN form interactions
WHEN async operations occur
THEN customer lookup shows loading indicator
AND form submission shows progress
AND success message is displayed after creation
AND error messages are clear và actionable
AND loading states don't block other interactions
```

**AC-UX4: Form Field Enhancements**
```gherkin
GIVEN form field interactions
WHEN user interacts với fields
THEN phone number formatting applies automatically
AND device type has searchable dropdown
AND issue description has character counter
AND required fields are clearly marked
AND field help text is available where needed
```

### **Data Integration Requirements:**

**AC-DI1: Database Transaction Integrity**
```gherkin
GIVEN ticket creation với new customer
WHEN save operation occurs
THEN customer và ticket creation happen in single transaction
AND partial failures are rolled back completely
AND foreign key relationships are maintained
AND data consistency is guaranteed
AND transaction errors are handled gracefully
```

**AC-DI2: Real-time Updates**
```gherkin
GIVEN multiple staff members working
WHEN tickets are created
THEN new tickets appear in colleague's dashboards immediately
AND customer information updates are reflected real-time
AND no stale data issues occur
AND concurrent editing conflicts are handled
```

**AC-DI3: Audit Trail Creation**
```gherkin
GIVEN ticket creation process
WHEN ticket is successfully created
THEN creation event is logged với staff member ID
AND initial status change is recorded
AND customer creation (if new) is logged
AND timestamps are accurate và timezone-consistent
```

### **Business Rules Requirements:**

**AC-BR1: Staff Assignment Rules**
```gherkin
GIVEN ticket creation
WHEN assigning staff member
THEN creator is assigned by default
AND assignment can be changed to any active staff
AND deactivated staff cannot be assigned
AND assignment history is maintained
```

**AC-BR2: Customer Relationship Management**
```gherkin
GIVEN customer với existing tickets
WHEN new ticket is created
THEN customer's total repair count is updated
AND customer loyalty status can be calculated
AND repeat customer indicators are shown
AND customer communication preferences are respected
```

**AC-BR3: Business Hour Validation**
```gherkin
GIVEN ticket creation outside business hours
WHEN creation timestamp is recorded
THEN actual creation time is preserved
AND business day calculation considers Vietnamese holidays
AND next business day estimates are provided
AND after-hours creation is flagged appropriately
```

## Technical Implementation Details

### **Customer Lookup Hook:**
```typescript
export function useCustomerLookup() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const lookupCustomer = useMemo(
    () => debounce(async (phone: string) => {
      if (!isValidVietnamesePhone(phone)) return;

      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('customers')
          .select('*, repair_tickets(count)')
          .eq('phone', phone)
          .single();

        if (data) {
          setCustomer(data);
          setIsNewCustomer(false);
        } else {
          setCustomer(null);
          setIsNewCustomer(true);
        }
      } catch (error) {
        setCustomer(null);
        setIsNewCustomer(true);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  return { customer, isLoading, isNewCustomer, lookupCustomer };
}
```

### **Ticket Creation Component:**
```typescript
export function TicketCreateForm() {
  const { customer, isLoading, isNewCustomer, lookupCustomer } = useCustomerLookup();
  const [formData, setFormData] = useState<TicketFormData>({
    customerPhone: '',
    customerName: '',
    customerAddress: '',
    deviceType: '',
    deviceModel: '',
    issueDescription: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create customer if new
      if (isNewCustomer) {
        await supabase.from('customers').insert({
          phone: formData.customerPhone,
          full_name: formData.customerName,
          address: formData.customerAddress
        });
      }

      // Generate ticket code
      const ticketCode = await generateTicketCode();

      // Create ticket
      const { data: ticket } = await supabase
        .from('repair_tickets')
        .insert({
          ticket_code: ticketCode,
          customer_phone: formData.customerPhone,
          device_type: formData.deviceType,
          device_model: formData.deviceModel,
          issue_description: formData.issueDescription,
          status: 'device_received',
          assigned_to: currentUser.id
        })
        .select()
        .single();

      // Success handling
      toast.success(`Ticket ${ticketCode} đã được tạo thành công!`);
      navigate(`/phieu-sua-chua/${ticket.id}`);

    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo phiếu sửa chữa');
      console.error('Ticket creation error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer section */}
      <CustomerLookupSection
        phone={formData.customerPhone}
        onPhoneChange={(phone) => {
          setFormData(prev => ({ ...prev, customerPhone: phone }));
          lookupCustomer(phone);
        }}
        customer={customer}
        isLoading={isLoading}
        isNewCustomer={isNewCustomer}
      />

      {/* Device section */}
      <DeviceInfoSection
        deviceType={formData.deviceType}
        deviceModel={formData.deviceModel}
        onDeviceTypeChange={(type) => setFormData(prev => ({ ...prev, deviceType: type }))}
        onDeviceModelChange={(model) => setFormData(prev => ({ ...prev, deviceModel: model }))}
      />

      {/* Issue section */}
      <IssueDescriptionSection
        description={formData.issueDescription}
        onChange={(desc) => setFormData(prev => ({ ...prev, issueDescription: desc }))}
      />

      <Button type="submit" disabled={!isFormValid}>
        Tạo phiếu sửa chữa
      </Button>
    </form>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Ticket Creation & Customer Management**
```typescript
describe('Ticket Creation & Customer Management', () => {
  test('AC-CM1: Customer lookup functionality', async () => {
    const { result } = renderHook(() => useCustomerLookup());

    // Mock existing customer
    mockSupabaseQuery('customers', {
      phone: '0901234567',
      full_name: 'Nguyễn Văn A',
      repair_tickets: [{ count: 3 }]
    });

    await act(async () => {
      result.current.lookupCustomer('0901234567');
    });

    expect(result.current.customer).toEqual({
      phone: '0901234567',
      full_name: 'Nguyễn Văn A'
    });
    expect(result.current.isNewCustomer).toBe(false);
  });

  test('AC-TC2: Ticket code generation', async () => {
    // Mock sequence function
    mockSupabaseRPC('generate_ticket_code', 'LRP-2025-000001');

    const ticketCode = await generateTicketCode();

    expect(ticketCode).toMatch(/^LRP-\d{4}-\d{6}$/);
    expect(ticketCode).toBe('LRP-2025-000001');
  });

  test('AC-CM4: Phone number validation', () => {
    // Valid formats
    expect(isValidVietnamesePhone('0901234567')).toBe(true);
    expect(isValidVietnamesePhone('+84901234567')).toBe(true);
    expect(isValidVietnamesePhone('0281234567')).toBe(true);

    // Invalid formats
    expect(isValidVietnamesePhone('123456')).toBe(false);
    expect(isValidVietnamesePhone('abc123def')).toBe(false);
    expect(isValidVietnamesePhone('')).toBe(false);
  });

  test('AC-DI1: Database transaction integrity', async () => {
    const formData = {
      customerPhone: '0987654321',
      customerName: 'Trần Thị B',
      deviceType: 'Laptop',
      issueDescription: 'Màn hình bị vỡ'
    };

    // Mock successful transaction
    const createTicket = async () => {
      // This should create both customer and ticket in transaction
      return await createTicketWithCustomer(formData);
    };

    const result = await createTicket();

    expect(result).toHaveProperty('ticket_id');
    expect(result).toHaveProperty('customer_created', true);

    // Verify both records exist
    const customer = await getCustomer(formData.customerPhone);
    const ticket = await getTicket(result.ticket_id);

    expect(customer.phone).toBe(formData.customerPhone);
    expect(ticket.customer_phone).toBe(formData.customerPhone);
  });

  test('AC-UX2: Form auto-save and recovery', async () => {
    const { getByTestId } = render(<TicketCreateForm />);

    // Fill form partially
    fireEvent.change(getByTestId('customer-phone'), {
      target: { value: '0901234567' }
    });
    fireEvent.change(getByTestId('device-type'), {
      target: { value: 'Laptop' }
    });

    // Wait for auto-save
    await waitFor(() => {
      expect(localStorage.getItem('ticket-form-draft')).toBeTruthy();
    }, { timeout: 31000 }); // 30s + buffer

    // Simulate page reload
    cleanup();
    const { getByTestId: getByTestIdAfterReload } = render(<TicketCreateForm />);

    // Check recovery
    expect(getByTestIdAfterReload('customer-phone')).toHaveValue('0901234567');
    expect(getByTestIdAfterReload('device-type')).toHaveValue('Laptop');
  });
});
```

### **Database Functions:**
```sql
-- Ticket code generation function
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM NOW());
  sequence_num INTEGER;
  ticket_code VARCHAR(20);
BEGIN
  -- Get next sequence number for current year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket_code FROM 10 FOR 6) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM repair_tickets
  WHERE SUBSTRING(ticket_code FROM 5 FOR 4) = current_year::TEXT;

  -- Format ticket code
  ticket_code := 'LRP-' || current_year || '-' || LPAD(sequence_num::TEXT, 6, '0');

  RETURN ticket_code;
END;
$$ LANGUAGE plpgsql;
```

## Definition of Done

- [ ] **AC-CM1:** Customer lookup functionality working
- [ ] **AC-CM2:** Customer auto-creation functional
- [ ] **AC-CM3:** Customer information display complete
- [ ] **AC-CM4:** Phone number validation working
- [ ] **AC-TC1:** Ticket form validation functional
- [ ] **AC-TC2:** Ticket code generation working
- [ ] **AC-TC3:** Initial ticket status correct
- [ ] **AC-TC4:** Device information capture complete
- [ ] **AC-UX1:** Responsive form design verified
- [ ] **AC-UX2:** Form auto-save & recovery working
- [ ] **AC-UX3:** Loading states & feedback implemented
- [ ] **AC-UX4:** Form field enhancements complete
- [ ] **AC-DI1:** Database transaction integrity verified
- [ ] **AC-DI2:** Real-time updates functional
- [ ] **AC-DI3:** Audit trail creation working
- [ ] **AC-BR1:** Staff assignment rules implemented
- [ ] **AC-BR2:** Customer relationship management working
- [ ] **AC-BR3:** Business hour validation functional
- [ ] **Unit Tests:** All components tested với high coverage
- [ ] **Integration Tests:** End-to-end ticket creation flow
- [ ] **Performance Tests:** Form responsiveness under load
- [ ] **Accessibility Tests:** WCAG compliance verified

## Risk Mitigation

- **Primary Risk:** Data inconsistency between customer và ticket creation
- **Mitigation:** Database transactions, comprehensive error handling
- **Rollback Plan:** Manual data cleanup procedures, transaction rollback capabilities

## Story Dependencies

- **Prerequisites:** Epic 01 complete (infrastructure, database, auth)
- **Enables:** All subsequent ticket management features
- **Estimated Effort:** 3-4 days
- **Priority:** Critical (core business function)