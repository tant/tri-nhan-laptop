import { test, expect } from '@playwright/test';

test.describe('Debug Login Process', () => {
  test('should debug the login process step by step', async ({ page }) => {
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Step 1: Go to login page
    await page.goto('/login');
    console.log('✅ Navigated to /login');

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/login-page.png' });

    // Verify we're on the login page
    await expect(page.locator('h1:has-text("Đăng nhập hệ thống")')).toBeVisible();
    console.log('✅ Login page loaded');

    // Step 2: Fill credentials
    console.log('📝 Filling admin credentials...');
    await page.locator('input#email').fill('admin@laptop-repair-shop.local');
    await page.locator('input#password').fill('AdminPass123!');

    // Take screenshot before clicking login
    await page.screenshot({ path: 'test-results/before-login-click.png' });

    // Step 3: Click login
    console.log('🔄 Clicking login button...');
    await page.locator('button[type="submit"]:has-text("Đăng nhập")').click();

    // Wait a bit and take screenshot
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/after-login-click.png' });

    // Check current URL
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);

    // Check if we're still on login page (error state)
    const stillOnLogin = await page.locator('h1:has-text("Đăng nhập hệ thống")').isVisible();
    console.log('🔍 Still on login page:', stillOnLogin);

    // Check for error messages
    const hasError = await page.locator('[role="alert"]').isVisible();
    console.log('❌ Has error alert:', hasError);

    if (hasError) {
      const errorText = await page.locator('[role="alert"]').textContent();
      console.log('📝 Error message:', errorText);
    }

    // Check if we reached dashboard
    const onDashboard = await page.locator('h1:has-text("Dashboard")').isVisible();
    console.log('🎯 On dashboard:', onDashboard);

    // Check if we reached any other page
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);

    // Look for any loading states
    const isLoading = await page.locator('text=Đang đăng nhập...').isVisible();
    console.log('⏳ Loading state:', isLoading);

    // Check console errors
    console.log('🚨 Console errors:', consoleErrors);

    // Check if protected route redirected us
    const onProtectedRoute = currentUrl.includes('/dashboard') || currentUrl.includes('/phieu') || currentUrl.includes('/admin');
    console.log('🔒 On protected route:', onProtectedRoute);

    // Final screenshot
    await page.screenshot({ path: 'test-results/final-login-state.png' });
  });
});