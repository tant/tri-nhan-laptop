/**
 * 16-State Repair Workflow Management System
 * Comprehensive state definitions, transitions, and business rules for Vietnamese laptop repair shop
 */

export type RepairState =
	| "device_received" // 1. Đã nhận thiết bị
	| "preliminary_inspection" // 2. Kiểm tra sơ bộ
	| "awaiting_repair_plan" // 3. Đang lập kế hoạch sửa chữa
	| "approved_for_repair" // 4. Đã duyệt sửa chữa
	| "waiting_parts" // 5. Đang chờ linh kiện
	| "in_diagnosis" // 6. Đang chẩn đoán
	| "in_repair" // 7. Đang sửa chữa
	| "quality_testing" // 8. Kiểm tra chất lượng
	| "ready_for_pickup" // 9. Sẵn sàng giao
	| "delivered" // 10. Đã giao hàng
	| "payment_pending" // 11. Chờ thanh toán
	| "completed" // 12. Hoàn thành
	| "cancelled_by_customer" // 13. Khách hàng hủy
	| "on_hold" // 14. Tạm dừng
	| "warranty_claim" // 15. Bảo hành
	| "abandoned"; // 16. Bỏ lại

export interface RepairStateDefinition {
	id: RepairState;
	label: string;
	description: string;
	color: string;
	category: "active" | "completed" | "cancelled" | "special";
	isTerminal: boolean;
	requiresCustomerApproval: boolean;
	requiresPayment: boolean;
	autoAdvanceAfter?: number; // minutes
	notifyCustomer: boolean;
	allowedRoles: string[];
}

export const REPAIR_STATES: Record<RepairState, RepairStateDefinition> = {
	device_received: {
		id: "device_received",
		label: "Đã nhận thiết bị",
		description: "Đang tiếp nhận thiết bị và ghi nhận thông tin ban đầu",
		color: "blue", // blue
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		autoAdvanceAfter: 30, // Auto advance to inspection after 30 minutes
		notifyCustomer: true,
		allowedRoles: ["receptionist", "technician", "manager", "admin"],
	},
	preliminary_inspection: {
		id: "preliminary_inspection",
		label: "Kiểm tra sơ bộ",
		description: "Đang thực hiện kiểm tra và đánh giá tình trạng thiết bị",
		color: "#F59E0B", // amber
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: false,
		allowedRoles: ["technician", "senior_technician", "manager", "admin"],
	},
	awaiting_repair_plan: {
		id: "awaiting_repair_plan",
		label: "Đang lập kế hoạch sửa chữa",
		description: "Đang xây dựng phương án sửa chữa và ước tính chi phí",
		color: "#8B5CF6", // violet
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: true,
		requiresPayment: false,
		notifyCustomer: true,
		allowedRoles: ["senior_technician", "manager", "admin"],
	},
	approved_for_repair: {
		id: "approved_for_repair",
		label: "Đã duyệt sửa chữa",
		description: "Khách hàng đã xác nhận và thanh toán cọc cho việc sửa chữa",
		color: "#10B981", // emerald
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: true,
		requiresPayment: true,
		notifyCustomer: true,
		allowedRoles: ["manager", "admin", "receptionist"],
	},
	waiting_parts: {
		id: "waiting_parts",
		label: "Đang chờ linh kiện",
		description: "Đang chờ linh kiện thay thế được đặt hàng và giao về",
		color: "#F97316", // orange
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: true,
		allowedRoles: ["inventory_manager", "technician", "manager", "admin"],
	},
	in_diagnosis: {
		id: "in_diagnosis",
		label: "Đang chẩn đoán",
		description:
			"Đang thực hiện chẩn đoán chi tiết và xác định nguyên nhân lỗi",
		color: "#6366F1", // indigo
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: false,
		allowedRoles: ["technician", "senior_technician", "manager", "admin"],
	},
	in_repair: {
		id: "in_repair",
		label: "Đang sửa chữa",
		description: "Đang thực hiện các công việc sửa chữa và thay thế linh kiện",
		color: "orange", // orange
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: true,
		allowedRoles: ["technician", "senior_technician", "manager", "admin"],
	},
	quality_testing: {
		id: "quality_testing",
		label: "Kiểm tra chất lượng",
		description: "Đang thực hiện kiểm tra chất lượng và thử nghiệm chức năng",
		color: "#7C3AED", // purple
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: false,
		allowedRoles: [
			"quality_controller",
			"senior_technician",
			"manager",
			"admin",
		],
	},
	ready_for_pickup: {
		id: "ready_for_pickup",
		label: "Sẵn sàng giao",
		description:
			"Thiết bị đã hoàn thành sửa chữa và sẵn sàng để khách hàng nhận",
		color: "#059669", // emerald-600
		category: "completed",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: true,
		allowedRoles: ["receptionist", "manager", "admin"],
	},
	delivered: {
		id: "delivered",
		label: "Đã giao hàng",
		description: "Thiết bị đã được giao cho khách hàng",
		color: "#16A34A", // green
		category: "completed",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: false,
		allowedRoles: ["receptionist", "delivery", "manager", "admin"],
	},
	payment_pending: {
		id: "payment_pending",
		label: "Chờ thanh toán",
		description: "Đang chờ khách hàng thanh toán số tiền còn lại",
		color: "#CA8A04", // yellow-600
		category: "active",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: true,
		notifyCustomer: true,
		allowedRoles: ["receptionist", "cashier", "manager", "admin"],
	},
	completed: {
		id: "completed",
		label: "Hoàn thành",
		description:
			"Đang trong trạng thái hoàn thành - đã hoàn tất quy trình sửa chữa và thanh toán",
		color: "green", // green
		category: "completed",
		isTerminal: true,
		requiresCustomerApproval: false,
		requiresPayment: true,
		notifyCustomer: true,
		allowedRoles: ["manager", "admin", "receptionist"],
	},
	cancelled_by_customer: {
		id: "cancelled_by_customer",
		label: "Khách hàng hủy",
		description: "Khách hàng đã yêu cầu hủy dịch vụ sửa chữa",
		color: "red", // red
		category: "cancelled",
		isTerminal: true,
		requiresCustomerApproval: true,
		requiresPayment: false,
		notifyCustomer: false,
		allowedRoles: ["receptionist", "manager", "admin"],
	},
	on_hold: {
		id: "on_hold",
		label: "Tạm dừng",
		description:
			"Đang tạm dừng công việc sửa chữa vì lý do kỹ thuật hoặc khách hàng",
		color: "#6B7280", // gray-500
		category: "special",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: true,
		allowedRoles: ["technician", "manager", "admin"],
	},
	warranty_claim: {
		id: "warranty_claim",
		label: "Bảo hành",
		description: "Thiết bị được trả lại để xử lý theo chế độ bảo hành",
		color: "#0D9488", // teal-600
		category: "special",
		isTerminal: false,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: true,
		allowedRoles: ["warranty_handler", "manager", "admin"],
	},
	abandoned: {
		id: "abandoned",
		label: "Bỏ lại",
		description:
			"Khách hàng không liên lạc hoặc không đến nhận thiết bị sau thời gian quy định",
		color: "#374151", // gray-700
		category: "cancelled",
		isTerminal: true,
		requiresCustomerApproval: false,
		requiresPayment: false,
		notifyCustomer: false,
		allowedRoles: ["manager", "admin"],
	},
};

export type StateTransition = {
	from: RepairState;
	to: RepairState;
	condition?: string;
	requiresConfirmation: boolean;
	businessRules: string[];
	automaticTrigger?: string;
};

export const STATE_TRANSITIONS: StateTransition[] = [
	// From device_received
	{
		from: "device_received",
		to: "preliminary_inspection",
		requiresConfirmation: false,
		businessRules: [
			"Device must be logged in system",
			"Initial condition documented",
		],
		automaticTrigger: "timer_30_minutes",
	},
	{
		from: "device_received",
		to: "cancelled_by_customer",
		requiresConfirmation: true,
		businessRules: ["Customer cancellation request", "No work started"],
	},

	// From preliminary_inspection
	{
		from: "preliminary_inspection",
		to: "awaiting_repair_plan",
		requiresConfirmation: false,
		businessRules: ["Initial inspection completed", "Problems identified"],
	},
	{
		from: "preliminary_inspection",
		to: "on_hold",
		requiresConfirmation: true,
		businessRules: ["Technical complications found", "Additional time needed"],
	},
	{
		from: "preliminary_inspection",
		to: "cancelled_by_customer",
		requiresConfirmation: true,
		businessRules: ["Customer decides not to proceed", "Cost too high"],
	},

	// From awaiting_repair_plan
	{
		from: "awaiting_repair_plan",
		to: "approved_for_repair",
		requiresConfirmation: true,
		businessRules: ["Customer approves quote", "Deposit payment received"],
	},
	{
		from: "awaiting_repair_plan",
		to: "cancelled_by_customer",
		requiresConfirmation: true,
		businessRules: ["Customer rejects quote", "Cost too high"],
	},

	// From approved_for_repair
	{
		from: "approved_for_repair",
		to: "waiting_parts",
		condition: "parts_needed",
		requiresConfirmation: false,
		businessRules: ["Parts required for repair", "Parts not in stock"],
	},
	{
		from: "approved_for_repair",
		to: "in_diagnosis",
		condition: "diagnosis_needed",
		requiresConfirmation: false,
		businessRules: ["Further diagnosis required", "Complex issue"],
	},
	{
		from: "approved_for_repair",
		to: "in_repair",
		condition: "ready_to_repair",
		requiresConfirmation: false,
		businessRules: ["All parts available", "Technician assigned"],
	},

	// From waiting_parts
	{
		from: "waiting_parts",
		to: "in_repair",
		requiresConfirmation: false,
		businessRules: ["Parts received", "Parts quality checked"],
		automaticTrigger: "parts_received",
	},
	{
		from: "waiting_parts",
		to: "cancelled_by_customer",
		requiresConfirmation: true,
		businessRules: [
			"Customer no longer wants to wait",
			"Parts taking too long",
		],
	},
	{
		from: "waiting_parts",
		to: "on_hold",
		requiresConfirmation: true,
		businessRules: ["Parts discontinued", "Supplier issues"],
	},

	// From in_diagnosis
	{
		from: "in_diagnosis",
		to: "awaiting_repair_plan",
		requiresConfirmation: false,
		businessRules: ["Diagnosis complete", "New repair plan needed"],
	},
	{
		from: "in_diagnosis",
		to: "in_repair",
		requiresConfirmation: false,
		businessRules: ["Diagnosis complete", "Can proceed with existing plan"],
	},
	{
		from: "in_diagnosis",
		to: "on_hold",
		requiresConfirmation: true,
		businessRules: ["Complex diagnosis needed", "Specialist required"],
	},

	// From in_repair
	{
		from: "in_repair",
		to: "quality_testing",
		requiresConfirmation: false,
		businessRules: ["Repair work completed", "Initial testing passed"],
	},
	{
		from: "in_repair",
		to: "waiting_parts",
		requiresConfirmation: false,
		businessRules: ["Additional parts needed", "Part failure during repair"],
	},
	{
		from: "in_repair",
		to: "on_hold",
		requiresConfirmation: true,
		businessRules: [
			"Technical complications",
			"Additional authorization needed",
		],
	},
	{
		from: "in_repair",
		to: "cancelled_by_customer",
		requiresConfirmation: true,
		businessRules: [
			"Customer cancellation request",
			"Work in progress can be cancelled",
		],
	},

	// From quality_testing
	{
		from: "quality_testing",
		to: "ready_for_pickup",
		requiresConfirmation: false,
		businessRules: ["All tests passed", "Quality approved"],
	},
	{
		from: "quality_testing",
		to: "in_repair",
		requiresConfirmation: false,
		businessRules: ["Quality issues found", "Rework needed"],
	},

	// From ready_for_pickup
	{
		from: "ready_for_pickup",
		to: "delivered",
		requiresConfirmation: false,
		businessRules: ["Customer pickup completed", "Device handed over"],
	},
	{
		from: "ready_for_pickup",
		to: "payment_pending",
		condition: "payment_incomplete",
		requiresConfirmation: false,
		businessRules: ["Remaining payment due", "Customer took device"],
	},
	{
		from: "ready_for_pickup",
		to: "abandoned",
		requiresConfirmation: true,
		businessRules: [
			"Customer no contact for 30 days",
			"Multiple pickup attempts failed",
		],
	},

	// From delivered
	{
		from: "delivered",
		to: "payment_pending",
		condition: "payment_incomplete",
		requiresConfirmation: false,
		businessRules: ["Final payment not received", "Credit terms applied"],
	},
	{
		from: "delivered",
		to: "completed",
		requiresConfirmation: false,
		businessRules: ["Payment completed", "Customer satisfied"],
		automaticTrigger: "payment_received",
	},
	{
		from: "delivered",
		to: "warranty_claim",
		requiresConfirmation: false,
		businessRules: ["Issue within warranty period", "Valid warranty claim"],
	},

	// From payment_pending
	{
		from: "payment_pending",
		to: "completed",
		requiresConfirmation: false,
		businessRules: ["Payment received", "All obligations fulfilled"],
		automaticTrigger: "payment_received",
	},

	// From on_hold
	{
		from: "on_hold",
		to: "in_diagnosis",
		requiresConfirmation: false,
		businessRules: ["Hold reason resolved", "Can resume diagnosis"],
	},
	{
		from: "on_hold",
		to: "in_repair",
		requiresConfirmation: false,
		businessRules: ["Hold reason resolved", "Can resume repair"],
	},
	{
		from: "on_hold",
		to: "waiting_parts",
		requiresConfirmation: false,
		businessRules: ["Waiting for specific parts", "Parts now orderable"],
	},
	{
		from: "on_hold",
		to: "cancelled_by_customer",
		requiresConfirmation: true,
		businessRules: ["Customer cancels during hold", "Too long on hold"],
	},

	// From warranty_claim
	{
		from: "warranty_claim",
		to: "in_diagnosis",
		requiresConfirmation: false,
		businessRules: ["Warranty claim accepted", "Diagnosis needed"],
	},
	{
		from: "warranty_claim",
		to: "in_repair",
		requiresConfirmation: false,
		businessRules: ["Warranty claim accepted", "Direct repair possible"],
	},
	{
		from: "warranty_claim",
		to: "completed",
		requiresConfirmation: false,
		businessRules: ["Warranty claim resolved", "No repair needed"],
	},
];

export function getValidTransitions(currentState: RepairState): RepairState[] {
	return STATE_TRANSITIONS.filter(
		(transition) => transition.from === currentState,
	).map((transition) => transition.to);
}

export function isValidTransition(from: RepairState, to: RepairState): boolean {
	return STATE_TRANSITIONS.some(
		(transition) => transition.from === from && transition.to === to,
	);
}

export function getTransitionInfo(
	from: RepairState,
	to: RepairState,
): StateTransition | undefined {
	return STATE_TRANSITIONS.find(
		(transition) => transition.from === from && transition.to === to,
	);
}

export function getStatesByCategory(
	category: RepairStateDefinition["category"],
): RepairState[] {
	return Object.values(REPAIR_STATES)
		.filter((state) => state.category === category)
		.map((state) => state.id);
}

export function getTerminalStates(): RepairState[] {
	return Object.values(REPAIR_STATES)
		.filter((state) => state.isTerminal)
		.map((state) => state.id);
}

export function canUserTransitionState(
	userRole: string,
	currentState: RepairState,
	targetState: RepairState,
): boolean {
	const currentStateDefinition = REPAIR_STATES[currentState];
	const targetStateDefinition = REPAIR_STATES[targetState];

	// Check if user has permission for current state
	if (!currentStateDefinition.allowedRoles.includes(userRole)) {
		return false;
	}

	// Check if user has permission for target state
	if (!targetStateDefinition.allowedRoles.includes(userRole)) {
		return false;
	}

	// Check if transition is valid
	return isValidTransition(currentState, targetState);
}

// Conditional workflow paths based on repair type
export type RepairType =
	| "hardware"
	| "software"
	| "screen"
	| "liquid_damage"
	| "battery"
	| "motherboard";

export function getWorkflowPath(repairType: RepairType): RepairState[] {
	const basePath: RepairState[] = ["device_received", "preliminary_inspection"];

	switch (repairType) {
		case "software":
			return [
				...basePath,
				"in_diagnosis",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"delivered",
				"completed",
			];

		case "screen":
			return [
				...basePath,
				"awaiting_repair_plan",
				"approved_for_repair",
				"waiting_parts",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"delivered",
				"completed",
			];

		case "liquid_damage":
			return [
				...basePath,
				"in_diagnosis",
				"awaiting_repair_plan",
				"approved_for_repair",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"delivered",
				"completed",
			];

		case "motherboard":
			return [
				...basePath,
				"in_diagnosis",
				"awaiting_repair_plan",
				"approved_for_repair",
				"waiting_parts",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"delivered",
				"payment_pending",
				"completed",
			];

		default: // hardware, battery
			return [
				...basePath,
				"awaiting_repair_plan",
				"approved_for_repair",
				"waiting_parts",
				"in_repair",
				"quality_testing",
				"ready_for_pickup",
				"delivered",
				"completed",
			];
	}
}

// Export functions for test compatibility
export const validateStateTransition = (
	from: RepairState,
	to: RepairState,
): boolean => {
	return isValidTransition(from, to);
};

export const getNextPossibleStates = (
	currentState: RepairState,
): RepairState[] => {
	return getValidTransitions(currentState);
};

export const getStateRequirements = (state: RepairState) => {
	const stateInfo = REPAIR_STATES[state];
	return {
		requiresCustomerApproval: stateInfo.requiresCustomerApproval,
		customerApproval: stateInfo.requiresCustomerApproval, // Test compatibility alias
		requiresPayment: stateInfo.requiresPayment,
		payment: stateInfo.requiresPayment, // Test compatibility alias
		notifyCustomer: stateInfo.notifyCustomer,
		allowedRoles: stateInfo.allowedRoles,
	};
};
