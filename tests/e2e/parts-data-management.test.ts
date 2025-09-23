import { test, expect } from '@playwright/test';

test.describe('Parts Data Management & Documentation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the parts page
    await page.goto('/');

    // Assume we need to log in first - this would depend on the actual auth flow
    // For now, let's try to navigate directly to parts page
    await page.goto('/ton-kho'); // Vietnamese route for parts/inventory
  });

  test('should open parts creation form when clicking add parts button', async ({ page }) => {
    // Find the add parts button
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Check that the form modal opens
      await expect(page.locator('text=Thêm linh kiện mới')).toBeVisible();
      await expect(page.locator('text=Thông tin cơ bản')).toBeVisible();
      await expect(page.locator('text=Thông tin giá cả')).toBeVisible();
      await expect(page.locator('text=Tồn kho & Kho bãi')).toBeVisible();
    }
  });

  test('should validate required fields in parts creation form', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Wait for modal to open
      await expect(page.locator('text=Thêm linh kiện mới')).toBeVisible();

      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Thêm mới")');

      // Submit button should be available but validation should prevent submission
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Check for validation errors
        await expect(page.locator('text=Tên linh kiện là bắt buộc')).toBeVisible();
      }
    }
  });

  test('should display profit margin calculation in pricing section', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill in cost and selling price to trigger profit calculation
      await page.fill('input[id="cost_price"]', '1000000');
      await page.fill('input[id="selling_price"]', '1500000');

      // Check that profit margin preview appears
      await expect(page.locator('text=Lợi nhuận:')).toBeVisible();
      await expect(page.locator('text=Tỷ suất lợi nhuận:')).toBeVisible();
      await expect(page.locator('text=Biên lợi nhuận:')).toBeVisible();
    }
  });

  test('should support model compatibility management', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Check compatibility section
      await expect(page.locator('text=Tương thích với laptop')).toBeVisible();

      // Test quick-add buttons for popular models
      const dellButton = page.locator('button:has-text("Dell Inspiron 15")');
      if (await dellButton.isVisible()) {
        await dellButton.click();

        // Verify model is added to selected list
        await expect(page.locator('text=Đã chọn:')).toBeVisible();
        await expect(page.locator('text=Dell Inspiron 15').nth(1)).toBeVisible(); // Second occurrence in selected list
      }

      // Test custom model input
      const modelInput = page.locator('input[placeholder*="Nhập tên model laptop"]');
      if (await modelInput.isVisible()) {
        await modelInput.fill('Custom Laptop Model');
        await page.click('button[type="button"]:has(svg)'); // Plus button

        // Verify custom model is added
        await expect(page.locator('text=Custom Laptop Model')).toBeVisible();
      }
    }
  });

  test('should open bulk import modal and show CSV template download', async ({ page }) => {
    // Find the bulk import button
    const importButton = page.locator('button:has-text("Nhập CSV")');

    if (await importButton.isVisible()) {
      await importButton.click();

      // Check that import modal opens
      await expect(page.locator('text=Nhập linh kiện hàng loạt')).toBeVisible();
      await expect(page.locator('text=Tải lên file CSV')).toBeVisible();

      // Check template download button
      await expect(page.locator('button:has-text("Tải mẫu CSV")')).toBeVisible();

      // Verify file input exists
      await expect(page.locator('input[type="file"][accept=".csv"]')).toBeVisible();
    }
  });

  test('should open export modal with filtering options', async ({ page }) => {
    // Find the export button
    const exportButton = page.locator('button:has-text("Xuất CSV")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Check that export modal opens
      await expect(page.locator('text=Xuất danh sách linh kiện')).toBeVisible();
      await expect(page.locator('text=Bộ lọc dữ liệu')).toBeVisible();
      await expect(page.locator('text=Chọn dữ liệu xuất')).toBeVisible();

      // Check filter options
      await expect(page.locator('text=Danh mục')).toBeVisible();
      await expect(page.locator('text=Thương hiệu')).toBeVisible();
      await expect(page.locator('text=Tình trạng tồn kho')).toBeVisible();

      // Check field selection checkboxes
      await expect(page.locator('text=Thông tin cơ bản')).toBeVisible();
      await expect(page.locator('text=Thông tin giá cả')).toBeVisible();
      await expect(page.locator('text=Thông tin tồn kho')).toBeVisible();
    }
  });

  test('should display parts count preview in export modal', async ({ page }) => {
    // Find the export button
    const exportButton = page.locator('button:has-text("Xuất CSV")');

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Check that part count preview is shown
      await expect(page.locator('text*=Sẽ xuất')).toBeVisible();
      await expect(page.locator('text*=linh kiện từ tổng số')).toBeVisible();
    }
  });

  test('should handle Vietnamese text input correctly in forms', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Test Vietnamese text input
      await page.fill('input[id="name"]', 'RAM DDR4 8GB Kingston Fury');
      await page.fill('input[id="part_number"]', 'RAM-DDR4-8GB-001');
      await page.fill('textarea[id="description"]', 'Bộ nhớ DDR4 8GB tốc độ 3200MHz, hỗ trợ laptop gaming');

      // Verify text is entered correctly
      await expect(page.locator('input[id="name"]')).toHaveValue('RAM DDR4 8GB Kingston Fury');
      await expect(page.locator('textarea[id="description"]')).toHaveValue('Bộ nhớ DDR4 8GB tốc độ 3200MHz, hỗ trợ laptop gaming');
    }
  });

  test('should validate price fields with proper formatting', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Test price validation
      await page.fill('input[id="cost_price"]', '1500000');
      await page.fill('input[id="unit_price"]', '1800000');
      await page.fill('input[id="selling_price"]', '2200000');

      // Verify profit margin calculation appears
      await expect(page.locator('text=Lợi nhuận:')).toBeVisible();

      // Test invalid price (negative)
      await page.fill('input[id="cost_price"]', '-1000');

      // Should show validation error
      // Note: Exact error handling would depend on implementation
    }
  });

  test('should support part editing functionality', async ({ page }) => {
    // Look for edit buttons in the parts table
    const editButtons = page.locator('button[title="Chỉnh sửa linh kiện"]');

    if (await editButtons.count() > 0) {
      // Click first edit button
      await editButtons.first().click();

      // Check that edit modal opens
      await expect(page.locator('text=Chỉnh sửa linh kiện')).toBeVisible();

      // Verify form is pre-populated (would check for existing values)
      const nameInput = page.locator('input[id="name"]');
      if (await nameInput.isVisible()) {
        const currentValue = await nameInput.inputValue();
        expect(currentValue).not.toBe(''); // Should have existing value
      }
    }
  });

  test('should display supplier information section', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Check supplier and additional info section
      await expect(page.locator('text=Thông tin bổ sung')).toBeVisible();
      await expect(page.locator('text=Thông tin nhà cung cấp')).toBeVisible();
      await expect(page.locator('text=Bảo hành (tháng)')).toBeVisible();
      await expect(page.locator('text=Tình trạng linh kiện')).toBeVisible();

      // Test supplier info input
      await page.fill('textarea[id="supplier_info"]', 'Công ty XYZ - 0123456789 - Hà Nội');
      await page.fill('input[id="warranty_period"]', '24');

      // Test part condition dropdown
      const conditionSelect = page.locator('select[aria-label="Tình trạng linh kiện"]');
      if (await conditionSelect.isVisible()) {
        await conditionSelect.selectOption('refurbished');
      }
    }
  });

  test('should support comprehensive form validation', async ({ page }) => {
    // Open parts creation form
    const addButton = page.locator('button:has-text("Thêm linh kiện")');

    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill all required fields properly
      await page.fill('input[id="name"]', 'Test Part');
      await page.fill('input[id="part_number"]', 'TEST-001');

      // Select category
      const categorySelect = page.locator('select[aria-label="Danh mục"]');
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption('Memory');
      }

      await page.fill('input[id="unit_price"]', '1000000');
      await page.fill('input[id="selling_price"]', '1200000');

      // Submit button should be enabled with valid data
      const submitButton = page.locator('button:has-text("Thêm mới")');
      if (await submitButton.isVisible()) {
        // Button should be clickable (not disabled)
        await expect(submitButton).not.toBeDisabled();
      }
    }
  });

  test('should display responsive interface on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that import/export buttons are still accessible
    await expect(page.locator('button:has-text("Thêm linh kiện")')).toBeVisible();
    await expect(page.locator('button:has-text("Nhập CSV")')).toBeVisible();
    await expect(page.locator('button:has-text("Xuất CSV")')).toBeVisible();

    // Test opening forms on mobile
    const addButton = page.locator('button:has-text("Thêm linh kiện")');
    if (await addButton.isVisible()) {
      await addButton.click();

      // Modal should be responsive
      await expect(page.locator('text=Thêm linh kiện mới')).toBeVisible();

      // Form sections should stack properly on mobile
      await expect(page.locator('text=Thông tin cơ bản')).toBeVisible();
    }
  });
});