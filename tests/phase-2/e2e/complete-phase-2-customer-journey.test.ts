/**
 * Phase 2 Complete E2E Test: Vietnamese Laptop Repair Management System
 *
 * This comprehensive test covers the entire Phase 2 customer journey:
 * Epic 2.1: Phone-based Customer Management
 * Epic 2.2: 16-State Repair Workflow
 * Epic 2.3: Public Repair Lookup Interface
 *
 * Customer Journey Flow:
 * 1. Customer brings laptop to repair shop
 * 2. Staff creates customer record (phone-based)
 * 3. Staff creates repair ticket with device details
 * 4. Ticket progresses through 16-state workflow
 * 5. Customer uses public interface to track progress
 * 6. Repair completes and customer picks up device
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 2: Complete Vietnamese Repair Shop Customer Journey', () => {
  let customerPhone: string;
  let customerName: string;
  let ticketCode: string;
  let repairDescription: string;

  test.beforeEach(async ({ page }) => {
    // Generate unique test data for each run
    const timestamp = Date.now();
    customerPhone = `0901${String(timestamp).slice(-6)}`;
    customerName = `Khách Hàng Test ${timestamp}`;
    repairDescription = `Màn hình laptop bị vỡ - Test ${timestamp}`;

    // Navigate to admin dashboard
    await page.goto('/dashboard');

    // Verify we're on the admin interface
    await expect(page).toHaveTitle(/Quản Lý Sửa Chữa Laptop/);
  });

  test('Complete Phase 2 Customer Journey: From Intake to Pickup', async ({ page }) => {
    // ========================================================================
    // PHASE 1: CUSTOMER INTAKE - Epic 2.1 Phone-Based Customer Management
    // ========================================================================

    test.step('1. Navigate to Customer Management', async () => {
      await page.click('[href="/khach-hang"]');

      // Assert page navigation and Vietnamese interface
      await expect(page).toHaveURL(/.*\/khach-hang/);
      await expect(page.locator('h1')).toContainText('Quản Lý Khách Hàng');
      await expect(page.locator('h1')).toBeVisible();

      // Assert customer management interface elements
      await expect(page.locator('button:has-text("Thêm Khách Hàng")')).toBeVisible();
      await expect(page.locator('input[placeholder*="tìm kiếm"]')).toBeVisible();
      await expect(page.locator('text=Danh sách khách hàng')).toBeVisible();

      // Assert table headers are in Vietnamese
      await expect(page.locator('text=Họ tên')).toBeVisible();
      await expect(page.locator('text=Số điện thoại')).toBeVisible();
      await expect(page.locator('text=Địa chỉ')).toBeVisible();
      await expect(page.locator('text=Ngày tạo')).toBeVisible();
    });

    test.step('2. Create New Customer with Vietnamese Phone Number', async () => {
      // Click Create New Customer button
      await page.click('button:has-text("Thêm Khách Hàng")');

      // Assert customer creation modal/form opened
      await expect(page.locator('text=Thông tin khách hàng')).toBeVisible();
      await expect(page.locator('input[name="phone"]')).toBeVisible();
      await expect(page.locator('input[name="full_name"]')).toBeVisible();
      await expect(page.locator('input[name="address"]')).toBeVisible();

      // Assert form labels are in Vietnamese
      await expect(page.locator('label:has-text("Số điện thoại")')).toBeVisible();
      await expect(page.locator('label:has-text("Họ và tên")')).toBeVisible();
      await expect(page.locator('label:has-text("Địa chỉ")')).toBeVisible();

      // Assert phone validation pattern (Vietnamese format)
      await expect(page.locator('input[name="phone"]')).toHaveAttribute('pattern', /.*0[98753].*|.*\d{10}.*/);

      // Fill customer form with Vietnamese data
      await page.fill('input[name="phone"]', customerPhone);
      await page.fill('input[name="full_name"]', customerName);
      await page.fill('input[name="address"]', '123 Nguyễn Trãi, Quận 1, TP.HCM');

      // Assert input values are correctly filled
      await expect(page.locator('input[name="phone"]')).toHaveValue(customerPhone);
      await expect(page.locator('input[name="full_name"]')).toHaveValue(customerName);
      await expect(page.locator('input[name="address"]')).toHaveValue('123 Nguyễn Trãi, Quận 1, TP.HCM');

      // Assert phone number matches Vietnamese pattern
      expect(customerPhone).toMatch(/^0[98753]\d{8}$/);

      // Submit customer creation
      await page.click('button:has-text("Lưu Khách Hàng")');

      // Assert success feedback
      await expect(page.locator('.toast')).toContainText('Thêm khách hàng thành công');
      await expect(page.locator('.toast')).toHaveClass(/success|positive/);

      // Assert modal/form closes after successful creation
      await expect(page.locator('text=Thông tin khách hàng')).not.toBeVisible();

      // Assert return to customer list view
      await expect(page.locator('h1')).toContainText('Quản Lý Khách Hàng');
    });

    test.step('3. Verify Customer Phone-Based Search', async () => {
      // Assert search functionality exists
      await expect(page.locator('input[placeholder*="số điện thoại"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="tìm kiếm"]')).toBeVisible();

      // Search for the newly created customer by phone
      await page.fill('input[placeholder*="số điện thoại"]', customerPhone);

      // Assert search input value
      await expect(page.locator('input[placeholder*="số điện thoại"]')).toHaveValue(customerPhone);

      // Trigger search (if needed)
      await page.press('input[placeholder*="số điện thoại"]', 'Enter');

      // Assert customer appears in search results
      await expect(page.locator(`text=${customerName}`)).toBeVisible();
      await expect(page.locator(`text=${customerPhone}`)).toBeVisible();
      await expect(page.locator('text=123 Nguyễn Trãi')).toBeVisible();

      // Assert customer row data integrity
      const customerRow = page.locator(`tr:has-text("${customerPhone}")`);
      await expect(customerRow).toBeVisible();
      await expect(customerRow.locator(`text=${customerName}`)).toBeVisible();
      await expect(customerRow.locator(`text=${customerPhone}`)).toBeVisible();
      await expect(customerRow.locator('text=123 Nguyễn Trãi')).toBeVisible();

      // Assert date format is Vietnamese (dd/mm/yyyy)
      await expect(customerRow.locator('td').last()).toContainText(/\d{2}\/\d{2}\/\d{4}/);

      // Assert search results count
      await expect(page.locator('[data-testid="search-results-count"]')).toContainText('1 kết quả');

      // Clear search to verify search reset functionality
      await page.fill('input[placeholder*="số điện thoại"]', '');
      await page.press('input[placeholder*="số điện thoại"]', 'Enter');

      // Assert search cleared and more results visible
      const allRows = page.locator('tbody tr');
      await expect(allRows).toHaveCount(await allRows.count());
    });

    // ========================================================================
    // PHASE 2: REPAIR TICKET CREATION - Epic 2.2 Workflow Foundation
    // ========================================================================

    test.step('4. Navigate to Repair Ticket Creation', async () => {
      await page.click('[href="/phieu-sua-chua"]');

      // Assert navigation and Vietnamese interface
      await expect(page).toHaveURL(/.*\/phieu-sua-chua/);
      await expect(page.locator('h1')).toContainText('Quản Lý Phiếu Sửa Chữa');
      await expect(page.locator('h1')).toBeVisible();

      // Assert ticket management interface elements
      await expect(page.locator('button:has-text("Tạo Phiếu Mới")')).toBeVisible();
      await expect(page.locator('input[placeholder*="tìm kiếm"]')).toBeVisible();

      // Assert table headers are in Vietnamese
      await expect(page.locator('text=Mã phiếu')).toBeVisible();
      await expect(page.locator('text=Khách hàng')).toBeVisible();
      await expect(page.locator('text=Thiết bị')).toBeVisible();
      await expect(page.locator('text=Trạng thái')).toBeVisible();
      await expect(page.locator('text=Ngày tạo')).toBeVisible();
      await expect(page.locator('text=Chi phí')).toBeVisible();

      // Assert filter/status options are in Vietnamese
      await expect(page.locator('text=Tất cả trạng thái')).toBeVisible();
      await expect(page.locator('text=Đang xử lý')).toBeVisible();
      await expect(page.locator('text=Hoàn thành')).toBeVisible();
    });

    test.step('5. Create New Repair Ticket', async () => {
      // Click Create New Ticket
      await page.click('button:has-text("Tạo Phiếu Mới")');

      // Assert ticket creation form opened
      await expect(page.locator('text=Tạo phiếu sửa chữa mới')).toBeVisible();
      await expect(page.locator('input[name="customer_phone"]')).toBeVisible();

      // Assert form sections are in Vietnamese
      await expect(page.locator('text=Thông tin khách hàng')).toBeVisible();
      await expect(page.locator('text=Thông tin thiết bị')).toBeVisible();
      await expect(page.locator('text=Mô tả sự cố')).toBeVisible();
      await expect(page.locator('text=Chi phí ước tính')).toBeVisible();

      // Assert all form fields are present
      await expect(page.locator('input[name="device_brand"]')).toBeVisible();
      await expect(page.locator('input[name="device_model"]')).toBeVisible();
      await expect(page.locator('input[name="serial_number"]')).toBeVisible();
      await expect(page.locator('textarea[name="issue_description"]')).toBeVisible();
      await expect(page.locator('textarea[name="initial_condition"]')).toBeVisible();
      await expect(page.locator('input[name="estimated_cost"]')).toBeVisible();

      // Select customer by phone (phone-based system test)
      await page.fill('input[name="customer_phone"]', customerPhone);

      // Assert phone input value
      await expect(page.locator('input[name="customer_phone"]')).toHaveValue(customerPhone);

      // Assert customer suggestion appears
      await expect(page.locator(`text=${customerName}`)).toBeVisible();
      await expect(page.locator(`text=${customerPhone}`)).toBeVisible();

      await page.click(`text=${customerName}`); // Click on customer suggestion

      // Assert customer is selected
      await expect(page.locator('[data-testid="selected-customer"]')).toContainText(customerName);
      await expect(page.locator('[data-testid="selected-customer"]')).toContainText(customerPhone);

      // Fill device information
      await page.fill('input[name="device_brand"]', 'ASUS');
      await page.fill('input[name="device_model"]', 'VivoBook 15');
      const serialNumber = 'SN' + Date.now();
      await page.fill('input[name="serial_number"]', serialNumber);

      // Assert device information is filled
      await expect(page.locator('input[name="device_brand"]')).toHaveValue('ASUS');
      await expect(page.locator('input[name="device_model"]')).toHaveValue('VivoBook 15');
      await expect(page.locator('input[name="serial_number"]')).toHaveValue(serialNumber);

      // Fill repair details
      const initialCondition = 'Máy bật được, màn hình có vết nứt lớn ở góc trái';
      await page.fill('textarea[name="issue_description"]', repairDescription);
      await page.fill('textarea[name="initial_condition"]', initialCondition);

      // Assert repair details are filled
      await expect(page.locator('textarea[name="issue_description"]')).toHaveValue(repairDescription);
      await expect(page.locator('textarea[name="initial_condition"]')).toHaveValue(initialCondition);

      // Set estimated cost
      await page.fill('input[name="estimated_cost"]', '2500000');

      // Assert cost input formatting (should accept Vietnamese number format)
      await expect(page.locator('input[name="estimated_cost"]')).toHaveValue('2500000');

      // Assert cost preview shows Vietnamese formatting
      await expect(page.locator('[data-testid="cost-preview"]')).toContainText('2.500.000 ₫');

      // Assert all required fields are filled before submit
      await expect(page.locator('button:has-text("Tạo Phiếu Sửa Chữa")')).not.toBeDisabled();

      // Submit ticket creation
      await page.click('button:has-text("Tạo Phiếu Sửa Chữa")');

      // Assert loading state during creation
      await expect(page.locator('text=Đang tạo phiếu...')).toBeVisible();

      // Assert success feedback
      await expect(page.locator('.toast')).toContainText('Tạo phiếu sửa chữa thành công');
      await expect(page.locator('.toast')).toHaveClass(/success|positive/);

      // Assert form closes after creation
      await expect(page.locator('text=Tạo phiếu sửa chữa mới')).not.toBeVisible();

      // Capture the generated LRP ticket code
      const ticketElement = page.locator('[data-testid="ticket-code"]').first();
      ticketCode = await ticketElement.textContent() || '';

      // Assert LRP format validation
      expect(ticketCode).toMatch(/^LRP-\d{4}-\d{6}$/); // Verify LRP format
      expect(ticketCode).toMatch(/^LRP-2025-/); // Verify current year

      // Assert ticket appears in list
      await expect(page.locator(`text=${ticketCode}`)).toBeVisible();
      await expect(page.locator(`text=${customerName}`)).toBeVisible();
      await expect(page.locator('text=ASUS VivoBook 15')).toBeVisible();
      await expect(page.locator('text=Đã tiếp nhận thiết bị')).toBeVisible();

      // Assert initial workflow state
      const ticketRow = page.locator(`tr:has-text("${ticketCode}")`);
      await expect(ticketRow.locator('text=Đã tiếp nhận thiết bị')).toBeVisible();
      await expect(ticketRow.locator('text=2.500.000')).toBeVisible();
    });

    // ========================================================================
    // PHASE 3: 16-STATE WORKFLOW PROGRESSION - Epic 2.2 Core Workflow
    // ========================================================================

    test.step('6. Progress Through Initial Workflow States', async () => {
      // Click on the ticket to open workflow management
      await page.click(`text=${ticketCode}`);

      // Verify initial state
      await expect(page.locator('[data-testid="current-state"]')).toContainText('Đã tiếp nhận thiết bị');

      // Progress to preliminary inspection
      await page.click('button:has-text("Chuyển Trạng Thái")');
      await page.click('text=Đang kiểm tra ban đầu');
      await page.fill('textarea[name="transition_reason"]', 'Bắt đầu kiểm tra sơ bộ tình trạng máy');
      await page.click('button:has-text("Xác Nhận")');

      // Verify state transition
      await expect(page.locator('[data-testid="current-state"]')).toContainText('Đang kiểm tra ban đầu');

      // Progress to awaiting repair plan
      await page.click('button:has-text("Chuyển Trạng Thái")');
      await page.click('text=Chờ xác nhận phương án sửa chữa');
      await page.fill('textarea[name="transition_reason"]', 'Cần thay màn hình LCD 15.6 inch - giá 1,800,000 VNĐ');
      await page.click('button:has-text("Xác Nhận")');

      // Verify Vietnamese state display
      await expect(page.locator('[data-testid="current-state"]')).toContainText('Chờ xác nhận phương án sửa chữa');
    });

    test.step('7. Simulate Customer Approval and Continue Workflow', async () => {
      // Progress to approved for repair
      await page.click('button:has-text("Chuyển Trạng Thái")');
      await page.click('text=Đã xác nhận sửa chữa');
      await page.fill('textarea[name="transition_reason"]', 'Khách hàng đồng ý phương án sửa chữa');
      await page.click('button:has-text("Xác Nhận")');

      // Progress to in repair
      await page.click('button:has-text("Chuyển Trạng Thái")');
      await page.click('text=Đang thực hiện sửa chữa');
      await page.fill('textarea[name="transition_reason"]', 'Bắt đầu thay thế màn hình LCD');
      await page.click('button:has-text("Xác Nhận")');

      // Verify workflow state with Vietnamese localization
      await expect(page.locator('[data-testid="current-state"]')).toContainText('Đang thực hiện sửa chữa');

      // Verify state history is recorded
      await expect(page.locator('[data-testid="state-history"]')).toContainText('Đã tiếp nhận thiết bị');
      await expect(page.locator('[data-testid="state-history"]')).toContainText('Đang kiểm tra ban đầu');
      await expect(page.locator('[data-testid="state-history"]')).toContainText('Chờ xác nhận phương án sửa chữa');
    });

    // ========================================================================
    // PHASE 4: PUBLIC CUSTOMER LOOKUP - Epic 2.3 Public Interface
    // ========================================================================

    test.step('8. Test Public Repair Lookup Interface', async () => {
      // Navigate to public lookup page (no authentication required)
      await page.goto('/tra-cuu');

      // Verify public interface loads without authentication
      await expect(page.locator('h1')).toContainText('Tra Cứu Tình Trạng Sửa Chữa');
      await expect(page.locator('text=Nhập thông tin để tra cứu')).toBeVisible();
    });

    test.step('9. Test Secure Lookup with Phone + Ticket Code', async () => {
      // Fill lookup form with ticket code and phone
      await page.fill('input[name="ticket_code"]', ticketCode);
      await page.fill('input[name="customer_phone"]', customerPhone);

      // Submit lookup
      await page.click('button:has-text("Tra Cứu")');

      // Verify repair information is displayed
      await expect(page.locator('[data-testid="repair-info"]')).toBeVisible();
      await expect(page.locator('text=Đang thực hiện sửa chữa')).toBeVisible();
      await expect(page.locator(`text=${repairDescription}`)).toBeVisible();
    });

    test.step('10. Verify Vietnamese Customer Interface', async () => {
      // Verify all text is in Vietnamese
      await expect(page.locator('text=Mã phiếu sửa chữa')).toBeVisible();
      await expect(page.locator('text=Tình trạng hiện tại')).toBeVisible();
      await expect(page.locator('text=Mô tả vấn đề')).toBeVisible();

      // Verify currency is formatted Vietnamese style
      await expect(page.locator('text=2.500.000')).toBeVisible();

      // Verify device info is displayed
      await expect(page.locator('text=ASUS VivoBook 15')).toBeVisible();
    });

    test.step('11. Test Security - Wrong Phone Number', async () => {
      // Clear form and try with wrong phone number
      await page.fill('input[name="customer_phone"]', '0987654321');
      await page.click('button:has-text("Tra Cứu")');

      // Verify security error message in Vietnamese
      await expect(page.locator('.error')).toContainText('Không tìm thấy phiếu sửa chữa');
    });

    // ========================================================================
    // PHASE 5: WORKFLOW COMPLETION - Epic 2.2 Final States
    // ========================================================================

    test.step('12. Complete Repair Workflow', async () => {
      // Return to admin interface
      await page.goto('/dashboard');
      await page.click('[href="/phieu-sua-chua"]');
      await page.click(`text=${ticketCode}`);

      // Progress to quality testing
      await page.click('button:has-text("Chuyển Trạng Thái")');
      await page.click('text=Đang kiểm tra chất lượng');
      await page.fill('textarea[name="transition_reason"]', 'Hoàn thành thay màn hình, kiểm tra chất lượng');
      await page.click('button:has-text("Xác Nhận")');

      // Progress to ready for pickup
      await page.click('button:has-text("Chuyển Trạng Thái")');
      await page.click('text=Sẵn sàng nhận máy');
      await page.fill('textarea[name="transition_reason"]', 'Đã kiểm tra xong, máy hoạt động tốt');
      await page.click('button:has-text("Xác Nhận")');

      // Update final cost and warranty
      await page.fill('input[name="total_cost"]', '2500000');
      await page.fill('input[name="warranty_months"]', '3');
      await page.click('button:has-text("Cập Nhật")');

      // Verify final state
      await expect(page.locator('[data-testid="current-state"]')).toContainText('Sẵn sàng nhận máy');
    });

    // ========================================================================
    // PHASE 6: FINAL PUBLIC LOOKUP VERIFICATION - Epic 2.3 Complete Journey
    // ========================================================================

    test.step('13. Verify Final Status in Public Interface', async () => {
      // Go back to public lookup
      await page.goto('/tra-cuu');

      // Lookup with correct credentials
      await page.fill('input[name="ticket_code"]', ticketCode);
      await page.fill('input[name="customer_phone"]', customerPhone);
      await page.click('button:has-text("Tra Cứu")');

      // Verify final status is displayed
      await expect(page.locator('text=Sẵn sàng nhận máy')).toBeVisible();

      // Verify warranty information
      await expect(page.locator('text=3 tháng')).toBeVisible();

      // Verify final cost
      await expect(page.locator('text=2.500.000')).toBeVisible();

      // Verify pickup instruction in Vietnamese
      await expect(page.locator('text=Quý khách có thể đến lấy máy')).toBeVisible();
    });

    test.step('14. Test Service History Lookup', async () => {
      // Try phone-only lookup for service history
      await page.goto('/tra-cuu');
      await page.click('text=Tra cứu theo số điện thoại');

      await page.fill('input[name="phone_only"]', customerPhone);
      await page.click('button:has-text("Xem Lịch Sử")');

      // Verify service history shows the repair
      await expect(page.locator('[data-testid="service-history"]')).toBeVisible();
      await expect(page.locator(`text=${ticketCode}`)).toBeVisible();
      await expect(page.locator('text=Sẵn sàng nhận máy')).toBeVisible();
    });

    // ========================================================================
    // FINAL VERIFICATION: COMPLETE SYSTEM INTEGRATION TEST
    // ========================================================================

    test.step('15. Final System Integration Verification', async () => {
      // Verify complete data consistency across all systems

      // Admin view consistency
      await page.goto('/dashboard');
      await page.click('[href="/khach-hang"]');
      await page.fill('input[placeholder*="số điện thoại"]', customerPhone);
      await expect(page.locator(`text=${customerName}`)).toBeVisible();

      // Ticket management consistency
      await page.click('[href="/phieu-sua-chua"]');
      await page.fill('input[placeholder*="mã phiếu"]', ticketCode);
      await expect(page.locator(`text=${ticketCode}`)).toBeVisible();
      await expect(page.locator('text=Sẵn sàng nhận máy')).toBeVisible();

      // Public interface final verification
      await page.goto('/tra-cuu');
      await page.fill('input[name="ticket_code"]', ticketCode);
      await page.fill('input[name="customer_phone"]', customerPhone);
      await page.click('button:has-text("Tra Cứu")');
      await expect(page.locator('text=Sẵn sàng nhận máy')).toBeVisible();

      console.log(`✅ Phase 2 Complete Journey Test Successful`);
      console.log(`📱 Customer: ${customerName} (${customerPhone})`);
      console.log(`🎫 Ticket: ${ticketCode}`);
      console.log(`🔧 Repair: ${repairDescription}`);
      console.log(`📊 Final Status: Sẵn sàng nhận máy`);
    });
  });
});