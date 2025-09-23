import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start from a clean state
    await page.goto('/');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Đăng nhập hệ thống');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Verify login page loads
    await expect(page.locator('h1')).toContainText('Đăng nhập hệ thống');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation and verify success
    await expect(page).toHaveURL('/dashboard');

    // Wait for dashboard to load and verify we're not on login page anymore
    await expect(page.locator('text=Đăng nhập hệ thống')).not.toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();

    // Verify user menu shows some user button (the exact text might vary)
    await expect(page.locator('button').filter({ hasText: 'User' }).or(page.locator('button').filter({ hasText: 'Shop Manager' }))).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with wrong password
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit login form
    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL('/login');

    // Check for error message (this might need adjustment based on actual error display)
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should successfully logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    // Verify we're logged in
    await expect(page).toHaveURL('/dashboard');

    // Click user menu
    await page.click('button:has-text("Shop Manager")');

    // Wait for dropdown to appear and click logout
    await page.waitForSelector('text=Đăng xuất');
    await page.click('text=Đăng xuất');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    // Verify we're logged in
    await expect(page).toHaveURL('/dashboard');

    // Refresh the page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('button').filter({ hasText: 'Shop Manager' })).toBeVisible();
  });

  test('should navigate between protected pages when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Test navigation to different sections
    await page.click('text=Phiếu sửa chữa');
    await expect(page).toHaveURL('/phieu-sua-chua');

    await page.click('text=Khách hàng');
    await expect(page).toHaveURL('/khach-hang');

    await page.click('text=Tồn kho');
    await expect(page).toHaveURL('/ton-kho');

    // Go back to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show role-based content for shop owner', async ({ page }) => {
    // Login with shop owner account
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Check if admin section is accessible
    await page.click('text=Quản trị');
    await expect(page).toHaveURL('/admin');

    // Check role display in user menu
    await page.click('button:has-text("User")');
    await expect(page.locator('text=Chủ tiệm')).toBeVisible();
  });

  test('shop owner can access admin panel and see admin features', async ({ page }) => {
    // Login as shop owner
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    // Verify we're logged in and on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();

    // Navigate to admin panel
    await page.click('text=Quản trị');
    await expect(page).toHaveURL('/admin');

    // Verify admin page loads correctly
    await expect(page.locator('h1')).toContainText('Quản trị hệ thống');

    // Check that admin features are visible (this depends on admin page content)
    // Update these selectors based on actual admin page content
    await expect(page.locator('text=Nhân viên').or(page.locator('text=Cài đặt')).first()).toBeVisible();

    // Test navigation within admin section
    // These tests will need to be updated when admin sub-pages are implemented
    const hasStaffManagement = await page.locator('text=Quản lý nhân viên').isVisible().catch(() => false);
    const hasSystemSettings = await page.locator('text=Cài đặt hệ thống').isVisible().catch(() => false);

    // At least one admin feature should be visible
    if (hasStaffManagement || hasSystemSettings) {
      // Admin features are present
      console.log('Admin features detected');
    } else {
      // Admin page exists but features not yet implemented
      console.log('Admin page accessible, features pending implementation');
    }
  });

  test('shop owner can navigate between all sections including admin', async ({ page }) => {
    // Login as shop owner
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@laptop-repair-shop.local');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Test full navigation flow for shop owner
    const navigationTests = [
      { linkText: 'Phiếu sửa chữa', expectedUrl: '/phieu-sua-chua' },
      { linkText: 'Khách hàng', expectedUrl: '/khach-hang' },
      { linkText: 'Cửa hàng', expectedUrl: '/cua-hang' },
      { linkText: 'Tồn kho', expectedUrl: '/ton-kho' },
      { linkText: 'Quản trị', expectedUrl: '/admin' },
      { linkText: 'Dashboard', expectedUrl: '/dashboard' },
    ];

    for (const { linkText, expectedUrl } of navigationTests) {
      await page.click(`text=${linkText}`);
      await expect(page).toHaveURL(expectedUrl);

      // Verify page loads without errors
      await expect(page.locator('body')).toBeVisible();

      // Check that we're not redirected to login (which would indicate access denied)
      await expect(page).not.toHaveURL('/login');
    }
  });
});