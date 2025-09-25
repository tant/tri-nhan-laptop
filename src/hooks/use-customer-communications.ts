/**
 * Customer Communications Hook
 * Handles Vietnamese notification templates and delivery tracking for customers
 */

import { supabase } from "@/lib/supabase";
import type { RepairState } from "@/lib/workflow/repair-states";
import { useCallback, useState } from "react";

export interface NotificationTemplate {
	id: string;
	name: string;
	trigger_state: RepairState;
	subject_template: string;
	message_template: string;
	is_active: boolean;
	created_at: string;
}

export interface CustomerNotification {
	id: string;
	ticket_id: string;
	customer_phone: string;
	message: string;
	notification_type: string;
	delivery_status: "pending" | "sent" | "delivered" | "failed";
	sent_at: string;
	delivered_at?: string;
	error_message?: string;
	metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
	customer_phone: string;
	sms_enabled: boolean;
	email_enabled: boolean;
	call_enabled: boolean;
	preferred_time_start: string;
	preferred_time_end: string;
	language: "vi" | "en";
	created_at: string;
	updated_at: string;
}

export interface NotificationStats {
	total_sent: number;
	delivered: number;
	failed: number;
	pending: number;
	delivery_rate: number;
	avg_delivery_time: number;
}

export function useCustomerCommunications() {
	const [notifications, setNotifications] = useState<CustomerNotification[]>(
		[],
	);
	const [templates, _setTemplates] = useState<NotificationTemplate[]>([]);
	const [preferences, _setPreferences] = useState<NotificationPreferences[]>(
		[],
	);
	const [stats, setStats] = useState<NotificationStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Vietnamese notification templates by state
	const defaultTemplates: Record<
		RepairState,
		{ subject: string; message: string }
	> = {
		device_received: {
			subject: "Đã tiếp nhận thiết bị",
			message:
				"Chúng tôi đã tiếp nhận thiết bị {device_info} của bạn. Mã phiếu: {ticket_code}. Chúng tôi sẽ liên hệ với bạn trong 24h tới để thông báo tình trạng.",
		},
		preliminary_inspection: {
			subject: "Đang kiểm tra thiết bị",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đang được kiểm tra sơ bộ. Chúng tôi sẽ có báo cáo chi tiết trong vòng 2-4 giờ.",
		},
		awaiting_repair_plan: {
			subject: "Báo giá sửa chữa",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) cần sửa chữa với chi phí ước tính {estimated_cost}. Vui lòng liên hệ để xác nhận.",
		},
		approved_for_repair: {
			subject: "Đã xác nhận sửa chữa",
			message:
				"Đã xác nhận sửa chữa thiết bị {device_info} (Mã: {ticket_code}). Quá trình sửa chữa sẽ bắt đầu ngay hôm nay.",
		},
		waiting_parts: {
			subject: "Đang chờ linh kiện",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đang chờ linh kiện. Thời gian dự kiến: {estimated_days} ngày.",
		},
		in_diagnosis: {
			subject: "Đang chẩn đoán",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đang được chẩn đoán chi tiết. Chúng tôi sẽ cập nhật khi có kết quả.",
		},
		in_repair: {
			subject: "Đang sửa chữa",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đang được sửa chữa. Tiến độ hiện tại: {progress}%.",
		},
		quality_testing: {
			subject: "Kiểm tra chất lượng",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đã sửa xong và đang kiểm tra chất lượng cuối cùng.",
		},
		ready_for_pickup: {
			subject: "Sẵn sàng nhận máy",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đã sửa xong. Vui lòng đến nhận máy tại cửa hàng. Tổng chi phí: {final_cost}.",
		},
		delivered: {
			subject: "Đã giao thiết bị",
			message:
				"Cảm ơn bạn đã sử dụng dịch vụ. Thiết bị {device_info} (Mã: {ticket_code}) đã được giao thành công.",
		},
		payment_pending: {
			subject: "Chờ thanh toán",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đã giao. Vui lòng thanh toán số tiền còn lại: {remaining_amount}.",
		},
		completed: {
			subject: "Hoàn thành dịch vụ",
			message:
				"Dịch vụ sửa chữa thiết bị {device_info} (Mã: {ticket_code}) đã hoàn thành. Cảm ơn bạn đã tin tưởng!",
		},
		cancelled_by_customer: {
			subject: "Đã hủy dịch vụ",
			message:
				"Dịch vụ sửa chữa thiết bị {device_info} (Mã: {ticket_code}) đã được hủy theo yêu cầu.",
		},
		on_hold: {
			subject: "Tạm dừng sửa chữa",
			message:
				"Quá trình sửa chữa thiết bị {device_info} (Mã: {ticket_code}) tạm dừng. Lý do: {hold_reason}.",
		},
		warranty_claim: {
			subject: "Bảo hành thiết bị",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đang được xử lý theo chế độ bảo hành.",
		},
		abandoned: {
			subject: "Nhắc nhở nhận máy",
			message:
				"Thiết bị {device_info} (Mã: {ticket_code}) đã sẵn sàng từ lâu. Vui lòng liên hệ để nhận máy.",
		},
	};

	// Send notification for status change
	const sendStatusNotification = useCallback(
		async (
			ticketId: string,
			newState: RepairState,
			ticketData: {
				ticket_code: string;
				customer_phone: string;
				device_info: string;
				estimated_cost?: number;
				final_cost?: number;
				estimated_days?: number;
				progress?: number;
				hold_reason?: string;
				remaining_amount?: number;
			},
		): Promise<{
			success: boolean;
			notification_id?: string;
			error?: string;
		}> => {
			try {
				setLoading(true);
				setError(null);

				// Get template for this state
				const template = defaultTemplates[newState];
				if (!template) {
					return { success: false, error: "Không tìm thấy template thông báo" };
				}

				// Replace placeholders in message
				let message = template.message;
				Object.entries(ticketData).forEach(([key, value]) => {
					const placeholder = `{${key}}`;
					message = message.replace(
						new RegExp(placeholder, "g"),
						String(value || ""),
					);
				});

				// Format currency values
				message = message.replace(
					/\{estimated_cost\}/g,
					ticketData.estimated_cost
						? formatCurrency(ticketData.estimated_cost)
						: "Đang ước tính",
				);
				message = message.replace(
					/\{final_cost\}/g,
					ticketData.final_cost
						? formatCurrency(ticketData.final_cost)
						: "Đang tính toán",
				);
				message = message.replace(
					/\{remaining_amount\}/g,
					ticketData.remaining_amount
						? formatCurrency(ticketData.remaining_amount)
						: "0đ",
				);

				// Insert notification record
				const { data: notification, error: insertError } = await supabase
					.from("customer_notifications")
					.insert({
						ticket_id: ticketId,
						customer_phone: ticketData.customer_phone,
						message,
						notification_type: `status_${newState}`,
						delivery_status: "pending",
						sent_at: new Date().toISOString(),
						metadata: {
							state: newState,
							template_used: template.subject,
							auto_generated: true,
						},
					})
					.select("id")
					.single();

				if (insertError) throw insertError;

				// Here you would integrate with actual SMS/notification service
				// For now, we'll mark as sent immediately
				await markNotificationAsDelivered(notification.id);

				return { success: true, notification_id: notification.id };
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Lỗi gửi thông báo";
				setError(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Send custom notification
	const sendCustomNotification = useCallback(
		async (
			customerPhone: string,
			message: string,
			notificationType = "custom",
			ticketId?: string,
		): Promise<{
			success: boolean;
			notification_id?: string;
			error?: string;
		}> => {
			try {
				setLoading(true);

				const { data: notification, error: insertError } = await supabase
					.from("customer_notifications")
					.insert({
						ticket_id: ticketId,
						customer_phone: customerPhone,
						message,
						notification_type: notificationType,
						delivery_status: "pending",
						sent_at: new Date().toISOString(),
						metadata: {
							auto_generated: false,
							custom_message: true,
						},
					})
					.select("id")
					.single();

				if (insertError) throw insertError;

				// Mock delivery (integrate with real service)
				await markNotificationAsDelivered(notification.id);

				return { success: true, notification_id: notification.id };
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Lỗi gửi thông báo";
				setError(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Mark notification as delivered
	const markNotificationAsDelivered = useCallback(
		async (notificationId: string) => {
			try {
				const { error } = await supabase
					.from("customer_notifications")
					.update({
						delivery_status: "delivered",
						delivered_at: new Date().toISOString(),
					})
					.eq("id", notificationId);

				if (error) throw error;

				// Update local state
				setNotifications((prev) =>
					prev.map((notif) =>
						notif.id === notificationId
							? {
									...notif,
									delivery_status: "delivered",
									delivered_at: new Date().toISOString(),
								}
							: notif,
					),
				);
			} catch (err) {
				console.error("Error marking notification as delivered:", err);
			}
		},
		[],
	);

	// Mark notification as failed
	const markNotificationAsFailed = useCallback(
		async (notificationId: string, errorMessage: string) => {
			try {
				const { error } = await supabase
					.from("customer_notifications")
					.update({
						delivery_status: "failed",
						error_message: errorMessage,
					})
					.eq("id", notificationId);

				if (error) throw error;

				setNotifications((prev) =>
					prev.map((notif) =>
						notif.id === notificationId
							? {
									...notif,
									delivery_status: "failed",
									error_message: errorMessage,
								}
							: notif,
					),
				);
			} catch (err) {
				console.error("Error marking notification as failed:", err);
			}
		},
		[],
	);

	// Load notifications
	const loadNotifications = useCallback(
		async (filters?: {
			ticket_id?: string;
			customer_phone?: string;
			delivery_status?: string;
			limit?: number;
		}) => {
			try {
				setLoading(true);

				let query = supabase
					.from("customer_notifications")
					.select("*")
					.order("sent_at", { ascending: false });

				if (filters?.ticket_id) {
					query = query.eq("ticket_id", filters.ticket_id);
				}
				if (filters?.customer_phone) {
					query = query.eq("customer_phone", filters.customer_phone);
				}
				if (filters?.delivery_status) {
					query = query.eq("delivery_status", filters.delivery_status);
				}
				if (filters?.limit) {
					query = query.limit(filters.limit);
				}

				const { data, error } = await query;

				if (error) throw error;
				setNotifications(data || []);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Lỗi tải thông báo";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Get notification statistics
	const getNotificationStats = useCallback(
		async (dateRange?: {
			start: string;
			end: string;
		}): Promise<NotificationStats | null> => {
			try {
				let query = supabase
					.from("customer_notifications")
					.select("delivery_status, sent_at, delivered_at");

				if (dateRange) {
					query = query
						.gte("sent_at", dateRange.start)
						.lte("sent_at", dateRange.end);
				}

				const { data, error } = await query;

				if (error) throw error;

				const notifications = data || [];
				const total_sent = notifications.length;
				const delivered = notifications.filter(
					(n) => n.delivery_status === "delivered",
				).length;
				const failed = notifications.filter(
					(n) => n.delivery_status === "failed",
				).length;
				const pending = notifications.filter(
					(n) => n.delivery_status === "pending",
				).length;
				const delivery_rate =
					total_sent > 0 ? (delivered / total_sent) * 100 : 0;

				// Calculate average delivery time
				const deliveredNotifications = notifications.filter(
					(n) => n.delivery_status === "delivered" && n.delivered_at,
				);
				const avg_delivery_time =
					deliveredNotifications.length > 0
						? deliveredNotifications.reduce((sum, n) => {
								const sent = new Date(n.sent_at);
								const delivered = new Date(n.delivered_at);
								return sum + (delivered.getTime() - sent.getTime());
							}, 0) /
							deliveredNotifications.length /
							1000 // seconds
						: 0;

				const stats: NotificationStats = {
					total_sent,
					delivered,
					failed,
					pending,
					delivery_rate,
					avg_delivery_time,
				};

				setStats(stats);
				return stats;
			} catch (err) {
				console.error("Error getting notification stats:", err);
				return null;
			}
		},
		[],
	);

	// Format currency in Vietnamese format
	const formatCurrency = (amount: number): string => {
		return `${amount.toLocaleString("vi-VN")}đ`;
	};

	// Check if customer can receive notifications
	const canSendNotification = useCallback(
		(customerPhone: string): boolean => {
			const customerPrefs = preferences.find(
				(p) => p.customer_phone === customerPhone,
			);

			if (!customerPrefs) {
				return true; // Default to allowing notifications
			}

			// Check time preferences
			const now = new Date();
			const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

			if (
				customerPrefs.preferred_time_start &&
				customerPrefs.preferred_time_end
			) {
				if (
					currentTime < customerPrefs.preferred_time_start ||
					currentTime > customerPrefs.preferred_time_end
				) {
					return false;
				}
			}

			return customerPrefs.sms_enabled;
		},
		[preferences],
	);

	// Get notification preview
	const getNotificationPreview = useCallback(
		(state: RepairState, ticketData: Record<string, unknown>): string => {
			const template = defaultTemplates[state];
			if (!template) return "";

			let message = template.message;
			Object.entries(ticketData).forEach(([key, value]) => {
				const placeholder = `{${key}}`;
				message = message.replace(
					new RegExp(placeholder, "g"),
					String(value || ""),
				);
			});

			return message;
		},
		[],
	);

	return {
		// Data
		notifications,
		templates,
		preferences,
		stats,
		loading,
		error,

		// Notification operations
		sendStatusNotification,
		sendCustomNotification,
		markNotificationAsDelivered,
		markNotificationAsFailed,

		// Data loading
		loadNotifications,

		// Analytics
		getNotificationStats,

		// Utilities
		canSendNotification,
		getNotificationPreview,
		formatCurrency,
		defaultTemplates,
	};
}
