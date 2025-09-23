# HỆ THỐNG QUẢN LÝ SỬA CHỮA LAPTOP
## VIETNAMESE LAPTOP REPAIR MANAGEMENT SYSTEM

---

## 📋 **TỔNG QUAN DỰ ÁN**

### **Thông tin doanh nghiệp**
- **Loại hình:** Tiệm sửa laptop nhỏ
- **Quy mô:** Ít hơn 10 nhân viên
- **Nền tảng hiện tại:** WordPress website

### **Mục tiêu dự án**
Phát triển hệ thống quản lý all-in-one để thay thế toàn bộ hệ thống hiện có, tối ưu hóa quy trình sửa chữa và quản lý kinh doanh.

---

## 🏢 **HIỆN TRẠNG KINH DOANH**

### **1. DỊCH VỤ SỬA CHỮA LAPTOP** *(Business chính)*
- **Quy trình:** Quy trình sửa chữa chuẩn hóa
- **Tra cứu phiếu:** Hệ thống tra cứu công khai
- **Chính sách bảo hành:** Được mô tả trên trang tra cứu

### **2. MUA BÁN TRAO ĐỔI LAPTOP CŨ & LINH KIỆN**
- **Danh mục sản phẩm:** Mỗi sản phẩm có trang riêng
- **Phương thức bán:** Khách hàng gọi điện liên hệ, không bán trực tuyến

### **3. ĐÀO TẠO SỬA CHỮA LAPTOP**
- **Nội dung:** Mô tả lớp học, thời gian, học phí
- **Đăng ký:** Qua điện thoại liên hệ
- **Cấu trúc:** Mỗi lớp học là một trang web riêng

### **4. HỢP TÁC SỬA CHỮA LAPTOP**
- **Đối tượng:** Các cửa hàng không có thợ sửa
- **Quy trình:** Đối tác nhận máy từ khách → chuyển về cửa hàng chính sửa
- **Quản lý:** Phiếu sửa tạo bình thường, đối tác không có tài khoản hệ thống

### **5. NỘI DUNG KỸ THUẬT**
- **Blog:** Các bài viết kỹ thuật trên website
- **Platform:** WordPress

---

## 🎯 **YÊU CẦU HỆ THỐNG MỚI**

### **Tech Stack**
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Real-time, RLS)
- **Frontend:** Vite + React 19 + TanStack Router + TypeScript
- **UI Library:** shadcn/ui với Tailwind CSS
- **Features:** Mobile-friendly, PWA-ready
- **Development Tools:** Biome (linting/formatting), Vitest (testing), pnpm

### **Deployment & Infrastructure**
- **Development Model:** This repository contains the frontend application AND local Supabase development environment
- **Local Development:** Uses Supabase CLI for local development with Docker containers
- **Database Included:** Database schema, migrations, and seed data are managed in this repository
- **Configuration:** Complete development setup via environment variables and npm scripts

### **Database & Schema Management**
- **Local Development:** Full database schema managed in `supabase/migrations/`
- **Seed Data:** Development data provided in `supabase/seed.sql`
- **Admin Creation:** Automated admin user creation via environment-driven scripts
- **TypeScript Types:** Database types maintained in `src/lib/supabase.ts`
- **Migration System:** Schema changes via Supabase CLI migration system

## **🚀 DEVELOPMENT ENVIRONMENT**

### **Prerequisites**
- **Node.js:** 18+ (recommended: latest LTS)
- **pnpm:** Latest version (`npm install -g pnpm`)
- **Supabase CLI:** `npm install -g supabase`
- **Docker:** Required for Supabase services
- **RAM:** Minimum 7GB for running all Supabase services

### **Initial Setup (One-time)**

```bash
# Clone and navigate to repository
git clone <repository-url>
cd try-vite

# Install dependencies
pnpm install

# Initialize Supabase (creates supabase/ directory with migrations)
pnpx supabase init

# Start Supabase services (this will apply migrations and seed data)
pnpm run db:start

# Create admin user from environment variables
pnpm run create-admin

# Start development server
pnpm run dev
```

### **Daily Development Workflow**

```bash
# Start Supabase services
pnpm run db:start

# Check service status
pnpm run db:status

# Start frontend development
pnpm run dev

# When done, stop services
pnpm run db:stop
```

### **Available Development Commands**
```bash
# Database Management
pnpm run db:start      # Start all Supabase services
pnpm run db:stop       # Stop all services
pnpm run db:status     # Check service status
pnpm run db:reset      # Reset database (apply migrations + seed)

# Application Development
pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run preview       # Preview production build

# Code Quality
pnpm run lint          # Run Biome linting
pnpm run format        # Format code
pnpm run check         # Run linting and formatting

# Testing
pnpm run test          # Run all tests (Phase 1: 81 tests passing)
pnpm run test:watch    # Run tests in watch mode

# Admin Management
pnpm run create-admin  # Create admin user from .env
```

### **Access Points During Development**
- **Application**: http://localhost:5173
- **Supabase Studio**: http://127.0.0.1:54323 (Database management)
- **API Endpoint**: http://127.0.0.1:54321
- **Email Testing**: http://127.0.0.1:54324 (Inbucket)

### **Development Tips**
- **Hot Reload**: Frontend automatically reloads on file changes
- **Database Management**: Use Supabase Studio for database inspection and manual operations
- **TypeScript Types**: Database types are maintained manually in `src/lib/supabase.ts`
- **Admin User**: Created automatically from environment variables via scripts
- **Real-time Updates**: All repair status changes update live via Supabase channels

## **🏭 PRODUCTION ENVIRONMENT**

### **Production Deployment**
- **Frontend:** Deploy React build to static hosting (Vercel, Netlify, etc.)
- **Backend:** Self-hosted Supabase using Docker Compose (separate setup)
- **Configuration:** Production environment variables for Supabase connection

**Note:** Production setup uses Docker Compose for Supabase infrastructure instead of CLI. Detailed production guide will be provided separately.

---

## 👥 **PHÂN QUYỀN & TÀI KHOẢN**

### **Đối tượng sử dụng**
1. **Chủ shop (Admin)** - Phải đăng nhập
2. **Nhân viên** - Phải đăng nhập
3. **Khách hàng** - Không cần đăng nhập

### **Hệ thống tài khoản**
- **Format:** Email + Password
- **Phân loại:** 2 loại duy nhất (Admin/Nhân viên)
- **Admin account:** Setup sẵn trong environment variables
- **Self-signup:** Bị khóa (DISABLE_SIGNUP=true)
- **Employee accounts:** Được tạo/quản lý bởi Admin

### **Quyền hạn Admin**
- Toàn quyền trên hệ thống
- Tạo/sửa/deactivate tài khoản nhân viên
- Quản lý thông tin khách hàng
- Thiết lập hệ thống

### **Quyền hạn Nhân viên**
- **Phiếu sửa chữa:** Tạo, cập nhật tất cả phiếu (không giới hạn theo assignee)
- **Linh kiện:** Cập nhật linh kiện cho phiếu sửa chữa
- **Khách hàng:** Xem thông tin và lịch sử, không sửa trực tiếp (comment để yêu cầu Admin xử lý)

### **Chính sách Deactivation**
- **Auto-reassign:** Khi deactivate nhân viên, tự động chuyển tất cả phiếu đang assign về Admin
- **UI Filter:** Mặc định ẩn nhân viên đã deactivate
- **Access:** Nhân viên bị deactivate không thể đăng nhập

---

## 👤 **QUẢN LÝ KHÁCH HÀNG**

### **Chính sách khách hàng**
- **Primary Key:** Số điện thoại
- **Hợp nhất:** Không hỗ trợ hợp nhất, mỗi số = 1 khách hàng riêng
- **Tạo mới:** Tự động khi tạo phiếu với số điện thoại mới
- **Giao tiếp:** Qua điện thoại, không quản lý trên hệ thống

### **Row Level Security (RLS)**
#### **Nhân viên & Admin:**
- **Xem:** Đầy đủ thông tin (tên, phone, địa chỉ, ghi chú) + lịch sử giao dịch
- **Sửa:** Admin có thể tạo/cập nhật; Nhân viên chỉ comment yêu cầu

#### **Công khai (Tra cứu):**
- **Xem:** Giới hạn (trạng thái phiếu, cập nhật gần nhất)
- **Không thấy:** Ảnh, ghi chú, chi phí, nhân viên phụ trách

---

## 🎫 **HỆ THỐNG PHIẾU SỬA CHỮA**

### **Mã phiếu (Ticket Code)** ✅
- **Format:** LRP-YYYY-###### (VD: LRP-2025-000123)
- **Cấu trúc:** Tiền tố "LRP" (Laptop Repair) + Năm + Số thứ tự 6 chữ số
- **Tính năng:** Unique toàn hệ thống, reset theo năm, sử dụng database sequence
- **Status:** COMPLETE - Automatic code generation system implemented with Vietnamese timezone support

### **Quản lý ảnh**
- **Lưu trữ:** Storage bucket `tickets/{ticket_code}/YYYY-MM-DD/`
- **Quyền truy cập:** Private, chỉ staff xem qua signed URL
- **Tối ưu:** Hỗ trợ thumbnail/resize qua imgproxy
- **Giới hạn:** Không giới hạn số lượng/kích thước (phụ thuộc ổ đĩa)

### **Comments & Internal Notes**
- **Mục đích:** Trao đổi nội bộ giữa nhân viên
- **Truy cập:** Chỉ staff, khách hàng không xem được

---

## 📊 **HỆ THỐNG TRẠNG THÁI** ✅

### **Trạng thái chính (Normal Flow)**
1. **device_received** → "Đã tiếp nhận thiết bị"
2. **preliminary_inspection** → "Đang kiểm tra ban đầu"
3. **awaiting_repair_plan** → "Chờ xác nhận phương án sửa chữa"
4. **approved_for_repair** → "Đã xác nhận sửa chữa"
5. **in_diagnosis** → "Đang chẩn đoán chi tiết" *(conditional)*
6. **waiting_parts** → "Đang đặt hàng linh kiện" *(conditional)*
7. **in_repair** → "Đang thực hiện sửa chữa"
8. **quality_testing** → "Đang kiểm tra chất lượng"
9. **ready_for_pickup** → "Sẵn sàng nhận máy"
10. **completed** → "Đã hoàn thành"

### **Trạng thái đặc biệt (Exception Flow)**
11. **cannot_repair** → "Không thể sửa chữa"
12. **cancelled_by_customer** → "Đã hủy sửa chữa"
13. **repair_failed** → "Sửa chữa gặp khó khăn"
14. **customer_no_show** → "Chờ khách hàng liên hệ"
15. **ready_for_return** → "Sẵn sàng trả máy"
16. **abandoned** → "Liên hệ để nhận máy"

### **Điều kiện chuyển trạng thái**
- **preliminary_inspection → awaiting_repair_plan:** `has_issue_report = true`
- **awaiting_repair_plan → approved_for_repair:** `customer_approved_at NOT NULL`
- **in_repair → quality_testing:** `repair_completed_at NOT NULL`
- **ready_for_pickup → completed:** `is_paid = true AND paid_at NOT NULL`

### **Timeout Guidelines** *(Manual transition only)*
- **awaiting_repair_plan:** 7 ngày → suggest `cancelled_by_customer`
- **ready_for_pickup:** 30 ngày → suggest `customer_no_show`
- **customer_no_show:** 90 ngày → suggest `abandoned`

### **Real-time Status Updates** ✅
- **Status:** COMPLETE - Vietnamese notifications with automatic customer communications
- **Features:** Real-time Supabase subscriptions, change tracking, and attribution system

### **Real-Time Multi-Session Synchronization** ✅
- **Status:** COMPLETE - Advanced sync system with conflict resolution and performance optimization
- **Features:** Multi-session sync, automatic conflict resolution, connection management, batching optimization

---

## 💰 **THANH TOÁN & BẢO HÀNH**

### **Thanh toán**
- **Mức độ:** Đơn giản, không quản lý VAT/hóa đơn
- **Trường dữ liệu:**
  - `total_cost` (tổng chi phí)
  - `deposit_amount` (tiền cọc)
  - `is_paid` (boolean)
  - `paid_at` (timestamp)
  - `payment_method` (cash/transfer/other)
  - `receipt_note` (ghi chú biên nhận)

### **Bảo hành**
- **Mô hình:** Theo phiếu (không theo từng linh kiện)
- **Trường:** `warranty_until` (ngày hết hạn)
- **Thiết lập:** Khi hoàn tất phiếu (completed)
- **Hiển thị:** Công khai trong trang tra cứu

---

## 🔧 **QUẢN LÝ LINH KIỆN & KHO**

### **Sử dụng linh kiện**
- **Quy trình:** Nhân viên thêm linh kiện vào phiếu
- **Ghi log:** `part_id`, `quantity`, `unit_cost_at_use`, `unit_price_at_use`, `notes`, `warranty_months`, `used_at`
- **Tồn kho:** Chưa trừ tự động, chỉ ghi log sử dụng

### **Quản lý kho**
- **Hiện tại:** Chỉ quản lý danh mục, tồn kho mặc định 10000 (ảo)
- **Tương lai:** Sẽ triển khai nhập/xuất kho thực tế và đồng bộ với cửa hàng

---

## 🗂️ **CẤU TRÚC TRANG WEB**

### **Public Pages**
```
/ (Trang chủ)
├── /sua-laptop (Dịch vụ sửa chữa)
│   ├── /sua-laptop/quy-trinh
│   ├── /sua-laptop/bang-gia
│   └── /sua-laptop/tra-cuu (Tra cứu & Bảo hành)
├── /san-pham (→ redirect to /san-pham/laptop)
│   ├── /san-pham/laptop
│   │   └── /san-pham/laptop/{ten-san-pham}
│   └── /san-pham/linh-kien
│       └── /san-pham/linh-kien/{ten-linh-kien}
├── /dao-tao (Đào tạo - trang tĩnh)
│   └── /dao-tao/{ten-khoa-hoc}
├── /hop-tac (Hợp tác - nội dung cũ)
├── /gioi-thieu (Giới thiệu - nội dung cũ)
├── /lien-he (Liên hệ - layout mới)
├── /blog (Blog - trang tĩnh)
│   └── /blog/{tieu-de-bai-viet}
└── /login
```

### **Authenticated Pages**
```
/dashboard (Tổng quan)
├── /phieu-sua-chua (Danh sách phiếu)
│   └── /phieu-sua-chua/{ticketid}
├── /khach-hang (Danh sách khách hàng)
│   └── /khach-hang/{customerid}
├── /cua-hang (Quản lý sản phẩm bán)
│   └── /cua-hang/{id-san-pham}
├── /ton-kho (Quản lý kho)
└── /admin
    ├── /admin/nhan-vien (Quản lý nhân viên)
    └── /admin/thiet-lap (Cài đặt hệ thống)
```

---

## 🔍 **TRA CỨU CÔNG KHAI**

### **Phương thức tra cứu**
- **Xác thực:** Không OTP, chỉ cần số điện thoại
- **Kết quả:** Liệt kê tất cả phiếu của số điện thoại

### **Thông tin hiển thị**
- **Cho khách:** Mã phiếu, thiết bị, trạng thái (customer-facing), cập nhật gần nhất, ngày hết bảo hành
- **Không hiển thị:** Ảnh, comment nội bộ, chi tiết kỹ thuật, chi phí, staff phụ trách

---

## 📱 **PWA & UX**

### **Progressive Web App**
- **Offline scope:** Chỉ public pages (app shell + static content)
- **Dashboard:** Yêu cầu online (auth/RLS dependency)
- **Manifest:** Vietnamese language (vi-VN), shop branding

### **Caching Strategy**
- **App shell:** Precache (stale-while-revalidate)
- **Static assets:** Cache-first với versioning
- **Public API:** Network-first
- **Authenticated API:** Network-only

---

## 🚫 **KHÔNG TRIỂN KHAI Ở GIAI ĐOẠN ĐẦU**

### **Features hoãn lại**
- **Audit logging:** Chưa ghi lịch sử chi tiết
- **Multi-branch:** Không `branch_id`
- **WordPress migration:** Không migrate dữ liệu cũ
- **Push notifications:** Chưa Web Push
- **Automatic state transitions:** Không auto-transition
- **Advanced inventory:** Chưa nhập/xuất kho thực tế
- **Training management:** Chỉ hiển thị thông tin, không quản lý đăng ký
- **E-commerce features:** Không giỏ hàng/thanh toán online
- **System notifications:** Chưa tích hợp (dự kiến Chatwoot sau này)

### **Simplified approaches**
- **Product sales:** Chỉ CTA gọi điện
- **Partner management:** Không tài khoản riêng
- **Content management:** Nhập thủ công, không CMS
- **SEO/Redirects:** Chưa yêu cầu 301 redirects từ WordPress

---

## 📋 **VALIDATION FIELDS**

### **Trường xác nhận tối thiểu**
```sql
-- Cho 4 điều kiện chuyển trạng thái bắt buộc
has_issue_report BOOLEAN
customer_approved_at TIMESTAMP
customer_approved_by UUID -- optional
repair_completed_at TIMESTAMP
repair_completed_by UUID -- optional
paid_at TIMESTAMP
paid_by UUID -- optional
```

---

## ⚙️ **BIẾN MÔI TRƯỜNG & CLIENT CONFIG**

### **Supabase Client Configuration**
```javascript
// App connects to local Supabase development environment
const supabaseClient = createClient(
  process.env.VITE_SUPABASE_URL,      // Local dev: 'http://127.0.0.1:54321'
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### **Key Environment Variables**
```env
# Local Supabase Development Environment (Frontend)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Application Configuration
VITE_APP_ENVIRONMENT=development
VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEVTOOLS=true
VITE_DEFAULT_CURRENCY=VND
VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
VITE_DEFAULT_LOCALE=vi-VN
```

**Note:** This application connects to a local Supabase development environment managed via Supabase CLI (`pnpm run db:start`). The Supabase configuration, migrations, and seed data are included in this repository for complete local development setup.

---

## 🧪 **PHASE 1 TEST IMPLEMENTATION** *(COMPLETED)*

### **Test Coverage Status** ✅
- **Implementation Status**: COMPLETE (2025-09-23)
- **Total Tests**: 81 tests across 8 test files
- **Pass Rate**: 100% (81/81 passing)
- **Coverage**: All Phase 1 foundation requirements validated

### **Test Framework Architecture**
```bash
tests/
├── setup.ts                          # Global test configuration
├── vitest.config.ts                  # Test framework setup
├── phase-1/
│   ├── utils/
│   │   └── vietnamese-test-helpers.ts # Vietnamese validation utilities
│   ├── epic-1.1/                     # Development Environment (44 tests)
│   │   ├── unit/                     # Database, schema, admin creation
│   │   └── integration/              # Supabase service integration
│   ├── epic-1.2/                     # Authentication & User Management (10 tests)
│   │   └── unit/                     # Vietnamese auth integration
│   └── epic-1.3/                     # Core Application Shell (27 tests)
│       └── unit/                     # React 19, routing, UI components
```

### **Epic Test Results**
| Epic | Description | Tests | Status | Coverage |
|------|-------------|-------|--------|----------|
| 1.1  | Development Environment Setup | 44 | ✅ PASS | Infrastructure, Vietnamese locale, database |
| 1.2  | Authentication & User Management | 10 | ✅ PASS | Security, Vietnamese localization, RBAC |
| 1.3  | Core Application Shell | 27 | ✅ PASS | React 19, routing, UI foundation |

### **Vietnamese Localization Validation** ✅
- **Character Encoding**: All Vietnamese diacritical marks validated
- **Phone Numbers**: Vietnam format validation (09XXXXXXXX)
- **Business Logic**: LRP-YYYY-XXXXXX ticket code generation
- **Error Messages**: Complete Vietnamese localization tested
- **Typography**: Font rendering optimized for Vietnamese
- **Timezone**: Asia/Ho_Chi_Minh configuration validated

### **Security & Authentication Testing** ✅
- **Supabase Auth**: Complete authentication workflows tested
- **Row Level Security**: Database policy enforcement validated
- **Role Hierarchy**: shop_owner > staff > customer permissions
- **Route Protection**: Navigation guards with Vietnamese messages
- **Session Management**: Security and timeout handling

### **Technical Foundation Validation** ✅
- **React 19**: Latest features and concurrent rendering
- **TypeScript**: Strict mode with Vietnamese business types
- **TanStack Router**: File-based routing with Vietnamese parameters
- **Tailwind CSS**: Responsive design for Vietnamese content
- **Radix UI**: Accessible components with Vietnamese localization

### **Test Execution Commands**
```bash
# Run all Phase 1 tests
pnpm test tests/phase-1/

# Run specific epic tests
pnpm test tests/phase-1/epic-1.1/  # Development Environment
pnpm test tests/phase-1/epic-1.2/  # Authentication
pnpm test tests/phase-1/epic-1.3/  # Application Shell

# Run with watch mode for development
pnpm test:watch tests/phase-1/
```

### **Test Documentation**
- **Execution Plan**: `docs/qa/assessments/phase-1-test-execution-plan-20250123.md`
- **Results Report**: `docs/qa/assessments/phase-1-test-execution-results-20250923.md`
- **Epic Test Designs**: Individual test design documents in `docs/qa/assessments/`

### **Phase 2 Readiness** ✅
The comprehensive test suite confirms that Phase 1 provides a **production-ready foundation** for Phase 2 business feature development with complete Vietnamese localization support and robust security architecture.

