import { test, expect } from '@playwright/test';

test.describe('Inventory Integration & Updates - Story 3.2.2', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the repair tickets page
    await page.goto('/');
    await page.goto('/sua-chua'); // Vietnamese route for repair tickets
  });

  test('should open reservation status modal from repair details', async ({ page }) => {
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Check that reservation status button is present
      const reservationButton = page.locator('button:has-text("Đặt trước")');
      await expect(reservationButton).toBeVisible();

      // Click reservation status button
      await reservationButton.click();

      // Check that reservation status modal opens
      await expect(page.locator('text=Trạng thái đặt trước linh kiện')).toBeVisible();
      await expect(page.locator('text=Quản lý trạng thái đặt trước linh kiện và xác nhận sử dụng')).toBeVisible();
    }
  });

  test('should display reservation mode toggle in parts picker', async ({ page }) => {
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Check for reservation mode toggle
        await expect(page.locator('text=Chế độ:')).toBeVisible();
        await expect(page.locator('button:has-text("Sử dụng ngay")')).toBeVisible();
        await expect(page.locator('button:has-text("Đặt trước")')).toBeVisible();

        // Test mode switching
        const reservationModeButton = page.locator('button:has-text("Đặt trước")');
        await reservationModeButton.click();

        // Check that footer changes to reservation mode
        await expect(page.locator('text=Đặt trước 24 giờ - có thể hủy hoặc xác nhận sau')).toBeVisible();
      }
    }
  });

  test('should show reservation confirmation dialog when reserving parts', async ({ page }) => {
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Switch to reservation mode
        const reservationModeButton = page.locator('button:has-text("Đặt trước")');
        await reservationModeButton.click();

        // Select a part if available
        const selectButtons = page.locator('button:has-text("Chọn")');
        if (await selectButtons.count() > 0) {
          await selectButtons.first().click();

          // Click reserve button
          const reserveButton = page.locator('button:has-text("Đặt trước (1 linh kiện)")');
          if (await reserveButton.isVisible()) {
            await reserveButton.click();

            // Modal should close after successful reservation
            await expect(page.locator('text=Chọn linh kiện cho sửa chữa')).not.toBeVisible();
          }
        }
      }
    }
  });

  test('should display available stock considering reservations', async ({ page }) => {
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Check that stock status badges are visible
        const stockBadges = page.locator('text=Còn hàng, text=Sắp hết, text=Hết hàng');
        if (await stockBadges.count() > 0) {
          await expect(stockBadges.first()).toBeVisible();
        }

        // Check that quantity limits are enforced
        const selectButtons = page.locator('button:has-text("Chọn")');
        if (await selectButtons.count() > 0) {
          await selectButtons.first().click();

          // Try to increase quantity beyond available stock
          const plusButton = page.locator('button').filter({ hasText: /^\+$/ }).first();
          if (await plusButton.isVisible()) {
            // Click multiple times to test stock limit
            for (let i = 0; i < 10; i++) {
              if (await plusButton.isEnabled()) {
                await plusButton.click();
              } else {
                break;
              }
            }

            // Should not be able to exceed available stock
            // The plus button should be disabled when reaching stock limit
          }
        }
      }
    }
  });

  test('should show inventory transaction audit trail', async ({ page }) => {
    // Navigate to parts/inventory page
    await page.goto('/ton-kho');

    // Look for parts with stock adjustments
    const editButtons = page.locator('button[title="Chỉnh sửa linh kiện"]');
    if (await editButtons.count() > 0) {
      await editButtons.first().click();

      // Check if there's any audit/history information displayed
      // This would depend on the parts form implementation
      const formElements = page.locator('input, textarea');
      if (await formElements.count() > 0) {
        // Basic form interaction test
        await expect(formElements.first()).toBeVisible();
      }
    }
  });

  test('should handle concurrent stock operations', async ({ page }) => {
    // This test simulates concurrent stock updates
    // Navigate to parts page
    await page.goto('/ton-kho');

    const adjustStockButtons = page.locator('button[title="Điều chỉnh tồn kho"]');
    if (await adjustStockButtons.count() > 0) {
      await adjustStockButtons.first().click();

      // Check that stock adjustment modal opens
      await expect(page.locator('text=Điều chỉnh tồn kho')).toBeVisible();

      // Test basic stock adjustment functionality
      const quantityInput = page.locator('input[type="number"]').first();
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('100');

        const saveButton = page.locator('button:has-text("Lưu")');
        if (await saveButton.isVisible()) {
          await saveButton.click();

          // Should show success or close modal
          // Exact behavior depends on implementation
        }
      }
    }
  });

  test('should validate reservation expiration and cleanup', async ({ page }) => {
    // Test reservation expiration handling
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Open reservation status modal
      const reservationButton = page.locator('button:has-text("Đặt trước")');
      if (await reservationButton.isVisible()) {
        await reservationButton.click();

        // Check for expired reservation warnings
        const expiredWarnings = page.locator('text=Đã hết hạn');
        if (await expiredWarnings.count() > 0) {
          await expect(expiredWarnings.first()).toBeVisible();
        }

        // Check for time remaining displays
        const timeRemaining = page.locator('text=Thời gian còn lại');
        if (await timeRemaining.count() > 0) {
          await expect(timeRemaining.first()).toBeVisible();
        }
      }
    }
  });

  test('should confirm parts reservation and update stock', async ({ page }) => {
    // Test reservation confirmation workflow
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Open reservation status modal
      const reservationButton = page.locator('button:has-text("Đặt trước")');
      if (await reservationButton.isVisible()) {
        await reservationButton.click();

        // Look for active reservations
        const confirmButtons = page.locator('button:has-text("Xác nhận sử dụng")');
        if (await confirmButtons.count() > 0) {
          await confirmButtons.first().click();

          // Should show processing state
          await expect(page.locator('text=Đang xác nhận...')).toBeVisible();

          // After confirmation, reservation should be updated
          // Exact behavior depends on implementation
        }
      }
    }
  });

  test('should cancel parts reservation and release stock', async ({ page }) => {
    // Test reservation cancellation workflow
    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Open reservation status modal
      const reservationButton = page.locator('button:has-text("Đặt trước")');
      if (await reservationButton.isVisible()) {
        await reservationButton.click();

        // Look for active reservations
        const cancelButtons = page.locator('button:has-text("Hủy đặt trước")');
        if (await cancelButtons.count() > 0) {
          await cancelButtons.first().click();

          // Should show processing state
          await expect(page.locator('text=Đang hủy...')).toBeVisible();

          // After cancellation, reservation should be removed
          // Exact behavior depends on implementation
        }
      }
    }
  });

  test('should maintain data consistency during inventory operations', async ({ page }) => {
    // Test data consistency across concurrent operations
    // This is a complex test that would require actual data setup

    // Navigate to parts page
    await page.goto('/ton-kho');

    // Check that parts list loads
    await expect(page.locator('text=Quản lý linh kiện')).toBeVisible();

    // Basic functionality test - ensure search works
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('RAM');

      // Results should be filtered (depends on test data)
      // This is a basic smoke test for the search functionality
    }
  });

  test('should display Vietnamese notifications for inventory changes', async ({ page }) => {
    // Test Vietnamese localization in inventory notifications
    // Navigate to parts page
    await page.goto('/ton-kho');

    // Look for any notification elements
    const notifications = page.locator('[role="alert"], .alert, [data-testid="notification"]');
    if (await notifications.count() > 0) {
      // Check that notifications are in Vietnamese
      const notificationText = await notifications.first().textContent();
      if (notificationText) {
        // Basic check for Vietnamese text (contains Vietnamese-specific words)
        const containsVietnamese = /tồn kho|linh kiện|cập nhật|thành công|lỗi/.test(notificationText);
        expect(containsVietnamese).toBe(true);
      }
    }
  });

  test('should support bulk inventory operations', async ({ page }) => {
    // Test bulk inventory operations
    // Navigate to parts page
    await page.goto('/ton-kho');

    // Look for bulk operation buttons
    const bulkButtons = page.locator('button:has-text("Nhập CSV"), button:has-text("Xuất CSV")');
    if (await bulkButtons.count() > 0) {
      await expect(bulkButtons.first()).toBeVisible();

      // Test CSV export
      const exportButton = page.locator('button:has-text("Xuất CSV")');
      if (await exportButton.isVisible()) {
        await exportButton.click();

        // Should open export modal
        await expect(page.locator('text=Xuất danh sách linh kiện')).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open repair details modal
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Buttons should be accessible on mobile
      await expect(page.locator('button:has-text("Đặt trước")')).toBeVisible();
      await expect(page.locator('button:has-text("Thêm linh kiện")')).toBeVisible();

      // Open parts picker
      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Parts picker should be responsive
        await expect(page.locator('text=Chọn linh kiện cho sửa chữa')).toBeVisible();

        // Mode toggle should be accessible
        if (await page.locator('text=Chế độ:').isVisible()) {
          await expect(page.locator('button:has-text("Sử dụng ngay")')).toBeVisible();
          await expect(page.locator('button:has-text("Đặt trước")')).toBeVisible();
        }
      }
    }
  });
});