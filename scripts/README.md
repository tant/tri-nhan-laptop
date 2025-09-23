# Admin User Creation Scripts

Simple scripts to create admin users using environment variables from your `.env` file.

## Quick Start

### Method 1: Use NPM Scripts (Recommended)
```bash
# Using Node.js script
pnpm run create-admin

# Using Bash script
pnpm run create-admin:bash
```

### Method 2: Direct Script Execution
```bash
# Node.js script
node scripts/create-admin.js

# Bash script
./scripts/create-admin.sh
```

### Method 3: Use Supabase Studio (Manual)
1. Open Supabase Studio: http://127.0.0.1:54323
2. Navigate to **Authentication** > **Users**
3. Click **"Add user"** and fill in your admin details

## Environment Variables Required

The scripts read admin credentials from your `.env` file:
- `SHOP_ADMIN_EMAIL` - Admin email address
- `SHOP_ADMIN_PASSWORD` - Admin password
- `SHOP_ADMIN_NAME` - Admin full name
- `SHOP_ADMIN_ROLE` - Admin role (defaults to `shop_owner`)

**Note:** The scripts will exit with an error if these variables are missing.

## Database Management Scripts

Additional useful scripts:

```bash
# Start Supabase
pnpm run db:start

# Check status
pnpm run db:status

# Reset database (reapply migrations and seed data)
pnpm run db:reset

# Stop Supabase
pnpm run db:stop
```

## Troubleshooting

### Error: "Database error creating new user"
This can happen due to database connection issues or conflicts. Try these solutions:

1. **Reset the database**: `pnpm run db:reset`
2. **Use Supabase Studio** (Method 1 above)
3. **Check if user already exists** in Studio
4. **Create user through the application** signup page

### User created but no profile
If the user is created but the profile isn't automatically generated:

1. Go to Supabase Studio: http://127.0.0.1:54323
2. Navigate to **SQL Editor**
3. Run this query:
   ```sql
   INSERT INTO user_profiles (id, email, full_name, role)
   VALUES (
     'USER_ID_HERE',
     'admin@laptop-repair-shop.local',
     'Shop Manager',
     'shop_owner'
   );
   ```

## Access Points After User Creation

- **Application**: http://localhost:5173
- **Supabase Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321

## Security Notes

- Change default passwords in production
- Use strong passwords for real deployments
- The shop_owner role has full access to all features
- Staff role has limited access (defined in RLS policies)