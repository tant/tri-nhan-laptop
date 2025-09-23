-- Customer History & Repair Tracking Enhancement Migration
-- Adds comprehensive repair history tracking, device management, and warranty tracking

-- Create device tracking table for multi-device customers
CREATE TABLE customer_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL REFERENCES customers(phone),
  device_type TEXT NOT NULL, -- 'laptop', 'desktop', 'tablet', 'phone', 'other'
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  purchase_date DATE,
  purchase_location TEXT,
  original_warranty_months INTEGER DEFAULT 12,
  device_notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create service patterns table for tracking recurring issues
CREATE TABLE service_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL REFERENCES customers(phone),
  device_id UUID REFERENCES customer_devices(id),
  issue_category TEXT NOT NULL, -- 'hardware', 'software', 'performance', 'physical_damage'
  issue_subcategory TEXT, -- specific issue type
  frequency_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pattern_notes TEXT,
  technician_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create warranty tracking table
CREATE TABLE warranty_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_ticket_id UUID NOT NULL REFERENCES repair_tickets(id),
  device_id UUID REFERENCES customer_devices(id),
  warranty_type TEXT NOT NULL, -- 'manufacturer', 'extended', 'shop_warranty'
  warranty_start_date DATE NOT NULL,
  warranty_end_date DATE NOT NULL,
  warranty_terms TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create detailed service notes table with Vietnamese support
CREATE TABLE service_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_ticket_id UUID NOT NULL REFERENCES repair_tickets(id),
  technician_id UUID NOT NULL REFERENCES user_profiles(id),
  note_type TEXT NOT NULL, -- 'diagnosis', 'repair', 'customer_interaction', 'quality_check'
  note_content TEXT NOT NULL,
  is_customer_visible BOOLEAN DEFAULT false,
  note_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create customer preferences table
CREATE TABLE customer_service_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL REFERENCES customers(phone),
  preferred_technician_id UUID REFERENCES user_profiles(id),
  communication_preference TEXT DEFAULT 'phone', -- 'phone', 'email', 'sms'
  notification_timing TEXT DEFAULT 'business_hours', -- 'anytime', 'business_hours', 'evening'
  service_approach TEXT DEFAULT 'standard', -- 'quick', 'standard', 'thorough'
  budget_preference TEXT DEFAULT 'balanced', -- 'budget', 'balanced', 'premium'
  pickup_delivery_preference TEXT DEFAULT 'pickup', -- 'pickup', 'delivery', 'both'
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create repair cost history table for financial tracking
CREATE TABLE repair_cost_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_ticket_id UUID NOT NULL REFERENCES repair_tickets(id),
  cost_category TEXT NOT NULL, -- 'parts', 'labor', 'diagnostic', 'shipping', 'other'
  item_description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_cost NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  cost_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  added_by UUID NOT NULL REFERENCES user_profiles(id),
  is_warranty_covered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enhance repair_tickets table with additional history tracking fields
ALTER TABLE repair_tickets
ADD COLUMN device_id UUID REFERENCES customer_devices(id),
ADD COLUMN repair_category TEXT, -- 'hardware', 'software', 'maintenance', 'upgrade'
ADD COLUMN complexity_level TEXT DEFAULT 'medium', -- 'simple', 'medium', 'complex', 'specialized'
ADD COLUMN customer_satisfaction_rating INTEGER, -- 1-5 scale
ADD COLUMN customer_feedback TEXT,
ADD COLUMN follow_up_required BOOLEAN DEFAULT false,
ADD COLUMN follow_up_date DATE,
ADD COLUMN recurring_issue BOOLEAN DEFAULT false,
ADD COLUMN previous_repair_reference UUID REFERENCES repair_tickets(id);

-- Create indexes for performance optimization
CREATE INDEX idx_customer_devices_customer_phone ON customer_devices(customer_phone);
CREATE INDEX idx_customer_devices_active ON customer_devices(is_active);
CREATE INDEX idx_service_patterns_customer_phone ON service_patterns(customer_phone);
CREATE INDEX idx_service_patterns_device_id ON service_patterns(device_id);
CREATE INDEX idx_service_patterns_category ON service_patterns(issue_category);
CREATE INDEX idx_warranty_records_repair_ticket ON warranty_records(repair_ticket_id);
CREATE INDEX idx_warranty_records_device ON warranty_records(device_id);
CREATE INDEX idx_warranty_records_active ON warranty_records(is_active);
CREATE INDEX idx_warranty_records_end_date ON warranty_records(warranty_end_date);
CREATE INDEX idx_service_notes_repair_ticket ON service_notes(repair_ticket_id);
CREATE INDEX idx_service_notes_technician ON service_notes(technician_id);
CREATE INDEX idx_service_notes_timestamp ON service_notes(note_timestamp);
CREATE INDEX idx_customer_preferences_customer_phone ON customer_service_preferences(customer_phone);
CREATE INDEX idx_repair_cost_history_repair_ticket ON repair_cost_history(repair_ticket_id);
CREATE INDEX idx_repair_cost_history_category ON repair_cost_history(cost_category);
CREATE INDEX idx_repair_cost_history_date ON repair_cost_history(cost_date);
CREATE INDEX idx_repair_tickets_device_id ON repair_tickets(device_id);
CREATE INDEX idx_repair_tickets_category ON repair_tickets(repair_category);
CREATE INDEX idx_repair_tickets_completion_date ON repair_tickets(repair_completed_at);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_customer_devices_updated_at
  BEFORE UPDATE ON customer_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_patterns_updated_at
  BEFORE UPDATE ON service_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_records_updated_at
  BEFORE UPDATE ON warranty_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_service_preferences_updated_at
  BEFORE UPDATE ON customer_service_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update service patterns when repair is completed
CREATE OR REPLACE FUNCTION update_service_patterns()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when repair is marked as completed
  IF NEW.status IN ('completed', 'quality_testing') AND OLD.status != NEW.status THEN
    -- Insert or update service pattern
    INSERT INTO service_patterns (
      customer_phone,
      device_id,
      issue_category,
      issue_subcategory,
      frequency_count,
      first_occurrence,
      last_occurrence,
      pattern_notes
    )
    VALUES (
      NEW.customer_phone,
      NEW.device_id,
      NEW.repair_category,
      SUBSTRING(NEW.issue_description, 1, 100), -- First 100 chars as subcategory
      1,
      NEW.created_at,
      NEW.updated_at,
      'Auto-generated from repair ticket'
    )
    ON CONFLICT (customer_phone, device_id, issue_category, issue_subcategory)
    DO UPDATE SET
      frequency_count = service_patterns.frequency_count + 1,
      last_occurrence = NEW.updated_at,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic service pattern tracking
CREATE TRIGGER track_service_patterns
  AFTER UPDATE ON repair_tickets
  FOR EACH ROW EXECUTE FUNCTION update_service_patterns();

-- Function to check warranty status
CREATE OR REPLACE FUNCTION check_warranty_status(p_device_id UUID, p_service_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  is_under_warranty BOOLEAN,
  warranty_type TEXT,
  warranty_end_date DATE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wr.is_active AND wr.warranty_end_date >= p_service_date AS is_under_warranty,
    wr.warranty_type,
    wr.warranty_end_date,
    (wr.warranty_end_date - p_service_date) AS days_remaining
  FROM warranty_records wr
  WHERE wr.device_id = p_device_id
    AND wr.is_active = true
    AND wr.warranty_end_date >= p_service_date
  ORDER BY wr.warranty_end_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer repair summary
CREATE OR REPLACE FUNCTION get_customer_repair_summary(p_customer_phone TEXT)
RETURNS TABLE(
  total_repairs INTEGER,
  completed_repairs INTEGER,
  active_repairs INTEGER,
  total_spent NUMERIC,
  average_repair_cost NUMERIC,
  last_repair_date TIMESTAMP WITH TIME ZONE,
  most_common_issue TEXT,
  customer_since DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_repairs,
    COUNT(CASE WHEN rt.status = 'completed' THEN 1 END)::INTEGER AS completed_repairs,
    COUNT(CASE WHEN rt.status NOT IN ('completed', 'cancelled_by_customer', 'abandoned') THEN 1 END)::INTEGER AS active_repairs,
    COALESCE(SUM(rt.total_cost), 0) AS total_spent,
    COALESCE(AVG(rt.total_cost), 0) AS average_repair_cost,
    MAX(rt.created_at) AS last_repair_date,
    MODE() WITHIN GROUP (ORDER BY rt.repair_category) AS most_common_issue,
    MIN(rt.created_at)::DATE AS customer_since
  FROM repair_tickets rt
  WHERE rt.customer_phone = p_customer_phone;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies for new tables
ALTER TABLE customer_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_cost_history ENABLE ROW LEVEL SECURITY;

-- Policies for customer_devices
CREATE POLICY "Users can view all customer devices" ON customer_devices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage customer devices" ON customer_devices
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for service_patterns
CREATE POLICY "Users can view service patterns" ON service_patterns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage service patterns" ON service_patterns
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for warranty_records
CREATE POLICY "Users can view warranty records" ON warranty_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage warranty records" ON warranty_records
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for service_notes
CREATE POLICY "Users can view service notes" ON service_notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create service notes" ON service_notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Technicians can update own notes" ON service_notes
  FOR UPDATE USING (technician_id = auth.uid());

-- Policies for customer_service_preferences
CREATE POLICY "Users can view customer preferences" ON customer_service_preferences
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage customer preferences" ON customer_service_preferences
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for repair_cost_history
CREATE POLICY "Users can view repair cost history" ON repair_cost_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage repair cost history" ON repair_cost_history
  FOR ALL USING (auth.role() = 'authenticated');

-- Add helpful comments
COMMENT ON TABLE customer_devices IS 'Track multiple devices per customer with purchase and warranty information';
COMMENT ON TABLE service_patterns IS 'Analyze recurring repair patterns and common issues for customers';
COMMENT ON TABLE warranty_records IS 'Comprehensive warranty tracking with automatic expiration monitoring';
COMMENT ON TABLE service_notes IS 'Detailed Vietnamese service notes with technician attribution';
COMMENT ON TABLE customer_service_preferences IS 'Customer preferences for communication and service approach';
COMMENT ON TABLE repair_cost_history IS 'Detailed cost breakdown and financial history for repairs';
COMMENT ON COLUMN repair_tickets.device_id IS 'Link repair to specific customer device';
COMMENT ON COLUMN repair_tickets.recurring_issue IS 'Flag for repairs addressing previously seen issues';
COMMENT ON COLUMN repair_tickets.customer_satisfaction_rating IS '1-5 scale customer satisfaction rating';

-- Create a view for comprehensive customer history
CREATE VIEW customer_history_summary AS
SELECT
  c.phone,
  c.full_name,
  c.created_at as customer_since,
  COUNT(DISTINCT cd.id) as total_devices,
  COUNT(rt.id) as total_repairs,
  COUNT(CASE WHEN rt.status = 'completed' THEN 1 END) as completed_repairs,
  COUNT(CASE WHEN rt.status NOT IN ('completed', 'cancelled_by_customer', 'abandoned') THEN 1 END) as active_repairs,
  COALESCE(SUM(rt.total_cost), 0) as total_spent,
  MAX(rt.created_at) as last_repair_date,
  COUNT(CASE WHEN rt.recurring_issue = true THEN 1 END) as recurring_issues,
  COALESCE(AVG(rt.customer_satisfaction_rating), 0) as average_satisfaction
FROM customers c
LEFT JOIN customer_devices cd ON c.phone = cd.customer_phone AND cd.is_active = true
LEFT JOIN repair_tickets rt ON c.phone = rt.customer_phone
GROUP BY c.phone, c.full_name, c.created_at;