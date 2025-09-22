# HỆ THỐNG QUẢN LÝ SỬA CHỮA LAPTOP
## PROJECT BRIEF - VIETNAMESE LAPTOP REPAIR MANAGEMENT SYSTEM

---

## 🤖 **CRITICAL INSTRUCTIONS FOR AI AGENTS**

### **⚠️ Kong Architecture Understanding**
**MUST READ:** Kong is Supabase's internal API gateway, NOT your application's reverse proxy!

#### **✅ CORRECT Understanding:**
- Kong consolidates ALL Supabase services (auth, rest, storage, realtime) into ONE endpoint
- Your React app connects ONLY to Kong endpoint (`localhost:8000`)
- Kong handles internal routing to individual Supabase services
- Your app does NOT need its own reverse proxy/Kong instance

#### **❌ COMMON MISTAKES to AVOID:**
- Don't create a separate Kong configuration for the React app
- Don't connect directly to individual service ports (:9999, :3000, :5000, etc.)
- Don't setup reverse proxy within the Docker stack
- Don't expose internal service ports

#### **🎯 Implementation Guidelines:**
1. **Supabase Client:** Always use Kong endpoint (`localhost:8000`)
2. **Service Discovery:** Let Kong handle routing to internal services
3. **External Access:** Only expose App (:3001), Kong (:8000), Studio (:3010)
4. **Reverse Proxy:** Handle externally, outside Docker stack

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
- **Model:** Self-hosted, all-in-one Docker Compose
- **Components:** App + Supabase stack (db, auth, rest, realtime, storage, imgproxy, meta, studio, functions, kong)
- **Environment:** Single environment (không tách dev/prod)
- **Configuration:** Một file `.env` duy nhất
- **Networking:** Internal localhost với fixed ports, external reverse proxy handled outside
- **Data Persistence:** Volumes tại `supabase/volumes/*`
- **Security:** JWT secret, service role key, anon key, Postgres passwords từ environment variables

### **Environment Setup Process Requirements**
**CRITICAL:** Environment setup must be separated into distinct phases for better control and testing.

#### **Phase 1: Environment Bring-up (`make env`)**
- **Purpose:** Start all Docker services and infrastructure
- **Actions:**
  - Build and start all Docker containers
  - Initialize database schemas and tables
  - Setup Supabase services (auth, rest, storage, realtime, functions, kong)
  - Verify all services are healthy and responding
  - No user accounts or data creation
- **Result:** Clean, ready-to-use system with empty database

#### **Phase 2: Basic Initialization (`make init`)**
- **Purpose:** Create essential accounts and basic system configuration
- **Prerequisites:** `make env` completed successfully
- **Actions:**
  - Create shop owner/admin account (từ environment variables)
  - Setup initial system settings and configurations
  - Create minimal required database records
  - Verify admin account can login successfully
- **Result:** System ready for production use with admin account

#### **Phase 3: Sample Data (`make data`)**
- **Purpose:** Populate system with sample/demo data for development and testing
- **Prerequisites:** `make init` completed successfully
- **Actions:**
  - Create sample customers, parts, repair tickets
  - Add demo repair workflows and status examples
  - Generate realistic test data for development
  - Populate inventory with sample parts and pricing
- **Result:** Fully populated system ready for development and demonstration

#### **Usage Flow:**
```bash
# Complete fresh setup
make clean          # Remove everything
make env           # Bring up infrastructure
make init          # Create admin account
make data          # Add sample data (optional)

# Production setup (no sample data)
make clean
make env
make init          # Production ready

# Development with fresh data
make clean
make env
make init
make data          # Development ready with samples
```

### **Kong Architecture (CRITICAL FOR AI AGENTS)**
**⚠️ IMPORTANT:** Kong is Supabase's INTERNAL API Gateway, NOT an application reverse proxy!

#### **Kong's Role:**
- **Internal Router:** Kong aggregates ALL Supabase services through a single endpoint
- **Service Consolidation:** Routes requests to auth, rest, storage, realtime, functions internally
- **Client Interface:** Your React app connects ONLY to Kong endpoint, never directly to individual services

#### **Connection Flow:**
```
React App → Supabase Client → Kong (localhost:8000) → Internal Supabase Services
                                    ├── Auth Service (:9999)
                                    ├── PostgREST API (:3000)
                                    ├── Storage Service (:5000)
                                    ├── Realtime Service (:4000)
                                    └── Edge Functions (:8081)
```

#### **NO Internal Reverse Proxy:**
- **App does NOT use Kong:** The React app runs independently
- **External proxy responsibility:** Public SSL/domain routing handled outside Docker stack
- **Clean separation:** Internal services focus on functionality only

### **External Access Points**
- **App:** Port 3001 - React application for end users
- **Supabase API:** Port 8000 HTTP, 8443 HTTPS - Kong gateway (aggregates ALL Supabase services)
- **Studio:** Port 3010 - Database management UI (for admin access)
- **All other services:** Internal-only, accessed via Kong or not exposed

### **Environment Reset Requirements**
**CRITICAL FOR TESTING:** System must provide a complete reset mechanism for testing environment build-up process.

#### **Reset Command Requirements:**
- **Complete cleanup script** (via `make clean` or similar) that removes:
  - All Docker containers (running and stopped)
  - All Docker volumes (including named volumes and bind mounts)
  - All data directories (`supabase/volumes/*`)
  - All Docker networks created by compose
  - All Docker images (optional for deep clean)

#### **Use Cases:**
- **Fresh installation testing:** Verify environment builds correctly from scratch
- **Development reset:** Clean state for testing new configurations
- **Troubleshooting:** Complete environment reset when debugging issues
- **Documentation verification:** Ensure setup instructions are complete and accurate

#### **Implementation Example:**
```bash
# Complete environment reset and rebuild
make clean          # Remove all containers, volumes, networks, data
make env           # Fresh build and start infrastructure
make init          # Create admin account
make data          # Add sample data (optional)

# Verify clean state
docker ps -a       # Should show no project containers
docker volume ls   # Should show no project volumes
ls supabase/volumes/  # Should be empty or non-existent
```

#### **Safety Considerations:**
- **Data loss warning:** Reset command must clearly warn about permanent data loss
- **Confirmation prompt:** Require explicit confirmation before executing
- **Backup reminder:** Suggest data backup before reset (if applicable)
- **Production protection:** Clearly mark as development/testing only

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

### **Supabase Client Configuration (CRITICAL)**
```javascript
// ✅ CORRECT: App connects to Kong endpoint only
const supabaseClient = createClient(
  'http://localhost:8000',  // Kong endpoint - aggregates all services
  'your-anon-key'
)

// ❌ WRONG: Never connect directly to individual services
// Don't connect to :9999 (auth), :3000 (rest), :5000 (storage), etc.
```

### **Key Environment Variables**
```env
# Supabase Client (Frontend)
VITE_SUPABASE_URL=http://localhost:8000          # Kong endpoint
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SERVICE_ROLE_KEY=your-service-role-key      # For admin operations

# Supabase Backend Services
SUPABASE_PUBLIC_URL=http://localhost:8000        # Same as VITE_SUPABASE_URL
API_EXTERNAL_URL=http://localhost:8000           # Kong external access
```

### **Port Mapping Summary**
| Service | Internal Port | Exposed Port | Access Method | Purpose |
|---------|---------------|--------------|---------------|---------|
| **React App** | 80 | **3001** | Direct access | Your application |
| **Kong** | 8000/8443 | **8000/8443** | Direct access | Supabase API gateway |
| **Studio** | 3000 | **3010** | Direct access | Database UI (for you) |
| Auth Service | 9999 | - | Via Kong only | Internal Supabase |
| PostgREST | 3000 | - | Via Kong only | Internal Supabase |
| Storage | 5000 | - | Via Kong only | Internal Supabase |
| Realtime | 4000 | - | Via Kong only | Internal Supabase |
| ImgProxy | 5001 | - | Via Kong only | Internal Supabase |
| Meta | 8080 | - | Studio only | Internal Supabase |
| Functions | 8081 | - | Via Kong only | Internal Supabase |
| Database | 5432 | - | Internal only | Internal Supabase |

**EXPOSED FOR EXTERNAL ACCESS:** Only 3 services
- **3001** - React Application (for end users)
- **8000/8443** - Kong/Supabase API (for React app)
- **3010** - Studio (for database management)

Chi tiết đầy đủ về biến môi trường được tách riêng tại: `docs/env.md`

