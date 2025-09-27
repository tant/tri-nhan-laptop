/**
 * Vietnamese Customer Data Validation Utilities
 * Handles validation for Vietnamese names, addresses, business data, and personal information
 */


// Customer category types
export type CustomerCategory = "individual" | "business";

// Contact preference types
export interface ContactPreferences {
	preferredMethod: "phone" | "email" | "sms";
	allowMarketing: boolean;
	preferredTime: "morning" | "afternoon" | "evening" | "any";
	language: "vi" | "en";
}

// Validation result interfaces
export interface NameValidationResult {
	isValid: boolean;
	error?: string;
	formatted?: string;
	type: "valid" | "invalid" | "suspicious";
}


export interface EmailValidationResult {
	isValid: boolean;
	error?: string;
	type: "valid" | "invalid" | "suspicious";
}

export interface BusinessDataValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

export interface IDCardValidationResult {
	isValid: boolean;
	error?: string;
	type: "old_format" | "new_format" | "invalid";
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

	// Length validation
	if (trimmedName.length < 2) {
		return {
			isValid: false,
			error: "Tên quá ngắn (tối thiểu 2 ký tự)",
			type: "invalid",
		};
	}

	if (trimmedName.length > 100) {
		return {
			isValid: false,
			error: "Tên quá dài (tối đa 100 ký tự)",
			type: "invalid",
		};
	}

	// Vietnamese name pattern - allows Vietnamese characters, spaces, and common punctuation
	const vietnameseNamePattern =
		/^[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ\s.'-]+$/;

	if (!vietnameseNamePattern.test(trimmedName)) {
		return {
			isValid: false,
			error: "Tên chứa ký tự không hợp lệ",
			type: "invalid",
		};
	}

	// Check for suspicious patterns (all numbers, repeated characters, etc.)
	if (/^\d+$/.test(trimmedName) || /^(.)\1{4,}$/.test(trimmedName)) {
		return {
			isValid: true, // Still valid, but suspicious
			formatted: formatVietnameseName(trimmedName),
			type: "suspicious",
		};
	}

	// Check if name has at least 2 words (first name and last name)
	const words = trimmedName.split(/\s+/).filter((word) => word.length > 0);
	if (words.length < 2) {
		return {
			isValid: true,
			formatted: formatVietnameseName(trimmedName),
			type: "suspicious", // Valid but might be incomplete
		};
	}

	return {
		isValid: true,
		formatted: formatVietnameseName(trimmedName),
		type: "valid",
	};
}

/**
 * Format Vietnamese name with proper capitalization
 */
function formatVietnameseName(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}


/**
 * Validate Vietnamese ID card number
 */
export function validateVietnameseIDCard(
	idCard: string,
): IDCardValidationResult {
	if (!idCard?.trim()) {
		return {
			isValid: false,
			error: "Số CMND/CCCD không được để trống",
			type: "invalid",
		};
	}

	const trimmed = idCard.trim().replace(/\s+/g, "");

	// Old ID card format (9 digits)
	if (/^\d{9}$/.test(trimmed)) {
		return {
			isValid: true,
			type: "old_format",
		};
	}

	// New ID card format (12 digits)
	if (/^\d{12}$/.test(trimmed)) {
		return {
			isValid: true,
			type: "new_format",
		};
	}

	return {
		isValid: false,
		error: "Số CMND/CCCD phải có 9 hoặc 12 chữ số",
		type: "invalid",
	};
}

/**
 * Validate Vietnamese tax code
 */
function validateVietnameseTaxCode(taxCode: string): boolean {
	if (!taxCode?.trim()) return false;

	const trimmed = taxCode.trim().replace(/[\s-]/g, "");

	// Vietnamese tax code format: 10 or 13 digits
	return /^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed);
}

/**
 * Validate email address
 */
export function validateEmail(email: string): EmailValidationResult {
	if (!email?.trim()) {
		return {
			isValid: false,
			error: "Email không được để trống",
			type: "invalid",
		};
	}

	const trimmed = email.trim().toLowerCase();

	// Basic email pattern
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailPattern.test(trimmed)) {
		return {
			isValid: false,
			error: "Định dạng email không hợp lệ",
			type: "invalid",
		};
	}

	// Check for suspicious patterns
	const suspiciousPatterns = [
		/test@test/, // test emails
		/fake@fake/, // fake emails
		/temp@temp/, // temporary emails
		/^.{1,2}@/, // very short local part
	];

	const isSuspicious = suspiciousPatterns.some((pattern) =>
		pattern.test(trimmed),
	);

	return {
		isValid: true,
		type: isSuspicious ? "suspicious" : "valid",
	};
}

/**
 * Validate business customer data
 */
export function validateBusinessData(data: {
	businessName?: string;
	taxCode?: string;
	contactPerson?: string;
}): BusinessDataValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Business name validation
	if (!data.businessName?.trim()) {
		errors.push("Tên doanh nghiệp không được để trống");
	} else if (data.businessName.trim().length < 3) {
		errors.push("Tên doanh nghiệp quá ngắn");
	} else if (data.businessName.trim().length > 200) {
		errors.push("Tên doanh nghiệp quá dài");
	}

	// Tax code validation
	if (data.taxCode?.trim()) {
		if (!validateVietnameseTaxCode(data.taxCode)) {
			errors.push("Mã số thuế không hợp lệ (phải có 10 hoặc 13 chữ số)");
		}
	} else {
		warnings.push("Khuyến nghị nhập mã số thuế cho doanh nghiệp");
	}

	// Contact person validation
	if (data.contactPerson?.trim()) {
		const nameValidation = validateVietnameseName(data.contactPerson);
		if (!nameValidation.isValid) {
			errors.push(`Người liên hệ: ${nameValidation.error}`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate date of birth
 */
export function validateDateOfBirth(dateString: string): {
	isValid: boolean;
	error?: string;
	age?: number;
} {
	if (!dateString?.trim()) {
		return {
			isValid: false,
			error: "Ngày sinh không được để trống",
		};
	}

	const date = new Date(dateString);
	const now = new Date();

	if (Number.isNaN(date.getTime())) {
		return {
			isValid: false,
			error: "Định dạng ngày sinh không hợp lệ",
		};
	}

	// Check if date is in the future
	if (date > now) {
		return {
			isValid: false,
			error: "Ngày sinh không thể trong tương lai",
		};
	}

	// Calculate age
	const age = now.getFullYear() - date.getFullYear();
	const monthDiff = now.getMonth() - date.getMonth();
	const dayDiff = now.getDate() - date.getDate();

	let calculatedAge = age;
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		calculatedAge--;
	}

	// Age validation
	if (calculatedAge > 120) {
		return {
			isValid: false,
			error: "Tuổi không hợp lệ (quá 120 tuổi)",
		};
	}

	if (calculatedAge < 0) {
		return {
			isValid: false,
			error: "Ngày sinh không hợp lệ",
		};
	}

	return {
		isValid: true,
		age: calculatedAge,
	};
}


/**
 * Generate default contact preferences
 */
export function getDefaultContactPreferences(): ContactPreferences {
	return {
		preferredMethod: "phone",
		allowMarketing: false,
		preferredTime: "any",
		language: "vi",
	};
}


