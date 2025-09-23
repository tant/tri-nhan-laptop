import { test, expect } from '@playwright/test';

test.describe('16-State Repair Workflow Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to workflow dashboard
    await page.goto('/workflow');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Complete 16-State Model - All repair states are accessible', async ({ page }) => {
    // Verify all 16 states are defined and accessible
    const expectedStates = [
      'Đã nhận thiết bị',
      'Kiểm tra sơ bộ',
      'Đang lập kế hoạch sửa chữa',
      'Đã duyệt sửa chữa',
      'Đang chờ linh kiện',
      'Đang chẩn đoán',
      'Đang sửa chữa',
      'Kiểm tra chất lượng',
      'Sẵn sàng giao',
      'Đã giao hàng',
      'Chờ thanh toán',
      'Hoàn thành',
      'Khách hàng hủy',
      'Tạm dừng',
      'Bảo hành',
      'Bỏ lại'
    ];

    // Check state filter dropdown
    await page.click('button:has-text("Lọc theo trạng thái")');

    for (const state of expectedStates) {
      await expect(page.locator(`text=${state}`)).toBeVisible();
    }

    // Verify workflow path for different repair types
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.selectOption('select[name="repairType"]', 'screen');

    // Check that correct workflow path is displayed
    await expect(page.locator('text=Lộ trình sửa chữa màn hình')).toBeVisible();
    await expect(page.locator('text=6-8 bước')).toBeVisible();
  });

  test('AC2: Vietnamese State Labels - All states display with Vietnamese labels', async ({ page }) => {
    // Create a test ticket to check Vietnamese labels
    await page.click('button:has-text("Tạo phiếu mới")');

    // Fill basic information
    await page.fill('input[name="customerPhone"]', '0912345678');
    await page.selectOption('select[name="deviceBrand"]', 'ASUS');
    await page.fill('textarea[name="problemDescription"]', 'Test problem description');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify Vietnamese labels in workflow status
    await expect(page.locator('text=Đã nhận thiết bị')).toBeVisible();
    await expect(page.locator('text=Thiết bị đã được tiếp nhận và ghi nhận thông tin ban đầu')).toBeVisible();

    // Check next possible states are in Vietnamese
    await page.click('button:has-text("Chuyển trạng thái")');
    await expect(page.locator('text=Kiểm tra sơ bộ')).toBeVisible();
    await expect(page.locator('text=Đang thực hiện kiểm tra và đánh giá tình trạng thiết bị')).toBeVisible();
  });

  test('AC3: Controlled Transitions - Invalid transitions are prevented', async ({ page }) => {
    // Navigate to existing ticket
    await page.click('tr:first-child td:first-child');

    // Try to make invalid transition (e.g., from device_received directly to completed)
    await page.click('button:has-text("Chuyển trạng thái")');

    // Verify that invalid states are not available in dropdown
    await page.click('select[name="newState"]');
    await expect(page.locator('option:has-text("Hoàn thành")')).not.toBeVisible();

    // Only valid next states should be available
    await expect(page.locator('option:has-text("Kiểm tra sơ bộ")')).toBeVisible();

    // Try to select valid transition
    await page.selectOption('select[name="newState"]', 'preliminary_inspection');
    await page.fill('textarea[name="reason"]', 'Chuyển sang kiểm tra sơ bộ');
    await page.click('button:has-text("Xác nhận")');

    // Verify transition succeeded
    await expect(page.locator('text=Kiểm tra sơ bộ')).toBeVisible();
  });

  test('AC4: Status Change Validation - Business rules are enforced', async ({ page }) => {
    // Test transition that requires customer approval
    await page.click('tr:first-child td:first-child');

    // Navigate to a state that requires approval (awaiting_repair_plan)
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'awaiting_repair_plan');
    await page.fill('textarea[name="reason"]', 'Cần lập kế hoạch sửa chữa');
    await page.click('button:has-text("Xác nhận")');

    // Now try to move to approved_for_repair without customer approval
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'approved_for_repair');
    await page.fill('textarea[name="reason"]', 'Test without approval');
    await page.click('button:has-text("Xác nhận")');

    // Should show validation error
    await expect(page.locator('text=Cần có xác nhận từ khách hàng')).toBeVisible();

    // Check the customer approval checkbox and try again
    await page.check('input[name="hasCustomerApproval"]');
    await page.check('input[name="hasPayment"]');
    await page.click('button:has-text("Xác nhận")');

    // Should succeed this time
    await expect(page.locator('text=Đã duyệt sửa chữa')).toBeVisible();
  });

  test('AC5: Transition History - Complete audit trail is maintained', async ({ page }) => {
    // Select a ticket with history
    await page.click('tr:first-child td:first-child');

    // Open history
    await page.click('button:has-text("Lịch sử")');

    // Verify history dialog shows
    await expect(page.locator('text=Lịch sử thay đổi trạng thái')).toBeVisible();

    // Check history entries have required information
    const historyEntry = page.locator('.history-entry').first();
    await expect(historyEntry.locator('.state-name')).toBeVisible();
    await expect(historyEntry.locator('.change-date')).toBeVisible();
    await expect(historyEntry.locator('.changed-by')).toBeVisible();
    await expect(historyEntry.locator('.reason')).toBeVisible();

    // Check customer notification status
    await expect(historyEntry.locator('text=Đã thông báo KH')).toBeVisible();

    // Make a new state change and verify it appears in history
    await page.click('button:has-text("Đóng")');
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'in_diagnosis');
    await page.fill('textarea[name="reason"]', 'Bắt đầu chẩn đoán chi tiết');
    await page.click('button:has-text("Xác nhận")');

    // Open history again and verify new entry
    await page.click('button:has-text("Lịch sử")');
    await expect(page.locator('text=Bắt đầu chẩn đoán chi tiết')).toBeVisible();
  });

  test('AC6: Vietnamese Notifications - Status change notifications in Vietnamese', async ({ page }) => {
    // Make a state change that triggers notification
    await page.click('tr:first-child td:first-child');
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'ready_for_pickup');
    await page.fill('textarea[name="reason"]', 'Sẵn sàng để khách hàng nhận máy');
    await page.click('button:has-text("Xác nhận")');

    // Verify Vietnamese notification message
    await expect(page.locator('text=Đã gửi thông báo cho khách hàng')).toBeVisible();
    await expect(page.locator('text=Thiết bị đã sẵn sàng để giao')).toBeVisible();

    // Check notification appears in system log
    await page.click('button:has-text("Xem thông báo")');
    await expect(page.locator('text=Cập nhật trạng thái: Sẵn sàng giao')).toBeVisible();
  });

  test('AC7: Conditional Workflows - Different paths based on repair type', async ({ page }) => {
    // Test software repair workflow (shorter path)
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.selectOption('select[name="repairType"]', 'software');
    await page.fill('input[name="customerPhone"]', '0987654321');
    await page.fill('textarea[name="problemDescription"]', 'Phần mềm lỗi');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify software workflow path
    await expect(page.locator('text=Lộ trình sửa chữa phần mềm')).toBeVisible();
    await expect(page.locator('text=5-6 bước')).toBeVisible();

    // Test hardware repair workflow (longer path)
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.selectOption('select[name="repairType"]', 'motherboard');
    await page.fill('input[name="customerPhone"]', '0123456789');
    await page.fill('textarea[name="problemDescription"]', 'Main bị hỏng');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify motherboard workflow path (includes payment_pending)
    await expect(page.locator('text=Lộ trình sửa chữa bo mạch chủ')).toBeVisible();
    await expect(page.locator('text=8-10 bước')).toBeVisible();
    await expect(page.locator('text=Chờ thanh toán')).toBeVisible();
  });

  test('AC8: Role-Based State Management - Different permissions for different roles', async ({ page }) => {
    // Test as technician role
    await page.evaluate(() => {
      localStorage.setItem('userRole', 'technician');
    });
    await page.reload();

    // Navigate to ticket
    await page.click('tr:first-child td:first-child');
    await page.click('button:has-text("Chuyển trạng thái")');

    // Verify technician can access technical states
    await expect(page.locator('option:has-text("Đang chẩn đoán")')).toBeVisible();
    await expect(page.locator('option:has-text("Đang sửa chữa")')).toBeVisible();

    // But cannot access management states
    await expect(page.locator('option:has-text("Hoàn thành")')).not.toBeVisible();

    // Test as manager role
    await page.evaluate(() => {
      localStorage.setItem('userRole', 'manager');
    });
    await page.reload();

    await page.click('tr:first-child td:first-child');
    await page.click('button:has-text("Chuyển trạng thái")');

    // Verify manager has access to all states
    await expect(page.locator('option:has-text("Hoàn thành")')).toBeVisible();
    await expect(page.locator('option:has-text("Khách hàng hủy")')).toBeVisible();
  });

  test('AC9: Automated State Changes - Auto-transitions based on business logic', async ({ page }) => {
    // Test auto-advance from device_received after 30 minutes
    await page.click('button:has-text("Mô phỏng thời gian")');
    await page.fill('input[name="simulateMinutes"]', '35');
    await page.click('button:has-text("Áp dụng")');

    // Run auto-advance process
    await page.click('button:has-text("Chạy tự động")');

    // Verify tickets in device_received state auto-advance
    await expect(page.locator('text=Đã tự động chuyển sang kiểm tra sơ bộ')).toBeVisible();

    // Test conditional auto-advance when parts arrive
    await page.click('tr:has-text("Đang chờ linh kiện") td:first-child');
    await page.click('button:has-text("Cập nhật linh kiện")');
    await page.check('input[name="partsReceived"]');
    await page.click('button:has-text("Xác nhận")');

    // Should auto-advance to in_repair
    await expect(page.locator('text=Đã tự động chuyển sang đang sửa chữa')).toBeVisible();
  });

  test('AC10: Visual Workflow Display - Clear status and next steps', async ({ page }) => {
    // Navigate to ticket detail
    await page.click('tr:first-child td:first-child');

    // Verify progress bar is displayed
    await expect(page.locator('.progress-bar')).toBeVisible();
    await expect(page.locator('text=2/7 bước')).toBeVisible();

    // Verify completed steps are shown
    await expect(page.locator('.completed-steps')).toBeVisible();
    await expect(page.locator('text=Đã nhận thiết bị').first()).toHaveClass(/text-green/);

    // Verify upcoming steps are shown
    await expect(page.locator('.upcoming-steps')).toBeVisible();
    await expect(page.locator('text=Đang lập kế hoạch sửa chữa')).toBeVisible();

    // Verify next possible actions are displayed with colors
    await expect(page.locator('.next-actions')).toBeVisible();
    const actionButton = page.locator('button:has-text("Kiểm tra sơ bộ")');
    await expect(actionButton).toBeVisible();
    await expect(actionButton).toHaveCSS('border-color', /rgb.*255.*193.*7/); // warning color

    // Verify estimated completion date
    await expect(page.locator('text=Dự kiến hoàn thành:')).toBeVisible();
    await expect(page.locator('text=/\\d{2}\/\\d{2}\/\\d{4}/')).toBeVisible();
  });

  test('Workflow Dashboard - Overview and bulk operations', async ({ page }) => {
    // Verify dashboard statistics
    await expect(page.locator('text=Tổng phiếu')).toBeVisible();
    await expect(page.locator('text=Đang xử lý')).toBeVisible();
    await expect(page.locator('text=Hoàn thành')).toBeVisible();
    await expect(page.locator('text=Nghẽn cổ chai')).toBeVisible();

    // Test filtering by category
    await page.click('button:has-text("Đang xử lý")');
    await expect(page.locator('tr:has-text("Đang sửa chữa")')).toBeVisible();
    await expect(page.locator('tr:has-text("Hoàn thành")')).not.toBeVisible();

    // Test search functionality
    await page.fill('input[placeholder*="Tìm thiết bị"]', 'ASUS');
    await expect(page.locator('tr:has-text("ASUS")')).toBeVisible();

    // Test bulk state change
    await page.check('input[type="checkbox"]', { force: true });
    await page.check('tr:nth-child(2) input[type="checkbox"]', { force: true });

    await page.selectOption('select[name="bulkState"]', 'in_diagnosis');
    await page.click('button:has-text("Áp dụng")');

    // Verify bulk change confirmation
    await expect(page.locator('text=Đã thay đổi 2 phiếu sang trạng thái')).toBeVisible();
  });

  test('Error handling and validation', async ({ page }) => {
    // Test validation error for missing required fields
    await page.click('tr:first-child td:first-child');
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'in_repair');
    await page.click('button:has-text("Xác nhận")');

    // Should show validation error for missing reason
    await expect(page.locator('text=Vui lòng nhập lý do thay đổi')).toBeVisible();

    // Test business rule validation
    await page.fill('textarea[name="reason"]', 'Test transition');
    await page.click('button:has-text("Xác nhận")');

    // Should show business rule error if conditions not met
    await expect(page.locator('text=Chưa có đủ linh kiện để sửa chữa')).toBeVisible();

    // Test network error handling
    await page.route('**/api/repair-tickets/*', route => route.abort());
    await page.click('button:has-text("Làm mới")');

    await expect(page.locator('text=Lỗi kết nối mạng')).toBeVisible();
  });

  test('Performance with large dataset', async ({ page }) => {
    // Navigate to page with many tickets
    await page.goto('/workflow?limit=1000');

    // Verify page loads within reasonable time (5 seconds)
    await page.waitForSelector('.data-table', { timeout: 5000 });

    // Test pagination works with large dataset
    await expect(page.locator('text=Trang 1 của')).toBeVisible();
    await page.click('button:has-text("Trang tiếp")');
    await expect(page.locator('text=Trang 2 của')).toBeVisible();

    // Test filtering performance
    const startTime = Date.now();
    await page.fill('input[placeholder*="Tìm thiết bị"]', 'ASUS');
    await page.waitForSelector('tr:has-text("ASUS")');
    const endTime = Date.now();

    // Search should complete within 2 seconds
    expect(endTime - startTime).toBeLessThan(2000);
  });
});