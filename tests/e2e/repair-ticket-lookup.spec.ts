import { test, expect } from '@playwright/test';

test.describe('Repair Ticket Lookup', () => {
  test('should find repair ticket TK001 with correct customer info', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Check if we're on the home page - using actual title from index.html
    await expect(page).toHaveTitle('Create TanStack App - try-vite');

    // Verify we're on the Vietnamese laptop repair shop page
    await expect(page.locator('h1:has-text("Trí Nhân Laptop")')).toBeVisible();
    await expect(page.locator('text=Tra Cứu Tình Trạng Sửa Chữa')).toBeVisible();

    // Find the actual form elements based on HomePage.tsx structure
    const ticketInput = page.locator('input#ticket');
    const phoneInput = page.locator('input#phone');
    const searchButton = page.locator('button[type="submit"]:has-text("TRA CỨU")');

    // Fill in the form with sample data: TK001 + phone number
    await ticketInput.fill('TK001');
    await phoneInput.fill('0901234567'); // Phone number for Nguyễn Văn An

    // Submit the search
    await searchButton.click();

    // Wait for results and verify correct ticket information
    // Based on sample data: TK001 belongs to Nguyễn Văn An, Dell Latitude 5520
    await expect(page.locator('text=TK001')).toBeVisible();
    await expect(page.locator('text=Nguyễn Văn An')).toBeVisible();
    await expect(page.locator('text=Dell')).toBeVisible();
    await expect(page.locator('text=Latitude 5520')).toBeVisible();

    // Check issue description
    await expect(page.locator('text=không khởi động')).toBeVisible();

    // Check status - should show Vietnamese status for "in_progress"
    await expect(page.locator('text=Đang sửa chữa')).toBeVisible();
  });

  test('should find repair ticket TK003 (completed ticket)', async ({ page }) => {
    await page.goto('/');

    // Use correct form elements
    const ticketInput = page.locator('input#ticket');
    const phoneInput = page.locator('input#phone');
    const searchButton = page.locator('button[type="submit"]:has-text("TRA CỨU")');

    // Enter completed ticket: TK003 with correct phone number
    await ticketInput.fill('TK003');
    await phoneInput.fill('0923456789'); // Phone number for Lê Minh Cường

    await searchButton.click();

    // Verify completed ticket information
    // TK003: Lê Minh Cường, Lenovo ThinkPad X1, completed status
    await expect(page.locator('text=TK003')).toBeVisible();
    await expect(page.locator('text=Lê Minh Cường')).toBeVisible();
    await expect(page.locator('text=Lenovo')).toBeVisible();
    await expect(page.locator('text=ThinkPad X1')).toBeVisible();

    // Check completed status in Vietnamese
    await expect(page.locator('text=Hoàn thành')).toBeVisible();

    // Should show final cost - formatted as Vietnamese currency
    await expect(page.locator('p.text-2xl:has-text("2.800.000")')).toBeVisible();
  });

  test('should handle non-existent ticket number', async ({ page }) => {
    await page.goto('/');

    const ticketInput = page.locator('input#ticket');
    const phoneInput = page.locator('input#phone');
    const searchButton = page.locator('button[type="submit"]:has-text("TRA CỨU")');

    // Search for non-existent ticket with valid phone
    await ticketInput.fill('TK999');
    await phoneInput.fill('0901234567'); // Valid phone format

    await searchButton.click();

    // Should show error message - check for Vietnamese error messages
    await expect(page.locator('[role="alert"], .text-red-600')).toBeVisible();
  });

  test('should validate empty search', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.locator('button[type="submit"]:has-text("TRA CỨU")');

    // Button should be disabled when form is empty (based on HomePage.tsx line 247-251)
    await expect(searchButton).toBeDisabled();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/');

    const ticketInput = page.locator('input#ticket');
    const phoneInput = page.locator('input#phone');
    const searchButton = page.locator('button[type="submit"]:has-text("TRA CỨU")');

    // Enter valid ticket but invalid phone
    await ticketInput.fill('TK001');
    await phoneInput.fill('123'); // Invalid phone format

    await searchButton.click();

    // Should show validation error for phone number
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});