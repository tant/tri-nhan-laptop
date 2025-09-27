/**
 * Repair Tickets Table Configuration
 * Reusable table column definitions and cell renderers for repair tickets
 */

import { AssignTechnicianDropdown } from "@/components/tickets/AssignTechnicianDropdown";
import { StatusChangeDropdown } from "@/components/tickets/StatusChangeDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Customer, RepairTicket, UserProfile } from "@/lib/database-types";
import { DateTime } from "@/lib/formatting";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye } from "lucide-react";
import { memo } from "react";

// Static mappings for performance
export const STATUS_MAP = {
	device_received: { label: "Tiếp nhận thiết bị", variant: "outline" as const },
	preliminary_inspection: { label: "Kiểm tra sơ bộ", variant: "secondary" as const },
	awaiting_repair_plan: { label: "Chờ phương án sửa chữa", variant: "secondary" as const },
	approved_for_repair: { label: "Đã phê duyệt sửa chữa", variant: "default" as const },
	in_diagnosis: { label: "Đang chẩn đoán", variant: "default" as const },
	waiting_parts: { label: "Chờ linh kiện", variant: "destructive" as const },
	in_repair: { label: "Đang sửa chữa", variant: "default" as const },
	quality_testing: { label: "Kiểm tra chất lượng", variant: "default" as const },
	ready_for_pickup: { label: "Sẵn sàng nhận", variant: "default" as const },
	completed: { label: "Hoàn thành", variant: "default" as const },
	cannot_repair: { label: "Không thể sửa", variant: "destructive" as const },
	cancelled_by_customer: { label: "Khách hàng hủy", variant: "destructive" as const },
	repair_failed: { label: "Sửa chữa thất bại", variant: "destructive" as const },
	customer_no_show: { label: "Khách không đến", variant: "destructive" as const },
	ready_for_return: { label: "Sẵn sàng trả", variant: "outline" as const },
	abandoned: { label: "Bỏ qua", variant: "destructive" as const },
} as const;

export const PRIORITY_MAP = {
	low: { label: "Thấp", variant: "outline" as const },
	normal: { label: "Bình thường", variant: "secondary" as const },
	high: { label: "Cao", variant: "destructive" as const },
	urgent: { label: "Khẩn cấp", variant: "destructive" as const },
} as const;

// Memoized badge components
export const StatusBadge = memo(function StatusBadge({
	status
}: {
	status: RepairTicket["status"]
}) {
	const statusInfo = STATUS_MAP[status] || { label: status, variant: "outline" as const };
	return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
});

export const PriorityBadge = memo(function PriorityBadge({
	priority
}: {
	priority: string
}) {
	const priorityInfo = PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP] || {
		label: priority,
		variant: "outline" as const
	};
	return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
});

// Combined type for repair with related data
export type RepairWithDetails = RepairTicket & {
	customer: Customer;
	technician: UserProfile | null;
	ticket_number?: string;
};

// Format currency for Vietnamese locale
const formatCurrency = (amount: number | null) => {
	if (!amount) return "Chưa định giá";
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(amount);
};

// Use centralized date formatting
const formatDate = DateTime.formatDate;

export interface RepairTicketsTableProps {
	onStatusChange: (ticketId: string, newStatus: RepairTicket["status"]) => Promise<void>;
	onTechnicianChange: (ticketId: string, technicianId: string) => Promise<void>;
	isProcessing?: (ticketId: string) => boolean;
}

/**
 * Create table column definitions for repair tickets
 */
export function createRepairTicketsColumns({
	onStatusChange,
	onTechnicianChange,
	isProcessing = () => false,
}: RepairTicketsTableProps): ColumnDef<RepairWithDetails>[] {
	const navigate = useNavigate();

	return [
		{
			accessorKey: "ticket_code",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Mã phiếu
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-mono text-sm">{row.getValue("ticket_code")}</div>
			),
		},
		{
			accessorKey: "customer",
			header: "Khách hàng",
			cell: ({ row }) => {
				const customer = row.getValue("customer") as Customer;
				return (
					<div className="space-y-1">
						<div className="font-medium">{customer.full_name}</div>
						<div className="text-sm text-muted-foreground">{customer.phone}</div>
					</div>
				);
			},
		},
		{
			accessorKey: "issue_description",
			header: "Vấn đề",
			cell: ({ row }) => (
				<div className="max-w-[200px] truncate">
					{row.getValue("issue_description")}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Trạng thái
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const repair = row.original;
				return (
					<StatusChangeDropdown
						ticketId={repair.id}
						currentStatus={repair.status}
						onStatusChange={onStatusChange}
						disabled={isProcessing(repair.id)}
					/>
				);
			},
		},
		{
			accessorKey: "priority",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Ưu tiên
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
		},
		{
			accessorKey: "technician",
			header: "Kỹ thuật viên",
			cell: ({ row }) => {
				const repair = row.original;
				return (
					<AssignTechnicianDropdown
						ticketId={repair.id}
						currentTechnicianId={repair.assigned_technician_id}
						onTechnicianChange={onTechnicianChange}
						disabled={isProcessing(repair.id)}
					/>
				);
			},
		},
		{
			accessorKey: "estimated_cost",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Chi phí dự kiến
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="text-right font-mono">
					{formatCurrency(row.getValue("estimated_cost"))}
				</div>
			),
		},
		{
			accessorKey: "created_at",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Ngày tạo
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="text-sm">{formatDate(row.getValue("created_at"))}</div>
			),
		},
		{
			id: "actions",
			header: "Thao tác",
			cell: ({ row }) => {
				const repair = row.original;
				return (
					<div className="flex space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate({ to: `/phieu/${repair.id}` })}
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate({ to: `/phieu/${repair.id}/edit` })}
						>
							<Edit className="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	];
}

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
	return PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP] || {
		label: priority,
		variant: "outline" as const
	};
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