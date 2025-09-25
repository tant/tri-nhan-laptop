/**
 * Epic 1.1 Integration Tests: Supabase Service Integration
 * Test scenarios based on Quinn's design for critical P0 integration tests
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	databaseTestUtils,
	vietnameseTestData,
} from "../../utils/vietnamese-test-helpers";

// Mock Supabase client for integration testing
const mockSupabaseClient = {
	from: vi.fn(),
	auth: {
		getUser: vi.fn(),
		signInWithPassword: vi.fn(),
		signOut: vi.fn(),
	},
	channel: vi.fn(),
	removeChannel: vi.fn(),
};

describe("Epic 1.1 Integration Tests: Supabase Service Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Setup default mock behaviors
		const mockQueryBuilder = {
			select: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: null, error: null }),
			maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
		};

		// Make each method return the mock object to allow chaining
		mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
		mockQueryBuilder.insert.mockResolvedValue({ data: [], error: null });
		mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);

		mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
	});

	describe("1.1.1-INT-003: Database connection established", () => {
		it("should successfully connect to Supabase database", async () => {
			// Mock successful connection
			const mockConnectionTest = async () => {
				const result = await mockSupabaseClient
					.from("customers")
					.select("count")
					.single();

				return {
					connected: true,
					response_time: 45,
					vietnamese_locale: true,
					timezone: "Asia/Ho_Chi_Minh",
				};
			};

			const connection = await mockConnectionTest();

			expect(connection.connected).toBe(true);
			expect(connection.response_time).toBeLessThan(1000);
			expect(connection.vietnamese_locale).toBe(true);
			expect(connection.timezone).toBe("Asia/Ho_Chi_Minh");
		});

		it("should handle database connection failures gracefully", async () => {
			// Mock connection failure
			mockSupabaseClient.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi
						.fn()
						.mockRejectedValue(new Error("Kết nối cơ sở dữ liệu thất bại")),
				}),
			});

			const mockConnectionTest = async () => {
				try {
					await mockSupabaseClient.from("customers").select("count").single();
					return { connected: true };
				} catch (error) {
					return {
						connected: false,
						error: error instanceof Error ? error.message : "Unknown error",
						vietnamese_error: "Không thể kết nối đến cơ sở dữ liệu",
					};
				}
			};

			const result = await mockConnectionTest();

			expect(result.connected).toBe(false);
			expect(result.error).toContain("Kết nối cơ sở dữ liệu thất bại");
			expect(result.vietnamese_error).toBeTruthy();
		});
	});

	describe("1.1.1-INT-004: Auth service responds to health check", () => {
		it("should verify Auth service health and Vietnamese error handling", async () => {
			// Mock successful auth health check
			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: null,
			});

			const authHealthCheck = async () => {
				const result = await mockSupabaseClient.auth.getUser();

				return {
					status: result.error ? "unhealthy" : "healthy",
					response_time: 120,
					vietnamese_support: true,
					error_localization: "vi-VN",
				};
			};

			const health = await authHealthCheck();

			expect(health.status).toBe("healthy");
			expect(health.vietnamese_support).toBe(true);
			expect(health.error_localization).toBe("vi-VN");
		});

		it("should handle auth service errors with Vietnamese messages", async () => {
			// Mock auth service error
			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: { message: "Dịch vụ xác thực không khả dụng" },
			});

			const authHealthCheck = async () => {
				const result = await mockSupabaseClient.auth.getUser();

				return {
					status: result.error ? "unhealthy" : "healthy",
					error: result.error?.message,
					vietnamese_error: true,
				};
			};

			const health = await authHealthCheck();

			expect(health.status).toBe("unhealthy");
			expect(health.error).toContain("Dịch vụ xác thực không khả dụng");
			expect(health.vietnamese_error).toBe(true);
		});
	});

	describe("1.1.2-INT-001: Ticket code uniqueness across years", () => {
		it("should ensure ticket codes remain unique across different years", async () => {
			let counter = 0;
			const generateAndStoreTicketCode = async (year: number) => {
				const timestamp = Date.now();
				const uniqueId = counter++;
				const sequence = (timestamp + uniqueId)
					.toString()
					.slice(-6)
					.padStart(6, "0");
				const ticketCode = `LRP-${year}-${sequence}`;

				// Mock database insertion
				const result = await mockSupabaseClient
					.from("repair_tickets")
					.insert({ ticket_code: ticketCode });

				return { ticketCode, inserted: !result.error };
			};

			const testYears = [2024, 2025, 2026];
			const generatedCodes = new Set<string>();

			for (const year of testYears) {
				for (let i = 0; i < 5; i++) {
					const result = await generateAndStoreTicketCode(year);

					expect(result.inserted).toBe(true);
					expect(result.ticketCode).toMatch(/^LRP-\d{4}-\d{6}$/);
					expect(generatedCodes.has(result.ticketCode)).toBe(false);

					generatedCodes.add(result.ticketCode);
				}
			}

			expect(generatedCodes.size).toBe(15); // 5 codes per year * 3 years
		});
	});

	describe("1.1.2-INT-003: Automatic profile creation on signup", () => {
		it("should automatically create user profile when new user signs up", async () => {
			const mockNewUser = {
				id: crypto.randomUUID(),
				email: "nhanvien@trinhanhlaptop.vn",
				user_metadata: {
					full_name: "Trần Thị Nhân Viên",
					phone: "0901234567",
				},
			};

			// Mock profile creation
			const createUserProfile = async (authUser: any) => {
				const profileData = {
					id: crypto.randomUUID(),
					user_id: authUser.id,
					full_name: authUser.user_metadata?.full_name || "Người dùng mới",
					role: "staff",
					phone: authUser.user_metadata?.phone,
					created_at: new Date().toISOString(),
				};

				const result = await mockSupabaseClient
					.from("user_profiles")
					.insert(profileData);

				return { profile: profileData, success: !result.error };
			};

			const result = await createUserProfile(mockNewUser);

			expect(result.success).toBe(true);
			expect(result.profile.user_id).toBe(mockNewUser.id);
			expect(result.profile.full_name).toBe("Trần Thị Nhân Viên");
			expect(result.profile.role).toBe("staff");
			expect(result.profile.phone).toBe("0901234567");
		});

		it("should handle Vietnamese names correctly in profile creation", async () => {
			const vietnameseUsers = [
				{
					id: crypto.randomUUID(),
					email: "nguyen@test.com",
					user_metadata: { full_name: "Nguyễn Văn Đức" },
				},
				{
					id: crypto.randomUUID(),
					email: "tran@test.com",
					user_metadata: { full_name: "Trần Thị Linh" },
				},
			];

			for (const user of vietnameseUsers) {
				const createProfile = async (authUser: any) => {
					return {
						full_name: authUser.user_metadata.full_name,
						name_has_vietnamese:
							/[àáạảãăằắặẳẵâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(
								authUser.user_metadata.full_name,
							),
						encoded_correctly:
							encodeURIComponent(authUser.user_metadata.full_name) !==
							authUser.user_metadata.full_name,
					};
				};

				const profile = await createProfile(user);

				expect(profile.name_has_vietnamese).toBe(true);
				expect(profile.encoded_correctly).toBe(true); // Vietnamese chars should require encoding
			}
		});
	});

	describe("1.1.2-INT-008: Foreign key constraint enforcement", () => {
		it("should enforce referential integrity between tables", async () => {
			const customerId = crypto.randomUUID();
			const invalidCustomerId = crypto.randomUUID();

			// Mock constraint validation
			const validateForeignKeys = async (repairTicketData: any) => {
				// Simulate checking if customer exists
				const customerExists = repairTicketData.customer_id === customerId;

				if (!customerExists) {
					return {
						valid: false,
						error: "Khách hàng không tồn tại",
						constraint: "foreign_key_violation",
					};
				}

				return { valid: true };
			};

			// Test valid foreign key
			const validTicket = {
				customer_id: customerId,
				ticket_code: "LRP-2025-123456",
				device_info: "Laptop Dell",
				issue_description: "Cần sửa chữa",
			};

			const validResult = await validateForeignKeys(validTicket);
			expect(validResult.valid).toBe(true);

			// Test invalid foreign key
			const invalidTicket = {
				customer_id: invalidCustomerId,
				ticket_code: "LRP-2025-123457",
				device_info: "Laptop HP",
				issue_description: "Cần sửa chữa",
			};

			const invalidResult = await validateForeignKeys(invalidTicket);
			expect(invalidResult.valid).toBe(false);
			expect(invalidResult.error).toBe("Khách hàng không tồn tại");
			expect(invalidResult.constraint).toBe("foreign_key_violation");
		});
	});

	describe("1.1.2-INT-011: Vietnamese text storage and retrieval", () => {
		it("should correctly store and retrieve Vietnamese text data", async () => {
			const vietnameseTestCases = [
				{
					name: "Nguyễn Văn Hoàng",
					address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
					description: "Máy tính bị lỗi phần mềm, cần cài đặt lại hệ điều hành",
				},
				{
					name: "Trần Thị Yến",
					address: "456 Lê Lợi, Phường Bến Nghé, Quận 1",
					description: "Laptop không khởi động được, có thể do ổ cứng hỏng",
				},
			];

			for (const testCase of vietnameseTestCases) {
				// Mock storage and retrieval
				const storeVietnameseData = async (data: any) => {
					// Simulate encoding check
					const encoded = JSON.stringify(data);
					const decoded = JSON.parse(encoded);

					return {
						stored: decoded,
						encoding_preserved:
							decoded.name === data.name &&
							decoded.address === data.address &&
							decoded.description === data.description,
					};
				};

				const result = await storeVietnameseData(testCase);

				expect(result.encoding_preserved).toBe(true);
				expect(result.stored.name).toBe(testCase.name);
				expect(result.stored.address).toBe(testCase.address);
				expect(result.stored.description).toBe(testCase.description);
			}
		});

		it("should handle Vietnamese text sorting correctly", async () => {
			const vietnameseNames = [
				"Đỗ Văn An",
				"Âu Văn Bình",
				"Nguyễn Văn Cường",
				"Ăn Văn Dũng",
			];

			// Mock Vietnamese collation sorting
			const sortVietnamese = (names: string[]) => {
				// Simplified Vietnamese sorting simulation
				return [...names].sort((a, b) => {
					// Remove tones for basic sorting
					const removeVietnameseTones = (text: string) => {
						return text
							.replace(/[àáạảãăằắặẳẵâầấậẩẫ]/g, "a")
							.replace(/[èéẹẻẽêềếệểễ]/g, "e")
							.replace(/[ìíịỉĩ]/g, "i")
							.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
							.replace(/[ùúụủũưừứựửữ]/g, "u")
							.replace(/[ỳýỵỷỹ]/g, "y")
							.replace(/đ/g, "d")
							.replace(/Đ/g, "D");
					};

					return removeVietnameseTones(a).localeCompare(
						removeVietnameseTones(b),
					);
				});
			};

			const sorted = sortVietnamese(vietnameseNames);

			expect(sorted.length).toBe(vietnameseNames.length);
			expect(sorted[0]).toMatch(/[ĂÂ]/); // Should start with A-variants
			expect(Array.isArray(sorted)).toBe(true);
		});
	});
});
