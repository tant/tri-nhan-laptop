# 🧪 Manual E2E Test Plan - Vietnamese Laptop Repair Shop Management System

## Development Accomplishments Review

### 🎯 **Project Overview**
Vietnamese laptop repair shop management system with full-stack architecture:
- **Frontend**: React 19 + TypeScript + TanStack Router + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Infrastructure**: Docker multi-container setup
- **Language**: Vietnamese localization throughout

### 🚀 **Completed Features**

#### **Phase 1: Core Infrastructure** ✅
- Docker-based development environment
- Supabase backend integration
- Authentication system foundation
- File-based routing with TanStack Router

#### **Phase 2: Business Logic Implementation** ✅
- **2.1**: 8 main application pages with Vietnamese UI
- **2.2**: Database integration with real-time capabilities
- **2.3**: Customer portal with ticket lookup (no login required)

#### **Phase 3: Advanced Features** ✅
- Real-time notification system
- Automated repair workflow engine
- Advanced analytics dashboard with business intelligence

### 📱 **Application Pages**
1. **Home (/)**: Customer portal for repair lookup
2. **Setup (/setup)**: System initialization
3. **Login (/login)**: Staff authentication
4. **Dashboard (/dashboard)**: Management overview
5. **Repair Tickets (/phieu)**: CRUD operations
6. **Customers (/khach-hang)**: Customer management
7. **Parts (/linh-kien)**: Inventory management
8. **Admin (/admin)**: System administration
9. **Analytics (/analytics)**: Business intelligence

---

## Pre-Test Setup

### Environment Preparation
```bash
# 1. Start development environment
make dev

# 2. Verify all services are running
make dev-logs

# 3. Access Supabase Studio for data verification
make studio  # http://localhost:3010

# 4. Main application
# http://localhost:3000
```

### Test Data Requirements
**Before testing, ensure the database has:**
- At least 3 customers with different phone numbers
- 5+ repair tickets in various statuses
- Parts inventory with some low-stock items
- Sample feedback records

---

## 🔍 Test Scenarios

### **Scenario 1: Customer Portal (No Login Required)**
**URL**: `http://localhost:3000`

#### Test 1.1: Repair Ticket Lookup by Phone
1. Navigate to home page
2. Verify Vietnamese interface loads correctly
3. Enter test data:
   - **Ticket Number**: `TNL-241201-001` (format: TNL-YYMMDD-XXX)
   - **Phone**: `0901234567`
4. Click "Tra cứu phiếu sửa chữa"
5. **Expected**: Repair details display with Vietnamese status
6. Verify status badge shows correct color/icon
7. Check cost formatting in VND currency

#### Test 1.2: Email-based Lookup
1. Switch to "Tra cứu bằng email" tab
2. Enter test data:
   - **Email**: `customer@test.com`
   - **Phone**: `0901234567`
3. Click search button
4. **Expected**: Same repair information displays
5. Verify email validation works with invalid formats

#### Test 1.3: Service History
1. After successful lookup, click "Xem lịch sử dịch vụ"
2. **Expected**: Modal opens showing customer's repair history
3. Verify pagination if more than 10 records
4. Check date formatting (Vietnamese format)
5. Close modal and verify it clears properly

#### Test 1.4: Customer Feedback
1. After successful lookup, click "Đánh giá dịch vụ"
2. **Expected**: Feedback dialog opens
3. Test star rating component (1-5 stars)
4. Enter feedback text in Vietnamese
5. Submit feedback
6. **Expected**: Success message in Vietnamese
7. Verify feedback is saved to database

### **Scenario 2: System Setup & Authentication**
**URL**: `http://localhost:3000/setup`

#### Test 2.1: Initial Setup
1. Navigate to setup page
2. **Expected**: Setup form displays in Vietnamese
3. Fill in shop information:
   - Shop name, address, phone
   - Admin user credentials
4. Submit form
5. **Expected**: Redirects to login or dashboard
6. Verify shop data is saved

#### Test 2.2: Staff Login
**URL**: `http://localhost:3000/login`
1. Enter valid staff credentials
2. **Expected**: Redirects to dashboard
3. Test invalid credentials
4. **Expected**: Error message in Vietnamese
5. Verify session persistence

### **Scenario 3: Management Dashboard**
**URL**: `http://localhost:3000/dashboard` (requires login)

#### Test 3.1: Dashboard Overview
1. Login as staff/manager
2. Navigate to dashboard
3. **Expected**: Statistics display correctly
4. Verify Vietnamese labels and currency formatting
5. Check responsive design on different screen sizes
6. Verify all metric cards show real data

#### Test 3.2: Sidebar Navigation
1. Verify sidebar shows appropriate menu items based on user role
2. Test collapsible sidebar functionality
3. Check Vietnamese menu labels
4. Verify navigation to each page works
5. Test role-based menu visibility

### **Scenario 4: Repair Ticket Management**
**URL**: `http://localhost:3000/phieu`

#### Test 4.1: Ticket List View
1. Navigate to repair tickets page
2. **Expected**: Data table loads with Vietnamese headers
3. Verify pagination controls work
4. Test search/filter functionality
5. Check status badges display correctly
6. Verify Vietnamese status translations

#### Test 4.2: Create New Ticket
1. Click "Tạo phiếu mới" button
2. **Expected**: Create form opens
3. Fill in all required fields:
   - Customer info, device details, issue description
4. Submit form
5. **Expected**: New ticket appears in list
6. Verify ticket number generation (TNL-YYMMDD-XXX format)

#### Test 4.3: Edit Existing Ticket
1. Click edit button on any ticket
2. **Expected**: Edit form pre-populated
3. Modify status and other fields
4. Save changes
5. **Expected**: Updates reflect in list view
6. Verify Vietnamese form labels

#### Test 4.4: Ticket Status Workflow
1. Select a ticket in "received" status
2. Update status to "diagnosed"
3. **Expected**: Status changes with proper Vietnamese label
4. Continue through workflow:
   - diagnosed → waiting_parts → in_progress → completed → delivered
5. Verify each status transition works correctly

### **Scenario 5: Customer Management**
**URL**: `http://localhost:3000/khach-hang`

#### Test 5.1: Customer List & Search
1. Navigate to customers page
2. **Expected**: Customer list loads with Vietnamese headers
3. Test search functionality by name/phone
4. Verify pagination works
5. Check Vietnamese column headers

#### Test 5.2: Add New Customer
1. Click "Thêm khách hàng mới"
2. Fill in customer details with Vietnamese text
3. Submit form
4. **Expected**: Customer appears in list
5. Verify phone number validation

#### Test 5.3: Customer Detail View
1. Click on any customer row
2. **Expected**: Customer details display
3. Verify repair history shows for this customer
4. Check Vietnamese formatting for addresses

### **Scenario 6: Parts Inventory**
**URL**: `http://localhost:3000/linh-kien`

#### Test 6.1: Inventory Overview
1. Navigate to parts page
2. **Expected**: Parts list with Vietnamese headers
3. Verify low stock alerts show correctly
4. Check Vietnamese currency formatting
5. Test search by part name/code

#### Test 6.2: Stock Management
1. Select a part with low stock
2. Update stock quantity
3. **Expected**: Stock level updates
4. Verify alert badge changes when stock increases
5. Test bulk stock updates

#### Test 6.3: Add New Part
1. Click "Thêm linh kiện mới"
2. Fill in part details in Vietnamese
3. Set stock levels and pricing
4. Submit form
5. **Expected**: New part appears in list

### **Scenario 7: Analytics Dashboard**
**URL**: `http://localhost:3000/analytics` (manager/owner only)

#### Test 7.1: Metrics Overview
1. Navigate to analytics page
2. **Expected**: Key metrics display with Vietnamese labels
3. Verify currency formatting (VND)
4. Check percentage calculations
5. Test date range selector

#### Test 7.2: Revenue Analytics
1. Switch to revenue tab
2. **Expected**: Charts load with data
3. Verify Vietnamese chart labels
4. Test different time periods (daily/weekly/monthly)
5. Check revenue growth calculations

#### Test 7.3: Repair Analytics
1. Switch to repair analytics tab
2. **Expected**: Status distribution chart displays
3. Verify Vietnamese status labels
4. Check repair completion metrics
5. Test technician performance data

### **Scenario 8: Notifications System**

#### Test 8.1: Browser Notifications
1. Login to any management page
2. Grant browser notification permissions
3. Create a new repair ticket from another tab/window
4. **Expected**: Browser notification appears
5. Verify notification shows Vietnamese text

#### Test 8.2: Notification Center
1. Click notification bell icon in sidebar
2. **Expected**: Notification panel opens
3. Verify unread count badge
4. Click "Mark all as read"
5. **Expected**: Badge disappears
6. Test individual notification actions

### **Scenario 9: Admin Panel**
**URL**: `http://localhost:3000/admin` (owner/manager only)

#### Test 9.1: User Management
1. Navigate to admin panel
2. **Expected**: User list displays
3. Test add new user functionality
4. Verify role assignment works
5. Test user edit/deactivate features

#### Test 9.2: System Settings
1. Switch to settings tab
2. **Expected**: System configuration options
3. Test shop information updates
4. Verify settings save correctly
5. Check Vietnamese labels throughout

---

## 🧪 Cross-Platform Testing

### **Responsive Design Testing**
1. **Desktop** (1920x1080): Test all pages for proper layout
2. **Tablet** (768x1024): Verify responsive components work
3. **Mobile** (375x667): Check mobile navigation and forms
4. **Sidebar Behavior**: Test collapsible sidebar on different sizes

### **Browser Compatibility**
- **Chrome** (primary development browser)
- **Firefox**: Verify notifications and forms work
- **Safari**: Test date/currency formatting
- **Edge**: Verify CSS Grid/Flexbox layouts

## ⚠️ Known Issues to Test For

### **Expected Behaviors**
1. **Mock Data**: Some features may show placeholder data initially
2. **Vietnamese Text**: All UI should display Vietnamese correctly
3. **Currency Format**: VND formatting should be consistent
4. **Date Format**: Vietnamese date formatting (DD/MM/YYYY)
5. **Real-time Updates**: Changes should reflect immediately in other tabs

### **Error Scenarios to Test**
1. **Network Errors**: Disable internet, verify error handling
2. **Invalid Data**: Test form validation with incorrect inputs
3. **Permission Errors**: Access restricted pages without proper role
4. **Database Errors**: Test behavior when database is unavailable

## 📊 Success Criteria

### **Functional Requirements** ✅
- [ ] All 9 pages load without errors
- [ ] Customer portal works without login
- [ ] Vietnamese localization throughout
- [ ] Real-time notifications function
- [ ] Database operations work (CRUD)
- [ ] Role-based access control works
- [ ] Analytics display real data

### **Performance Requirements** ✅
- [ ] Pages load within 3 seconds
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Real-time updates are immediate

### **User Experience** ✅
- [ ] Vietnamese text displays correctly
- [ ] Form validation provides clear feedback
- [ ] Navigation is intuitive
- [ ] Success/error messages are helpful
- [ ] Loading states are present

---

## 🚀 Test Execution Instructions

1. **Start Environment**: `make dev`
2. **Verify Services**: Check all containers are running
3. **Populate Test Data**: Use Supabase Studio to add sample data
4. **Execute Tests**: Follow scenarios 1-9 systematically
5. **Document Issues**: Note any bugs or unexpected behavior
6. **Browser Testing**: Test on multiple browsers
7. **Mobile Testing**: Use browser dev tools for responsive testing

---

## 📝 Test Results Template

### Test Execution Date: ___________
### Tested By: ___________
### Environment: Development

| Scenario | Test Case | Status | Notes |
|----------|-----------|---------|-------|
| 1.1 | Customer Portal - Phone Lookup | ⭕ Pass / ❌ Fail | |
| 1.2 | Customer Portal - Email Lookup | ⭕ Pass / ❌ Fail | |
| 1.3 | Service History | ⭕ Pass / ❌ Fail | |
| 1.4 | Customer Feedback | ⭕ Pass / ❌ Fail | |
| 2.1 | System Setup | ⭕ Pass / ❌ Fail | |
| 2.2 | Staff Login | ⭕ Pass / ❌ Fail | |
| 3.1 | Dashboard Overview | ⭕ Pass / ❌ Fail | |
| 3.2 | Sidebar Navigation | ⭕ Pass / ❌ Fail | |
| 4.1 | Ticket List View | ⭕ Pass / ❌ Fail | |
| 4.2 | Create New Ticket | ⭕ Pass / ❌ Fail | |
| 4.3 | Edit Existing Ticket | ⭕ Pass / ❌ Fail | |
| 4.4 | Ticket Status Workflow | ⭕ Pass / ❌ Fail | |
| 5.1 | Customer List & Search | ⭕ Pass / ❌ Fail | |
| 5.2 | Add New Customer | ⭕ Pass / ❌ Fail | |
| 5.3 | Customer Detail View | ⭕ Pass / ❌ Fail | |
| 6.1 | Inventory Overview | ⭕ Pass / ❌ Fail | |
| 6.2 | Stock Management | ⭕ Pass / ❌ Fail | |
| 6.3 | Add New Part | ⭕ Pass / ❌ Fail | |
| 7.1 | Metrics Overview | ⭕ Pass / ❌ Fail | |
| 7.2 | Revenue Analytics | ⭕ Pass / ❌ Fail | |
| 7.3 | Repair Analytics | ⭕ Pass / ❌ Fail | |
| 8.1 | Browser Notifications | ⭕ Pass / ❌ Fail | |
| 8.2 | Notification Center | ⭕ Pass / ❌ Fail | |
| 9.1 | User Management | ⭕ Pass / ❌ Fail | |
| 9.2 | System Settings | ⭕ Pass / ❌ Fail | |

### Overall Results
- **Total Tests**: 25
- **Passed**: ___
- **Failed**: ___
- **Success Rate**: ___%

### Critical Issues Found:
1.
2.
3.

### Recommendations:
1.
2.
3.

---

This comprehensive test plan covers all major functionality implemented in the Vietnamese laptop repair shop management system. Execute these tests to verify the system works as intended before production deployment.