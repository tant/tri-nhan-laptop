/**
 * Performance Optimizer Hook
 * Optimizes high-frequency sync updates with batching, throttling, and memory management
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SyncEvent } from "./use-sync-manager";

export interface PerformanceConfig {
	batch_size: number;
	batch_timeout: number; // milliseconds
	throttle_delay: number; // milliseconds
	max_event_history: number;
	memory_cleanup_interval: number; // milliseconds
	ui_update_throttle: number; // milliseconds
	priority_events: string[];
}

export interface PerformanceMetrics {
	events_processed: number;
	events_batched: number;
	events_throttled: number;
	average_batch_size: number;
	memory_usage_mb: number;
	ui_update_frequency: number; // updates per second
	processing_latency: number; // milliseconds
	last_optimization: string;
}

export interface EventBatch {
	id: string;
	events: SyncEvent[];
	created_at: string;
	processed_at?: string;
	priority: "high" | "normal" | "low";
}

export interface UIUpdateQueue {
	updates: (() => void)[];
	scheduled: boolean;
	last_execution: number;
}

export function usePerformanceOptimizer() {
	const [metrics, setMetrics] = useState<PerformanceMetrics>({
		events_processed: 0,
		events_batched: 0,
		events_throttled: 0,
		average_batch_size: 0,
		memory_usage_mb: 0,
		ui_update_frequency: 0,
		processing_latency: 0,
		last_optimization: "",
	});

	const [isOptimizing, setIsOptimizing] = useState(false);

	// Configuration
	const config: PerformanceConfig = {
		batch_size: 10,
		batch_timeout: 500, // 500ms
		throttle_delay: 100, // 100ms
		max_event_history: 1000,
		memory_cleanup_interval: 60000, // 1 minute
		ui_update_throttle: 16, // ~60fps
		priority_events: ["status_update", "ticket_created", "notification_sent"],
	};

	// Refs for performance optimization
	const eventBatchRef = useRef<SyncEvent[]>([]);
	const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const uiUpdateQueueRef = useRef<UIUpdateQueue>({
		updates: [],
		scheduled: false,
		last_execution: 0,
	});
	const eventHandlersRef = useRef<Map<string, (events: SyncEvent[]) => void>>(
		new Map(),
	);
	const processingStatsRef = useRef({
		batches_processed: 0,
		total_events_in_batches: 0,
		processing_times: [] as number[],
	});

	// Vietnamese performance messages
	const getPerformanceMessage = (
		type: "optimization" | "batch" | "throttle" | "cleanup",
	): string => {
		switch (type) {
			case "optimization":
				return "Đã tối ưu hóa hiệu suất";
			case "batch":
				return "Xử lý theo lô";
			case "throttle":
				return "Giới hạn tần suất cập nhật";
			case "cleanup":
				return "Dọn dẹp bộ nhớ";
			default:
				return "Tối ưu hóa không xác định";
		}
	};

	// Calculate event priority
	const getEventPriority = useCallback(
		(event: SyncEvent): EventBatch["priority"] => {
			if (config.priority_events.includes(event.type)) {
				return "high";
			}

			// Check if event affects currently visible data
			if (
				event.entity_type === "repair_ticket" &&
				window.location.pathname.includes("/phieu-sua-chua/")
			) {
				return "high";
			}

			// System events are low priority
			if (event.type === "system_event") {
				return "low";
			}

			return "normal";
		},
		[config.priority_events],
	);

	// Process event batch
	const processBatch = useCallback(
		async (events: SyncEvent[]) => {
			if (events.length === 0) return;

			const startTime = Date.now();
			setIsOptimizing(true);

			try {
				// Sort events by priority and timestamp
				const sortedEvents = events.sort((a, b) => {
					const priorityOrder = { high: 0, normal: 1, low: 2 };
					const aPriority = getEventPriority(a);
					const bPriority = getEventPriority(b);

					if (aPriority !== bPriority) {
						return priorityOrder[aPriority] - priorityOrder[bPriority];
					}

					return (
						new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
					);
				});

				// Group events by type for batch processing
				const eventGroups = new Map<string, SyncEvent[]>();
				for (const event of sortedEvents) {
					const key = `${event.type}-${event.entity_type}`;
					if (!eventGroups.has(key)) {
						eventGroups.set(key, []);
					}
					eventGroups.get(key)?.push(event);
				}

				// Process each group
				for (const [groupKey, groupEvents] of eventGroups) {
					const handlers = eventHandlersRef.current.get(groupKey);
					if (handlers) {
						try {
							await handlers(groupEvents);
						} catch (error) {
							console.error(`Error processing event group ${groupKey}:`, error);
						}
					}
				}

				// Update processing stats
				const processingTime = Date.now() - startTime;
				processingStatsRef.current.batches_processed++;
				processingStatsRef.current.total_events_in_batches += events.length;
				processingStatsRef.current.processing_times.push(processingTime);

				// Keep only last 100 processing times for average calculation
				if (processingStatsRef.current.processing_times.length > 100) {
					processingStatsRef.current.processing_times =
						processingStatsRef.current.processing_times.slice(-100);
				}

				// Update metrics
				setMetrics((prev) => ({
					...prev,
					events_processed: prev.events_processed + events.length,
					events_batched: prev.events_batched + 1,
					average_batch_size:
						processingStatsRef.current.total_events_in_batches /
						processingStatsRef.current.batches_processed,
					processing_latency:
						processingStatsRef.current.processing_times.reduce(
							(a, b) => a + b,
							0,
						) / processingStatsRef.current.processing_times.length,
					last_optimization: new Date().toISOString(),
				}));
			} catch (error) {
				console.error("Error processing event batch:", error);
			} finally {
				setIsOptimizing(false);
			}
		},
		[getEventPriority],
	);

	// Flush current batch
	const flushBatch = useCallback(() => {
		if (eventBatchRef.current.length > 0) {
			const events = [...eventBatchRef.current];
			eventBatchRef.current = [];

			// Clear timeout
			if (batchTimeoutRef.current) {
				clearTimeout(batchTimeoutRef.current);
				batchTimeoutRef.current = null;
			}

			processBatch(events);
		}
	}, [processBatch]);

	// Add event to batch with intelligent batching
	const addEventToBatch = useCallback(
		(event: SyncEvent) => {
			const priority = getEventPriority(event);

			// High priority events are processed immediately
			if (priority === "high") {
				processBatch([event]);
				return;
			}

			// Add to batch
			eventBatchRef.current.push(event);

			// Process batch if it reaches max size
			if (eventBatchRef.current.length >= config.batch_size) {
				flushBatch();
				return;
			}

			// Set timeout to process batch
			if (batchTimeoutRef.current) {
				clearTimeout(batchTimeoutRef.current);
			}

			batchTimeoutRef.current = setTimeout(() => {
				flushBatch();
			}, config.batch_timeout);
		},
		[getEventPriority, processBatch, flushBatch, config],
	);

	// Throttled UI update scheduler
	const scheduleUIUpdate = useCallback(
		(updateFunction: () => void) => {
			const queue = uiUpdateQueueRef.current;

			queue.updates.push(updateFunction);

			if (!queue.scheduled) {
				queue.scheduled = true;

				const timeSinceLastUpdate = Date.now() - queue.last_execution;
				const delay = Math.max(
					0,
					config.ui_update_throttle - timeSinceLastUpdate,
				);

				setTimeout(() => {
					const updates = [...queue.updates];
					queue.updates = [];
					queue.scheduled = false;
					queue.last_execution = Date.now();

					// Execute all queued updates
					requestAnimationFrame(() => {
						updates.forEach((update) => {
							try {
								update();
							} catch (error) {
								console.error("Error in UI update:", error);
							}
						});
					});

					// Update UI frequency metric
					setMetrics((prev) => ({
						...prev,
						ui_update_frequency: 1000 / (Date.now() - queue.last_execution),
					}));
				}, delay);
			}
		},
		[config.ui_update_throttle],
	);

	// Throttled event processing
	const throttledEventProcessor = useCallback(
		(event: SyncEvent) => {
			// Count throttled events
			setMetrics((prev) => ({
				...prev,
				events_throttled: prev.events_throttled + 1,
			}));

			if (throttleTimeoutRef.current) {
				return; // Already throttled
			}

			throttleTimeoutRef.current = setTimeout(() => {
				addEventToBatch(event);
				throttleTimeoutRef.current = null;
			}, config.throttle_delay);
		},
		[addEventToBatch, config.throttle_delay],
	);

	// Register event handler for batch processing
	const registerEventHandler = useCallback(
		(
			eventType: string,
			entityType: string,
			handler: (events: SyncEvent[]) => void,
		) => {
			const key = `${eventType}-${entityType}`;
			eventHandlersRef.current.set(key, handler);

			// Return unregister function
			return () => {
				eventHandlersRef.current.delete(key);
			};
		},
		[],
	);

	// Process single event (entry point)
	const processEvent = useCallback(
		(
			event: SyncEvent,
			options?: {
				force_immediate?: boolean;
				skip_throttle?: boolean;
			},
		) => {
			if (options?.force_immediate) {
				processBatch([event]);
				return;
			}

			if (options?.skip_throttle || getEventPriority(event) === "high") {
				addEventToBatch(event);
				return;
			}

			throttledEventProcessor(event);
		},
		[processBatch, addEventToBatch, throttledEventProcessor, getEventPriority],
	);

	// Memory cleanup
	const performMemoryCleanup = useCallback(() => {
		try {
			// Clear old processing times
			processingStatsRef.current.processing_times =
				processingStatsRef.current.processing_times.slice(-50);

			// Force garbage collection if available (development only)
			if (process.env.NODE_ENV === "development" && (window as any).gc) {
				(window as any).gc();
			}

			// Calculate memory usage (rough estimation)
			const usedJSHeapSize = (performance as any).memory?.usedJSHeapSize || 0;
			const memoryUsageMB = usedJSHeapSize / (1024 * 1024);

			setMetrics((prev) => ({
				...prev,
				memory_usage_mb: memoryUsageMB,
				last_optimization: new Date().toISOString(),
			}));

			console.log("Memory cleanup completed:", {
				memoryUsageMB: memoryUsageMB.toFixed(2),
				eventHandlers: eventHandlersRef.current.size,
				queuedUpdates: uiUpdateQueueRef.current.updates.length,
			});
		} catch (error) {
			console.error("Error during memory cleanup:", error);
		}
	}, []);

	// Get performance recommendations
	const getPerformanceRecommendations = useCallback((): string[] => {
		const recommendations: string[] = [];

		if (metrics.processing_latency > 100) {
			recommendations.push("Giảm kích thước lô xử lý để cải thiện độ trễ");
		}

		if (metrics.ui_update_frequency > 30) {
			recommendations.push(
				"Tăng thời gian throttle UI để giảm tần suất cập nhật",
			);
		}

		if (metrics.memory_usage_mb > 50) {
			recommendations.push("Tăng tần suất dọn dẹp bộ nhớ");
		}

		if (metrics.events_throttled > metrics.events_processed * 0.5) {
			recommendations.push(
				"Xem xét tăng batch size để xử lý nhiều sự kiện hơn",
			);
		}

		if (recommendations.length === 0) {
			recommendations.push("Hiệu suất hệ thống tốt");
		}

		return recommendations;
	}, [metrics]);

	// Setup periodic memory cleanup
	useEffect(() => {
		const cleanupInterval = setInterval(() => {
			performMemoryCleanup();
		}, config.memory_cleanup_interval);

		return () => {
			clearInterval(cleanupInterval);
		};
	}, [performMemoryCleanup, config.memory_cleanup_interval]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Clear all timeouts
			if (batchTimeoutRef.current) {
				clearTimeout(batchTimeoutRef.current);
			}
			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current);
			}

			// Process remaining events
			flushBatch();

			// Clear handlers
			eventHandlersRef.current.clear();
		};
	}, [flushBatch]);

	return {
		// State
		metrics,
		isOptimizing,

		// Event processing
		processEvent,
		registerEventHandler,
		flushBatch,

		// UI optimization
		scheduleUIUpdate,

		// Memory management
		performMemoryCleanup,

		// Utilities
		getPerformanceRecommendations,
		getPerformanceMessage,

		// Configuration
		config,

		// Statistics
		batchStats: {
			pending_events: eventBatchRef.current.length,
			queued_ui_updates: uiUpdateQueueRef.current.updates.length,
			registered_handlers: eventHandlersRef.current.size,
		},
	};
}
