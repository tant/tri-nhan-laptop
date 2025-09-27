# Vietnamese Laptop Repair Shop - Database Schema Documentation

Generated on: 2025-09-27

## Table of Contents
1. [Overview](#overview)
2. [Core Business Tables](#core-business-tables)
3. [Supporting Tables](#supporting-tables)
4. [Enums and Types](#enums-and-types)
5. [Indexes and Performance](#indexes-and-performance)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Functions and Triggers](#functions-and-triggers)
8. [Sample Data](#sample-data)
9. [Schema Evolution](#schema-evolution)

## Overview

This database schema is designed for a Vietnamese laptop repair shop management system. It uses PostgreSQL with Supabase and follows Vietnamese business practices, including phone numbers as customer primary keys and a comprehensive 16-status repair workflow.

**Key Characteristics:**
- **Primary Language**: Vietnamese (UI text, error messages, status labels)
- **Customer Identification**: Phone numbers as primary keys
- **Currency**: VND (Vietnamese Dong)
- **Timezone**: Asia/Ho_Chi_Minh
- **Locale**: vi-VN

## Core Business Tables

### 1. customers
Simplified customer information table using Vietnamese phone numbers as primary keys.

```sql
CREATE TABLE customers (
  phone TEXT PRIMARY KEY,                    -- Vietnamese phone number (no spaces, e.g., 0901234567)
  full_name TEXT NOT NULL,                  -- Customer full name (required)
  address TEXT,                             -- Customer address (optional, simple string)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Key Features:**
- Phone number as primary key (Vietnamese business practice, no spaces)
- Minimal required fields: phone and full_name only
- Optional address field for delivery/contact purposes
- Simplified structure for easier maintenance and faster queries

### 2. repair_tickets
Central table for repair workflow management with 16-status Vietnamese repair process.

```sql
CREATE TABLE repair_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ticket_code TEXT UNIQUE NOT NULL,         -- Auto-generated: LRP-YYYY-XXXXXX
  customer_phone TEXT NOT NULL REFERENCES customers(phone),
  device_info JSONB NOT NULL DEFAULT '{}', -- Device details (brand, model, etc.)

  -- Issue descriptions (CRITICAL FIELDS)
  issue_description TEXT NOT NULL,          -- Staff technical diagnosis
  customer_description TEXT NOT NULL,      -- Customer's original problem description
  priority repair_priority DEFAULT 'normal',-- Repair priority level

  -- Status and workflow
  status repair_status DEFAULT 'device_received' NOT NULL,
  assigned_technician_id UUID REFERENCES user_profiles(id),
  estimated_completion TIMESTAMPTZ,

  -- Financial tracking (for reference only - payments handled externally)
  total_cost NUMERIC(10,2),                -- Total cost for customer reference
  deposit_amount NUMERIC(10,2),            -- Deposit amount for customer reference
  labor_cost NUMERIC(10,2) DEFAULT 0,      -- Labor charges
  labor_hours NUMERIC(5,2) DEFAULT 0,      -- Hours worked
  overhead_cost NUMERIC(10,2) DEFAULT 0,   -- Overhead charges
  discount_amount NUMERIC(10,2) DEFAULT 0, -- Applied discounts
  tax_amount NUMERIC(10,2) DEFAULT 0,      -- Tax charges
  parts_cost_total NUMERIC(10,2) DEFAULT 0,-- Total parts cost
  final_total_cost NUMERIC(10,2),          -- Final calculated total

  -- Service quality and follow-up
  warranty_until TIMESTAMPTZ,              -- Warranty expiration
  customer_satisfaction_rating INTEGER,     -- 1-5 rating
  customer_feedback TEXT,                   -- Customer feedback
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,

  -- Advanced features
  parts_used JSONB DEFAULT '[]',            -- Parts usage tracking
  quote_approved BOOLEAN DEFAULT FALSE,     -- Customer quote approval
  has_issue_report BOOLEAN DEFAULT FALSE NOT NULL,
  customer_approved_at TIMESTAMPTZ,
  customer_approved_by TEXT,
  repair_completed_at TIMESTAMPTZ,
  repair_completed_by UUID REFERENCES user_profiles(id),
  device_id UUID REFERENCES customer_devices(id),
  repair_category TEXT,                     -- Categorization
  complexity_level TEXT DEFAULT 'medium',  -- low/medium/high/expert
  recurring_issue BOOLEAN DEFAULT FALSE,   -- Repeat problem flag
  previous_repair_reference UUID REFERENCES repair_tickets(id), -- Self-reference
  version INTEGER DEFAULT 1                -- Optimistic locking
);
```

**Key Features:**
- Auto-generated ticket codes (LRP-2025-000001 format)
- Dual issue descriptions (customer + staff technical)
- Financial tracking for cost reference (payments handled externally)
- 16-status Vietnamese repair workflow
- Customer satisfaction and follow-up tracking
- Recurring issue detection

### 3. parts
Inventory management with compatibility metadata for Vietnamese laptop models.

```sql
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,                       -- Part name
  category TEXT NOT NULL,                   -- Part category (Memory, Storage, etc.)
  brand TEXT,                               -- Manufacturer brand
  model_compatibility TEXT[] DEFAULT '{}', -- Compatible laptop models
  current_stock INTEGER DEFAULT 0 NOT NULL,-- Current inventory level
  unit_cost NUMERIC(10,2) NOT NULL,        -- Purchase cost
  unit_price NUMERIC(10,2) NOT NULL,       -- Base selling price
  selling_price NUMERIC(10,2) DEFAULT 0 NOT NULL, -- Actual selling price
  min_stock_level INTEGER DEFAULT 5 NOT NULL,     -- Reorder threshold
  supplier_info TEXT                        -- Supplier contact details
);
```

**Key Features:**
- Compatibility tracking for Vietnamese laptop models
- Dual pricing (base and actual selling prices)
- Automatic low-stock detection
- Supplier relationship management

### 4. user_profiles
Staff accounts with role-based access control.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'staff' NOT NULL, -- shop_owner/staff
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);
```

**Key Features:**
- Linked to Supabase Auth system
- Two-tier role system (shop_owner/staff)
- Active/inactive status management

## Supporting Tables

### Financial and Cost Management
- **cost_change_history**: Tracks all cost modifications with approval workflow
- **repair_cost_breakdown**: Detailed cost analysis per repair
- **repair_cost_history**: Historical cost tracking
- **profit_analysis**: Financial performance analysis

### Customer Relationship Management
- **customer_contact_history**: Communication logs
- **customer_data_changes**: Data modification audit trail
- **customer_devices**: Device registration and tracking
- **customer_quotes**: Quote generation and approval
- **customer_service_preferences**: Service customization

### Inventory and Parts Management
- **inventory_transactions**: Stock movement tracking
- **parts_reservations**: Parts allocation for repairs
- **repair_parts**: Actual parts usage in repairs

### Service Intelligence
- **service_notes**: Technician notes and observations
- **service_patterns**: Recurring issue detection
- **repair_status_logs**: Status change audit trail
- **warranty_records**: Warranty tracking and claims

### System Management
- **audit_logs**: System-wide audit trail
- **sync_events**: Data synchronization tracking
- **sync_conflicts**: Conflict resolution logs
- **sync_sessions**: Synchronization session management
- **ticket_sequences**: Ticket code sequence management
- **rate_limit_tracking**: API rate limiting
- **customer_access_logs**: Customer portal access logs

## Enums and Types

### repair_status (16 statuses)
Vietnamese repair workflow with timeout guidelines:

```sql
CREATE TYPE repair_status AS ENUM (
  'device_received',        -- Device accepted, initial documentation
  'preliminary_inspection', -- Basic functionality testing
  'awaiting_repair_plan',   -- Diagnosis complete, planning repair
  'approved_for_repair',    -- Customer approved repair plan
  'in_diagnosis',          -- Detailed technical diagnosis
  'waiting_parts',         -- Waiting for parts delivery
  'in_repair',             -- Active repair work
  'quality_testing',       -- Post-repair testing
  'ready_for_pickup',      -- Repair complete, awaiting customer
  'completed',             -- Customer collected device
  'cannot_repair',         -- Technically impossible to repair
  'cancelled_by_customer', -- Customer cancelled repair
  'repair_failed',         -- Repair attempt unsuccessful
  'customer_no_show',      -- Customer didn't collect device
  'ready_for_return',      -- Prepared for return to customer
  'abandoned'              -- Long-term uncollected device
);
```


### user_role
```sql
CREATE TYPE user_role AS ENUM (
  'shop_owner', -- Full administrative access
  'staff'       -- Standard technician access
);
```

### repair_priority
```sql
CREATE TYPE repair_priority AS ENUM (
  'low',    -- Không gấp
  'normal', -- Bình thường
  'high',   -- Gấp
  'urgent'  -- Khẩn cấp
);
```


## Indexes and Performance

### Critical Performance Indexes

```sql
-- Repair tickets (most queried table)
CREATE INDEX idx_repair_tickets_customer_phone ON repair_tickets(customer_phone);
CREATE INDEX idx_repair_tickets_status ON repair_tickets(status);
CREATE INDEX idx_repair_tickets_created_at ON repair_tickets(created_at);
CREATE INDEX idx_repair_tickets_ticket_code ON repair_tickets(ticket_code);
CREATE INDEX idx_repair_tickets_priority ON repair_tickets(priority);
CREATE INDEX idx_repair_tickets_completion_date ON repair_tickets(repair_completed_at);

-- Parts inventory
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_current_stock ON parts(current_stock);
CREATE INDEX idx_parts_stock_comparison ON parts(current_stock, min_stock_level);
CREATE INDEX idx_parts_model_compatibility ON parts USING GIN(model_compatibility);

-- Customer management (simplified)
CREATE INDEX idx_customers_full_name ON customers(full_name);

-- Full-text search
CREATE INDEX idx_parts_text_search ON parts USING GIN(
  to_tsvector('simple', COALESCE(name,'') || ' ' ||
                       COALESCE(category,'') || ' ' ||
                       COALESCE(brand,'') || ' ' ||
                       COALESCE(supplier_info,''))
);
```

## Row Level Security (RLS)

All tables have RLS enabled with policies for authenticated users:

### Standard Policies
```sql
-- View access for authenticated users
CREATE POLICY "Users can view all [table]" ON [table]
  FOR SELECT USING (auth.role() = 'authenticated');

-- Management access for authenticated users
CREATE POLICY "Users can manage [table]" ON [table]
  FOR ALL USING (auth.role() = 'authenticated');
```

### Special Policies
- **user_profiles**: Users can update own profile, shop_owners can manage all
- **Public access**: Some tables have public read policies for customer lookup

## Functions and Triggers

### Automatic Timestamp Updates
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Ticket Code Generation
```sql
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  next_sequence INTEGER;
BEGIN
  year_part := EXTRACT(year FROM NOW())::TEXT;

  SELECT COALESCE(MAX(
    CASE WHEN ticket_code ~ ('^LRP-' || year_part || '-[0-9]{6}$')
    THEN SUBSTRING(ticket_code FROM LENGTH('LRP-' || year_part || '-') + 1)::INTEGER
    ELSE 0 END
  ), 0) + 1 INTO next_sequence FROM repair_tickets;

  sequence_part := LPAD(next_sequence::TEXT, 6, '0');
  RETURN 'LRP-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;
```

### Service Pattern Tracking
- Automatic detection of recurring issues
- Customer service preference updates
- Inventory transaction logging

### Version Control
- Optimistic locking with version increments
- Data change audit trails
- Customer data modification tracking

## Sample Data

The database includes comprehensive Vietnamese test data:

### Sample Customers
```sql
-- Simplified customer data with phone, full_name, and address
('0901234567', 'Nguyễn Văn An', '123 Đường ABC, Quận 1, TP.HCM'),
('0912345678', 'Trần Thị Bình', '456 Đường DEF, Quận 2, TP.HCM'),
('0923456789', 'Lê Minh Cường', '789 Đường GHI, Quận 3, TP.HCM'),
('0934567890', 'Phạm Thị Dung', NULL) -- Address is optional
```

### Sample Repair Tickets
- **LRP-2025-000001**: Dell Inspiron power issue (0901234567)
- **LRP-2025-000002**: HP Pavilion screen damage (0912345678)
- Complete ticket lifecycle examples with Vietnamese descriptions

### Sample Parts Inventory
```sql
-- Common laptop parts with Vietnamese suppliers
('RAM DDR4 8GB', 'Memory', 'Samsung', '{"Dell Inspiron", "HP Pavilion"}', 25, 800000, 1200000),
('SSD 256GB', 'Storage', 'Samsung', '{"Universal"}', 15, 1500000, 2200000)
```

## Schema Evolution

### Migration History
1. **20250923070000**: Initial schema with core tables
2. **20250923084130**: Added min_stock_level to parts
3. **20250923120000**: Parts search indexes
4. **20250923160000**: Cost tracking and billing system
5. **20250923170000**: Customer profile enhancements
6. **20250923180000**: Customer history tracking
7. **20250923190000**: Ticket code generation system
8. **20250923150000**: Inventory integration
9. **20250923200000**: Data synchronization system
10. **20250924000000**: User profiles policy fixes
11. **20250925000000**: Audit infrastructure
12. **20250925**: **CRITICAL** - Added customer_description field
13. **20250926**: Added priority column
14. **20250927_140000**: Simplified customer data structure
15. **20250927_remove_payment**: **CRITICAL** - Removed payment management

### Recent Critical Changes

#### Added customer_description Field (2025-09-25)
**Breaking Change**: Added required `customer_description` field to distinguish between:
- `issue_description`: Staff technical diagnosis
- `customer_description`: Customer's original problem description

**Migration Impact**: All existing tickets updated with fallback values.

#### Added Priority System (2025-09-26)
Added `repair_priority` enum and `priority` column for ticket prioritization:
- `low`: Non-urgent repairs
- `normal`: Standard priority (default)
- `high`: High priority repairs
- `urgent`: Emergency repairs

#### Removed Payment Management (2025-09-27)
**Breaking Change**: Completely removed payment tracking functionality:
- Removed columns: `is_paid`, `paid_at`, `payment_method`, `receipt_note`, `paid_by`
- Dropped `payment_method` enum type
- Financial fields (`total_cost`, `deposit_amount`) retained for reference only
- Payment processing now handled externally

## Business Logic Constraints

### Validation Rules
```sql
-- Ticket code format validation
ALTER TABLE repair_tickets ADD CONSTRAINT chk_ticket_code_format
  CHECK (ticket_code IS NULL OR validate_ticket_code(ticket_code));

-- Positive cost validation (enforced at application level)
-- Priority defaults to 'normal' if not specified
-- Phone numbers must follow Vietnamese format (enforced at application level)
```

### Foreign Key Relationships
- All user references point to `user_profiles(id)`
- Customer references use `customers(phone)`
- Device tracking through `customer_devices(id)`
- Self-referencing for repair history tracking

### Data Integrity
- Cascade deletes for dependent records
- Version tracking for optimistic locking
- Audit trails for sensitive data changes
- Real-time sync conflict resolution

---

**Note**: This schema is specifically designed for Vietnamese laptop repair shops and includes domain-specific business logic that should be preserved when making changes. The schema supports comprehensive repair workflow management, inventory tracking, customer relationship management, and cost tracking. Payment processing is handled externally - the system only tracks costs for reference purposes.