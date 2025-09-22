# Story 01.3: Authentication & Row Level Security Policies

## User Story

**As a** system security architect,
**I want** Supabase authentication với comprehensive Row Level Security policies,
**So that** data access được kiểm soát chặt chẽ theo user roles và business rules.

## Story Context

**Security Model:**
- 2-role system: shop_owner (full access) + staff (limited access)
- Public access cho customer ticket lookup (no auth required)
- RLS policies enforce business logic at database level
- Admin account setup từ environment variables

**Access Control Philosophy:**
- Defense in depth: API + Database level security
- Principle of least privilege
- Public data carefully filtered cho customer portal
- Staff collaboration với appropriate restrictions

## Acceptance Criteria

### **Authentication Setup Requirements:**

**AC-A1: Supabase Auth Configuration**
```gherkin
GIVEN Supabase authentication service
WHEN auth configuration is applied
THEN self-signup is disabled (DISABLE_SIGNUP=true)
AND email signup is enabled for admin-created accounts
AND email auto-confirmation is enabled
AND anonymous users are disabled
AND phone signup is disabled
AND JWT expiry is set to 3600 seconds
```

**AC-A2: Admin Account Creation**
```gherkin
GIVEN environment variables với admin credentials
WHEN admin account setup runs
THEN admin user is created in auth.users table
AND corresponding user_profile record exists với role='shop_owner'
AND admin can login successfully với provided credentials
AND admin account has is_active=true
```

**AC-A3: JWT Token Management**
```gherkin
GIVEN authenticated user
WHEN JWT tokens are issued
THEN tokens contain correct role information
AND tokens contain user_id mapping to user_profiles.id
AND service role key bypasses RLS for admin operations
AND anon key has public-only access
```

### **Row Level Security Policy Requirements:**

**AC-RLS1: User Profiles Access Control**
```gherkin
GIVEN user_profiles table với RLS enabled
WHEN different user types access data
THEN shop_owners can view/edit all user profiles
AND staff can view all profiles but only edit their own
AND anonymous users cannot access user_profiles
AND deactivated users cannot access any profiles
```

**AC-RLS2: Customers Access Control**
```gherkin
GIVEN customers table với RLS enabled
WHEN different access scenarios occur
THEN authenticated staff can view all customer data
AND authenticated staff can create/update customers
AND public lookup can view limited customer data (name only)
AND anonymous users can search by phone for ticket lookup only
```

**AC-RLS3: Repair Tickets Access Control**
```gherkin
GIVEN repair_tickets table với RLS enabled
WHEN different user roles access tickets
THEN staff can view/edit all tickets regardless of assignment
AND shop_owners can view/edit all tickets + admin operations
AND public access shows filtered data (no internal info)
AND anonymous lookup shows only customer-facing fields
```

**AC-RLS4: Parts Access Control**
```gherkin
GIVEN parts table với RLS enabled
WHEN inventory operations occur
THEN authenticated staff can view all parts data
AND staff can update parts usage in tickets
AND shop_owners can create/edit/delete parts
AND no public access to parts table
```

### **Public Access Requirements:**

**AC-PUB1: Customer Ticket Lookup**
```gherkin
GIVEN public ticket lookup functionality
WHEN anonymous user searches by phone
THEN only customer-facing ticket data is returned
AND sensitive fields are hidden (internal notes, cost, staff info)
AND ticket status is translated to customer-friendly language
AND warranty information is visible if applicable
```

**AC-PUB2: Public Data Filtering**
```gherkin
GIVEN public access to repair tickets
WHEN data is filtered for customer view
THEN visible fields include: ticket_code, device_type, device_model, customer_facing_status, created_at, warranty_until
AND hidden fields include: internal_notes, total_cost, assigned_to, issue_details, photos
AND no access to staff information or internal communications
```

### **Security Validation Requirements:**

**AC-SEC1: RLS Policy Enforcement**
```gherkin
GIVEN RLS policies are active
WHEN policy bypass attempts are made
THEN direct database queries respect RLS policies
AND API endpoints enforce authentication requirements
AND unauthorized access attempts are blocked
AND policy violations are logged
```

**AC-SEC2: Role-based Function Access**
```gherkin
GIVEN different user roles
WHEN role-specific functions are called
THEN shop_owner can execute admin functions (create users, system settings)
AND staff cannot access admin-only functions
AND unauthorized function calls return appropriate errors
AND function permissions are enforced at database level
```

**AC-SEC3: Data Isolation Testing**
```gherkin
GIVEN multiple user sessions
WHEN concurrent access occurs
THEN users only see data allowed by their role
AND data leakage between roles is prevented
AND session isolation is maintained
AND cross-user data access is blocked
```

### **Admin Operations Requirements:**

**AC-ADM1: User Management Functions**
```gherkin
GIVEN shop_owner authenticated user
WHEN admin operations are performed
THEN new staff accounts can be created
AND existing staff can be deactivated/reactivated
AND staff profile information can be updated
AND password resets can be initiated
```

**AC-ADM2: System Configuration Access**
```gherkin
GIVEN shop_owner role
WHEN system settings are accessed
THEN shop configuration can be modified
AND system preferences can be updated
AND backup operations can be initiated
AND audit logs can be viewed
```

## Technical Implementation Details

### **RLS Policies SQL:**
```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "shop_owners_full_access" ON user_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'shop_owner'
      AND p.is_active = true
    )
  );

CREATE POLICY "staff_view_all_edit_own" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_active = true
    )
  );

CREATE POLICY "staff_edit_own_profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Customers RLS Policies
CREATE POLICY "staff_full_customer_access" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_active = true
    )
  );

CREATE POLICY "public_customer_lookup" ON customers
  FOR SELECT TO anon
  USING (true); -- Will be limited by query structure

-- Repair Tickets RLS Policies
CREATE POLICY "staff_full_ticket_access" ON repair_tickets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_active = true
    )
  );

CREATE POLICY "public_ticket_lookup" ON repair_tickets
  FOR SELECT TO anon
  USING (true); -- Limited by view/function

-- Parts RLS Policies
CREATE POLICY "staff_parts_access" ON parts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_active = true
    )
  );

CREATE POLICY "shop_owners_parts_management" ON parts
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

### **Public Access Functions:**
```sql
-- Public ticket lookup function
CREATE OR REPLACE FUNCTION public_ticket_lookup(search_phone VARCHAR(20))
RETURNS TABLE (
  ticket_code VARCHAR(20),
  device_type VARCHAR(100),
  device_model VARCHAR(100),
  status_display TEXT,
  created_at TIMESTAMPTZ,
  warranty_until DATE
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    rt.ticket_code,
    rt.device_type,
    rt.device_model,
    CASE rt.status
      WHEN 'device_received' THEN 'Đã tiếp nhận thiết bị'
      WHEN 'in_repair' THEN 'Đang sửa chữa'
      WHEN 'ready_for_pickup' THEN 'Sẵn sàng nhận máy'
      WHEN 'completed' THEN 'Đã hoàn thành'
      ELSE 'Đang xử lý'
    END,
    rt.created_at,
    rt.warranty_until
  FROM repair_tickets rt
  WHERE rt.customer_phone = search_phone
  ORDER BY rt.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

### **Automated Testing Scenarios:**

**Test Suite: Authentication & RLS Security**
```typescript
describe('Authentication & RLS Policies', () => {
  test('AC-A2: Admin account creation works', async () => {
    const adminCredentials = {
      email: process.env.SHOP_ADMIN_EMAIL,
      password: process.env.SHOP_ADMIN_PASSWORD
    };

    const { data, error } = await supabase.auth.signInWithPassword(adminCredentials);
    expect(error).toBeNull();
    expect(data.user).toBeTruthy();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    expect(profile.role).toBe('shop_owner');
  });

  test('AC-RLS1: User profiles access control', async () => {
    // Test staff user
    await signInAsStaff();
    const { data: allProfiles } = await supabase.from('user_profiles').select();
    expect(allProfiles).toBeTruthy(); // Can view all

    // Try to update another user (should fail)
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: 'Hacked' })
      .eq('id', 'other-user-id');
    expect(error).toBeTruthy(); // Should be blocked by RLS
  });

  test('AC-PUB1: Public ticket lookup works correctly', async () => {
    // Ensure not authenticated
    await supabase.auth.signOut();

    const { data, error } = await supabase
      .rpc('public_ticket_lookup', { search_phone: '0901234567' });

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data[0]).toHaveProperty('ticket_code');
    expect(data[0]).not.toHaveProperty('total_cost'); // Should be filtered
  });

  test('AC-SEC1: Direct database access respects RLS', async () => {
    await signInAsStaff();

    // Direct query should still respect RLS
    const { data, error } = await supabase
      .from('repair_tickets')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeTruthy();

    // Sign out and try again
    await supabase.auth.signOut();
    const { data: noAuthData, error: noAuthError } = await supabase
      .from('repair_tickets')
      .select('*');

    expect(noAuthData).toEqual([]); // No access without auth
  });
});
```

## Definition of Done

- [ ] **AC-A1:** Supabase auth configuration complete
- [ ] **AC-A2:** Admin account creation functional
- [ ] **AC-A3:** JWT token management working
- [ ] **AC-RLS1:** User profiles RLS policies active
- [ ] **AC-RLS2:** Customers RLS policies active
- [ ] **AC-RLS3:** Repair tickets RLS policies active
- [ ] **AC-RLS4:** Parts RLS policies active
- [ ] **AC-PUB1:** Customer ticket lookup working
- [ ] **AC-PUB2:** Public data filtering correct
- [ ] **AC-SEC1:** RLS policy enforcement verified
- [ ] **AC-SEC2:** Role-based function access working
- [ ] **AC-SEC3:** Data isolation testing passed
- [ ] **AC-ADM1:** User management functions active
- [ ] **AC-ADM2:** System configuration access controlled
- [ ] **Security Testing:** Penetration testing completed
- [ ] **Automated Tests:** All security scenarios covered
- [ ] **Documentation:** Security policies documented

## Risk Mitigation

- **Primary Risk:** Data exposure hoặc unauthorized access
- **Mitigation:** Multiple layers of security testing, audit logging
- **Rollback Plan:** Disable RLS temporarily, reset to secure defaults

## Story Dependencies

- **Prerequisites:** Story 01.2 (Database Schema Implementation)
- **Enables:** All authenticated features, public portal
- **Estimated Effort:** 2-3 days
- **Priority:** Critical (security foundation cho entire system)