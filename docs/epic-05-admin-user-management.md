# Epic 05: Admin & User Management System

## Epic Goal

Xây dựng hệ thống quản lý tài khoản nhân viên và cài đặt hệ thống, với role-based access control phù hợp cho small business.

## Epic Description

**Bối cảnh hệ thống:**
- 2 roles đơn giản: shop_owner và staff
- Admin account setup từ environment variables
- Employee management được thực hiện bởi shop owner
- Deactivation policy với auto-reassignment

**Chi tiết Epic:**
- **Mục tiêu:** Quản lý users và system settings effectively
- **Phạm vi:** User CRUD, role management, system configuration, access control
- **Kết quả:** Shop owner có thể quản lý staff và system settings independently

## Stories

### 1. **Story 5.1:** Initial Admin Setup & Authentication
- Admin account creation từ environment variables
- Login system với role-based redirects
- Session management và security
- Password policies và account security

### 2. **Story 5.2:** Employee Management
- Staff account creation/editing bởi shop owner
- Employee deactivation với auto-reassign tickets
- User profile management
- Access level configuration

### 3. **Story 5.3:** System Settings & Configuration
- Shop information management
- System preferences (timezone, currency, etc.)
- Notification settings
- Backup và maintenance tools

### 4. **Story 5.4:** Access Control & Security
- Role-based UI components
- RLS policy enforcement
- Audit logging cho admin actions
- Security monitoring và alerts

## Technical Implementation

**Authentication Flow:**
```typescript
// Supabase Auth với custom user profiles
interface UserProfile {
  id: string; // Supabase auth user ID
  email: string;
  full_name: string;
  role: 'shop_owner' | 'staff';
  is_active: boolean;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Role-based access control
function useUserRole() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.id);
  return {
    isOwner: profile?.role === 'shop_owner',
    isStaff: profile?.role === 'staff',
    isActive: profile?.is_active
  };
}
```

**Admin Interface Components:**
```typescript
<UserManagement />
<EmployeeCreateForm />
<EmployeeEditForm />
<SystemSettings />
<AccessControlPanel />
<AuditLogViewer />
```

**Database Policies (RLS):**
```sql
-- Only shop owners can manage users
CREATE POLICY "shop_owners_manage_users" ON user_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );
```

**Employee Deactivation Logic:**
```typescript
// Auto-reassign tickets khi deactivate employee
async function deactivateEmployee(employeeId: string, newAssigneeId: string) {
  // 1. Reassign all active tickets
  await supabase
    .from('repair_tickets')
    .update({ assigned_to: newAssigneeId })
    .eq('assigned_to', employeeId)
    .neq('status', 'completed');

  // 2. Deactivate user
  await supabase
    .from('user_profiles')
    .update({ is_active: false })
    .eq('id', employeeId);
}
```

## User Experience Flow

**Admin Management Workflow:**
1. **Setup:** Initial admin account creation từ environment
2. **Staff Creation:** Shop owner creates employee accounts
3. **Access Control:** Different UI based on user role
4. **Deactivation:** Safe employee removal với ticket reassignment
5. **Settings:** System configuration management

**Role-based Interface:**
- **Shop Owner:** Full access to all features và settings
- **Staff:** Limited to operational functions (tickets, customers, parts)
- **Deactivated Users:** No system access

## Definition of Done

- [ ] Admin account creation working từ environment variables
- [ ] Employee CRUD operations functional cho shop owners
- [ ] Role-based UI hiding/showing appropriate features
- [ ] Employee deactivation với automatic ticket reassignment
- [ ] System settings interface complete
- [ ] RLS policies enforcing access control correctly
- [ ] Audit logging for admin actions
- [ ] Password security và session management robust

## Security Requirements

**Authentication Security:**
- Strong password requirements
- Session timeout configuration
- Failed login attempt tracking
- Admin action logging

**Access Control:**
- RLS policies cho all sensitive tables
- Role-based UI component rendering
- API endpoint protection
- Admin-only operations restricted

**Data Protection:**
- Employee PII protection
- Admin action audit trail
- Secure password handling
- Permission validation at multiple layers

## Risk Mitigation

- **Primary Risk:** Accidental admin lockout or data corruption
- **Mitigation:** Multiple admin accounts support, comprehensive backup
- **Rollback Plan:** Environment variable reset cho admin access recovery

## Success Criteria

Admin system hoàn chỉnh:
1. Shop owner có thể manage staff effectively
2. Role-based access control working correctly
3. System settings configurable và persistent
4. Security measures protecting sensitive operations
5. Employee lifecycle management (create → active → deactivate) smooth