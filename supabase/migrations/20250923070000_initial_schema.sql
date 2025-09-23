-- Vietnamese Laptop Repair Shop Database Schema

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enums for repair status
create type repair_status as enum (
  'device_received',
  'preliminary_inspection',
  'awaiting_repair_plan',
  'approved_for_repair',
  'in_diagnosis',
  'waiting_parts',
  'in_repair',
  'quality_testing',
  'ready_for_pickup',
  'completed',
  'cannot_repair',
  'cancelled_by_customer',
  'repair_failed',
  'customer_no_show',
  'ready_for_return',
  'abandoned'
);

-- Create enums for payment methods
create type payment_method as enum (
  'cash',
  'transfer',
  'other'
);

-- Create enums for user roles
create type user_role as enum (
  'shop_owner',
  'staff'
);

-- Create customers table (phone as primary key)
create table customers (
  phone text primary key,
  full_name text not null,
  address text,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create user_profiles table
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  email text unique not null,
  full_name text not null,
  role user_role default 'staff' not null,
  phone text,
  is_active boolean default true not null
);

-- Create parts table
create table parts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  name text not null,
  category text not null,
  brand text,
  model_compatibility text[] default '{}',
  current_stock integer default 0 not null,
  unit_cost numeric(10,2) not null,
  unit_price numeric(10,2) not null,
  supplier_info text
);

-- Create repair_tickets table
create table repair_tickets (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  ticket_code text unique not null,
  customer_phone text not null references customers(phone),
  device_info jsonb not null default '{}',
  issue_description text not null,
  status repair_status default 'device_received' not null,
  assigned_technician_id uuid references user_profiles(id),
  parts_used jsonb default '[]',
  estimated_completion timestamp with time zone,
  total_cost numeric(10,2),
  deposit_amount numeric(10,2),
  is_paid boolean default false not null,
  paid_at timestamp with time zone,
  payment_method payment_method,
  receipt_note text,
  warranty_until timestamp with time zone,
  has_issue_report boolean default false not null,
  customer_approved_at timestamp with time zone,
  customer_approved_by text,
  repair_completed_at timestamp with time zone,
  repair_completed_by uuid references user_profiles(id),
  paid_by uuid references user_profiles(id)
);

-- Create indexes for better performance
create index idx_repair_tickets_customer_phone on repair_tickets(customer_phone);
create index idx_repair_tickets_status on repair_tickets(status);
create index idx_repair_tickets_created_at on repair_tickets(created_at);
create index idx_repair_tickets_ticket_code on repair_tickets(ticket_code);
create index idx_parts_category on parts(category);
create index idx_parts_name on parts(name);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_customers_updated_at
  before update on customers
  for each row execute function update_updated_at_column();

create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_parts_updated_at
  before update on parts
  for each row execute function update_updated_at_column();

create trigger update_repair_tickets_updated_at
  before update on repair_tickets
  for each row execute function update_updated_at_column();

-- Function to generate ticket codes
create or replace function generate_ticket_code()
returns text as $$
declare
  year_part text;
  sequence_part text;
  next_sequence integer;
begin
  -- Get current year
  year_part := extract(year from now())::text;

  -- Get next sequence number for this year
  select coalesce(max(
    case
      when ticket_code ~ ('^LRP-' || year_part || '-[0-9]{6}$')
      then substring(ticket_code from length('LRP-' || year_part || '-') + 1)::integer
      else 0
    end
  ), 0) + 1
  into next_sequence
  from repair_tickets;

  -- Format sequence with leading zeros
  sequence_part := lpad(next_sequence::text, 6, '0');

  return 'LRP-' || year_part || '-' || sequence_part;
end;
$$ language plpgsql;

-- Trigger to auto-generate ticket codes
create or replace function set_ticket_code()
returns trigger as $$
begin
  if new.ticket_code is null or new.ticket_code = '' then
    new.ticket_code := generate_ticket_code();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_repair_ticket_code
  before insert on repair_tickets
  for each row execute function set_ticket_code();

-- Row Level Security (RLS) policies
alter table customers enable row level security;
alter table user_profiles enable row level security;
alter table parts enable row level security;
alter table repair_tickets enable row level security;

-- Policies for customers table
create policy "Users can view all customers" on customers
  for select using (auth.role() = 'authenticated');

create policy "Users can insert customers" on customers
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update customers" on customers
  for update using (auth.role() = 'authenticated');

-- Policies for user_profiles table
create policy "Users can view all profiles" on user_profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = id);

create policy "Shop owners can manage all profiles" on user_profiles
  for all using (
    exists (
      select 1 from user_profiles
      where user_profiles.id = auth.uid()
      and user_profiles.role = 'shop_owner'
    )
  );

-- Policies for parts table
create policy "Users can view all parts" on parts
  for select using (auth.role() = 'authenticated');

create policy "Users can manage parts" on parts
  for all using (auth.role() = 'authenticated');

-- Policies for repair_tickets table
create policy "Users can view all repair tickets" on repair_tickets
  for select using (auth.role() = 'authenticated');

create policy "Users can manage repair tickets" on repair_tickets
  for all using (auth.role() = 'authenticated');

-- Function to handle user profile creation
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'staff'::public.user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();