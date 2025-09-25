/**
 * Status Translation System
 * Translates internal repair statuses to customer-friendly Vietnamese descriptions
 */

export interface CustomerStatusTranslation {
	internalStatus: string;
	vietnameseLabel: string;
	customerDescription: string;
	estimatedTimeframe?: string;
	nextSteps?: string;
	isPositive: boolean;
	showToCustomer: boolean;
}

/**
 * Complete status translation mapping for Vietnamese customers
 */
const STATUS_TRANSLATIONS: Record<string, CustomerStatusTranslation> = {
	pending_customer_confirmation: {
		internalStatus: "pending_customer_confirmation",
		vietnameseLabel: "Chờ xác nhận",
		customerDescription:
			"Chúng tôi đang chờ quý khách xác nhận thông tin sửa chữa",
		estimatedTimeframe: "1-2 ngày",
		nextSteps: "Vui lòng liên hệ với cửa hàng để xác nhận",
		isPositive: true,
		showToCustomer: true,
	},
	confirmed: {
		internalStatus: "confirmed",
		vietnameseLabel: "Đã xác nhận",
		customerDescription: "Đã xác nhận thông tin, chuẩn bị tiếp nhận thiết bị",
		estimatedTimeframe: "1 ngày",
		nextSteps: "Quý khách có thể mang thiết bị đến cửa hàng",
		isPositive: true,
		showToCustomer: true,
	},
	device_received: {
		internalStatus: "device_received",
		vietnameseLabel: "Đã tiếp nhận",
		customerDescription: "Thiết bị đã được tiếp nhận và đang chờ kiểm tra",
		estimatedTimeframe: "1-2 ngày",
		nextSteps: "Kỹ thuật viên sẽ tiến hành kiểm tra sơ bộ",
		isPositive: true,
		showToCustomer: true,
	},
	initial_diagnosis: {
		internalStatus: "initial_diagnosis",
		vietnameseLabel: "Đang kiểm tra",
		customerDescription:
			"Kỹ thuật viên đang tiến hành kiểm tra và chẩn đoán sự cố",
		estimatedTimeframe: "1-3 ngày",
		nextSteps: "Sẽ có kết quả chẩn đoán chi tiết",
		isPositive: true,
		showToCustomer: true,
	},
	diagnosis_complete: {
		internalStatus: "diagnosis_complete",
		vietnameseLabel: "Đã chẩn đoán",
		customerDescription: "Đã xác định được nguyên nhân và phương án sửa chữa",
		estimatedTimeframe: "Hoàn thành",
		nextSteps: "Chuẩn bị báo giá chi tiết",
		isPositive: true,
		showToCustomer: true,
	},
	quote_provided: {
		internalStatus: "quote_provided",
		vietnameseLabel: "Đã báo giá",
		customerDescription:
			"Báo giá sửa chữa đã sẵn sàng, chờ quý khách phê duyệt",
		estimatedTimeframe: "Chờ phản hồi",
		nextSteps: "Vui lòng xem xét và phê duyệt báo giá",
		isPositive: true,
		showToCustomer: true,
	},
	quote_approved: {
		internalStatus: "quote_approved",
		vietnameseLabel: "Đã duyệt báo giá",
		customerDescription:
			"Báo giá đã được phê duyệt, bắt đầu tiến hành sửa chữa",
		estimatedTimeframe: "1-2 ngày",
		nextSteps: "Chuẩn bị linh kiện và bắt đầu sửa chữa",
		isPositive: true,
		showToCustomer: true,
	},
	parts_ordered: {
		internalStatus: "parts_ordered",
		vietnameseLabel: "Đang đặt linh kiện",
		customerDescription: "Đã đặt hàng linh kiện cần thiết cho việc sửa chữa",
		estimatedTimeframe: "2-5 ngày",
		nextSteps: "Chờ linh kiện về để tiến hành sửa chữa",
		isPositive: true,
		showToCustomer: true,
	},
	parts_received: {
		internalStatus: "parts_received",
		vietnameseLabel: "Linh kiện đã về",
		customerDescription: "Linh kiện đã về, sẵn sàng tiến hành sửa chữa",
		estimatedTimeframe: "1 ngày",
		nextSteps: "Bắt đầu quá trình thay thế và sửa chữa",
		isPositive: true,
		showToCustomer: true,
	},
	repair_in_progress: {
		internalStatus: "repair_in_progress",
		vietnameseLabel: "Đang sửa chữa",
		customerDescription:
			"Kỹ thuật viên đang tiến hành sửa chữa thiết bị của quý khách",
		estimatedTimeframe: "1-3 ngày",
		nextSteps: "Sửa chữa và kiểm tra chất lượng",
		isPositive: true,
		showToCustomer: true,
	},
	repair_complete: {
		internalStatus: "repair_complete",
		vietnameseLabel: "Sửa chữa xong",
		customerDescription:
			"Đã hoàn thành sửa chữa, đang tiến hành kiểm tra chất lượng",
		estimatedTimeframe: "1 ngày",
		nextSteps: "Kiểm tra chất lượng và chuẩn bị bàn giao",
		isPositive: true,
		showToCustomer: true,
	},
	quality_check: {
		internalStatus: "quality_check",
		vietnameseLabel: "Kiểm tra chất lượng",
		customerDescription: "Đang kiểm tra chất lượng sau sửa chữa",
		estimatedTimeframe: "Trong ngày",
		nextSteps: "Hoàn tất kiểm tra và thông báo",
		isPositive: true,
		showToCustomer: true,
	},
	ready_for_pickup: {
		internalStatus: "ready_for_pickup",
		vietnameseLabel: "Sẵn sàng nhận",
		customerDescription: "Thiết bị đã sẵn sàng, quý khách có thể đến nhận",
		estimatedTimeframe: "Hoàn thành",
		nextSteps: "Vui lòng liên hệ để sắp xếp thời gian nhận hàng",
		isPositive: true,
		showToCustomer: true,
	},
	completed: {
		internalStatus: "completed",
		vietnameseLabel: "Hoàn thành",
		customerDescription: "Đã hoàn thành và bàn giao thiết bị cho khách hàng",
		estimatedTimeframe: "Hoàn thành",
		nextSteps: "Cảm ơn quý khách đã sử dụng dịch vụ",
		isPositive: true,
		showToCustomer: true,
	},
	cancelled: {
		internalStatus: "cancelled",
		vietnameseLabel: "Đã hủy",
		customerDescription: "Yêu cầu sửa chữa đã được hủy",
		nextSteps: "Vui lòng liên hệ cửa hàng nếu cần hỗ trợ",
		isPositive: false,
		showToCustomer: true,
	},
	on_hold: {
		internalStatus: "on_hold",
		vietnameseLabel: "Tạm dừng",
		customerDescription: "Quá trình sửa chữa tạm thời tạm dừng",
		nextSteps: "Vui lòng liên hệ cửa hàng để biết thêm thông tin",
		isPositive: false,
		showToCustomer: true,
	},
};

/**
 * Get customer-friendly status translation
 */
export async function translateStatusForCustomer(
	internalStatus: string,
): Promise<CustomerStatusTranslation> {
	const translation = STATUS_TRANSLATIONS[internalStatus];

	if (!translation) {
		// Fallback for unknown statuses
		return {
			internalStatus,
			vietnameseLabel: "Đang xử lý",
			customerDescription: "Thiết bị đang được xử lý",
			isPositive: true,
			showToCustomer: true,
		};
	}

	return translation;
}

/**
 * Get all available status translations for admin interface
 */
export function getAllStatusTranslations(): CustomerStatusTranslation[] {
	return Object.values(STATUS_TRANSLATIONS);
}

/**
 * Get customer-safe status list (only statuses that should be shown to customers)
 */
export function getCustomerVisibleStatuses(): CustomerStatusTranslation[] {
	return Object.values(STATUS_TRANSLATIONS).filter(
		(translation) => translation.showToCustomer,
	);
}

/**
 * Translate multiple statuses at once
 */
export async function translateMultipleStatuses(
	statuses: string[],
): Promise<Record<string, CustomerStatusTranslation>> {
	const translations: Record<string, CustomerStatusTranslation> = {};

	for (const status of statuses) {
		translations[status] = await translateStatusForCustomer(status);
	}

	return translations;
}

/**
 * Get status category for grouping
 */
export function getStatusCategory(
	internalStatus: string,
): "initial" | "diagnosis" | "approval" | "repair" | "completion" | "other" {
	const categoryMap: Record<string, string> = {
		pending_customer_confirmation: "initial",
		confirmed: "initial",
		device_received: "initial",
		initial_diagnosis: "diagnosis",
		diagnosis_complete: "diagnosis",
		quote_provided: "approval",
		quote_approved: "approval",
		parts_ordered: "repair",
		parts_received: "repair",
		repair_in_progress: "repair",
		repair_complete: "completion",
		quality_check: "completion",
		ready_for_pickup: "completion",
		completed: "completion",
	};

	return (categoryMap[internalStatus] as any) || "other";
}

/**
 * Get status color for UI display
 */
export function getStatusColor(
	internalStatus: string,
): "blue" | "yellow" | "green" | "red" | "gray" {
	const translation = STATUS_TRANSLATIONS[internalStatus];

	if (!translation) return "gray";

	if (internalStatus === "completed") return "green";
	if (internalStatus === "cancelled") return "red";
	if (internalStatus === "on_hold") return "yellow";
	if (translation.isPositive) return "blue";

	return "gray";
}

/**
 * Check if status should trigger customer notification
 */
export function shouldNotifyCustomer(internalStatus: string): boolean {
	const notificationStatuses = [
		"diagnosis_complete",
		"quote_provided",
		"repair_complete",
		"ready_for_pickup",
		"completed",
		"on_hold",
		"cancelled",
	];

	return notificationStatuses.includes(internalStatus);
}

/**
 * Get estimated completion date based on current status
 */
export function getEstimatedCompletion(
	currentStatus: string,
	baseDate: Date = new Date(),
): Date | null {
	const estimationMap: Record<string, number> = {
		// Days from current status
		pending_customer_confirmation: 2,
		confirmed: 1,
		device_received: 2,
		initial_diagnosis: 3,
		diagnosis_complete: 1,
		quote_provided: 7, // Waiting for customer approval
		quote_approved: 2,
		parts_ordered: 5,
		parts_received: 1,
		repair_in_progress: 3,
		repair_complete: 1,
		quality_check: 1,
		ready_for_pickup: 7, // Customer pickup window
	};

	const daysToCompletion = estimationMap[currentStatus];

	if (daysToCompletion === undefined) {
		return null;
	}

	const completionDate = new Date(baseDate);
	completionDate.setDate(completionDate.getDate() + daysToCompletion);

	return completionDate;
}

/**
 * Get Vietnamese day of week
 */
export function getVietnameseDayOfWeek(date: Date): string {
	const days = [
		"Chủ nhật",
		"Thứ hai",
		"Thứ ba",
		"Thứ tư",
		"Thứ năm",
		"Thứ sáu",
		"Thứ bảy",
	];

	return days[date.getDay()];
}

/**
 * Format date for Vietnamese customer display
 */
export function formatVietnameseDate(date: Date): string {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const dayOfWeek = getVietnameseDayOfWeek(date);

	return `${dayOfWeek}, ${day}/${month}/${year}`;
}
