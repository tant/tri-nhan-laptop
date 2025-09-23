#!/bin/bash

# Vietnamese Laptop Repair Shop - Admin User Creator
# Simple version using only environment variables

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables safely
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

echo -e "${BLUE}🏪 Vietnamese Laptop Repair Shop - Admin User Creator${NC}"
echo "============================================================"
echo ""

# Check required environment variables
if [ -z "$SHOP_ADMIN_EMAIL" ] || [ -z "$SHOP_ADMIN_PASSWORD" ] || [ -z "$SHOP_ADMIN_NAME" ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    echo "   SHOP_ADMIN_EMAIL, SHOP_ADMIN_PASSWORD, SHOP_ADMIN_NAME"
    echo -e "${YELLOW}💡 Check your .env file${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Creating admin user...${NC}"
echo -e "📧 Email: ${SHOP_ADMIN_EMAIL}"
echo -e "👤 Name: ${SHOP_ADMIN_NAME}"
echo -e "🔑 Role: ${SHOP_ADMIN_ROLE:-shop_owner}"
echo ""

# Create user via Supabase Admin API
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${VITE_SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${VITE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${VITE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${SHOP_ADMIN_EMAIL}\",
    \"password\": \"${SHOP_ADMIN_PASSWORD}\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"full_name\": \"${SHOP_ADMIN_NAME}\",
      \"role\": \"${SHOP_ADMIN_ROLE:-shop_owner}\"
    }
  }")

# Split response and status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
    echo -e "${GREEN}✅ User created successfully!${NC}"

    USER_ID=$(echo "$HTTP_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$USER_ID" ]; then
        echo -e "🆔 User ID: ${USER_ID}"
    fi

    echo ""
    echo -e "${GREEN}🎉 Admin user setup complete!${NC}"
    echo -e "${BLUE}📝 Login credentials:${NC}"
    echo -e "   Email: ${SHOP_ADMIN_EMAIL}"
    echo -e "   Password: ${SHOP_ADMIN_PASSWORD}"
    echo ""
    echo -e "${BLUE}🌐 Access points:${NC}"
    echo -e "   Application: http://localhost:5173"
    echo -e "   Supabase Studio: http://127.0.0.1:54323"
else
    echo -e "${RED}❌ Error creating user (HTTP ${HTTP_STATUS}):${NC}"
    echo "$HTTP_BODY"
    echo ""
    echo -e "${YELLOW}💡 Try using Supabase Studio: http://127.0.0.1:54323${NC}"
    exit 1
fi