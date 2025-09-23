#!/usr/bin/env node

/**
 * Script to create admin user for Vietnamese Laptop Repair Shop
 * Usage: node scripts/create-admin.js [email] [password] [full_name]
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
const serviceRoleKey = process.env.VITE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  // Use environment variables
  const email = process.env.SHOP_ADMIN_EMAIL;
  const password = process.env.SHOP_ADMIN_PASSWORD;
  const fullName = process.env.SHOP_ADMIN_NAME;
  const role = process.env.SHOP_ADMIN_ROLE || 'shop_owner';

  if (!email || !password || !fullName) {
    console.error('❌ Missing required environment variables:');
    console.error('   SHOP_ADMIN_EMAIL, SHOP_ADMIN_PASSWORD, SHOP_ADMIN_NAME');
    console.error('💡 Check your .env file');
    process.exit(1);
  }

  console.log('🏪 Vietnamese Laptop Repair Shop - Admin User Creator');
  console.log(''.padEnd(60, '='));
  console.log('');
  console.log('🚀 Creating admin user...');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${fullName}`);
  console.log(`🔑 Role: ${role}`);
  console.log('');

  try {
    // Create user in auth.users
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role
      }
    });

    if (signUpError) {
      console.error('❌ Error creating user:', signUpError.message);
      process.exit(1);
    }

    console.log('✅ User created successfully!');
    console.log(`🆔 User ID: ${user.user.id}`);

    // Wait for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('');
    console.log('🎉 Admin user setup complete!');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('🌐 Access points:');
    console.log(`   Application: http://localhost:5173`);
    console.log(`   Supabase Studio: http://127.0.0.1:54323`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

main().catch(console.error);