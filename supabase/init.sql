-- =====================================================
-- DATABASE SCHEMA FOR VIETNAMESE LAPTOP REPAIR SYSTEM
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS AND CUSTOM TYPES
-- =====================================================

-- Repair ticket status enum (16 states from project brief)
CREATE TYPE repair_status AS ENUM (
  'device_received',           -- Đã tiếp nhận thiết bị
  'preliminary_inspection',    -- Đang kiểm tra ban đầu
  'awaiting_repair_plan',     -- Chờ xác nhận phương án sửa chữa
  'approved_for_repair',      -- Đã xác nhận sửa chữa
  'in_diagnosis',             -- Đang chẩn đoán chi tiết
  'waiting_parts',            -- Đang đặt hàng linh kiện
  'in_repair',                -- Đang thực hiện sửa chữa
  'quality_testing',          -- Đang kiểm tra chất lượng
  'ready_for_pickup',         -- Sẵn sàng nhận máy
  'completed',                -- Đã hoàn thành
  'cannot_repair',            -- Không thể sửa chữa
  'cancelled_by_customer',    -- Đã hủy sửa chữa
  'repair_failed',            -- Sửa chữa gặp khó khăn
  'customer_no_show',         -- Chờ khách hàng liên hệ
  'ready_for_return',         -- Sẵn sàng trả máy
  'abandoned'                 -- Liên hệ để nhận máy
);

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'shop_owner',
  'staff'
);

-- Payment methods enum
CREATE TYPE payment_method AS ENUM (
  'cash',
  'transfer',
  'other'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Customers table (phone as primary key)
CREATE TABLE customers (
  phone VARCHAR(20) PRIMARY KEY,  -- Vietnamese phone number format
  full_name VARCHAR(255) NOT NULL,
  address TEXT,
  notes TEXT,                     -- Internal staff notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (standalone for demo purposes)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repair tickets table
CREATE TABLE repair_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code VARCHAR(20) UNIQUE NOT NULL, -- LRP-2025-000123
  customer_phone VARCHAR(20) NOT NULL REFERENCES customers(phone),
  device_info JSONB NOT NULL,             -- {brand, model, serial_number, initial_condition}
  issue_description TEXT NOT NULL,
  status repair_status DEFAULT 'device_received',
  assigned_technician_id UUID REFERENCES user_profiles(id),
  parts_used JSONB,                       -- [{part_id, name, quantity, unit_price}]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_completion TIMESTAMPTZ,

  -- Financial fields
  total_cost DECIMAL(12,2),
  deposit_amount DECIMAL(12,2),
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  payment_method payment_method,
  receipt_note TEXT,

  -- Warranty
  warranty_until DATE,

  -- Status transition validation fields
  has_issue_report BOOLEAN DEFAULT FALSE,
  customer_approved_at TIMESTAMPTZ,
  customer_approved_by UUID REFERENCES user_profiles(id),
  repair_completed_at TIMESTAMPTZ,
  repair_completed_by UUID REFERENCES user_profiles(id),
  paid_by UUID REFERENCES user_profiles(id)
);

-- Parts inventory table
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model_compatibility TEXT[],             -- Array of compatible laptop models
  current_stock INTEGER DEFAULT 10000,    -- Simplified stock (per project brief)
  unit_cost DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  supplier_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parts usage in repairs has been removed for simplicity.
-- Parts are now tracked in the `parts_used` JSONB field on the `repair_tickets` table.

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_customer_phone ON repair_tickets(customer_phone);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status ON repair_tickets(status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_created_at ON repair_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ticket_code ON repair_tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_stock ON parts(current_stock);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- =====================================================
-- BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Generate sequential ticket code
CREATE OR REPLACE FUNCTION generate_ticket_code(year INTEGER)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  code TEXT;
BEGIN
  -- Get next sequence number for the year
  SELECT nextval('ticket_sequence') INTO next_number;

  -- Format as LRP-YYYY-NNNNNN
  code := 'LRP-' || year::TEXT || '-' || lpad(next_number::TEXT, 6, '0');

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Validate status transitions
CREATE OR REPLACE FUNCTION validate_status_transition(
  current_status repair_status,
  new_status repair_status,
  ticket_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  ticket_record repair_tickets%ROWTYPE;
BEGIN
  SELECT * INTO ticket_record FROM repair_tickets WHERE id = ticket_uuid;

  -- Business rules from project brief
  CASE
    WHEN current_status = 'preliminary_inspection' AND new_status = 'awaiting_repair_plan' THEN
      RETURN ticket_record.has_issue_report = TRUE;
    WHEN current_status = 'awaiting_repair_plan' AND new_status = 'approved_for_repair' THEN
      RETURN ticket_record.customer_approved_at IS NOT NULL;
    WHEN current_status = 'in_repair' AND new_status = 'quality_testing' THEN
      RETURN ticket_record.repair_completed_at IS NOT NULL;
    WHEN current_status = 'ready_for_pickup' AND new_status = 'completed' THEN
      RETURN ticket_record.is_paid = TRUE AND ticket_record.paid_at IS NOT NULL;
    ELSE
      RETURN TRUE; -- Allow other transitions
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_repair_tickets_updated_at BEFORE UPDATE ON repair_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable realtime for key tables
ALTER TABLE repair_tickets REPLICA IDENTITY FULL;
ALTER TABLE customers REPLICA IDENTITY FULL;
ALTER TABLE parts REPLICA IDENTITY FULL;