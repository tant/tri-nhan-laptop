-- Laptop Repair Shop Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create enum types
CREATE TYPE repair_status AS ENUM (
  'received',
  'diagnosed', 
  'waiting_parts',
  'in_progress',
  'completed',
  'ready_for_pickup',
  'delivered',
  'cancelled'
);

CREATE TYPE repair_priority AS ENUM (
  'low',
  'normal', 
  'high',
  'urgent'
);

CREATE TYPE user_role AS ENUM (
  'shop_owner',
  'manager', 
  'technician',
  'staff'
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Permissions
  can_create_users BOOLEAN DEFAULT false,
  can_manage_inventory BOOLEAN DEFAULT false,
  can_view_financials BOOLEAN DEFAULT false,
  can_delete_repairs BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Device information
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_serial TEXT,
  
  -- Repair details
  issue_description TEXT NOT NULL,
  diagnosis TEXT,
  repair_notes TEXT,
  
  -- Status and priority
  status repair_status DEFAULT 'received',
  priority repair_priority DEFAULT 'normal',
  
  -- Cost information
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  
  -- Dates
  estimated_completion_date DATE,
  actual_completion_date DATE,
  
  -- Staff tracking
  assigned_technician_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Images
  images TEXT[] DEFAULT '{}',
  
  -- Internal tracking
  ticket_number TEXT UNIQUE NOT NULL DEFAULT 'RPR-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('repair_ticket_seq')::text, 4, '0')
);

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS repair_ticket_seq START 1;

-- Repair status logs table (for tracking status changes)
CREATE TABLE IF NOT EXISTS repair_status_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
  old_status repair_status,
  new_status repair_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id)
);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  part_number TEXT UNIQUE,
  supplier TEXT,
  cost DECIMAL(10,2),
  quantity_in_stock INTEGER DEFAULT 0,
  minimum_stock_level INTEGER DEFAULT 0,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Repair parts junction table
CREATE TABLE IF NOT EXISTS repair_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_per_unit DECIMAL(10,2)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_repairs_customer_id ON repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_created_at ON repairs(created_at);
CREATE INDEX IF NOT EXISTS idx_repairs_assigned_technician ON repairs(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_repair_status_logs_repair_id ON repair_status_logs(repair_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log status changes
CREATE OR REPLACE FUNCTION log_repair_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO repair_status_logs (repair_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for status logging
CREATE TRIGGER log_repair_status_changes AFTER UPDATE ON repairs
  FOR EACH ROW EXECUTE FUNCTION log_repair_status_change();

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile when user signs up
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY; 
ALTER TABLE repair_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$ language sql SECURITY definer;

-- Helper function to check if user can manage users
CREATE OR REPLACE FUNCTION can_manage_users(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT can_create_users FROM user_profiles WHERE id = user_id),
    false
  );
$$ language sql SECURITY definer;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile (limited)" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = OLD.role AND -- Can't change their own role
    can_create_users = OLD.can_create_users -- Can't change their own permissions
  );

CREATE POLICY "Shop owners and managers can view all profiles" ON user_profiles
  FOR SELECT USING (
    get_user_role() IN ('shop_owner', 'manager') OR
    can_manage_users()
  );

CREATE POLICY "Shop owners and managers can create/update profiles" ON user_profiles
  FOR ALL USING (
    get_user_role() IN ('shop_owner', 'manager') OR
    can_manage_users()
  );

-- Policies for customers
CREATE POLICY "Staff can manage customers" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for repairs  
CREATE POLICY "Staff can manage repairs" ON repairs
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for repair_status_logs
CREATE POLICY "Staff can view status logs" ON repair_status_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can create status logs" ON repair_status_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for parts (inventory management)
CREATE POLICY "Staff can view parts" ON parts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized staff can manage parts" ON parts
  FOR ALL USING (
    get_user_role() IN ('shop_owner', 'manager') OR
    (SELECT can_manage_inventory FROM user_profiles WHERE id = auth.uid())
  );

-- Policies for repair_parts
CREATE POLICY "Staff can manage repair parts" ON repair_parts
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO customers (name, email, phone, address) VALUES 
  ('John Doe', 'john@example.com', '+1234567890', '123 Main St'),
  ('Jane Smith', 'jane@example.com', '+1234567891', '456 Oak Ave'),
  ('Bob Johnson', 'bob@example.com', '+1234567892', '789 Pine St')
ON CONFLICT DO NOTHING;

INSERT INTO parts (name, part_number, supplier, cost, quantity_in_stock, minimum_stock_level) VALUES
  ('MacBook Pro 13" Screen', 'MBP13-SCR-001', 'Apple Parts Ltd', 299.99, 5, 2),
  ('Dell Laptop Keyboard', 'DELL-KB-001', 'Dell Parts Inc', 89.99, 10, 3),
  ('Generic Laptop Battery', 'BAT-LI-001', 'Battery World', 79.99, 15, 5),
  ('MacBook Air Charger', 'MBA-CHR-001', 'Apple Parts Ltd', 79.99, 8, 3)
ON CONFLICT DO NOTHING;

-- Note: Admin user will be created automatically when they first sign up
-- The signup process should include metadata: { full_name: "Shop Manager", role: "shop_owner" }