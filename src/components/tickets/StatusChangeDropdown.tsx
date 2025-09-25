import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useState } from "react";

type RepairStatus = Database["public"]["Enums"]["repair_status"];

interface StatusChangeDropdownProps {
	ticketId: string;
	currentStatus: RepairStatus;
	onStatusChange: (newStatus: RepairStatus) => void;
	disabled?: boolean;
}

// Define valid status transitions
const STATUS_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
	device_received: [
		"preliminary_inspection",
		"cannot_repair",
		"cancelled_by_customer",
	],
	preliminary_inspection: [
		"awaiting_repair_plan",
		"cannot_repair",
		"cancelled_by_customer",
	],
	awaiting_repair_plan: [
		"approved_for_repair",
		"cannot_repair",
		"cancelled_by_customer",
	],
	approved_for_repair: ["in_diagnosis", "cancelled_by_customer"],
	in_diagnosis: [
		"waiting_parts",
		"in_repair",
		"cannot_repair",
		"cancelled_by_customer",
	],
	waiting_parts: ["in_repair", "cannot_repair", "cancelled_by_customer"],
	in_repair: ["quality_testing", "repair_failed", "cancelled_by_customer"],
	quality_testing: ["ready_for_pickup", "in_repair", "repair_failed"],
	ready_for_pickup: ["completed", "customer_no_show"],
	completed: [], // Final state
	cannot_repair: ["ready_for_return"],
	cancelled_by_customer: ["abandoned"],
	repair_failed: ["cannot_repair", "in_diagnosis"],
	customer_no_show: ["ready_for_pickup", "abandoned"],
	ready_for_return: ["completed", "abandoned"],
	abandoned: [], // Final state
};

// Status labels in Vietnamese
const STATUS_LABELS: Record<RepairStatus, string> = {
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

// Status badge variants
const STATUS_VARIANTS: Record<
	RepairStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	device_received: "outline",
	preliminary_inspection: "secondary",
	awaiting_repair_plan: "secondary",
	approved_for_repair: "default",
	in_diagnosis: "default",
	waiting_parts: "destructive",
	in_repair: "default",
	quality_testing: "default",
	ready_for_pickup: "default",
	completed: "default",
	cannot_repair: "destructive",
	cancelled_by_customer: "destructive",
	repair_failed: "destructive",
	customer_no_show: "destructive",
	ready_for_return: "outline",
	abandoned: "destructive",
};

export function StatusChangeDropdown({
	ticketId,
	currentStatus,
	onStatusChange,
	disabled = false,
}: StatusChangeDropdownProps) {
	const [isUpdating, setIsUpdating] = useState(false);

	const validNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

	const handleStatusChange = async (newStatus: RepairStatus) => {
		try {
			setIsUpdating(true);

			const updateData: Partial<
				Database["public"]["Tables"]["repair_tickets"]["Update"]
			> = {
				status: newStatus,
				updated_at: new Date().toISOString(),
			};

			// Add completion timestamp for completed status
			if (newStatus === "completed") {
				updateData.repair_completed_at = new Date().toISOString();
			}

			const { error } = await supabase
				.from("repair_tickets")
				.update(updateData)
				.eq("id", ticketId);

			if (error) {
				console.error("Error updating status:", error);
				return;
			}

			// Call parent callback
			onStatusChange(newStatus);
		} catch (error) {
			console.error("Error updating status:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	if (validNextStatuses.length === 0) {
		// No valid transitions available
		return (
			<Button
				variant="ghost"
				size="sm"
				disabled
				title="Không thể chuyển trạng thái"
			>
				<RefreshCw className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					disabled={disabled || isUpdating}
					title="Chuyển trạng thái"
				>
					<RefreshCw
						className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-64">
				<div className="px-3 py-2 text-sm font-medium border-b">
					Chuyển từ:{" "}
					<Badge variant={STATUS_VARIANTS[currentStatus]} className="ml-1">
						{STATUS_LABELS[currentStatus]}
					</Badge>
				</div>
				{validNextStatuses.map((status) => (
					<DropdownMenuItem
						key={status}
						onClick={() => handleStatusChange(status)}
						className="py-3"
					>
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center space-x-2">
								<ArrowRight className="h-4 w-4 text-muted-foreground" />
								<Badge variant={STATUS_VARIANTS[status]}>
									{STATUS_LABELS[status]}
								</Badge>
							</div>
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
