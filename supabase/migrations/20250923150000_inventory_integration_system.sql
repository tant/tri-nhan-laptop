-- Inventory Integration & Updates System
-- Supports parts reservation, usage tracking, and audit trail

-- Create repair_parts table for tracking parts used in repairs
create table repair_parts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  part_id uuid not null references parts(id) on delete cascade,
  quantity_used integer not null check (quantity_used > 0),
  cost_per_unit numeric(10,2) not null check (cost_per_unit >= 0),
  total_cost numeric(10,2) generated always as (quantity_used * cost_per_unit) stored,
  notes text,
  used_by uuid references user_profiles(id),
  used_at timestamp with time zone default now() not null,

  -- Ensure no duplicate parts per repair (unless explicitly allowed)
  unique(repair_id, part_id)
);

-- Create parts_reservations table for temporary part reservations during repair planning
create table parts_reservations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  part_id uuid not null references parts(id) on delete cascade,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  quantity_reserved integer not null check (quantity_reserved > 0),
  reserved_by uuid not null references user_profiles(id),
  reserved_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone not null,
  status text default 'active' check (status in ('active', 'confirmed', 'cancelled', 'expired')),
  notes text
);

-- Create inventory_transactions table for comprehensive audit trail
create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  part_id uuid not null references parts(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('purchase', 'usage', 'adjustment', 'reservation', 'return')),
  quantity_change integer not null, -- positive for increase, negative for decrease
  quantity_before integer not null,
  quantity_after integer not null,
  cost_per_unit numeric(10,2),
  total_cost numeric(10,2),
  reference_id uuid, -- repair_id, reservation_id, etc.
  reference_type text check (reference_type in ('repair', 'reservation', 'adjustment', 'purchase')),
  notes text,
  performed_by uuid references user_profiles(id),

  -- Ensure quantity consistency
  check (quantity_after = quantity_before + quantity_change)
);

-- Create repair_status_logs table if it doesn't exist (for parts usage logging)
create table if not exists repair_status_logs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  repair_id uuid not null references repair_tickets(id) on delete cascade,
  old_status repair_status,
  new_status repair_status,
  notes text,
  changed_by uuid references user_profiles(id)
);

-- Add indexes for performance
create index idx_repair_parts_repair_id on repair_parts(repair_id);
create index idx_repair_parts_part_id on repair_parts(part_id);
create index idx_repair_parts_used_at on repair_parts(used_at);

create index idx_parts_reservations_part_id on parts_reservations(part_id);
create index idx_parts_reservations_repair_id on parts_reservations(repair_id);
create index idx_parts_reservations_status on parts_reservations(status);
create index idx_parts_reservations_expires_at on parts_reservations(expires_at);

create index idx_inventory_transactions_part_id on inventory_transactions(part_id);
create index idx_inventory_transactions_created_at on inventory_transactions(created_at);
create index idx_inventory_transactions_transaction_type on inventory_transactions(transaction_type);
create index idx_inventory_transactions_reference on inventory_transactions(reference_id, reference_type);

create index idx_repair_status_logs_repair_id on repair_status_logs(repair_id);
create index idx_repair_status_logs_created_at on repair_status_logs(created_at);

-- Add partial unique constraint for active reservations
create unique index idx_parts_reservations_active_unique
  on parts_reservations(part_id, repair_id)
  where status = 'active';

-- Add updated_at triggers
create trigger update_repair_parts_updated_at
  before update on repair_parts
  for each row execute function update_updated_at_column();

create trigger update_parts_reservations_updated_at
  before update on parts_reservations
  for each row execute function update_updated_at_column();

-- Function to automatically expire reservations
create or replace function expire_old_reservations()
returns void as $$
begin
  update parts_reservations
  set status = 'expired', updated_at = now()
  where status = 'active' and expires_at < now();
end;
$$ language plpgsql;

-- Function to get available stock (considering reservations)
create or replace function get_available_stock(part_uuid uuid)
returns integer as $$
declare
  current_stock integer;
  reserved_quantity integer;
begin
  -- Get current stock
  select parts.current_stock into current_stock
  from parts
  where parts.id = part_uuid;

  -- Get total active reservations
  select coalesce(sum(quantity_reserved), 0) into reserved_quantity
  from parts_reservations
  where part_id = part_uuid and status = 'active' and expires_at > now();

  return greatest(0, current_stock - reserved_quantity);
end;
$$ language plpgsql;

-- Function to automatically log inventory transactions
create or replace function log_inventory_transaction()
returns trigger as $$
begin
  -- Only log when current_stock changes
  if old.current_stock != new.current_stock then
    insert into inventory_transactions (
      part_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      cost_per_unit,
      notes,
      performed_by
    ) values (
      new.id,
      'adjustment',
      new.current_stock - old.current_stock,
      old.current_stock,
      new.current_stock,
      new.cost_price,
      'Automatic stock update',
      null -- System update
    );
  end if;

  return new;
end;
$$ language plpgsql;

-- Trigger to automatically log inventory changes
create trigger parts_stock_change_logger
  after update on parts
  for each row execute function log_inventory_transaction();

-- Function to reserve parts for repair
create or replace function reserve_parts_for_repair(
  p_part_id uuid,
  p_repair_id uuid,
  p_quantity integer,
  p_reserved_by uuid,
  p_duration_hours integer default 24
)
returns uuid as $$
declare
  available_stock integer;
  reservation_id uuid;
  expires_at_time timestamp with time zone;
begin
  -- Expire old reservations first
  perform expire_old_reservations();

  -- Check available stock
  select get_available_stock(p_part_id) into available_stock;

  if available_stock < p_quantity then
    raise exception 'Không đủ linh kiện có sẵn. Tồn kho khả dụng: %, cần: %', available_stock, p_quantity;
  end if;

  -- Calculate expiration time
  expires_at_time := now() + (p_duration_hours || ' hours')::interval;

  -- Create reservation
  insert into parts_reservations (
    part_id,
    repair_id,
    quantity_reserved,
    reserved_by,
    expires_at
  ) values (
    p_part_id,
    p_repair_id,
    p_quantity,
    p_reserved_by,
    expires_at_time
  ) returning id into reservation_id;

  return reservation_id;
end;
$$ language plpgsql;

-- Function to confirm reservation and update stock
create or replace function confirm_parts_reservation(
  p_reservation_id uuid,
  p_confirmed_by uuid
)
returns boolean as $$
declare
  reservation_record parts_reservations%rowtype;
  current_stock integer;
begin
  -- Get reservation details
  select * into reservation_record
  from parts_reservations
  where id = p_reservation_id and status = 'active';

  if not found then
    raise exception 'Reservation not found or already processed';
  end if;

  -- Check if reservation has expired
  if reservation_record.expires_at < now() then
    update parts_reservations
    set status = 'expired', updated_at = now()
    where id = p_reservation_id;
    raise exception 'Reservation has expired';
  end if;

  -- Get current stock
  select parts.current_stock into current_stock
  from parts
  where id = reservation_record.part_id;

  -- Check if we still have enough stock
  if current_stock < reservation_record.quantity_reserved then
    raise exception 'Insufficient stock to confirm reservation. Available: %, Required: %',
      current_stock, reservation_record.quantity_reserved;
  end if;

  -- Update stock
  update parts
  set current_stock = current_stock - reservation_record.quantity_reserved,
      updated_at = now()
  where id = reservation_record.part_id;

  -- Mark reservation as confirmed
  update parts_reservations
  set status = 'confirmed', updated_at = now()
  where id = p_reservation_id;

  -- Log the transaction
  insert into inventory_transactions (
    part_id,
    transaction_type,
    quantity_change,
    quantity_before,
    quantity_after,
    reference_id,
    reference_type,
    notes,
    performed_by
  ) values (
    reservation_record.part_id,
    'usage',
    -reservation_record.quantity_reserved,
    current_stock,
    current_stock - reservation_record.quantity_reserved,
    reservation_record.repair_id,
    'repair',
    'Parts used in repair',
    p_confirmed_by
  );

  return true;
end;
$$ language plpgsql;

-- Function to cancel reservation
create or replace function cancel_parts_reservation(
  p_reservation_id uuid,
  p_cancelled_by uuid
)
returns boolean as $$
begin
  update parts_reservations
  set status = 'cancelled', updated_at = now()
  where id = p_reservation_id and status = 'active';

  if found then
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql;

-- Enable RLS on new tables
alter table repair_parts enable row level security;
alter table parts_reservations enable row level security;
alter table inventory_transactions enable row level security;

-- Policies for repair_parts table
create policy "Users can view all repair parts" on repair_parts
  for select using (auth.role() = 'authenticated');

create policy "Users can manage repair parts" on repair_parts
  for all using (auth.role() = 'authenticated');

-- Policies for parts_reservations table
create policy "Users can view all parts reservations" on parts_reservations
  for select using (auth.role() = 'authenticated');

create policy "Users can manage parts reservations" on parts_reservations
  for all using (auth.role() = 'authenticated');

-- Policies for inventory_transactions table
create policy "Users can view inventory transactions" on inventory_transactions
  for select using (auth.role() = 'authenticated');

create policy "Users can insert inventory transactions" on inventory_transactions
  for insert with check (auth.role() = 'authenticated');

-- Note: selling_price and min_stock_level columns are added in earlier migrations
-- Only add cost_price if not exists (avoiding redundancy with other migrations)
alter table parts add column if not exists cost_price numeric(10,2);

-- Update existing parts records for backward compatibility
update parts set cost_price = unit_cost where cost_price is null;