-- Add priority column to repair_tickets table
-- This migration adds the missing priority column that is expected by the frontend form

-- Create priority type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE repair_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add priority column to repair_tickets table
ALTER TABLE repair_tickets
ADD COLUMN IF NOT EXISTS priority repair_priority DEFAULT 'normal';

-- Add index for priority column for better query performance
CREATE INDEX IF NOT EXISTS idx_repair_tickets_priority ON repair_tickets(priority);

-- Add comment for documentation
COMMENT ON COLUMN repair_tickets.priority IS 'Priority level of the repair ticket (low, normal, high, urgent)';