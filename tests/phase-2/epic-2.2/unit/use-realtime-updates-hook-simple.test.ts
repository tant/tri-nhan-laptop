/**
 * use-realtime-updates Hook Unit Tests (Simplified)
 * Basic functionality tests without complex mocking
 */

import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
	supabase: {
		channel: vi.fn(() => ({
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn().mockReturnThis(),
			unsubscribe: vi.fn().mockReturnThis(),
		})),
		from: vi.fn(() => ({
			select: vi.fn(() => ({
				limit: vi.fn(() => ({
					then: vi.fn((callback) =>
						Promise.resolve(callback({ data: [{ id: "test" }], error: null })),
					),
				})),
			})),
		})),
	},
}));

vi.mock("@/lib/workflow/repair-states", () => ({
	REPAIR_STATES: {
		device_received: { label: "Đã nhận thiết bị" },
		preliminary_inspection: { label: "Kiểm tra sơ bộ" },
		in_repair: { label: "Đang sửa chữa" },
		completed: { label: "Hoàn thành" },
	},
}));

describe("useRealtimeUpdates Hook - Basic Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.clearAllTimers();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("Hook Initialization", () => {
		it("should initialize with empty state", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			expect(result.current.events).toEqual([]);
			expect(result.current.subscriptions).toEqual([]);
			expect(result.current.connectionStatus).toEqual({
				connected: false,
				reconnecting: false,
				last_connected: null,
				connection_count: 0,
				error: null,
			});
			expect(result.current.totalEvents).toBe(0);
			expect(result.current.activeSubscriptions).toBe(0);
			expect(result.current.isConnected).toBe(false);
			expect(result.current.isReconnecting).toBe(false);
		});

		it("should provide all expected methods", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			expect(typeof result.current.onEvent).toBe("function");
			expect(typeof result.current.offEvent).toBe("function");
			expect(typeof result.current.clearEvents).toBe("function");
			expect(typeof result.current.getEventsByType).toBe("function");
			expect(typeof result.current.getRecentEvents).toBe("function");
			expect(typeof result.current.subscribeToAll).toBe("function");
			expect(typeof result.current.unsubscribeFromAll).toBe("function");
			expect(typeof result.current.reconnect).toBe("function");
			expect(typeof result.current.checkConnection).toBe("function");
		});
	});

	describe("Event Management Functions", () => {
		it("should clear events", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			act(() => {
				result.current.clearEvents();
			});

			expect(result.current.events).toHaveLength(0);
			expect(result.current.totalEvents).toBe(0);
		});

		it("should get events by type", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			act(() => {
				const eventsByType = result.current.getEventsByType("ticket_created");
				expect(Array.isArray(eventsByType)).toBe(true);
			});
		});

		it("should get recent events", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			act(() => {
				const recentEvents = result.current.getRecentEvents(5);
				expect(Array.isArray(recentEvents)).toBe(true);
			});
		});

		it("should register and unregister event handlers", () => {
			const { result } = renderHook(() => useRealtimeUpdates());
			const mockHandler = vi.fn();

			act(() => {
				const handlerId = result.current.onEvent(mockHandler);
				expect(typeof handlerId).toBe("string");

				result.current.offEvent(handlerId);
			});

			// Handler should be registered and unregistered without errors
		});
	});

	describe("Connection Management", () => {
		it("should provide connection status", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			expect(result.current.connectionStatus).toHaveProperty("connected");
			expect(result.current.connectionStatus).toHaveProperty("reconnecting");
			expect(result.current.connectionStatus).toHaveProperty("last_connected");
			expect(result.current.connectionStatus).toHaveProperty(
				"connection_count",
			);
			expect(result.current.connectionStatus).toHaveProperty("error");
		});

		it("should handle reconnection", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			act(() => {
				result.current.reconnect();
			});

			// Should not throw errors
		});

		it("should check connection health", async () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			await act(async () => {
				const isHealthy = await result.current.checkConnection();
				expect(typeof isHealthy).toBe("boolean");
			});
		});

		it("should manage subscriptions", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			act(() => {
				result.current.subscribeToAll();
				result.current.unsubscribeFromAll();
			});

			// Should not throw errors
		});
	});

	describe("Statistics and State", () => {
		it("should track total events count", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			expect(result.current.totalEvents).toBe(0);
			expect(result.current.events.length).toBe(result.current.totalEvents);
		});

		it("should track active subscriptions", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			expect(result.current.activeSubscriptions).toBe(0);
			expect(
				result.current.subscriptions.filter((sub) => sub.active).length,
			).toBe(result.current.activeSubscriptions);
		});

		it("should provide connection status flags", () => {
			const { result } = renderHook(() => useRealtimeUpdates());

			expect(result.current.isConnected).toBe(
				result.current.connectionStatus.connected,
			);
			expect(result.current.isReconnecting).toBe(
				result.current.connectionStatus.reconnecting,
			);
		});
	});

	describe("Cleanup", () => {
		it("should cleanup subscriptions on unmount", () => {
			const { unmount } = renderHook(() => useRealtimeUpdates());

			// Should not throw errors on unmount
			unmount();
		});
	});
});
