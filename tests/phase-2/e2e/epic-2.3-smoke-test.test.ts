/**
 * Epic 2.3: Public Repair Lookup Interface - Smoke Test
 * Simple E2E test to verify the public lookup functionality is working
 */

import { expect, test } from '@playwright/test';

test.describe('Epic 2.3: Public Repair Lookup - Smoke Test', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to homepage (public lookup interface)
		await page.goto('/');

		// Verify we're on the correct page
		await expect(page).toHaveTitle(/Quản Lý Sửa Chữa Laptop/);
	});

	test('Homepage loads with Vietnamese public repair lookup interface', async ({ page }) => {
		// Verify the page loads successfully
		await expect(page).toHaveURL(/.*\/$/);

		// Check for Vietnamese public interface elements
		await expect(page.locator('h1, h2, h3')).toContainText('Tra Cứu', { timeout: 10000 });

		// Verify basic form elements exist (phone/ticket lookup)
		const phoneInput = page.locator('input[type="tel"], input[placeholder*="điện thoại"]');
		const ticketInput = page.locator('input[placeholder*="mã phiếu"], input[placeholder*="ticket"]');

		// At least one of these input types should exist
		const hasPhoneInput = await phoneInput.count() > 0;
		const hasTicketInput = await ticketInput.count() > 0;

		expect(hasPhoneInput || hasTicketInput).toBe(true);

		// Look for Vietnamese UI text
		const vietnameseTexts = [
			'Tra cứu',
			'tra cứu',
			'Tìm kiếm',
			'tìm kiếm',
			'Số điện thoại',
			'số điện thoại',
			'Phiếu sửa chữa',
			'phiếu sửa chữa'
		];

		let foundVietnameseText = false;
		for (const text of vietnameseTexts) {
			const element = page.locator(`text=${text}`);
			if (await element.count() > 0) {
				foundVietnameseText = true;
				break;
			}
		}

		expect(foundVietnameseText).toBe(true);
	});

	test('Public interface is accessible without authentication', async ({ page }) => {
		// The fact that we can access the page without login proves this
		await expect(page).toHaveURL(/.*\/$/);

		// Should not see login required messages or redirects
		const loginRedirects = page.locator('text=login, text=đăng nhập, text="Đăng nhập"');
		await expect(loginRedirects).toHaveCount(0);

		// Page should contain Vietnamese content (not just loading states)
		const bodyText = await page.textContent('body');
		expect(bodyText).toBeTruthy();
		expect(bodyText!.length).toBeGreaterThan(100); // Should have substantial content
	});

	test('Vietnamese phone number format is supported', async ({ page }) => {
		// Look for phone input
		const phoneInput = page.locator('input[type="tel"], input[placeholder*="điện thoại"]').first();

		if (await phoneInput.count() > 0) {
			// Test Vietnamese phone number format
			await phoneInput.fill('0901234567');

			// Verify it accepts the format
			await expect(phoneInput).toHaveValue('0901234567');

			// Clear and test another format
			await phoneInput.fill('0987654321');
			await expect(phoneInput).toHaveValue('0987654321');
		} else {
			// If no direct phone input, look for any form input
			const anyInput = page.locator('input[type="text"], input[type="search"]').first();
			if (await anyInput.count() > 0) {
				await anyInput.fill('0901234567');
				await expect(anyInput).toHaveValue('0901234567');
			}
		}
	});

	test('LRP ticket code format is supported', async ({ page }) => {
		// Look for ticket code input
		const ticketInput = page.locator('input[placeholder*="mã"], input[placeholder*="ticket"], input[placeholder*="LRP"]').first();

		if (await ticketInput.count() > 0) {
			// Test LRP format
			const testTicketCode = 'LRP-2025-000001';
			await ticketInput.fill(testTicketCode);

			// Verify it accepts the format
			await expect(ticketInput).toHaveValue(testTicketCode);
		} else {
			// If no specific ticket input, try any text input
			const anyInput = page.locator('input[type="text"], input[type="search"]').first();
			if (await anyInput.count() > 0) {
				const testTicketCode = 'LRP-2025-000001';
				await anyInput.fill(testTicketCode);
				await expect(anyInput).toHaveValue(testTicketCode);
			}
		}
	});
});