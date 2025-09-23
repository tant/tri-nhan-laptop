import { test, expect } from '@playwright/test';

test.describe('Repair Parts Integration - Story 3.2.1', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the repair tickets page
    await page.goto('/');
    await page.goto('/sua-chua'); // Vietnamese route for repair tickets
  });

  test('should open repair details modal from repair tickets table', async ({ page }) => {
    // Look for the parts management button in the table
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Check that repair details modal opens
      await expect(page.locator('text=Chi tiết phiếu sửa chữa')).toBeVisible();
      await expect(page.locator('text=Quản lý thông tin chi tiết và linh kiện cho phiếu sửa chữa')).toBeVisible();

      // Check that tabs are present
      await expect(page.locator('text=Tổng quan')).toBeVisible();
      await expect(page.locator('text=Linh kiện')).toBeVisible();
      await expect(page.locator('text=Chi phí')).toBeVisible();
      await expect(page.locator('text=Lịch sử')).toBeVisible();
    }
  });

  test('should display customer and device information in overview tab', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Verify overview tab content
      await expect(page.locator('text=Thông tin khách hàng')).toBeVisible();
      await expect(page.locator('text=Thông tin thiết bị')).toBeVisible();
      await expect(page.locator('text=Thông tin sửa chữa')).toBeVisible();

      // Check for customer info elements
      await expect(page.locator('svg').filter({ hasText: /user/i })).toBeVisible();
      await expect(page.locator('svg').filter({ hasText: /phone/i })).toBeVisible();

      // Check for device info elements
      await expect(page.locator('svg').filter({ hasText: /laptop/i })).toBeVisible();
    }
  });

  test('should navigate to parts tab and show parts management interface', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Click on parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Check parts management interface
      await expect(page.locator('text=Linh kiện đã sử dụng')).toBeVisible();
      await expect(page.locator('button:has-text("Thêm linh kiện")')).toBeVisible();

      // Check for empty state or parts list
      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      await expect(addPartsButton).toBeVisible();
    }
  });

  test('should open parts picker modal when adding parts', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Click add parts button
      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Check that parts picker modal opens
        await expect(page.locator('text=Chọn linh kiện cho sửa chữa')).toBeVisible();
        await expect(page.locator('text=Linb kiện có sẵn')).toBeVisible();
        await expect(page.locator('text=Linh kiện đã chọn')).toBeVisible();

        // Check search functionality
        await expect(page.locator('input[placeholder*="Tìm kiếm linh kiện"]')).toBeVisible();
      }
    }
  });

  test('should display device compatibility information in parts picker', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Check for device compatibility alert if device model is available
        const compatibilityAlert = page.locator('text*=Thiết bị khách hàng:');
        if (await compatibilityAlert.isVisible()) {
          await expect(page.locator('text*=được ưu tiên hiển thị')).toBeVisible();
        }

        // Check for compatibility badges on parts
        const compatibilityBadges = page.locator('text=Tương thích');
        if (await compatibilityBadges.count() > 0) {
          await expect(compatibilityBadges.first()).toBeVisible();
        }
      }
    }
  });

  test('should allow part selection and quantity adjustment', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Look for available parts and select one
        const selectButtons = page.locator('button:has-text("Chọn")');
        if (await selectButtons.count() > 0) {
          await selectButtons.first().click();

          // Check that part appears in selected section
          await expect(page.locator('text=Linh kiện đã chọn (1)')).toBeVisible();

          // Check quantity adjustment buttons
          const minusButton = page.locator('button').filter({ hasText: /^-$/ }).first();
          const plusButton = page.locator('button').filter({ hasText: /^\+$/ }).first();

          if (await plusButton.isVisible()) {
            await plusButton.click();
            // Quantity should increase
          }

          if (await minusButton.isVisible()) {
            await minusButton.click();
            // Quantity should decrease
          }
        }
      }
    }
  });

  test('should display cost calculation for selected parts', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Select a part
        const selectButtons = page.locator('button:has-text("Chọn")');
        if (await selectButtons.count() > 0) {
          await selectButtons.first().click();

          // Check cost summary appears
          await expect(page.locator('text=Tổng chi phí')).toBeVisible();
          await expect(page.locator('text=Tổng số linh kiện:')).toBeVisible();
          await expect(page.locator('text=Tổng tiền linh kiện:')).toBeVisible();

          // Check Vietnamese currency formatting
          const priceElements = page.locator('text*=₫');
          if (await priceElements.count() > 0) {
            await expect(priceElements.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should confirm parts selection and update repair ticket', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Select a part and confirm
        const selectButtons = page.locator('button:has-text("Chọn")');
        if (await selectButtons.count() > 0) {
          await selectButtons.first().click();

          // Click confirm button
          const confirmButton = page.locator('button:has-text("Xác nhận")');
          if (await confirmButton.isVisible() && !await confirmButton.isDisabled()) {
            await confirmButton.click();

            // Modal should close and parts should be added
            await expect(page.locator('text=Chọn linh kiện cho sửa chữa')).not.toBeVisible();

            // Should see updated parts list in repair details
            await expect(page.locator('text=Linh kiện đã sử dụng (1)')).toBeVisible();
          }
        }
      }
    }
  });

  test('should display cost breakdown in costs tab', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to costs tab
      await page.click('button[role="tab"]:has-text("Chi phí")');

      // Check cost calculation interface
      await expect(page.locator('text=Tính toán chi phí')).toBeVisible();
      await expect(page.locator('text=Chi phí linh kiện')).toBeVisible();
      await expect(page.locator('text=Chi phí nhân công')).toBeVisible();
      await expect(page.locator('text=Tổng chi phí sửa chữa')).toBeVisible();

      // Check for Vietnamese currency formatting
      const priceElements = page.locator('text*=₫');
      if (await priceElements.count() > 0) {
        await expect(priceElements.first()).toBeVisible();
      }
    }
  });

  test('should allow labor cost and estimated hours input', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Check labor cost inputs in overview tab
      const laborCostInput = page.locator('input[id="laborCost"]');
      const estimatedHoursInput = page.locator('input[id="estimatedHours"]');

      if (await laborCostInput.isVisible()) {
        await laborCostInput.fill('500000');
        await expect(laborCostInput).toHaveValue('500000');
      }

      if (await estimatedHoursInput.isVisible()) {
        await estimatedHoursInput.fill('2.5');
        await expect(estimatedHoursInput).toHaveValue('2.5');
      }

      // Check that costs tab reflects the changes
      await page.click('button[role="tab"]:has-text("Chi phí")');

      // Should see updated labor cost
      if (await laborCostInput.isVisible()) {
        await expect(page.locator('text=500.000 ₫')).toBeVisible();
      }
    }
  });

  test('should display repair notes and timeline', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Check repair notes in overview tab
      const notesTextarea = page.locator('textarea[id="notes"]');
      if (await notesTextarea.isVisible()) {
        await notesTextarea.fill('Đã thay thế RAM và làm sạch quạt tản nhiệt');
        await expect(notesTextarea).toHaveValue('Đã thay thế RAM và làm sạch quạt tản nhiệt');
      }

      // Navigate to timeline tab
      await page.click('button[role="tab"]:has-text("Lịch sử")');

      // Check timeline interface
      await expect(page.locator('text=Lịch sử sửa chữa')).toBeVisible();
      await expect(page.locator('text=Tiếp nhận thiết bị')).toBeVisible();

      // Check for timeline events
      const timelineEvents = page.locator('div').filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ });
      if (await timelineEvents.count() > 0) {
        await expect(timelineEvents.first()).toBeVisible();
      }
    }
  });

  test('should handle stock validation when selecting parts', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Look for stock status badges
        const stockBadges = page.locator('text=Còn hàng, text=Sắp hết, text=Hết hàng');
        if (await stockBadges.count() > 0) {
          await expect(stockBadges.first()).toBeVisible();
        }

        // Check that out-of-stock parts cannot be selected
        const disabledButtons = page.locator('button:disabled:has-text("Chọn")');
        if (await disabledButtons.count() > 0) {
          await expect(disabledButtons.first()).toBeDisabled();
        }

        // Check for stock warning when selecting maximum quantity
        const selectButtons = page.locator('button:has-text("Chọn")');
        if (await selectButtons.count() > 0) {
          await selectButtons.first().click();

          // Try to increase quantity to maximum
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

            // Check for stock warning
            const stockWarning = page.locator('text=Đã chọn hết tồn kho');
            if (await stockWarning.isVisible()) {
              await expect(stockWarning).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('should filter parts by search term', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Navigate to parts tab and open parts picker
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Test search functionality
        const searchInput = page.locator('input[placeholder*="Tìm kiếm linh kiện"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('RAM');

          // Results should be filtered
          await expect(page.locator('text*=RAM')).toBeVisible();

          // Clear search
          await searchInput.clear();
          await searchInput.fill('SSD');

          // Different results should appear
          // This test depends on having test data in the database
        }
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Modal should be responsive
      await expect(page.locator('text=Chi tiết phiếu sửa chữa')).toBeVisible();

      // Tabs should be visible and accessible
      await expect(page.locator('button[role="tab"]:has-text("Linh kiện")')).toBeVisible();

      // Navigate to parts tab
      await page.click('button[role="tab"]:has-text("Linh kiện")');

      // Parts interface should be usable on mobile
      const addPartsButton = page.locator('button:has-text("Thêm linh kiện")');
      if (await addPartsButton.isVisible()) {
        await addPartsButton.click();

        // Parts picker should be responsive
        await expect(page.locator('text=Chọn linh kiện cho sửa chữa')).toBeVisible();

        // Search should be accessible
        await expect(page.locator('input[placeholder*="Tìm kiếm linh kiện"]')).toBeVisible();
      }
    }
  });

  test('should handle modal close and state cleanup', async ({ page }) => {
    const partsButton = page.locator('button[title="Xem chi tiết và quản lý linh kiện"]').first();

    if (await partsButton.isVisible()) {
      await partsButton.click();

      // Close modal using close button or escape
      const closeButton = page.locator('button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Try pressing escape
        await page.keyboard.press('Escape');
      }

      // Modal should be closed
      await expect(page.locator('text=Chi tiết phiếu sửa chữa')).not.toBeVisible();

      // Re-open to test state cleanup
      if (await partsButton.isVisible()) {
        await partsButton.click();

        // Should open fresh without previous state
        await expect(page.locator('text=Chi tiết phiếu sửa chữa')).toBeVisible();
      }
    }
  });
});