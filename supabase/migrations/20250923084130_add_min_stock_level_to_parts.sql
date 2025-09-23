-- Add min_stock_level column to parts table
ALTER TABLE parts ADD COLUMN min_stock_level integer DEFAULT 5 NOT NULL;

-- Add selling_price column with default value
ALTER TABLE parts ADD COLUMN selling_price numeric(10,2) DEFAULT 0 NOT NULL;