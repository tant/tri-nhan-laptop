# Story 02.2: Ticket Status Workflow Management

## User Story

**As a** repair shop staff member,
**I want** to manage repair ticket status transitions với comprehensive workflow tracking,
**So that** tôi có thể accurately track repair progress và provide customers với up-to-date information.

## Story Context

**16-State Repair Workflow:**
- Normal flow: device_received → preliminary_inspection → awaiting_repair_plan → approved_for_repair → in_diagnosis → waiting_parts → in_repair → quality_testing → ready_for_pickup → completed
- Exception flow: cannot_repair, cancelled_by_customer, repair_failed, customer_no_show, ready_for_return, abandoned
- Business rules cho valid transitions
- Conditional validation fields for certain transitions

**Technical Foundation:**
- React state management cho workflow UI
- Database constraints cho valid transitions
- Audit trail cho all status changes
- Real-time updates cho collaborative work

## Acceptance Criteria

### **Status Display & UI Requirements:**

**AC-SD1: Status Visual Representation**
```gherkin
GIVEN repair ticket với current status
WHEN status is displayed
THEN current status is highlighted prominently
AND status history timeline is visible
AND next possible transitions are indicated
AND status progress percentage is shown
AND Vietnamese status labels are used throughout
```

**AC-SD2: Status Transition Interface**
```gherkin
GIVEN staff member viewing ticket
WHEN status transition is needed
THEN available next statuses are presented as buttons/dropdown
AND unavailable transitions are disabled với explanation
AND transition confirmation is required for critical changes
AND bulk status update is available for multiple tickets
```

**AC-SD3: Status History Tracking**
```gherkin
GIVEN ticket với multiple status changes
WHEN status history is viewed
THEN complete chronological timeline is shown
AND each change shows: timestamp, old status, new status, staff member
AND duration in each status is calculated
AND status change notes/reasons are displayed
AND history is sortable và filterable
```

### **Workflow Validation Requirements:**

**AC-WV1: Valid Status Transitions**
```gherkin
GIVEN ticket in specific status
WHEN status change is attempted
THEN only valid next statuses are allowed
AND transition rules are enforced:
  - device_received → preliminary_inspection
  - preliminary_inspection → (awaiting_repair_plan | cannot_repair)
  - awaiting_repair_plan → (approved_for_repair | cancelled_by_customer)
  - approved_for_repair → (in_diagnosis | in_repair | waiting_parts)
  - in_repair → (quality_testing | repair_failed)
  - quality_testing → (ready_for_pickup | repair_failed)
  - ready_for_pickup → (completed | customer_no_show)
  - customer_no_show → (completed | abandoned)
```

**AC-WV2: Conditional Field Validation**
```gherkin
GIVEN specific status transitions
WHEN validation occurs
THEN required fields are enforced:
  - preliminary_inspection → awaiting_repair_plan: requires has_issue_report = true
  - awaiting_repair_plan → approved_for_repair: requires customer_approved_at NOT NULL
  - in_repair → quality_testing: requires repair_completed_at NOT NULL
  - ready_for_pickup → completed: requires is_paid = true AND paid_at NOT NULL
AND missing required fields prevent transition
AND clear error messages explain requirements
```

**AC-WV3: Business Rule Enforcement**
```gherkin
GIVEN status transition attempt
WHEN business rules are checked
THEN tickets cannot skip required validation steps
AND completed tickets cannot be modified (except by shop owner)
AND abandoned tickets require 90+ days in customer_no_show
AND warranty_until is set automatically when status = completed
AND total_cost must be > 0 before marking as completed (unless warranty repair)
```

### **Status Change Automation Requirements:**

**AC-SA1: Automatic Field Updates**
```gherkin
GIVEN status transition occurs
WHEN automatic updates are triggered
THEN timestamps are set automatically:
  - device_received: created_at
  - preliminary_inspection: inspection_started_at
  - approved_for_repair: customer_approved_at
  - in_repair: repair_started_at
  - quality_testing: testing_started_at
  - ready_for_pickup: ready_at
  - completed: completed_at
AND updated_at is always refreshed
```

**AC-SA2: Calculated Field Updates**
```gherkin
GIVEN status changes affecting calculations
WHEN updates are processed
THEN repair duration is calculated (approved_for_repair → completed)
AND customer wait time is tracked (awaiting_repair_plan duration)
AND SLA compliance is calculated based on business rules
AND statistics are updated for dashboard widgets
```

**AC-SA3: Notification Triggers**
```gherkin
GIVEN status changes requiring customer notification
WHEN transitions occur
THEN notification events are queued for:
  - awaiting_repair_plan: notify customer about estimate
  - ready_for_pickup: notify customer device is ready
  - completed: send completion và warranty information
  - cannot_repair: explain why repair cannot proceed
AND internal notifications for staff assignment changes
```

### **User Experience Requirements:**

**AC-UX1: Quick Status Actions**
```gherkin
GIVEN common status transitions
WHEN staff performs frequent actions
THEN one-click status updates for common flows
AND keyboard shortcuts for power users
AND batch operations for multiple tickets
AND undo capability for recent changes (within 5 minutes)
```

**AC-UX2: Context-Aware Interface**
```gherkin
GIVEN different ticket statuses
WHEN interface is displayed
THEN relevant actions are prioritized
AND next steps are clearly indicated
AND required information gathering is prompted
AND progress indicators show completion percentage
```

**AC-UX3: Mobile-Optimized Workflow**
```gherkin
GIVEN mobile device usage
WHEN status updates are performed
THEN touch-friendly status buttons
AND swipe gestures for common transitions
AND voice input for status change notes
AND offline capability for critical transitions
```

### **Audit & Reporting Requirements:**

**AC-AR1: Comprehensive Audit Trail**
```gherkin
GIVEN status change events
WHEN audit logging occurs
THEN all changes are logged với:
  - ticket_id, old_status, new_status
  - staff_member_id, timestamp, IP address
  - reason/notes for change
  - automated vs manual change indicator
AND audit logs are immutable
AND log retention follows business requirements
```

**AC-AR2: Status Analytics**
```gherkin
GIVEN historical status data
WHEN analytics are generated
THEN average time in each status is calculated
AND bottleneck identification reports available
AND staff performance metrics (resolution time)
AND customer satisfaction correlation với status duration
```

**AC-AR3: Compliance Reporting**
```gherkin
GIVEN business compliance needs
WHEN reports are generated
THEN SLA adherence reports available
AND status transition pattern analysis
AND exception handling statistics
AND audit trail export functionality
```

### **Real-time Collaboration Requirements:**

**AC-RT1: Live Status Updates**
```gherkin
GIVEN multiple staff members working
WHEN status changes occur
THEN all connected clients receive updates immediately
AND optimistic UI updates với conflict resolution
AND concurrent edit prevention for same ticket
AND real-time status change notifications
```

**AC-RT2: Collaborative Status Management**
```gherkin
GIVEN team collaboration scenarios
WHEN staff work together
THEN status change locks prevent conflicts
AND assignment changes trigger notifications
AND status notes support @mentions for staff
AND activity feed shows recent team actions
```

## Technical Implementation Details

### **Status Transition Manager:**
```typescript
export class StatusTransitionManager {
  private static readonly VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    device_received: ['preliminary_inspection'],
    preliminary_inspection: ['awaiting_repair_plan', 'cannot_repair'],
    awaiting_repair_plan: ['approved_for_repair', 'cancelled_by_customer'],
    approved_for_repair: ['in_diagnosis', 'in_repair', 'waiting_parts'],
    in_diagnosis: ['waiting_parts', 'in_repair', 'cannot_repair'],
    waiting_parts: ['in_repair'],
    in_repair: ['quality_testing', 'repair_failed'],
    quality_testing: ['ready_for_pickup', 'repair_failed'],
    ready_for_pickup: ['completed', 'customer_no_show'],
    completed: [], // Terminal state
    cannot_repair: ['ready_for_return'],
    cancelled_by_customer: [], // Terminal state
    repair_failed: ['awaiting_repair_plan', 'cannot_repair'],
    customer_no_show: ['completed', 'abandoned'],
    ready_for_return: ['completed'],
    abandoned: [] // Terminal state
  };

  static getValidNextStatuses(currentStatus: TicketStatus): TicketStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  static isValidTransition(from: TicketStatus, to: TicketStatus): boolean {
    return this.getValidNextStatuses(from).includes(to);
  }

  static async validateTransition(
    ticketId: string,
    currentStatus: TicketStatus,
    newStatus: TicketStatus
  ): Promise<ValidationResult> {
    // Check basic transition validity
    if (!this.isValidTransition(currentStatus, newStatus)) {
      return {
        valid: false,
        error: `Không thể chuyển từ ${currentStatus} sang ${newStatus}`
      };
    }

    // Check conditional requirements
    const ticket = await getTicketById(ticketId);
    const validationErrors = [];

    if (currentStatus === 'preliminary_inspection' && newStatus === 'awaiting_repair_plan') {
      if (!ticket.has_issue_report) {
        validationErrors.push('Cần hoàn thành báo cáo tình trạng thiết bị');
      }
    }

    if (currentStatus === 'awaiting_repair_plan' && newStatus === 'approved_for_repair') {
      if (!ticket.customer_approved_at) {
        validationErrors.push('Cần xác nhận phê duyệt từ khách hàng');
      }
    }

    if (currentStatus === 'in_repair' && newStatus === 'quality_testing') {
      if (!ticket.repair_completed_at) {
        validationErrors.push('Cần xác nhận hoàn thành sửa chữa');
      }
    }

    if (currentStatus === 'ready_for_pickup' && newStatus === 'completed') {
      if (!ticket.is_paid || !ticket.paid_at) {
        validationErrors.push('Cần xác nhận thanh toán trước khi hoàn thành');
      }
    }

    return {
      valid: validationErrors.length === 0,
      errors: validationErrors
    };
  }
}
```

### **Status Update Component:**
```typescript
export function StatusUpdateWidget({ ticket }: { ticket: RepairTicket }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const validNextStatuses = StatusTransitionManager.getValidNextStatuses(ticket.status);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setIsUpdating(true);

    try {
      // Validate transition
      const validation = await StatusTransitionManager.validateTransition(
        ticket.id,
        ticket.status,
        newStatus
      );

      if (!validation.valid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      // Confirm critical transitions
      if (CRITICAL_TRANSITIONS.includes(newStatus)) {
        const confirmed = await confirmDialog({
          title: 'Xác nhận thay đổi trạng thái',
          message: `Bạn có chắc chắn muốn chuyển sang "${getStatusLabel(newStatus)}"?`,
          confirmText: 'Xác nhận'
        });

        if (!confirmed) return;
      }

      // Perform update
      const { error } = await supabase
        .from('repair_tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          [`${newStatus}_at`]: new Date().toISOString(), // Dynamic timestamp field
          last_status_change_by: currentUser.id,
          last_status_change_notes: statusNotes
        })
        .eq('id', ticket.id);

      if (error) throw error;

      // Log status change
      await supabase.from('ticket_status_history').insert({
        ticket_id: ticket.id,
        old_status: ticket.status,
        new_status: newStatus,
        changed_by: currentUser.id,
        change_notes: statusNotes,
        changed_at: new Date().toISOString()
      });

      toast.success(`Trạng thái đã được cập nhật: ${getStatusLabel(newStatus)}`);
      setStatusNotes('');

      // Trigger notifications if needed
      await triggerStatusChangeNotifications(ticket.id, newStatus);

    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
      console.error('Status update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="status-update-widget">
      <div className="current-status">
        <StatusBadge status={ticket.status} />
        <span className="status-duration">
          {formatDuration(ticket.updated_at)}
        </span>
      </div>

      <div className="status-actions">
        {validNextStatuses.map(status => (
          <Button
            key={status}
            variant="outline"
            onClick={() => handleStatusChange(status)}
            disabled={isUpdating}
            className="status-transition-btn"
          >
            {getStatusLabel(status)}
          </Button>
        ))}
      </div>

      {validNextStatuses.length > 0 && (
        <Textarea
          placeholder="Ghi chú thay đổi trạng thái (tùy chọn)"
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          className="mt-2"
        />
      )}

      <StatusTimeline ticket={ticket} />
    </div>
  );
}
```

### **Automated Testing Scenarios:**

**Test Suite: Ticket Status Workflow**
```typescript
describe('Ticket Status Workflow Management', () => {
  test('AC-WV1: Valid status transitions enforced', () => {
    // Test valid transitions
    expect(StatusTransitionManager.isValidTransition(
      'device_received', 'preliminary_inspection'
    )).toBe(true);

    expect(StatusTransitionManager.isValidTransition(
      'preliminary_inspection', 'awaiting_repair_plan'
    )).toBe(true);

    // Test invalid transitions
    expect(StatusTransitionManager.isValidTransition(
      'device_received', 'completed'
    )).toBe(false);

    expect(StatusTransitionManager.isValidTransition(
      'completed', 'in_repair'
    )).toBe(false);
  });

  test('AC-WV2: Conditional field validation', async () => {
    const ticket = {
      id: 'test-ticket',
      status: 'preliminary_inspection',
      has_issue_report: false
    };

    const validation = await StatusTransitionManager.validateTransition(
      ticket.id,
      'preliminary_inspection',
      'awaiting_repair_plan'
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Cần hoàn thành báo cáo tình trạng thiết bị');
  });

  test('AC-SA1: Automatic field updates', async () => {
    const { getByText } = render(<StatusUpdateWidget ticket={mockTicket} />);

    // Mock supabase update
    const updateSpy = jest.spyOn(supabase.from('repair_tickets'), 'update');

    fireEvent.click(getByText('Bắt đầu kiểm tra'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'preliminary_inspection',
          preliminary_inspection_at: expect.any(String)
        })
      );
    });
  });

  test('AC-RT1: Live status updates', async () => {
    const { getByTestId } = render(<TicketDetailView ticketId="test-123" />);

    // Simulate real-time update from another user
    act(() => {
      mockSupabaseRealtimeUpdate('repair_tickets', {
        id: 'test-123',
        status: 'in_repair',
        updated_at: new Date().toISOString()
      });
    });

    await waitFor(() => {
      expect(getByTestId('current-status')).toHaveTextContent('Đang sửa chữa');
    });
  });

  test('AC-AR1: Comprehensive audit trail', async () => {
    const statusChange = {
      ticketId: 'test-123',
      oldStatus: 'awaiting_repair_plan',
      newStatus: 'approved_for_repair',
      staffId: 'user-456',
      notes: 'Khách hàng đã phê duyệt qua điện thoại'
    };

    await updateTicketStatus(statusChange);

    // Verify audit log creation
    const auditLogs = await supabase
      .from('ticket_status_history')
      .select('*')
      .eq('ticket_id', 'test-123')
      .order('changed_at', { ascending: false })
      .limit(1);

    expect(auditLogs.data[0]).toEqual(
      expect.objectContaining({
        ticket_id: 'test-123',
        old_status: 'awaiting_repair_plan',
        new_status: 'approved_for_repair',
        changed_by: 'user-456',
        change_notes: 'Khách hàng đã phê duyệt qua điện thoại'
      })
    );
  });

  test('AC-UX1: Quick status actions', async () => {
    const { getByTestId } = render(<StatusUpdateWidget ticket={mockTicket} />);

    // Test keyboard shortcut
    fireEvent.keyDown(document, { key: 'n', ctrlKey: true }); // Ctrl+N for next status

    await waitFor(() => {
      expect(getByTestId('status-update-modal')).toBeInTheDocument();
    });

    // Test undo functionality
    const undoButton = getByTestId('undo-status-change');
    fireEvent.click(undoButton);

    await waitFor(() => {
      expect(mockTicket.status).toBe('previous_status');
    });
  });
});
```

### **Database Schema Additions:**
```sql
-- Status history tracking table
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  old_status ticket_status NOT NULL,
  new_status ticket_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES user_profiles(id),
  change_notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Add status timestamp fields to repair_tickets
ALTER TABLE repair_tickets ADD COLUMN preliminary_inspection_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN customer_approved_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN repair_started_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN repair_completed_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN testing_started_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN ready_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE repair_tickets ADD COLUMN last_status_change_by UUID REFERENCES user_profiles(id);
ALTER TABLE repair_tickets ADD COLUMN last_status_change_notes TEXT;

-- Business rule validation fields
ALTER TABLE repair_tickets ADD COLUMN has_issue_report BOOLEAN DEFAULT FALSE;
ALTER TABLE repair_tickets ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE repair_tickets ADD COLUMN paid_at TIMESTAMPTZ;
```

## Definition of Done

- [ ] **AC-SD1:** Status visual representation complete
- [ ] **AC-SD2:** Status transition interface functional
- [ ] **AC-SD3:** Status history tracking implemented
- [ ] **AC-WV1:** Valid status transitions enforced
- [ ] **AC-WV2:** Conditional field validation working
- [ ] **AC-WV3:** Business rule enforcement active
- [ ] **AC-SA1:** Automatic field updates functional
- [ ] **AC-SA2:** Calculated field updates working
- [ ] **AC-SA3:** Notification triggers implemented
- [ ] **AC-UX1:** Quick status actions available
- [ ] **AC-UX2:** Context-aware interface working
- [ ] **AC-UX3:** Mobile-optimized workflow functional
- [ ] **AC-AR1:** Comprehensive audit trail active
- [ ] **AC-AR2:** Status analytics available
- [ ] **AC-AR3:** Compliance reporting functional
- [ ] **AC-RT1:** Live status updates working
- [ ] **AC-RT2:** Collaborative status management functional
- [ ] **Unit Tests:** Status transition logic thoroughly tested
- [ ] **Integration Tests:** End-to-end workflow validation
- [ ] **Performance Tests:** Real-time updates under load
- [ ] **User Acceptance Tests:** Business workflow validation

## Risk Mitigation

- **Primary Risk:** Invalid status transitions causing data inconsistency
- **Mitigation:** Multiple validation layers, comprehensive testing
- **Rollback Plan:** Status history allows reverting changes, emergency admin override

## Story Dependencies

- **Prerequisites:** Story 02.1 (Ticket Creation & Customer Management)
- **Enables:** All advanced ticket management features
- **Estimated Effort:** 4-5 days
- **Priority:** Critical (core workflow management)