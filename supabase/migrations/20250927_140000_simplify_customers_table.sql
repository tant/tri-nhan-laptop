-- Simplify customers table - Remove unnecessary fields
-- Keep only: phone (PK), full_name, address, created_at, updated_at
-- Migration created: 2025-09-27

-- First, drop indexes that reference columns we're about to remove
DROP INDEX IF EXISTS idx_customers_business_name;
DROP INDEX IF EXISTS idx_customers_category;
DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_customers_id_card;
DROP INDEX IF EXISTS idx_customers_is_vip;
DROP INDEX IF EXISTS idx_customers_tax_code;

-- Drop triggers that might reference the columns we're removing
DROP TRIGGER IF EXISTS track_customer_data_changes ON customers;
DROP TRIGGER IF EXISTS trigger_customers_version ON customers;

-- Remove unnecessary columns from customers table
ALTER TABLE customers
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS alternative_phone,
DROP COLUMN IF EXISTS emergency_contact_name,
DROP COLUMN IF EXISTS emergency_contact_phone,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS id_card_number,
DROP COLUMN IF EXISTS business_name,
DROP COLUMN IF EXISTS tax_code,
DROP COLUMN IF EXISTS contact_preferences,
DROP COLUMN IF EXISTS privacy_consent,
DROP COLUMN IF EXISTS data_consent_date,
DROP COLUMN IF EXISTS is_vip,
DROP COLUMN IF EXISTS customer_tags,
DROP COLUMN IF EXISTS preferred_contact_time,
DROP COLUMN IF EXISTS version;

-- Add index for customer name search (simplified indexing)
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON customers(full_name);

-- Drop the customer_category enum since it's no longer used
DROP TYPE IF EXISTS customer_category;

-- Add comment to document the simplified structure
COMMENT ON TABLE customers IS 'Simplified customer table with minimal required fields: phone (PK), full_name, address';
COMMENT ON COLUMN customers.phone IS 'Vietnamese phone number (no spaces, e.g., 0901234567) - Primary Key';
COMMENT ON COLUMN customers.full_name IS 'Customer full name (required)';
COMMENT ON COLUMN customers.address IS 'Customer address (optional, simple string)';