/**
 * Simplified Vietnamese Customer Data Validation Utilities
 * Handles validation for Vietnamese names only (simplified customer structure)
 */

// Validation result interfaces
export interface NameValidationResult {
	isValid: boolean;
	error?: string;
	formatted?: string;
	type: "valid" | "invalid" | "suspicious";
}

/**
 * Validate Vietnamese full name
 */
export function validateVietnameseName(name: string): NameValidationResult {
	if (!name?.trim()) {
		return {
			isValid: false,
			error: "Tên không được để trống",
			type: "invalid",
		};
	}

	const trimmedName = name.trim();

	// Basic length validation
	if (trimmedName.length < 2) {
		return {
			isValid: false,
			error: "Tên quá ngắn",
			type: "invalid",
		};
	}

	if (trimmedName.length > 100) {
		return {
			isValid: false,
			error: "Tên quá dài",
			type: "invalid",
		};
	}

	// Vietnamese name pattern validation
	const vietnameseNamePattern =
		/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]+$/;

	if (!vietnameseNamePattern.test(trimmedName)) {
		return {
			isValid: false,
			error: "Tên chứa ký tự không hợp lệ",
			type: "invalid",
		};
	}

	// Check for suspicious patterns
	const suspiciousPatterns = [
		/\d/, // Contains numbers
		/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, // Special characters
		/(.)\1{3,}/, // Repeated characters (more than 3 times)
	];

	for (const pattern of suspiciousPatterns) {
		if (pattern.test(trimmedName)) {
			return {
				isValid: true,
				error: "Tên có vẻ không bình thường",
				type: "suspicious",
				formatted: trimmedName,
			};
		}
	}

	// Format name properly (title case)
	const formattedName = trimmedName
		.split(" ")
		.filter((part) => part.length > 0)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");

	return {
		isValid: true,
		type: "valid",
		formatted: formattedName,
	};
}

/**
 * Simple validation for customer profile
 */
export function validateSimpleCustomer(data: {
	phone: string;
	fullName: string;
	address?: string;
}): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// Validate phone
	if (!data.phone?.trim()) {
		errors.push("Số điện thoại là bắt buộc");
	} else if (!/^0\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
		errors.push("Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0)");
	}

	// Validate name
	if (!data.fullName?.trim()) {
		errors.push("Họ và tên là bắt buộc");
	} else {
		const nameValidation = validateVietnameseName(data.fullName);
		if (!nameValidation.isValid) {
			errors.push(nameValidation.error || "Tên không hợp lệ");
		}
	}

	// Address is optional, no validation needed

	return {
		isValid: errors.length === 0,
		errors,
	};
}
