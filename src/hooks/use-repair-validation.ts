/**
 * Repair Ticket Validation Hook
 * Focused validation utilities for repair tickets
 */

import type { Database } from "@/lib/supabase";

// Database types
export type RepairPriority = "low" | "normal" | "high" | "urgent";

export interface NewRepairTicket {
	customerPhone: string;
	customerName: string;
	customerEmail?: string;
	deviceType: "laptop" | "desktop" | "tablet" | "phone" | "other";
	deviceBrand: string;
	deviceModel: string;
	serialNumber?: string;
	issueDescription: string;
	customerDescription: string;
	priority: RepairPriority;
	urgency?: string;
	preliminaryDiagnosis?: string;
	physicalCondition: {
		overall: "excellent" | "good" | "fair" | "poor";
		notes?: string;
	};
	accessories?: string[];
	documents?: File[];
	photos?: File[];
	estimatedCost?: number;
	estimatedCompletion?: Date;
	assignedTechnician?: string;
	isDraft?: boolean;
	repairCategory?: string;
	symptoms?: string[];
}

interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

/**
 * Hook for repair ticket validation
 */
export function useRepairValidation() {
	/**
	 * Validate ticket data before submission
	 */
	const validateTicketData = (data: NewRepairTicket): ValidationResult => {
		const errors: string[] = [];

		// Required field validations
		if (!data.customerPhone?.trim()) {
			errors.push("Số điện thoại khách hàng là bắt buộc");
		}

		if (!data.customerName?.trim()) {
			errors.push("Tên khách hàng là bắt buộc");
		}

		if (!data.issueDescription?.trim()) {
			errors.push("Mô tả sự cố là bắt buộc");
		}

		if (!data.customerDescription?.trim()) {
			errors.push("Mô tả của khách hàng là bắt buộc");
		}

		if (!data.deviceBrand?.trim()) {
			errors.push("Thương hiệu thiết bị là bắt buộc");
		}

		if (!data.deviceModel?.trim()) {
			errors.push("Model thiết bị là bắt buộc");
		}

		// Phone number format validation
		if (data.customerPhone && !isValidVietnamesePhone(data.customerPhone)) {
			errors.push("Số điện thoại không hợp lệ");
		}

		// Email validation (if provided)
		if (data.customerEmail && !isValidEmail(data.customerEmail)) {
			errors.push("Email không hợp lệ");
		}

		// Priority validation
		const validPriorities: RepairPriority[] = ["low", "normal", "high", "urgent"];
		if (!validPriorities.includes(data.priority)) {
			errors.push("Mức độ ưu tiên không hợp lệ");
		}

		// Physical condition validation
		const validConditions = ["excellent", "good", "fair", "poor"];
		if (!validConditions.includes(data.physicalCondition.overall)) {
			errors.push("Tình trạng vật lý không hợp lệ");
		}

		// Cost validation (if provided)
		if (data.estimatedCost !== undefined && (data.estimatedCost < 0 || data.estimatedCost > 100000000)) {
			errors.push("Chi phí dự kiến không hợp lệ");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	};

	/**
	 * Get condition description in Vietnamese
	 */
	const getConditionDescription = (condition: string, notes?: string): string => {
		const descriptions = {
			excellent: "Tuyệt vời - Không có vết xước hoặc hỏng hóc",
			good: "Tốt - Có thể có vài vết xước nhỏ",
			fair: "Khá - Có vết xước hoặc hỏng hóc nhỏ",
			poor: "Kém - Có nhiều vết xước hoặc hỏng hóc",
		};

		const baseDescription = descriptions[condition as keyof typeof descriptions] || condition;
		return notes ? `${baseDescription}. Ghi chú: ${notes}` : baseDescription;
	};

	/**
	 * Get condition label for display
	 */
	const getConditionLabel = (condition: string): string => {
		const labels = {
			excellent: "Tuyệt vời",
			good: "Tốt",
			fair: "Khá",
			poor: "Kém",
		};

		return labels[condition as keyof typeof labels] || condition;
	};

	/**
	 * Infer repair category from issue description
	 */
	const inferRepairCategory = (issueDescription: string): string => {
		const description = issueDescription.toLowerCase();

		if (description.includes("màn hình") || description.includes("hiển thị") || description.includes("screen")) {
			return "display";
		}
		if (description.includes("bàn phím") || description.includes("keyboard") || description.includes("phím")) {
			return "keyboard";
		}
		if (description.includes("pin") || description.includes("battery") || description.includes("sạc")) {
			return "battery";
		}
		if (description.includes("quạt") || description.includes("fan") || description.includes("nóng") || description.includes("nhiệt")) {
			return "cooling";
		}
		if (description.includes("âm thanh") || description.includes("loa") || description.includes("sound") || description.includes("audio")) {
			return "audio";
		}
		if (description.includes("wifi") || description.includes("mạng") || description.includes("kết nối") || description.includes("network")) {
			return "network";
		}
		if (description.includes("ổ cứng") || description.includes("ssd") || description.includes("hdd") || description.includes("storage")) {
			return "storage";
		}
		if (description.includes("ram") || description.includes("memory") || description.includes("bộ nhớ")) {
			return "memory";
		}

		return "other";
	};

	return {
		validateTicketData,
		getConditionDescription,
		getConditionLabel,
		inferRepairCategory,
	};
}

// Helper functions
function isValidVietnamesePhone(phone: string): boolean {
	// Vietnamese phone number patterns
	const phoneRegex = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
	return phoneRegex.test(phone.replace(/\s+/g, ""));
}

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}