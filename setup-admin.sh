#!/bin/bash
# Setup Admin User Script

echo "🚀 Setting up Laptop Repair Shop Admin User..."

# Check if .env.supabase exists
if [ ! -f ".env.supabase" ]; then
    echo "❌ .env.supabase file not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

# Source environment variables
source .env.supabase

echo "📧 Admin Email: $SHOP_ADMIN_EMAIL"
echo "👤 Admin Name: $SHOP_ADMIN_NAME"
echo "🔑 Admin Role: $SHOP_ADMIN_ROLE"

# Wait for services to be ready
echo "⏳ Waiting for Supabase services to be ready..."
sleep 10

# Create admin user using curl (calling Auth API via Kong)
echo "👨‍💼 Creating admin user..."

SIGNUP_RESPONSE=$(curl -s -X POST "http://localhost:8000/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SHOP_ADMIN_EMAIL\",
    \"password\": \"$SHOP_ADMIN_PASSWORD\",
    \"data\": {
      \"full_name\": \"$SHOP_ADMIN_NAME\",
      \"role\": \"$SHOP_ADMIN_ROLE\"
    }
  }")

echo "📝 Signup response: $SIGNUP_RESPONSE"

# Check if signup was successful
if echo "$SIGNUP_RESPONSE" | grep -q "error"; then
    echo "⚠️  Signup may have failed or user already exists. Response:"
    echo "$SIGNUP_RESPONSE"
else
    echo "✅ Admin user created successfully!"
fi

# Setup admin permissions via SQL
echo "🔒 Setting up admin permissions..."

# Run SQL to ensure admin has all permissions
docker compose --env-file .env.supabase exec db psql -U postgres -d postgres -c "
UPDATE user_profiles 
SET 
  can_create_users = true,
  can_manage_inventory = true, 
  can_view_financials = true,
  can_delete_repairs = true,
  is_active = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = '$SHOP_ADMIN_EMAIL'
);
"

echo "🎉 Admin user setup complete!"
echo ""
echo "You can now login with:"
echo "📧 Email: $SHOP_ADMIN_EMAIL"
echo "🔐 Password: $SHOP_ADMIN_PASSWORD"
echo ""
echo "Access points:"
echo "🌐 React App: http://localhost:3000 (dev) or http://localhost:3001 (prod)"
echo "🗄️  Supabase Studio: http://localhost:3010"
echo "🔌 API Gateway: http://localhost:8000"