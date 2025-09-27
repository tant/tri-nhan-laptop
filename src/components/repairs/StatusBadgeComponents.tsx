/**
 * Status Badge Components
 * Reusable status and priority badge components for repair tickets
 */

import { Badge } from "@/components/ui/badge";
import type { RepairTicket } from "@/lib/database-types";
import { memo } from "react";

// Status mapping with Vietnamese labels and badge variants
export const STATUS_MAP = {
	device_received: { label: "Tiếp nhận thiết bị", variant: "outline" as const },
	preliminary_inspection: {
		label: "Kiểm tra sơ bộ",
		variant: "secondary" as const,
	},
	awaiting_repair_plan: {
		label: "Chờ phương án sửa chữa",
		variant: "secondary" as const,
	},
	approved_for_repair: {
		label: "Đã phê duyệt sửa chữa",
		variant: "default" as const,
	},
	in_diagnosis: { label: "Đang chẩn đoán", variant: "default" as const },
	waiting_parts: { label: "Chờ linh kiện", variant: "destructive" as const },
	in_repair: { label: "Đang sửa chữa", variant: "default" as const },
	quality_testing: {
		label: "Kiểm tra chất lượng",
		variant: "default" as const,
	},
	ready_for_pickup: { label: "Sẵn sàng nhận", variant: "default" as const },
	completed: { label: "Hoàn thành", variant: "default" as const },
	cannot_repair: { label: "Không thể sửa", variant: "destructive" as const },
	cancelled_by_customer: {
		label: "Khách hàng hủy",
		variant: "destructive" as const,
	},
	repair_failed: {
		label: "Sửa chữa thất bại",
		variant: "destructive" as const,
	},
	customer_no_show: {
		label: "Khách không đến",
		variant: "destructive" as const,
	},
	ready_for_return: { label: "Sẵn sàng trả", variant: "outline" as const },
	abandoned: { label: "Bỏ qua", variant: "destructive" as const },
} as const;

export const PRIORITY_MAP = {
	low: { label: "Thấp", variant: "outline" as const },
	normal: { label: "Bình thường", variant: "secondary" as const },
	high: { label: "Cao", variant: "destructive" as const },
	urgent: { label: "Khẩn cấp", variant: "destructive" as const },
} as const;

/**
 * Memoized status badge component
 */
export const StatusBadge = memo(function StatusBadge({
	status,
}: {
	status: RepairTicket["status"];
}) {
	const statusInfo = STATUS_MAP[status] || {
		label: status,
		variant: "outline" as const,
	};
	return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
});

/**
 * Memoized priority badge component
 */
export const PriorityBadge = memo(function PriorityBadge({
	priority,
}: {
	priority: string;
}) {
	const priorityInfo = PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP] || {
		label: priority,
		variant: "outline" as const,
	};
	return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
});

/**
 * Get status info for a given status
 */
export function getStatusInfo(status: RepairTicket["status"]) {
	return STATUS_MAP[status] || { label: status, variant: "outline" as const };
}

/**
 * Get priority info for a given priority
 */
export function getPriorityInfo(priority: string) {
	return (
		PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP] || {
			label: priority,
			variant: "outline" as const,
		}
	);
}

/**
 * Get all available statuses
 */
export function getAllStatuses() {
	return Object.keys(STATUS_MAP) as RepairTicket["status"][];
}

/**
 * Get all available priorities
 */
export function getAllPriorities() {
	return Object.keys(PRIORITY_MAP);
}

/**
 * Check if status indicates a completed state
 */
export function isCompletedStatus(status: RepairTicket["status"]): boolean {
	return [
		"completed",
		"cannot_repair",
		"cancelled_by_customer",
		"repair_failed",
		"customer_no_show",
		"abandoned",
	].includes(status);
}

/**
 * Check if status indicates an active repair state
 */
export function isActiveStatus(status: RepairTicket["status"]): boolean {
	return ["in_diagnosis", "in_repair", "quality_testing"].includes(status);
}

/**
 * Check if status indicates waiting state
 */
export function isWaitingStatus(status: RepairTicket["status"]): boolean {
	return [
		"waiting_parts",
		"awaiting_repair_plan",
		"ready_for_pickup",
		"ready_for_return",
	].includes(status);
}

/**
 * Get status category for filtering and grouping
 */
export function getStatusCategory(
	status: RepairTicket["status"],
): "initial" | "active" | "waiting" | "completed" {
	if (["device_received", "preliminary_inspection"].includes(status)) {
		return "initial";
	}
	if (isActiveStatus(status)) {
		return "active";
	}
	if (isWaitingStatus(status)) {
		return "waiting";
	}
	if (isCompletedStatus(status)) {
		return "completed";
	}
	return "initial";
}
