#!/bin/bash
set -e

echo "Creating shop owner admin user..."

# Create the admin user in auth.users table
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        '${SHOP_ADMIN_EMAIL}',
        crypt('${SHOP_ADMIN_PASSWORD}', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "${SHOP_ADMIN_NAME}", "role": "${SHOP_ADMIN_ROLE}"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    -- Create user profile if user_profiles table exists
    DO \$\$
    BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
            INSERT INTO public.user_profiles (
                id,
                full_name,
                role,
                email,
                is_active,
                can_create_users,
                can_manage_inventory,
                can_view_financials,
                can_delete_repairs,
                created_at
            )
            SELECT
                u.id,
                '${SHOP_ADMIN_NAME}',
                '${SHOP_ADMIN_ROLE}',
                '${SHOP_ADMIN_EMAIL}',
                true,
                true,
                true,
                true,
                true,
                NOW()
            FROM auth.users u
            WHERE u.email = '${SHOP_ADMIN_EMAIL}'
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END
    \$\$;
EOSQL

echo "Shop owner admin user created successfully!"
echo "Email: ${SHOP_ADMIN_EMAIL}"
echo "Default Password: ${SHOP_ADMIN_PASSWORD}"
echo "Role: ${SHOP_ADMIN_ROLE}"