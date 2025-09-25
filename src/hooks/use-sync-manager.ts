/**
 * Sync Manager Hook
 * Handles real-time synchronization across multiple client sessions
 * Manages conflict resolution, connection state, and performance optimization
 */

import { supabase } from "@/lib/supabase";
import { RepairState } from "@/lib/workflow/repair-states";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SyncEvent {
	id: string;
	type: "status_update" | "ticket_update" | "user_action" | "system_event";
	entity_type: "repair_ticket" | "customer" | "part_usage" | "comment";
	entity_id: string;
	timestamp: string;
	user_id: string;
	user_name: string;
	session_id: string;
	data: Record<string, unknown>;
	version: number;
}

export interface ConflictInfo {
	id: string;
	entity_id: string;
	local_version: number;
	remote_version: number;
	local_data: Record<string, unknown>;
	remote_data: Record<string, unknown>;
	timestamp: string;
	resolved: boolean;
	resolution_strategy: "local_wins" | "remote_wins" | "merge" | "user_choice";
}

export interface SyncSession {
	id: string;
	user_id: string;
	user_name: string;
	connected_at: string;
	last_seen: string;
	active: boolean;
	context: {
		current_page?: string;
		viewing_ticket?: string;
		last_action?: string;
	};
}

export interface SyncStats {
	events_received: number;
	events_sent: number;
	conflicts_resolved: number;
	connection_uptime: number;
	last_sync: string;
	sync_lag: number; // milliseconds
	active_sessions: number;
}

export interface ConnectionState {
	status:
		| "connecting"
		| "connected"
		| "reconnecting"
		| "disconnected"
		| "error";
	quality: "excellent" | "good" | "poor" | "unstable";
	last_connected: string | null;
	connection_attempts: number;
	error_message: string | null;
	latency: number;
}

export function useSyncManager() {
	const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
	const [activeSessions, setActiveSessions] = useState<SyncSession[]>([]);
	const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
	const [connectionState, setConnectionState] = useState<ConnectionState>({
		status: "disconnected",
		quality: "good",
		last_connected: null,
		connection_attempts: 0,
		error_message: null,
		latency: 0,
	});
	const [syncStats, setSyncStats] = useState<SyncStats>({
		events_received: 0,
		events_sent: 0,
		conflicts_resolved: 0,
		connection_uptime: 0,
		last_sync: "",
		sync_lag: 0,
		active_sessions: 0,
	});

	// Session management
	const sessionId = useRef<string>(
		`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
	);
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
	const eventQueue = useRef<SyncEvent[]>([]);
	const versionMap = useRef<Map<string, number>>(new Map());
	const conflictHandlers = useRef<
		Map<string, (conflict: ConflictInfo) => Promise<Record<string, unknown>>>
	>(new Map());

	// Vietnamese status messages
	const getSyncMessage = (type: string, data: Record<string, unknown>): string => {
		switch (type) {
			case "status_update":
				return `Trạng thái được cập nhật: ${data.from_state} → ${data.to_state}`;
			case "ticket_update":
				return `Thông tin phiếu được cập nhật: ${data.ticket_code}`;
			case "user_action":
				return `${data.user_name} đã thực hiện: ${data.action}`;
			case "system_event":
				return `Hệ thống: ${data.message}`;
			default:
				return "Có cập nhật mới";
		}
	};

	// Initialize session
	const initializeSession = useCallback(
		async (userId: string, userName: string) => {
			try {
				setConnectionState((prev) => ({ ...prev, status: "connecting" }));

				// Create session record
				const sessionData: SyncSession = {
					id: sessionId.current,
					user_id: userId,
					user_name: userName,
					connected_at: new Date().toISOString(),
					last_seen: new Date().toISOString(),
					active: true,
					context: {
						current_page: window.location.pathname,
					},
				};

				// Insert session into database
				const { error } = await supabase
					.from("sync_sessions")
					.upsert(sessionData);

				if (error) throw error;

				setConnectionState((prev) => ({
					...prev,
					status: "connected",
					last_connected: new Date().toISOString(),
					error_message: null,
				}));

				// Start heartbeat
				startHeartbeat();

				return true;
			} catch (err) {
				setConnectionState((prev) => ({
					...prev,
					status: "error",
					error_message: err instanceof Error ? err.message : "Lỗi kết nối",
				}));
				return false;
			}
		},
		[],
	);

	// Start heartbeat to maintain session
	const startHeartbeat = useCallback(() => {
		if (heartbeatRef.current) {
			clearInterval(heartbeatRef.current);
		}

		heartbeatRef.current = setInterval(async () => {
			try {
				const { error } = await supabase
					.from("sync_sessions")
					.update({
						last_seen: new Date().toISOString(),
						context: {
							current_page: window.location.pathname,
						},
					})
					.eq("id", sessionId.current);

				if (error) throw error;

				// Update connection quality based on response time
				const startTime = Date.now();
				await supabase.from("repair_tickets").select("id").limit(1);
				const latency = Date.now() - startTime;

				setConnectionState((prev) => ({
					...prev,
					latency,
					quality:
						latency < 100
							? "excellent"
							: latency < 300
								? "good"
								: latency < 1000
									? "poor"
									: "unstable",
				}));
			} catch (err) {
				console.error("Heartbeat failed:", err);
				setConnectionState((prev) => ({
					...prev,
					status: "reconnecting",
				}));
			}
		}, 5000); // Every 5 seconds
	}, []);

	// Subscribe to sync events
	const subscribeToSync = useCallback(() => {
		if (channelRef.current) {
			channelRef.current.unsubscribe();
		}

		channelRef.current = supabase
			.channel("sync-realtime")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "sync_events" },
				(payload) => {
					const syncEvent = payload.new as SyncEvent;

					// Don't process our own events
					if (syncEvent.session_id === sessionId.current) {
						return;
					}

					handleRemoteSyncEvent(syncEvent);
				},
			)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "sync_sessions" },
				(payload) => {
					handleSessionUpdate(payload);
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "repair_tickets" },
				(payload) => {
					handleTicketUpdate(payload);
				},
			)
			.subscribe((status) => {
				console.log("Sync subscription status:", status);

				if (status === "SUBSCRIBED") {
					setConnectionState((prev) => ({
						...prev,
						status: "connected",
					}));
				} else if (status === "CHANNEL_ERROR") {
					setConnectionState((prev) => ({
						...prev,
						status: "error",
						error_message: "Lỗi kênh đồng bộ",
					}));
				}
			});
	}, []);

	// Handle remote sync events
	const handleRemoteSyncEvent = useCallback(async (event: SyncEvent) => {
		try {
			// Check for version conflicts
			const localVersion = versionMap.current.get(event.entity_id) || 0;
			const remoteVersion = event.version;

			if (remoteVersion <= localVersion) {
				// Ignore older or same version events
				return;
			}

			if (remoteVersion > localVersion + 1) {
				// Potential conflict - remote version is too far ahead
				await handleVersionConflict(event, localVersion);
				return;
			}

			// Update local version
			versionMap.current.set(event.entity_id, remoteVersion);

			// Add to event history
			setSyncEvents((prev) => [event, ...prev.slice(0, 99)]);

			// Update stats
			setSyncStats((prev) => ({
				...prev,
				events_received: prev.events_received + 1,
				last_sync: new Date().toISOString(),
				sync_lag: Date.now() - new Date(event.timestamp).getTime(),
			}));

			// Trigger appropriate UI updates based on event type
			await dispatchSyncEvent(event);
		} catch (error) {
			console.error("Error handling remote sync event:", error);
		}
	}, []);

	// Handle version conflicts
	const handleVersionConflict = useCallback(
		async (remoteEvent: SyncEvent, localVersion: number) => {
			const conflictId = `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Get current local data
			const { data: localData } = await supabase
				.from(getTableFromEntityType(remoteEvent.entity_type))
				.select("*")
				.eq("id", remoteEvent.entity_id)
				.single();

			const conflict: ConflictInfo = {
				id: conflictId,
				entity_id: remoteEvent.entity_id,
				local_version: localVersion,
				remote_version: remoteEvent.version,
				local_data: localData,
				remote_data: remoteEvent.data,
				timestamp: new Date().toISOString(),
				resolved: false,
				resolution_strategy: "remote_wins", // Default strategy
			};

			setConflicts((prev) => [conflict, ...prev]);

			// Try automatic resolution
			const resolvedData = await resolveConflictAutomatically(conflict);
			if (resolvedData) {
				await applyConflictResolution(conflictId, resolvedData, "merge");
			}
		},
		[],
	);

	// Resolve conflicts automatically using merge strategies
	const resolveConflictAutomatically = useCallback(
		async (conflict: ConflictInfo): Promise<Record<string, unknown> | null> => {
			const { local_data, remote_data } = conflict;

			// Strategy 1: Timestamp-based resolution
			if (local_data.updated_at && remote_data.updated_at) {
				const localTime = new Date(local_data.updated_at).getTime();
				const remoteTime = new Date(remote_data.updated_at).getTime();

				if (Math.abs(remoteTime - localTime) > 5000) {
					// More than 5 seconds apart
					return remoteTime > localTime ? remote_data : local_data;
				}
			}

			// Strategy 2: Merge non-conflicting fields
			if (typeof local_data === "object" && typeof remote_data === "object") {
				const merged = { ...local_data };

				for (const [key, remoteValue] of Object.entries(remote_data)) {
					const localValue = local_data[key];

					// Auto-merge rules
					if (localValue === undefined || localValue === null) {
						merged[key] = remoteValue;
					} else if (key === "updated_at" || key === "version") {
						// Always use remote for metadata
						merged[key] = remoteValue;
					} else if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
						// Merge arrays by unique ID
						merged[key] = mergeArraysByUniqueId(localValue, remoteValue);
					}
					// For conflicting scalar values, keep local by default
				}

				return merged;
			}

			return null;
		},
		[],
	);

	// Apply conflict resolution
	const applyConflictResolution = useCallback(
		async (
			conflictId: string,
			resolvedData: Record<string, unknown>,
			strategy: ConflictInfo["resolution_strategy"],
		) => {
			try {
				const conflict = conflicts.find((c) => c.id === conflictId);
				if (!conflict) return;

				// Update the entity with resolved data
				const tableName = getTableFromEntityType(
					conflict.entity_id.split("-")[0] as SyncEvent["entity_type"],
				);
				const { error } = await supabase
					.from(tableName)
					.update({
						...resolvedData,
						version: conflict.remote_version,
						updated_at: new Date().toISOString(),
					})
					.eq("id", conflict.entity_id);

				if (error) throw error;

				// Mark conflict as resolved
				setConflicts((prev) =>
					prev.map((c) =>
						c.id === conflictId
							? { ...c, resolved: true, resolution_strategy: strategy }
							: c,
					),
				);

				// Update version map
				versionMap.current.set(conflict.entity_id, conflict.remote_version);

				// Update stats
				setSyncStats((prev) => ({
					...prev,
					conflicts_resolved: prev.conflicts_resolved + 1,
				}));
			} catch (error) {
				console.error("Error applying conflict resolution:", error);
			}
		},
		[conflicts],
	);

	// Broadcast sync event to other sessions
	const broadcastSyncEvent = useCallback(
		async (
			type: SyncEvent["type"],
			entityType: SyncEvent["entity_type"],
			entityId: string,
			data: Record<string, unknown>,
			userId: string,
			userName: string,
		) => {
			try {
				// Increment version for this entity
				const currentVersion = versionMap.current.get(entityId) || 0;
				const newVersion = currentVersion + 1;
				versionMap.current.set(entityId, newVersion);

				const syncEvent: SyncEvent = {
					id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					type,
					entity_type: entityType,
					entity_id: entityId,
					timestamp: new Date().toISOString(),
					user_id: userId,
					user_name: userName,
					session_id: sessionId.current,
					data,
					version: newVersion,
				};

				// Insert sync event
				const { error } = await supabase.from("sync_events").insert(syncEvent);

				if (error) throw error;

				// Add to local event history
				setSyncEvents((prev) => [syncEvent, ...prev.slice(0, 99)]);

				// Update stats
				setSyncStats((prev) => ({
					...prev,
					events_sent: prev.events_sent + 1,
				}));

				return true;
			} catch (error) {
				console.error("Error broadcasting sync event:", error);
				return false;
			}
		},
		[],
	);

	// Dispatch sync events to appropriate handlers
	const dispatchSyncEvent = useCallback(async (event: SyncEvent) => {
		// Emit custom event for UI components to listen to
		const customEvent = new CustomEvent("sync-update", {
			detail: {
				type: event.type,
				entityType: event.entity_type,
				entityId: event.entity_id,
				data: event.data,
				userId: event.user_id,
				userName: event.user_name,
				timestamp: event.timestamp,
			},
		});

		window.dispatchEvent(customEvent);
	}, []);

	// Session management
	const handleSessionUpdate = useCallback((payload: {eventType: string; new?: SyncSession; old?: SyncSession}) => {
		if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
			const session = payload.new as SyncSession;
			setActiveSessions((prev) => {
				const filtered = prev.filter((s) => s.id !== session.id);
				return session.active ? [session, ...filtered] : filtered;
			});
		} else if (payload.eventType === "DELETE") {
			const session = payload.old as SyncSession;
			setActiveSessions((prev) => prev.filter((s) => s.id !== session.id));
		}
	}, []);

	// Handle ticket updates
	const handleTicketUpdate = useCallback((payload: {new: Record<string, unknown>; old: Record<string, unknown>}) => {
		const updatedTicket = payload.new;
		const oldTicket = payload.old;

		// Check if this is a status change
		if (oldTicket.current_state !== updatedTicket.current_state) {
			// This update came through the database, create sync event
			const event: SyncEvent = {
				id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				type: "status_update",
				entity_type: "repair_ticket",
				entity_id: updatedTicket.id,
				timestamp: updatedTicket.updated_at || new Date().toISOString(),
				user_id: "system",
				user_name: "Hệ thống",
				session_id: "auto",
				data: {
					ticket_code: updatedTicket.ticket_code,
					from_state: oldTicket.current_state,
					to_state: updatedTicket.current_state,
				},
				version: Date.now(), // Use timestamp as version for auto events
			};

			handleRemoteSyncEvent(event);
		}
	}, []);

	// Utility functions
	const getTableFromEntityType = (
		entityType: SyncEvent["entity_type"],
	): string => {
		switch (entityType) {
			case "repair_ticket":
				return "repair_tickets";
			case "customer":
				return "customers";
			case "part_usage":
				return "part_usage";
			case "comment":
				return "ticket_comments";
			default:
				return "";
		}
	};

	const mergeArraysByUniqueId = (
		localArray: Array<Record<string, unknown>>,
		remoteArray: Array<Record<string, unknown>>,
	): Array<Record<string, unknown>> => {
		const merged = [...localArray];

		for (const remoteItem of remoteArray) {
			const existingIndex = merged.findIndex(
				(item) => item.id === remoteItem.id,
			);
			if (existingIndex >= 0) {
				// Update existing item with newer timestamp
				const localItem = merged[existingIndex];
				const localTime = new Date(localItem.updated_at || 0).getTime();
				const remoteTime = new Date(remoteItem.updated_at || 0).getTime();

				if (remoteTime > localTime) {
					merged[existingIndex] = remoteItem;
				}
			} else {
				merged.push(remoteItem);
			}
		}

		return merged;
	};

	// Cleanup session on unmount
	const cleanup = useCallback(async () => {
		try {
			// Mark session as inactive
			await supabase
				.from("sync_sessions")
				.update({ active: false })
				.eq("id", sessionId.current);

			// Clear intervals
			if (heartbeatRef.current) {
				clearInterval(heartbeatRef.current);
			}

			// Unsubscribe from channel
			if (channelRef.current) {
				channelRef.current.unsubscribe();
			}
		} catch (error) {
			console.error("Error during cleanup:", error);
		}
	}, []);

	// Initialize on mount
	useEffect(() => {
		subscribeToSync();

		return () => {
			cleanup();
		};
	}, [subscribeToSync, cleanup]);

	// Update stats periodically
	useEffect(() => {
		const statsInterval = setInterval(() => {
			setSyncStats((prev) => ({
				...prev,
				connection_uptime:
					connectionState.status === "connected"
						? Date.now() -
							new Date(connectionState.last_connected || 0).getTime()
						: 0,
				active_sessions: activeSessions.length,
			}));
		}, 1000);

		return () => clearInterval(statsInterval);
	}, [connectionState, activeSessions]);

	return {
		// State
		syncEvents,
		activeSessions,
		conflicts,
		connectionState,
		syncStats,
		sessionId: sessionId.current,

		// Session management
		initializeSession,
		cleanup,

		// Sync operations
		broadcastSyncEvent,
		applyConflictResolution,

		// Connection management
		subscribeToSync,
		startHeartbeat,

		// Utilities
		getSyncMessage,

		// Status checks
		isConnected: connectionState.status === "connected",
		isReconnecting: connectionState.status === "reconnecting",
		hasUnresolvedConflicts: conflicts.some((c) => !c.resolved),

		// Performance metrics
		averageSyncLag: syncStats.sync_lag,
		connectionQuality: connectionState.quality,
	};
}
