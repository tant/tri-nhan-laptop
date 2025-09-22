# Story 01.2: Database Schema Implementation

## User Story

**As a** backend developer,
**I want** a complete PostgreSQL database schema với simplified tables và relationships,
**So that** application có thể lưu trữ và quản lý dữ liệu business logic cho laptop repair shop.

## Story Context

**Schema Design Philosophy:**
- Simplified schema phù hợp với small business (<10 staff)
- Phone-as-primary-key cho customers (Vietnamese business model)
- JSONB cho parts usage thay vì separate tables
- 2-role user system (shop_owner, staff)

**Technical Foundation:**
- PostgreSQL với Supabase extensions
- UUID primary keys cho most tables
- Proper indexes cho performance
- Constraints để đảm bảo data integrity

## Acceptance Criteria

### **Functional Requirements:**

**AC-F1: Core Tables Creation**
```gherkin
GIVEN a fresh PostgreSQL database
WHEN database schema migration runs
THEN customers table exists với phone as primary key
AND repair_tickets table exists với UUID primary key
AND user_profiles table exists linked to Supabase auth
AND parts table exists với inventory tracking
AND all tables have proper timestamps (created_at, updated_at)
```

**AC-F2: Customers Table Schema**
```gherkin
GIVEN customers table creation
WHEN table schema is validated
THEN phone field is VARCHAR(20) PRIMARY KEY
AND full_name field is VARCHAR(255) NOT NULL
AND address field is TEXT (optional)
AND notes field is TEXT (optional)
AND created_at is TIMESTAMPTZ DEFAULT NOW()
AND updated_at is TIMESTAMPTZ DEFAULT NOW()
```

**AC-F3: Repair Tickets Table Schema**
```gherkin
GIVEN repair_tickets table creation
WHEN table schema is validated
THEN id field is UUID PRIMARY KEY DEFAULT gen_random_uuid()
AND ticket_code is VARCHAR(20) UNIQUE NOT NULL
AND customer_phone field references customers(phone)
AND device_type is VARCHAR(100) NOT NULL
AND device_model is VARCHAR(100)
AND issue_description is TEXT NOT NULL
AND status is ENUM với 16 predefined values
AND assigned_to references user_profiles(id)
AND total_cost is DECIMAL(10,2) DEFAULT 0
AND parts_used is JSONB (array of part usage objects)
AND warranty_until is DATE (optional)
AND created_at, updated_at timestamps exist
```

**AC-F4: User Profiles Table Schema**
```gherkin
GIVEN user_profiles table creation
WHEN table schema is validated
THEN id field is UUID PRIMARY KEY references auth.users(id)
AND email field is VARCHAR(255) UNIQUE NOT NULL
AND full_name field is VARCHAR(255) NOT NULL
AND role field is ENUM('shop_owner', 'staff') DEFAULT 'staff'
AND is_active field is BOOLEAN DEFAULT TRUE
AND phone field is VARCHAR(20) (optional)
AND created_at, updated_at timestamps exist
```

**AC-F5: Parts Table Schema**
```gherkin
GIVEN parts table creation
WHEN table schema is validated
THEN id field is UUID PRIMARY KEY DEFAULT gen_random_uuid()
AND name field is VARCHAR(255) NOT NULL
AND category field is VARCHAR(100)
AND brand field is VARCHAR(100)
AND model_compatibility field is TEXT[] (array)
AND current_stock field is INTEGER DEFAULT 10000
AND unit_cost field is DECIMAL(10,2)
AND unit_price field is DECIMAL(10,2)
AND supplier_info field is TEXT (optional)
AND created_at, updated_at timestamps exist
```

### **Data Integrity Requirements:**

**AC-DI1: Foreign Key Constraints**
```gherkin
GIVEN database tables với relationships
WHEN foreign key constraints are tested
THEN repair_tickets.customer_phone correctly references customers.phone
AND repair_tickets.assigned_to correctly references user_profiles.id
AND user_profiles.id correctly references auth.users.id ON DELETE CASCADE
AND orphaned records cannot be created
AND referential integrity is maintained
```

**AC-DI2: ENUM Type Definitions**
```gherkin
GIVEN ENUM types creation
WHEN ENUM values are validated
THEN user_role ENUM contains exactly ('shop_owner', 'staff')
AND ticket_status ENUM contains all 16 repair workflow states:
  ('device_received', 'preliminary_inspection', 'awaiting_repair_plan',
   'approved_for_repair', 'in_diagnosis', 'waiting_parts', 'in_repair',
   'quality_testing', 'ready_for_pickup', 'completed', 'cannot_repair',
   'cancelled_by_customer', 'repair_failed', 'customer_no_show',
   'ready_for_return', 'abandoned')
```

**AC-DI3: Check Constraints**
```gherkin
GIVEN tables với business rules
WHEN check constraints are validated
THEN customers.phone matches Vietnamese phone format pattern
AND repair_tickets.total_cost >= 0
AND parts.current_stock >= 0
AND parts.unit_cost >= 0 AND unit_price >= 0
AND user_profiles.email matches email format
```

### **Performance Requirements:**

**AC-P1: Database Indexes**
```gherkin
GIVEN database tables creation
WHEN index optimization is applied
THEN customers.phone has PRIMARY KEY index (automatic)
AND repair_tickets.ticket_code has UNIQUE index
AND repair_tickets.customer_phone has index for lookups
AND repair_tickets.status has index for filtering
AND repair_tickets.assigned_to has index for staff queries
AND user_profiles.email has UNIQUE index
AND parts.category has index for filtering
```

**AC-P2: Query Performance**
```gherkin
GIVEN database với sample data (1000+ tickets)
WHEN common queries are executed
THEN customer ticket lookup by phone < 50ms
AND ticket search by status < 100ms
AND staff assigned tickets query < 100ms
AND parts search by category < 50ms
```

### **Data Validation Requirements:**

**AC-V1: Vietnamese Phone Number Validation**
```gherkin
GIVEN customers table phone field
WHEN phone numbers are inserted
THEN Vietnamese mobile format (0xxx xxx xxx) is accepted
AND Vietnamese landline format (0xx xxx xxxx) is accepted
AND international format (+84...) is accepted
AND invalid formats are rejected với meaningful error
```

**AC-V2: JSONB Parts Usage Validation**
```gherkin
GIVEN repair_tickets.parts_used JSONB field
WHEN parts usage data is stored
THEN valid format: [{"part_id": "uuid", "name": "string", "quantity": number, "unit_price": number}]
AND array of objects structure is enforced
AND required fields in each object are validated
AND invalid JSON structure is rejected
```

**AC-V3: Status Transition Validation**
```gherkin
GIVEN repair ticket status updates
WHEN status changes are made
THEN only valid ENUM values are accepted
AND invalid status values are rejected
AND business logic constraints can be added later
```

### **Integration Requirements:**

**AC-I1: Supabase Auth Integration**
```gherkin
GIVEN user_profiles table linked to auth.users
WHEN Supabase auth user is created
THEN corresponding user_profile can be created với same UUID
AND CASCADE DELETE works when auth user is deleted
AND auth user without profile can be handled gracefully
```

**AC-I2: Automatic Timestamp Updates**
```gherkin
GIVEN tables với updated_at fields
WHEN record updates occur
THEN updated_at field automatically updates to current timestamp
AND created_at field remains unchanged
AND timezone handling is consistent (UTC)
```

**AC-I3: Database Functions & Triggers**
```gherkin
GIVEN database schema setup
WHEN supporting functions are created
THEN ticket_code generation function exists
AND automatic updated_at trigger function exists
AND functions are applied to appropriate tables
```

## Technical Implementation Details

### **Core Tables SQL:**
```sql
-- User roles enum
CREATE TYPE user_role AS ENUM ('shop_owner', 'staff');

-- Ticket status enum
CREATE TYPE ticket_status AS ENUM (
  'device_received', 'preliminary_inspection', 'awaiting_repair_plan',
  'approved_for_repair', 'in_diagnosis', 'waiting_parts', 'in_repair',
  'quality_testing', 'ready_for_pickup', 'completed', 'cannot_repair',
  'cancelled_by_customer', 'repair_failed', 'customer_no_show',
  'ready_for_return', 'abandoned'
);

-- Customers table (phone as PK)
CREATE TABLE customers (
  phone VARCHAR(20) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT phone_format CHECK (phone ~ '^(\+84|0)[0-9]{8,10}$')
);

-- User profiles (linked to Supabase auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parts inventory (simplified)
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  model_compatibility TEXT[],
  current_stock INTEGER DEFAULT 10000 CHECK (current_stock >= 0),
  unit_cost DECIMAL(10,2) CHECK (unit_cost >= 0),
  unit_price DECIMAL(10,2) CHECK (unit_price >= 0),
  supplier_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repair tickets (core business entity)
CREATE TABLE repair_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code VARCHAR(20) UNIQUE NOT NULL,
  customer_phone VARCHAR(20) NOT NULL REFERENCES customers(phone),
  device_type VARCHAR(100) NOT NULL,
  device_model VARCHAR(100),
  issue_description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'device_received',
  assigned_to UUID REFERENCES user_profiles(id),
  total_cost DECIMAL(10,2) DEFAULT 0 CHECK (total_cost >= 0),
  parts_used JSONB DEFAULT '[]'::jsonb,
  warranty_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Automated Testing Scenarios:**

**Test Suite: Database Schema Validation**
```typescript
describe('Database Schema Implementation', () => {
  test('AC-F1: All core tables exist', async () => {
    const tables = await query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
    expect(tables.map(t => t.tablename)).toContain('customers');
    expect(tables.map(t => t.tablename)).toContain('repair_tickets');
    expect(tables.map(t => t.tablename)).toContain('user_profiles');
    expect(tables.map(t => t.tablename)).toContain('parts');
  });

  test('AC-DI1: Foreign key constraints work', async () => {
    // Test invalid customer_phone reference
    await expect(
      query('INSERT INTO repair_tickets (ticket_code, customer_phone, device_type, issue_description) VALUES ($1, $2, $3, $4)',
            ['LRP-2025-000001', '0999999999', 'Laptop', 'Test issue'])
    ).rejects.toThrow('violates foreign key constraint');
  });

  test('AC-V1: Vietnamese phone validation', async () => {
    // Valid formats
    await expect(insertCustomer('0901234567', 'Test Customer')).resolves.toBeTruthy();
    await expect(insertCustomer('+84901234567', 'Test Customer 2')).resolves.toBeTruthy();

    // Invalid formats
    await expect(insertCustomer('123456', 'Invalid Customer')).rejects.toThrow();
    await expect(insertCustomer('abc123def', 'Invalid Customer 2')).rejects.toThrow();
  });

  test('AC-P2: Query performance benchmarks', async () => {
    await seedTestData(1000); // Create test data

    const start = Date.now();
    await query('SELECT * FROM repair_tickets WHERE customer_phone = $1', ['0901234567']);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50); // < 50ms requirement
  });
});
```

## Definition of Done

- [ ] **AC-F1:** All core tables created successfully
- [ ] **AC-F2:** Customers table schema correct
- [ ] **AC-F3:** Repair tickets table schema correct
- [ ] **AC-F4:** User profiles table schema correct
- [ ] **AC-F5:** Parts table schema correct
- [ ] **AC-DI1:** Foreign key constraints working
- [ ] **AC-DI2:** ENUM types properly defined
- [ ] **AC-DI3:** Check constraints enforcing business rules
- [ ] **AC-P1:** Proper indexes created
- [ ] **AC-P2:** Query performance meets requirements
- [ ] **AC-V1:** Phone number validation working
- [ ] **AC-V2:** JSONB parts usage validation
- [ ] **AC-V3:** Status transition validation
- [ ] **AC-I1:** Supabase auth integration working
- [ ] **AC-I2:** Automatic timestamps functioning
- [ ] **AC-I3:** Database functions and triggers active
- [ ] **Migration Scripts:** Idempotent và repeatable
- [ ] **Automated Tests:** All acceptance criteria covered
- [ ] **Documentation:** Schema documentation complete

## Risk Mitigation

- **Primary Risk:** Data migration issues or constraint violations
- **Mitigation:** Comprehensive validation tests, rollback scripts
- **Rollback Plan:** Database reset và fresh schema application

## Story Dependencies

- **Prerequisites:** Story 01.1 (Docker Infrastructure Setup)
- **Enables:** Story 01.3 (Authentication & RLS), all application features
- **Estimated Effort:** 1-2 days
- **Priority:** Critical (foundation for all business logic)