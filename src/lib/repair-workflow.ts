import type { Database } from "@/lib/supabase";

// Database types
type RepairStatus = Database["public"]["Enums"]["repair_status"];
// Note: Priority system has been simplified - no priority enum in new schema
type RepairPriority = "low" | "normal" | "high" | "urgent";

// Repair workflow state machine
export interface RepairWorkflowState {
	status: RepairStatus;
	allowedTransitions: RepairStatus[];
	requiredFields?: string[];
	autoActions?: string[];
	userMessage: string;
	technicalDescription: string;
}

// Complete repair workflow state machine
export const REPAIR_WORKFLOW: Record<RepairStatus, RepairWorkflowState> = {
	device_received: {
		status: "device_received",
		allowedTransitions: ["preliminary_inspection", "cancelled_by_customer"],
		requiredFields: [
			"customer_id",
			"device_type",
			"device_model",
			"issue_description",
		],
		autoActions: ["generate_ticket_number", "log_status_change"],
		userMessage: "Phiếu đã được tiếp nhận và đang chờ chẩn đoán",
		technicalDescription: "Initial state when repair request is received",
	},
	preliminary_inspection: {
		status: "preliminary_inspection",
		allowedTransitions: ["awaiting_repair_plan", "cannot_repair"],
		requiredFields: ["diagnosis", "estimated_cost"],
		autoActions: ["log_status_change", "notify_customer_estimate"],
		userMessage: "Đã chẩn đoán xong, chờ xác nhận sửa chữa",
		technicalDescription: "Diagnosis completed, waiting for customer approval",
	},
	waiting_parts: {
		status: "waiting_parts",
		allowedTransitions: ["in_repair", "cancelled_by_customer"],
		requiredFields: ["required_parts"],
		autoActions: [
			"log_status_change",
			"notify_customer_delay",
			"check_parts_availability",
		],
		userMessage: "Đang chờ linh kiện để tiến hành sửa chữa",
		technicalDescription: "Waiting for required parts to arrive",
	},
	in_repair: {
		status: "in_repair",
		allowedTransitions: ["quality_testing", "waiting_parts", "repair_failed"],
		requiredFields: ["technician_id"],
		autoActions: [
			"log_status_change",
			"notify_customer_progress",
			"start_timer",
			"update_parts_cost",
		],
		userMessage: "Đang trong quá trình sửa chữa",
		technicalDescription: "Actively being repaired by technician",
	},
	quality_testing: {
		status: "quality_testing",
		allowedTransitions: ["ready_for_pickup", "repair_failed"],
		requiredFields: ["actual_cost", "work_performed", "completed_at"],
		autoActions: [
			"log_status_change",
			"calculate_final_cost",
			"update_parts_cost",
			"quality_check",
		],
		userMessage: "Sửa chữa hoàn tất, đang chuẩn bị giao hàng",
		technicalDescription: "Repair work completed, ready for quality check",
	},
	ready_for_pickup: {
		status: "ready_for_pickup",
		allowedTransitions: ["completed", "customer_no_show"],
		autoActions: [
			"log_status_change",
			"notify_customer_ready",
			"prepare_invoice",
		],
		userMessage: "Thiết bị đã sẵn sàng để khách hàng nhận",
		technicalDescription: "Ready for customer pickup",
	},
	completed: {
		status: "completed",
		allowedTransitions: [],
		requiredFields: ["delivered_at", "delivered_to"],
		autoActions: ["log_status_change", "close_ticket", "request_feedback"],
		userMessage: "Đã giao thiết bị cho khách hàng",
		technicalDescription: "Final state - device delivered to customer",
	},
	cancelled_by_customer: {
		status: "cancelled_by_customer",
		allowedTransitions: [],
		requiredFields: ["cancellation_reason"],
		autoActions: [
			"log_status_change",
			"refund_deposit",
			"notify_customer_cancellation",
		],
		userMessage: "Phiếu sửa chữa đã bị hủy",
		technicalDescription: "Repair cancelled at any stage",
	},
	awaiting_repair_plan: {
		status: "awaiting_repair_plan",
		allowedTransitions: ["approved_for_repair", "cancelled_by_customer"],
		requiredFields: ["repair_plan", "estimated_cost"],
		autoActions: ["log_status_change", "notify_customer_plan"],
		userMessage: "Đang chờ khách hàng xác nhận phương án sửa chữa",
		technicalDescription: "Waiting for customer approval of repair plan",
	},
	approved_for_repair: {
		status: "approved_for_repair",
		allowedTransitions: ["in_diagnosis", "waiting_parts", "in_repair"],
		requiredFields: ["customer_approval"],
		autoActions: ["log_status_change"],
		userMessage: "Khách hàng đã xác nhận sửa chữa",
		technicalDescription: "Customer approved repair plan",
	},
	in_diagnosis: {
		status: "in_diagnosis",
		allowedTransitions: ["waiting_parts", "in_repair", "cannot_repair"],
		autoActions: ["log_status_change"],
		userMessage: "Đang chẩn đoán chi tiết",
		technicalDescription: "Detailed diagnosis in progress",
	},
	cannot_repair: {
		status: "cannot_repair",
		allowedTransitions: ["ready_for_return"],
		requiredFields: ["cannot_repair_reason"],
		autoActions: ["log_status_change", "notify_customer_cannot_repair"],
		userMessage: "Không thể sửa chữa thiết bị",
		technicalDescription: "Device cannot be repaired",
	},
	repair_failed: {
		status: "repair_failed",
		allowedTransitions: ["in_repair", "cannot_repair"],
		requiredFields: ["failure_reason"],
		autoActions: ["log_status_change"],
		userMessage: "Sửa chữa gặp khó khăn",
		technicalDescription: "Repair encountered issues",
	},
	customer_no_show: {
		status: "customer_no_show",
		allowedTransitions: ["ready_for_pickup", "abandoned"],
		autoActions: ["log_status_change", "notify_customer_reminder"],
		userMessage: "Chờ khách hàng liên hệ",
		technicalDescription: "Customer has not picked up device",
	},
	ready_for_return: {
		status: "ready_for_return",
		allowedTransitions: ["completed", "abandoned"],
		autoActions: ["log_status_change"],
		userMessage: "Sẵn sàng trả máy",
		technicalDescription: "Device ready to be returned",
	},
	abandoned: {
		status: "abandoned",
		allowedTransitions: [],
		autoActions: ["log_status_change", "dispose_device"],
		userMessage: "Liên hệ để nhận máy",
		technicalDescription: "Device abandoned by customer",
	},
};

// Priority levels with business rules
export const PRIORITY_LEVELS: Record<
	RepairPriority,
	{
		label: string;
		color: string;
		maxDays: number;
		requiredApproval: boolean;
		description: string;
	}
> = {
	low: {
		label: "Thấp",
		color: "text-gray-600",
		maxDays: 14,
		requiredApproval: false,
		description: "Sửa chữa thông thường, không cấp bách",
	},
	normal: {
		label: "Bình thường",
		color: "text-blue-600",
		maxDays: 7,
		requiredApproval: false,
		description: "Sửa chữa ưu tiên trung bình",
	},
	high: {
		label: "Cao",
		color: "text-orange-600",
		maxDays: 3,
		requiredApproval: true,
		description: "Cần hoàn thành trong thời gian ngắn",
	},
	urgent: {
		label: "Khẩn cấp",
		color: "text-red-600",
		maxDays: 1,
		requiredApproval: true,
		description: "Cần xử lý ngay lập tức",
	},
};

// Workflow validation functions
export class RepairWorkflowValidator {
	static canTransitionTo(
		currentStatus: RepairStatus,
		targetStatus: RepairStatus,
	): boolean {
		const currentState = REPAIR_WORKFLOW[currentStatus];
		return currentState.allowedTransitions.includes(targetStatus);
	}

	static getRequiredFields(status: RepairStatus): string[] {
		return REPAIR_WORKFLOW[status].requiredFields || [];
	}

	static validateTransition(
		currentStatus: RepairStatus,
		targetStatus: RepairStatus,
		repairData: any,
	): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Check if transition is allowed
		if (!RepairWorkflowValidator.canTransitionTo(currentStatus, targetStatus)) {
			errors.push(`Không thể chuyển từ ${currentStatus} sang ${targetStatus}`);
		}

		// Check required fields for target status
		const requiredFields =
			RepairWorkflowValidator.getRequiredFields(targetStatus);
		for (const field of requiredFields) {
			if (!repairData[field] || repairData[field] === "") {
				errors.push(
					`Trường ${field} là bắt buộc cho trạng thái ${targetStatus}`,
				);
			}
		}

		// Business rule validations
		if (targetStatus === "in_repair" && !repairData.technician_id) {
			errors.push("Phải phân công kỹ thuật viên trước khi bắt đầu sửa chữa");
		}

		if (targetStatus === "completed" && !repairData.work_performed) {
			errors.push("Phải mô tả công việc đã thực hiện");
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	static getNextPossibleStatuses(currentStatus: RepairStatus): RepairStatus[] {
		return REPAIR_WORKFLOW[currentStatus].allowedTransitions;
	}

	static getStatusDisplayInfo(status: RepairStatus) {
		const state = REPAIR_WORKFLOW[status];
		return {
			status,
			label: RepairWorkflowValidator.getVietnameseStatusLabel(status),
			message: state.userMessage,
			technical: state.technicalDescription,
			nextSteps: state.allowedTransitions,
		};
	}

	private static getVietnameseStatusLabel(status: RepairStatus): string {
		const labels: Record<RepairStatus, string> = {
			device_received: "Đã tiếp nhận thiết bị",
			preliminary_inspection: "Đang kiểm tra ban đầu",
			awaiting_repair_plan: "Chờ xác nhận phương án sửa chữa",
			approved_for_repair: "Đã xác nhận sửa chữa",
			in_diagnosis: "Đang chẩn đoán chi tiết",
			waiting_parts: "Đang đặt hàng linh kiện",
			in_repair: "Đang thực hiện sửa chữa",
			quality_testing: "Đang kiểm tra chất lượng",
			ready_for_pickup: "Sẵn sàng nhận máy",
			completed: "Đã hoàn thành",
			cannot_repair: "Không thể sửa chữa",
			cancelled_by_customer: "Đã hủy sửa chữa",
			repair_failed: "Sửa chữa gặp khó khăn",
			customer_no_show: "Chờ khách hàng liên hệ",
			ready_for_return: "Sẵn sàng trả máy",
			abandoned: "Liên hệ để nhận máy",
		};
		return labels[status];
	}
}

// Auto-actions executor
export class RepairWorkflowActions {
	static async executeAutoActions(
		status: RepairStatus,
		repairId: string,
		repairData: any,
		userId: string,
	): Promise<void> {
		const actions = REPAIR_WORKFLOW[status].autoActions || [];

		for (const action of actions) {
			try {
				await RepairWorkflowActions.executeAction(
					action,
					repairId,
					repairData,
					userId,
				);
			} catch (error) {
				console.error(`Failed to execute auto action ${action}:`, error);
				// Continue with other actions even if one fails
			}
		}
	}

	private static async executeAction(
		action: string,
		repairId: string,
		repairData: any,
		userId: string,
	): Promise<void> {
		switch (action) {
			case "generate_ticket_number":
				// Implemented separately in ticket number generator
				break;
			case "log_status_change":
				await RepairWorkflowActions.logStatusChange(
					repairId,
					repairData,
					userId,
				);
				break;
			case "notify_customer_estimate":
			case "notify_customer_delay":
			case "notify_customer_progress":
			case "notify_customer_ready":
			case "notify_customer_cancellation":
				await RepairWorkflowActions.sendCustomerNotification(
					action,
					repairData,
				);
				break;
			case "check_parts_availability":
				await RepairWorkflowActions.checkPartsAvailability(repairData);
				break;
			case "start_timer":
				await RepairWorkflowActions.startRepairTimer(repairId);
				break;
			case "calculate_final_cost":
				await RepairWorkflowActions.calculateFinalCost(repairId, repairData);
				break;
			case "update_parts_cost":
				await RepairWorkflowActions.updatePartsCost(repairId, repairData);
				break;
			case "quality_check":
				await RepairWorkflowActions.scheduleQualityCheck(repairId);
				break;
			case "prepare_invoice":
				await RepairWorkflowActions.prepareInvoice(repairId, repairData);
				break;
			case "close_ticket":
				await RepairWorkflowActions.closeTicket(repairId);
				break;
			case "request_feedback":
				await RepairWorkflowActions.requestCustomerFeedback(repairData);
				break;
			case "refund_deposit":
				await RepairWorkflowActions.processRefund(repairId, repairData);
				break;
		}
	}

	private static async logStatusChange(
		repairId: string,
		repairData: any,
		userId: string,
	): Promise<void> {
		const { supabase } = await import("@/lib/supabase");

		const { error } = await supabase.from("repair_status_logs").insert({
			repair_id: repairId,
			old_status: repairData.previousStatus || null,
			new_status: repairData.status,
			notes:
				repairData.notes ||
				REPAIR_WORKFLOW[repairData.status as RepairStatus].userMessage,
			changed_by: userId,
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.error("Failed to log status change:", error);
		}
	}

	private static async sendCustomerNotification(
		action: string,
		repairData: any,
	): Promise<void> {
		// Implementation will be in notification system
		console.log(`Sending notification ${action} for repair`, repairData);
	}

	private static async checkPartsAvailability(repairData: any): Promise<void> {
		// Implementation will be in parts management system
		console.log("Checking parts availability for repair", repairData);
	}

	private static async startRepairTimer(repairId: string): Promise<void> {
		// Implementation will track repair time
		console.log(`Starting timer for repair ${repairId}`);
	}

	private static async calculateFinalCost(
		repairId: string,
		repairData: any,
	): Promise<void> {
		// Implementation will calculate final cost including parts and labor
		console.log(`Calculating final cost for repair ${repairId}`, repairData);
	}

	private static async scheduleQualityCheck(repairId: string): Promise<void> {
		// Implementation will schedule quality assurance
		console.log(`Scheduling quality check for repair ${repairId}`);
	}

	private static async prepareInvoice(
		repairId: string,
		repairData: any,
	): Promise<void> {
		// Implementation will generate invoice
		console.log(`Preparing invoice for repair ${repairId}`, repairData);
	}

	private static async closeTicket(repairId: string): Promise<void> {
		// Implementation will close the ticket
		console.log(`Closing ticket for repair ${repairId}`);
	}

	private static async requestCustomerFeedback(repairData: any): Promise<void> {
		// Implementation will request customer feedback
		console.log("Requesting feedback for repair", repairData);
	}

	private static async processRefund(
		repairId: string,
		repairData: any,
	): Promise<void> {
		// Implementation will process refund
		console.log(`Processing refund for repair ${repairId}`, repairData);
	}

	private static async updatePartsCost(
		repairId: string,
		_repairData: any,
	): Promise<void> {
		try {
			const { supabase } = await import("@/lib/supabase");

			// Calculate total parts cost
			const { data: partsCosts, error } = await supabase
				.from("repair_parts")
				.select("total_cost")
				.eq("repair_id", repairId);

			if (error) {
				console.error("Failed to calculate parts cost:", error);
				return;
			}

			const totalPartsCost = (partsCosts || []).reduce(
				(sum, item) => sum + (item.total_cost || 0),
				0,
			);

			// Update repair with parts cost
			const { error: updateError } = await supabase
				.from("repairs")
				.update({
					parts_cost: totalPartsCost,
					updated_at: new Date().toISOString(),
				})
				.eq("id", repairId);

			if (updateError) {
				console.error("Failed to update parts cost:", updateError);
			}

			console.log(
				`Updated parts cost for repair ${repairId}: ${totalPartsCost}`,
			);
		} catch (error) {
			console.error("Error in updatePartsCost:", error);
		}
	}
}

// Ticket number generator
export class TicketNumberGenerator {
	static async generateTicketNumber(locationCode = "TNL"): Promise<string> {
		const { supabase } = await import("@/lib/supabase");

		const today = new Date();
		const year = today.getFullYear().toString().slice(-2);
		const month = (today.getMonth() + 1).toString().padStart(2, "0");
		const day = today.getDate().toString().padStart(2, "0");

		// Format: TNL-240121-001 (LocationCode-YYMMDD-Sequential)
		const datePrefix = `${locationCode}-${year}${month}${day}`;

		// Query for the last ticket number for today
		const { data: lastTicket, error } = await supabase
			.from("repairs")
			.select("ticket_number")
			.like("ticket_number", `${datePrefix}%`)
			.order("ticket_number", { ascending: false })
			.limit(1)
			.single();

		let sequence = 1;

		if (!error && lastTicket?.ticket_number) {
			// Extract sequence number from last ticket
			const parts = lastTicket.ticket_number.split("-");
			if (parts.length === 3) {
				const lastSequence = Number.parseInt(parts[2], 10);
				if (!Number.isNaN(lastSequence)) {
					sequence = lastSequence + 1;
				}
			}
		}

		const sequenceStr = sequence.toString().padStart(3, "0");
		return `${datePrefix}-${sequenceStr}`;
	}

	static isValidTicketNumber(ticketNumber: string): boolean {
		const pattern = /^[A-Z]{2,4}-\d{6}-\d{3,4}$/;
		return pattern.test(ticketNumber);
	}
}
