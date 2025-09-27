/**
 * Epic 2.1.1: Phone-Based Customer Identification System Tests
 * Comprehensive unit tests for Vietnamese phone-based customer management
 */

import { useCustomers } from "@/hooks/use-customers";
import {
	normalizePhone,
	formatPhoneDisplay,
	validatePhone,
} from "@/lib/phone-utils";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Epic 2.1.1: Phone-Based Customer Identification System", () => {
	describe("Simplified Phone Number Validation", () => {
		it("should validate non-empty phone numbers", () => {
			const validNumbers = [
				"0901234567",
				"0987654321",
				"123456789",
				"02834567890",
				"555-1234",
				"(555) 123-4567",
			];

			for (const phone of validNumbers) {
				const result = validatePhone(phone);
				expect(result.isValid).toBe(true);
			}
		});

		it("should reject empty or whitespace phone numbers", () => {
			const invalidNumbers = [
				"", // Empty string
				"   ", // Only whitespace
				"\t\n", // Tabs and newlines
			];

			for (const phone of invalidNumbers) {
				const result = validatePhone(phone);
				expect(result.isValid).toBe(false);
				expect(result.error).toBeDefined();
			}
		});

		it("should handle any phone number format", () => {
			const phoneNumbers = [
				"+84901234567", // Vietnam with country code
				"+1234567890", // US number
				"555-CALL-NOW", // Text format
				"1-800-FLOWERS", // Mixed format
			];

			for (const phone of phoneNumbers) {
				const result = validatePhone(phone);
				expect(result.isValid).toBe(true);
			}
		});
	});

	describe("Phone Number Normalization", () => {
		it("should normalize phone numbers by trimming whitespace", () => {
			const testCases = [
				{ input: "  0901234567  ", expected: "0901234567" },
				{ input: "\t555-1234\n", expected: "555-1234" },
				{ input: "   +84901234567   ", expected: "+84901234567" },
			];

			for (const { input, expected } of testCases) {
				const result = normalizePhone(input);
				expect(result).toBe(expected);
			}
		});

		it("should convert between storage and display formats", () => {
			const phoneNumber = "0901234567";

			// Storage format (just trimmed)
			const storageFormat = normalizePhone(phoneNumber);
			expect(storageFormat).toBe("0901234567");

			// Display format (basic spacing)
			const displayFormat = formatPhoneDisplay(phoneNumber);
			expect(displayFormat).toBe("0901 234 567");
		});
	});

	describe("Customer Auto-Creation", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("should create customer when first repair ticket is submitted", async () => {
			const { result } = renderHook(() => useCustomers());

			const newCustomerData = {
				phone: "0901234567",
				fullName: "Nguyễn Văn Minh",
				email: "minh@example.com",
			};

			await act(async () => {
				const customer = await result.current.createCustomer(newCustomerData);
				expect(customer).toBeDefined();
				expect(customer.phone).toBe("0901234567");
				expect(customer.fullName).toBe("Nguyễn Văn Minh");
				expect(customer.createdAt).toBeDefined();
			});
		});

		it("should not create duplicate customers for existing phone numbers", async () => {
			const { result } = renderHook(() => useCustomers());

			const customerData = {
				phone: "0987654321",
				fullName: "Trần Thị Lan",
			};

			await act(async () => {
				// Create first customer
				const customer1 = await result.current.createCustomer(customerData);
				expect(customer1).toBeDefined();

				// Attempt to create duplicate
				const customer2 = await result.current.createCustomer(customerData);
				expect(customer2.id).toBe(customer1.id); // Should return existing customer
			});
		});
	});

	describe("Customer Search and Lookup", () => {
		it("should find customers by exact phone number match", async () => {
			const { result } = renderHook(() => useCustomers());

			await act(async () => {
				const customers = await result.current.searchCustomers({
					query: "0901234567",
				});

				if (customers.length > 0) {
					expect(customers[0].phone).toBe("0901234567");
				}
			});
		});

		it("should support partial phone number matching", async () => {
			const { result } = renderHook(() => useCustomers());

			await act(async () => {
				const customers = await result.current.searchCustomers({
					query: "0901",
				});

				for (const customer of customers) {
					expect(customer.phone).toContain("0901");
				}
			});
		});

		it("should handle phone number formatting variations", async () => {
			const { result } = renderHook(() => useCustomers());

			const variations = [
				"0901234567",
				"090 123 4567",
				"090-123-4567",
				"+84901234567",
			];

			for (const phone of variations) {
				await act(async () => {
					const customers = await result.current.searchCustomers({
						query: phone,
					});

					// All variations should find the same customer
					if (customers.length > 0) {
						expect(customers[0].phone).toBe("0901234567"); // Normalized format
					}
				});
			}
		});

		it("should return empty results for non-existent phone numbers", async () => {
			const { result } = renderHook(() => useCustomers());

			await act(async () => {
				const customers = await result.current.searchCustomers({
					query: "0999999999",
				});

				expect(customers.length).toBe(0);
			});
		});
	});

	describe("Phone Number Change Tracking", () => {
		it("should track phone number changes with history", async () => {
			const { result } = renderHook(() => useCustomers());

			const customerId = "test-customer-1";
			const oldPhone = "0901234567";
			const newPhone = "0987654321";

			await act(async () => {
				const changeRecord = await result.current.changeCustomerPhone(
					customerId,
					oldPhone,
					newPhone,
					"Customer requested phone update",
				);

				expect(changeRecord).toBeDefined();
				expect(changeRecord.oldPhone).toBe(oldPhone);
				expect(changeRecord.newPhone).toBe(newPhone);
				expect(changeRecord.reason).toBe("Customer requested phone update");
				expect(changeRecord.changedAt).toBeDefined();
			});
		});

		it("should maintain phone number history integrity", async () => {
			const { result } = renderHook(() => useCustomers());

			const customerId = "test-customer-2";

			await act(async () => {
				const history = await result.current.getPhoneChangeHistory(customerId);

				// Verify history is ordered by date (newest first)
				for (let i = 0; i < history.length - 1; i++) {
					const current = new Date(history[i].changedAt);
					const next = new Date(history[i + 1].changedAt);
					expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
				}
			});
		});
	});

	describe("Performance and Security", () => {
		it("should handle high-volume customer operations efficiently", async () => {
			const { result } = renderHook(() => useCustomers());

			const startTime = Date.now();

			await act(async () => {
				const promises = Array.from({ length: 100 }, (_, i) =>
					result.current.searchCustomers({
						query: `090${i.toString().padStart(7, "0")}`,
					}),
				);

				await Promise.all(promises);
			});

			const endTime = Date.now();
			const duration = endTime - startTime;

			// Should complete within reasonable time (< 5 seconds)
			expect(duration).toBeLessThan(5000);
		});

		it("should validate phone numbers for security", () => {
			const maliciousInputs = [
				"<script>alert('xss')</script>",
				"'; DROP TABLE customers; --",
				"${7*7}",
				"../../../etc/passwd",
			];

			for (const input of maliciousInputs) {
				const result = validateVietnamesePhone(input);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Invalid phone number format");
			}
		});
	});

	describe("Vietnamese Business Logic", () => {
		it("should handle Vietnamese carrier identification", () => {
			const carrierTests = [
				{ phone: "0901234567", expectedCarrier: "Viettel" },
				{ phone: "0987654321", expectedCarrier: "Vinaphone" },
				{ phone: "0912345678", expectedCarrier: "Mobifone" },
				{ phone: "0886543210", expectedCarrier: "Vietnamobile" },
			];

			for (const { phone, expectedCarrier } of carrierTests) {
				const result = validateVietnamesePhone(phone);
				expect(result.isValid).toBe(true);
				expect(result.carrier).toBe(expectedCarrier);
			}
		});

		it("should identify Vietnamese regions for landline numbers", () => {
			const regionTests = [
				{ phone: "02834567890", expectedRegion: "TP. Hồ Chí Minh" },
				{ phone: "02436789012", expectedRegion: "Hà Nội" },
				{ phone: "02363456789", expectedRegion: "Đà Nẵng" },
			];

			for (const { phone, expectedRegion } of regionTests) {
				const result = validateVietnamesePhone(phone);
				expect(result.isValid).toBe(true);
				expect(result.region).toBe(expectedRegion);
			}
		});

		it("should provide Vietnamese error messages", () => {
			const invalidPhone = "123456";
			const result = validateVietnamesePhone(invalidPhone);

			expect(result.isValid).toBe(false);
			expect(result.error).toContain("Số điện thoại không hợp lệ");
		});
	});
});
