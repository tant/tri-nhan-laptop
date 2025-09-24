import { test, expect } from '@playwright/test';

/**
 * Repair Ticket Creation E2E Tests
 * Updated: September 24, 2025 - Tests updated to reflect page-based implementation
 * The repair tickets feature uses nested routing structure:
 * - /phieu-sua-chua - Main tickets list
 * - /phieu-sua-chua/new - Create new ticket
 * - /phieu-sua-chua/[id] - View ticket details
 * - /phieu-sua-chua/[id]/edit - Edit existing ticket
 */

test.describe('Repair Ticket Creation & Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to repair tickets page
    await page.goto('/phieu-sua-chua');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Create repair ticket with Vietnamese interface', async ({ page }) => {
    // Click create new ticket button
    await page.click('button:has-text("Tạo phiếu mới")');

    // Verify navigation to ticket creation page
    await expect(page).toHaveURL('/phieu-sua-chua/new');

    // Verify page displays Vietnamese title
    await expect(page.locator('text=Tạo phiếu sửa chữa mới')).toBeVisible();

    // Verify form is displayed with Vietnamese labels on page
    await expect(page.locator('label:has-text("Tên khách hàng")')).toBeVisible();
    await expect(page.locator('text=Khách hàng')).toBeVisible();
    await expect(page.locator('text=Thiết bị')).toBeVisible();
    await expect(page.locator('text=Vấn đề')).toBeVisible();

    // Fill customer information in customer tab
    await page.fill('input#customer_name', 'Nguyễn Văn Test');
    await page.fill('input#customer_phone', '0912345678');

    // Navigate to device tab
    await page.click('[data-value="device"]');

    // Fill device information
    await page.click('[data-testid="device_brand"] button');
    await page.click('[role="option"]:has-text("ASUS")');

    // Wait for models to load and select
    await page.waitForTimeout(500);
    await page.click('[data-testid="device_model"] button');
    await page.click('[role="option"]:has-text("ROG")');

    // Navigate to problem tab
    await page.click('[data-value="problem"]');

    // Fill problem description
    await page.fill('textarea#problem_description', 'Máy tính không khởi động được, đèn nguồn không sáng');

    // Navigate to review tab
    await page.click('[data-value="review"]');

    // Submit form
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify navigation back to repair tickets list (indicating success)
    await expect(page).toHaveURL('/phieu-sua-chua');

    // Verify the new ticket appears in the list
    await expect(page.locator('text=Nguyễn Văn Test')).toBeVisible();
  });

  test('AC2: Device documentation with photos and specifications', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Verify navigation to ticket creation page
    await expect(page).toHaveURL('/phieu-sua-chua/new');

    // Fill basic information
    await page.fill('input#customer_name', 'Nguyễn Thị Test');
    await page.fill('input#customer_phone', '0912345678');

    // Navigate to device tab
    await page.click('[data-value="device"]');

    await page.click('[data-testid="device_brand"] button');
    await page.click('[role="option"]:has-text("Dell")');

    await page.waitForTimeout(500);
    await page.click('[data-testid="device_model"] button');
    await page.click('[role="option"]:has-text("Inspiron")');

    // Navigate to documentation tab
    await page.click('[data-value="documentation"]');

    // Verify documentation features are available
    await expect(page.locator('text=Tài liệu')).toBeVisible();

    // Verify all expected documentation sections are present
    await expect(page.locator('main')).toContainText('Tài liệu thiết bị');

    // Navigate back to main tickets page
    await page.goBack();
    await expect(page).toHaveURL('/phieu-sua-chua');
  });

  test('AC3: Problem assessment and technician assignment', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Verify navigation to ticket creation page
    await expect(page).toHaveURL('/phieu-sua-chua/new');

    // Fill basic ticket information
    await page.fill('input#customer_name', 'Nguyễn Văn Assignment');
    await page.fill('input#customer_phone', '0912345679');

    // Navigate to device tab and fill info
    await page.click('[data-value="device"]');
    await page.click('[data-testid="device_brand"] button');
    await page.click('[role="option"]:has-text("HP")');

    // Navigate to problem tab
    await page.click('[data-value="problem"]');
    await page.fill('textarea#problem_description', 'Laptop bị chậm và nóng máy');

    // Navigate to assignment tab
    await page.click('[data-value="assignment"]');

    // Verify assignment features are available
    await expect(page.locator('>> text=Phân công')).toBeVisible();

    // Verify assignment interface elements
    await expect(page.locator('[role="dialog"]')).toContainText('kỹ thuật viên');

    // Navigate back to main tickets page
    await page.goBack();
    await expect(page).toHaveURL('/phieu-sua-chua');
  });

  test('AC4: Draft and template management', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Verify navigation to ticket creation page
    await expect(page).toHaveURL('/phieu-sua-chua/new');

    // Fill partial information for draft testing
    await page.fill('input#customer_name', 'Nguyễn Văn Draft');
    await page.fill('input#customer_phone', '0123456789');

    // Navigate to device tab
    await page.click('[data-value="device"]');
    await page.click('[data-testid="device_brand"] button');
    await page.click('[role="option"]:has-text("Acer")');

    // Navigate to problem tab
    await page.click('[data-value="problem"]');
    await page.fill('textarea#problem_description', 'Laptop chạy chậm, quạt kêu to');

    // Navigate to review tab
    await page.click('[data-value="review"]');

    // Test draft saving functionality
    await page.click('button:has-text("Lưu nháp")');

    // Verify navigation back to repair tickets list (indicating draft was saved)
    await expect(page).toHaveURL('/phieu-sua-chua');

    // Verify we're back to the main page
    await expect(page.locator('h1:has-text("Quản lý phiếu sửa chữa")')).toBeVisible();
  });

  test('AC5: Customer history integration', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Enter existing customer phone
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0909123456');
    await page.press('input[placeholder*="Nhập số điện thoại"]', 'Tab');

    // Verify customer information is auto-filled
    await expect(page.locator('input[name="customerName"]')).toHaveValue('Nguyễn Văn A');

    // Check repair history display
    await expect(page.locator('text=Lịch sử sửa chữa')).toBeVisible();
    await expect(page.locator('text=3 lần sửa chữa trước đó')).toBeVisible();

    // Verify device suggestions based on history
    await expect(page.locator('text=Thiết bị đã sửa:')).toBeVisible();
    await expect(page.locator('text=Dell Inspiron 15')).toBeVisible();
  });

  test('AC6: Cost estimation and quote generation', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Fill ticket details
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0988776655');
    await page.selectOption('select[name="category"]', 'motherboard_repair');
    await page.fill('textarea[name="problemDescription"]', 'Laptop không nhận sạc, nghi main bị lỗi');

    // Generate cost estimation
    await page.click('button:has-text("Ước tính chi phí")');

    // Verify cost breakdown is displayed
    await expect(page.locator('text=Chi phí ước tính')).toBeVisible();
    await expect(page.locator('text=Linh kiện:')).toBeVisible();
    await expect(page.locator('text=Nhân công:')).toBeVisible();
    await expect(page.locator('text=Tổng cộng:')).toBeVisible();

    // Generate formal quote
    await page.click('button:has-text("Tạo báo giá")');
    await expect(page.locator('text=Báo giá đã được tạo')).toBeVisible();
  });

  test('AC7: Quality control checklist', async ({ page }) => {
    // Navigate to existing ticket
    await page.click('tr:first-child td:last-child button');

    // Access quality control section
    await page.click('button:has-text("Kiểm tra chất lượng")');

    // Verify checklist items
    await expect(page.locator('text=Kiểm tra chức năng cơ bản')).toBeVisible();
    await expect(page.locator('text=Kiểm tra hiệu suất')).toBeVisible();
    await expect(page.locator('text=Kiểm tra nhiệt độ')).toBeVisible();

    // Complete checklist
    await page.check('input[name="basicFunction"]');
    await page.check('input[name="performance"]');
    await page.check('input[name="temperature"]');

    // Add quality notes
    await page.fill('textarea[name="qualityNotes"]', 'Thiết bị hoạt động ổn định sau sửa chữa');

    // Mark quality check complete
    await page.click('button:has-text("Hoàn thành kiểm tra")');
    await expect(page.locator('text=Đã hoàn thành kiểm tra chất lượng')).toBeVisible();
  });

  test('AC8: Multi-device tracking for customers', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Enter customer with multiple devices
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0977888999');

    // Select different device from history
    await page.click('button:has-text("Chọn thiết bị khác")');
    await page.click('text=MacBook Pro 13"');

    // Verify device information is auto-filled
    await expect(page.locator('select[name="brand"]')).toHaveValue('Apple');
    await expect(page.locator('select[name="model"]')).toHaveValue('MacBook Pro 13"');

    // Add new device for same customer
    await page.click('button:has-text("Thêm thiết bị mới")');
    await page.selectOption('select[name="newDeviceBrand"]', 'Microsoft');
    await page.selectOption('select[name="newDeviceModel"]', 'Surface Pro 8');

    // Verify both devices are tracked
    await expect(page.locator('text=2 thiết bị được theo dõi')).toBeVisible();
  });

  test('AC9: Service level tracking', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Set service level
    await page.selectOption('select[name="serviceLevel"]', 'premium');

    // Verify premium service options
    await expect(page.locator('text=Dịch vụ cao cấp')).toBeVisible();
    await expect(page.locator('text=Bảo hành 12 tháng')).toBeVisible();
    await expect(page.locator('text=Ưu tiên xử lý')).toBeVisible();

    // Set custom service preferences
    await page.check('input[name="homePickup"]');
    await page.check('input[name="dataBackup"]');
    await page.check('input[name="expresService"]');

    // Verify service tracking
    await page.click('button:has-text("Lưu dịch vụ")');
    await expect(page.locator('text=Đã cập nhật dịch vụ')).toBeVisible();
  });

  test('AC10: Vietnamese localization validation', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Verify all Vietnamese labels are present
    const vietnameseLabels = [
      'Thông tin khách hàng',
      'Thông tin thiết bị',
      'Mô tả vấn đề',
      'Ưu tiên',
      'Phân loại',
      'Kỹ thuật viên phụ trách',
      'Ngày hoàn thành dự kiến'
    ];

    for (const label of vietnameseLabels) {
      await expect(page.locator(`text=${label}`)).toBeVisible();
    }

    // Test validation messages in Vietnamese
    await page.click('button:has-text("Tạo phiếu sửa chữa")');
    await expect(page.locator('text=Vui lòng nhập số điện thoại')).toBeVisible();
    await expect(page.locator('text=Vui lòng chọn thiết bị')).toBeVisible();
    await expect(page.locator('text=Vui lòng mô tả vấn đề')).toBeVisible();

    // Test success messages in Vietnamese
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0901234567');
    await page.selectOption('select[name="brand"]', 'ASUS');
    await page.fill('textarea[name="problemDescription"]', 'Test problem');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    await expect(page.locator('text=Phiếu sửa chữa đã được tạo thành công')).toBeVisible();
  });

  test('Error handling and edge cases', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Test invalid phone number
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '123');
    await page.click('button:has-text("Tạo phiếu sửa chữa")');
    await expect(page.locator('text=Số điện thoại không hợp lệ')).toBeVisible();

    // Test very long problem description
    const longText = 'Đây là mô tả rất dài '.repeat(100);
    await page.fill('textarea[name="problemDescription"]', longText);
    await expect(page.locator('text=Mô tả quá dài')).toBeVisible();

    // Test duplicate serial number
    await page.fill('input[name="serial"]', 'EXISTING_SERIAL_123');
    await page.blur('input[name="serial"]');
    await expect(page.locator('text=Số serial đã tồn tại')).toBeVisible();
  });
});