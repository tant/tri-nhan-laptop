/**
 * Real-time Updates Hook
 * Handles Supabase Realtime integration for instant status synchronization
 */

import { supabase } from "@/lib/supabase";
import { getRepairStatusLabel } from "@/lib/repair-status";
import { useCallback, useEffect, useRef, useState } from "react";

export interface RealtimeEvent {
	id: string;
	type:
		| "ticket_created"
		| "status_changed"
		| "ticket_updated"
		| "notification_sent";
	timestamp: string;
	data: Record<string, unknown>;
	message: string;
}

export type { RealtimeEvent };

export interface RealtimeSubscription {
	id: string;
	table: string;
	event: string;
	active: boolean;
	created_at: string;
}

export interface ConnectionStatus {
	connected: boolean;
	reconnecting: boolean;
	last_connected: string | null;
	connection_count: number;
	error: string | null;
}

export function useRealtimeUpdates() {
	const [events, setEvents] = useState<RealtimeEvent[]>([]);
	const [subscriptions, setSubscriptions] = useState<RealtimeSubscription[]>(
		[],
	);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
		connected: false,
		reconnecting: false,
		last_connected: null,
		connection_count: 0,
		error: null,
	});

	const channelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(
		new Map(),
	);
	const eventHandlersRef = useRef<Map<string, (event: RealtimeEvent) => void>>(
		new Map(),
	);

	// Vietnamese event messages
	const getVietnameseMessage = (
		type: string,
		data: Record<string, unknown>,
	): string => {
		switch (type) {
			case "ticket_created":
				return `Đã tạo phiếu sửa chữa mới: ${data.ticket_code}`;
			case "status_changed":
				return `Trạng thái đã thay đổi: ${data.from_state} → ${data.to_state}`;
			case "ticket_updated":
				return `Đã cập nhật thông tin phiếu: ${data.ticket_code}`;
			case "notification_sent":
				return `Đã gửi thông báo cho khách hàng: ${data.phone}`;
			default:
				return "Có cập nhật mới";
		}
	};

	// Add event to history
	const addEvent = useCallback(
		(type: RealtimeEvent["type"], data: Record<string, unknown>) => {
			const event: RealtimeEvent = {
				id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				type,
				timestamp: new Date().toISOString(),
				data,
				message: getVietnameseMessage(type, data),
			};

			setEvents((prev) => [event, ...prev.slice(0, 99)]); // Keep last 100 events

			// Trigger custom event handlers
			eventHandlersRef.current.forEach((handler) => {
				try {
					handler(event);
				} catch (error) {
					console.error("Error in event handler:", error);
				}
			});
		},
		[],
	);

	// Subscribe to ticket changes
	const subscribeToTickets = useCallback(() => {
		const channelId = "tickets-realtime";

		if (channelsRef.current.has(channelId)) {
			return; // Already subscribed
		}

		const channel = supabase
			.channel(channelId)
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "repair_tickets" },
				(payload) => {
					const newTicket = payload.new;
					addEvent("ticket_created", {
						ticket_id: newTicket.id,
						ticket_code: newTicket.ticket_code,
						customer_phone: newTicket.customer_phone,
						device_info: newTicket.device_info,
						current_state: newTicket.current_state,
					});
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "repair_tickets" },
				(payload) => {
					const updatedTicket = payload.new;
					const oldTicket = payload.old;

					// Check if it's a status change
					if (oldTicket.current_state !== updatedTicket.current_state) {
						addEvent("status_changed", {
							ticket_id: updatedTicket.id,
							ticket_code: updatedTicket.ticket_code,
							from_state: getRepairStatusLabel(oldTicket.current_state),
							to_state: getRepairStatusLabel(updatedTicket.current_state),
							current_state: updatedTicket.current_state,
						});
					} else {
						addEvent("ticket_updated", {
							ticket_id: updatedTicket.id,
							ticket_code: updatedTicket.ticket_code,
							changes: Object.keys(payload.new).filter(
								(key) => payload.old[key] !== payload.new[key],
							),
						});
					}
				},
			)
			.subscribe((status) => {
				console.log("Tickets subscription status:", status);

				if (status === "SUBSCRIBED") {
					setConnectionStatus((prev) => ({
						...prev,
						connected: true,
						reconnecting: false,
						last_connected: new Date().toISOString(),
						connection_count: prev.connection_count + 1,
						error: null,
					}));

					setSubscriptions((prev) => [
						...prev.filter((sub) => sub.id !== channelId),
						{
							id: channelId,
							table: "repair_tickets",
							event: "ALL",
							active: true,
							created_at: new Date().toISOString(),
						},
					]);
				} else if (status === "CHANNEL_ERROR") {
					setConnectionStatus((prev) => ({
						...prev,
						connected: false,
						error: "Lỗi kết nối channel tickets",
					}));
				}
			});

		channelsRef.current.set(channelId, channel);
	}, [addEvent]);

	// Subscribe to status changes
	const subscribeToStatusChanges = useCallback(() => {
		const channelId = "status-changes-realtime";

		if (channelsRef.current.has(channelId)) {
			return;
		}

		const channel = supabase
			.channel(channelId)
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "repair_state_changes" },
				(payload) => {
					const statusChange = payload.new;
					addEvent("status_changed", {
						ticket_id: statusChange.ticket_id,
						from_state: getRepairStatusLabel(statusChange.from_state),
						to_state: getRepairStatusLabel(statusChange.to_state),
						changed_by: statusChange.changed_by,
						reason: statusChange.reason,
						customer_notified: statusChange.customer_notified,
					});
				},
			)
			.subscribe((status) => {
				console.log("Status changes subscription status:", status);

				if (status === "SUBSCRIBED") {
					setSubscriptions((prev) => [
						...prev.filter((sub) => sub.id !== channelId),
						{
							id: channelId,
							table: "repair_state_changes",
							event: "INSERT",
							active: true,
							created_at: new Date().toISOString(),
						},
					]);
				}
			});

		channelsRef.current.set(channelId, channel);
	}, [addEvent]);

	// Subscribe to notifications
	const subscribeToNotifications = useCallback(() => {
		const channelId = "notifications-realtime";

		if (channelsRef.current.has(channelId)) {
			return;
		}

		const channel = supabase
			.channel(channelId)
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "customer_notifications" },
				(payload) => {
					const notification = payload.new;
					addEvent("notification_sent", {
						ticket_id: notification.ticket_id,
						phone: notification.customer_phone,
						message: notification.message,
						notification_type: notification.notification_type,
					});
				},
			)
			.subscribe((status) => {
				console.log("Notifications subscription status:", status);

				if (status === "SUBSCRIBED") {
					setSubscriptions((prev) => [
						...prev.filter((sub) => sub.id !== channelId),
						{
							id: channelId,
							table: "customer_notifications",
							event: "INSERT",
							active: true,
							created_at: new Date().toISOString(),
						},
					]);
				}
			});

		channelsRef.current.set(channelId, channel);
	}, [addEvent]);

	// Subscribe to custom PostgreSQL notifications
	const subscribeToCustomNotifications = useCallback(() => {
		const channelId = "custom-notifications";

		if (channelsRef.current.has(channelId)) {
			return;
		}

		const channel = supabase
			.channel(channelId)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "repair_tickets" },
				() => {}, // Handle via other subscriptions
			)
			.subscribe();

		// Listen for custom PostgreSQL notifications
		const handleNotification = (payload: { type: string; payload: string }) => {
			try {
				const data = JSON.parse(payload.payload);

				switch (payload.type) {
					case "ticket_code_generated":
						addEvent("ticket_created", {
							ticket_id: data.ticket_id,
							ticket_code: data.ticket_code,
							customer_phone: data.customer_phone,
							device_info: data.device_info,
						});
						break;
					default:
						console.log("Unknown notification type:", payload.type);
				}
			} catch (error) {
				console.error("Error handling custom notification:", error);
			}
		};

		// Set up listener for pg_notify events
		supabase
			.channel("db-notifications")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "*" },
				handleNotification,
			)
			.subscribe();

		channelsRef.current.set(channelId, channel);
	}, [addEvent]);

	// Register event handler
	const onEvent = useCallback(
		(handler: (event: RealtimeEvent) => void): string => {
			const handlerId = `handler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			eventHandlersRef.current.set(handlerId, handler);
			return handlerId;
		},
		[],
	);

	// Unregister event handler
	const offEvent = useCallback((handlerId: string) => {
		eventHandlersRef.current.delete(handlerId);
	}, []);

	// Subscribe to all updates
	const subscribeToAll = useCallback(() => {
		subscribeToTickets();
		subscribeToStatusChanges();
		subscribeToNotifications();
		subscribeToCustomNotifications();
	}, [
		subscribeToTickets,
		subscribeToStatusChanges,
		subscribeToNotifications,
		subscribeToCustomNotifications,
	]);

	// Unsubscribe from all
	const unsubscribeFromAll = useCallback(() => {
		channelsRef.current.forEach((channel, channelId) => {
			channel.unsubscribe();
			console.log(`Unsubscribed from ${channelId}`);
		});

		channelsRef.current.clear();
		eventHandlersRef.current.clear();

		setSubscriptions([]);
		setConnectionStatus((prev) => ({
			...prev,
			connected: false,
			reconnecting: false,
		}));
	}, []);

	// Reconnect all subscriptions
	const reconnect = useCallback(() => {
		setConnectionStatus((prev) => ({
			...prev,
			reconnecting: true,
			error: null,
		}));

		unsubscribeFromAll();

		setTimeout(() => {
			subscribeToAll();
		}, 1000);
	}, [unsubscribeFromAll, subscribeToAll]);

	// Clear event history
	const clearEvents = useCallback(() => {
		setEvents([]);
	}, []);

	// Get events by type
	const getEventsByType = useCallback(
		(type: RealtimeEvent["type"]): RealtimeEvent[] => {
			return events.filter((event) => event.type === type);
		},
		[events],
	);

	// Get recent events
	const getRecentEvents = useCallback(
		(minutes = 5): RealtimeEvent[] => {
			const cutoff = new Date(Date.now() - minutes * 60 * 1000);
			return events.filter((event) => new Date(event.timestamp) > cutoff);
		},
		[events],
	);

	// Connection health check
	const checkConnection = useCallback(async (): Promise<boolean> => {
		try {
			const { data, error } = await supabase
				.from("repair_tickets")
				.select("id")
				.limit(1);

			if (error) throw error;

			setConnectionStatus((prev) => ({
				...prev,
				connected: true,
				error: null,
			}));

			return true;
		} catch (_error) {
			setConnectionStatus((prev) => ({
				...prev,
				connected: false,
				error: "Lỗi kết nối database",
			}));

			return false;
		}
	}, []);

	// Initialize subscriptions on mount
	useEffect(() => {
		subscribeToAll();

		// Set up periodic connection check
		const healthCheck = setInterval(checkConnection, 30000); // Every 30 seconds

		return () => {
			clearInterval(healthCheck);
			unsubscribeFromAll();
		};
	}, []); // Empty dependency array - only run on mount/unmount

	return {
		// Data
		events,
		subscriptions,
		connectionStatus,

		// Event operations
		onEvent,
		offEvent,
		clearEvents,
		getEventsByType,
		getRecentEvents,

		// Subscription operations
		subscribeToAll,
		unsubscribeFromAll,
		reconnect,

		// Connection operations
		checkConnection,

		// Statistics
		totalEvents: events.length,
		activeSubscriptions: subscriptions.filter((sub) => sub.active).length,
		isConnected: connectionStatus.connected,
		isReconnecting: connectionStatus.reconnecting,
	};
}
