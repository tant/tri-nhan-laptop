/**
 * Vietnamese Customer Data Validation Utilities
 * Handles validation for Vietnamese names, addresses, business data, and personal information
 */

// Vietnamese address data
export const VIETNAMESE_PROVINCES = [
	"Hà Nội",
	"TP. Hồ Chí Minh",
	"Đà Nẵng",
	"Hải Phòng",
	"Cần Thơ",
	"An Giang",
	"Bà Rịa - Vũng Tàu",
	"Bắc Giang",
	"Bắc Kạn",
	"Bạc Liêu",
	"Bắc Ninh",
	"Bến Tre",
	"Bình Định",
	"Bình Dương",
	"Bình Phước",
	"Bình Thuận",
	"Cà Mau",
	"Cao Bằng",
	"Đắk Lắk",
	"Đắk Nông",
	"Điện Biên",
	"Đồng Nai",
	"Đồng Tháp",
	"Gia Lai",
	"Hà Giang",
	"Hà Nam",
	"Hà Tĩnh",
	"Hải Dương",
	"Hậu Giang",
	"Hòa Bình",
	"Hưng Yên",
	"Khánh Hòa",
	"Kiên Giang",
	"Kon Tum",
	"Lai Châu",
	"Lâm Đồng",
	"Lạng Sơn",
	"Lào Cai",
	"Long An",
	"Nam Định",
	"Nghệ An",
	"Ninh Bình",
	"Ninh Thuận",
	"Phú Thọ",
	"Phú Yên",
	"Quảng Bình",
	"Quảng Nam",
	"Quảng Ngãi",
	"Quảng Ninh",
	"Quảng Trị",
	"Sóc Trăng",
	"Sơn La",
	"Tây Ninh",
	"Thái Bình",
	"Thái Nguyên",
	"Thanh Hóa",
	"Thừa Thiên Huế",
	"Tiền Giang",
	"Trà Vinh",
	"Tuyên Quang",
	"Vĩnh Long",
	"Vĩnh Phúc",
	"Yên Bái",
] as const;

export type VietnameseProvince = (typeof VIETNAMESE_PROVINCES)[number];

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

export interface AddressValidationResult {
	isValid: boolean;
	error?: string;
	formatted?: {
		details: string;
		ward: string;
		district: string;
		province: string;
		full: string;
	};
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

export interface DateValidationResult {
	isValid: boolean;
	error?: string;
	age?: number;
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
export function formatVietnameseName(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Validate Vietnamese address structure
 */
export function validateVietnameseAddress(address: {
	details?: string;
	ward?: string;
	district?: string;
	province?: string;
}): AddressValidationResult {
	const { details, ward, district, province } = address;

	// Province validation
	if (!province?.trim()) {
		return {
			isValid: false,
			error: "Tỉnh/Thành phố không được để trống",
		};
	}

	if (!VIETNAMESE_PROVINCES.includes(province.trim() as VietnameseProvince)) {
		return {
			isValid: false,
			error: "Tỉnh/Thành phố không hợp lệ",
		};
	}

	// District validation
	if (!district?.trim()) {
		return {
			isValid: false,
			error: "Quận/Huyện không được để trống",
		};
	}

	if (district.trim().length < 2) {
		return {
			isValid: false,
			error: "Tên Quận/Huyện quá ngắn",
		};
	}

	// Ward validation
	if (!ward?.trim()) {
		return {
			isValid: false,
			error: "Phường/Xã không được để trống",
		};
	}

	if (ward.trim().length < 2) {
		return {
			isValid: false,
			error: "Tên Phường/Xã quá ngắn",
		};
	}

	// Address details validation
	if (!details?.trim()) {
		return {
			isValid: false,
			error: "Địa chỉ chi tiết không được để trống",
		};
	}

	if (details.trim().length < 5) {
		return {
			isValid: false,
			error: "Địa chỉ chi tiết quá ngắn",
		};
	}

	const formatted = {
		details: details.trim(),
		ward: ward.trim(),
		district: district.trim(),
		province: province.trim(),
		full: `${details.trim()}, ${ward.trim()}, ${district.trim()}, ${province.trim()}`,
	};

	return {
		isValid: true,
		formatted,
	};
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
export function validateVietnameseTaxCode(taxCode: string): boolean {
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
 * Validate contact preferences
 */
export function validateContactPreferences(
	preferences: Partial<ContactPreferences>,
): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (preferences.preferredMethod) {
		const validMethods = ["phone", "email", "sms"];
		if (!validMethods.includes(preferences.preferredMethod)) {
			errors.push("Phương thức liên hệ không hợp lệ");
		}
	}

	if (preferences.preferredTime) {
		const validTimes = ["morning", "afternoon", "evening", "any"];
		if (!validTimes.includes(preferences.preferredTime)) {
			errors.push("Thời gian liên hệ không hợp lệ");
		}
	}

	if (preferences.language) {
		const validLanguages = ["vi", "en"];
		if (!validLanguages.includes(preferences.language)) {
			errors.push("Ngôn ngữ không hợp lệ");
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
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

/**
 * Format Vietnamese address for display
 */
export function formatVietnameseAddressForDisplay(address: {
	details?: string;
	ward?: string;
	district?: string;
	province?: string;
}): string {
	const parts = [
		address.details?.trim(),
		address.ward?.trim(),
		address.district?.trim(),
		address.province?.trim(),
	].filter(Boolean);

	return parts.join(", ");
}

/**
 * Parse full address into components (best effort)
 */
export function parseVietnameseAddress(fullAddress: string): {
	details: string;
	ward: string;
	district: string;
	province: string;
} {
	const parts = fullAddress
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	const result = {
		details: "",
		ward: "",
		district: "",
		province: "",
	};

	if (parts.length >= 4) {
		result.details = parts[0];
		result.ward = parts[1];
		result.district = parts[2];
		result.province = parts.slice(3).join(", ");
	} else if (parts.length === 3) {
		result.details = parts[0];
		result.district = parts[1];
		result.province = parts[2];
	} else if (parts.length === 2) {
		result.details = parts[0];
		result.province = parts[1];
	} else if (parts.length === 1) {
		result.details = parts[0];
	}

	return result;
}
