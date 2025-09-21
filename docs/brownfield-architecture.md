# Hệ thống Quản lý Sửa chữa Laptop - Tài liệu Kiến trúc Brownfield

## Giới thiệu

Tài liệu này ghi lại TRẠNG THÁI HIỆN TẠI của hệ thống quản lý sửa chữa laptop, bao gồm technical debt, các giải pháp tạm thời và các pattern thực tế. Tài liệu này phục vụ như tài liệu tham khảo cho các AI agent làm việc trên các cải tiến.

### Phạm vi Tài liệu

Tài liệu toàn diện về toàn bộ hệ thống - phân tích trạng thái hiện tại cho việc lập kế hoạch phát triển tương lai.

### Nhật ký Thay đổi

| Ngày   | Phiên bản | Mô tả                 | Tác giả    |
| ------ | --------- | --------------------- | ---------- |
| 2025-01-21 | 1.0       | Phân tích brownfield ban đầu | BMad Master |

## Tham khảo Nhanh - Files Chính và Entry Points

### Files Quan trọng để Hiểu Hệ thống

- **Entry Point Chính**: `src/main.tsx` - Khởi tạo React app với TanStack Router
- **Layout Gốc**: `src/routes/__root.tsx` - Layout sidebar có điều kiện cho các route đã xác thực
- **Logic Business Chính**: `src/components/pages/` - Tất cả page components với logic business tiếng Việt
- **Database Schema**: `supabase/repair_shop_schema.sql` - Schema PostgreSQL hoàn chỉnh với RLS
- **Cấu hình Environment**: `.env` - Tất cả cấu hình service Supabase
- **Docker Orchestration**: `docker-compose.dev.yml` - Environment development đầy đủ
- **Build System**: `Makefile` - Interface command toàn diện

### Routes và Navigation

- `/` - Portal khách hàng (`src/routes/index.tsx`)
- `/dashboard` - Tổng quan quản lý (`src/routes/dashboard.tsx`)
- `/phieu` - Phiếu sửa chữa (`src/routes/phieu.tsx`)
- `/linh-kien` - Kho linh kiện (`src/routes/linh-kien.tsx`)
- `/khach-hang` - Quản lý khách hàng (`src/routes/khach-hang.tsx`)
- `/admin` - Quản trị hệ thống (`src/routes/admin.tsx`)
- `/login` - Đăng nhập nhân viên (`src/routes/login.tsx`)
- `/setup` - Thiết lập hệ thống ban đầu (`src/routes/setup.tsx`)

## Kiến trúc Tổng quan

### Tóm tắt Kỹ thuật

Đây là một ứng dụng React full-stack hiện đại với infrastructure backend Supabase hoàn chỉnh chạy trong Docker containers. Ứng dụng được thiết kế đặc biệt cho các cửa hàng sửa chữa laptop Việt Nam với localization hoàn chỉnh và các workflow kinh doanh cụ thể.

### Tech Stack Thực tế (từ package.json)

| Danh mục  | Công nghệ | Phiên bản | Ghi chú                      |
| --------- | --------- | --------- | ---------------------------- |
| Frontend | React | 19.0.0 | Phiên bản mới nhất với concurrent features |
| Runtime   | Node.js    | 20-alpine | Containerized với Docker |
| Build Tool | Vite | 6.3.5 | Build nhanh và HMR |
| Routing | TanStack Router | 1.130.2 | File-based routing với type safety |
| UI Framework | shadcn/ui | Latest | Radix UI components với Tailwind |
| Styling | Tailwind CSS | 4.0.6 | Utility-first CSS framework |
| Backend | Supabase | 2.57.4 | PostgreSQL BaaS hoàn chỉnh |
| Database | PostgreSQL | 15.8.1 | Supabase managed với extensions |
| Package Manager | pnpm | Latest | Quản lý dependency nhanh, hiệu quả |
| Development | Docker Compose | Latest | Orchestration multi-service |

### Kiểm tra Cấu trúc Repository

- **Loại**: Monorepo với cấu hình frontend và backend
- **Package Manager**: pnpm (được cấu hình rõ ràng trong docker commands)
- **Đáng chú ý**: Development hoàn toàn dựa trên Docker với khởi tạo service tự động

## Cấu trúc Source Tree và Tổ chức Module

### Cấu trúc Project (Thực tế)

```text
project-root/
├── src/
│   ├── components/
│   │   ├── pages/           # Pages logic business tiếng Việt
│   │   ├── ui/              # Thư viện component shadcn/ui
│   │   └── *.tsx           # Components chia sẻ (app-sidebar, nav-*)
│   ├── routes/              # File-based routing (TanStack Router)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities và type definitions
│   ├── main.tsx            # Entry point ứng dụng React
│   └── styles.css          # Global Tailwind imports
├── supabase/               # Cấu hình Database và backend
│   ├── volumes/            # Docker volume mounts
│   ├── repair_shop_schema.sql # Schema database hoàn chỉnh
│   └── init-passwords.sql   # Khởi tạo password service
├── docs/                   # Tài liệu kiến trúc hiện có
│   ├── architecture/       # Tech stack, source tree, coding standards
│   └── review/             # Phân tích cập nhật (để so sánh)
├── docker-compose.dev.yml  # Environment development (9 services)
├── docker-compose.yml      # Environment production
├── Makefile               # Interface command toàn diện
├── package.json           # Dependencies React app
└── CLAUDE.md              # Hướng dẫn development và instructions quan trọng
```

### Modules Chính và Mục đích

- **Page Components**: `src/components/pages/` - Implementation workflow business tiếng Việt hoàn chỉnh
- **UI Components**: `src/components/ui/` - Components shadcn/ui với styling Tailwind
- **Navigation**: `src/routes/__root.tsx` - Sidebar có điều kiện cho authenticated vs public routes
- **Database**: `supabase/repair_shop_schema.sql` - Schema hoàn chỉnh với RLS, triggers và dữ liệu mẫu tiếng Việt
- **Service Orchestration**: `docker-compose.dev.yml` - Setup Docker 9-service với khởi tạo tự động

## Data Models và APIs

### Data Models

Database schema toàn diện và sẵn sàng cho production:

**Core Tables** (xem `supabase/repair_shop_schema.sql`):
- **user_profiles**: Quản lý nhân viên với quyền dựa trên vai trò
- **customers**: Thông tin khách hàng với dữ liệu mẫu tiếng Việt
- **repairs**: Workflow sửa chữa hoàn chỉnh với theo dõi trạng thái
- **repair_status_logs**: Audit trail cho tất cả thay đổi trạng thái
- **parts**: Quản lý kho với cảnh báo mức tồn kho
- **repair_parts**: Junction table cho linh kiện sử dụng trong sửa chữa

**Enums**:
- `repair_status`: 8 giá trị trạng thái từ 'received' đến 'delivered'
- `repair_priority`: 4 mức độ ưu tiên
- `user_role`: 4 loại vai trò (shop_owner, manager, technician, staff)

### Thông số kỹ thuật API

- **Auto-generated REST API**: PostgREST tạo endpoints từ database schema
- **Real-time subscriptions**: Supabase Realtime cho cập nhật trực tiếp
- **Authentication**: Supabase Auth với tạo user profile tự động
- **File storage**: Supabase Storage cho hình ảnh/tài liệu sửa chữa
- **API Gateway**: Kong proxy trên port 8000/8443

## Technical Debt và Vấn đề Đã biết

### Thiếu sót Implementation Hiện tại

1. **Tích hợp Authentication**: Pages tồn tại nhưng chưa có Supabase Auth integration
   - Login page render nhưng không có logic authentication thực tế
   - Protected routes chưa được enforce
   - User context chưa được implement

2. **Kết nối Database**: Supabase client chưa được khởi tạo trong frontend
   - Không có database queries được implement trong components
   - Dữ liệu mock được sử dụng trong tất cả pages (arrays hard-coded)
   - Real-time subscriptions chưa được kết nối

3. **File Upload**: Storage integration chưa được implement
   - Database schema hỗ trợ image arrays
   - Không có file upload components hoặc logic

4. **Form Validation**: React Hook Form + Zod dependency có mặt nhưng chưa được sử dụng
   - Tất cả pages hiển thị dữ liệu tĩnh
   - Không có logic form submission
   - Không có validation schemas được định nghĩa

### Hệ thống Hoạt động

1. **Docker Infrastructure**: Hoàn toàn tự động và hoạt động
   - Environment development 9-service
   - Service fixes tự động qua `fix-supabase-services.sh`
   - Khởi tạo database hoàn chỉnh
   - Service health checks và dependencies

2. **Kiến trúc Frontend**: Foundation vững chắc
   - File-based routing hoạt động đúng
   - Layout sidebar có điều kiện được implement
   - Localization tiếng Việt xuyên suốt
   - shadcn/ui components được cấu hình đúng

3. **Database Schema**: Sẵn sàng production
   - RLS policies hoàn chỉnh
   - Triggers tự động cho status logging
   - Tạo user profile khi signup
   - Indexing toàn diện

### Workarounds và Gotchas

- **Cấu hình Port**: Development sử dụng port 5433 cho database để tránh conflicts
- **Khởi tạo Service**: `make dev` tự động chạy service fixes - đừng chạy thủ công
- **Vấn đề Permission**: Database volumes có thể cần `make fix-permissions` trên Linux/WSL
- **Dữ liệu Mock**: Tất cả components sử dụng dữ liệu mock tiếng Việt, chưa kết nối database

## Integration Points và External Dependencies

### External Services

| Service  | Mục đích  | Loại Integration | File Cấu hình |
| -------- | --------- | ---------------- | -------------- |
| Supabase | Backend hoàn chỉnh | Docker services | `docker-compose.dev.yml` |
| PostgreSQL | Database | Container | `supabase/volumes/db/` |
| Kong | API Gateway | Container | `supabase/volumes/api/kong-dev.yml` |

### Internal Integration Points

- **Frontend ↔ Backend**: Chưa được kết nối (thiếu implementation)
- **Authentication**: Supabase Auth được cấu hình nhưng chưa integrated
- **Real-time**: Service chạy nhưng không có subscriptions được implement
- **File Storage**: Service có sẵn nhưng không có upload components

### Service Dependencies

Các Docker services có dependency tree phức tạp:
```
app-dev (React) → kong-dev (API Gateway)
kong-dev → auth-dev, rest-dev, storage-dev, functions-dev
auth-dev, rest-dev → db-dev (PostgreSQL)
storage-dev → rest-dev, imgproxy-dev
studio-dev → meta-dev → db-dev
```

## Development và Deployment

### Thiết lập Local Development

**Setup Hoạt động** (đã test và tự động):
```bash
# Environment development đầy đủ
make dev                # Khởi động tất cả 9 services + React app
make backend-only       # Chỉ Supabase services (cho React local)
pnpm dev               # Local React development server
```

**Quản lý Service**:
```bash
make studio            # Database UI tại http://localhost:3010
make dev-logs          # Monitor tất cả service logs
make status            # Kiểm tra service health
```

### Quy trình Build và Deployment

- **Development**: `docker-compose.dev.yml` với hot reload
- **Production**: `docker-compose.yml` với nginx-served build
- **Build Command**: `pnpm build && tsc` (bao gồm TypeScript compilation)
- **Environment**: `.env` cho tất cả services

### Cấu hình Environment

**Ports Hoạt động**:
- React App: 3000 (Docker) hoặc 5173 (local)
- Supabase Studio: 3010
- API Gateway: 8000/8443
- Database: 5433 (dev) / 5432 (prod)

## Thực trạng Testing

### Test Coverage Hiện tại

- **Unit Tests**: Vitest + Testing Library được cấu hình nhưng chưa có tests nào được viết
- **Integration Tests**: Không có tests được implement
- **E2E Tests**: Không có framework được cấu hình
- **Manual Testing**: Phương pháp chính (testing UI tiếng Việt)

### Chạy Tests

```bash
pnpm test              # Vitest (hiện tại pass với không có tests)
pnpm lint              # Biome linting
pnpm format            # Biome formatting
pnpm check             # Combined lint + format
```

## Trạng thái Hiện tại vs Phân tích Requirements

### Features Đã implement ✅

1. **Docker Infrastructure**: Environment development 9-service hoàn chỉnh
2. **Cấu trúc Frontend**: File-based routing, UI tiếng Việt, shadcn/ui components
3. **Database Schema**: Sẵn sàng production với RLS, triggers, sample data
4. **Page Components**: Tất cả 8 business pages với localization tiếng Việt
5. **Development Workflow**: Commands Makefile toàn diện
6. **UI Foundation**: Responsive design, sidebar navigation, component library

### Thiếu sót Implementation ❌

1. **Backend Integration**: Không có Supabase client initialization hoặc database queries
2. **Authentication**: Không có functionality login/logout thực tế
3. **Data Management**: Tất cả components sử dụng mock data thay vì database
4. **Form Handling**: Không có form submission hoặc validation implementation
5. **File Upload**: Không có image/document upload cho repairs
6. **Real-time Updates**: Không có đồng bộ dữ liệu trực tiếp
7. **Role-based Access**: Không có enforcement quyền trong UI
8. **Inventory Management**: Không có monitoring mức tồn kho hoặc alerts

### Điểm Foundation Kỹ thuật: 8/10
- Infrastructure Docker và development xuất sắc
- Kiến trúc frontend vững chắc và localization tiếng Việt
- Database schema sẵn sàng production

### Điểm Implementation Feature: 2/10
- Pages tồn tại nhưng thiếu kết nối backend
- Không có implementation logic business
- Chủ yếu là prototype UI ở giai đoạn này

## Phụ lục - Commands và Scripts Hữu ích

### Commands Thường sử dụng

```bash
# Development workflow
make dev               # Khởi động environment development đầy đủ
make backend-only      # Chỉ backend services (cho local React dev)
make dev-down          # Dừng development environment
make studio           # Mở database UI

# Quản lý Database
make db-reset         # NGUY HIỂM: Xóa tất cả dữ liệu
make db-backup-dev    # Backup development database
make fix-permissions  # Sửa Docker volume permissions

# Frontend development
pnpm install          # Cài đặt dependencies
pnpm dev             # Local development server
pnpm build           # Production build
pnpm check           # Lint và format
```

### Debugging và Troubleshooting

- **Service Logs**: `make dev-logs` - Monitor tất cả services
- **Service Status**: `make status` - Kiểm tra container health
- **Service Issues**: Tự động sửa bởi `make dev` qua `fix-supabase-services.sh`
- **Port Conflicts**: Sử dụng `make dev-down` để dừng tất cả services
- **Database UI**: Luôn có sẵn tại http://localhost:3010

### Các Bước Implementation Tiếp theo

Dựa trên phân tích brownfield này, các bước tiếp theo ngay lập tức nên là:

1. **Khởi tạo Supabase Client**: Thêm cấu hình Supabase client vào React app
2. **Implement Authentication**: Kết nối login page với Supabase Auth
3. **Thay thế Mock Data**: Kết nối tất cả page components với database queries thực
4. **Thêm Form Handling**: Implement CRUD operations cho tất cả business entities
5. **File Upload Integration**: Thêm image upload cho repair tickets
6. **Real-time Subscriptions**: Implement cập nhật trực tiếp cho thay đổi repair status
7. **Role-based UI**: Enforce quyền dựa trên user roles
8. **Testing Implementation**: Thêm unit và integration tests

Foundation infrastructure xuất sắc - trọng tâm nên là kết nối UI hiện có với backend services.