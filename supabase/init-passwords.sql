-- Set passwords for all Supabase service users

-- Set password for supabase_auth_admin
ALTER USER supabase_auth_admin WITH PASSWORD 'root';

-- Set password for authenticator
ALTER USER authenticator WITH PASSWORD 'root';

-- Set password for supabase_storage_admin  
ALTER USER supabase_storage_admin WITH PASSWORD 'root';

-- Set password for supabase_admin
ALTER USER supabase_admin WITH PASSWORD 'root';

-- Set password for dashboard_user
ALTER USER dashboard_user WITH PASSWORD 'root';