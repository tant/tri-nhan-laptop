-- Performance optimization indexes for parts search functionality
-- Story 3.1.1: Enhanced Parts Search & Filtering System

-- Index for brand filtering (used in brand dropdown and search)
create index idx_parts_brand on parts(brand);

-- GIN index for model_compatibility array search (used in compatibility matching)
create index idx_parts_model_compatibility on parts using gin(model_compatibility);

-- Index for supplier_info search
create index idx_parts_supplier_info on parts(supplier_info);

-- Index for stock level comparisons (used in stock status filtering)
create index idx_parts_current_stock on parts(current_stock);
create index idx_parts_min_stock_level on parts(min_stock_level);

-- Composite index for stock status calculations (current_stock vs min_stock_level)
create index idx_parts_stock_comparison on parts(current_stock, min_stock_level);

-- Full text search index for Vietnamese text search across name, category, brand
create index idx_parts_text_search on parts using gin(
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(supplier_info, ''))
);

-- Index for price range filtering
create index idx_parts_unit_price on parts(unit_price);

-- Composite index for common filter combinations
create index idx_parts_category_brand on parts(category, brand);
create index idx_parts_category_stock on parts(category, current_stock);

-- Add missing min_stock_level column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'parts' and column_name = 'min_stock_level') then
    alter table parts add column min_stock_level integer default 5 not null;
  end if;
end $$;

-- Add missing selling_price column for inventory value calculations
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'parts' and column_name = 'selling_price') then
    alter table parts add column selling_price numeric(10,2);
    -- Set default selling price to unit_price if not specified
    update parts set selling_price = unit_price where selling_price is null;
  end if;
end $$;