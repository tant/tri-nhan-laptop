import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

// Database types
type Repair = Database["public"]["Tables"]["repairs"]["Row"];
type Part = Database["public"]["Tables"]["parts"]["Row"];

export interface NotificationMessage {
  id: string;
  type: "repair_status" | "new_repair" | "low_stock" | "feedback" | "system";
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
}

export interface NotificationState {
  notifications: NotificationMessage[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
}

export function useNotifications(userId?: string) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  });

  // Add a new notification
  const addNotification = useCallback((notification: Omit<NotificationMessage, "id" | "timestamp" | "read">) => {
    const newNotification: NotificationMessage = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1
    }));

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: newNotification.id
      });
    }

    return newNotification.id;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => ({ ...notif, read: true })),
      unreadCount: 0
    }));
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === notificationId);
      return {
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.read ? prev.unreadCount - 1 : prev.unreadCount
      };
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }));
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    const channels: any[] = [];

    // Subscribe to repair status changes
    const repairChannel = supabase
      .channel("repair-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "repairs",
          filter: `status=neq.old_record.status`
        },
        async (payload) => {
          const repair = payload.new as Repair;
          const oldRepair = payload.old as Repair;

          if (repair.status !== oldRepair.status) {
            // Get customer info for notification
            const { data: customer } = await supabase
              .from("customers")
              .select("name, phone")
              .eq("id", repair.customer_id)
              .single();

            addNotification({
              type: "repair_status",
              title: "Cập nhật trạng thái sửa chữa",
              message: `Phiếu ${repair.ticket_number || repair.id.slice(0, 8)} - ${customer?.name}: ${getVietnameseStatus(repair.status)}`,
              data: { repairId: repair.id, customerId: repair.customer_id },
              priority: "normal"
            });
          }
        }
      )
      .subscribe();

    channels.push(repairChannel);

    // Subscribe to new repairs
    const newRepairChannel = supabase
      .channel("new-repair-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "repairs"
        },
        async (payload) => {
          const repair = payload.new as Repair;

          // Get customer info
          const { data: customer } = await supabase
            .from("customers")
            .select("name, phone")
            .eq("id", repair.customer_id)
            .single();

          addNotification({
            type: "new_repair",
            title: "Phiếu sửa chữa mới",
            message: `Khách hàng: ${customer?.name} - ${repair.device_type} ${repair.device_model}`,
            data: { repairId: repair.id },
            priority: "high"
          });
        }
      )
      .subscribe();

    channels.push(newRepairChannel);

    // Subscribe to low stock alerts
    const stockChannel = supabase
      .channel("stock-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "parts",
          filter: "stock_quantity=lte.min_stock_level"
        },
        (payload) => {
          const part = payload.new as Part;

          if (part.stock_quantity <= part.min_stock_level) {
            addNotification({
              type: "low_stock",
              title: "Cảnh báo tồn kho thấp",
              message: `${part.name} chỉ còn ${part.stock_quantity} cái (tối thiểu: ${part.min_stock_level})`,
              data: { partId: part.id },
              priority: part.stock_quantity === 0 ? "urgent" : "high"
            });
          }
        }
      )
      .subscribe();

    channels.push(stockChannel);

    // Subscribe to customer feedback
    const feedbackChannel = supabase
      .channel("feedback-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "customer_feedback"
        },
        async (payload) => {
          const feedback = payload.new as any;

          // Get repair and customer info
          const { data: repair } = await supabase
            .from("repairs")
            .select(`
              ticket_number,
              customer:customers(name)
            `)
            .eq("id", feedback.repair_id)
            .single();

          addNotification({
            type: "feedback",
            title: "Phản hồi khách hàng mới",
            message: `${(repair?.customer as any)?.name} đã đánh giá ${feedback.rating}/5 sao`,
            data: { feedbackId: feedback.id, repairId: feedback.repair_id },
            priority: feedback.rating <= 3 ? "high" : "normal"
          });
        }
      )
      .subscribe();

    channels.push(feedbackChannel);

    // Cleanup subscriptions
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [userId, addNotification]);

  // Check for low stock on mount
  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const { data: lowStockParts, error } = await supabase
          .from("parts")
          .select("*")
          .or("stock_quantity.lte.min_stock_level,stock_quantity.eq.0");

        if (error) throw error;

        if (lowStockParts && lowStockParts.length > 0) {
          // Add notifications for existing low stock items
          lowStockParts.forEach(part => {
            addNotification({
              type: "low_stock",
              title: "Cảnh báo tồn kho thấp",
              message: `${part.name} chỉ còn ${part.stock_quantity} cái (tối thiểu: ${part.min_stock_level})`,
              data: { partId: part.id },
              priority: part.stock_quantity === 0 ? "urgent" : "high"
            });
          });
        }
      } catch (error) {
        console.error("Failed to check low stock:", error);
      }
    };

    if (userId) {
      checkLowStock();
    }
  }, [userId, addNotification]);

  // Helper function to get Vietnamese status
  const getVietnameseStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      received: "Đã tiếp nhận",
      diagnosed: "Đã chẩn đoán",
      waiting_parts: "Chờ linh kiện",
      in_progress: "Đang sửa chữa",
      completed: "Hoàn thành",
      ready_for_pickup: "Sẵn sàng giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy"
    };
    return statusMap[status] || status;
  };

  return {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestNotificationPermission
  };
}