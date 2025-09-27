/**
 * Vietnamese Business Workflows Integration Tests
 * Phase 3.4.2 - Testing Vietnamese-specific business logic and processes
 *
 * Tests focus on Vietnamese business context:
 * 1. Vietnamese customer identification and validation
 * 2. Vietnamese currency calculations and formatting
 * 3. Vietnamese date/time handling for Asia/Ho_Chi_Minh timezone
 * 4. Vietnamese repair workflow status transitions
 * 5. Vietnamese phone number patterns and validation
 * 6. Vietnamese text processing and character handling
 *
 * Validates integration between formatting utilities, type guards, and business logic
 *
 * @since Phase 3.4.2
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	globalSupabaseMock,
	VietnameseMockDataGenerator
} from "../utils/supabase-mock";
import {
	enhancedValidation,
	phoneValidation,
	vietnameseTextValidation,
	vietnameseTestData
} from "../phase-1/utils/vietnamese-test-helpers";

// Import Phase 3.4.1 enhancements
import {
	isValidVietnamesePhone,
	isValidRepairTicketCode,
	isValidVietnameseCurrency,
	isValidVietnameseDate,
	ValidationHelpers
} from "@/lib/type-guards";
import { Currency, DateTime, Text, Numbers, Business } from "@/lib/formatting";

// Import types
import type { Customer, RepairTicket } from "@/lib/database-types";

describe("Vietnamese Business Workflows - Integration Tests", () => {
	beforeEach(() => {
		globalSupabaseMock.reset();
		globalSupabaseMock.seedTestData();
	});

	describe("Vietnamese Customer Management Workflow", () => {
		it("should handle Vietnamese customer names with proper diacritics", async () => {
			const vietnameseNames = [
				"Nguyễn Văn An",
				"Trần Thị Bình",
				"Lê Hoàng Cường",
				"Phạm Minh Đức",
				"Hoàng Thị Linh",
				"Vũ Đình Nam",
				"Đặng Thu Hà",
				"Bùi Quốc Việt"
			];

			for (const name of vietnameseNames) {
				// Validate Vietnamese name format
				expect(vietnameseTextValidation.isValidVietnameseName(name)).toBe(true);
				expect(vietnameseTextValidation.hasVietnameseCharacters(name)).toBe(true);

				// Create customer with Vietnamese name
				const customer = VietnameseMockDataGenerator.createMockCustomer({
					full_name: name,
					phone: phoneValidation.generateValidNumbers()[0]
				});

				// Validate customer creation
				expect(customer.full_name).toBe(name);
				expect(ValidationHelpers.validateSingleCustomer(customer)).toBeTruthy();

				// Test name processing
				const nameWithoutTones = vietnameseTextValidation.removeVietnameseTones(name);
				expect(nameWithoutTones).not.toEqual(name); // Should be different
				expect(nameWithoutTones).toMatch(/^[a-zA-Z\s]+$/); // Should only contain ASCII
			}
		});

		it("should handle Vietnamese addresses with proper formatting", async () => {
			const vietnameseAddresses = [
				"251 Vườn Lài, Phường An Phú Đông, Quận 12, TP.HCM",
				"123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
				"456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM",
				"789 Võ Văn Tần, Phường 6, Quận 3, TP.HCM",
				"101 Hai Bà Trưng, Phường Đa Kao, Quận 1, TP.HCM"
			];

			vietnameseAddresses.forEach((address, index) => {
				const customer = VietnameseMockDataGenerator.createMockCustomer({
					address,
					phone: `090${(index + 1).toString().padStart(7, "0")}`
				});

				expect(customer.address).toBe(address);
				expect(vietnameseTextValidation.hasVietnameseCharacters(address)).toBe(true);

				// Validate address contains Vietnamese location indicators
				expect(address).toMatch(/(Phường|Quận|TP\.HCM|Đường|Ngõ)/);
			});
		});

		it("should handle customer search with Vietnamese text normalization", async () => {
			const originalName = "Nguyễn Văn An";
			const searchVariations = [
				"Nguyen Van An",     // Without tones
				"nguyen van an",     // Lowercase
				"NGUYEN VAN AN",     // Uppercase
				"Nguyễn Văn An",     // Original with tones
				"Nguyen van An"      // Mixed case
			];

			const customer = VietnameseMockDataGenerator.createMockCustomer({
				full_name: originalName
			});

			searchVariations.forEach(searchTerm => {
				const normalizedSearch = vietnameseTextValidation.removeVietnameseTones(searchTerm.toLowerCase());
				const normalizedCustomer = vietnameseTextValidation.removeVietnameseTones(customer.full_name.toLowerCase());

				// Should match when tones are removed
				expect(normalizedSearch).toBe(normalizedCustomer);
			});
		});
	});

	describe("Vietnamese Currency and Pricing Workflow", () => {
		it("should handle Vietnamese repair pricing structure", async () => {
			const repairCategories = [
				{ category: "basic_cleaning", basePrice: 200000, description: "Vệ sinh máy cơ bản" },
				{ category: "screen_replacement", basePrice: 2500000, description: "Thay màn hình laptop" },
				{ category: "keyboard_repair", basePrice: 800000, description: "Sửa chữa bàn phím" },
				{ category: "motherboard_repair", basePrice: 3500000, description: "Sửa chữa mainboard" },
				{ category: "data_recovery", basePrice: 1500000, description: "Khôi phục dữ liệu" },
				{ category: "virus_removal", basePrice: 300000, description: "Diệt virus, cài đặt phần mềm" },
				{ category: "hardware_upgrade", basePrice: 1200000, description: "Nâng cấp phần cứng" }
			];

			repairCategories.forEach(repair => {
				// Validate Vietnamese currency amounts
				expect(isValidVietnameseCurrency(repair.basePrice)).toBe(true);

				// Test currency formatting
				const formatted = Currency.format(repair.basePrice);
				expect(formatted).toContain("₫");
				expect(formatted).toMatch(/[\d.]+\s₫$/);

				// Test compact formatting for charts
				const compact = Currency.formatCompact(repair.basePrice);
				expect(compact).toBeTruthy();

				// Validate Vietnamese description
				expect(vietnameseTextValidation.hasVietnameseCharacters(repair.description)).toBe(true);

				// Test cost breakdown with labor
				const laborCost = Math.floor(repair.basePrice * 0.3); // 30% labor
				const partsCost = repair.basePrice - laborCost;

				const breakdown = Currency.formatBreakdown(partsCost, laborCost);
				expect(breakdown.total).toBe(Currency.format(repair.basePrice));
				expect(breakdown.breakdown).toContain("Linh kiện:");
				expect(breakdown.breakdown).toContain("Công:");
			});
		});

		it("should handle Vietnamese tax and discount calculations", async () => {
			const basePrice = 2000000; // 2 million VND
			const vatRate = 0.1; // 10% VAT
			const discountRate = 0.05; // 5% discount

			// Calculate pricing structure
			const subtotal = basePrice;
			const discountAmount = subtotal * discountRate;
			const afterDiscount = subtotal - discountAmount;
			const vatAmount = afterDiscount * vatRate;
			const finalTotal = afterDiscount + vatAmount;

			// Validate all amounts are valid Vietnamese currency
			[subtotal, discountAmount, afterDiscount, vatAmount, finalTotal].forEach(amount => {
				expect(isValidVietnameseCurrency(amount)).toBe(true);
			});

			// Test Vietnamese formatting for invoice
			const invoiceBreakdown = {
				subtotal: Currency.format(subtotal),
				discount: Currency.format(discountAmount),
				afterDiscount: Currency.format(afterDiscount),
				vat: Currency.format(vatAmount),
				total: Currency.format(finalTotal)
			};

			expect(invoiceBreakdown.subtotal).toBe("2.000.000 ₫");
			expect(invoiceBreakdown.discount).toBe("100.000 ₫");
			expect(invoiceBreakdown.afterDiscount).toBe("1.900.000 ₫");
			expect(invoiceBreakdown.vat).toBe("190.000 ₫");
			expect(invoiceBreakdown.total).toBe("2.090.000 ₫");

			// Test percentage formatting
			const discountPercent = Numbers.formatPercent(discountAmount, subtotal);
			const vatPercent = Numbers.formatPercent(vatAmount, afterDiscount);

			expect(discountPercent).toBe("5%");
			expect(vatPercent).toBe("10%");
		});

		it("should handle Vietnamese price range formatting", async () => {
			const priceRanges = [
				{ min: 500000, max: 800000, service: "Vệ sinh laptop" },
				{ min: 1500000, max: 3000000, service: "Thay màn hình" },
				{ min: 2000000, max: 5000000, service: "Sửa mainboard" },
				{ min: 800000, max: 800000, service: "Cài đặt Windows" } // Fixed price
			];

			priceRanges.forEach(range => {
				const formattedRange = Currency.formatRange(range.min, range.max);

				if (range.min === range.max) {
					// Fixed price
					expect(formattedRange).toBe(Currency.format(range.min));
				} else {
					// Price range
					expect(formattedRange).toContain(" - ");
					expect(formattedRange).toContain(Currency.format(range.min));
					expect(formattedRange).toContain(Currency.format(range.max));
				}

				// Validate Vietnamese service description
				expect(vietnameseTextValidation.hasVietnameseCharacters(range.service)).toBe(true);
			});
		});
	});

	describe("Vietnamese Date/Time and Scheduling Workflow", () => {
		it("should handle Vietnamese date formatting for Asia/Ho_Chi_Minh timezone", async () => {
			const testDates = [
				new Date("2025-01-15T10:30:00Z"),
				new Date("2025-06-20T14:45:00Z"),
				new Date("2025-12-25T08:15:00Z")
			];

			testDates.forEach(date => {
				// Validate date
				expect(isValidVietnameseDate(date.toISOString())).toBe(true);

				// Test Vietnamese date formatting
				const formatted = DateTime.formatDate(date);
				expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);

				// Test Vietnamese datetime formatting
				const formattedDateTime = DateTime.formatDateTime(date);
				expect(formattedDateTime).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);

				// Test Vietnamese long date formatting
				const longDate = DateTime.formatLongDate(date);
				expect(longDate).toMatch(/(Thứ|Chủ nhật)/);
				expect(longDate).toContain("tháng");

				// Test Vietnamese day of week
				const dayOfWeek = DateTime.getDayOfWeek(date);
				expect(dayOfWeek).toMatch(/(Chủ nhật|Thứ [a-zA-Z]+)/);
			});
		});

		it("should handle Vietnamese relative time formatting", async () => {
			const now = new Date();
			const timeIntervals = [
				{ offset: -30 * 1000, expected: "Vừa xong" }, // 30 seconds ago
				{ offset: -5 * 60 * 1000, expected: "5 phút trước" }, // 5 minutes ago
				{ offset: -2 * 60 * 60 * 1000, expected: "2 giờ trước" }, // 2 hours ago
				{ offset: -1 * 24 * 60 * 60 * 1000, expected: "1 ngày trước" }, // 1 day ago
				{ offset: -3 * 24 * 60 * 60 * 1000, expected: "3 ngày trước" } // 3 days ago
			];

			timeIntervals.forEach(({ offset, expected }) => {
				const testDate = new Date(now.getTime() + offset);
				const relative = DateTime.formatRelative(testDate);

				if (offset >= -60 * 1000) {
					expect(relative).toBe("Vừa xong");
				} else if (offset >= -60 * 60 * 1000) {
					expect(relative).toContain("phút trước");
				} else if (offset >= -24 * 60 * 60 * 1000) {
					expect(relative).toContain("giờ trước");
				} else if (offset >= -7 * 24 * 60 * 60 * 1000) {
					expect(relative).toContain("ngày trước");
				}
			});
		});

		it("should handle Vietnamese repair duration formatting", async () => {
			const repairDurations = [
				{ minutes: 30, expected: "30 phút" },
				{ minutes: 60, expected: "1 giờ" },
				{ minutes: 90, expected: "1 giờ 30 phút" },
				{ minutes: 120, expected: "2 giờ" },
				{ minutes: 150, expected: "2 giờ 30 phút" },
				{ minutes: 480, expected: "8 giờ" } // Full work day
			];

			repairDurations.forEach(({ minutes, expected }) => {
				const formatted = DateTime.formatDuration(minutes);
				expect(formatted).toBe(expected);

				// Test business formatting integration
				const estimateWithCost = Business.formatEstimate(1500000, minutes);
				expect(estimateWithCost).toContain(Currency.format(1500000));
				expect(estimateWithCost).toContain(expected);
				expect(estimateWithCost).toContain(" • ");
			});
		});
	});

	describe("Vietnamese Phone Number Workflow", () => {
		it("should handle all Vietnamese mobile number prefixes", async () => {
			const vietnamesePrefixes = [
				"090", "091", "092", "093", "094", "095", "096", "097", "098", "099", // Viettel
				"081", "082", "083", "084", "085", "088", // Vinaphone
				"070", "071", "072", "073", "074", "075", "076", "077", "078", "079", // Mobifone
				"056", "058", // Vietnamobile
				"032", "033", "034", "035", "036", "037", "038", "039" // Viettel new
			];

			vietnamesePrefixes.forEach(prefix => {
				const testNumber = `${prefix}1234567`;

				// Validate Vietnamese phone number
				expect(isValidVietnamesePhone(testNumber)).toBe(true);

				// Test formatting
				const formatted = Text.formatPhone(testNumber);
				expect(formatted).toMatch(/^\d{4} \d{3} \d{3}$/);
				expect(formatted).toBe(`${prefix}1 234 567`);

				// Create customer with this phone
				const customer = VietnameseMockDataGenerator.createMockCustomer({
					phone: testNumber
				});

				expect(customer.phone).toBe(testNumber);
				expect(ValidationHelpers.validateSingleCustomer(customer)).toBeTruthy();
			});
		});

		it("should handle international Vietnamese phone format", async () => {
			const internationalNumbers = [
				"84901234567",  // +84 format without +
				"84812345678",  // Different prefix
				"84987654321"   // Another variation
			];

			internationalNumbers.forEach(intlNumber => {
				// Should be valid for international format
				expect(intlNumber.startsWith("84")).toBe(true);
				expect(intlNumber.length).toBe(11);

				// Test formatting international numbers
				const formatted = Text.formatPhone(intlNumber);
				expect(formatted).toMatch(/^\+84 \d{3} \d{3} \d{3}$/);
			});
		});

		it("should handle phone number validation in repair tickets", async () => {
			const validPhones = phoneValidation.generateValidNumbers();
			const invalidPhones = phoneValidation.generateInvalidNumbers();

			// Test valid phone numbers in tickets
			validPhones.forEach(phone => {
				const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
					customer_phone: phone
				});

				expect(isValidVietnamesePhone(ticket.customer_phone)).toBe(true);
				expect(ValidationHelpers.validateSingleRepairTicket(ticket)).toBeTruthy();

				// Test phone formatting in business context
				const customerSummary = Business.formatCustomerSummary(
					"Nguyễn Văn Test",
					phone,
					3
				);
				expect(customerSummary).toContain(Text.formatPhone(phone));
				expect(customerSummary).toContain("3 lần sửa chữa");
			});

			// Test invalid phone numbers should fail validation
			invalidPhones.forEach(phone => {
				expect(isValidVietnamesePhone(phone)).toBe(false);

				const validation = enhancedValidation.validateBusinessData({
					phone: phone
				});
				expect(validation.isValid).toBe(false);
				expect(validation.errors).toContain("Invalid Vietnamese phone number format");
			});
		});
	});

	describe("Vietnamese Text Processing Workflow", () => {
		it("should handle Vietnamese repair descriptions and search", async () => {
			const vietnameseRepairDescriptions = [
				"Màn hình laptop bị vỡ góc trên bên phải, cần thay thế hoàn toàn",
				"Bàn phím không hoạt động một số phím, đặc biệt là phím cách và enter",
				"Quạt tản nhiệt kêu to bất thường, laptop nóng và chạy chậm",
				"Pin laptop không sạc được, báo full nhưng rút điện là tắt ngay",
				"Wifi không bắt được, máy không nhận card mạng không dây",
				"Máy tính khởi động chậm, thường xuyên bị treo và tự động restart"
			];

			vietnameseRepairDescriptions.forEach(description => {
				// Validate Vietnamese text
				expect(vietnameseTextValidation.hasVietnameseCharacters(description)).toBe(true);

				// Create repair ticket with Vietnamese description
				const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
					issue_description: description,
					customer_description: `Khách hàng báo: ${description}`
				});

				expect(ticket.issue_description).toBe(description);
				expect(ticket.customer_description).toContain(description);

				// Test text truncation for display
				const truncated = Text.truncate(description, 50);
				if (description.length > 50) {
					expect(truncated).toEndWith("...");
					expect(truncated.length).toBeLessThanOrEqual(53); // 50 + "..."
				} else {
					expect(truncated).toBe(description);
				}

				// Test search preparation (tone removal)
				const searchable = vietnameseTextValidation.removeVietnameseTones(description);
				expect(searchable).not.toMatch(/[àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/);
			});
		});

		it("should handle Vietnamese status and priority formatting", async () => {
			const repairStatuses = [
				"device_received",
				"preliminary_inspection",
				"awaiting_repair_plan",
				"approved_for_repair",
				"in_diagnosis",
				"waiting_parts",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"completed"
			];

			const priorities = ["low", "normal", "high", "urgent"];

			repairStatuses.forEach(status => {
				const formatted = Text.formatStatus(status);
				expect(formatted).toBeTruthy();
				expect(formatted).not.toContain("_"); // Should replace underscores

				// First letter should be capitalized
				expect(formatted.charAt(0)).toEqual(formatted.charAt(0).toUpperCase());
			});

			priorities.forEach(priority => {
				const formatted = Text.formatStatus(priority);
				expect(formatted).toBeTruthy();
				expect(formatted.charAt(0)).toEqual(formatted.charAt(0).toUpperCase());
			});
		});

		it("should handle Vietnamese ticket code formatting and validation", async () => {
			const currentYear = new Date().getFullYear();
			const testCodes = [
				`LRP-${currentYear}-000001`,
				`LRP-${currentYear}-123456`,
				`LRP-${currentYear}-999999`
			];

			testCodes.forEach(code => {
				// Validate ticket code format
				expect(isValidRepairTicketCode(code)).toBe(true);

				// Test formatting (should return as-is for valid codes)
				const formatted = Text.formatTicketCode(code);
				expect(formatted).toBe(code);

				// Create ticket with this code
				const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
					ticket_code: code
				});

				expect(ticket.ticket_code).toBe(code);
			});

			// Test auto-formatting of numeric codes
			const numericCodes = ["1", "123", "123456"];
			numericCodes.forEach(numCode => {
				const formatted = Text.formatTicketCode(numCode);
				expect(formatted).toMatch(/^LRP-\d{4}-\d{6}$/);
				expect(formatted).toContain(currentYear.toString());
				expect(isValidRepairTicketCode(formatted)).toBe(true);
			});
		});
	});

	describe("Vietnamese Business Logic Integration", () => {
		it("should handle complete Vietnamese repair workflow", async () => {
			// Create Vietnamese customer
			const customer = VietnameseMockDataGenerator.createMockCustomer({
				phone: "0901234567",
				full_name: "Nguyễn Văn An",
				address: "123 Nguyễn Trãi, Quận 1, TP.HCM"
			});

			// Create repair ticket with Vietnamese context
			const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
				customer_phone: customer.phone,
				issue_description: "Màn hình laptop bị vỡ, cần thay thế màn hình mới",
				customer_description: "Khách hàng làm rơi laptop, màn hình bị nứt",
				estimated_cost: 2500000
			});

			// Validate complete workflow data
			expect(ValidationHelpers.validateSingleCustomer(customer)).toBeTruthy();
			expect(ValidationHelpers.validateSingleRepairTicket(ticket)).toBeTruthy();

			// Test Vietnamese formatting integration
			const customerSummary = Business.formatCustomerSummary(
				customer.full_name,
				customer.phone,
				1
			);

			const estimateFormatted = Business.formatEstimate(
				ticket.estimated_cost!,
				120 // 2 hours estimated duration
			);

			expect(customerSummary).toContain("Nguyễn Văn An");
			expect(customerSummary).toContain("0901 234 567");
			expect(customerSummary).toContain("1 lần sửa chữa");

			expect(estimateFormatted).toContain("2.500.000 ₫");
			expect(estimateFormatted).toContain("2 giờ");
			expect(estimateFormatted).toContain(" • ");

			// Validate all Vietnamese text contains diacritics
			expect(vietnameseTextValidation.hasVietnameseCharacters(customer.full_name)).toBe(true);
			expect(vietnameseTextValidation.hasVietnameseCharacters(ticket.issue_description)).toBe(true);
			expect(vietnameseTextValidation.hasVietnameseCharacters(ticket.customer_description)).toBe(true);
		});
	});
});