#!/usr/bin/env node

/**
 * Script to manually create/fix admin user profile
 * This helps debug authentication issues in tests
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.VITE_SERVICE_ROLE_KEY;

// Create Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = 'admin@laptop-repair-shop.local';

  console.log('🔍 Investigating admin user profile...');
  console.log('');

  try {
    // First, get the user from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const adminUser = users.users.find(u => u.email === email);

    if (!adminUser) {
      console.log('❌ Admin user not found in auth.users');
      return;
    }

    console.log('✅ Admin user found in auth.users:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Metadata:`, adminUser.user_metadata);
    console.log('');

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    if (!profile) {
      console.log('❌ Profile not found - creating it manually...');

      // Create the profile manually
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: adminUser.id,
          email: adminUser.email,
          full_name: adminUser.user_metadata.full_name || 'Shop Manager',
          role: adminUser.user_metadata.role || 'shop_owner'
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating profile:', insertError);
        return;
      }

      console.log('✅ Profile created successfully:');
      console.log('   ID:', newProfile.id);
      console.log('   Email:', newProfile.email);
      console.log('   Name:', newProfile.full_name);
      console.log('   Role:', newProfile.role);
    } else {
      console.log('✅ Profile already exists:');
      console.log('   ID:', profile.id);
      console.log('   Email:', profile.email);
      console.log('   Name:', profile.full_name);
      console.log('   Role:', profile.role);
    }

    console.log('');
    console.log('🎉 Admin user profile is ready for testing!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

main().catch(console.error);