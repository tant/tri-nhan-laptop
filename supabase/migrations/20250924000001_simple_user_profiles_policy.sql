-- Simplify user_profiles policies to avoid recursion completely
-- This is a temporary fix for testing - in production you'd want more restrictive policies

-- Drop all existing policies on user_profiles
drop policy if exists "Users can view all profiles" on user_profiles;
drop policy if exists "Users can update own profile" on user_profiles;
drop policy if exists "Shop owners can manage all profiles" on user_profiles;
drop policy if exists "Shop owners can insert profiles" on user_profiles;

-- Create simple, non-recursive policies
-- Allow all authenticated users to read all profiles (for testing)
create policy "Allow authenticated users to read profiles" on user_profiles
  for select using (auth.role() = 'authenticated');

-- Allow users to update their own profile
create policy "Allow users to update own profile" on user_profiles
  for update using (auth.uid() = id);

-- Allow authenticated users to insert profiles (needed for user registration)
create policy "Allow authenticated users to insert profiles" on user_profiles
  for insert with check (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own profile
create policy "Allow users to delete own profile" on user_profiles
  for delete using (auth.uid() = id);