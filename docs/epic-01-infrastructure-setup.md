# Epic 01: Infrastructure Setup & Database Foundation

## Epic Goal

Thiết lập toàn bộ infrastructure cơ sở và database schema cho hệ thống quản lý sửa chữa laptop, đảm bảo môi trường development hoạt động ổn định với Supabase self-hosted.

## Epic Description

**Bối cảnh dự án:**
- Hệ thống quản lý cho tiệm sửa laptop nhỏ (<10 nhân viên)
- Chuyển đổi từ WordPress sang hệ thống all-in-one
- Self-hosted deployment với Docker Compose
- Tech stack: React 19 + Supabase + TanStack Router + TypeScript

**Chi tiết Epic:**
- **Mục tiêu:** Tạo foundation infrastructure và database schema hoàn chỉnh
- **Phạm vi:** Docker setup, Supabase services, database tables, RLS policies
- **Kết quả:** Hệ thống backend hoàn chỉnh sẵn sàng cho frontend development

## Stories

### 1. **Story 1.1:** Docker Infrastructure Setup
- Thiết lập Docker Compose với full Supabase stack
- Cấu hình Kong API Gateway và network routing
- Environment variables và secret management
- 3-phase setup process: make env → make init → make data

### 2. **Story 1.2:** Database Schema Implementation
- Tạo các tables chính: customers, repair_tickets, user_profiles, parts
- Implement simplified schema phù hợp với small business
- Setup database indexes và constraints
- Data validation rules

### 3. **Story 1.3:** Authentication & Row Level Security
- Supabase Auth configuration với role-based access
- RLS policies cho từng table
- Admin account setup và user management
- Public/private data access rules

### 4. **Story 1.4:** Storage & File Management
- Supabase Storage setup cho repair ticket photos
- Folder structure và file organization
- Image optimization với imgproxy
- File access permissions và security

## Technical Requirements

**Infrastructure:**
- Docker services: app, supabase-kong, auth, rest, db, studio, storage, realtime, functions
- Network configuration với internal communication
- Port mapping: 3001 (app), 8000 (kong), 3010 (studio)
- Volume persistence cho database data

**Database Schema:**
```sql
-- Core tables (simplified)
customers (phone PK, full_name, address, notes)
repair_tickets (id, customer_phone, device_type, issue_description, status, total_cost, parts_used JSONB)
user_profiles (id, email, full_name, role ENUM('shop_owner', 'staff'), is_active)
parts (id, name, category, current_stock, unit_cost, unit_price)
```

**Authentication:**
- Admin account từ environment variables
- Employee accounts tạo bởi admin
- DISABLE_SIGNUP=true (không self-register)
- JWT-based authentication với service role key

## Definition of Done

- [ ] Docker Compose hoạt động ổn định với tất cả services
- [ ] Database schema deployed với đầy đủ tables và relationships
- [ ] RLS policies hoạt động đúng cho từng user role
- [ ] Admin account login thành công
- [ ] Supabase Studio accessible và functional
- [ ] Storage bucket setup hoàn tất
- [ ] All services health check pass
- [ ] Environment reset (make clean) hoạt động đúng

## Risk Mitigation

- **Primary Risk:** Docker networking issues và service dependencies
- **Mitigation:** Comprehensive health checks và service startup order
- **Rollback Plan:** Complete environment reset với make clean command

## Success Criteria

Hệ thống infrastructure hoàn chỉnh với:
1. Tất cả Supabase services running stable
2. Database schema sẵn sàng cho business logic
3. Authentication system functional
4. File storage accessible
5. Development environment reproducible