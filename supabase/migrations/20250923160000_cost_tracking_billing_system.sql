-- Cost Tracking & Billing Integration System
-- Comprehensive cost calculation, profit analysis, and billing integration

-- Create repair_cost_breakdown table for detailed cost tracking
create table repair_cost_breakdown (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  breakdown_type text not null check (breakdown_type in ('parts', 'labor', 'overhead', 'tax', 'discount')),
  item_id uuid, -- part_id for parts, null for labor/overhead
  item_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_cost numeric(10,2) not null check (unit_cost >= 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_cost numeric(10,2) generated always as (quantity * unit_cost) stored,
  total_price numeric(10,2) generated always as (quantity * unit_price) stored,
  profit_amount numeric(10,2) generated always as ((quantity * unit_price) - (quantity * unit_cost)) stored,
  profit_margin numeric(5,2) generated always as (
    case
      when (quantity * unit_price) > 0
      then (((quantity * unit_price) - (quantity * unit_cost)) / (quantity * unit_price)) * 100
      else 0
    end
  ) stored,
  currency text default 'VND' not null,
  exchange_rate numeric(10,4) default 1.0,
  notes text,
  created_by uuid references user_profiles(id)
);

-- Create cost_change_history table for tracking cost changes
create table cost_change_history (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  change_type text not null check (change_type in ('parts_added', 'parts_removed', 'labor_updated', 'overhead_added', 'discount_applied', 'quote_generated')),
  previous_total numeric(10,2),
  new_total numeric(10,2),
  change_amount numeric(10,2) generated always as (new_total - previous_total) stored,
  change_reason text,
  breakdown_details jsonb,
  changed_by uuid not null references user_profiles(id),
  approved_by uuid references user_profiles(id),
  approval_required boolean default false,
  approved_at timestamp with time zone
);

-- Create customer_quotes table for quote generation
create table customer_quotes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  quote_number text unique not null,
  quote_version integer default 1 not null,
  status text default 'draft' check (status in ('draft', 'sent', 'approved', 'rejected', 'expired')),
  subtotal_parts numeric(10,2) not null default 0,
  subtotal_labor numeric(10,2) not null default 0,
  subtotal_overhead numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) generated always as (
    subtotal_parts + subtotal_labor + subtotal_overhead - discount_amount + tax_amount
  ) stored,
  valid_until timestamp with time zone,
  terms_conditions text,
  notes text,
  generated_by uuid not null references user_profiles(id),
  sent_at timestamp with time zone,
  customer_response text,
  customer_responded_at timestamp with time zone
);

-- Create profit_analysis table for business intelligence
create table profit_analysis (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  analysis_date timestamp with time zone default now() not null,
  total_cost numeric(10,2) not null,
  total_revenue numeric(10,2) not null,
  gross_profit numeric(10,2) generated always as (total_revenue - total_cost) stored,
  profit_margin numeric(5,2) generated always as (
    case
      when total_revenue > 0
      then ((total_revenue - total_cost) / total_revenue) * 100
      else 0
    end
  ) stored,
  parts_cost numeric(10,2) not null default 0,
  parts_revenue numeric(10,2) not null default 0,
  parts_profit numeric(10,2) generated always as (parts_revenue - parts_cost) stored,
  labor_cost numeric(10,2) not null default 0,
  labor_revenue numeric(10,2) not null default 0,
  labor_profit numeric(10,2) generated always as (labor_revenue - labor_cost) stored,
  overhead_cost numeric(10,2) not null default 0,
  currency text default 'VND' not null,
  analyzed_by uuid references user_profiles(id)
);

-- Add enhanced cost tracking fields to repair_tickets if not exists
alter table repair_tickets add column if not exists labor_cost numeric(10,2) default 0;
alter table repair_tickets add column if not exists labor_hours numeric(5,2) default 0;
alter table repair_tickets add column if not exists overhead_cost numeric(10,2) default 0;
alter table repair_tickets add column if not exists discount_amount numeric(10,2) default 0;
alter table repair_tickets add column if not exists tax_amount numeric(10,2) default 0;
alter table repair_tickets add column if not exists parts_cost_total numeric(10,2) default 0;
alter table repair_tickets add column if not exists quote_approved boolean default false;
alter table repair_tickets add column if not exists final_total_cost numeric(10,2);

-- Add indexes for performance
create index idx_repair_cost_breakdown_repair_id on repair_cost_breakdown(repair_id);
create index idx_repair_cost_breakdown_type on repair_cost_breakdown(breakdown_type);
create index idx_repair_cost_breakdown_created_at on repair_cost_breakdown(created_at);

create index idx_cost_change_history_repair_id on cost_change_history(repair_id);
create index idx_cost_change_history_created_at on cost_change_history(created_at);
create index idx_cost_change_history_change_type on cost_change_history(change_type);

create index idx_customer_quotes_repair_id on customer_quotes(repair_id);
create index idx_customer_quotes_quote_number on customer_quotes(quote_number);
create index idx_customer_quotes_status on customer_quotes(status);
create index idx_customer_quotes_created_at on customer_quotes(created_at);

create index idx_profit_analysis_repair_id on profit_analysis(repair_id);
create index idx_profit_analysis_analysis_date on profit_analysis(analysis_date);

-- Add updated_at triggers
create trigger update_repair_cost_breakdown_updated_at
  before update on repair_cost_breakdown
  for each row execute function update_updated_at_column();

create trigger update_customer_quotes_updated_at
  before update on customer_quotes
  for each row execute function update_updated_at_column();

-- Function to generate quote numbers
create or replace function generate_quote_number()
returns text as $$
declare
  quote_number text;
  year_month text;
  sequence_num integer;
begin
  year_month := to_char(now(), 'YYYYMM');

  select coalesce(max(cast(substring(quote_number from '[0-9]+$') as integer)), 0) + 1
  into sequence_num
  from customer_quotes
  where quote_number like 'QT' || year_month || '%';

  quote_number := 'QT' || year_month || lpad(sequence_num::text, 4, '0');

  return quote_number;
end;
$$ language plpgsql;

-- Function to calculate repair cost breakdown
create or replace function calculate_repair_costs(repair_uuid uuid)
returns table(
  parts_cost numeric,
  parts_revenue numeric,
  labor_cost numeric,
  labor_revenue numeric,
  overhead_cost numeric,
  total_cost numeric,
  total_revenue numeric,
  profit_amount numeric,
  profit_margin numeric
) as $$
declare
  parts_cost_val numeric := 0;
  parts_revenue_val numeric := 0;
  labor_cost_val numeric := 0;
  labor_revenue_val numeric := 0;
  overhead_cost_val numeric := 0;
  total_cost_val numeric := 0;
  total_revenue_val numeric := 0;
  profit_amount_val numeric := 0;
  profit_margin_val numeric := 0;
begin
  -- Calculate parts costs and revenue
  select
    coalesce(sum(case when breakdown_type = 'parts' then total_cost else 0 end), 0),
    coalesce(sum(case when breakdown_type = 'parts' then total_price else 0 end), 0)
  into parts_cost_val, parts_revenue_val
  from repair_cost_breakdown
  where repair_id = repair_uuid;

  -- Calculate labor costs and revenue
  select
    coalesce(sum(case when breakdown_type = 'labor' then total_cost else 0 end), 0),
    coalesce(sum(case when breakdown_type = 'labor' then total_price else 0 end), 0)
  into labor_cost_val, labor_revenue_val
  from repair_cost_breakdown
  where repair_id = repair_uuid;

  -- Calculate overhead costs
  select
    coalesce(sum(case when breakdown_type = 'overhead' then total_cost else 0 end), 0)
  into overhead_cost_val
  from repair_cost_breakdown
  where repair_id = repair_uuid;

  -- Calculate totals
  total_cost_val := parts_cost_val + labor_cost_val + overhead_cost_val;
  total_revenue_val := parts_revenue_val + labor_revenue_val;
  profit_amount_val := total_revenue_val - total_cost_val;

  if total_revenue_val > 0 then
    profit_margin_val := (profit_amount_val / total_revenue_val) * 100;
  else
    profit_margin_val := 0;
  end if;

  return query select
    parts_cost_val,
    parts_revenue_val,
    labor_cost_val,
    labor_revenue_val,
    overhead_cost_val,
    total_cost_val,
    total_revenue_val,
    profit_amount_val,
    profit_margin_val;
end;
$$ language plpgsql;

-- Function to update repair ticket totals
create or replace function update_repair_totals(repair_uuid uuid)
returns boolean as $$
declare
  cost_data record;
begin
  -- Get calculated costs
  select * into cost_data from calculate_repair_costs(repair_uuid);

  -- Update repair ticket with calculated totals
  update repair_tickets
  set
    parts_cost_total = cost_data.parts_cost,
    labor_cost = cost_data.labor_cost,
    total_cost = cost_data.total_revenue,
    final_total_cost = cost_data.total_revenue,
    updated_at = now()
  where id = repair_uuid;

  return true;
end;
$$ language plpgsql;

-- Function to generate customer quote
create or replace function generate_customer_quote(
  repair_uuid uuid,
  user_uuid uuid,
  quote_terms text default null,
  valid_days integer default 30
)
returns uuid as $$
declare
  quote_id uuid;
  quote_num text;
  cost_data record;
begin
  -- Generate quote number
  select generate_quote_number() into quote_num;

  -- Get cost breakdown
  select * into cost_data from calculate_repair_costs(repair_uuid);

  -- Create quote
  insert into customer_quotes (
    repair_id,
    quote_number,
    subtotal_parts,
    subtotal_labor,
    subtotal_overhead,
    valid_until,
    terms_conditions,
    generated_by
  ) values (
    repair_uuid,
    quote_num,
    cost_data.parts_revenue,
    cost_data.labor_revenue,
    0, -- overhead revenue not included in customer quotes
    now() + (valid_days || ' days')::interval,
    coalesce(quote_terms, 'Báo giá có hiệu lực trong ' || valid_days || ' ngày. Giá không bao gồm VAT.'),
    user_uuid
  ) returning id into quote_id;

  -- Log cost change
  insert into cost_change_history (
    repair_id,
    change_type,
    new_total,
    change_reason,
    breakdown_details,
    changed_by
  ) values (
    repair_uuid,
    'quote_generated',
    cost_data.total_revenue,
    'Tạo báo giá cho khách hàng',
    jsonb_build_object(
      'quote_id', quote_id,
      'quote_number', quote_num,
      'parts_cost', cost_data.parts_revenue,
      'labor_cost', cost_data.labor_revenue
    ),
    user_uuid
  );

  return quote_id;
end;
$$ language plpgsql;

-- Function to track cost changes
create or replace function track_cost_change()
returns trigger as $$
declare
  old_total numeric;
  new_total numeric;
begin
  if tg_op = 'INSERT' then
    -- Calculate new total after insert
    select total_revenue into new_total from calculate_repair_costs(new.repair_id);

    insert into cost_change_history (
      repair_id,
      change_type,
      previous_total,
      new_total,
      change_reason,
      breakdown_details,
      changed_by
    ) values (
      new.repair_id,
      case new.breakdown_type
        when 'parts' then 'parts_added'
        when 'labor' then 'labor_updated'
        else 'overhead_added'
      end,
      coalesce(new_total - new.total_price, 0),
      new_total,
      'Thêm ' || new.item_name,
      jsonb_build_object(
        'item_name', new.item_name,
        'quantity', new.quantity,
        'unit_price', new.unit_price,
        'total_price', new.total_price
      ),
      new.created_by
    );

    -- Update repair ticket totals
    perform update_repair_totals(new.repair_id);

    return new;
  elsif tg_op = 'DELETE' then
    -- Calculate new total after delete
    select total_revenue into new_total from calculate_repair_costs(old.repair_id);

    insert into cost_change_history (
      repair_id,
      change_type,
      previous_total,
      new_total,
      change_reason,
      breakdown_details,
      changed_by
    ) values (
      old.repair_id,
      case old.breakdown_type
        when 'parts' then 'parts_removed'
        else 'overhead_added'
      end,
      new_total + old.total_price,
      new_total,
      'Xóa ' || old.item_name,
      jsonb_build_object(
        'item_name', old.item_name,
        'quantity', old.quantity,
        'unit_price', old.unit_price,
        'total_price', old.total_price
      ),
      null -- Cannot get user from delete operation
    );

    -- Update repair ticket totals
    perform update_repair_totals(old.repair_id);

    return old;
  end if;

  return null;
end;
$$ language plpgsql;

-- Trigger to track cost changes
create trigger repair_cost_change_tracker
  after insert or delete on repair_cost_breakdown
  for each row execute function track_cost_change();

-- Enable RLS on new tables
alter table repair_cost_breakdown enable row level security;
alter table cost_change_history enable row level security;
alter table customer_quotes enable row level security;
alter table profit_analysis enable row level security;

-- Policies for cost tracking tables
create policy "Users can view all cost breakdowns" on repair_cost_breakdown
  for select using (auth.role() = 'authenticated');

create policy "Users can manage cost breakdowns" on repair_cost_breakdown
  for all using (auth.role() = 'authenticated');

create policy "Users can view cost history" on cost_change_history
  for select using (auth.role() = 'authenticated');

create policy "Users can insert cost history" on cost_change_history
  for insert with check (auth.role() = 'authenticated');

create policy "Users can view customer quotes" on customer_quotes
  for select using (auth.role() = 'authenticated');

create policy "Users can manage customer quotes" on customer_quotes
  for all using (auth.role() = 'authenticated');

create policy "Users can view profit analysis" on profit_analysis
  for select using (auth.role() = 'authenticated');

create policy "Users can manage profit analysis" on profit_analysis
  for all using (auth.role() = 'authenticated');