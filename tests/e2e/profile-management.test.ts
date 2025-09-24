import { test, expect } from '@playwright/test';

test.describe('Customer Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/khach-hang');
  });

  test('Vietnamese names and addresses save correctly', async ({ page }) => {
    // Navigate to create customer form
    await page.click('[data-testid="create-customer-btn"]');

    // Fill Vietnamese name
    await page.fill('[data-testid="full-name-input"]', 'Nguyễn Văn Đức');
    await expect(page.locator('[data-testid="name-validation-success"]')).toBeVisible();

    // Fill phone number
    await page.fill('[data-testid="phone-input"]', '0987654321');
    await expect(page.locator('[data-testid="phone-validation-success"]')).toBeVisible();

    // Fill Vietnamese address
    await page.selectOption('[data-testid="province-select"]', 'Hà Nội');
    await page.fill('[data-testid="district-input"]', 'Quận Ba Đình');
    await page.fill('[data-testid="ward-input"]', 'Phường Cống Vị');
    await page.fill('[data-testid="address-details-input"]', '123 Đường Nguyễn Thái Học');

    // Verify address validation
    await expect(page.locator('[data-testid="address-validation-success"]')).toBeVisible();
    await expect(page.locator('text=123 Đường Nguyễn Thái Học, Phường Cống Vị, Quận Ba Đình, Hà Nội')).toBeVisible();

    // Accept privacy consent
    await page.check('[data-testid="privacy-consent"]');

    // Save customer
    await page.click('[data-testid="save-customer-btn"]');

    // Verify customer was created
    await expect(page.locator('text=Khách hàng đã được tạo thành công')).toBeVisible();
    await expect(page.locator('text=Nguyễn Văn Đức')).toBeVisible();
    await expect(page.locator('text=0987 654 321')).toBeVisible();
  });

  test('Customer search returns accurate results', async ({ page }) => {
    // Create a test customer first
    await page.click('[data-testid="create-customer-btn"]');
    await page.fill('[data-testid="full-name-input"]', 'Trần Thị Mai');
    await page.fill('[data-testid="phone-input"]', '0912345678');
    await page.selectOption('[data-testid="province-select"]', 'TP. Hồ Chí Minh');
    await page.fill('[data-testid="district-input"]', 'Quận 1');
    await page.fill('[data-testid="ward-input"]', 'Phường Bến Nghé');
    await page.fill('[data-testid="address-details-input"]', '456 Đường Lê Lợi');
    await page.check('[data-testid="privacy-consent"]');
    await page.click('[data-testid="save-customer-btn"]');
    await page.waitForTimeout(1000);

    // Test search by name
    await page.fill('[data-testid="customer-search"]', 'Trần Thị');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Trần Thị Mai')).toBeVisible();

    // Test search by phone
    await page.fill('[data-testid="customer-search"]', '0912');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Trần Thị Mai')).toBeVisible();
    await expect(page.locator('text=0912 345 678')).toBeVisible();

    // Test search by address
    await page.fill('[data-testid="customer-search"]', 'Lê Lợi');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Trần Thị Mai')).toBeVisible();
  });

  test('Profile updates track changes properly', async ({ page }) => {
    // Create initial customer
    await page.click('[data-testid="create-customer-btn"]');
    await page.fill('[data-testid="full-name-input"]', 'Lê Văn Nam');
    await page.fill('[data-testid="phone-input"]', '0903456789');
    await page.selectOption('[data-testid="province-select"]', 'Đà Nẵng');
    await page.fill('[data-testid="district-input"]', 'Quận Hải Châu');
    await page.fill('[data-testid="ward-input"]', 'Phường Hải Châu I');
    await page.fill('[data-testid="address-details-input"]', '789 Đường Trần Phú');
    await page.check('[data-testid="privacy-consent"]');
    await page.click('[data-testid="save-customer-btn"]');
    await page.waitForTimeout(1000);

    // Find and edit the customer
    await page.fill('[data-testid="customer-search"]', 'Lê Văn Nam');
    await page.waitForTimeout(500);
    await page.click('[data-testid="edit-customer-btn"]');

    // Update customer information
    await page.fill('[data-testid="full-name-input"]', 'Lê Văn Nam (Updated)');
    await page.fill('[data-testid="email-input"]', 'nam.le@example.com');

    // Add emergency contact
    await page.fill('[data-testid="emergency-contact-name"]', 'Lê Thị Lan');
    await page.fill('[data-testid="emergency-contact-phone"]', '0987123456');

    // Update contact preferences
    await page.selectOption('[data-testid="preferred-method"]', 'email');
    await page.selectOption('[data-testid="preferred-time"]', 'morning');

    // Save changes
    await page.click('[data-testid="save-customer-btn"]');

    // Verify updates
    await expect(page.locator('text=Lê Văn Nam (Updated)')).toBeVisible();
    await expect(page.locator('text=nam.le@example.com')).toBeVisible();
    await expect(page.locator('text=Lê Thị Lan')).toBeVisible();

    // Check change history (if implemented)
    await page.click('[data-testid="view-change-history"]');
    await expect(page.locator('text=Cập nhật thông tin')).toBeVisible();
  });

  test('Business customer data validation works', async ({ page }) => {
    // Create business customer
    await page.click('[data-testid="create-customer-btn"]');

    // Select business category
    await page.selectOption('[data-testid="customer-category"]', 'business');

    // Fill business information
    await page.fill('[data-testid="full-name-input"]', 'Phạm Văn Tùng');
    await page.fill('[data-testid="phone-input"]', '0944567890');
    await page.fill('[data-testid="business-name-input"]', 'Công ty TNHH ABC');
    await page.fill('[data-testid="tax-code-input"]', '0123456789');

    // Fill address
    await page.selectOption('[data-testid="province-select"]', 'Hải Phòng');
    await page.fill('[data-testid="district-input"]', 'Quận Lê Chân');
    await page.fill('[data-testid="ward-input"]', 'Phường Đông Hải');
    await page.fill('[data-testid="address-details-input"]', '321 Đường Lạch Tray');

    // Verify business validation
    await expect(page.locator('[data-testid="business-validation-success"]')).toBeVisible();

    // Accept privacy consent
    await page.check('[data-testid="privacy-consent"]');

    // Save business customer
    await page.click('[data-testid="save-customer-btn"]');

    // Verify business customer was created
    await expect(page.locator('text=Công ty TNHH ABC')).toBeVisible();
    await expect(page.locator('text=Phạm Văn Tùng')).toBeVisible();
    await expect(page.locator('text=0944 567 890')).toBeVisible();
  });

  test('Contact preferences save and display correctly', async ({ page }) => {
    // Create customer with specific contact preferences
    await page.click('[data-testid="create-customer-btn"]');
    await page.fill('[data-testid="full-name-input"]', 'Hoàng Thị Linh');
    await page.fill('[data-testid="phone-input"]', '0955678901');

    // Set contact preferences
    await page.fill('[data-testid="email-input"]', 'linh.hoang@example.com');
    await page.selectOption('[data-testid="preferred-method"]', 'email');
    await page.selectOption('[data-testid="preferred-time"]', 'evening');
    await page.check('[data-testid="allow-marketing"]');
    await page.selectOption('[data-testid="preferred-language"]', 'en');

    // Fill required fields
    await page.selectOption('[data-testid="province-select"]', 'Cần Thơ');
    await page.fill('[data-testid="district-input"]', 'Quận Ninh Kiều');
    await page.fill('[data-testid="ward-input"]', 'Phường An Cư');
    await page.fill('[data-testid="address-details-input"]', '654 Đường 3/2');
    await page.check('[data-testid="privacy-consent"]');

    // Save customer
    await page.click('[data-testid="save-customer-btn"]');

    // Verify contact preferences are displayed
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Buổi tối')).toBeVisible();
    await expect(page.locator('text=Marketing OK')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('Customer categorization works for individual vs business', async ({ page }) => {
    // Test individual customer fields
    await page.click('[data-testid="create-customer-btn"]');
    await page.selectOption('[data-testid="customer-category"]', 'individual');

    // Individual-specific fields should be visible
    await expect(page.locator('[data-testid="date-of-birth"]')).toBeVisible();
    await expect(page.locator('[data-testid="id-card-number"]')).toBeVisible();

    // Business fields should not be visible
    await expect(page.locator('[data-testid="business-name-input"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="tax-code-input"]')).not.toBeVisible();

    // Switch to business customer
    await page.selectOption('[data-testid="customer-category"]', 'business');

    // Business-specific fields should be visible
    await expect(page.locator('[data-testid="business-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="tax-code-input"]')).toBeVisible();

    // Individual fields should not be visible
    await expect(page.locator('[data-testid="date-of-birth"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="id-card-number"]')).not.toBeVisible();
  });

  test('Vietnamese ID card validation works correctly', async ({ page }) => {
    await page.click('[data-testid="create-customer-btn"]');
    await page.selectOption('[data-testid="customer-category"]', 'individual');

    // Test old format ID card (9 digits)
    await page.fill('[data-testid="id-card-number"]', '123456789');
    await expect(page.locator('text=Định dạng CMND cũ (9 số)')).toBeVisible();
    await expect(page.locator('[data-testid="id-validation-success"]')).toBeVisible();

    // Test new format ID card (12 digits)
    await page.fill('[data-testid="id-card-number"]', '123456789012');
    await expect(page.locator('text=Định dạng CCCD mới (12 số)')).toBeVisible();
    await expect(page.locator('[data-testid="id-validation-success"]')).toBeVisible();

    // Test invalid ID card
    await page.fill('[data-testid="id-card-number"]', '12345');
    await expect(page.locator('text=Số CMND/CCCD phải có 9 hoặc 12 chữ số')).toBeVisible();
    await expect(page.locator('[data-testid="id-validation-error"]')).toBeVisible();
  });

  test('Customer tags can be added and removed', async ({ page }) => {
    await page.click('[data-testid="create-customer-btn"]');
    await page.fill('[data-testid="full-name-input"]', 'Vũ Thị Hoa');
    await page.fill('[data-testid="phone-input"]', '0966789012');

    // Add customer tags
    await page.fill('[data-testid="new-tag-input"]', 'VIP');
    await page.click('[data-testid="add-tag-btn"]');
    await expect(page.locator('text=VIP')).toBeVisible();

    await page.fill('[data-testid="new-tag-input"]', 'Khách cũ');
    await page.click('[data-testid="add-tag-btn"]');
    await expect(page.locator('text=Khách cũ')).toBeVisible();

    // Remove a tag
    await page.click('[data-testid="remove-tag-VIP"]');
    await expect(page.locator('text=VIP')).not.toBeVisible();
    await expect(page.locator('text=Khách cũ')).toBeVisible();

    // Complete the form
    await page.selectOption('[data-testid="province-select"]', 'Nghệ An');
    await page.fill('[data-testid="district-input"]', 'Thành phố Vinh');
    await page.fill('[data-testid="ward-input"]', 'Phường Hưng Bình');
    await page.fill('[data-testid="address-details-input"]', '987 Đường Quang Trung');
    await page.check('[data-testid="privacy-consent"]');

    // Save and verify tags
    await page.click('[data-testid="save-customer-btn"]');
    await expect(page.locator('text=Khách cũ')).toBeVisible();
  });

  test('Privacy controls work as expected', async ({ page }) => {
    // Create customer
    await page.click('[data-testid="create-customer-btn"]');
    await page.fill('[data-testid="full-name-input"]', 'Đỗ Văn Hùng');
    await page.fill('[data-testid="phone-input"]', '0977890123');
    await page.selectOption('[data-testid="province-select"]', 'Thái Nguyên');
    await page.fill('[data-testid="district-input"]', 'Thành phố Thái Nguyên');
    await page.fill('[data-testid="ward-input"]', 'Phường Tân Thịnh');
    await page.fill('[data-testid="address-details-input"]', '159 Đường Lương Ngọc Quyến');

    // Privacy consent should be required
    await page.click('[data-testid="save-customer-btn"]');
    await expect(page.locator('text=Vui lòng kiểm tra lại thông tin')).toBeVisible();

    // Accept privacy consent
    await page.check('[data-testid="privacy-consent"]');
    await expect(page.locator('text=Thông tin hợp lệ, có thể lưu')).toBeVisible();

    // Save customer
    await page.click('[data-testid="save-customer-btn"]');
    await expect(page.locator('text=Đỗ Văn Hùng')).toBeVisible();

    // Access privacy management
    await page.click('[data-testid="privacy-manager-btn"]');
    await expect(page.locator('text=Trạng thái bảo mật dữ liệu')).toBeVisible();
    await expect(page.locator('text=Hợp lệ')).toBeVisible();
  });

  test('Date of birth validation and age calculation', async ({ page }) => {
    await page.click('[data-testid="create-customer-btn"]');
    await page.selectOption('[data-testid="customer-category"]', 'individual');

    // Test valid date of birth
    const birthDate = '1990-05-15';
    await page.fill('[data-testid="date-of-birth"]', birthDate);

    // Age should be calculated and displayed
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - 1990;
    await expect(page.locator(`text=Tuổi: ${expectedAge}`)).toBeVisible();

    // Test future date (should be invalid)
    const futureDate = '2030-01-01';
    await page.fill('[data-testid="date-of-birth"]', futureDate);
    await expect(page.locator('text=Ngày sinh không thể trong tương lai')).toBeVisible();

    // Test very old date (should be invalid)
    const tooOldDate = '1900-01-01';
    await page.fill('[data-testid="date-of-birth"]', tooOldDate);
    await expect(page.locator('text=Tuổi không hợp lệ')).toBeVisible();
  });
});