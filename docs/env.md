# Biến môi trường (.env) — Local Supabase Connection

Bạn sẽ tự điền các giá trị trong file `.env`. Danh sách dưới đây tổng hợp các biến cần để kết nối frontend application với local self-hosted Supabase instance.

**Lưu ý:** Supabase backend infrastructure chạy trên cùng máy nhưng được quản lý riêng biệt với repository này. Ứng dụng frontend chỉ cần thông tin kết nối đến Supabase instance đang chạy trên localhost.

## Local Supabase Connection
- VITE_SUPABASE_URL= URL của local Supabase instance (http://127.0.0.1:54321)
- VITE_SUPABASE_ANON_KEY= Anon key từ local Supabase instance
- VITE_SERVICE_ROLE_KEY= Service role key từ local Supabase instance (cho admin operations)

## Supabase Development URLs
- **API URL**: http://127.0.0.1:54321
- **GraphQL URL**: http://127.0.0.1:54321/graphql/v1
- **S3 Storage URL**: http://127.0.0.1:54321/storage/v1/s3
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL**: http://127.0.0.1:54323 (Supabase Studio dashboard)
- **Inbucket URL**: http://127.0.0.1:54324 (Email testing)

## Application Configuration
- VITE_APP_ENVIRONMENT=development  (hoặc production)
- VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
- VITE_APP_VERSION=1.0.0
- VITE_API_TIMEOUT=10000  (milliseconds)
- VITE_ENABLE_DEVTOOLS=true  (false cho production)
- VITE_DEFAULT_CURRENCY=VND
- VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
- VITE_DEFAULT_LOCALE=vi-VN

## Development Configuration
- PORT=3000  (cổng cho development server)
- HOST=localhost  (host cho development server)

## Ví dụ cấu hình hoàn chỉnh

```env
# Frontend Application Configuration

# Local Supabase Development Environment
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Application Settings
VITE_APP_ENVIRONMENT=development
VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEVTOOLS=true
VITE_DEFAULT_CURRENCY=VND
VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
VITE_DEFAULT_LOCALE=vi-VN

# Development Server
PORT=3000
HOST=localhost
```

## Setup Commands

```bash
# Cài đặt Supabase CLI làm dev dependency
pnpm add supabase --save-dev

# Khởi tạo Supabase project
pnpx supabase init

# Khởi động local Supabase development environment
pnpx supabase start

# Dừng local environment
pnpx supabase stop
```

## Lưu ý bảo mật

1. **VITE_SUPABASE_URL**: URL của local Supabase instance (http://127.0.0.1:54321)
2. **VITE_SUPABASE_ANON_KEY**: Anon key từ local Supabase instance (public, nhưng vẫn cần bảo mật)
3. **VITE_SERVICE_ROLE_KEY**: Service role key từ local instance (bảo mật tuyệt đối, có quyền bypass RLS)
4. **JWT Secret**: super-secret-jwt-token-with-at-least-32-characters-long
5. **S3 Credentials**: Access Key và Secret Key cho local storage
6. **Credentials Management**: Tất cả credentials được tự động tạo khi chạy `pnpx supabase start`

## Phạm vi Repository

**Repository này chỉ chứa:**
- Frontend application (React/Vite)
- Client-side configuration
- UI components và business logic

**Repository này KHÔNG chứa:**
- Supabase backend infrastructure
- Database schemas, tables, và migrations
- Docker compose files cho Supabase
- Server-side configuration
- RLS (Row Level Security) policies
- Database functions và triggers
- Supabase auth configuration

**Supabase Management**: Local Supabase development environment được quản lý trong project này thông qua Supabase CLI và npm scripts.

## Development Workflow

1. **Lần đầu setup**:
   ```bash
   # Dependencies đã được cài sẵn
   pnpm install

   # Khởi tạo Supabase (tạo thư mục supabase/ với migrations)
   pnpx supabase init

   # Khởi động và apply database schema
   pnpm run db:start

   # Tạo admin user từ environment variables
   pnpm run create-admin
   ```

2. **Daily development workflow**:
   ```bash
   # Khởi động Supabase services
   pnpm run db:start

   # Kiểm tra trạng thái services
   pnpm run db:status

   # Khởi động frontend application
   pnpm run dev

   # Khi kết thúc, dừng services
   pnpm run db:stop
   ```

3. **Database management**:
   ```bash
   pnpm run db:reset    # Reset database và apply migrations + seed data
   pnpm run db:status   # Kiểm tra trạng thái services
   ```

4. **Access các services**:
   - **Application**: http://localhost:5173
   - **Studio UI**: http://127.0.0.1:54323
   - **API**: http://127.0.0.1:54321
   - **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   - **Email Testing**: http://127.0.0.1:54324

## Admin User Creation

Admin user được tạo tự động từ environment variables:

```bash
# Sử dụng Node.js script (recommended)
pnpm run create-admin

# Hoặc sử dụng Bash script
pnpm run create-admin:bash
```

Credentials được đọc từ các biến môi trường:
- `SHOP_ADMIN_EMAIL`
- `SHOP_ADMIN_PASSWORD`
- `SHOP_ADMIN_NAME`
- `SHOP_ADMIN_ROLE`