# Epic 02: Core Repair Workflow Management

## Epic Goal

Xây dựng hệ thống quản lý workflow sửa chữa laptop core, bao gồm tạo phiếu, quản lý trạng thái, và theo dõi tiến độ sửa chữa cho staff.

## Epic Description

**Bối cảnh hệ thống:**
- Dashboard cho staff (authenticated users)
- Workflow 16-state cho repair tickets
- Simplified business logic phù hợp với small shop
- Ticket code format: LRP-YYYY-###### (auto-generated)

**Chi tiết Epic:**
- **Mục tiêu:** Tạo core workflow để staff quản lý tickets từ tiếp nhận đến hoàn thành
- **Phạm vi:** Ticket creation, status management, customer lookup, basic CRUD operations
- **Kết quả:** Staff có thể quản lý toàn bộ quy trình sửa chữa qua web interface

## Stories

### 1. **Story 2.1:** Ticket Creation & Customer Management
- Form tạo phiếu sửa chữa mới
- Customer lookup by phone number (auto-create if not exists)
- Device information input (laptop model, issue description)
- Initial ticket status setup (device_received)

### 2. **Story 2.2:** Ticket Status Workflow
- Status transition UI với 16 trạng thái
- Business rules cho status changes
- Validation conditions (has_issue_report, customer_approved_at, etc.)
- Timeline tracking cho mỗi status change

### 3. **Story 2.3:** Staff Dashboard & Ticket Listing
- Dashboard tổng quan với statistics
- Ticket listing với filters (status, assigned staff, date range)
- Ticket search by customer phone hoặc ticket code
- Quick actions cho common operations

### 4. **Story 2.4:** Ticket Detail Management
- Ticket detail view với full information
- Edit ticket properties (device, issue, cost, assigned staff)
- Internal comments system for staff communication
- Photo upload/management for repair documentation

## Technical Implementation

**Frontend Components:**
```typescript
// Core components cần thiết
<TicketCreateForm />
<TicketListView />
<TicketDetailView />
<StatusTransitionComponent />
<CustomerLookupWidget />
<StaffDashboard />
```

**State Management:**
- React 19 built-in state
- TanStack Router params cho navigation
- Supabase real-time subscriptions cho live updates
- Optimistic updates cho better UX

**API Integration:**
```typescript
// Key API operations
createTicket(ticketData: CreateTicketData)
updateTicketStatus(ticketId: string, newStatus: TicketStatus)
searchTickets(filters: TicketFilters)
uploadTicketPhoto(ticketId: string, file: File)
addInternalComment(ticketId: string, comment: string)
```

**Database Operations:**
- Auto-generate ticket codes với sequence
- Customer auto-creation on new phone numbers
- Staff assignment tracking
- Status transition logging

## User Experience Flow

**Workflow chính:**
1. **Tiếp nhận:** Staff tạo ticket với customer phone + device info
2. **Kiểm tra:** Update status + add photos/notes
3. **Báo giá:** Update cost estimate + wait for customer approval
4. **Sửa chữa:** Progress tracking qua status changes
5. **Hoàn thành:** Final testing + ready for pickup
6. **Thanh toán:** Mark as paid + completed

**Dashboard Features:**
- Today's tickets summary
- Pending approvals alert
- Ready for pickup list
- Staff workload distribution

## Definition of Done

- [ ] Ticket creation form hoạt động với customer auto-creation
- [ ] Status workflow transitions correctly với business rules
- [ ] Dashboard hiển thị accurate statistics
- [ ] Ticket search/filter functionality
- [ ] Photo upload/display working
- [ ] Internal comments system functional
- [ ] Real-time updates cho collaborative work
- [ ] Responsive design cho mobile staff access

## Risk Mitigation

- **Primary Risk:** Complex status workflow confusing staff
- **Mitigation:** Simple UI với clear next actions, training materials
- **Rollback Plan:** Fallback to manual status tracking nếu needed

## Success Criteria

Core repair workflow hoàn chỉnh:
1. Staff có thể tạo và quản lý tickets efficiently
2. Status workflow reflects actual repair process
3. Customer data được quản lý correctly
4. Real-time collaboration between staff members
5. Mobile-friendly interface cho on-the-go access