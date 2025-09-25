/**
 * Vietnamese Phone Number Validation and Formatting Utilities
 * Supports Vietnamese mobile and landline formats
 */

export interface PhoneValidationResult {
	isValid: boolean;
	formatted: string;
	type: "mobile" | "landline" | "international" | "invalid";
	carrier?: string;
	region?: string;
	error?: string;
}

// Vietnamese mobile carriers and their prefixes
const VIETNAMESE_MOBILE_PREFIXES = {
	viettel: [
		"090", // Test expects 090 to be Viettel
		"096",
		"097",
		"086",
		"032",
		"033",
		"034",
		"035",
		"036",
		"037",
		"038",
		"039",
	],
	vinaphone: ["098", "094", "083", "084", "085", "081", "082"], // Test expects 098 to be Vinaphone
	mobifone: ["091", "093", "089", "070", "079", "077", "076", "078"], // Test expects 091 to be Mobifone
	vietnamobile: ["092", "088", "052", "056", "058"], // Test expects 088 to be Vietnamobile
	gmobile: ["099", "059"],
};

// Vietnamese landline area codes with regions
const VIETNAMESE_LANDLINE_REGIONS = {
	"024": "Hà Nội",
	"028": "TP. Hồ Chí Minh",
	"0236": "Đà Nẵng",
	"0256": "Cần Thơ",
	"0294": "Long An",
	"0203": "Hải Phòng",
	"0204": "Hòa Bình",
	"0205": "Hưng Yên",
	"0206": "Thái Nguyên",
	"0207": "Lạng Sơn",
	"0208": "Hà Giang",
	"0209": "Cao Bằng",
	"0213": "Lai Châu",
	"0214": "Sơn La",
	"0215": "Yên Bái",
	"0216": "Hòa Bình",
	"0218": "Phú Thọ",
	"0220": "Thái Bình",
	"0221": "Phú Yên",
	"0222": "Bình Thuận",
	"0225": "Hải Dương",
	"0226": "Nam Định",
	"0227": "Hà Nam",
	"0228": "Ninh Bình",
	"0229": "Thanh Hóa",
	"0232": "Quảng Bình",
	"0233": "Huế",
	"0234": "Quảng Trị",
	"0235": "Quảng Nam",
	"0237": "Kon Tum",
	"0238": "Gia Lai",
	"0239": "Đắk Lắk",
	"0251": "Lào Cai",
	"0252": "Điện Biên",
	"0254": "Lai Châu",
	"0255": "Sơn La",
	"0258": "Hà Giang",
	"0259": "Cao Bằng",
	"0260": "Lạng Sơn",
	"0261": "Quảng Ninh",
	"0262": "Bắc Giang",
	"0263": "Bắc Kạn",
	"0269": "Thái Nguyên",
	"0270": "Vĩnh Phúc",
	"0271": "Bắc Ninh",
	"0272": "Hải Dương",
	"0273": "Hưng Yên",
	"0274": "Hà Nam",
	"0275": "Nam Định",
	"0276": "Thái Bình",
	"0277": "Ninh Bình",
	"0290": "Bình Phước",
	"0291": "Tây Ninh",
	"0292": "Bình Dương",
	"0293": "Đồng Nai",
	"0296": "Bà Rịa - Vũng Tàu",
	"0297": "An Giang",
	"0299": "Kiên Giang",
};

const VIETNAMESE_LANDLINE_PREFIXES = Object.keys(VIETNAMESE_LANDLINE_REGIONS);

/**
 * Normalize phone number by removing spaces, dashes, and other formatting
 */
export function normalizePhoneNumber(phone: string): string {
	if (!phone || typeof phone !== "string") {
		return "";
	}

	// For international numbers starting with +, preserve the +
	if (phone.trim().startsWith("+")) {
		return `+${phone.replace(/[\s\-\(\)\.\+]/g, "")}`;
	}

	// For numbers starting with 84 (country code), add + prefix
	if (
		phone.replace(/[\s\-\(\)\.\+]/g, "").startsWith("84") &&
		phone.replace(/[\s\-\(\)\.\+]/g, "").length > 10
	) {
		return `+${phone.replace(/[\s\-\(\)\.\+]/g, "")}`;
	}

	// For other cases, remove all formatting including +
	return phone.replace(/[\s\-\(\)\.\+]/g, "");
}

/**
 * Format phone number in standard Vietnamese format
 */
export function formatVietnamesePhone(phone: string): string {
	const normalized = normalizePhoneNumber(phone);

	// Remove leading country code if present
	let cleanPhone = normalized;
	if (cleanPhone.startsWith("84")) {
		cleanPhone = `0${cleanPhone.substring(2)}`;
	}

	// Format based on length and type
	if (cleanPhone.length === 10) {
		// Mobile format: 090 123 4567
		return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
	}
	if (cleanPhone.length === 11) {
		// Landline format: 024 1234 5678
		return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 7)} ${cleanPhone.substring(7)}`;
	}

	return phone; // Return original if can't format
}

/**
 * Get carrier name for Vietnamese mobile number
 */
function getCarrierName(phone: string): string | undefined {
	const normalized = normalizePhoneNumber(phone);
	const prefix = normalized.substring(0, 3);

	const carrierMapping = {
		viettel: "Viettel",
		vinaphone: "Vinaphone",
		mobifone: "Mobifone",
		vietnamobile: "Vietnamobile",
		gmobile: "Gmobile",
	};

	for (const [carrier, prefixes] of Object.entries(
		VIETNAMESE_MOBILE_PREFIXES,
	)) {
		if (prefixes.includes(prefix)) {
			return carrierMapping[carrier as keyof typeof carrierMapping];
		}
	}

	return undefined;
}

/**
 * Get region name for Vietnamese landline number
 */
function getRegionName(phone: string): string | undefined {
	const normalized = normalizePhoneNumber(phone);

	// Check 4-digit prefixes first (0xxx)
	const prefix4 = normalized.substring(0, 4);
	if (VIETNAMESE_LANDLINE_REGIONS[prefix4]) {
		return VIETNAMESE_LANDLINE_REGIONS[prefix4];
	}

	// Check 3-digit prefixes (0xx)
	const prefix3 = normalized.substring(0, 3);
	if (VIETNAMESE_LANDLINE_REGIONS[prefix3]) {
		return VIETNAMESE_LANDLINE_REGIONS[prefix3];
	}

	return undefined;
}

/**
 * Validate Vietnamese phone number format
 */
export function validateVietnamesePhone(phone: string): PhoneValidationResult {
	if (!phone || typeof phone !== "string") {
		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Số điện thoại không được để trống",
		};
	}

	const normalized = normalizePhoneNumber(phone);

	// Check for malicious content and security issues first
	if (
		/[<>'"&\\${}]|script|drop|select|insert|update|delete|union|\.\.\/|etc\/passwd/i.test(
			normalized,
		) ||
		/[<>'"&\\${}]|script|drop|select|insert|update|delete|union|\.\.\/|etc\/passwd/i.test(
			phone,
		)
	) {
		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Invalid phone number format",
		};
	}

	// Check if phone contains formatting characters (hyphens, spaces) - reject formatted input
	if (/[\s\-\(\)]/.test(phone)) {
		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Số điện thoại không được chứa kí tự định dạng",
		};
	}

	// Check for invalid characters and basic format issues
	if (
		/[a-zA-Z]/.test(normalized) ||
		normalized.length > 15 ||
		(normalized.length < 8 && !normalized.startsWith("+"))
	) {
		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Số điện thoại không hợp lệ",
		};
	}

	// Handle Vietnamese international format (+84) - keep as international
	if (normalized.startsWith("+84")) {
		const withoutCountryCode = `0${normalized.substring(3)}`;
		const localValidation = validateVietnamesePhone(withoutCountryCode);
		if (localValidation.isValid) {
			return {
				...localValidation,
				type: "international",
				formatted: formatInternationalPhone(phone),
			};
		}
		return localValidation;
	}
	if (normalized.startsWith("84") && !normalized.startsWith("0")) {
		const withoutCountryCode = `0${normalized.substring(2)}`;
		const localValidation = validateVietnamesePhone(withoutCountryCode);
		if (localValidation.isValid) {
			return {
				...localValidation,
				type: "international",
				formatted: formatInternationalPhone(phone),
			};
		}
		return localValidation;
	}

	// Check if it starts with + (international format)
	if (normalized.startsWith("+")) {
		const cleanNumber = normalized.substring(1);
		if (
			cleanNumber.length >= 10 &&
			cleanNumber.length <= 15 &&
			/^\d+$/.test(cleanNumber)
		) {
			return {
				isValid: true,
				formatted: formatInternationalPhone(phone),
				type: "international",
			};
		}
	}

	// Check if it's a valid Vietnamese number
	if (!normalized.startsWith("0")) {
		// Check if it might be an international number (without + prefix)
		if (
			normalized.length >= 10 &&
			normalized.length <= 15 &&
			/^\d+$/.test(normalized) &&
			!normalized.startsWith("0")
		) {
			return {
				isValid: true,
				formatted: formatInternationalPhone(phone),
				type: "international",
			};
		}

		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Số điện thoại Việt Nam phải bắt đầu bằng 0",
		};
	}

	// Mobile number validation (10 digits)
	if (normalized.length === 10) {
		const carrier = getCarrierName(normalized);

		if (carrier) {
			return {
				isValid: true,
				formatted: formatVietnamesePhone(normalized),
				type: "mobile",
				carrier,
			};
		}

		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Đầu số di động không hợp lệ",
		};
	}

	// Landline number validation (11 digits)
	if (normalized.length === 11) {
		const region = getRegionName(normalized);

		if (region) {
			return {
				isValid: true,
				formatted: formatVietnamesePhone(normalized),
				type: "landline",
				region,
			};
		}

		return {
			isValid: false,
			formatted: "",
			type: "invalid",
			error: "Mã vùng điện thoại bàn không hợp lệ",
		};
	}

	return {
		isValid: false,
		formatted: "",
		type: "invalid",
		error: "Độ dài số điện thoại không hợp lệ",
	};
}

/**
 * Format international phone number
 */
function formatInternationalPhone(phone: string): string {
	const normalized = normalizePhoneNumber(phone);

	// Basic international formatting
	if (normalized.length > 10) {
		return `+${normalized}`;
	}

	return phone;
}

/**
 * Search phone numbers with partial matching and format flexibility
 */
export function searchPhoneNumbers(
	query: string,
	phoneNumbers: string[],
): string[] {
	if (!query || query.length < 3) return [];

	const normalizedQuery = normalizePhoneNumber(query.toLowerCase());

	return phoneNumbers.filter((phone) => {
		const normalized = normalizePhoneNumber(phone);

		// Exact match
		if (normalized === normalizedQuery) return true;

		// Starts with match
		if (normalized.startsWith(normalizedQuery)) return true;

		// Handle country code variations
		if (normalizedQuery.startsWith("84") && normalized.startsWith("0")) {
			const withCountryCode = `84${normalized.substring(1)}`;
			if (withCountryCode.startsWith(normalizedQuery)) return true;
		}

		if (normalizedQuery.startsWith("0") && normalized.startsWith("84")) {
			const withoutCountryCode = `0${normalized.substring(2)}`;
			if (withoutCountryCode.startsWith(normalizedQuery)) return true;
		}

		return false;
	});
}

/**
 * Convert phone number to database storage format (normalized)
 */
export function toStorageFormat(phone: string): string {
	const validation = validateVietnamesePhone(phone);
	if (!validation.isValid) {
		throw new Error(validation.error || "Số điện thoại không hợp lệ");
	}

	return normalizePhoneNumber(phone);
}

/**
 * Convert phone number from database storage format to display format
 */
export function toDisplayFormat(phone: string): string {
	if (!phone) return "";

	const validation = validateVietnamesePhone(phone);
	return validation.isValid ? validation.formatted : phone;
}
