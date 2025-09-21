import { test, expect } from '@playwright/test';

test.describe('Debug Repair Lookup', () => {
  test('should debug the lookup functionality', async ({ page }) => {
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Go to home page
    await page.goto('/');

    // Verify basic elements are there
    await expect(page.locator('h1:has-text("Trí Nhân Laptop")')).toBeVisible();

    // Fill form
    await page.locator('input#ticket').fill('TK001');
    await page.locator('input#phone').fill('0901234567');

    // Take a screenshot before clicking
    await page.screenshot({ path: 'test-results/before-search.png' });

    // Click search and wait a bit
    await page.locator('button[type="submit"]:has-text("TRA CỨU")').click();

    // Wait for any network requests to complete
    await page.waitForTimeout(3000);

    // Take a screenshot after clicking
    await page.screenshot({ path: 'test-results/after-search.png' });

    // Check for any errors
    console.log('Console errors:', consoleErrors);

    // Check if any results appear
    const hasResults = await page.locator('text=Thông Tin Phiếu Sửa Chữa').isVisible();
    console.log('Has results visible:', hasResults);

    // Check if any error messages appear
    const hasError = await page.locator('[role="alert"]').isVisible();
    console.log('Has error alert:', hasError);

    if (hasError) {
      const errorText = await page.locator('[role="alert"]').textContent();
      console.log('Error message:', errorText);
    }
  });
});