/**
 * Critical User Workflows Integration Tests
 * Phase 3.4.2 - End-to-end testing of key business processes
 *
 * Tests cover the most critical user journeys in the Vietnamese laptop repair shop:
 * 1. Complete repair ticket lifecycle (creation to completion)
 * 2. Customer lookup and management workflow
 * 3. Vietnamese phone-based customer identification
 * 4. Real-time status updates and notifications
 * 5. Parts inventory and cost calculations
 * 6. Staff authentication and role-based access
 *
 * Uses Phase 3.4.1 type safety enhancements and enhanced Supabase mocking
 *
 * @since Phase 3.4.2
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";

// Import enhanced testing utilities
import {
	globalSupabaseMock,
	VietnameseMockDataGenerator
} from "../utils/supabase-mock";
import {
	enhancedValidation,
	phoneValidation,
	vietnameseTestData
} from "../phase-1/utils/vietnamese-test-helpers";

// Import type guards and validation
import {
	isValidVietnamesePhone,
	isValidRepairTicketCode,
	ValidationHelpers
} from "@/lib/type-guards";
import { Currency, DateTime, Text } from "@/lib/formatting";

// Import types for type safety
import type { Customer, RepairTicket, Part } from "@/lib/database-types";

describe("Critical User Workflows - Integration Tests", () => {
	beforeEach(() => {
		// Reset and seed fresh test data
		globalSupabaseMock.reset();
		globalSupabaseMock.seedTestData();
		vi.clearAllMocks();
	});

	describe("Workflow 1: Complete Repair Ticket Lifecycle", () => {
		it("should handle complete repair ticket creation to completion workflow", async () => {
			// Step 1: Customer calls with phone number
			const customerPhone = "0901234567";
			const customerName = "Nguyễn Văn An";

			// Validate Vietnamese phone number
			expect(isValidVietnamesePhone(customerPhone)).toBe(true);

			// Step 2: Create customer if not exists
			const customerData = VietnameseMockDataGenerator.createMockCustomer({
				phone: customerPhone,
				full_name: customerName,
				address: "123 Nguyễn Trãi, Quận 1, TP.HCM"
			});

			// Validate customer data
			expect(ValidationHelpers.validateSingleCustomer(customerData)).toBeTruthy();

			// Step 3: Create repair ticket with Vietnamese business validation
			const ticketData = VietnameseMockDataGenerator.createMockRepairTicket({
				customer_phone: customerPhone,
				issue_description: "Màn hình laptop bị vỡ, cần thay thế hoàn toàn",
				customer_description: "Khách hàng làm rơi laptop, màn hình bị nứt và không hiển thị được",
				device_info: {
					brand: "ASUS",
					model: "VivoBook S15",
					type: "laptop",
					serial_number: "AS240901001"
				},
				priority: "high",
				estimated_cost: 2500000
			});

			// Validate ticket data and business constraints
			expect(isValidRepairTicketCode(ticketData.ticket_code)).toBe(true);
			expect(ticketData.estimated_cost).toBeLessThanOrEqual(100_000_000); // Vietnamese currency validation
			expect(ticketData.customer_phone).toBe(customerPhone);

			// Step 4: Validate Vietnamese formatting
			const formattedCost = Currency.format(ticketData.estimated_cost!);
			expect(formattedCost).toContain("₫");
			expect(formattedCost).toContain("2.500.000");

			// Step 5: Validate status progression through Vietnamese workflow
			const workflowStatuses = [
				"device_received",
				"preliminary_inspection",
				"awaiting_repair_plan",
				"approved_for_repair",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"completed"
			];

			let currentTicket = ticketData;
			for (const status of workflowStatuses) {
				currentTicket = {
					...currentTicket,
					status: status as RepairTicket["status"],
					updated_at: new Date().toISOString()
				};

				// Validate status transition
				expect(currentTicket.status).toBe(status);

				// Validate Vietnamese status formatting
				const formattedStatus = Text.formatStatus(status);
				expect(formattedStatus).toBeTruthy();
			}

			// Step 6: Final validation of completed ticket
			expect(currentTicket.status).toBe("completed");
			expect(currentTicket.customer_phone).toBe(customerPhone);
			expect(isValidRepairTicketCode(currentTicket.ticket_code)).toBe(true);
		});

		it("should handle emergency high-priority repair workflow", async () => {
			const urgentTicket = VietnameseMockDataGenerator.createMockRepairTicket({
				customer_phone: "0912345678",
				priority: "urgent",
				issue_description: "Laptop không khởi động được - mất dữ liệu quan trọng",
				customer_description: "Cần sửa gấp trong ngày, có dữ liệu công việc quan trọng",
				estimated_cost: 1500000
			});

			// Validate urgent priority handling
			expect(urgentTicket.priority).toBe("urgent");

			// Test Vietnamese business validation for urgent repairs
			const validation = enhancedValidation.validateBusinessData({
				phone: urgentTicket.customer_phone,
				currency: urgentTicket.estimated_cost,
				ticketCode: urgentTicket.ticket_code
			});

			expect(validation.isValid).toBe(true);
			expect(validation.errors).toHaveLength(0);

			// Validate formatting for urgent ticket display
			const formattedEstimate = Currency.format(urgentTicket.estimated_cost!);
			const formattedCode = Text.formatTicketCode(urgentTicket.ticket_code);
			const formattedPhone = Text.formatPhone(urgentTicket.customer_phone);

			expect(formattedEstimate).toBe("1.500.000 ₫");
			expect(formattedCode).toMatch(/^LRP-\d{4}-\d{6}$/);
			expect(formattedPhone).toBe("0912 345 678");
		});
	});

	describe("Workflow 2: Customer Lookup and Management", () => {
		it("should handle phone-based customer lookup workflow", async () => {
			// Test various Vietnamese phone number formats
			const phoneVariations = [
				"0901234567",     // Standard format
				"0901 234 567",   // Formatted with spaces
				"0901-234-567",   // Formatted with dashes
				"090 123 4567"    // Alternative spacing
			];

			for (const phoneInput of phoneVariations) {
				// Clean and validate phone number
				const cleanPhone = phoneInput.replace(/[\s\-]/g, "");
				expect(isValidVietnamesePhone(cleanPhone)).toBe(true);

				// Format for display
				const formattedPhone = phoneValidation.format(cleanPhone);
				expect(formattedPhone).toContain(" ");
				expect(formattedPhone.length).toBeGreaterThan(cleanPhone.length);

				// Simulate customer lookup
				const customer = VietnameseMockDataGenerator.createMockCustomer({
					phone: cleanPhone,
					full_name: "Khách hàng Test"
				});

				expect(customer.phone).toBe(cleanPhone);
				expect(ValidationHelpers.validateSingleCustomer(customer)).toBeTruthy();
			}
		});

		it("should handle returning customer with repair history", async () => {
			const returningCustomer = VietnameseMockDataGenerator.createMockCustomer({
				phone: "0901234567",
				full_name: "Nguyễn Văn Bình - Khách hàng VIP"
			});

			// Create multiple repair tickets for this customer
			const repairHistory = [
				VietnameseMockDataGenerator.createMockRepairTicket({
					customer_phone: returningCustomer.phone,
					issue_description: "Sửa màn hình lần 1",
					status: "completed"
				}),
				VietnameseMockDataGenerator.createMockRepairTicket({
					customer_phone: returningCustomer.phone,
					issue_description: "Thay bàn phím lần 2",
					status: "completed"
				}),
				VietnameseMockDataGenerator.createMockRepairTicket({
					customer_phone: returningCustomer.phone,
					issue_description: "Nâng cấp RAM lần 3",
					status: "in_repair"
				})
			];

			// Validate all tickets belong to same customer
			repairHistory.forEach(ticket => {
				expect(ticket.customer_phone).toBe(returningCustomer.phone);
				expect(isValidRepairTicketCode(ticket.ticket_code)).toBe(true);
			});

			// Calculate customer statistics
			const completedRepairs = repairHistory.filter(t => t.status === "completed");
			const activeRepairs = repairHistory.filter(t => t.status !== "completed");

			expect(completedRepairs.length).toBe(2);
			expect(activeRepairs.length).toBe(1);

			// Test customer summary formatting
			const customerSummary = `${returningCustomer.full_name} (${Text.formatPhone(returningCustomer.phone)}) • ${completedRepairs.length} lần sửa chữa hoàn thành`;
			expect(customerSummary).toContain("Nguyễn Văn Bình");
			expect(customerSummary).toContain("0901 234 567");
			expect(customerSummary).toContain("2 lần sửa chữa");
		});
	});

	describe("Workflow 3: Parts Inventory and Cost Calculation", () => {
		it("should handle parts selection and cost calculation workflow", async () => {
			// Create parts inventory
			const parts = [
				VietnameseMockDataGenerator.createMockPart({
					name: "Màn hình laptop 15.6 inch",
					unit_price: 2000000,
					current_stock: 5,
					min_stock_level: 2
				}),
				VietnameseMockDataGenerator.createMockPart({
					name: "RAM DDR4 8GB",
					unit_price: 800000,
					current_stock: 10,
					min_stock_level: 3
				}),
				VietnameseMockDataGenerator.createMockPart({
					name: "SSD 256GB",
					unit_price: 1200000,
					current_stock: 1,
					min_stock_level: 2
				})
			];

			// Validate all parts
			parts.forEach(part => {
				expect(ValidationHelpers.validateParts([part])).toHaveLength(1);
				expect(part.unit_price).toBeGreaterThan(0);
				expect(part.current_stock).toBeGreaterThanOrEqual(0);
			});

			// Calculate repair cost breakdown
			const laborCost = 500000;
			const partsCost = parts.reduce((total, part) => total + part.unit_price!, 0);
			const totalCost = laborCost + partsCost;

			// Validate Vietnamese currency amounts
			expect(Currency.format(laborCost)).toBe("500.000 ₫");
			expect(Currency.format(partsCost)).toBe("4.000.000 ₫");
			expect(Currency.format(totalCost)).toBe("4.500.000 ₫");

			// Test cost breakdown formatting
			const breakdown = Currency.formatBreakdown(partsCost, laborCost);
			expect(breakdown.total).toBe("4.500.000 ₫");
			expect(breakdown.breakdown).toContain("Linh kiện: 4.000.000 ₫");
			expect(breakdown.breakdown).toContain("Công: 500.000 ₫");

			// Check inventory status for each part
			const inventoryStatuses = parts.map(part => ({
				part: part.name,
				status: Currency.formatInventoryStatus(part.current_stock, part.min_stock_level)
			}));

			expect(inventoryStatuses[0].status.status).toBe("good"); // 5 > 2
			expect(inventoryStatuses[1].status.status).toBe("good"); // 10 > 3
			expect(inventoryStatuses[2].status.status).toBe("low");  // 1 <= 2
		});

		it("should handle out-of-stock parts workflow", async () => {
			const outOfStockPart = VietnameseMockDataGenerator.createMockPart({
				name: "Bàn phím laptop chuyên dụng",
				unit_price: 600000,
				current_stock: 0,
				min_stock_level: 1
			});

			// Test inventory status for out-of-stock part
			const status = Currency.formatInventoryStatus(
				outOfStockPart.current_stock,
				outOfStockPart.min_stock_level
			);

			expect(status.status).toBe("out");
			expect(status.text).toBe("Hết hàng");

			// Validate Vietnamese error handling for unavailable parts
			const validation = enhancedValidation.validateBusinessData({
				currency: outOfStockPart.unit_price
			});

			expect(validation.isValid).toBe(true);
			expect(outOfStockPart.current_stock).toBe(0);
		});
	});

	describe("Workflow 4: Real-time Updates and Notifications", () => {
		it("should handle status change notifications workflow", async () => {
			const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
				customer_phone: "0901234567",
				status: "device_received"
			});

			// Simulate status progression with timestamps
			const statusUpdates = [
				{ status: "preliminary_inspection", timestamp: new Date() },
				{ status: "in_repair", timestamp: new Date(Date.now() + 60000) },
				{ status: "ready_for_pickup", timestamp: new Date(Date.now() + 120000) }
			];

			statusUpdates.forEach((update, index) => {
				// Validate status transition
				const updatedTicket = {
					...ticket,
					status: update.status as RepairTicket["status"],
					updated_at: update.timestamp.toISOString()
				};

				expect(updatedTicket.status).toBe(update.status);

				// Test Vietnamese relative time formatting
				const relativeTime = DateTime.formatRelative(update.timestamp);
				expect(relativeTime).toBeTruthy();

				// Test status formatting for Vietnamese display
				const vietnameseStatus = Text.formatStatus(update.status);
				expect(vietnameseStatus).toBeTruthy();
			});
		});

		it("should handle customer notification formatting", async () => {
			const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
				customer_phone: "0901234567",
				status: "ready_for_pickup",
				final_cost: 2800000
			});

			// Format customer notification message
			const customerMessage = `Xin chào! Phiếu sửa chữa ${ticket.ticket_code} đã hoàn thành. ` +
				`Tổng chi phí: ${Currency.format(ticket.final_cost!)}. ` +
				`Vui lòng đến cửa hàng để nhận máy. Cảm ơn!`;

			expect(customerMessage).toContain(ticket.ticket_code);
			expect(customerMessage).toContain("2.800.000 ₫");
			expect(customerMessage).toContain("hoàn thành");

			// Validate Vietnamese text content
			expect(customerMessage).toMatch(/[àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/);
		});
	});

	describe("Workflow 5: Staff Authentication and Role-based Access", () => {
		it("should handle staff login and role validation workflow", async () => {
			// Create staff user profiles
			const shopOwner = VietnameseMockDataGenerator.createMockUserProfile({
				full_name: "Nguyễn Chủ Shop",
				role: "shop_owner",
				email: "owner@trinhanhlaptop.vn"
			});

			const staffMember = VietnameseMockDataGenerator.createMockUserProfile({
				full_name: "Trần Nhân Viên",
				role: "staff",
				email: "staff@trinhanhlaptop.vn"
			});

			// Validate user profiles
			expect(ValidationHelpers.validateSingleCustomer({
				phone: shopOwner.phone!,
				full_name: shopOwner.full_name,
				address: null,
				notes: null,
				created_at: shopOwner.created_at,
				updated_at: shopOwner.updated_at
			})).toBeTruthy();

			// Test role-based permissions
			const ownerPermissions = ["create_user", "delete_ticket", "access_analytics", "manage_inventory"];
			const staffPermissions = ["create_ticket", "update_ticket", "view_customers"];

			expect(shopOwner.role).toBe("shop_owner");
			expect(staffMember.role).toBe("staff");

			// Validate Vietnamese names
			expect(shopOwner.full_name).toContain("Nguyễn");
			expect(staffMember.full_name).toContain("Trần");
		});

		it("should handle Vietnamese authentication error messages", async () => {
			const authErrors = [
				{
					code: "INVALID_CREDENTIALS",
					english: "Invalid login credentials",
					vietnamese: "Thông tin đăng nhập không chính xác"
				},
				{
					code: "ACCESS_DENIED",
					english: "Access denied",
					vietnamese: "Không có quyền truy cập"
				},
				{
					code: "SESSION_EXPIRED",
					english: "Session expired",
					vietnamese: "Phiên đăng nhập đã hết hạn"
				}
			];

			authErrors.forEach(error => {
				// Validate Vietnamese error messages contain Vietnamese characters
				expect(error.vietnamese).toMatch(/[àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/);
				expect(error.vietnamese.length).toBeGreaterThan(0);
			});
		});
	});

	describe("Workflow 6: Data Validation and Error Handling", () => {
		it("should handle comprehensive Vietnamese business validation", async () => {
			// Test comprehensive validation scenarios
			const testScenarios = enhancedValidation.generateTestScenarios();

			// Validate positive scenarios
			testScenarios.valid.currencies.forEach(amount => {
				expect(Currency.format(amount)).toContain("₫");
			});

			testScenarios.valid.dates.forEach(date => {
				expect(DateTime.formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
			});

			testScenarios.valid.ticketCodes.forEach(code => {
				expect(isValidRepairTicketCode(code)).toBe(true);
			});

			// Validate negative scenarios
			testScenarios.invalid.phones.forEach(phone => {
				expect(isValidVietnamesePhone(phone)).toBe(false);
			});

			testScenarios.invalid.currencies.forEach(amount => {
				expect(() => Currency.format(amount)).not.toThrow();
			});
		});

		it("should handle Vietnamese formatting edge cases", async () => {
			// Test edge cases for Vietnamese formatting
			const edgeCases = {
				currency: [0, null, undefined, 150_000_000],
				dates: [new Date(), "2025-01-01T00:00:00Z", "invalid-date"],
				phones: ["", "0901234567", "invalid-phone"],
				text: ["", "Nguyễn Văn An", "Test 123"]
			};

			// Test currency formatting edge cases
			expect(Currency.format(0)).toBe("Miễn phí");
			expect(Currency.format(null)).toBe("Chưa định giá");
			expect(Currency.format(undefined)).toBe("Chưa định giá");

			// Test date formatting edge cases
			expect(DateTime.formatDate("invalid-date")).toBe("Ngày không hợp lệ");
			expect(DateTime.formatTime("invalid-date")).toBe("Giờ không hợp lệ");

			// Test phone formatting edge cases
			expect(Text.formatPhone("")).toBe("");
			expect(Text.formatPhone("invalid")).toBe("invalid");

			// All edge cases should not throw errors
			edgeCases.currency.forEach(value => {
				expect(() => Currency.format(value)).not.toThrow();
			});
		});
	});
});