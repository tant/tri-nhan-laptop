# Story 05.2: Employee Management
**Epic:** 05 - Admin & User Management System
**Story Points:** 8
**Priority:** High
**Dependencies:** Story 05.1

## Mô tả (Description)
Là chủ cửa hàng sửa chữa laptop, tôi cần khả năng quản lý nhân viên toàn diện bao gồm tạo tài khoản staff, chỉnh sửa thông tin cá nhân, deactivate nhân viên với auto-reassignment tickets, và theo dõi hiệu suất làm việc của từng nhân viên để đảm bảo cửa hàng hoạt động hiệu quả và có kiểm soát access phù hợp.

## Acceptance Criteria

### AC 05.2.1: Staff Account Creation by Shop Owner
**Given** tôi là shop owner đã đăng nhập
**When** tôi tạo tài khoản nhân viên mới
**Then** hệ thống cho phép:
- Nhập thông tin cơ bản (email, tên, số điện thoại)
- Generate temporary password tự động
- Assign role 'staff' cho account mới
- Gửi email welcome với login instructions
- Set flag yêu cầu đổi password lần đầu login

```typescript
interface EmployeeCreationData {
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  hire_date: string;
  salary?: number;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface EmployeeAccount {
  id: string;
  email: string;
  full_name: string;
  role: 'staff';
  is_active: boolean;
  temporary_password: string;
  must_change_password: boolean;
  profile_data: EmployeeCreationData;
  created_by: string;
  created_at: string;
}

const CreateEmployeeForm: React.FC = () => {
  const { createEmployee, loading } = useEmployeeManagement();

  const handleSubmit = async (data: EmployeeCreationData) => {
    try {
      // Generate secure temporary password
      const tempPassword = generateSecurePassword();

      // Create Supabase auth user
      const { data: authUser, error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true
      });

      if (error) throw error;

      // Create user profile
      const profile = await supabase.from('user_profiles').insert({
        id: authUser.user.id,
        email: data.email,
        full_name: data.full_name,
        role: 'staff',
        is_active: true,
        phone: data.phone,
        must_change_password: true,
        created_at: new Date().toISOString()
      });

      // Store additional employee data
      await supabase.from('employee_details').insert({
        user_id: authUser.user.id,
        department: data.department,
        hire_date: data.hire_date,
        salary: data.salary,
        emergency_contact: data.emergency_contact,
        created_by: getCurrentUser().id
      });

      // Send welcome email
      await sendWelcomeEmail(data.email, data.full_name, tempPassword);

      // Log admin action
      await logAdminAction('employee_created', 'user', authUser.user.id, {
        employee_name: data.full_name,
        email: data.email
      });

      toast.success(`Đã tạo tài khoản cho ${data.full_name}`);
      toast.info('Email hướng dẫn đã được gửi đến nhân viên');

    } catch (error) {
      toast.error('Không thể tạo tài khoản nhân viên');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-creation-form">
      <h2>Tạo tài khoản nhân viên mới</h2>

      <div className="form-section">
        <h3>Thông tin cơ bản</h3>
        <Input
          label="Email"
          type="email"
          required
          validation={emailValidation}
        />
        <Input
          label="Họ và tên"
          required
          validation={nameValidation}
        />
        <Input
          label="Số điện thoại"
          type="tel"
          validation={phoneValidation}
        />
      </div>

      <div className="form-section">
        <h3>Thông tin công việc</h3>
        <Select label="Phòng ban">
          <option value="technical">Kỹ thuật</option>
          <option value="customer_service">Chăm sóc khách hàng</option>
          <option value="sales">Bán hàng</option>
        </Select>
        <DatePicker
          label="Ngày vào làm"
          required
        />
        <Input
          label="Lương cơ bản (VND)"
          type="number"
          min="0"
        />
      </div>

      <div className="form-section">
        <h3>Liên hệ khẩn cấp</h3>
        <Input label="Tên người liên hệ" />
        <Input label="Số điện thoại" type="tel" />
        <Select label="Mối quan hệ">
          <option value="family">Gia đình</option>
          <option value="friend">Bạn bè</option>
          <option value="relative">Họ hàng</option>
        </Select>
      </div>

      <div className="form-actions">
        <Button type="submit" loading={loading}>
          Tạo tài khoản
        </Button>
        <Button type="button" variant="outline">
          Hủy
        </Button>
      </div>
    </form>
  );
};

// Password generation utility
const generateSecurePassword = (): string => {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each required character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

  // Fill the rest
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
```

### AC 05.2.2: Employee Profile Management & Editing
**Given** shop owner cần cập nhật thông tin nhân viên
**When** tôi chỉnh sửa profile nhân viên
**Then** hệ thống:
- Hiển thị form với thông tin hiện tại
- Cho phép edit tất cả fields (trừ email và role)
- Validate data trước khi save
- Track changes với audit trail
- Update last_modified timestamp

```typescript
interface EmployeeProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  department: string;
  hire_date: string;
  salary?: number;
  performance_rating?: number;
  notes?: string;
  emergency_contact?: EmergencyContact;
  skills?: string[];
  certifications?: Certification[];
  work_schedule?: WorkSchedule;
  last_modified: string;
  modified_by: string;
}

interface ProfileChangeHistory {
  id: string;
  employee_id: string;
  field_name: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

const EmployeeEditForm: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const { employee, updateEmployee, loading } = useEmployee(employeeId);
  const [changeHistory, setChangeHistory] = useState<ProfileChangeHistory[]>([]);

  const handleSave = async (updatedData: Partial<EmployeeProfile>) => {
    try {
      // Compare changes
      const changes = Object.keys(updatedData).reduce((acc, key) => {
        if (employee[key] !== updatedData[key]) {
          acc.push({
            field_name: key,
            old_value: employee[key],
            new_value: updatedData[key],
            changed_by: getCurrentUser().id,
            changed_at: new Date().toISOString()
          });
        }
        return acc;
      }, []);

      if (changes.length === 0) {
        toast.info('Không có thay đổi nào để lưu');
        return;
      }

      // Update employee profile
      await supabase.from('user_profiles').update({
        ...updatedData,
        updated_at: new Date().toISOString()
      }).eq('id', employeeId);

      // Save change history
      if (changes.length > 0) {
        await supabase.from('profile_change_history').insert(
          changes.map(change => ({
            ...change,
            employee_id: employeeId
          }))
        );
      }

      // Log admin action
      await logAdminAction('employee_updated', 'user', employeeId, {
        changes_count: changes.length,
        fields_changed: changes.map(c => c.field_name)
      });

      toast.success('Cập nhật thông tin nhân viên thành công');

    } catch (error) {
      toast.error('Không thể cập nhật thông tin');
      console.error(error);
    }
  };

  return (
    <div className="employee-edit-container">
      <ProfileHeader employee={employee} />

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="work">Công việc</TabsTrigger>
          <TabsTrigger value="emergency">Liên hệ khẩn cấp</TabsTrigger>
          <TabsTrigger value="history">Lịch sử thay đổi</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoForm employee={employee} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="work">
          <WorkInfoForm employee={employee} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyContactForm employee={employee} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="history">
          <ChangeHistoryTable changes={changeHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Profile comparison utility
const ProfileComparator: React.FC<{
  original: EmployeeProfile,
  modified: EmployeeProfile
}> = ({ original, modified }) => {
  const changes = useMemo(() => {
    return Object.keys(modified).filter(key =>
      original[key] !== modified[key]
    ).map(key => ({
      field: key,
      from: original[key],
      to: modified[key]
    }));
  }, [original, modified]);

  return (
    <div className="profile-changes">
      <h4>Thay đổi ({changes.length})</h4>
      {changes.map(change => (
        <div key={change.field} className="change-item">
          <span className="field-name">{getFieldDisplayName(change.field)}:</span>
          <span className="change-from">{change.from}</span>
          <span className="arrow">→</span>
          <span className="change-to">{change.to}</span>
        </div>
      ))}
    </div>
  );
};
```

### AC 05.2.3: Employee Deactivation with Auto-reassignment
**Given** nhân viên cần được deactivate
**When** shop owner deactivate employee account
**Then** hệ thống:
- Hiển thị confirmation dialog với impact analysis
- List tất cả active tickets assigned cho employee này
- Cho phép select replacement employee
- Auto-reassign tickets đến replacement
- Deactivate account và revoke access
- Send notification đến replacement employee

```typescript
interface DeactivationImpact {
  employee: EmployeeProfile;
  active_tickets: {
    id: string;
    ticket_number: string;
    customer_name: string;
    status: string;
    priority: string;
    estimated_completion: string;
  }[];
  ongoing_tasks: any[];
  scheduled_appointments: any[];
  total_impact_score: number;
}

interface DeactivationPlan {
  employee_id: string;
  replacement_employee_id: string;
  ticket_reassignments: {
    ticket_id: string;
    from_employee: string;
    to_employee: string;
    reassignment_reason: string;
  }[];
  deactivation_date: string;
  reason: string;
  notify_customers: boolean;
  handover_notes: string;
}

const EmployeeDeactivationDialog: React.FC<{
  employee: EmployeeProfile;
  onConfirm: (plan: DeactivationPlan) => void;
  onCancel: () => void;
}> = ({ employee, onConfirm, onCancel }) => {
  const [impact, setImpact] = useState<DeactivationImpact | null>(null);
  const [deactivationPlan, setDeactivationPlan] = useState<DeactivationPlan>({
    employee_id: employee.id,
    replacement_employee_id: '',
    ticket_reassignments: [],
    deactivation_date: new Date().toISOString(),
    reason: '',
    notify_customers: false,
    handover_notes: ''
  });

  const { availableEmployees } = useActiveEmployees();

  useEffect(() => {
    const analyzeImpact = async () => {
      // Get active tickets
      const { data: tickets } = await supabase
        .from('repair_tickets')
        .select('*')
        .eq('assigned_to', employee.id)
        .not('status', 'in', '("completed", "cancelled")');

      // Calculate impact score
      const impactScore = tickets?.reduce((score, ticket) => {
        let ticketScore = 10; // base score
        if (ticket.priority === 'urgent') ticketScore += 20;
        if (ticket.priority === 'high') ticketScore += 10;

        const daysUntilDeadline = Math.ceil(
          (new Date(ticket.expected_completion_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeadline < 3) ticketScore += 15;

        return score + ticketScore;
      }, 0) || 0;

      setImpact({
        employee,
        active_tickets: tickets || [],
        ongoing_tasks: [], // TODO: implement
        scheduled_appointments: [], // TODO: implement
        total_impact_score: impactScore
      });
    };

    analyzeImpact();
  }, [employee.id]);

  const handleConfirmDeactivation = async () => {
    try {
      // Start transaction-like operations
      const results = await Promise.all([
        // Reassign tickets
        ...deactivationPlan.ticket_reassignments.map(reassignment =>
          supabase.from('repair_tickets').update({
            assigned_to: reassignment.to_employee,
            updated_at: new Date().toISOString()
          }).eq('id', reassignment.ticket_id)
        ),

        // Create reassignment logs
        supabase.from('ticket_reassignments').insert(
          deactivationPlan.ticket_reassignments.map(reassignment => ({
            ...reassignment,
            reassigned_by: getCurrentUser().id,
            reassigned_at: new Date().toISOString()
          }))
        ),

        // Deactivate user
        supabase.from('user_profiles').update({
          is_active: false,
          deactivated_at: deactivationPlan.deactivation_date,
          deactivated_by: getCurrentUser().id,
          deactivation_reason: deactivationPlan.reason
        }).eq('id', employee.id)
      ]);

      // Send notifications
      if (deactivationPlan.replacement_employee_id) {
        await sendNotification(deactivationPlan.replacement_employee_id, {
          type: 'ticket_assignment',
          title: 'Tickets mới được giao',
          message: `Bạn được giao ${deactivationPlan.ticket_reassignments.length} tickets từ ${employee.full_name}`,
          data: { tickets: deactivationPlan.ticket_reassignments }
        });
      }

      // Log admin action
      await logAdminAction('employee_deactivated', 'user', employee.id, {
        reason: deactivationPlan.reason,
        tickets_reassigned: deactivationPlan.ticket_reassignments.length,
        replacement_employee: deactivationPlan.replacement_employee_id
      });

      toast.success(`Đã deactivate ${employee.full_name} và reassign ${deactivationPlan.ticket_reassignments.length} tickets`);
      onConfirm(deactivationPlan);

    } catch (error) {
      toast.error('Không thể deactivate nhân viên');
      console.error(error);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Deactivate {employee.full_name}</DialogTitle>
          <DialogDescription>
            Hành động này sẽ vô hiệu hóa tài khoản và reassign tất cả công việc đang thực hiện
          </DialogDescription>
        </DialogHeader>

        {impact && (
          <div className="deactivation-impact">
            <ImpactAnalysis impact={impact} />

            <div className="reassignment-plan">
              <h4>Kế hoạch reassignment</h4>
              <Select
                label="Nhân viên thay thế"
                value={deactivationPlan.replacement_employee_id}
                onValueChange={(value) => setDeactivationPlan(prev => ({
                  ...prev,
                  replacement_employee_id: value,
                  ticket_reassignments: impact.active_tickets.map(ticket => ({
                    ticket_id: ticket.id,
                    from_employee: employee.id,
                    to_employee: value,
                    reassignment_reason: 'Employee deactivation'
                  }))
                }))}
              >
                {availableEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.current_workload} tickets)
                  </option>
                ))}
              </Select>

              <TicketReassignmentTable
                tickets={impact.active_tickets}
                reassignments={deactivationPlan.ticket_reassignments}
                onUpdate={setDeactivationPlan}
              />
            </div>

            <div className="deactivation-details">
              <Textarea
                label="Lý do deactivate"
                value={deactivationPlan.reason}
                onChange={(e) => setDeactivationPlan(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                required
              />

              <Textarea
                label="Ghi chú handover"
                value={deactivationPlan.handover_notes}
                onChange={(e) => setDeactivationPlan(prev => ({
                  ...prev,
                  handover_notes: e.target.value
                }))}
              />

              <Checkbox
                label="Thông báo khách hàng về thay đổi nhân viên phụ trách"
                checked={deactivationPlan.notify_customers}
                onCheckedChange={(checked) => setDeactivationPlan(prev => ({
                  ...prev,
                  notify_customers: checked
                }))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDeactivation}
            disabled={!deactivationPlan.replacement_employee_id || !deactivationPlan.reason}
          >
            Xác nhận Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### AC 05.2.4: Employee List Management & Filtering
**Given** shop owner cần quản lý nhiều nhân viên
**When** tôi truy cập employee management page
**Then** hệ thống hiển thị:
- Danh sách tất cả employees với basic info
- Filters: status (active/inactive), department, hire date range
- Search by name hoặc email
- Sort by multiple criteria
- Bulk actions (activate/deactivate selected)

```typescript
interface EmployeeListItem {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  is_active: boolean;
  hire_date: string;
  last_login?: string;
  current_tickets: number;
  performance_rating?: number;
  avatar_url?: string;
}

interface EmployeeFilters {
  status: 'all' | 'active' | 'inactive';
  department: string;
  hire_date_from?: string;
  hire_date_to?: string;
  search: string;
  sort_by: 'name' | 'hire_date' | 'last_login' | 'performance';
  sort_order: 'asc' | 'desc';
}

const EmployeeManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [filters, setFilters] = useState<EmployeeFilters>({
    status: 'all',
    department: '',
    search: '',
    sort_by: 'name',
    sort_order: 'asc'
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { deleteEmployees, bulkDeactivate } = useEmployeeActions();

  // Fetch and filter employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          employee_details(*),
          repair_tickets!repair_tickets_assigned_to_fkey(count)
        `)
        .eq('role', 'staff');

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active');
      }

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Post-process data
      const processedEmployees = data.map(emp => ({
        id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        phone: emp.phone,
        department: emp.employee_details?.department || '',
        role: emp.role,
        is_active: emp.is_active,
        hire_date: emp.employee_details?.hire_date || emp.created_at,
        last_login: emp.last_login,
        current_tickets: emp.repair_tickets?.[0]?.count || 0,
        performance_rating: emp.employee_details?.performance_rating,
        avatar_url: emp.avatar_url
      }));

      // Apply additional filters
      let filteredEmployees = processedEmployees;

      if (filters.department) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.department === filters.department
        );
      }

      if (filters.hire_date_from) {
        filteredEmployees = filteredEmployees.filter(emp =>
          new Date(emp.hire_date) >= new Date(filters.hire_date_from)
        );
      }

      if (filters.hire_date_to) {
        filteredEmployees = filteredEmployees.filter(emp =>
          new Date(emp.hire_date) <= new Date(filters.hire_date_to)
        );
      }

      setEmployees(filteredEmployees);

    } catch (error) {
      toast.error('Không thể tải danh sách nhân viên');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedEmployees.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một nhân viên');
      return;
    }

    const confirmMessage = {
      activate: `Kích hoạt ${selectedEmployees.length} nhân viên?`,
      deactivate: `Vô hiệu hóa ${selectedEmployees.length} nhân viên?`,
      delete: `Xóa vĩnh viễn ${selectedEmployees.length} nhân viên? Hành động này không thể hoàn tác.`
    };

    if (!confirm(confirmMessage[action])) return;

    try {
      switch (action) {
        case 'activate':
          await supabase.from('user_profiles')
            .update({ is_active: true })
            .in('id', selectedEmployees);
          break;
        case 'deactivate':
          await bulkDeactivate(selectedEmployees);
          break;
        case 'delete':
          await deleteEmployees(selectedEmployees);
          break;
      }

      toast.success(`Đã ${action} ${selectedEmployees.length} nhân viên`);
      setSelectedEmployees([]);
      fetchEmployees();

    } catch (error) {
      toast.error(`Không thể ${action} nhân viên`);
    }
  };

  return (
    <div className="employee-management-page">
      <PageHeader>
        <h1>Quản lý nhân viên</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Thêm nhân viên mới
        </Button>
      </PageHeader>

      <EmployeeFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters({
          status: 'all',
          department: '',
          search: '',
          sort_by: 'name',
          sort_order: 'asc'
        })}
      />

      {selectedEmployees.length > 0 && (
        <BulkActionBar
          selectedCount={selectedEmployees.length}
          onActivate={() => handleBulkAction('activate')}
          onDeactivate={() => handleBulkAction('deactivate')}
          onDelete={() => handleBulkAction('delete')}
          onClearSelection={() => setSelectedEmployees([])}
        />
      )}

      <EmployeeTable
        employees={employees}
        loading={loading}
        selectedEmployees={selectedEmployees}
        onSelectionChange={setSelectedEmployees}
        onEdit={(employeeId) => navigate(`/admin/employees/${employeeId}/edit`)}
        onDeactivate={(employee) => setEmployeeToDeactivate(employee)}
      />

      <EmployeeStats employees={employees} />
    </div>
  );
};
```

### AC 05.2.5: Employee Performance Tracking
**Given** shop owner cần theo dõi hiệu suất nhân viên
**When** tôi xem employee performance dashboard
**Then** hệ thống hiển thị:
- Ticket completion rates per employee
- Average resolution time per employee
- Customer satisfaction scores
- Attendance và punctuality metrics
- Performance trends over time

```typescript
interface EmployeePerformance {
  employee_id: string;
  employee_name: string;
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    tickets_completed: number;
    tickets_assigned: number;
    completion_rate: number; // percentage
    avg_resolution_time: number; // hours
    customer_satisfaction: number; // 1-5 scale
    on_time_completion_rate: number; // percentage
    escalation_rate: number; // percentage
    rework_rate: number; // percentage
  };
  attendance: {
    days_worked: number;
    days_expected: number;
    attendance_rate: number; // percentage
    late_arrivals: number;
    early_departures: number;
  };
  revenue_generated: number;
  cost_per_ticket: number;
  efficiency_score: number; // calculated composite score
  improvement_areas: string[];
  achievements: string[];
}

const EmployeePerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const calculatePerformance = useCallback(async () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    // Fetch employee performance data
    const { data: employees } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .eq('role', 'staff')
      .eq('is_active', true);

    const performancePromises = employees.map(async (employee) => {
      // Get tickets data
      const { data: tickets } = await supabase
        .from('repair_tickets')
        .select('*')
        .eq('assigned_to', employee.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const completedTickets = tickets.filter(t => t.status === 'completed');
      const onTimeTickets = completedTickets.filter(t =>
        new Date(t.completed_at) <= new Date(t.expected_completion_date)
      );

      // Calculate average resolution time
      const avgResolutionTime = completedTickets.reduce((avg, ticket) => {
        const resolutionTime = (new Date(ticket.completed_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60);
        return avg + resolutionTime;
      }, 0) / completedTickets.length || 0;

      // Get customer satisfaction
      const { data: feedback } = await supabase
        .from('customer_feedback')
        .select('rating')
        .in('ticket_id', completedTickets.map(t => t.id));

      const avgSatisfaction = feedback.reduce((avg, f) => avg + f.rating, 0) / feedback.length || 0;

      // Calculate efficiency score (composite)
      const completionRate = (completedTickets.length / tickets.length) * 100 || 0;
      const onTimeRate = (onTimeTickets.length / completedTickets.length) * 100 || 0;
      const satisfactionScore = (avgSatisfaction / 5) * 100;

      const efficiencyScore = (completionRate * 0.3 + onTimeRate * 0.3 + satisfactionScore * 0.4);

      return {
        employee_id: employee.id,
        employee_name: employee.full_name,
        period: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        },
        metrics: {
          tickets_completed: completedTickets.length,
          tickets_assigned: tickets.length,
          completion_rate: completionRate,
          avg_resolution_time: avgResolutionTime,
          customer_satisfaction: avgSatisfaction,
          on_time_completion_rate: onTimeRate,
          escalation_rate: 0, // TODO: implement
          rework_rate: 0 // TODO: implement
        },
        attendance: {
          days_worked: 0, // TODO: implement time tracking
          days_expected: 0,
          attendance_rate: 0,
          late_arrivals: 0,
          early_departures: 0
        },
        revenue_generated: completedTickets.reduce((sum, ticket) => sum + (ticket.total_cost || 0), 0),
        cost_per_ticket: 0, // TODO: calculate based on salary and time
        efficiency_score: efficiencyScore,
        improvement_areas: [], // TODO: AI-based analysis
        achievements: [] // TODO: implement achievement system
      };
    });

    const results = await Promise.all(performancePromises);
    setPerformanceData(results);
  }, [selectedPeriod]);

  useEffect(() => {
    calculatePerformance();
  }, [calculatePerformance]);

  return (
    <div className="performance-dashboard">
      <DashboardHeader>
        <h2>Hiệu suất nhân viên</h2>
        <div className="controls">
          <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
          <EmployeeSelector value={selectedEmployee} onChange={setSelectedEmployee} />
        </div>
      </DashboardHeader>

      <PerformanceOverview data={performanceData} />

      <div className="performance-charts">
        <CompletionRateChart data={performanceData} />
        <SatisfactionChart data={performanceData} />
        <EfficiencyTrendChart data={performanceData} />
        <RevenueContributionChart data={performanceData} />
      </div>

      <PerformanceTable
        data={performanceData}
        onEmployeeClick={(employeeId) => navigate(`/admin/employees/${employeeId}/performance`)}
      />

      <PerformanceRecommendations data={performanceData} />
    </div>
  );
};
```

## Database Schema Extensions

```sql
-- Employee details table
CREATE TABLE employee_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  employee_number VARCHAR(20) UNIQUE,
  department VARCHAR(50),
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  performance_rating DECIMAL(3,2), -- 1.00 to 5.00
  emergency_contact JSONB,
  skills TEXT[],
  certifications JSONB[],
  work_schedule JSONB,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profile change history
CREATE TABLE profile_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id),
  field_name VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);

-- Ticket reassignments
CREATE TABLE ticket_reassignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES repair_tickets(id),
  from_employee UUID REFERENCES auth.users(id),
  to_employee UUID REFERENCES auth.users(id),
  reassignment_reason TEXT NOT NULL,
  reassigned_by UUID REFERENCES auth.users(id),
  reassigned_at TIMESTAMP DEFAULT NOW()
);

-- Employee performance metrics
CREATE TABLE employee_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  tickets_completed INTEGER DEFAULT 0,
  tickets_assigned INTEGER DEFAULT 0,
  avg_resolution_time DECIMAL(8,2), -- hours
  customer_satisfaction DECIMAL(3,2), -- 1.00 to 5.00
  revenue_generated DECIMAL(12,2),
  efficiency_score DECIMAL(5,2), -- calculated score
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_employee_details_department ON employee_details(department);
CREATE INDEX idx_profile_changes_employee_date ON profile_change_history(employee_id, changed_at DESC);
CREATE INDEX idx_ticket_reassignments_ticket ON ticket_reassignments(ticket_id);
CREATE INDEX idx_performance_employee_period ON employee_performance(employee_id, period_start, period_end);

-- RLS Policies
ALTER TABLE employee_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_reassignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;

-- Employees can read their own details
CREATE POLICY "Employees read own details" ON employee_details
  FOR SELECT USING (auth.uid() = user_id);

-- Shop owners can read all employee details
CREATE POLICY "Shop owners read all employee details" ON employee_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Only shop owners can modify employee details
CREATE POLICY "Shop owners modify employee details" ON employee_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

-- Profile change history readable by shop owners only
CREATE POLICY "Shop owners read change history" ON profile_change_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );
```

## Testing Scenarios

### Unit Tests
```typescript
describe('Employee Management', () => {
  test('creates employee account with correct permissions', async () => {
    const employeeData = {
      email: 'newstaff@test.com',
      full_name: 'Test Employee',
      phone: '0123456789',
      department: 'technical'
    };

    const result = await createEmployee(employeeData);

    expect(result.user).toBeTruthy();
    expect(result.profile.role).toBe('staff');
    expect(result.profile.must_change_password).toBe(true);
  });

  test('generates secure temporary password', () => {
    const password = generateSecurePassword();

    expect(password).toHaveLength(12);
    expect(password).toMatch(/[A-Z]/); // uppercase
    expect(password).toMatch(/[a-z]/); // lowercase
    expect(password).toMatch(/\d/); // number
    expect(password).toMatch(/[!@#$%^&*]/); // special char
  });

  test('calculates employee performance correctly', async () => {
    const performance = await calculateEmployeePerformance('employee-123', 'month');

    expect(performance.metrics.completion_rate).toBeGreaterThanOrEqual(0);
    expect(performance.metrics.completion_rate).toBeLessThanOrEqual(100);
    expect(performance.efficiency_score).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Tests
```typescript
describe('Employee Management Integration', () => {
  test('deactivation workflow reassigns tickets correctly', async () => {
    const employee = await createTestEmployee();
    const replacement = await createTestEmployee();
    const ticket = await createTestTicket({ assigned_to: employee.id });

    await deactivateEmployee(employee.id, replacement.id, 'Left company');

    const updatedTicket = await getTicket(ticket.id);
    expect(updatedTicket.assigned_to).toBe(replacement.id);

    const employeeProfile = await getUserProfile(employee.id);
    expect(employeeProfile.is_active).toBe(false);
  });

  test('bulk operations work correctly', async () => {
    const employees = await createMultipleTestEmployees(3);
    const employeeIds = employees.map(e => e.id);

    await bulkDeactivateEmployees(employeeIds);

    for (const id of employeeIds) {
      const profile = await getUserProfile(id);
      expect(profile.is_active).toBe(false);
    }
  });
});
```

### E2E Tests
```typescript
describe('Employee Management E2E', () => {
  test('shop owner can create and manage employees', async () => {
    await loginAsShopOwner();
    await page.goto('/admin/employees');

    // Create new employee
    await page.click('[data-testid="create-employee"]');
    await page.fill('[data-testid="email"]', 'newstaff@test.com');
    await page.fill('[data-testid="full-name"]', 'Test Staff');
    await page.fill('[data-testid="phone"]', '0123456789');
    await page.selectOption('[data-testid="department"]', 'technical');

    await page.click('[data-testid="save-employee"]');
    await expect(page.locator('.success-message')).toContainText('thành công');

    // Verify employee appears in list
    await expect(page.locator('[data-testid="employee-list"]')).toContainText('Test Staff');
  });

  test('employee deactivation flow', async () => {
    await loginAsShopOwner();
    await page.goto('/admin/employees');

    await page.click('[data-testid="employee-actions-button"]');
    await page.click('[data-testid="deactivate-employee"]');

    // Should show impact analysis
    await expect(page.locator('[data-testid="deactivation-impact"]')).toBeVisible();

    // Select replacement
    await page.selectOption('[data-testid="replacement-employee"]', 'replacement-id');
    await page.fill('[data-testid="deactivation-reason"]', 'Employee resigned');

    await page.click('[data-testid="confirm-deactivation"]');
    await expect(page.locator('.success-message')).toContainText('deactivate');
  });
});
```

## Performance Requirements
- Employee list phải load trong <2 seconds
- Search và filtering phải respond trong <500ms
- Bulk operations phải complete trong <3 seconds cho 50 employees
- Performance calculation phải complete trong <5 seconds
- Deactivation workflow phải complete trong <10 seconds

## Security Requirements
- Chỉ shop owners có thể tạo/deactivate employees
- Employee details phải protected với RLS
- Password generation phải cryptographically secure
- Sensitive operations phải có audit logging
- Profile changes phải tracked với full history

## Accessibility Requirements
- Employee forms phải keyboard accessible
- Screen reader support cho employee status
- Clear focus indicators trên tất cả controls
- Error messages phải descriptive và accessible
- Performance charts phải có data tables alternative

## Mobile Optimization
- Employee list phải responsive
- Touch-friendly action buttons
- Optimized forms cho mobile input
- Compressed data views cho smaller screens
- Offline capability cho employee lookup