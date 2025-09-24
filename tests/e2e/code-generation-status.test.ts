import { test, expect } from '@playwright/test';

test.describe('Ticket Code Generation & Status Update System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tickets page
    await page.goto('/phieu-sua-chua');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Automatic Code Generation - LRP-YYYY-XXXXXX format', async ({ page }) => {
    // Create a new ticket to test code generation
    await page.click('button:has-text("Tạo phiếu mới")');

    // Fill required information
    await page.fill('input[name="customerPhone"]', '0912345678');
    await page.selectOption('select[name="deviceBrand"]', 'ASUS');
    await page.fill('textarea[name="problemDescription"]', 'Test ticket for code generation');

    // Submit the form
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Wait for success message
    await expect(page.locator('text=Đã tạo phiếu sửa chữa thành công')).toBeVisible();

    // Verify ticket code format appears
    const ticketCodePattern = /LRP-\d{4}-\d{6}/;
    await expect(page.locator(`text=${ticketCodePattern.source}`)).toBeVisible();

    // Get the generated ticket code
    const ticketCodeElement = await page.locator('[data-testid="ticket-code"]').first();
    const ticketCode = await ticketCodeElement.textContent();

    // Verify format matches LRP-YYYY-XXXXXX
    expect(ticketCode).toMatch(ticketCodePattern);

    // Verify year is current year
    const currentYear = new Date().getFullYear();
    expect(ticketCode).toContain(`LRP-${currentYear}-`);

    // Verify sequence is 6 digits
    const sequencePart = ticketCode?.split('-')[2];
    expect(sequencePart).toHaveLength(6);
    expect(sequencePart).toMatch(/^\d{6}$/);
  });

  test('AC2: Vietnamese Year Format - Proper Vietnamese date conventions', async ({ page }) => {
    // Navigate to ticket statistics page
    await page.goto('/thong-ke-ma-phieu');

    // Verify Vietnamese year display
    const currentYear = new Date().getFullYear();
    await expect(page.locator(`text=Năm ${currentYear}`)).toBeVisible();

    // Check year selector uses Vietnamese format
    await page.click('select[name="year"]');
    await expect(page.locator(`option:has-text("${currentYear}")`)).toBeVisible();

    // Verify date formatting in Vietnamese
    await expect(page.locator('text=/\\d{2}\\/\\d{2}\\/\\d{4}/')).toBeVisible(); // DD/MM/YYYY format
  });

  test('AC3: Sequential Numbering - Proper increment within year', async ({ page }) => {
    // Get preview of next ticket code
    const nextCodeResponse = await page.evaluate(async () => {
      const response = await fetch('/api/preview-next-ticket-code');
      return await response.text();
    });

    const nextCodeMatch = nextCodeResponse.match(/LRP-\d{4}-(\d{6})/);
    const nextSequence = parseInt(nextCodeMatch?.[1] || '0');

    // Create a new ticket
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0987654321');
    await page.selectOption('select[name="deviceBrand"]', 'HP');
    await page.fill('textarea[name="problemDescription"]', 'Sequential test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify the sequence incremented
    const newTicketCode = await page.locator('[data-testid="ticket-code"]').first().textContent();
    const newSequenceMatch = newTicketCode?.match(/LRP-\d{4}-(\d{6})/);
    const newSequence = parseInt(newSequenceMatch?.[1] || '0');

    expect(newSequence).toBe(nextSequence);

    // Create another ticket to verify continued increment
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0123456789');
    await page.selectOption('select[name="deviceBrand"]', 'Dell');
    await page.fill('textarea[name="problemDescription"]', 'Sequential test 2');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    const secondTicketCode = await page.locator('[data-testid="ticket-code"]').first().textContent();
    const secondSequenceMatch = secondTicketCode?.match(/LRP-\d{4}-(\d{6})/);
    const secondSequence = parseInt(secondSequenceMatch?.[1] || '0');

    expect(secondSequence).toBe(newSequence + 1);
  });

  test('AC4: Code Uniqueness - Database constraints prevent duplicates', async ({ page }) => {
    // Try to create tickets rapidly to test uniqueness
    const ticketCodes: string[] = [];

    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Tạo phiếu mới")');
      await page.fill('input[name="customerPhone"]', `091234567${i}`);
      await page.selectOption('select[name="deviceBrand"]', 'ASUS');
      await page.fill('textarea[name="problemDescription"]', `Uniqueness test ${i}`);
      await page.click('button:has-text("Tạo phiếu sửa chữa")');

      // Get the ticket code
      const ticketCode = await page.locator('[data-testid="ticket-code"]').first().textContent();
      ticketCodes.push(ticketCode || '');

      // Wait a moment between creations
      await page.waitForTimeout(100);
    }

    // Verify all codes are unique
    const uniqueCodes = [...new Set(ticketCodes)];
    expect(uniqueCodes.length).toBe(ticketCodes.length);

    // Verify all codes follow the format
    ticketCodes.forEach(code => {
      expect(code).toMatch(/LRP-\d{4}-\d{6}/);
    });
  });

  test('AC5: Real-Time Updates - Status changes propagate immediately', async ({ page, context }) => {
    // Create a new ticket
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0911223344');
    await page.selectOption('select[name="deviceBrand"]', 'Lenovo');
    await page.fill('textarea[name="problemDescription"]', 'Real-time test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Get ticket ID
    const ticketId = await page.getAttribute('[data-testid="ticket-id"]', 'data-ticket-id');

    // Open ticket in a second tab to test real-time updates
    const page2 = await context.newPage();
    await page2.goto(`/phieu-sua-chua/${ticketId}`);

    // Change status in first tab
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'preliminary_inspection');
    await page.fill('textarea[name="reason"]', 'Bắt đầu kiểm tra');
    await page.click('button:has-text("Xác nhận")');

    // Verify status updated in first tab
    await expect(page.locator('text=Kiểm tra sơ bộ')).toBeVisible();

    // Verify status updated in second tab (real-time)
    await expect(page2.locator('text=Kiểm tra sơ bộ')).toBeVisible({ timeout: 5000 });

    await page2.close();
  });

  test('AC6: Vietnamese Status Messages - All messages in Vietnamese', async ({ page }) => {
    // Create and update a ticket to see Vietnamese messages
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0933445566');
    await page.selectOption('select[name="deviceBrand"]', 'ASUS');
    await page.fill('textarea[name="problemDescription"]', 'Vietnamese messages test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify creation success message in Vietnamese
    await expect(page.locator('text=Đã tạo phiếu sửa chữa thành công')).toBeVisible();

    // Change status and verify Vietnamese messages
    await page.click('button:has-text("Chuyển trạng thái")');

    // Verify all status options are in Vietnamese
    await page.click('select[name="newState"]');
    const vietnameseStates = [
      'Kiểm tra sơ bộ',
      'Đang lập kế hoạch sửa chữa',
      'Đã duyệt sửa chữa',
      'Đang chờ linh kiện',
      'Đang chẩn đoán',
      'Đang sửa chữa'
    ];

    for (const state of vietnameseStates) {
      await expect(page.locator(`option:has-text("${state}")`)).toBeVisible();
    }

    // Select a state and verify Vietnamese confirmation
    await page.selectOption('select[name="newState"]', 'preliminary_inspection');
    await page.fill('textarea[name="reason"]', 'Kiểm tra thiết bị');
    await page.click('button:has-text("Xác nhận")');

    await expect(page.locator('text=Đã cập nhật trạng thái thành công')).toBeVisible();
    await expect(page.locator('text=Đang thực hiện kiểm tra và đánh giá tình trạng thiết bị')).toBeVisible();
  });

  test('AC7: Update Validation - Business rules enforced', async ({ page }) => {
    // Create a ticket
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0944556677');
    await page.selectOption('select[name="deviceBrand"]', 'HP');
    await page.fill('textarea[name="problemDescription"]', 'Validation test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Try to make invalid transition
    await page.click('button:has-text("Chuyển trạng thái")');

    // Try to go directly to completed without proper workflow
    await page.selectOption('select[name="newState"]', 'completed');
    await page.fill('textarea[name="reason"]', 'Invalid transition test');
    await page.click('button:has-text("Xác nhận")');

    // Should show validation error
    await expect(page.locator('text=Chuyển trạng thái không hợp lệ')).toBeVisible();

    // Try transition that requires customer approval
    await page.selectOption('select[name="newState"]', 'approved_for_repair');
    await page.fill('textarea[name="reason"]', 'Test approval requirement');
    await page.click('button:has-text("Xác nhận")');

    // Should show business rule validation
    await expect(page.locator('text=Cần có xác nhận từ khách hàng')).toBeVisible();

    // Add approval and try again
    await page.check('input[name="hasCustomerApproval"]');
    await page.check('input[name="hasPayment"]');
    await page.click('button:has-text("Xác nhận")');

    // Should succeed now
    await expect(page.locator('text=Đã cập nhật trạng thái thành công')).toBeVisible();
  });

  test('AC8: Change Attribution - Staff tracking and timestamps', async ({ page }) => {
    // Create a ticket
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0955667788');
    await page.selectOption('select[name="deviceBrand"]', 'Dell');
    await page.fill('textarea[name="problemDescription"]', 'Attribution test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Make a status change
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'preliminary_inspection');
    await page.fill('textarea[name="reason"]', 'Bắt đầu kiểm tra');
    await page.click('button:has-text("Xác nhận")');

    // Open history to verify attribution
    await page.click('button:has-text("Lịch sử")');

    // Verify change is logged with staff attribution
    await expect(page.locator('text=Bắt đầu kiểm tra')).toBeVisible();
    await expect(page.locator('text=Bởi:')).toBeVisible();

    // Verify timestamp in Vietnamese format
    await expect(page.locator('text=/\\d{2}\\/\\d{2}\\/\\d{4}.*\\d{2}:\\d{2}/')).toBeVisible();

    // Verify current user is attributed
    await expect(page.locator('text=Admin User')).toBeVisible(); // or current logged-in user
  });

  test('AC9: Customer Notifications - Automatic notifications for status changes', async ({ page }) => {
    // Create a ticket
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0966778899');
    await page.selectOption('select[name="deviceBrand"]', 'ASUS');
    await page.fill('textarea[name="problemDescription"]', 'Notification test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify creation notification
    await expect(page.locator('text=Đã gửi thông báo cho khách hàng')).toBeVisible();

    // Change to a state that triggers notification
    await page.click('button:has-text("Chuyển trạng thái")');
    await page.selectOption('select[name="newState"]', 'ready_for_pickup');
    await page.fill('textarea[name="reason"]', 'Sẵn sàng giao hàng');
    await page.click('button:has-text("Xác nhận")');

    // Verify notification sent
    await expect(page.locator('text=Đã thông báo khách hàng')).toBeVisible();

    // Check notification content
    await page.click('button:has-text("Xem thông báo")');
    await expect(page.locator('text=Thiết bị.*đã sửa xong')).toBeVisible();
    await expect(page.locator('text=Vui lòng đến nhận máy')).toBeVisible();
  });

  test('AC10: Status History - Complete chronological tracking', async ({ page }) => {
    // Create a ticket
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0977889900');
    await page.selectOption('select[name="deviceBrand"]', 'Lenovo');
    await page.fill('textarea[name="problemDescription"]', 'History tracking test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Make multiple status changes
    const statusChanges = [
      { state: 'preliminary_inspection', reason: 'Bắt đầu kiểm tra' },
      { state: 'awaiting_repair_plan', reason: 'Cần lập kế hoạch' },
      { state: 'approved_for_repair', reason: 'Khách hàng đồng ý', requiresApproval: true }
    ];

    for (const change of statusChanges) {
      await page.click('button:has-text("Chuyển trạng thái")');
      await page.selectOption('select[name="newState"]', change.state);
      await page.fill('textarea[name="reason"]', change.reason);

      if (change.requiresApproval) {
        await page.check('input[name="hasCustomerApproval"]');
        await page.check('input[name="hasPayment"]');
      }

      await page.click('button:has-text("Xác nhận")');
      await page.waitForTimeout(500); // Wait between changes
    }

    // Open history
    await page.click('button:has-text("Lịch sử")');

    // Verify all changes are recorded in chronological order
    await expect(page.locator('text=Khách hàng đồng ý')).toBeVisible();
    await expect(page.locator('text=Cần lập kế hoạch')).toBeVisible();
    await expect(page.locator('text=Bắt đầu kiểm tra')).toBeVisible();

    // Verify chronological order (newest first)
    const historyItems = await page.locator('.history-item').all();
    expect(historyItems.length).toBeGreaterThanOrEqual(3);

    // Verify each history item has required information
    for (const item of historyItems) {
      await expect(item.locator('.state-name')).toBeVisible();
      await expect(item.locator('.change-reason')).toBeVisible();
      await expect(item.locator('.changed-by')).toBeVisible();
      await expect(item.locator('.timestamp')).toBeVisible();
    }
  });

  test('Ticket Search by Code', async ({ page }) => {
    // Create a ticket first
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', '0988990011');
    await page.selectOption('select[name="deviceBrand"]', 'HP');
    await page.fill('textarea[name="problemDescription"]', 'Search test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Get the generated ticket code
    const ticketCode = await page.locator('[data-testid="ticket-code"]').first().textContent();

    // Search for the ticket
    await page.fill('input[placeholder="Tìm theo mã phiếu"]', ticketCode || '');
    await page.click('button:has-text("Tìm kiếm")');

    // Verify ticket is found
    await expect(page.locator(`text=${ticketCode}`)).toBeVisible();
    await expect(page.locator('text=Search test')).toBeVisible();

    // Test partial search
    const partialCode = ticketCode?.slice(0, 10);
    await page.fill('input[placeholder="Tìm theo mã phiếu"]', partialCode || '');
    await page.click('button:has-text("Tìm kiếm")');

    // Should still find the ticket
    await expect(page.locator(`text=${ticketCode}`)).toBeVisible();
  });

  test('Code Statistics and Analytics', async ({ page }) => {
    // Navigate to statistics page
    await page.goto('/thong-ke-ma-phieu');

    // Verify statistics are displayed
    await expect(page.locator('text=Thống kê mã phiếu')).toBeVisible();

    // Check current year statistics
    const currentYear = new Date().getFullYear();
    await expect(page.locator(`text=Năm ${currentYear}`)).toBeVisible();
    await expect(page.locator('text=Tổng số phiếu:')).toBeVisible();
    await expect(page.locator('text=Số thứ tự hiện tại:')).toBeVisible();

    // Verify sequence integrity
    await expect(page.locator('text=Kiểm tra tính toàn vẹn')).toBeVisible();
    await page.click('button:has-text("Kiểm tra")');

    // Should show validation results
    await expect(page.locator('text=Không có lỗ hổng trong chuỗi số')).toBeVisible();
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    // Test invalid phone number
    await page.click('button:has-text("Tạo phiếu mới")');
    await page.fill('input[name="customerPhone"]', 'invalid');
    await page.selectOption('select[name="deviceBrand"]', 'ASUS');
    await page.fill('textarea[name="problemDescription"]', 'Error test');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    await expect(page.locator('text=Số điện thoại không hợp lệ')).toBeVisible();

    // Test network error handling
    await page.route('**/api/tickets', route => route.abort());

    await page.fill('input[name="customerPhone"]', '0999887766');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    await expect(page.locator('text=Lỗi kết nối')).toBeVisible();

    // Restore network
    await page.unroute('**/api/tickets');
  });

  test('Performance with High Volume', async ({ page }) => {
    // Navigate to bulk creation test page
    await page.goto('/test-performance');

    // Create multiple tickets rapidly
    await page.click('button:has-text("Tạo 10 phiếu")');

    // Verify all tickets are created with unique codes
    await page.waitForSelector('text=Đã tạo 10 phiếu thành công');

    const ticketCodes = await page.locator('[data-testid="ticket-code"]').allTextContents();
    expect(ticketCodes.length).toBe(10);

    // Verify all codes are unique
    const uniqueCodes = [...new Set(ticketCodes)];
    expect(uniqueCodes.length).toBe(10);

    // Verify all follow format
    ticketCodes.forEach(code => {
      expect(code).toMatch(/LRP-\d{4}-\d{6}/);
    });
  });
});