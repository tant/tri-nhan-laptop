-- Fix RLS policies to align with simplified staff management requirements
-- This migration ensures only Shop Owners can manage staff accounts and prevents deletion

-- Drop all current user_profiles policies
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Shop owners can manage all profiles" ON user_profiles;

-- Create simplified policies that match the requirements:
-- 1. All authenticated users can view profiles (needed for UI)
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Users can update their own basic profile information
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id
    AND auth.role() = 'authenticated'
  );

-- 3. Only Shop Owners can create new staff accounts
CREATE POLICY "Shop owners can create staff accounts" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'shop_owner'
      AND user_profiles.is_active = true
    )
    AND auth.role() = 'authenticated'
  );

-- 4. Only Shop Owners can manage (update) all staff accounts
CREATE POLICY "Shop owners can manage all staff accounts" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'shop_owner'
      AND user_profiles.is_active = true
    )
    AND auth.role() = 'authenticated'
  );

-- 5. NO DELETE POLICY - accounts can only be deactivated via is_active = false
-- This enforces the "no deletion, only deactivation" requirement

-- Add comment explaining the policy design
COMMENT ON TABLE user_profiles IS 'Staff management follows simplified 2-role system: shop_owner can manage staff accounts via create/modify/deactivate (no delete). Staff accounts are deactivated using is_active=false.';