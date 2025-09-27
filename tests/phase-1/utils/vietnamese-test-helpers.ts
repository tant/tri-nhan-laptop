/**
 * Vietnamese Test Helpers for Phase 1-3 Testing
 * Enhanced utilities for testing Vietnamese localization, character handling, and business logic
 *
 * Updated for Phase 3.4.2 compatibility with new type safety features:
 * - Integration with new type guards from @/lib/type-guards
 * - Enhanced Vietnamese validation patterns
 * - Type-safe test data generation
 * - Comprehensive JSDoc documentation
 *
 * @since 1.0.0
 * @updated Phase 3.4.2
 */

// Import new type guards for enhanced validation
import {
	isValidVietnamesePhone,
	isValidRepairTicketCode,
	isValidVietnameseCurrency,
	isValidVietnameseDate,
	ValidationHelpers
} from "@/lib/type-guards";
import { Currency, DateTime, Text } from "@/lib/formatting";

// Vietnamese test data
export const vietnameseTestData = {
	customerNames: [
		"Nguyễn Văn An",
		"Trần Thị Bình",
		"Lê Hoàng Cường",
		"Phạm Minh Đức",
		"Hoàng Thị Linh",
		"Vũ Đình Nam",
		"Đặng Thu Hà",
		"Bùi Quốc Việt",
	],

	phoneNumbers: [
		"0901234567",
		"0812345678",
		"0987654321",
		"0123456789",
		"0934567890",
	],

	addresses: [
		"251 Vườn Lài, Phường An Phú Đông, Quận 12, TP.HCM",
		"123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
		"456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM",
	],

	repairDescriptions: [
		"Máy tính bị chậm, cần nâng cấp RAM",
		"Màn hình laptop bị vỡ, cần thay thế",
		"Bàn phím không hoạt động một số phím",
		"Pin laptop không sạc được",
		"Quạt tản nhiệt kêu to, máy nóng",
	],

	errorMessages: {
		invalidPhone: "Số điện thoại không đúng định dạng",
		invalidTicket: "Số phiếu không đúng định dạng",
		notFound: "Không tìm thấy phiếu sửa chữa",
		unauthorized: "Bạn không có quyền truy cập",
		networkError: "Lỗi kết nối mạng",
	},

	successMessages: {
		loginSuccess: "Đăng nhập thành công",
		createSuccess: "Tạo mới thành công",
		updateSuccess: "Cập nhật thành công",
		deleteSuccess: "Xóa thành công",
	},
};

// Vietnamese character validation
export const vietnameseCharacters = {
	vowels: "aăâeêiouưuyoôơ",
	vowelsWithTones:
		"àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ",
	consonants: "bcdđfghjklmnpqrstvwxz",
	specialCombinations: ["ch", "gh", "gi", "kh", "ng", "nh", "ph", "th", "tr"],
};

// Ticket code generation patterns
export const ticketCodePatterns = {
	lrpFormat: /^LRP-\d{4}-\d{6}$/,
	msFormat: /^MS\d{3}$/,
	tkFormat: /^TK\d{3}$/,
};

/**
 * Enhanced Vietnamese phone number validation using new type guards
 * @namespace phoneValidation
 * @since 1.0.0
 * @updated Phase 3.4.2
 */
export const phoneValidation = {
	/**
	 * Validate Vietnamese phone number using enhanced type guard
	 * @param phone - Phone number string to validate
	 * @returns True if valid Vietnamese phone number
	 */
	validate: (phone: string): boolean => {
		return isValidVietnamesePhone(phone);
	},

	/**
	 * Format Vietnamese phone number for display using formatting utilities
	 * @param phone - Raw phone number string
	 * @returns Formatted phone number string
	 */
	format: (phone: string): string => {
		return Text.formatPhone(phone);
	},

	/**
	 * Generate valid test phone numbers
	 * @returns Array of valid Vietnamese phone numbers for testing
	 */
	generateValidNumbers: (): string[] => {
		return [
			"0901234567", "0812345678", "0987654321",
			"0334567890", "0521234567", "0763456789"
		].filter(isValidVietnamesePhone);
	},

	/**
	 * Generate invalid test phone numbers for validation testing
	 * @returns Array of invalid phone numbers for negative testing
	 */
	generateInvalidNumbers: (): string[] => {
		return [
			"123", "0101234567", "84901234567890",
			"090123456", "abcd123456", "+84901234567"
		];
	},
};

// Vietnamese text validation helpers
export const vietnameseTextValidation = {
	hasVietnameseCharacters: (text: string): boolean => {
		return /[àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(
			text,
		);
	},

	isValidVietnameseName: (name: string): boolean => {
		// Vietnamese names can contain letters, spaces, and Vietnamese diacritics
		return /^[a-zA-ZàáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]+$/.test(
			name,
		);
	},

	removeVietnameseTones: (text: string): string => {
		const toneMap: Record<string, string> = {
			àáạảãăằắặẳẵâầấậẩẫ: "a",
			èéẹẻẽêềếệểễ: "e",
			ìíịỉĩ: "i",
			òóọỏõôồốộổỗơờớợởỡ: "o",
			ùúụủũưừứựửữ: "u",
			ỳýỵỷỹ: "y",
			đ: "d",
			Đ: "D",
		};

		let result = text;
		for (const [tones, base] of Object.entries(toneMap)) {
			for (const char of tones) {
				result = result.replace(new RegExp(char, "g"), base);
			}
		}
		return result;
	},
};

// Database test utilities
export const databaseTestUtils = {
	createTestCustomer: () => ({
		id: crypto.randomUUID(),
		phone: vietnameseTestData.phoneNumbers[0],
		name: vietnameseTestData.customerNames[0],
		address: vietnameseTestData.addresses[0],
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}),

	createTestRepairTicket: (customerId: string) => ({
		id: crypto.randomUUID(),
		ticket_code: `LRP-${new Date().getFullYear()}-${Math.floor(
			Math.random() * 1000000,
		)
			.toString()
			.padStart(6, "0")}`,
		customer_id: customerId,
		device_info: "Laptop Dell Inspiron 15",
		issue_description: vietnameseTestData.repairDescriptions[0],
		status: "RECEIVED",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}),
};

// Environment validation
export const environmentValidation = {
	isTestEnvironment: () => process.env.NODE_ENV === "test",
	hasRequiredEnvVars: () => {
		const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
		return required.every((key) => process.env[key]);
	},
};

/**
 * Enhanced async testing utilities
 * @namespace asyncTestUtils
 * @since 1.0.0
 * @updated Phase 3.4.2
 */
export const asyncTestUtils = {
	/**
	 * Wait for DOM element to appear
	 * @param selector - CSS selector to wait for
	 * @param timeout - Timeout in milliseconds (default: 5000)
	 * @returns Promise resolving to element or null if timeout
	 */
	waitForElement: async (
		selector: string,
		timeout = 5000,
	): Promise<Element | null> => {
		return new Promise((resolve) => {
			const element = document.querySelector(selector);
			if (element) {
				resolve(element);
				return;
			}

			const observer = new MutationObserver(() => {
				const element = document.querySelector(selector);
				if (element) {
					observer.disconnect();
					resolve(element);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			setTimeout(() => {
				observer.disconnect();
				resolve(null);
			}, timeout);
		});
	},

	/**
	 * Simple delay utility for testing
	 * @param ms - Milliseconds to delay
	 * @returns Promise that resolves after delay
	 */
	delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * Enhanced Vietnamese business validation utilities using Phase 3.4.1 type guards
 * @namespace enhancedValidation
 * @since Phase 3.4.2
 */
export const enhancedValidation = {
	/**
	 * Validate Vietnamese business data using new type guards
	 * @param data - Object containing Vietnamese business data
	 * @returns Validation result object
	 */
	validateBusinessData: (data: {
		phone?: string;
		currency?: number;
		ticketCode?: string;
		date?: string;
	}) => {
		const errors: string[] = [];

		if (data.phone && !isValidVietnamesePhone(data.phone)) {
			errors.push("Invalid Vietnamese phone number format");
		}

		if (data.currency !== undefined && !isValidVietnameseCurrency(data.currency)) {
			errors.push("Invalid Vietnamese currency amount");
		}

		if (data.ticketCode && !isValidRepairTicketCode(data.ticketCode)) {
			errors.push("Invalid repair ticket code format");
		}

		if (data.date && !isValidVietnameseDate(data.date)) {
			errors.push("Invalid date format");
		}

		return {
			isValid: errors.length === 0,
			errors,
			data
		};
	},

	/**
	 * Test Vietnamese formatting functions with type safety
	 * @param testData - Test data to format and validate
	 * @returns Formatted and validated test results
	 */
	testVietnameseFormatting: (testData: {
		currency?: number;
		date?: string | Date;
		phone?: string;
		ticketCode?: string;
	}) => {
		const results: Record<string, any> = {};

		if (testData.currency !== undefined) {
			results.currency = {
				formatted: Currency.format(testData.currency),
				compact: Currency.formatCompact(testData.currency),
				isValid: isValidVietnameseCurrency(testData.currency)
			};
		}

		if (testData.date) {
			results.date = {
				formatted: DateTime.formatDate(testData.date),
				relative: DateTime.formatRelative(testData.date),
				isValid: isValidVietnameseDate(typeof testData.date === 'string' ? testData.date : testData.date.toISOString())
			};
		}

		if (testData.phone) {
			results.phone = {
				formatted: Text.formatPhone(testData.phone),
				isValid: isValidVietnamesePhone(testData.phone)
			};
		}

		if (testData.ticketCode) {
			results.ticketCode = {
				formatted: Text.formatTicketCode(testData.ticketCode),
				isValid: isValidRepairTicketCode(testData.ticketCode)
			};
		}

		return results;
	},

	/**
	 * Generate comprehensive test data for Vietnamese business scenarios
	 * @returns Object containing valid and invalid test data sets
	 */
	generateTestScenarios: () => {
		return {
			valid: {
				customers: ValidationHelpers.validateCustomers([
					{ phone: "0901234567", full_name: "Nguyễn Văn An", address: "123 Test St", notes: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }
				]),
				currencies: [100000, 500000, 1500000, 3000000].filter(isValidVietnameseCurrency),
				dates: ["2024-01-01T00:00:00Z", "2025-09-26T10:30:00Z"].filter(isValidVietnameseDate),
				ticketCodes: ["LRP-2024-000001", "LRP-2025-123456"].filter(isValidRepairTicketCode)
			},
			invalid: {
				phones: ["123", "abc", "01012345678"],
				currencies: [-100, 150000000, NaN, Infinity],
				dates: ["invalid-date", "2019-01-01", "2035-01-01"],
				ticketCodes: ["ABC-123", "LRP-2024", "INVALID-CODE"]
			}
		};
	}
};
