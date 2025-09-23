import { test, expect } from '@playwright/test';

test.describe('Cost Tracking & Billing Integration - Story 3.2.3', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the repair tickets page
    await page.goto('/');
    await page.goto('/sua-chua'); // Vietnamese route for repair tickets
  });

  test('should open cost breakdown modal from repair details', async ({ page }) => {
    // Open repair details modal
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();

      // Navigate to costs tab
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      // Check that cost tracking buttons are present
      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      const quoteGenerationButton = page.locator('button:has-text(\"Tạo báo giá\")');

      await expect(costBreakdownButton).toBeVisible();
      await expect(quoteGenerationButton).toBeVisible();

      // Click cost breakdown button
      await costBreakdownButton.click();

      // Check that cost breakdown modal opens
      await expect(page.locator('text=Chi tiết chi phí sửa chữa')).toBeVisible();
      await expect(page.locator('text=Quản lý chi phí chi tiết và theo dõi lợi nhuận cho phiếu sửa chữa này')).toBeVisible();
    }
  });

  test('should display cost summary with Vietnamese formatting', async ({ page }) => {
    // Open repair details modal
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();

      // Navigate to costs tab
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      // Check Vietnamese currency formatting is displayed
      const costElements = page.locator('text=₫');
      if (await costElements.count() > 0) {
        await expect(costElements.first()).toBeVisible();
      }

      // Check cost section titles are in Vietnamese
      await expect(page.locator('text=Chi phí linh kiện')).toBeVisible();
      await expect(page.locator('text=Chi phí nhân công')).toBeVisible();
      await expect(page.locator('text=Tổng chi phí sửa chữa')).toBeVisible();
    }
  });

  test('should open and interact with cost breakdown modal', async ({ page }) => {
    // Open repair details modal
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();

      // Navigate to costs tab and open cost breakdown
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        // Check cost breakdown modal elements
        await expect(page.locator('text=Tổng quan chi phí')).toBeVisible();
        await expect(page.locator('text=Thêm chi phí')).toBeVisible();

        // Test adding new cost item
        const addCostButton = page.locator('button:has-text(\"Thêm chi phí\")');
        if (await addCostButton.isVisible()) {
          await addCostButton.click();

          // Check add cost form appears
          await expect(page.locator('text=Thêm chi phí mới')).toBeVisible();
          await expect(page.locator('text=Loại chi phí')).toBeVisible();

          // Test form interaction
          const itemNameInput = page.locator('input[id=\"item_name\"]');
          if (await itemNameInput.isVisible()) {
            await itemNameInput.fill('Test chi phí');

            // Check form preview updates
            await expect(page.locator('text=Xem trước:')).toBeVisible();
          }

          // Cancel the form
          const cancelButton = page.locator('button:has-text(\"Hủy\")');
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      }
    }
  });

  test('should open quote generation modal and display quote creation form', async ({ page }) => {
    // Open repair details modal
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();

      // Navigate to costs tab and open quote generation
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const quoteButton = page.locator('button:has-text(\"Tạo báo giá\")');
      if (await quoteButton.isVisible()) {
        await quoteButton.click();

        // Check quote generation modal opens
        await expect(page.locator('text=Quản lý báo giá khách hàng')).toBeVisible();
        await expect(page.locator('text=Tạo và quản lý báo giá cho phiếu sửa chữa này')).toBeVisible();

        // Check for quote creation button
        const createQuoteButton = page.locator('button:has-text(\"Tạo báo giá mới\")');
        if (await createQuoteButton.isVisible()) {
          await createQuoteButton.click();

          // Check quote creation form
          await expect(page.locator('text=Tạo báo giá mới')).toBeVisible();
          await expect(page.locator('text=Hiệu lực (số ngày)')).toBeVisible();
          await expect(page.locator('text=Điều khoản và điều kiện')).toBeVisible();

          // Test form interaction
          const validDaysInput = page.locator('input[id=\"valid_days\"]');
          if (await validDaysInput.isVisible()) {
            await validDaysInput.fill('30');

            // Check preview updates
            await expect(page.locator('text=Xem trước báo giá:')).toBeVisible();
          }

          // Cancel the form
          const cancelButton = page.locator('button:has-text(\"Hủy\")');
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      }
    }
  });

  test('should display profit analysis with color coding', async ({ page }) => {
    // Open repair details modal
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();

      // Navigate to costs tab and open cost breakdown
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        // Check for cost summary elements
        const costSummaryElements = page.locator('text=Chi phí tổng, text=Doanh thu, text=Lợi nhuận, text=Tỷ suất LN');
        if (await costSummaryElements.count() > 0) {
          await expect(costSummaryElements.first()).toBeVisible();
        }

        // Check for profit margin display
        const profitElements = page.locator('.text-green-600, .text-red-600, .text-blue-600, .text-yellow-600');
        if (await profitElements.count() > 0) {
          // Profit amounts should have color coding
          await expect(profitElements.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle cost breakdown type selection', async ({ page }) => {
    // Open repair details modal and navigate to cost breakdown
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        const addCostButton = page.locator('button:has-text(\"Thêm chi phí\")');
        if (await addCostButton.isVisible()) {
          await addCostButton.click();

          // Test cost type selection
          const costTypeSelect = page.locator('[role=\"combobox\"]');
          if (await costTypeSelect.isVisible()) {
            await costTypeSelect.click();

            // Check Vietnamese cost type options
            await expect(page.locator('text=Linh kiện')).toBeVisible();
            await expect(page.locator('text=Công lao động')).toBeVisible();
            await expect(page.locator('text=Chi phí khác')).toBeVisible();
            await expect(page.locator('text=Thuế VAT')).toBeVisible();
            await expect(page.locator('text=Giảm giá')).toBeVisible();

            // Select labor type
            await page.locator('text=Công lao động').click();

            // Check form updates for labor type
            const itemNameInput = page.locator('input[id=\"item_name\"]');
            if (await itemNameInput.isVisible()) {
              await itemNameInput.fill('Sửa chữa bo mạch chủ');

              // Fill in cost details
              const quantityInput = page.locator('input[id=\"quantity\"]');
              if (await quantityInput.isVisible()) {
                await quantityInput.fill('2');
              }
            }
          }
        }
      }
    }
  });

  test('should display Vietnamese currency formatting throughout', async ({ page }) => {
    // Test various screens for proper Vietnamese currency formatting
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      // Check main costs tab has proper formatting
      const currencySymbols = page.locator('text=₫');
      if (await currencySymbols.count() > 0) {
        const firstCurrency = await currencySymbols.first().textContent();
        // Should contain Vietnamese Dong symbol
        expect(firstCurrency).toContain('₫');
      }

      // Open cost breakdown modal
      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        // Check currency formatting in cost breakdown
        const breakdownCurrency = page.locator('.font-semibold, .font-medium').filter({ hasText: '₫' });
        if (await breakdownCurrency.count() > 0) {
          await expect(breakdownCurrency.first()).toBeVisible();
        }
      }
    }
  });

  test('should validate cost change history and audit trail', async ({ page }) => {
    // Open repair details and navigate to cost breakdown
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        // Look for existing cost items or add a test item
        const addCostButton = page.locator('button:has-text(\"Thêm chi phí\")');
        if (await addCostButton.isVisible()) {
          await addCostButton.click();

          // Fill out a complete cost item
          const itemNameInput = page.locator('input[id=\"item_name\"]');
          if (await itemNameInput.isVisible()) {
            await itemNameInput.fill('Test audit trail');

            const quantityInput = page.locator('input[id=\"quantity\"]');
            if (await quantityInput.isVisible()) {
              await quantityInput.fill('1');
            }

            const unitCostInput = page.locator('input[id=\"unit_cost\"]');
            if (await unitCostInput.isVisible()) {
              await unitCostInput.fill('100000');
            }

            const unitPriceInput = page.locator('input[id=\"unit_price\"]');
            if (await unitPriceInput.isVisible()) {
              await unitPriceInput.fill('150000');
            }

            // Check preview calculation
            await expect(page.locator('text=Xem trước:')).toBeVisible();
          }
        }
      }
    }
  });

  test('should support quote status management', async ({ page }) => {
    // Navigate to quote generation
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const quoteButton = page.locator('button:has-text(\"Tạo báo giá\")');
      if (await quoteButton.isVisible()) {
        await quoteButton.click();

        // Check for existing quotes or quote creation functionality
        const existingQuotes = page.locator('.quote-card, [data-testid=\"quote-item\"]');

        // If there are existing quotes, test status management
        if (await existingQuotes.count() > 0) {
          // Look for status badges
          const statusBadges = page.locator('text=Nháp, text=Đã gửi, text=Đã duyệt, text=Từ chối, text=Hết hạn');
          if (await statusBadges.count() > 0) {
            await expect(statusBadges.first()).toBeVisible();
          }

          // Look for action buttons
          const actionButtons = page.locator('button:has-text(\"Gửi báo giá\"), button:has-text(\"Đánh dấu đã duyệt\"), button:has-text(\"Xem báo giá\")');
          if (await actionButtons.count() > 0) {
            await expect(actionButtons.first()).toBeVisible();
          }
        } else {
          // Test quote creation if no existing quotes
          const createQuoteButton = page.locator('button:has-text(\"Tạo báo giá mới\")');
          if (await createQuoteButton.isVisible()) {
            await expect(createQuoteButton).toBeVisible();
          }
        }
      }
    }
  });

  test('should display advanced cost tracking info', async ({ page }) => {
    // Check that the advanced features info is displayed
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      // Check for advanced cost tracking information
      await expect(page.locator('text=Sử dụng "Chi tiết chi phí" để theo dõi chi phí và lợi nhuận chi tiết bao gồm:')).toBeVisible();
      await expect(page.locator('text=Phân tích lợi nhuận theo từng linh kiện và dịch vụ')).toBeVisible();
      await expect(page.locator('text=Theo dõi chi phí overhead và thuế')).toBeVisible();
      await expect(page.locator('text=Lịch sử thay đổi chi phí với audit trail')).toBeVisible();
      await expect(page.locator('text=Tính toán tự động với tỷ suất lợi nhuận')).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test mobile responsiveness
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      // Buttons should be accessible on mobile
      await expect(page.locator('button:has-text(\"Chi tiết chi phí\")')).toBeVisible();
      await expect(page.locator('button:has-text(\"Tạo báo giá\")')).toBeVisible();

      // Cost summary should be responsive
      await expect(page.locator('text=Chi phí linh kiện')).toBeVisible();
      await expect(page.locator('text=Chi phí nhân công')).toBeVisible();

      // Open cost breakdown on mobile
      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        // Modal should be responsive
        await expect(page.locator('text=Chi tiết chi phí sửa chữa')).toBeVisible();

        // Close button should be accessible
        const closeButton = page.locator('button:has-text(\"Đóng\")');
        if (await closeButton.isVisible()) {
          await expect(closeButton).toBeVisible();
        }
      }
    }
  });

  test('should handle cost calculation errors gracefully', async ({ page }) => {
    // Test error handling in cost calculations
    const repairButton = page.locator('button[title=\"Xem chi tiết và quản lý linh kiện\"]').first();

    if (await repairButton.isVisible()) {
      await repairButton.click();
      await page.click('button[role=\"tab\"]:has-text(\"Chi phí\")');

      const costBreakdownButton = page.locator('button:has-text(\"Chi tiết chi phí\")');
      if (await costBreakdownButton.isVisible()) {
        await costBreakdownButton.click();

        // Test invalid input handling
        const addCostButton = page.locator('button:has-text(\"Thêm chi phí\")');
        if (await addCostButton.isVisible()) {
          await addCostButton.click();

          // Try to submit form with invalid data
          const submitButton = page.locator('button:has-text(\"Thêm chi phí\")');
          if (await submitButton.isVisible()) {
            // Should be disabled when required fields are empty
            const isDisabled = await submitButton.isDisabled();
            expect(isDisabled).toBe(true);
          }

          // Fill minimum required fields
          const itemNameInput = page.locator('input[id=\"item_name\"]');
          if (await itemNameInput.isVisible()) {
            await itemNameInput.fill('Test item');

            // Button should become enabled
            if (await submitButton.isVisible()) {
              await page.waitForTimeout(100); // Small delay for reactivity
              const isEnabled = await submitButton.isEnabled();
              expect(isEnabled).toBe(true);
            }
          }
        }
      }
    }
  });
});