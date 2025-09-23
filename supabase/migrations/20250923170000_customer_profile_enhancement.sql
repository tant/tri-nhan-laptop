-- Customer Profile Enhancement Migration
-- Adds comprehensive Vietnamese customer data fields

-- Create customer category enum
CREATE TYPE customer_category AS ENUM (
  'individual',
  'business'
);

-- Create customer preference jsonb structure for contact preferences
-- ALTER TABLE customers to add new profile fields
ALTER TABLE customers
ADD COLUMN email TEXT,
ADD COLUMN alternative_phone TEXT,
ADD COLUMN emergency_contact_name TEXT,
ADD COLUMN emergency_contact_phone TEXT,
ADD COLUMN category customer_category DEFAULT 'individual' NOT NULL,
ADD COLUMN date_of_birth DATE,
ADD COLUMN id_card_number TEXT,
ADD COLUMN business_name TEXT,
ADD COLUMN tax_code TEXT,
ADD COLUMN contact_preferences JSONB DEFAULT '{}',
ADD COLUMN privacy_consent BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN data_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_vip BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN customer_tags TEXT[] DEFAULT '{}',
ADD COLUMN preferred_contact_time TEXT,
ADD COLUMN address_province TEXT,
ADD COLUMN address_district TEXT,
ADD COLUMN address_ward TEXT,
ADD COLUMN address_details TEXT;

-- Create indexes for new fields
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_category ON customers(category);
CREATE INDEX idx_customers_id_card ON customers(id_card_number);
CREATE INDEX idx_customers_business_name ON customers(business_name);
CREATE INDEX idx_customers_tax_code ON customers(tax_code);
CREATE INDEX idx_customers_province ON customers(address_province);
CREATE INDEX idx_customers_is_vip ON customers(is_vip);

-- Create customer_contact_history table for tracking contact interactions
CREATE TABLE customer_contact_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL REFERENCES customers(phone),
  contact_type TEXT NOT NULL, -- 'call', 'email', 'sms', 'visit'
  contact_direction TEXT NOT NULL, -- 'inbound', 'outbound'
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  subject TEXT,
  notes TEXT,
  contacted_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_contact_history_customer ON customer_contact_history(customer_phone);
CREATE INDEX idx_contact_history_date ON customer_contact_history(contact_date);
CREATE INDEX idx_contact_history_type ON customer_contact_history(contact_type);

-- Create customer_data_changes table for audit trail
CREATE TABLE customer_data_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL REFERENCES customers(phone),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES user_profiles(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_data_changes_customer ON customer_data_changes(customer_phone);
CREATE INDEX idx_data_changes_date ON customer_data_changes(created_at);

-- Create trigger function for tracking customer data changes
CREATE OR REPLACE FUNCTION track_customer_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_record RECORD;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Only track changes for updates, not inserts
  IF TG_OP = 'UPDATE' THEN
    -- Track changes for specific fields
    FOR field_record IN
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'customers'
        AND column_name NOT IN ('updated_at', 'created_at')
    LOOP
      -- Get old and new values
      EXECUTE format('SELECT ($1).%I::TEXT', field_record.column_name)
        USING OLD INTO old_val;
      EXECUTE format('SELECT ($1).%I::TEXT', field_record.column_name)
        USING NEW INTO new_val;

      -- Insert change record if values differ
      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO customer_data_changes (
          customer_phone,
          field_name,
          old_value,
          new_value,
          changed_by
        ) VALUES (
          NEW.phone,
          field_record.column_name,
          old_val,
          new_val,
          auth.uid()
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer data change tracking
CREATE TRIGGER track_customer_data_changes
  AFTER UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION track_customer_changes();

-- Add RLS policies for new tables
ALTER TABLE customer_contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_data_changes ENABLE ROW LEVEL SECURITY;

-- Policies for customer_contact_history
CREATE POLICY "Users can view contact history" ON customer_contact_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert contact history" ON customer_contact_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own contact history" ON customer_contact_history
  FOR UPDATE USING (contacted_by = auth.uid());

-- Policies for customer_data_changes (read-only for audit)
CREATE POLICY "Users can view data changes" ON customer_data_changes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update existing customers to have privacy consent = true for existing data
UPDATE customers
SET privacy_consent = true,
    data_consent_date = NOW()
WHERE privacy_consent = false;

-- Add helpful comments
COMMENT ON TABLE customers IS 'Enhanced customer profiles with Vietnamese address structure and business/individual categorization';
COMMENT ON TABLE customer_contact_history IS 'Track all customer contact interactions for relationship management';
COMMENT ON TABLE customer_data_changes IS 'Audit trail for customer data changes and updates';
COMMENT ON COLUMN customers.category IS 'Individual vs business customer categorization';
COMMENT ON COLUMN customers.contact_preferences IS 'JSON structure for preferred contact methods and timing';
COMMENT ON COLUMN customers.privacy_consent IS 'Customer consent for data processing and storage';
COMMENT ON COLUMN customers.address_province IS 'Vietnamese province/city (Tỉnh/Thành phố)';
COMMENT ON COLUMN customers.address_district IS 'Vietnamese district (Quận/Huyện)';
COMMENT ON COLUMN customers.address_ward IS 'Vietnamese ward/commune (Phường/Xã)';