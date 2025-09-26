/**
 * Simple Repair Status Utilities
 * Vietnamese status labels for repair tickets
 */

import type { RepairStatus } from "@/lib/database-types";

// Re-export for convenience
export type { RepairStatus };

// Simple status label mapping (Vietnamese)
export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
	device_received: "Tiếp nhận thiết bị",
	preliminary_inspection: "Kiểm tra sơ bộ",
	awaiting_repair_plan: "Chờ phương án sửa chữa",
	approved_for_repair: "Đã phê duyệt sửa chữa",
	in_diagnosis: "Đang chẩn đoán",
	waiting_parts: "Chờ linh kiện",
	in_repair: "Đang sửa chữa",
	quality_testing: "Kiểm tra chất lượng",
	ready_for_pickup: "Sẵn sàng nhận",
	completed: "Hoàn thành",
	cannot_repair: "Không thể sửa",
	cancelled_by_customer: "Khách hàng hủy",
	repair_failed: "Sửa chữa thất bại",
	customer_no_show: "Khách không đến",
	ready_for_return: "Sẵn sàng trả",
	abandoned: "Bỏ qua",
};

// Helper function to get status label
export function getRepairStatusLabel(status: RepairStatus): string {
	return REPAIR_STATUS_LABELS[status] || status;
}