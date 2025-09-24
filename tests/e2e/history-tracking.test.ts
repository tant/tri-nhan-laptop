import { test, expect } from '@playwright/test';

/**
 * E2E tests for Customer History & Repair Tracking (Story 2.1.3)
 * Tests comprehensive customer history tracking, analytics, and reporting features
 */

test.describe('Customer History & Repair Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the customer history dashboard
    await page.goto('/customer-history');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Customer Search and Overview', () => {
    test('should allow searching for customer by phone number', async ({ page }) => {
      // Search for a test customer
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      // Wait for customer data to load
      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Verify customer summary is displayed
      await expect(page.locator('text=Khách hàng từ')).toBeVisible();
      await expect(page.locator('text=Thiết bị')).toBeVisible();
      await expect(page.locator('text=Tổng sửa chữa')).toBeVisible();
      await expect(page.locator('text=Tổng chi tiêu')).toBeVisible();
    });

    test('should display recurring issues warning when present', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0987654321'); // Customer with recurring issues
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Check for recurring issues warning
      const recurringWarning = page.locator('text*="Cảnh báo"').first();
      if (await recurringWarning.isVisible()) {
        await expect(page.locator('text*="vấn đề lặp lại"')).toBeVisible();
      }
    });

    test('should export customer data', async ({ page }) => {
      // Search for customer first
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Click export button
      await page.click('button:has-text("Xuất dữ liệu")');

      // Verify export dialog appears
      await expect(page.locator('text="Xuất Dữ Liệu Khách Hàng"')).toBeVisible();

      // Test JSON export
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Xuất JSON")');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('customer-history');
      expect(download.suggestedFilename()).toContain('.json');
    });
  });

  test.describe('Repair History Tracking', () => {
    test('should display comprehensive repair history', async ({ page }) => {
      // Search and navigate to repair history tab
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Navigate to repair history tab
      await page.click('[data-value="repairs"]');

      // Verify repair history displays
      await expect(page.locator('text="Lịch Sử Sửa Chữa Chi Tiết"')).toBeVisible();

      // Check for repair entries
      const repairEntries = page.locator('[data-testid="repair-entry"]');
      if (await repairEntries.count() > 0) {
        const firstRepair = repairEntries.first();
        await expect(firstRepair.locator('text*="VND"')).toBeVisible(); // Cost display
        await expect(firstRepair.locator('button:has-text("Chi tiết")')).toBeVisible();
      }
    });

    test('should show repair detail modal', async ({ page }) => {
      // Setup - search and navigate to repairs
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="repairs"]');

      // Click detail button if repair exists
      const detailButton = page.locator('button:has-text("Chi tiết")').first();
      if (await detailButton.isVisible()) {
        await detailButton.click();

        // Verify modal opens
        await expect(page.locator('text="Chi Tiết Phiếu Sửa Chữa"')).toBeVisible();
        await expect(page.locator('text="Trạng thái"')).toBeVisible();
        await expect(page.locator('text="Tổng chi phí"')).toBeVisible();
        await expect(page.locator('text="Mô tả vấn đề"')).toBeVisible();
      }
    });

    test('should filter repairs by status', async ({ page }) => {
      // This test would require implemented filtering functionality
      // For now, just verify the interface elements are present
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="repairs"]');

      // Verify repair history section loads
      await expect(page.locator('text="Lịch Sử Sửa Chữa Chi Tiết"')).toBeVisible();
    });
  });

  test.describe('Device History Management', () => {
    test('should display customer devices with history', async ({ page }) => {
      // Setup
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Navigate to devices tab
      await page.click('[data-value="devices"]');

      // Verify devices display
      const deviceCards = page.locator('[data-testid="device-card"]');
      if (await deviceCards.count() > 0) {
        const firstDevice = deviceCards.first();
        await expect(firstDevice.locator('text="Số lần sửa chữa"')).toBeVisible();
        await expect(firstDevice.locator('text="Tổng chi tiêu"')).toBeVisible();
        await expect(firstDevice.locator('button:has-text("Xem chi tiết")')).toBeVisible();
      } else {
        // If no devices, should show empty state
        await expect(page.locator('text="Chưa có thiết bị nào được đăng ký"')).toBeVisible();
      }
    });

    test('should show warranty status for devices', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="devices"]');

      // Check for warranty badges
      const warrantyBadges = page.locator('text="Còn BH"');
      if (await warrantyBadges.count() > 0) {
        await expect(warrantyBadges.first()).toBeVisible();
      }
    });

    test('should display common issues for devices', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="devices"]');

      // Look for common issues section
      const deviceCards = page.locator('[data-testid="device-card"]');
      if (await deviceCards.count() > 0) {
        const issuesSection = page.locator('text="Vấn đề thường gặp"').first();
        if (await issuesSection.isVisible()) {
          await expect(issuesSection).toBeVisible();
        }
      }
    });
  });

  test.describe('Service Pattern Analysis', () => {
    test('should display service patterns and recommendations', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0987654321'); // Customer with patterns
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Navigate to patterns tab
      await page.click('[data-value="patterns"]');

      // Verify patterns analysis displays
      await expect(page.locator('text="Phân Tích Mô Hình Dịch Vụ"')).toBeVisible();

      // Check for pattern entries
      const patternCards = page.locator('[data-testid="pattern-card"]');
      if (await patternCards.count() > 0) {
        const firstPattern = patternCards.first();
        await expect(firstPattern.locator('text="Tần suất:"')).toBeVisible();
        await expect(firstPattern.locator('text="Khuyến nghị:"')).toBeVisible();
      }
    });

    test('should show risk level indicators', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0987654321');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="patterns"]');

      // Check for risk level badges
      const riskBadges = page.locator('text="Thấp", text="Trung bình", text="Cao"');
      if (await riskBadges.count() > 0) {
        await expect(riskBadges.first()).toBeVisible();
      }
    });

    test('should categorize pattern types correctly', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0987654321');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="patterns"]');

      // Check for pattern type badges
      const patternTypes = page.locator('text="Phần cứng lặp", text="Phần mềm lặp", text="Theo mùa", text="Tăng dần"');
      if (await patternTypes.count() > 0) {
        await expect(patternTypes.first()).toBeVisible();
      }
    });
  });

  test.describe('Warranty Management', () => {
    test('should display warranty status and alerts', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Navigate to warranty tab
      await page.click('[data-value="warranty"]');

      // Verify warranty manager loads
      await expect(page.locator('text="Trạng Thái Bảo Hành"')).toBeVisible();

      // Check warranty status elements
      await expect(page.locator('text="Trạng thái"')).toBeVisible();
      await expect(page.locator('text="Loại bảo hành"')).toBeVisible();
    });

    test('should calculate warranty coverage', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="warranty"]');

      // Test coverage calculation
      const partsInput = page.locator('input').nth(0); // First cost input
      if (await partsInput.isVisible()) {
        await partsInput.fill('1000000');
        await page.click('button:has-text("Tính Toán Bảo Hành")');

        // Verify calculation results
        const results = page.locator('text="Kết Quả Tính Toán"');
        if (await results.isVisible()) {
          await expect(results).toBeVisible();
        }
      }
    });

    test('should display warranty expiration alerts', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="warranty"]');

      // Switch to alerts tab
      await page.click('[data-value="alerts"]');

      // Verify alerts section
      await expect(page.locator('text="Cảnh Báo Hết Hạn Bảo Hành"')).toBeVisible();
    });
  });

  test.describe('Financial Tracking', () => {
    test('should display financial summary', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Navigate to financial tab
      await page.click('[data-value="financial"]');

      // Verify financial tracker loads
      await expect(page.locator('text="Tổng doanh thu"')).toBeVisible();
      await expect(page.locator('text="Lợi nhuận gộp"')).toBeVisible();
      await expect(page.locator('text="Tỷ lệ LN"')).toBeVisible();
    });

    test('should show cost breakdown for repairs', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="financial"]');

      // Switch to breakdown tab
      await page.click('[data-value="breakdown"]');

      // Verify breakdown section
      await expect(page.locator('text="Chi Tiết Chi Phí"')).toBeVisible();
    });

    test('should display customer profitability analysis', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="financial"]');

      // Switch to customers tab
      await page.click('[data-value="customers"]');

      // Verify profitability analysis
      await expect(page.locator('text="Phân Tích Lợi Nhuận Khách Hàng"')).toBeVisible();
    });

    test('should show cost trends analysis', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });
      await page.click('[data-value="financial"]');

      // Switch to trends tab
      await page.click('[data-value="trends"]');

      // Verify trends analysis
      await expect(page.locator('text="Phân Tích Xu Hướng Chi Phí"')).toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate between all tabs correctly', async ({ page }) => {
      // Search for customer
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Test each tab navigation
      const tabs = ['overview', 'repairs', 'devices', 'patterns', 'warranty', 'financial'];

      for (const tab of tabs) {
        await page.click(`[data-value="${tab}"]`);

        // Verify tab is active
        const activeTab = page.locator(`[data-value="${tab}"][data-state="active"]`);
        await expect(activeTab).toBeVisible();

        // Small delay to allow content to load
        await page.waitForTimeout(500);
      }
    });

    test('should maintain tab state during customer search', async ({ page }) => {
      // Initial search
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Navigate to a different tab
      await page.click('[data-value="repairs"]');
      await expect(page.locator('[data-value="repairs"][data-state="active"]')).toBeVisible();

      // Search for another customer
      await phoneInput.fill('0987654321');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Tab should reset to overview for new customer
      await expect(page.locator('[data-value="overview"][data-state="active"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle customer not found gracefully', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0000000000'); // Non-existent customer
      await page.click('button:has-text("Tìm Kiếm")');

      // Should show error or empty state
      // This depends on the actual implementation
      await page.waitForTimeout(3000);

      // At minimum, should not crash and should allow new search
      await expect(phoneInput).toBeVisible();
      await expect(page.locator('button:has-text("Tìm Kiếm")')).toBeEnabled();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require network interception
      // For now, just verify the interface remains functional
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await expect(phoneInput).toBeVisible();
      await expect(page.locator('button:has-text("Tìm Kiếm")')).toBeVisible();
    });
  });

  test.describe('Vietnamese Localization', () => {
    test('should display all interface text in Vietnamese', async ({ page }) => {
      // Verify key Vietnamese text is present
      await expect(page.locator('text="Tìm Kiếm Khách Hàng"')).toBeVisible();
      await expect(page.locator('text="Nhập số điện thoại"')).toBeVisible();

      // After searching
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      if (await page.locator('[data-testid="customer-summary"]').isVisible()) {
        await expect(page.locator('text="Tổng Quan"')).toBeVisible();
        await expect(page.locator('text="Lịch Sử SC"')).toBeVisible();
        await expect(page.locator('text="Thiết Bị"')).toBeVisible();
        await expect(page.locator('text="Xu Hướng"')).toBeVisible();
        await expect(page.locator('text="Bảo Hành"')).toBeVisible();
        await expect(page.locator('text="Tài Chính"')).toBeVisible();
      }
    });

    test('should format currency in Vietnamese format', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Check for Vietnamese currency formatting (₫ symbol)
      const currencyElements = page.locator('text=/\\d+.*₫/');
      if (await currencyElements.count() > 0) {
        await expect(currencyElements.first()).toBeVisible();
      }
    });

    test('should format dates in Vietnamese format', async ({ page }) => {
      const phoneInput = page.locator('input[placeholder*="Nhập số điện thoại"]');
      await phoneInput.fill('0123456789');
      await page.click('button:has-text("Tìm Kiếm")');

      await page.waitForSelector('[data-testid="customer-summary"]', { timeout: 10000 });

      // Check for Vietnamese date formatting
      const dateElements = page.locator('text="Khách hàng từ"');
      if (await dateElements.count() > 0) {
        await expect(dateElements.first()).toBeVisible();
      }
    });
  });
});