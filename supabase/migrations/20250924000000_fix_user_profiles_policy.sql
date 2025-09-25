-- Fix infinite recursion in user_profiles RLS policy
-- The original policy was querying user_profiles from within a user_profiles policy

-- Drop the problematic policy
drop policy if exists "Shop owners can manage all profiles" on user_profiles;

-- Create a simpler, non-recursive policy for shop owners
-- We'll use a different approach that doesn't cause recursion
create policy "Shop owners can manage all profiles" on user_profiles
  for all using (
    -- Allow access if the current user has shop_owner role in their JWT claims
    -- This avoids querying the user_profiles table recursively
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'shop_owner'
    or
    -- Also allow if the user is accessing their own profile
    auth.uid() = id
  );

-- Ensure the policy covers all operations
create policy "Shop owners can insert profiles" on user_profiles
  for insert with check (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'shop_owner'
  );