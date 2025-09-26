# Requirements Document: /phieu-sua-chua (Repair Tickets Management)

**Vietnamese Laptop Repair Shop Management System**
**Module**: Repair Tickets Management (`/phieu-sua-chua`)
**Version**: v1.0
**Date**: 2024-09-24

---

## Implementation File References

### Route Files
- Main listing: `src/routes/phieu-sua-chua/index.tsx`
- Create new: `src/routes/phieu-sua-chua/new.tsx`
- Detail view: `src/routes/phieu-sua-chua/$id.tsx`
- Edit form: `src/routes/phieu-sua-chua/$id.edit.tsx`

### Component Files
- Main page: `src/components/pages/RepairTicketsPage.tsx`
- Create form: `src/components/tickets/CreateTicketForm.tsx`
- Detail view: `src/components/tickets/TicketDetailView.tsx`
- Edit form: `src/components/tickets/EditTicketForm.tsx`

### Database Schema
- Initial schema: `supabase/migrations/20250923070000_initial_schema.sql`
- Seed data: `supabase/seed.sql`

### Test Files
- Form tabs: `tests/e2e/create-ticket-form-tabs.test.ts`
- Device selection: `tests/e2e/create-ticket-device-selection.test.ts`
- Customer integration: `tests/e2e/create-ticket-customer-integration.test.ts`
- Submission flow: `tests/e2e/create-ticket-submission.test.ts`

---

## Page Structure Overview

The `/phieu-sua-chua` system consists of 4 main pages:

1. **`/phieu-sua-chua/`** - Main repair tickets listing page
2. **`/phieu-sua-chua/new`** - Create new repair ticket
3. **`/phieu-sua-chua/{id}`** - View repair ticket details
4. **`/phieu-sua-chua/{id}/edit`** - Edit existing repair ticket

---

## 1. Main Listing Page (`/phieu-sua-chua/`)

**Implementation**: `src/components/pages/RepairTicketsPage.tsx`
**Route**: `src/routes/phieu-sua-chua/index.tsx`

### Purpose
Central dashboard for managing all repair tickets in the Vietnamese laptop repair shop system.

### Functional Requirements

#### Core Features
- **Real-time Data Display**: Live updates via Supabase real-time subscriptions
- **Comprehensive Data Table**: Sortable, searchable table with Vietnamese headers
- **Statistics Dashboard**: Key performance indicators cards
- **Bulk Operations**: Multi-select and batch actions
- **Advanced Filtering**: Status, priority, date range, technician filters

#### Data Display Columns
| Column | Vietnamese Label | Description | Sortable | Implementation Reference |
|--------|-----------------|-------------|-----------|-------------------------|
| ticket_number | Số phiếu | Auto-generated ticket code (LRP-YYYY-XXXXXX) | ✓ | Line 212-226 in RepairTicketsPage.tsx |
| customer | Khách hàng | Customer name and phone | ✗ | Line 228-242 in RepairTicketsPage.tsx |
| device_info | Thiết bị | Device brand and model | ✗ | Line 243-257 in RepairTicketsPage.tsx |
| issue_description | Sự cố | Truncated problem description | ✗ | Line 258-266 in RepairTicketsPage.tsx |
| status | Trạng thái | Current repair status with color-coded badges | ✓ | Line 267-279 in RepairTicketsPage.tsx |
| priority | Ưu tiên | Repair priority level | ✓ | Line 280-292 in RepairTicketsPage.tsx |
| estimated_cost | Giá dự kiến | Estimated repair cost in VND | ✗ | Line 293-301 in RepairTicketsPage.tsx |
| technician | Kỹ thuật viên | Assigned technician name | ✗ | Line 302-313 in RepairTicketsPage.tsx |
| actions | Thao tác | Action buttons (View, Edit, Parts) | ✗ | Line 314-352 in RepairTicketsPage.tsx |

#### Status System (16 States)
**Implementation**: Lines 118-173 in `RepairTicketsPage.tsx`

```yaml
status_workflow:
  device_received: "Tiếp nhận thiết bị"           # outline badge
  preliminary_inspection: "Kiểm tra sơ bộ"       # secondary badge
  awaiting_repair_plan: "Chờ phương án sửa chữa" # secondary badge
  approved_for_repair: "Đã phê duyệt sửa chữa"   # default badge
  in_diagnosis: "Đang chẩn đoán"                  # default badge
  waiting_parts: "Chờ linh kiện"                  # destructive badge
  in_repair: "Đang sửa chữa"                      # default badge
  quality_testing: "Kiểm tra chất lượng"          # default badge
  ready_for_pickup: "Sẵn sàng nhận"               # default badge
  completed: "Hoàn thành"                         # default badge
  cannot_repair: "Không thể sửa"                  # destructive badge
  cancelled_by_customer: "Khách hàng hủy"         # destructive badge
  repair_failed: "Sửa chữa thất bại"              # destructive badge
  customer_no_show: "Khách không đến"             # destructive badge
  ready_for_return: "Sẵn sàng trả"                # outline badge
  abandoned: "Bỏ qua"                             # destructive badge
```

#### Statistics Cards
**Implementation**: Lines 386-436 in `RepairTicketsPage.tsx`

- **Tổng phiếu**: Total repair tickets count
- **Đang sửa chữa**: Tickets in active repair status
- **Chờ linh kiện**: Tickets waiting for parts
- **Hoàn thành hôm nay**: Tickets completed today

#### Action Buttons
**Implementation**: Lines 317-351 in `RepairTicketsPage.tsx`

1. **Parts Management** (Package icon): Open parts management modal
2. **View Details** (Eye icon): Navigate to ticket detail view
3. **Edit Ticket** (Edit icon): Navigate to ticket edit form

#### Real-time Features
**Implementation**: Lines 93-115 in `RepairTicketsPage.tsx`

- Supabase real-time subscription for live updates
- Automatic data refresh on table changes
- Channel name: "repair_tickets-changes"

---

## 2. Create New Ticket (`/phieu-sua-chua/new`)

**Implementation**: `src/components/tickets/CreateTicketForm.tsx`
**Route**: `src/routes/phieu-sua-chua/new.tsx`

### Purpose
Multi-step form wizard for creating new repair tickets with comprehensive Vietnamese customer and device data collection.

### Form Structure (4-Tab Wizard)
**Implementation**: Tab system using shadcn/ui Tabs component

#### Tab 1: Customer Information (Khách hàng)
**Implementation**: Customer form fields and validation

```yaml
required_fields:
  customer_phone:
    label: "Số điện thoại"
    validation: Vietnamese phone format (0xxxxxxxxx or 84xxxxxxxxx)
    functionality: Auto-lookup existing customers
    implementation: useCustomers hook with searchCustomers function
  customer_name:
    label: "Họ và tên"
    validation: Required, Vietnamese name format
    implementation: React Hook Form validation

optional_fields:
  customer_email:
    label: "Email"
    validation: Valid email format
    implementation: Standard email validation pattern
```

**Customer Lookup Feature**:
- Real-time search as user types phone number
- Auto-populate name and email if customer exists
- Display "Khách hàng đã tồn tại" notification
- Support for new customer registration

#### Tab 2: Device Information (Thiết bị)
**Implementation**: Device selection with Vietnamese brands

```yaml
required_fields:
  device_brand:
    label: "Thương hiệu"
    type: Dropdown/Combobox
    options: [Dell, HP, Asus, Lenovo, Acer, MSI, Apple, Samsung, LG]
    implementation: getPopularBrands() from @/lib/devices/vietnamese-brands
  device_model:
    label: "Model"
    validation: Required, free text input
    implementation: Standard text input with validation

optional_fields:
  device_serial:
    label: "Số serial"
    validation: Alphanumeric, special characters allowed
    implementation: Text input with pattern validation
  device_year:
    label: "Năm sản xuất"
    type: Number input
    range: 2000 - current_year
    implementation: Number input with min/max validation
```

**Vietnamese Brand Support**:
- Popular Vietnamese market laptop brands
- Model validation for Vietnamese laptop names
- Serial number format recognition

#### Tab 3: Problem Description (Vấn đề)
**Implementation**: Problem categorization and cost estimation

```yaml
required_fields:
  problem_description:
    label: "Mô tả vấn đề"
    type: Textarea
    validation: Minimum 10 characters, maximum 1000
    implementation: Textarea with character count validation
  problem_category:
    label: "Loại sự cố"
    type: Select
    options: [hardware, software, physical_damage, performance, other]
    implementation: Select dropdown with Vietnamese labels
  urgency_level:
    label: "Mức độ ưu tiên"
    type: Select
    options: [low, normal, high, urgent]
    implementation: Priority select with badge previews

optional_fields:
  estimated_cost:
    label: "Giá dự kiến"
    type: Number
    format: Vietnamese currency (VND)
    implementation: Number input with VND formatting
  customer_notes:
    label: "Ghi chú khách hàng"
    type: Textarea
    implementation: Optional textarea for additional notes
```

#### Tab 4: Review and Submit (Xem lại)
**Implementation**: Data review and submission

- **Review Display**: All entered data with Vietnamese formatting
- **Currency Display**: VND format (1.500.000 VNĐ)
- **Submit Actions**:
  - "Tạo phiếu sửa chữa" (Create ticket)
  - "Lưu nháp" (Save draft)
- **Loading States**: "Đang tạo..." during submission

### Validation Rules
**Implementation**: React Hook Form with Zod validation

- **Progressive Validation**: Each tab must be complete before proceeding
- **Real-time Feedback**: Immediate validation messages in Vietnamese
- **Form Persistence**: Data preserved when navigating between tabs
- **Draft Saving**: Auto-save functionality for incomplete forms

### Test Coverage
Comprehensive e2e test coverage across 4 test files:
- **Form tabs navigation**: 11 tests
- **Device selection**: 12 tests
- **Customer integration**: 11 tests
- **Submission flow**: 9 tests

---

## 3. Ticket Detail View (`/phieu-sua-chua/{id}`)

**Implementation**: `src/components/tickets/TicketDetailView.tsx`
**Route**: `src/routes/phieu-sua-chua/$id.tsx`

### Purpose
Comprehensive view of individual repair ticket with full customer, device, and repair history information.

### Information Sections

#### Ticket Header
**Implementation**: Status badges and ticket metadata display

- **Ticket Code**: Auto-generated format (LRP-YYYY-XXXXXX)
- **Status Badge**: Color-coded current status (implementation: getStatusBadge function)
- **Creation Date**: Vietnamese date format
- **Priority Badge**: Visual priority indicator

#### Customer Information Card
**Implementation**: Customer data display section

```yaml
customer_details:
  - full_name: "Họ và tên"
  - phone: "Số điện thoại"
  - email: "Email"
  - address: "Địa chỉ"
  - notes: "Ghi chú khách hàng"
```

#### Device Information Card
**Implementation**: Device specifications display

```yaml
device_details:
  - brand: "Thương hiệu"
  - model: "Model"
  - serial_number: "Số serial"
  - year: "Năm sản xuất"
  - initial_condition: "Tình trạng ban đầu"
```

#### Problem & Repair Details
**Implementation**: Repair workflow information

```yaml
repair_details:
  - issue_description: "Mô tả sự cố"
  - problem_category: "Loại sự cố"
  - urgency_level: "Mức độ ưu tiên"
  - assigned_technician: "Kỹ thuật viên"
  - estimated_completion: "Dự kiến hoàn thành"
```

#### Financial Information
**Implementation**: Cost and payment tracking

```yaml
financial_details:
  - estimated_cost: "Giá dự kiến"
  - total_cost: "Tổng chi phí"
  - deposit_amount: "Tiền đặt cọc"
  - payment_status: "Tình trạng thanh toán"
  - payment_method: "Phương thức thanh toán"
```

#### Action Buttons
**Implementation**: Navigation and workflow actions

- **Edit Ticket**: Navigate to edit form
- **Print Receipt**: Generate Vietnamese receipt
- **Update Status**: Status transition workflow
- **View Timeline**: Repair history timeline

---

## 4. Edit Ticket Form (`/phieu-sua-chua/{id}/edit`)

**Implementation**: `src/components/tickets/EditTicketForm.tsx`
**Route**: `src/routes/phieu-sua-chua/$id.edit.tsx`

### Purpose
Modify existing repair ticket information with proper validation and audit trails.

### Editable Sections
- **Customer Information**: Update contact details
- **Device Information**: Modify device specifications
- **Problem Description**: Update issue details and category
- **Repair Details**: Change assigned technician, status, costs
- **Notes**: Add internal technician notes

### Business Rules
- **Status Restrictions**: Some status changes require specific permissions
- **Audit Trail**: All changes logged with timestamp and user
- **Cost Validation**: Ensure costs don't exceed predefined limits
- **Required Approvals**: Major changes may require manager approval

---

## Technical Implementation Details

### Database Schema
**Implementation**: `supabase/migrations/20250923070000_initial_schema.sql`

```sql
-- Core table structure (lines 76-120)
repair_tickets (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  ticket_code text unique not null,
  customer_phone text not null references customers(phone),
  device_info jsonb not null default '{}',
  issue_description text not null,
  customer_description text not null,
  priority repair_priority default 'normal' not null,
  status repair_status default 'device_received' not null,
  assigned_technician_id uuid references user_profiles(id),
  parts_used jsonb default '[]',
  estimated_completion timestamp with time zone,
  total_cost numeric(10,2),
  deposit_amount numeric(10,2),
  is_paid boolean default false not null,
  paid_at timestamp with time zone,
  payment_method payment_method,
  receipt_note text,
  warranty_until timestamp with time zone,
  -- ... additional audit and tracking fields
)
```

### Real-time Features
**Implementation**: Supabase real-time subscriptions

- **Live Status Updates**: Real-time table change subscriptions
- **Collaborative Editing**: Multi-user edit conflict resolution
- **Push Notifications**: Status change notifications

### Vietnamese Localization
**Implementation**: Vietnamese formatting throughout

- **Currency Format**: VND with proper thousand separators (formatVND helper)
- **Date Format**: dd/mm/yyyy Vietnamese standard
- **Status Labels**: All in Vietnamese business terminology
- **Validation Messages**: Vietnamese error messages

### Performance Considerations
- **Pagination**: Large dataset handling with TanStack Table
- **Search Optimization**: Full-text search on customer names and descriptions
- **Caching**: Strategic caching of frequently accessed data
- **Mobile Responsive**: Optimized for Vietnamese mobile users

### Hooks and State Management
**Implementation**: Custom React hooks for data management

- **useRepairTickets**: Repair ticket CRUD operations
- **useCustomers**: Customer lookup and management
- **useAuth**: Authentication and authorization
- **useOptimisticMutation**: Optimistic UI updates

---

## Test Coverage Summary

### E2E Test Files
1. **create-ticket-form-tabs.test.ts**: 11 tests for multi-tab navigation
2. **create-ticket-device-selection.test.ts**: 12 tests for device selection
3. **create-ticket-customer-integration.test.ts**: 11 tests for customer integration
4. **create-ticket-submission.test.ts**: 9 tests for submission flow

**Total**: 43 comprehensive e2e tests covering all user workflows

### Test Scenarios Covered
- ✅ Vietnamese phone number validation
- ✅ Customer lookup and auto-population
- ✅ Device brand and model selection
- ✅ Problem description validation
- ✅ Form data persistence across tabs
- ✅ Currency formatting (VND)
- ✅ Draft saving functionality
- ✅ Error handling and recovery
- ✅ Loading states and UI feedback
- ✅ Complete ticket creation workflow

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1.0 | 2024-09-24 | Initial requirements documentation | Product Owner |

---

## Notes for Future Development

1. **Status Workflow**: Consider implementing configurable workflow states
2. **Parts Integration**: Expand parts management integration
3. **Notifications**: Add real-time notification system
4. **Mobile App**: Consider mobile app for field technicians
5. **Reporting**: Add advanced analytics and reporting features
6. **Integration**: Consider third-party service integrations

---

*This document serves as the definitive requirements reference for the `/phieu-sua-chua` system. All implementation details reference actual code files for traceability and maintenance.*