import { test, expect, type Page } from "@playwright/test";

test.describe("Public Repair Lookup", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the public homepage
		await page.goto("/");
	});

	test("should display public interface without authentication", async ({
		page,
	}) => {
		// Verify the public interface loads without requiring login
		await expect(page.locator("h1")).toContainText("Trí Nhân Laptop");
		await expect(page.locator("text=Tra Cứu Tình Trạng Sửa Chữa")).toBeVisible();

		// Verify Vietnamese interface elements
		await expect(page.locator("text=Chuyên Sửa Chữa Laptop Chuyên Nghiệp")).toBeVisible();
		await expect(page.locator("text=Số phiếu sửa chữa")).toBeVisible();
		await expect(page.locator("text=Số điện thoại")).toBeVisible();
	});

	test("should support both ticket and email lookup methods", async ({
		page,
	}) => {
		// Test ticket lookup tab
		await expect(page.locator("text=Tra cứu bằng số phiếu")).toBeVisible();
		await page.locator("text=Tra cứu bằng số phiếu").click();
		await expect(page.locator("input[placeholder*='MS001']")).toBeVisible();

		// Test email lookup tab
		await page.locator("text=Tra cứu bằng email").click();
		await expect(page.locator("input[placeholder*='example@email.com']")).toBeVisible();
	});

	test("should validate Vietnamese phone number format", async ({ page }) => {
		// Enter invalid phone number
		await page.fill("input[placeholder*='09xxxxxxxx']", "123456");
		await page.fill("input[placeholder*='MS001']", "TK001");
		await page.locator("button:has-text('TRA CỨU')").click();

		// Should show Vietnamese validation error
		await expect(page.locator("text=Số điện thoại không đúng định dạng")).toBeVisible();
	});

	test("should validate ticket number format", async ({ page }) => {
		// Enter invalid ticket format
		await page.fill("input[placeholder*='MS001']", "invalid");
		await page.fill("input[placeholder*='09xxxxxxxx']", "0901234567");
		await page.locator("button:has-text('TRA CỨU')").click();

		// Should show Vietnamese validation error
		await expect(page.locator("text=Số phiếu không đúng định dạng")).toBeVisible();
	});

	test("should be mobile-responsive", async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Verify responsive elements are visible
		await expect(page.locator("h1")).toBeVisible();
		await expect(page.locator("text=Tra Cứu Tình Trạng Sửa Chữa")).toBeVisible();

		// Verify form is accessible on mobile
		await expect(page.locator("input[placeholder*='09xxxxxxxx']")).toBeVisible();
		await expect(page.locator("button:has-text('TRA CỨU')")).toBeVisible();
	});

	test("should display contact information and business hours", async ({
		page,
	}) => {
		// Scroll to footer to check contact info
		await page.locator("footer").scrollIntoViewIfNeeded();

		// Verify Vietnamese contact information
		await expect(page.locator("text=Thông Tin Liên Hệ")).toBeVisible();
		await expect(page.locator("text=0988 661 875")).toBeVisible();
		await expect(page.locator("text=Giờ Làm Việc")).toBeVisible();
		await expect(page.locator("text=Sáng: 8:30 - 12:30")).toBeVisible();
		await expect(page.locator("text=Chiều: 14:30 - 18:00")).toBeVisible();

		// Verify address in Vietnamese
		await expect(page.locator("text=251 Vườn Lài")).toBeVisible();
		await expect(page.locator("text=Quận Tân Phú")).toBeVisible();
	});

	test("should display Vietnamese service descriptions", async ({ page }) => {
		// Verify Vietnamese service section
		await expect(page.locator("text=Dịch Vụ Chuyên Nghiệp")).toBeVisible();
		await expect(page.locator("text=Sửa Chữa Laptop")).toBeVisible();
		await expect(page.locator("text=Thay Thế Linh Kiện")).toBeVisible();
		await expect(page.locator("text=Nâng Cấp Hiệu Năng")).toBeVisible();
		await expect(page.locator("text=Bảo Hành Uy Tín")).toBeVisible();
	});

	test("should provide staff login link", async ({ page }) => {
		// Verify staff login link is available
		await page.locator("footer").scrollIntoViewIfNeeded();
		await expect(page.locator("text=Bạn là nhân viên?")).toBeVisible();
		await expect(page.locator("a[href='/login']")).toBeVisible();
		await expect(page.locator("text=Đăng nhập tại đây")).toBeVisible();
	});

	test("should handle lookup with valid test data", async ({ page }) => {
		// Note: This test would require seeded test data
		// For now, just verify the form submission process

		await page.fill("input[placeholder*='MS001']", "TK001");
		await page.fill("input[placeholder*='09xxxxxxxx']", "0901234567");

		// Click lookup button
		await page.locator("button:has-text('TRA CỨU')").click();

		// Should show loading state
		await expect(page.locator("text=Đang tra cứu...")).toBeVisible();

		// Note: Actual result would depend on test database state
		// In a real test environment, we'd verify the repair info display
	});

	test("should display error for non-existent repair", async ({ page }) => {
		// Use obviously fake data
		await page.fill("input[placeholder*='MS001']", "TK999");
		await page.fill("input[placeholder*='09xxxxxxxx']", "0909999999");

		await page.locator("button:has-text('TRA CỨU')").click();

		// Should eventually show Vietnamese error message
		await expect(page.locator("text=Không tìm thấy phiếu sửa chữa")).toBeVisible();
	});
});

test.describe("Public Lookup Security", () => {
	test("should not expose sensitive business data", async ({ page }) => {
		await page.goto("/");

		// Verify no admin-only content is visible
		await expect(page.locator("text=Admin")).not.toBeVisible();
		await expect(page.locator("text=Dashboard")).not.toBeVisible();
		await expect(page.locator("text=Quản trị")).not.toBeVisible();

		// Verify no internal costs or business metrics
		await expect(page.locator("text=profit")).not.toBeVisible();
		await expect(page.locator("text=cost")).not.toBeVisible();
		await expect(page.locator("text=margin")).not.toBeVisible();
	});

	test("should require phone verification for lookup", async ({ page }) => {
		await page.goto("/");

		// Try to lookup with ticket but no phone
		await page.fill("input[placeholder*='MS001']", "TK001");

		// Button should be disabled without phone number
		await expect(page.locator("button:has-text('TRA CỨU')")).toBeDisabled();
	});

	test("should not allow direct access to admin routes", async ({ page }) => {
		// Try to navigate directly to admin pages
		const response = await page.goto("/admin");

		// Should redirect to login or show unauthorized
		const currentUrl = page.url();
		expect(currentUrl).not.toContain("/admin");
	});
});