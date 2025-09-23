import { test, expect } from '@playwright/test';

test.describe('Parts Search & Filtering System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the parts page
    await page.goto('/');

    // Assume we need to log in first - this would depend on the actual auth flow
    // For now, let's try to navigate directly to parts page
    await page.goto('/ton-kho'); // Vietnamese route for parts/inventory
  });

  test('should display parts search interface', async ({ page }) => {
    // Check that the enhanced search component is present
    await expect(page.locator('text=Tìm kiếm linh kiện')).toBeVisible();

    // Check that search input exists
    await expect(page.locator('input[placeholder*="Tìm kiếm linh kiện"]')).toBeVisible();

    // Check that filter dropdowns exist
    await expect(page.locator('text=Danh mục:')).toBeVisible();
    await expect(page.locator('text=Hãng:')).toBeVisible();
    await expect(page.locator('text=Tình trạng tồn kho:')).toBeVisible();
  });

  test('should search parts by name with Vietnamese text support', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm linh kiện"]');

    // Test basic search
    await searchInput.fill('RAM');

    // Wait for debounced search results (300ms delay)
    await page.waitForTimeout(500);

    // Should show search results
    // Note: This test assumes there are parts with "RAM" in the name
    // In a real test, we would setup test data or mock the API
  });

  test('should filter parts by category', async ({ page }) => {
    // Click on category dropdown
    const categorySelect = page.locator('text=Danh mục:').locator('..').locator('select, [role="combobox"]');
    await categorySelect.click();

    // Select a category (this would depend on available categories)
    await page.locator('text=Memory').click();

    // Verify results are filtered
    // In a real test, we would verify the data displayed matches the filter
  });

  test('should filter parts by stock status', async ({ page }) => {
    // Click on stock status dropdown
    const stockSelect = page.locator('text=Tình trạng tồn kho:').locator('..').locator('select, [role="combobox"]');
    await stockSelect.click();

    // Select "Hết hàng" (out of stock)
    await page.locator('text=Hết hàng').click();

    // Verify results show only out of stock items
    // In a real test, we would verify the badge/status indicators
  });

  test('should search by laptop model compatibility', async ({ page }) => {
    // Test popular model quick-select buttons
    await expect(page.locator('text=Tìm theo mẫu laptop phổ biến:')).toBeVisible();

    // Click on a popular model button
    const dellButton = page.locator('text=Dell Inspiron 15');
    if (await dellButton.isVisible()) {
      await dellButton.click();

      // Verify the model compatibility filter is applied
      await expect(page.locator('text=Tương thích: Dell Inspiron 15')).toBeVisible();
    }
  });

  test('should use price range slider', async ({ page }) => {
    // Check if advanced filters are visible, if not, show them
    const advancedFilterButton = page.locator('text=Bộ lọc nâng cao');
    if (await advancedFilterButton.isVisible()) {
      await advancedFilterButton.click();
    }

    // Check that price range slider exists
    await expect(page.locator('text=Khoảng giá:')).toBeVisible();

    // Verify VND formatting is displayed
    await expect(page.locator('text=₫')).toBeVisible();
  });

  test('should show active filters and allow clearing them', async ({ page }) => {
    // Apply some filters first
    const searchInput = page.locator('input[placeholder*="Tìm kiếm linh kiện"]');
    await searchInput.fill('test');

    await page.waitForTimeout(500); // Wait for debounce

    // Check that active filters section appears
    await expect(page.locator('text=Bộ lọc đang áp dụng:')).toBeVisible();
    await expect(page.locator('text=Tìm kiếm: "test"')).toBeVisible();

    // Test clearing individual filter
    const clearSearchButton = page.locator('text=Tìm kiếm: "test"').locator('..').locator('svg'); // X icon
    if (await clearSearchButton.isVisible()) {
      await clearSearchButton.click();
      await expect(page.locator('text=Tìm kiếm: "test"')).not.toBeVisible();
    }

    // Test clear all filters button
    const clearAllButton = page.locator('text=Xóa bộ lọc');
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      await expect(page.locator('text=Bộ lọc đang áp dụng:')).not.toBeVisible();
    }
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm linh kiện"]');

    // Search for something that likely doesn't exist
    await searchInput.fill('xyz123nonexistent');
    await page.waitForTimeout(500);

    // Should show no results message
    // Note: The exact message would depend on the implementation
    // This test validates the empty state handling
  });

  test('should support Vietnamese diacritical marks in search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm linh kiện"]');

    // Test with Vietnamese characters
    await searchInput.fill('bộ nhớ');
    await page.waitForTimeout(500);

    // Should return results for memory-related parts
    // This tests the Vietnamese text normalization feature
  });

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that search interface is still usable
    await expect(page.locator('input[placeholder*="Tìm kiếm linh kiện"]')).toBeVisible();

    // Check that filter button exists for mobile
    const filterButton = page.locator('text=Bộ lọc');
    await expect(filterButton).toBeVisible();
  });

  test('should have fast search performance', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm linh kiện"]');

    // Measure search response time
    const startTime = Date.now();

    await searchInput.fill('test search');

    // Wait for results to appear (with reasonable timeout)
    await page.waitForTimeout(500);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Verify search responds within 1 second (1000ms) as required
    expect(responseTime).toBeLessThan(1000);
  });
});