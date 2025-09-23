/**
 * Real-Time Synchronization E2E Tests
 * Tests multi-session sync, conflict resolution, and performance optimization
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test data
const TEST_ADMIN = {
  email: 'admin@laptoprepair.vn',
  password: 'admin123',
  name: 'Admin'
};

const TEST_STAFF = {
  email: 'staff@laptoprepair.vn',
  password: 'staff123',
  name: 'Nhân viên'
};

const TEST_CUSTOMER = {
  phone: '0987654321',
  name: 'Nguyễn Văn Test',
  device: 'Laptop Dell Inspiron 15 3000',
  problem: 'Màn hình bị đen, không khởi động được'
};

// Helper functions
async function loginAs(page: Page, user: typeof TEST_ADMIN) {
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
}

async function createTestTicket(page: Page) {
  await page.goto('/phieu-sua-chua');
  await page.click('button:has-text("Tạo phiếu mới")');

  await page.fill('input[name="customer_phone"]', TEST_CUSTOMER.phone);
  await page.fill('input[name="device_info"]', TEST_CUSTOMER.device);
  await page.fill('textarea[name="problem_description"]', TEST_CUSTOMER.problem);

  await page.click('button[type="submit"]');

  // Wait for ticket creation and get ticket code
  await expect(page.locator('text=/LRP-\\d{4}-\\d{6}/')).toBeVisible();
  const ticketCode = await page.locator('text=/LRP-\\d{4}-\\d{6}/').first().textContent();

  return ticketCode!;
}

async function waitForSyncIndicator(page: Page, status: 'connected' | 'reconnecting' | 'error') {
  const statusTexts = {
    connected: 'Đã kết nối',
    reconnecting: 'Đang kết nối lại',
    error: 'Lỗi kết nối'
  };

  await expect(page.locator(`text="${statusTexts[status]}"`)).toBeVisible({ timeout: 10000 });
}

// Test suite
test.describe('Real-Time Synchronization System', () => {
  let adminContext: BrowserContext;
  let staffContext: BrowserContext;
  let adminPage: Page;
  let staffPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create separate contexts for multi-session testing
    adminContext = await browser.newContext();
    staffContext = await browser.newContext();

    adminPage = await adminContext.newPage();
    staffPage = await staffContext.newPage();
  });

  test.afterAll(async () => {
    await adminContext.close();
    await staffContext.close();
  });

  test('AC1: Multi-Session Synchronization - Status updates appear instantly in all sessions', async () => {
    // Setup: Login both users
    await loginAs(adminPage, TEST_ADMIN);
    await loginAs(staffPage, TEST_STAFF);

    // Create a test ticket as admin
    const ticketCode = await createTestTicket(adminPage);

    // Both users navigate to ticket details
    await adminPage.goto(`/phieu-sua-chua?search=${ticketCode}`);
    await staffPage.goto(`/phieu-sua-chua?search=${ticketCode}`);

    // Wait for sync indicators to show connected
    await waitForSyncIndicator(adminPage, 'connected');
    await waitForSyncIndicator(staffPage, 'connected');

    // Admin updates status
    await adminPage.click('button:has-text("Cập nhật trạng thái")');
    await adminPage.selectOption('select[name="new_state"]', 'preliminary_inspection');
    await adminPage.fill('textarea[name="reason"]', 'Bắt đầu kiểm tra sơ bộ thiết bị');
    await adminPage.click('button:has-text("Xác nhận")');

    // Verify status appears immediately in staff session
    await expect(staffPage.locator('text="Đang kiểm tra ban đầu"')).toBeVisible({ timeout: 3000 });

    // Verify sync event appears in staff's event history
    await expect(staffPage.locator('.sync-event:has-text("Trạng thái được cập nhật")')).toBeVisible();

    // Verify attribution shows admin made the change
    await expect(staffPage.locator(`text="${TEST_ADMIN.name}"`)).toBeVisible();
  });

  test('AC2: Conflict Resolution - System handles simultaneous status updates gracefully', async () => {
    // Setup: Both users on same ticket
    const ticketCode = await createTestTicket(adminPage);

    await adminPage.goto(`/phieu-sua-chua?search=${ticketCode}`);
    await staffPage.goto(`/phieu-sua-chua?search=${ticketCode}`);

    // Simulate network delay by pausing one context
    await staffContext.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });

    // Both users attempt to update status simultaneously
    const adminUpdate = adminPage.click('button:has-text("Cập nhật trạng thái")').then(async () => {
      await adminPage.selectOption('select[name="new_state"]', 'awaiting_repair_plan');
      await adminPage.fill('textarea[name="reason"]', 'Cần báo giá sửa chữa');
      await adminPage.click('button:has-text("Xác nhận")');
    });

    const staffUpdate = staffPage.click('button:has-text("Cập nhật trạng thái")').then(async () => {
      await staffPage.selectOption('select[name="new_state"]', 'in_diagnosis');
      await staffPage.fill('textarea[name="reason"]', 'Đang chẩn đoán chi tiết');
      await staffPage.click('button:has-text("Xác nhận")');
    });

    await Promise.all([adminUpdate, staffUpdate]);

    // Verify conflict resolution UI appears
    await expect(adminPage.locator('text="⚠️ Có xung đột cần giải quyết"')).toBeVisible({ timeout: 5000 });

    // Admin resolves conflict
    await adminPage.click('button:has-text("Giải quyết thủ công")');
    await expect(adminPage.locator('text="Giải quyết xung đột dữ liệu"')).toBeVisible();

    // Choose remote wins strategy
    await adminPage.click('button:has-text("🌐 Sử dụng dữ liệu từ xa")');
    await adminPage.click('button:has-text("Giải quyết xung đột")');

    // Verify conflict resolved and both sessions show same state
    await expect(adminPage.locator('text="Đang chẩn đoán chi tiết"')).toBeVisible();
    await expect(staffPage.locator('text="Đang chẩn đoán chi tiết"')).toBeVisible();

    // Clear route override
    await staffContext.unroute('**/*');
  });

  test('AC3: Connection Management - Automatic reconnection when connection is lost', async () => {
    await loginAs(adminPage, TEST_ADMIN);

    // Wait for connection
    await waitForSyncIndicator(adminPage, 'connected');

    // Simulate network disconnection
    await adminContext.setOffline(true);

    // Verify reconnecting status
    await waitForSyncIndicator(adminPage, 'reconnecting');

    // Restore connection
    await adminContext.setOffline(false);

    // Verify reconnection successful
    await waitForSyncIndicator(adminPage, 'connected');

    // Verify sync functionality works after reconnection
    const ticketCode = await createTestTicket(adminPage);
    await expect(adminPage.locator(`text="${ticketCode}"`)).toBeVisible();
  });

  test('AC4: Performance Optimization - Efficient handling of high-frequency updates', async () => {
    await loginAs(adminPage, TEST_ADMIN);

    // Navigate to performance metrics page or dashboard with metrics
    await adminPage.goto('/dashboard');

    // Enable performance monitoring
    await adminPage.click('[data-testid="sync-status-indicator"]');
    await adminPage.click('text="Chi tiết"');

    // Create multiple tickets rapidly to generate high-frequency events
    const ticketPromises = [];
    for (let i = 0; i < 10; i++) {
      ticketPromises.push(createTestTicket(adminPage));
      await adminPage.waitForTimeout(100); // Small delay between creations
    }

    await Promise.all(ticketPromises);

    // Verify performance metrics
    await expect(adminPage.locator('text="Sự kiện nhận:"')).toBeVisible();
    await expect(adminPage.locator('text="Sự kiện gửi:"')).toBeVisible();

    // Check that batch processing is working (events processed in groups)
    const eventsReceived = await adminPage.locator('[data-testid="events-received"]').textContent();
    const eventsBatched = await adminPage.locator('[data-testid="events-batched"]').textContent();

    expect(parseInt(eventsBatched!)).toBeGreaterThan(0);
    expect(parseInt(eventsReceived!)).toBeGreaterThan(parseInt(eventsBatched!));

    // Verify UI remains responsive (latency metrics should be reasonable)
    const processingLatency = await adminPage.locator('[data-testid="processing-latency"]').textContent();
    expect(parseInt(processingLatency!)).toBeLessThan(1000); // Less than 1 second
  });

  test('AC5: Update Attribution - Real-time display of who made changes and when', async () => {
    // Setup: Staff makes a change
    await loginAs(staffPage, TEST_STAFF);
    const ticketCode = await createTestTicket(staffPage);

    // Admin views the same ticket
    await loginAs(adminPage, TEST_ADMIN);
    await adminPage.goto(`/phieu-sua-chua?search=${ticketCode}`);

    // Staff updates status
    await staffPage.click('button:has-text("Cập nhật trạng thái")');
    await staffPage.selectOption('select[name="new_state"]', 'approved_for_repair');
    await staffPage.fill('textarea[name="reason"]', 'Khách hàng đã xác nhận sửa chữa');
    await staffPage.click('button:has-text("Xác nhận")');

    // Verify admin sees the change with attribution
    await expect(adminPage.locator('text="Đã xác nhận sửa chữa"')).toBeVisible({ timeout: 3000 });

    // Check attribution information
    await expect(adminPage.locator(`text="${TEST_STAFF.name}"`)).toBeVisible();
    await expect(adminPage.locator('text=/\\d{2}:\\d{2}:\\d{2}/')).toBeVisible(); // Timestamp pattern

    // Verify change history shows correct attribution
    await adminPage.click('text="Lịch sử thay đổi"');
    await expect(adminPage.locator('.change-log')).toContainText(TEST_STAFF.name);
    await expect(adminPage.locator('.change-log')).toContainText('Khách hàng đã xác nhận sửa chữa');
  });

  test('AC6: Visual Indicators - Clear visual feedback for connection and sync status', async () => {
    await loginAs(adminPage, TEST_ADMIN);

    // Check sync status indicator is visible
    await expect(adminPage.locator('[data-testid="sync-status-indicator"]')).toBeVisible();

    // Verify connection quality indicator
    await expect(adminPage.locator('.connection-quality')).toBeVisible();

    // Click for detailed view
    await adminPage.click('[data-testid="sync-status-indicator"]');

    // Verify detailed status information
    await expect(adminPage.locator('text="Đã kết nối"')).toBeVisible();
    await expect(adminPage.locator('text="Phiên hoạt động:"')).toBeVisible();
    await expect(adminPage.locator('text="Sự kiện nhận:"')).toBeVisible();
    await expect(adminPage.locator('text="Thời gian kết nối:"')).toBeVisible();

    // Test live update visual feedback
    const ticketCode = await createTestTicket(adminPage);

    // Verify live update animation/indicator appears
    await expect(adminPage.locator('.sync-event-animation')).toBeVisible({ timeout: 2000 });
  });

  test('AC7: Selective Synchronization - Only relevant updates trigger UI changes', async () => {
    await loginAs(adminPage, TEST_ADMIN);
    await loginAs(staffPage, TEST_STAFF);

    // Admin creates ticket A
    const ticketCodeA = await createTestTicket(adminPage);

    // Staff creates ticket B
    const ticketCodeB = await createTestTicket(staffPage);

    // Admin views ticket A details
    await adminPage.goto(`/phieu-sua-chua?search=${ticketCodeA}`);

    // Staff updates ticket B (should not affect admin's view)
    await staffPage.goto(`/phieu-sua-chua?search=${ticketCodeB}`);
    await staffPage.click('button:has-text("Cập nhật trạng thái")');
    await staffPage.selectOption('select[name="new_state"]', 'in_repair');
    await staffPage.fill('textarea[name="reason"]', 'Bắt đầu sửa chữa');
    await staffPage.click('button:has-text("Xác nhận")');

    // Verify admin's ticket A view is not affected
    await expect(adminPage.locator(`text="${ticketCodeA}"`)).toBeVisible();
    await expect(adminPage.locator('text="Đang thực hiện sửa chữa"')).not.toBeVisible();

    // But staff updates ticket A, admin should see it
    await staffPage.goto(`/phieu-sua-chua?search=${ticketCodeA}`);
    await staffPage.click('button:has-text("Cập nhật trạng thái")');
    await staffPage.selectOption('select[name="new_state"]', 'quality_testing');
    await staffPage.fill('textarea[name="reason"]', 'Chuyển sang kiểm tra chất lượng');
    await staffPage.click('button:has-text("Xác nhận")');

    // Admin should see this update
    await expect(adminPage.locator('text="Đang kiểm tra chất lượng"')).toBeVisible({ timeout: 3000 });
  });

  test('AC8: Error Handling - Graceful handling of synchronization errors', async () => {
    await loginAs(adminPage, TEST_ADMIN);

    // Simulate API errors
    await adminContext.route('**/sync_events', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });

    // Attempt to create a ticket (will trigger sync error)
    await adminPage.goto('/phieu-sua-chua');
    await adminPage.click('button:has-text("Tạo phiếu mới")');
    await adminPage.fill('input[name="customer_phone"]', TEST_CUSTOMER.phone);
    await adminPage.fill('input[name="device_info"]', TEST_CUSTOMER.device);
    await adminPage.fill('textarea[name="problem_description"]', TEST_CUSTOMER.problem);
    await adminPage.click('button[type="submit"]');

    // Verify error handling
    await expect(adminPage.locator('text="Lỗi kết nối"')).toBeVisible({ timeout: 5000 });
    await expect(adminPage.locator('.error-message')).toBeVisible();

    // Clear route override
    await adminContext.unroute('**/sync_events');

    // Verify recovery
    await adminPage.reload();
    await waitForSyncIndicator(adminPage, 'connected');
  });

  test('AC9: Batch Updates - Efficient batching prevents UI thrashing', async () => {
    await loginAs(adminPage, TEST_ADMIN);

    // Monitor performance metrics
    await adminPage.goto('/dashboard');
    await adminPage.evaluate(() => {
      (window as any).performanceLog = [];
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = (callback) => {
        (window as any).performanceLog.push(Date.now());
        return originalRAF(callback);
      };
    });

    // Generate rapid successive updates
    for (let i = 0; i < 20; i++) {
      await createTestTicket(adminPage);
      await adminPage.waitForTimeout(50); // Very rapid creation
    }

    // Wait for batching to complete
    await adminPage.waitForTimeout(2000);

    // Check that UI updates were batched (not 20 individual updates)
    const animationFrames = await adminPage.evaluate(() => (window as any).performanceLog.length);
    expect(animationFrames).toBeLessThan(20); // Should be significantly fewer due to batching

    // Verify batch processing metrics
    await adminPage.click('[data-testid="sync-status-indicator"]');
    const batchedEvents = await adminPage.locator('[data-testid="events-batched"]').textContent();
    expect(parseInt(batchedEvents!)).toBeGreaterThan(1); // Multiple batches processed
  });

  test('AC10: Session State Recovery - Proper state sync when returning from disconnection', async () => {
    await loginAs(adminPage, TEST_ADMIN);

    // Create initial state
    const ticketCode = await createTestTicket(adminPage);
    await adminPage.goto(`/phieu-sua-chua?search=${ticketCode}`);

    // Simulate extended disconnection
    await adminContext.setOffline(true);
    await adminPage.waitForTimeout(3000);

    // Meanwhile, simulate state changes that occurred during disconnection
    // (This would normally happen via other sessions or external updates)

    // Reconnect
    await adminContext.setOffline(false);

    // Wait for reconnection and state recovery
    await waitForSyncIndicator(adminPage, 'connected');

    // Verify state is properly synchronized
    await expect(adminPage.locator(`text="${ticketCode}"`)).toBeVisible();

    // Verify sync indicator shows successful recovery
    await adminPage.click('[data-testid="sync-status-indicator"]');
    await expect(adminPage.locator('text="Đã kết nối"')).toBeVisible();
    await expect(adminPage.locator('text=/Thời gian kết nối:/')).toBeVisible();

    // Test that new operations work correctly after recovery
    await adminPage.click('button:has-text("Cập nhật trạng thái")');
    await adminPage.selectOption('select[name="new_state"]', 'completed');
    await adminPage.fill('textarea[name="reason"]', 'Hoàn thành sau khi khôi phục kết nối');
    await adminPage.click('button:has-text("Xác nhận")');

    await expect(adminPage.locator('text="Đã hoàn thành"')).toBeVisible();
  });
});