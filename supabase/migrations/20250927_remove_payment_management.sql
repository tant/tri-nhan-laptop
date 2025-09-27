-- Remove payment management from repair tickets
-- This system does not handle payment tracking
-- Migration created: 2025-09-27

-- Remove payment-related columns from repair_tickets table
ALTER TABLE repair_tickets
DROP COLUMN IF EXISTS is_paid,
DROP COLUMN IF EXISTS paid_at,
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS receipt_note,
DROP COLUMN IF EXISTS paid_by;

-- Drop the payment_method enum since it's no longer used
DROP TYPE IF EXISTS payment_method;

-- Add comment to document the change
COMMENT ON TABLE repair_tickets IS 'Repair tickets without payment management - payments are handled externally';
COMMENT ON COLUMN repair_tickets.total_cost IS 'Total cost for customer reference only - payment not tracked in system';
COMMENT ON COLUMN repair_tickets.deposit_amount IS 'Deposit amount for customer reference only - payment not tracked in system';