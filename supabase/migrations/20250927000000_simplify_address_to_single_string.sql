-- Simplify Vietnamese address to single string field
-- Remove complex 4-field address structure and use single address column

-- First, migrate existing data from structured fields to single address field
UPDATE customers
SET address = CASE
    WHEN address_details IS NOT NULL OR address_ward IS NOT NULL OR address_district IS NOT NULL OR address_province IS NOT NULL THEN
        TRIM(CONCAT_WS(', ',
            NULLIF(TRIM(address_details), ''),
            NULLIF(TRIM(address_ward), ''),
            NULLIF(TRIM(address_district), ''),
            NULLIF(TRIM(address_province), '')
        ))
    ELSE address
END
WHERE address_details IS NOT NULL OR address_ward IS NOT NULL OR address_district IS NOT NULL OR address_province IS NOT NULL;

-- Drop the complex address structure columns
ALTER TABLE customers
DROP COLUMN IF EXISTS address_details,
DROP COLUMN IF EXISTS address_ward,
DROP COLUMN IF EXISTS address_district,
DROP COLUMN IF EXISTS address_province;

-- Drop related indexes
DROP INDEX IF EXISTS idx_customers_province;

-- Update column comment
COMMENT ON COLUMN customers.address IS 'Complete Vietnamese address as single string (Địa chỉ đầy đủ)';

-- Create index on address for search performance
CREATE INDEX IF NOT EXISTS idx_customers_address ON customers USING gin(to_tsvector('english', COALESCE(address, '')));

-- Update audit table to remove address field tracking
DELETE FROM customer_data_changes
WHERE field_name IN ('address_details', 'address_ward', 'address_district', 'address_province');