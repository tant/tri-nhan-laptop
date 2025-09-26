-- Add customer_description column to repair_tickets table
-- This column stores the customer's original description of the issue
-- Separate from issue_description which is for staff technical diagnosis

ALTER TABLE repair_tickets
ADD COLUMN customer_description TEXT NOT NULL DEFAULT '';

-- Add comment for clarity
COMMENT ON COLUMN repair_tickets.customer_description IS 'Customer original description of the issue in their own words';

-- Update existing records to have customer_description based on issue_description
-- This ensures existing data remains functional
UPDATE repair_tickets
SET customer_description = COALESCE(issue_description, 'Khách hàng chưa mô tả')
WHERE customer_description = '';

-- Remove default after initial setup
ALTER TABLE repair_tickets
ALTER COLUMN customer_description DROP DEFAULT;