import { test, expect } from '@playwright/test';

test.describe('Phone-Based Customer System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/khach-hang');
  });

  test('Vietnamese phone numbers validate correctly', async ({ page }) => {
    // Test mobile number validation
    await page.fill('[data-testid="phone-input"]', '0901234567');
    await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
    await expect(page.locator('text=Số di động hợp lệ')).toBeVisible();

    // Test landline validation
    await page.fill('[data-testid="phone-input"]', '02412345678');
    await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
    await expect(page.locator('text=Số điện thoại bàn hợp lệ')).toBeVisible();

    // Test invalid number
    await page.fill('[data-testid="phone-input"]', '123456');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('text=Độ dài số điện thoại không hợp lệ')).toBeVisible();
  });

  test('Customer creation works with phone number input', async ({ page }) => {
    // Fill customer form with valid phone number
    await page.fill('[data-testid="phone-input"]', '0901234567');
    await page.fill('[data-testid="name-input"]', 'Nguyễn Văn A');
    await page.fill('[data-testid="address-input"]', 'Hà Nội');

    await page.click('[data-testid="create-customer-btn"]');

    // Verify customer was created
    await expect(page.locator('text=Khách hàng đã được tạo thành công')).toBeVisible();
    await expect(page.locator('text=Nguyễn Văn A')).toBeVisible();
    await expect(page.locator('text=0901 234 567')).toBeVisible();
  });

  test('Phone number search returns correct results', async ({ page }) => {
    // Create test customer first
    await page.fill('[data-testid="phone-input"]', '0901234567');
    await page.fill('[data-testid="name-input"]', 'Test Customer');
    await page.click('[data-testid="create-customer-btn"]');
    await page.waitForTimeout(1000);

    // Test phone number search
    await page.fill('[data-testid="search-input"]', '0901');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Test Customer')).toBeVisible();
    await expect(page.locator('text=0901 234 567')).toBeVisible();

    // Test partial search
    await page.fill('[data-testid="search-input"]', '901234');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Test Customer')).toBeVisible();
  });

  test('Duplicate phone numbers are prevented', async ({ page }) => {
    // Create first customer
    await page.fill('[data-testid="phone-input"]', '0901234567');
    await page.fill('[data-testid="name-input"]', 'First Customer');
    await page.click('[data-testid="create-customer-btn"]');
    await page.waitForTimeout(1000);

    // Try to create second customer with same phone
    await page.fill('[data-testid="phone-input"]', '0901234567');
    await page.fill('[data-testid="name-input"]', 'Second Customer');
    await page.click('[data-testid="create-customer-btn"]');

    // Verify error message
    await expect(page.locator('text=Số điện thoại này đã được sử dụng bởi khách hàng khác')).toBeVisible();
  });

  test('Phone formatting displays properly', async ({ page }) => {
    // Test mobile number formatting
    await page.fill('[data-testid="phone-input"]', '0901234567');
    await page.blur('[data-testid="phone-input"]');

    await expect(page.locator('[data-testid="phone-input"]')).toHaveValue('0901 234 567');

    // Test landline formatting
    await page.fill('[data-testid="phone-input"]', '02412345678');
    await page.blur('[data-testid="phone-input"]');

    await expect(page.locator('[data-testid="phone-input"]')).toHaveValue('024 1234 5678');

    // Test international number
    await page.fill('[data-testid="phone-input"]', '84901234567');
    await page.blur('[data-testid="phone-input"]');

    await expect(page.locator('[data-testid="phone-input"]')).toHaveValue('0901 234 567');
  });

  test('Carrier information displays correctly', async ({ page }) => {
    // Test Viettel number
    await page.fill('[data-testid="phone-input"]', '0987654321');
    await expect(page.locator('text=Viettel')).toBeVisible();

    // Test VinaPhone number
    await page.fill('[data-testid="phone-input"]', '0912345678');
    await expect(page.locator('text=VinaPhone')).toBeVisible();

    // Test MobiFone number
    await page.fill('[data-testid="phone-input"]', '0903456789');
    await expect(page.locator('text=MobiFone')).toBeVisible();
  });

  test('International phone numbers are handled', async ({ page }) => {
    // Test international format
    await page.fill('[data-testid="phone-input"]', '+1234567890');
    await expect(page.locator('text=Số quốc tế hợp lệ')).toBeVisible();

    // Test Vietnamese number with country code
    await page.fill('[data-testid="phone-input"]', '+84901234567');
    await expect(page.locator('text=Số di động hợp lệ')).toBeVisible();
  });

  test('Customer auto-creation from repair ticket', async ({ page }) => {
    // Navigate to repair ticket creation
    await page.goto('/phieu-sua-chua');

    // Fill phone number that doesn't exist yet
    await page.fill('[data-testid="customer-phone"]', '0909876543');
    await page.fill('[data-testid="customer-name"]', 'Auto Created Customer');
    await page.fill('[data-testid="device-info"]', 'Laptop Dell');
    await page.fill('[data-testid="issue-description"]', 'Máy không khởi động');

    await page.click('[data-testid="create-repair-ticket"]');

    // Verify customer was auto-created
    await page.goto('/khach-hang');
    await page.fill('[data-testid="search-input"]', '0909876543');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Auto Created Customer')).toBeVisible();
    await expect(page.locator('text=0909 876 543')).toBeVisible();
    await expect(page.locator('text=Tự động tạo từ phiếu sửa chữa')).toBeVisible();
  });
});