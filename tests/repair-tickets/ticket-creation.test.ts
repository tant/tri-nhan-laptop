import { test, expect } from '@playwright/test';

test.describe('Repair Ticket Creation & Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to repair tickets page
    await page.goto('/phieu-sua-chua');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Create repair ticket with Vietnamese interface', async ({ page }) => {
    // Click create new ticket button
    await page.click('button:has-text("Tạo phiếu mới")');

    // Verify form is displayed with Vietnamese labels
    await expect(page.locator('label:has-text("Khách hàng")')).toBeVisible();
    await expect(page.locator('label:has-text("Thiết bị")')).toBeVisible();
    await expect(page.locator('label:has-text("Vấn đề báo cáo")')).toBeVisible();

    // Fill customer information
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0912345678');
    await page.press('input[placeholder*="Nhập số điện thoại"]', 'Tab');

    // Fill device information
    await page.selectOption('select[name="brand"]', 'ASUS');
    await page.selectOption('select[name="model"]', 'ROG Strix G15');
    await page.fill('input[name="serial"]', 'ASUS123456789');

    // Fill problem description
    await page.fill('textarea[name="problemDescription"]', 'Máy tính không khởi động được, đèn nguồn không sáng');

    // Submit form
    await page.click('button:has-text("Tạo phiếu sửa chữa")');

    // Verify success message
    await expect(page.locator('text=Đã tạo phiếu sửa chữa thành công')).toBeVisible();
  });

  test('AC2: Device documentation with photos and specifications', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Fill basic information
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0912345678');
    await page.selectOption('select[name="brand"]', 'Dell');
    await page.selectOption('select[name="model"]', 'Inspiron 15 3000');

    // Add device documentation
    await page.click('button:has-text("Thêm tài liệu")');

    // Upload device photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/device-photo.jpg');

    // Add device specifications
    await page.fill('textarea[name="specifications"]', 'Intel Core i5-10210U, 8GB RAM, 256GB SSD, Windows 10');

    // Add warranty information
    await page.fill('input[name="warrantyDate"]', '2024-12-31');
    await page.selectOption('select[name="warrantyType"]', 'manufacturer');

    // Verify documentation is saved
    await expect(page.locator('text=Tài liệu đã được thêm')).toBeVisible();
  });

  test('AC3: Problem assessment and technician assignment', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Fill ticket information
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0987654321');
    await page.selectOption('select[name="brand"]', 'HP');
    await page.fill('textarea[name="problemDescription"]', 'Màn hình laptop bị vỡ, không hiển thị được');

    // Set priority and category
    await page.selectOption('select[name="priority"]', 'high');
    await page.selectOption('select[name="category"]', 'screen_repair');

    // Assign technician
    await page.selectOption('select[name="assignedTechnician"]', 'tech_001');

    // Add initial assessment
    await page.fill('textarea[name="initialAssessment"]', 'Cần thay màn hình mới, kiểm tra cable màn hình');

    // Set estimated completion
    await page.fill('input[name="estimatedCompletion"]', '2024-01-15');

    // Submit and verify assignment
    await page.click('button:has-text("Tạo và phân công")');
    await expect(page.locator('text=Đã phân công thành công')).toBeVisible();
  });

  test('AC4: Draft and template management', async ({ page }) => {
    await page.click('button:has-text("Tạo phiếu mới")');

    // Fill partial information
    await page.fill('input[placeholder*="Nhập số điện thoại"]', '0123456789');
    await page.selectOption('select[name="brand"]', 'Acer');
    await page.fill('textarea[name="problemDescription"]', 'Laptop chạy chậm, quạt kêu to');

    // Save as draft
    await page.click('button:has-text("Lưu nháp")');
    await expect(page.locator('text=Đã lưu nháp')).toBeVisible();

    // Access draft from drafts list
    await page.click('button:has-text("Nháp đã lưu")');
    await expect(page.locator('text=Laptop chạy chậm')).toBeVisible();

    // Create template from current form
    await page.click('button:has-text("Lưu làm mẫu")');
    await page.fill('input[name="templateName"]', 'Sửa chữa laptop chậm');
    await page.click('button:has-text("Tạo mẫu")');

    // Verify template is available
    await page.click('button:has-text("Mẫu có sẵn")');
    await expect(page.locator('text=Sửa chữa laptop chậm')).toBeVisible();
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