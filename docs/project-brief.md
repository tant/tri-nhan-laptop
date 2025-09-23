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
pnpm run test          # Run tests
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

### **Mã phiếu (Ticket Code)**
- **Format:** LRP-YYYY-###### (VD: LRP-2025-000123)
- **Cấu trúc:** Tiền tố "LRP" (Laptop Repair) + Năm + Số thứ tự 6 chữ số
- **Tính năng:** Unique toàn hệ thống, reset theo năm, sử dụng database sequence

### **Quản lý ảnh**
- **Lưu trữ:** Storage bucket `tickets/{ticket_code}/YYYY-MM-DD/`
- **Quyền truy cập:** Private, chỉ staff xem qua signed URL
- **Tối ưu:** Hỗ trợ thumbnail/resize qua imgproxy
- **Giới hạn:** Không giới hạn số lượng/kích thước (phụ thuộc ổ đĩa)

### **Comments & Internal Notes**
- **Mục đích:** Trao đổi nội bộ giữa nhân viên
- **Truy cập:** Chỉ staff, khách hàng không xem được

---

## 📊 **HỆ THỐNG TRẠNG THÁI**

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
// App connects to self-hosted Supabase instance on same machine
const supabaseClient = createClient(
  process.env.VITE_SUPABASE_URL,      // Self-hosted: 'http://localhost:8000'
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### **Key Environment Variables**
```env
# Self-hosted Supabase Connection (Frontend)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-from-selfhosted-supabase
VITE_SERVICE_ROLE_KEY=your-service-role-key-from-selfhosted-supabase

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

**Note:** This application connects to a self-hosted Supabase instance running on the same machine. The Supabase backend infrastructure is managed via Supabase CLI (`supabase start`) but in a separate location from this repository. This repository only contains the frontend application and its configuration.

