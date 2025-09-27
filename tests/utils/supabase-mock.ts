/**
 * Enhanced Supabase Mock Infrastructure for Phase 3.4.2
 * Type-safe mocking utilities for Vietnamese laptop repair shop testing
 *
 * Features:
 * - Type-safe mock responses using database types
 * - Vietnamese business validation during mock operations
 * - Enhanced error simulation with Vietnamese context
 * - Comprehensive data generation utilities
 * - Integration with Phase 3.4.1 type guards
 *
 * @since Phase 3.4.2
 */

import { vi } from "vitest";
import {
	isValidVietnamesePhone,
	isValidRepairTicketCode,
	isValidVietnameseCurrency,
	ValidationHelpers,
	isCustomer,
	isRepairTicket,
	isPart,
	isUserProfile
} from "@/lib/type-guards";
import { Currency, DateTime, Text } from "@/lib/formatting";
import type {
	SupabaseResult,
	SupabaseArrayResult,
	BusinessError,
	CustomerQuery
} from "@/lib/supabase-types";
import type { Customer, RepairTicket, Part, UserProfile } from "@/lib/database-types";

/**
 * Type-safe mock data generator for Vietnamese business entities
 */
export class VietnameseMockDataGenerator {
	private static ticketCounter = 1;
	private static customerCounter = 1;
	private static partCounter = 1;

	/**
	 * Generate valid Vietnamese customer data
	 */
	static createMockCustomer(overrides: Partial<Customer> = {}): Customer {
		const baseCustomer: Customer = {
			phone: `090${this.customerCounter.toString().padStart(7, "0")}`,
			full_name: `Khách hàng ${this.customerCounter}`,
			address: `Số ${this.customerCounter}, Đường Test, Quận 1, TP.HCM`,
			notes: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...overrides
		};

		this.customerCounter++;

		// Validate generated data
		if (!isCustomer(baseCustomer)) {
			throw new Error("Generated customer data is invalid");
		}

		return baseCustomer;
	}

	/**
	 * Generate valid Vietnamese repair ticket data
	 */
	static createMockRepairTicket(overrides: Partial<RepairTicket> = {}): RepairTicket {
		const year = new Date().getFullYear();
		const ticketCode = `LRP-${year}-${this.ticketCounter.toString().padStart(6, "0")}`;

		const baseTicket: RepairTicket = {
			id: `ticket-${this.ticketCounter}`,
			ticket_code: ticketCode,
			customer_phone: `090${this.ticketCounter.toString().padStart(7, "0")}`,
			device_info: {
				brand: "ASUS",
				model: "VivoBook S15",
				type: "laptop",
				serial_number: `AS${this.ticketCounter.toString().padStart(8, "0")}`
			},
			issue_description: `Sự cố kỹ thuật ${this.ticketCounter}: Cần kiểm tra và sửa chữa`,
			customer_description: `Khách hàng báo cáo sự cố ${this.ticketCounter}`,
			status: "device_received",
			priority: "normal",
			estimated_cost: 500000,
			final_cost: null,
			estimated_completion_date: null,
			actual_completion_date: null,
			assigned_technician_id: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...overrides
		};

		this.ticketCounter++;

		// Validate generated data
		if (!isRepairTicket(baseTicket)) {
			throw new Error("Generated repair ticket data is invalid");
		}

		return baseTicket;
	}

	/**
	 * Generate valid Vietnamese part data
	 */
	static createMockPart(overrides: Partial<Part> = {}): Part {
		const basePart: Part = {
			id: `part-${this.partCounter}`,
			part_number: `PN${this.partCounter.toString().padStart(6, "0")}`,
			name: `Linh kiện ${this.partCounter}`,
			description: `Mô tả chi tiết linh kiện ${this.partCounter}`,
			category: "general",
			unit_price: 100000,
			current_stock: 10,
			min_stock_level: 2,
			location: `Kệ ${Math.ceil(this.partCounter / 10)}`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...overrides
		};

		this.partCounter++;

		// Validate generated data
		if (!isPart(basePart)) {
			throw new Error("Generated part data is invalid");
		}

		return basePart;
	}

	/**
	 * Generate valid Vietnamese user profile data
	 */
	static createMockUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
		const baseProfile: UserProfile = {
			id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			full_name: `Nhân viên Test ${Math.floor(Math.random() * 100)}`,
			role: "staff",
			phone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`,
			email: `test${Math.floor(Math.random() * 1000)}@trinhanhlaptop.vn`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...overrides
		};

		// Validate generated data
		if (!isUserProfile(baseProfile)) {
			throw new Error("Generated user profile data is invalid");
		}

		return baseProfile;
	}

	/**
	 * Reset counters for clean test isolation
	 */
	static reset(): void {
		this.ticketCounter = 1;
		this.customerCounter = 1;
		this.partCounter = 1;
	}
}

/**
 * Enhanced Supabase mock with type safety and Vietnamese business validation
 */
export class EnhancedSupabaseMock {
	private customers: Map<string, Customer> = new Map();
	private repairTickets: Map<string, RepairTicket> = new Map();
	private parts: Map<string, Part> = new Map();
	private userProfiles: Map<string, UserProfile> = new Map();

	/**
	 * Mock customer operations with Vietnamese validation
	 */
	mockCustomerOperations() {
		return {
			select: vi.fn(() => ({
				eq: vi.fn((field: string, value: string) => ({
					single: vi.fn(() => {
						if (field === "phone" && isValidVietnamesePhone(value)) {
							const customer = this.customers.get(value) ||
								VietnameseMockDataGenerator.createMockCustomer({ phone: value });
							this.customers.set(value, customer);
							return Promise.resolve({ data: customer, error: null });
						}
						return Promise.resolve({ data: null, error: { code: "PGRST116" } });
					}),
					then: vi.fn((callback) => {
						const customers = Array.from(this.customers.values());
						return Promise.resolve(callback({ data: customers, error: null }));
					})
				})),
				then: vi.fn((callback) => {
					const customers = Array.from(this.customers.values());
					return Promise.resolve(callback({ data: customers, error: null }));
				})
			})),

			insert: vi.fn((data: Partial<Customer>) => ({
				select: vi.fn(() => ({
					single: vi.fn(() => {
						try {
							// Validate Vietnamese business constraints
							if (data.phone && !isValidVietnamesePhone(data.phone)) {
								const error: VietnameseBusinessError = {
									code: "INVALID_PHONE",
									message: "Invalid Vietnamese phone format",
									vietnameseMessage: "Số điện thoại không đúng định dạng Việt Nam",
									context: "customer_management"
								};
								return Promise.resolve({ data: null, error });
							}

							const customer = VietnameseMockDataGenerator.createMockCustomer(data);
							this.customers.set(customer.phone, customer);
							return Promise.resolve({ data: customer, error: null });
						} catch (error) {
							const businessError: VietnameseBusinessError = {
								code: "VALIDATION_ERROR",
								message: "Customer validation failed",
								vietnameseMessage: "Xác thực thông tin khách hàng thất bại",
								context: "customer_management"
							};
							return Promise.resolve({ data: null, error: businessError });
						}
					})
				}))
			}))
		};
	}

	/**
	 * Mock repair ticket operations with Vietnamese workflow validation
	 */
	mockRepairTicketOperations() {
		return {
			select: vi.fn(() => ({
				eq: vi.fn((field: string, value: string) => ({
					single: vi.fn(() => {
						if (field === "id") {
							const ticket = this.repairTickets.get(value);
							return Promise.resolve({ data: ticket || null, error: null });
						}
						if (field === "ticket_code" && isValidRepairTicketCode(value)) {
							const ticket = Array.from(this.repairTickets.values())
								.find(t => t.ticket_code === value);
							return Promise.resolve({ data: ticket || null, error: null });
						}
						return Promise.resolve({ data: null, error: { code: "PGRST116" } });
					}),
					then: vi.fn((callback) => {
						const tickets = Array.from(this.repairTickets.values());
						return Promise.resolve(callback({ data: tickets, error: null }));
					})
				})),
				then: vi.fn((callback) => {
					const tickets = Array.from(this.repairTickets.values());
					return Promise.resolve(callback({ data: tickets, error: null }));
				})
			})),

			insert: vi.fn((data: Partial<RepairTicket>) => ({
				select: vi.fn(() => ({
					single: vi.fn(() => {
						try {
							// Validate Vietnamese business constraints
							if (data.customer_phone && !isValidVietnamesePhone(data.customer_phone)) {
								const error: VietnameseBusinessError = {
									code: "INVALID_CUSTOMER_PHONE",
									message: "Invalid customer phone format",
									vietnameseMessage: "Số điện thoại khách hàng không đúng định dạng",
									context: "repair_workflow"
								};
								return Promise.resolve({ data: null, error });
							}

							if (data.estimated_cost && !isValidVietnameseCurrency(data.estimated_cost)) {
								const error: VietnameseBusinessError = {
									code: "INVALID_COST",
									message: "Invalid repair cost amount",
									vietnameseMessage: "Số tiền sửa chữa không hợp lệ",
									context: "repair_workflow"
								};
								return Promise.resolve({ data: null, error });
							}

							const ticket = VietnameseMockDataGenerator.createMockRepairTicket(data);
							this.repairTickets.set(ticket.id, ticket);
							return Promise.resolve({ data: ticket, error: null });
						} catch (error) {
							const businessError: VietnameseBusinessError = {
								code: "VALIDATION_ERROR",
								message: "Repair ticket validation failed",
								vietnameseMessage: "Xác thực phiếu sửa chữa thất bại",
								context: "repair_workflow"
							};
							return Promise.resolve({ data: null, error: businessError });
						}
					})
				}))
			}))
		};
	}

	/**
	 * Create comprehensive mock Supabase client
	 */
	createMockClient() {
		return {
			from: vi.fn((tableName: string) => {
				switch (tableName) {
					case "customers":
						return this.mockCustomerOperations();
					case "repair_tickets":
						return this.mockRepairTicketOperations();
					case "parts":
						return this.mockPartsOperations();
					case "user_profiles":
						return this.mockUserProfileOperations();
					default:
						return this.createGenericMockOperations();
				}
			}),
			auth: this.mockAuthOperations(),
			channel: vi.fn(() => ({
				on: vi.fn(() => ({ subscribe: vi.fn() })),
				unsubscribe: vi.fn()
			}))
		};
	}

	/**
	 * Mock parts operations with inventory validation
	 */
	private mockPartsOperations() {
		return {
			select: vi.fn(() => ({
				then: vi.fn((callback) => {
					const parts = Array.from(this.parts.values());
					return Promise.resolve(callback({ data: parts, error: null }));
				})
			})),
			insert: vi.fn((data: Partial<Part>) => ({
				select: vi.fn(() => ({
					single: vi.fn(() => {
						const part = VietnameseMockDataGenerator.createMockPart(data);
						this.parts.set(part.id, part);
						return Promise.resolve({ data: part, error: null });
					})
				}))
			}))
		};
	}

	/**
	 * Mock user profile operations
	 */
	private mockUserProfileOperations() {
		return {
			select: vi.fn(() => ({
				eq: vi.fn((field: string, value: string) => ({
					single: vi.fn(() => {
						const profile = this.userProfiles.get(value);
						return Promise.resolve({ data: profile || null, error: null });
					})
				})),
				then: vi.fn((callback) => {
					const profiles = Array.from(this.userProfiles.values());
					return Promise.resolve(callback({ data: profiles, error: null }));
				})
			}))
		};
	}

	/**
	 * Mock auth operations
	 */
	private mockAuthOperations() {
		return {
			getUser: vi.fn(() => Promise.resolve({
				data: { user: null },
				error: null
			})),
			signInWithPassword: vi.fn(() => Promise.resolve({
				data: { user: VietnameseMockDataGenerator.createMockUserProfile() },
				error: null
			})),
			signOut: vi.fn(() => Promise.resolve({ error: null })),
			onAuthStateChange: vi.fn()
		};
	}

	/**
	 * Generic mock operations for other tables
	 */
	private createGenericMockOperations() {
		return {
			select: vi.fn(() => ({ then: vi.fn((callback) => callback({ data: [], error: null })) })),
			insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: null, error: null })) })) })),
			update: vi.fn(() => ({ eq: vi.fn(() => ({ then: vi.fn((callback) => callback({ data: null, error: null })) })) })),
			delete: vi.fn(() => ({ eq: vi.fn(() => ({ then: vi.fn((callback) => callback({ data: null, error: null })) })) }))
		};
	}

	/**
	 * Reset all mock data
	 */
	reset(): void {
		this.customers.clear();
		this.repairTickets.clear();
		this.parts.clear();
		this.userProfiles.clear();
		VietnameseMockDataGenerator.reset();
	}

	/**
	 * Seed mock data for testing
	 */
	seedTestData(): void {
		// Create sample customers
		const customer1 = VietnameseMockDataGenerator.createMockCustomer({
			phone: "0901234567",
			full_name: "Nguyễn Văn An"
		});
		this.customers.set(customer1.phone, customer1);

		// Create sample repair tickets
		const ticket1 = VietnameseMockDataGenerator.createMockRepairTicket({
			customer_phone: "0901234567",
			ticket_code: "LRP-2025-000001"
		});
		this.repairTickets.set(ticket1.id, ticket1);

		// Create sample parts
		const part1 = VietnameseMockDataGenerator.createMockPart({
			name: "RAM DDR4 8GB",
			category: "memory"
		});
		this.parts.set(part1.id, part1);
	}
}

/**
 * Global mock instance for tests
 */
export const globalSupabaseMock = new EnhancedSupabaseMock();