import { cleanup } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";

// Import our new type guards for testing
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
import type {
	SupabaseResult,
	SupabaseArrayResult,
	VietnameseBusinessError
} from "@/lib/supabase-types";
import type { Customer, RepairTicket, Part, UserProfile } from "@/lib/database-types";

// Import enhanced mocking infrastructure
import { globalSupabaseMock, VietnameseMockDataGenerator } from "./utils/supabase-mock";

// Import Vietnamese locale testing utilities
import { VietnameseTestSetup } from "./utils/vietnamese-locale-testing";

// Mock environment variables with enhanced type-safe tracking
vi.mock("@/lib/supabase", () => {
	// Legacy mock state for backward compatibility
	const mockStateHistory: any[] = [];
	const mockTickets: Record<string, any> = {};
	let ticketCodeCounter = 1;

	const mockChainBuilder = (tableName?: string) => {
		const chain: any = {
			select: vi.fn((columns?: string, options?: any) => {
				// Handle count queries for ticket code generation
				if (tableName === "repair_tickets" && options?.count === "exact") {
					chain._isCountQuery = true;
					chain._countValue = ticketCodeCounter - 1; // Return current count
				}
				return chain;
			}),
			eq: vi.fn((field: string, value: string) => {
				// Handle state history queries
				if (tableName === "repair_state_changes" && field === "ticket_id") {
					const historyForTicket = mockStateHistory.filter(
						(h) => h.ticket_id === value,
					);
					chain._mockData = historyForTicket;
				}
				// Handle ticket queries
				if (tableName === "repair_tickets" && field === "id") {
					const ticket = mockTickets[value];
					chain._mockData = ticket || null;
				}
				return chain;
			}),
			or: vi.fn(() => chain),
			ilike: vi.fn(() => chain),
			limit: vi.fn(() => chain),
			order: vi.fn((column: string, options?: { ascending?: boolean }) => {
				// Store ordering information for later use
				chain._orderBy = column;
				chain._orderAscending = options?.ascending !== false; // default to ascending if not specified
				return chain;
			}),
			gte: vi.fn(() => chain),
			lte: vi.fn(() => chain),
			lt: vi.fn(() => chain),
			gt: vi.fn(() => chain),
			insert: vi.fn((data) => {
				// Handle state change tracking
				if (tableName === "repair_state_changes") {
					const stateChange = {
						id: `state-change-${Date.now()}-${Math.random()}`,
						ticket_id: data.ticket_id,
						from_state: data.from_state,
						to_state: data.to_state,
						changed_by: data.changed_by,
						changed_at: data.changed_at,
						reason: data.reason,
						notes: data.notes,
						customer_notified: false, // Customer notifications deferred
						validation_result: data.validation_result,
					};
					mockStateHistory.push(stateChange);
					console.log(
						`Mock: Added state change ${stateChange.from_state} -> ${stateChange.to_state} for ticket ${data.ticket_id}`,
					);

					const insertChain = {
						select: vi.fn(() => insertChain),
						single: vi.fn(() =>
							Promise.resolve({ data: stateChange, error: null }),
						),
						then: vi.fn((callback) =>
							Promise.resolve(callback({ data: stateChange, error: null })),
						),
					};
					return insertChain;
				}

				// Handle ticket creation with unique codes - ensure uniqueness across calls
				const ticketCode =
					data?.ticket_code ||
					`LRP-2025-${String(ticketCodeCounter++).padStart(6, "0")}`;

				const insertChain = {
					select: vi.fn(() => insertChain),
					single: vi.fn(() =>
						Promise.resolve({
							data: {
								id: data?.id || "mock-ticket-id",
								phone: data?.phone || "0901234567",
								full_name:
									data?.full_name ||
									data?.fullName ||
									data?.customerName ||
									"Test Customer",
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
								address: data?.address || null,
								notes: data?.notes || null,
								email: data?.email || null,
								ticket_code: ticketCode,
								device_id: data?.device_id || "mock-device-id",
								issue_description: data?.issue_description || null,
								customer_description: data?.customer_description || null,
								status: data?.status || "device_received",
								priority: data?.priority || "normal",
								current_state: data?.current_state || "device_received",
								assignedTechnician:
									data?.assignedTechnician || data?.assigned_technician || null,
							},
							error: null,
						}),
					),
				};
				return insertChain;
			}),
			update: vi.fn((data) => {
				// Handle ticket state updates
				if (tableName === "repair_tickets") {
					const updateChain = {
						eq: vi.fn((field: string, value: string) => {
							if (field === "id") {
								// Create ticket if it doesn't exist (for tests)
								if (!mockTickets[value]) {
									mockTickets[value] = {
										id: value,
										current_state: "device_received",
										metadata: {},
										created_at: new Date().toISOString(),
									};
								}
								// Update the ticket
								mockTickets[value] = { ...mockTickets[value], ...data };
								console.log(
									`Mock: Updated ticket ${value} with state ${data.current_state}`,
								);
							}
							return {
								then: vi.fn((callback) =>
									Promise.resolve(callback({ data: null, error: null })),
								),
							};
						}),
					};
					return updateChain;
				}
				return chain;
			}),
			delete: vi.fn(() => chain),
			single: vi.fn(() => {
				// Return mock data if available, otherwise default behavior
				if (chain._mockData !== undefined) {
					return Promise.resolve({ data: chain._mockData, error: null });
				}

				// Handle ticket queries when no specific mock data is set
				if (tableName === "repair_tickets") {
					// For ticket queries, we might need to return a default ticket
					const defaultTicket = {
						id: "test-ticket-1",
						current_state: "device_received",
						metadata: {},
						created_at: new Date().toISOString(),
					};
					return Promise.resolve({ data: defaultTicket, error: null });
				}

				return Promise.resolve({ data: null, error: { code: "PGRST116" } });
			}),
			maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
			then: vi.fn((callback) => {
				// Handle count queries - return { count: number } instead of { data: array }
				if (chain._isCountQuery) {
					return Promise.resolve(
						callback({ count: chain._countValue || 0, error: null }),
					);
				}
				// Return stored data or empty array
				let data = chain._mockData !== undefined ? chain._mockData : [];

				// Apply ordering if specified
				if (chain._orderBy && Array.isArray(data)) {
					data = [...data].sort((a, b) => {
						const aValue = a[chain._orderBy];
						const bValue = b[chain._orderBy];

						// Handle timestamp sorting
						if (chain._orderBy === "changed_at") {
							const aTime = new Date(aValue).getTime();
							const bTime = new Date(bValue).getTime();
							const result = aTime - bTime;
							return chain._orderAscending ? result : -result;
						}

						// Default string/number sorting
						if (aValue < bValue) return chain._orderAscending ? -1 : 1;
						if (aValue > bValue) return chain._orderAscending ? 1 : -1;
						return 0;
					});
				}

				return Promise.resolve(callback({ data, error: null }));
			}),
		};

		// Store reference to table name
		chain._tableName = tableName;
		return chain;
	};

	return {
		// Enhanced Supabase client with type safety
		supabase: globalSupabaseMock.createMockClient(),
		createClient: vi.fn(() => globalSupabaseMock.createMockClient()),

		// Legacy mock state for backward compatibility
		_mockState: {
			history: mockStateHistory,
			tickets: mockTickets,
			resetCounter: () => {
				ticketCodeCounter = 1;
			},
			reset: () => {
				mockStateHistory.length = 0;
				Object.keys(mockTickets).forEach((key) => delete mockTickets[key]);
				ticketCodeCounter = 1;
				// Also reset enhanced mock
				globalSupabaseMock.reset();
			},
		},

		// Enhanced mock utilities
		_enhancedMock: {
			supabase: globalSupabaseMock,
			dataGenerator: VietnameseMockDataGenerator,
			seedTestData: () => globalSupabaseMock.seedTestData(),
			reset: () => globalSupabaseMock.reset(),
		},
	};
});

// Mock Next themes
vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
	}),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	useRouter: () => ({
		navigate: vi.fn(),
	}),
	Link: ({ children, ...props }: any) => {
		return { type: "a", props: { ...props, children } };
	},
	createFileRoute: () => ({
		component: () => null,
	}),
}));

// Enhanced Vietnamese locale setup for tests
VietnameseTestSetup.createVietnameseTestEnvironment();

// Cleanup after each test with enhanced mock reset
beforeEach(() => {
	cleanup();
	vi.clearAllMocks();

	// Reset legacy mock state
	const mockModule = vi.importMock("@/lib/supabase") as any;
	if (mockModule._mockState) {
		mockModule._mockState.reset();
	}

	// Reset enhanced mock state
	globalSupabaseMock.reset();
	VietnameseMockDataGenerator.reset();

	// Seed fresh test data for each test
	globalSupabaseMock.seedTestData();
});
