# Biến môi trường (.env) — External Supabase Connection

Bạn sẽ tự điền các giá trị trong file `.env`. Danh sách dưới đây tổng hợp các biến cần để kết nối frontend application với external self-hosted Supabase instance.

**Lưu ý:** Supabase backend infrastructure được quản lý bên ngoài repository này. Ứng dụng frontend chỉ cần thông tin kết nối đến Supabase instance đã có sẵn.

## External Supabase Connection
- VITE_SUPABASE_URL= URL của external Supabase instance (VD: https://your-external-supabase.example.com)
- VITE_SUPABASE_ANON_KEY= Anon key từ external Supabase instance
- VITE_SERVICE_ROLE_KEY= Service role key từ external Supabase instance (cho admin operations)

## Application Configuration
- VITE_APP_ENVIRONMENT=development  (hoặc production)
- VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
- VITE_APP_VERSION=1.0.0
- VITE_API_TIMEOUT=10000  (milliseconds)
- VITE_ENABLE_DEVTOOLS=true  (false cho production)
- VITE_DEFAULT_CURRENCY=VND
- VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
- VITE_DEFAULT_LOCALE=vi-VN

## SMTP (tùy chọn cho email)
- SMTP_ADMIN_EMAIL=
- SMTP_HOST=
- SMTP_PORT=587
- SMTP_USER=
- SMTP_PASS=
- SMTP_SENDER_NAME=
- MAILER_URLPATHS_INVITE="/auth/v1/verify"
- MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
- MAILER_URLPATHS_RECOVERY="/auth/v1/verify"
- MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify"

## Thiết lập hành vi Auth
- DISABLE_SIGNUP=true  (khóa self-signup, chỉ admin tạo tài khoản staff)
- ENABLE_EMAIL_SIGNUP=true
- ENABLE_EMAIL_AUTOCONFIRM=true  (nếu không dùng SMTP)
- ENABLE_ANONYMOUS_USERS=false
- ENABLE_PHONE_SIGNUP=false
- ENABLE_PHONE_AUTOCONFIRM=false

## Studio (UI quản trị DB)
- STUDIO_DEFAULT_ORGANIZATION="Laptop Repair Shop"
- STUDIO_DEFAULT_PROJECT="Repair Management System"

## Shop Admin Account (Bootstrap)
Các biến này dùng để tạo tài khoản admin đầu tiên:
- SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
- SHOP_ADMIN_PASSWORD=AdminPass123!
- SHOP_ADMIN_NAME="Shop Manager"
- SHOP_ADMIN_ROLE=shop_owner

## Tóm tắt cổng publish mặc định
- App (React): 3001
- Kong (HTTP/HTTPS): 8000 / 8443
- Studio: 3010
- Database: Chỉ nội bộ (không expose ra ngoài)

## Ví dụ cấu hình hoàn chỉnh

```env
# Supabase Configuration for Laptop Repair Shop

# PostgreSQL
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
POSTGRES_USER=postgres

# Service User Passwords
SUPABASE_AUTH_ADMIN_PASSWORD=your-super-secret-and-long-postgres-password
SUPABASE_STORAGE_ADMIN_PASSWORD=your-super-secret-and-long-postgres-password
AUTHENTICATOR_PASSWORD=your-super-secret-and-long-postgres-password

# JWT
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
JWT_EXPIRY=3600
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# API
API_EXTERNAL_URL=http://localhost:8000
SUPABASE_PUBLIC_URL=http://localhost:8000

# Kong
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

# Database Schemas
PGRST_DB_SCHEMAS=public,storage,graphql_public

# Auth
SITE_URL=http://localhost:3000
ADDITIONAL_REDIRECT_URLS=""
DISABLE_SIGNUP=true
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false
ENABLE_ANONYMOUS_USERS=false

# Shop Admin Account (Owner/Manager)
SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
SHOP_ADMIN_PASSWORD=AdminPass123!
SHOP_ADMIN_NAME="Shop Manager"
SHOP_ADMIN_ROLE=shop_owner

# Email (SMTP) - Configure for production
SMTP_ADMIN_EMAIL=""
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_SENDER_NAME=""

# Mailer URLs
MAILER_URLPATHS_INVITE="/auth/v1/verify"
MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
MAILER_URLPATHS_RECOVERY="/auth/v1/verify"
MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify"

# Studio
STUDIO_DEFAULT_ORGANIZATION="Laptop Repair Shop"
STUDIO_DEFAULT_PROJECT="Repair Management System"

# Storage
IMGPROXY_ENABLE_WEBP_DETECTION=false

# Functions
FUNCTIONS_VERIFY_JWT=false

# Secrets
SECRET_KEY_BASE=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz

# Frontend Environment Variables (Vite)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_APP_ENVIRONMENT=development
VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEVTOOLS=true
VITE_DEFAULT_CURRENCY=VND
VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
VITE_DEFAULT_LOCALE=vi-VN

# Admin user setup (Frontend access)
VITE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## Lưu ý bảo mật

1. **JWT Keys**: Sử dụng keys được generate từ Supabase CLI hoặc tạo custom với cùng payload structure
2. **Passwords**: Thay đổi tất cả mật khẩu mặc định trước khi deploy production
3. **SERVICE_ROLE_KEY**: Bảo mật tuyệt đối, có quyền bypass RLS
4. **VITE_SERVICE_ROLE_KEY**: Chỉ dùng cho admin operations, cân nhắc giới hạn scope

Lưu ý: Các cổng có thể thay đổi theo nhu cầu, miễn là nhất quán với reverse proxy bên ngoài và các biến URL ở trên.