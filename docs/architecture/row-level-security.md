# Row Level Security (RLS) Architecture

## Overview

This document provides comprehensive documentation for the Row Level Security (RLS) implementation in the Vietnamese Laptop Repair Shop Management System. RLS is a critical security layer that controls data access at the database level based on user authentication and roles.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Role-Based Access Model](#role-based-access-model)
- [Table-by-Table RLS Policies](#table-by-table-rls-policies)
- [Policy Patterns](#policy-patterns)
- [Implementation Examples](#implementation-examples)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Migration References](#migration-references)

## Architecture Overview

### Core Principles
1. **Authentication Required**: All data access requires authenticated users
2. **Simple Role System**: Basic Shop Owner vs Staff separation
3. **Admin Route Protection**: /admin routes restricted to Shop Owner only
4. **Open Inventory Access**: All authenticated users can modify inventory
5. **Basic Security**: Simple, maintainable security for small shop operations

### Technology Stack
- **Database**: PostgreSQL 15+ with Supabase
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: PostgreSQL RLS policies
- **Role Management**: Custom user_profiles table with role enum

## Role-Based Access Model

### Simple Role System
```
shop_owner (Admin)
├── Access to /admin routes
├── Staff account management (create, modify, reset, deactivate)
├── All standard user capabilities
└── System configuration

staff (Standard User)
├── Customer management
├── Repair ticket management
├── Parts inventory (full access)
└── All operational data access

authenticated (Base Level)
├── Access to all operational data
└── No special restrictions (simplified model)
```

### Role Definitions
```sql
CREATE TYPE user_role AS ENUM ('staff', 'shop_owner');
```

## Table-by-Table RLS Policies

### Core Business Tables

#### 1. customers
**RLS Status**: ✅ Enabled
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert customers" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update customers" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');
```

#### 2. user_profiles
**RLS Status**: ✅ Enabled - Simplified
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Shop owners can manage all staff accounts (create, modify, reset, deactivate)
CREATE POLICY "Shop owners manage staff accounts" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'shop_owner'
    )
  );
```

#### 3. repair_tickets
**RLS Status**: ✅ Enabled
```sql
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view tickets
CREATE POLICY "Users can view all repair tickets" ON repair_tickets
  FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can manage tickets
CREATE POLICY "Users can manage repair tickets" ON repair_tickets
  FOR ALL USING (auth.role() = 'authenticated');
```

#### 4. parts (Inventory)
**RLS Status**: ✅ Enabled - Open Access
```sql
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- All authenticated users have full inventory access
CREATE POLICY "Authenticated users can manage parts" ON parts
  FOR ALL USING (auth.role() = 'authenticated');
```

### Extended Business Tables

#### 5. repair_parts (Inventory Integration)
**RLS Status**: ✅ Enabled
```sql
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all repair parts" ON repair_parts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage repair parts" ON repair_parts
  FOR ALL USING (auth.role() = 'authenticated');
```

#### 6. parts_reservations (Inventory Management)
**RLS Status**: ✅ Enabled
```sql
ALTER TABLE parts_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all parts reservations" ON parts_reservations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage parts reservations" ON parts_reservations
  FOR ALL USING (auth.role() = 'authenticated');
```

#### 7. Financial Tables (Cost Tracking)
**RLS Status**: ✅ Enabled
- `repair_cost_breakdown`
- `cost_change_history`
- `customer_quotes`
- `profit_analysis`

All follow the standard authenticated user access pattern.

#### 8. Customer History Tables
**RLS Status**: ✅ Enabled
- `customer_devices`
- `service_patterns`
- `warranty_records`
- `service_notes`
- `customer_service_preferences`
- `repair_cost_history`

**Special Policy Example** (service_notes):
```sql
-- Technicians can update their own notes
CREATE POLICY "Technicians can update own notes" ON service_notes
  FOR UPDATE USING (
    created_by = auth.uid() AND
    auth.role() = 'authenticated'
  );
```

## Simplified Policy Patterns

### 1. Standard Authenticated Access (Most Tables)
Default pattern for operational data:
```sql
CREATE POLICY "policy_name" ON table_name
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Shop Owner Management Pattern
For admin-only operations (staff management):
```sql
CREATE POLICY "policy_name" ON table_name
  FOR operation USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'shop_owner'
    )
  );
```

**Note**: We use only 2 patterns for simplicity:
- **Pattern 1**: Everyone authenticated can access (customers, parts, repair_tickets)
- **Pattern 2**: Only Shop Owner can manage (user_profiles admin operations)

## Implementation Examples

### Adding RLS to a New Table
```sql
-- Step 1: Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Step 2: Create basic read policy
CREATE POLICY "Users can view new_table" ON new_table
  FOR SELECT USING (auth.role() = 'authenticated');

-- Step 3: Create write policies as needed
CREATE POLICY "Users can insert new_table" ON new_table
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 4: Add role-specific policies if needed
CREATE POLICY "Shop owners can manage new_table" ON new_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'shop_owner'
    )
  );
```

### Testing RLS Policies
```sql
-- Test as authenticated user
SET request.jwt.claims TO '{"sub": "user-uuid", "role": "authenticated"}';
SELECT * FROM customers; -- Should work

-- Test as unauthenticated
SET request.jwt.claims TO '{}';
SELECT * FROM customers; -- Should fail

-- Test role-specific access
SET request.jwt.claims TO '{"sub": "shop-owner-uuid", "role": "authenticated"}';
-- Verify shop owner can access admin functions
```

## Simplified Security Approach

### 1. Simple Policy Design
**Principle**: Keep policies as simple as possible for small shop operations.

**Our Approach**:
```sql
-- Most tables: Simple authenticated access
CREATE POLICY "policy" ON most_tables
  FOR ALL USING (auth.role() = 'authenticated');

-- Admin only: Shop Owner check for staff management
CREATE POLICY "admin_policy" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'shop_owner'
    )
  );
```

### 2. Performance Considerations
- **Simple policies**: Fast execution with minimal database overhead
- **Index auth columns**: Basic indexing on user_id columns
- **No complex logic**: Avoid performance bottlenecks

### 3. Vietnamese Business Requirements
- **Character Encoding**: Full UTF-8 support for Vietnamese text
- **Simple Role Names**: Vietnamese role labels in UI only
- **Basic Validation**: Standard phone/email validation

### 4. Maintenance Benefits
- **Easy to understand**: Simple 2-pattern system
- **Easy to debug**: Minimal complexity reduces troubleshooting
- **Easy to extend**: Clear patterns for future tables

## Troubleshooting

### Common RLS Issues

#### 1. "Insufficient Privileges" Errors
**Cause**: RLS policy denying access
**Solution**:
- Check user authentication status
- Verify role in user_profiles table
- Review policy conditions

#### 2. Empty Result Sets
**Cause**: RLS filtering out results
**Debug**:
```sql
-- Check current user context
SELECT auth.uid(), auth.role();

-- Verify user profile
SELECT * FROM user_profiles WHERE id = auth.uid();
```

#### 3. Policy Recursion Errors
**Cause**: Policy referencing same table
**Solution**: Simplify policy or use auth.* functions

#### 4. Performance Issues
**Cause**: Complex RLS policies
**Solution**:
- Add indexes on filtered columns
- Simplify policy logic
- Use EXPLAIN ANALYZE to identify bottlenecks

### Debugging Tools

#### Check RLS Status
```sql
-- View all RLS-enabled tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE rowsecurity = true;

-- View policies for a table
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

#### Test User Context
```sql
-- Current auth context
SELECT
  auth.uid() as user_id,
  auth.role() as role,
  auth.email() as email;

-- User profile info
SELECT id, email, full_name, role
FROM user_profiles
WHERE id = auth.uid();
```

## Migration References

### Core RLS Setup
- **File**: `supabase/migrations/20250923070000_initial_schema.sql`
- **Tables**: customers, user_profiles, parts, repair_tickets

### Extended RLS Implementation
- **Inventory**: `20250923150000_inventory_integration_system.sql`
- **Financial**: `20250923160000_cost_tracking_billing_system.sql`
- **Customer**: `20250923170000_customer_profile_enhancement.sql`
- **History**: `20250923180000_customer_history_enhancement.sql`

### RLS Policy Fixes
- **User Profiles Fix**: `20250924000000_fix_user_profiles_policy.sql`
- **Simple Policies**: `20250924000001_simple_user_profiles_policy.sql`

## Best Practices

### 1. Policy Design
- **Principle of Least Privilege**: Grant minimum necessary access
- **Clear Naming**: Use descriptive policy names
- **Consistent Patterns**: Follow established patterns across tables
- **Documentation**: Document complex business logic in policies

### 2. Testing Strategy
- **Unit Tests**: Test each policy independently
- **Integration Tests**: Verify cross-table access patterns
- **Role Testing**: Test all user roles systematically
- **Edge Cases**: Test boundary conditions and error states

### 3. Maintenance
- **Regular Audits**: Review policies for security gaps
- **Performance Monitoring**: Monitor query performance impact
- **Schema Changes**: Update policies when tables change
- **Documentation Updates**: Keep this document current

### 4. Vietnamese Business Integration
- **Localized Security**: Ensure Vietnamese text handling
- **Business Rules**: Integrate shop-specific logic
- **Cultural Considerations**: Respect Vietnamese business practices
- **Legal Compliance**: Meet Vietnamese data protection requirements

---

## Related Documentation
- [Database Schema Migrations](../stories/1.1.2.database-schema-migrations.md)
- [Role-Based Access Control](../stories/1.2.2.role-based-access-control.md)
- [Supabase Auth Integration](../stories/1.2.1.supabase-auth-vietnamese-integration.md)
- [Technical Architecture](./tech-stack.md)

## Contact & Support
For RLS-related issues or questions, refer to:
- Database migration files in `supabase/migrations/`
- Auth context implementation in `src/contexts/auth-context.tsx`
- Protected route components in `src/components/protected-route.tsx`

*This document is maintained as part of the Vietnamese Laptop Repair Shop Management System architecture documentation.*