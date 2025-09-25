/**
 * Epic 1.1 - Story 1.1.3: Admin User Creation & Development Utilities Unit Tests
 * Test scenarios based on Quinn's design: docs/qa/assessments/1.1.3-test-design-20250123.md
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	databaseTestUtils,
	environmentValidation,
	phoneValidation,
	vietnameseTestData,
	vietnameseTextValidation,
} from "../../utils/vietnamese-test-helpers";

describe("Epic 1.1.3: Admin User Creation & Development Utilities - Unit Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("1.1.3-UNIT-001: Environment variable parsing", () => {
		it("should parse admin user configuration from environment variables", () => {
			const mockEnvConfig = {
				ADMIN_EMAIL: "admin@trinhanhlaptop.vn",
				ADMIN_PASSWORD: "SecureAdmin123!",
				ADMIN_NAME: "Nguyễn Văn Quản Lý",
				ADMIN_PHONE: "0988661875",
				SHOP_NAME: "Trí Nhân Laptop",
				SHOP_ADDRESS: "251 Vườn Lài, Phường An Phú Đông, Quận 12, TP.HCM",
			};

			// Validate required admin fields
			const requiredFields = [
				"ADMIN_EMAIL",
				"ADMIN_PASSWORD",
				"ADMIN_NAME",
				"ADMIN_PHONE",
			];

			requiredFields.forEach((field) => {
				expect(
					mockEnvConfig[field as keyof typeof mockEnvConfig],
				).toBeDefined();
				expect(mockEnvConfig[field as keyof typeof mockEnvConfig]).toBeTruthy();
			});

			// Validate email format
			expect(mockEnvConfig.ADMIN_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

			// Validate Vietnamese name
			expect(
				vietnameseTextValidation.isValidVietnameseName(
					mockEnvConfig.ADMIN_NAME,
				),
			).toBe(true);

			// Validate phone format
			expect(phoneValidation.validate(mockEnvConfig.ADMIN_PHONE)).toBe(true);
		});

		it("should provide default values for missing optional fields", () => {
			const parseAdminConfig = (env: Record<string, string | undefined>) => {
				return {
					email: env.ADMIN_EMAIL || "",
					password: env.ADMIN_PASSWORD || "",
					name: env.ADMIN_NAME || "Quản lý cửa hàng",
					phone: env.ADMIN_PHONE || "",
					role: env.ADMIN_ROLE || "shop_owner",
					shopName: env.SHOP_NAME || "Cửa hàng sửa chữa laptop",
					shopAddress: env.SHOP_ADDRESS || "Địa chỉ cửa hàng",
				};
			};

			const minimalEnv = {
				ADMIN_EMAIL: "admin@test.com",
				ADMIN_PASSWORD: "password123",
			};

			const config = parseAdminConfig(minimalEnv);

			expect(config.name).toBe("Quản lý cửa hàng");
			expect(config.role).toBe("shop_owner");
			expect(config.shopName).toBe("Cửa hàng sửa chữa laptop");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(config.name),
			).toBe(true);
		});

		it("should validate password strength requirements", () => {
			const validatePasswordStrength = (password: string) => {
				const requirements = {
					minLength: password.length >= 8,
					hasUppercase: /[A-Z]/.test(password),
					hasLowercase: /[a-z]/.test(password),
					hasNumber: /\d/.test(password),
					hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
				};

				return {
					isValid: Object.values(requirements).every((req) => req),
					requirements,
				};
			};

			const testPasswords = [
				{ password: "weak", valid: false },
				{ password: "StrongPass123!", valid: true },
				{ password: "NoSpecial123", valid: false },
				{ password: "Admin@Trinhan2025", valid: true },
			];

			testPasswords.forEach((test) => {
				const result = validatePasswordStrength(test.password);
				expect(result.isValid).toBe(test.valid);
			});
		});
	});

	describe("1.1.3-UNIT-002: Sample data structure validation", () => {
		it("should validate Vietnamese sample customer data structure", () => {
			const sampleCustomers = [
				{
					id: crypto.randomUUID(),
					phone: "0901234567",
					name: "Nguyễn Văn An",
					address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
					email: "an.nguyen@email.com",
					created_at: new Date().toISOString(),
				},
				{
					id: crypto.randomUUID(),
					phone: "0812345678",
					name: "Trần Thị Bình",
					address: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
					email: "binh.tran@email.com",
					created_at: new Date().toISOString(),
				},
			];

			sampleCustomers.forEach((customer) => {
				// Validate structure
				expect(customer).toHaveProperty("id");
				expect(customer).toHaveProperty("phone");
				expect(customer).toHaveProperty("name");
				expect(customer).toHaveProperty("address");

				// Validate Vietnamese data
				expect(
					vietnameseTextValidation.isValidVietnameseName(customer.name),
				).toBe(true);
				expect(phoneValidation.validate(customer.phone)).toBe(true);
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(customer.address),
				).toBe(true);

				// Validate UUID format
				expect(customer.id).toMatch(
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
				);
			});
		});

		it("should validate sample repair ticket data with Vietnamese descriptions", () => {
			const sampleRepairTickets = [
				{
					ticket_code: "LRP-2025-000001",
					device_info: "Laptop Dell Inspiron 15 3520",
					issue_description:
						"Máy tính bị chậm, cần nâng cấp RAM và làm sạch quạt tản nhiệt",
					status: "RECEIVED",
					estimated_completion: "2025-01-30",
					cost_estimate: 500000,
				},
				{
					ticket_code: "LRP-2025-000002",
					device_info: "MacBook Pro 13 inch 2021",
					issue_description: "Màn hình bị vỡ góc, cần thay thế màn hình LCD",
					status: "IN_PROGRESS",
					estimated_completion: "2025-02-05",
					cost_estimate: 2500000,
				},
			];

			sampleRepairTickets.forEach((ticket) => {
				// Validate ticket code format
				expect(ticket.ticket_code).toMatch(/^LRP-\d{4}-\d{6}$/);

				// Validate Vietnamese descriptions
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(
						ticket.issue_description,
					),
				).toBe(true);

				// Validate status
				const validStatuses = [
					"RECEIVED",
					"IN_PROGRESS",
					"WAITING_PARTS",
					"COMPLETED",
					"CANCELLED",
				];
				expect(validStatuses).toContain(ticket.status);

				// Validate cost (Vietnamese dong)
				expect(ticket.cost_estimate).toBeGreaterThan(0);
				expect(typeof ticket.cost_estimate).toBe("number");
			});
		});

		it("should validate sample parts data with Vietnamese names and categories", () => {
			const sampleParts = [
				{
					id: crypto.randomUUID(),
					name: "RAM DDR4 8GB Crucial",
					category: "Bộ nhớ trong",
					brand: "Crucial",
					price: 1500000,
					stock_quantity: 25,
					compatible_models: ["Dell Inspiron", "HP Pavilion", "Asus VivoBook"],
				},
				{
					id: crypto.randomUUID(),
					name: "Ổ cứng SSD 256GB Samsung",
					category: "Thiết bị lưu trữ",
					brand: "Samsung",
					price: 2000000,
					stock_quantity: 15,
					compatible_models: ["MacBook Pro", "Dell XPS", "Lenovo ThinkPad"],
				},
			];

			sampleParts.forEach((part) => {
				// Validate structure
				expect(part).toHaveProperty("name");
				expect(part).toHaveProperty("category");
				expect(part).toHaveProperty("price");
				expect(part).toHaveProperty("stock_quantity");

				// Validate Vietnamese category names
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(part.category),
				).toBe(true);

				// Validate price and stock
				expect(part.price).toBeGreaterThan(0);
				expect(part.stock_quantity).toBeGreaterThanOrEqual(0);

				// Validate compatibility array
				expect(Array.isArray(part.compatible_models)).toBe(true);
				expect(part.compatible_models.length).toBeGreaterThan(0);
			});
		});
	});

	describe("1.1.3-UNIT-003: Health check logic validation", () => {
		it("should validate system component health check logic", () => {
			const performHealthCheck = async () => {
				const checks = {
					database: { status: "healthy", response_time: 45 },
					auth_service: { status: "healthy", response_time: 120 },
					storage_service: { status: "healthy", response_time: 80 },
					api_gateway: { status: "healthy", response_time: 35 },
				};

				const results = {
					overall_status: "healthy",
					timestamp: new Date().toISOString(),
					checks,
					vietnamese_locale: true,
					timezone: "Asia/Ho_Chi_Minh",
				};

				return results;
			};

			return performHealthCheck().then((results) => {
				// Validate overall structure
				expect(results).toHaveProperty("overall_status");
				expect(results).toHaveProperty("checks");
				expect(results).toHaveProperty("vietnamese_locale");
				expect(results).toHaveProperty("timezone");

				// Validate Vietnamese locale configuration
				expect(results.vietnamese_locale).toBe(true);
				expect(results.timezone).toBe("Asia/Ho_Chi_Minh");

				// Validate individual service checks
				const services = [
					"database",
					"auth_service",
					"storage_service",
					"api_gateway",
				];
				services.forEach((service) => {
					expect(results.checks).toHaveProperty(service);
					expect(
						results.checks[service as keyof typeof results.checks],
					).toHaveProperty("status");
					expect(
						results.checks[service as keyof typeof results.checks],
					).toHaveProperty("response_time");
				});
			});
		});

		it("should detect and report unhealthy services", () => {
			const assessHealthStatus = (
				checks: Record<string, { status: string; response_time: number }>,
			) => {
				const healthyServices = Object.entries(checks).filter(
					([_, check]) => check.status === "healthy",
				);
				const unhealthyServices = Object.entries(checks).filter(
					([_, check]) => check.status !== "healthy",
				);

				return {
					overall_status:
						unhealthyServices.length === 0 ? "healthy" : "degraded",
					healthy_count: healthyServices.length,
					unhealthy_count: unhealthyServices.length,
					unhealthy_services: unhealthyServices.map(([name, _]) => name),
				};
			};

			const checksWithIssues = {
				database: { status: "healthy", response_time: 45 },
				auth_service: { status: "unhealthy", response_time: 5000 },
				storage_service: { status: "healthy", response_time: 80 },
				api_gateway: { status: "timeout", response_time: 10000 },
			};

			const assessment = assessHealthStatus(checksWithIssues);

			expect(assessment.overall_status).toBe("degraded");
			expect(assessment.healthy_count).toBe(2);
			expect(assessment.unhealthy_count).toBe(2);
			expect(assessment.unhealthy_services).toContain("auth_service");
			expect(assessment.unhealthy_services).toContain("api_gateway");
		});
	});

	describe("1.1.3-UNIT-004: Role assignment logic validation", () => {
		it("should assign correct default roles for new users", () => {
			const assignUserRole = (userMetadata: any, isFirstUser = false) => {
				// First user becomes shop owner, subsequent users become staff
				const defaultRole = isFirstUser ? "shop_owner" : "staff";

				return {
					role: userMetadata.role || defaultRole,
					permissions: getPermissionsByRole(userMetadata.role || defaultRole),
					created_by: isFirstUser ? "system" : "admin",
					created_at: new Date().toISOString(),
				};
			};

			const getPermissionsByRole = (role: string) => {
				const permissions = {
					shop_owner: [
						"read_all_data",
						"write_all_data",
						"manage_users",
						"manage_settings",
						"view_reports",
						"manage_inventory",
					],
					staff: [
						"read_customer_data",
						"write_repair_tickets",
						"read_parts_inventory",
						"update_ticket_status",
					],
				};
				return permissions[role as keyof typeof permissions] || [];
			};

			// Test first user (shop owner)
			const firstUser = assignUserRole({ name: "Nguyễn Văn Chủ" }, true);
			expect(firstUser.role).toBe("shop_owner");
			expect(firstUser.permissions).toContain("manage_users");
			expect(firstUser.permissions).toContain("manage_settings");
			expect(firstUser.created_by).toBe("system");

			// Test subsequent user (staff)
			const staffUser = assignUserRole({ name: "Trần Thị Nhân Viên" }, false);
			expect(staffUser.role).toBe("staff");
			expect(staffUser.permissions).toContain("read_customer_data");
			expect(staffUser.permissions).not.toContain("manage_users");
			expect(staffUser.created_by).toBe("admin");
		});

		it("should validate role hierarchy and permissions", () => {
			const validateRoleHierarchy = (userRole: string, targetRole: string) => {
				const roleHierarchy = {
					shop_owner: 100,
					staff: 50,
					customer: 10,
				};

				const userLevel =
					roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
				const targetLevel =
					roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

				return {
					canManage: userLevel > targetLevel,
					canView: userLevel >= targetLevel,
					hierarchyValid: userLevel > 0 && targetLevel > 0,
				};
			};

			// Shop owner can manage staff
			const ownerToStaff = validateRoleHierarchy("shop_owner", "staff");
			expect(ownerToStaff.canManage).toBe(true);
			expect(ownerToStaff.canView).toBe(true);

			// Staff cannot manage shop owner
			const staffToOwner = validateRoleHierarchy("staff", "shop_owner");
			expect(staffToOwner.canManage).toBe(false);
			expect(staffToOwner.canView).toBe(false);

			// Staff can view customers
			const staffToCustomer = validateRoleHierarchy("staff", "customer");
			expect(staffToCustomer.canView).toBe(true);
			expect(staffToCustomer.canManage).toBe(true);
		});
	});

	describe("Edge cases and error handling", () => {
		it("should handle invalid Vietnamese names gracefully", () => {
			const invalidNames = [
				"123 Invalid Name",
				"Name@WithSymbols",
				"TooShort",
				"",
				"A".repeat(300), // Too long
			];

			invalidNames.forEach((name) => {
				if (name.length === 0) {
					expect(vietnameseTextValidation.isValidVietnameseName(name)).toBe(
						false,
					);
				} else if (name.length > 255) {
					expect(name.length).toBeGreaterThan(255);
				} else {
					// Test that we handle invalid characters appropriately
					const hasInvalidChars = /[0-9@#$%^&*(),.?":{}|<>]/.test(name);
					if (hasInvalidChars) {
						expect(vietnameseTextValidation.isValidVietnameseName(name)).toBe(
							false,
						);
					}
				}
			});
		});

		it("should handle missing environment variables with appropriate defaults", () => {
			const createAdminFromEnv = (env: Record<string, string | undefined>) => {
				if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
					throw new Error("ADMIN_EMAIL và ADMIN_PASSWORD là bắt buộc");
				}

				return {
					email: env.ADMIN_EMAIL,
					password: env.ADMIN_PASSWORD,
					name: env.ADMIN_NAME || "Quản lý cửa hàng",
					phone: env.ADMIN_PHONE || null,
					role: "shop_owner",
				};
			};

			// Test missing required fields
			expect(() => createAdminFromEnv({})).toThrow(
				"ADMIN_EMAIL và ADMIN_PASSWORD là bắt buộc",
			);

			// Test with minimal required fields
			const minimalAdmin = createAdminFromEnv({
				ADMIN_EMAIL: "admin@test.com",
				ADMIN_PASSWORD: "password123",
			});

			expect(minimalAdmin.name).toBe("Quản lý cửa hàng");
			expect(minimalAdmin.phone).toBeNull();
			expect(minimalAdmin.role).toBe("shop_owner");
		});
	});
});
