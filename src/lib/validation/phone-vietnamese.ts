/**
 * Vietnamese Phone Number Validation and Formatting Utilities
 * Supports Vietnamese mobile and landline formats
 */

export interface PhoneValidationResult {
	isValid: boolean;
	formatted: string;
	type: "mobile" | "landline" | "international" | "invalid";
	carrier?: string;
	error?: string;
}

// Vietnamese mobile carriers and their prefixes
const VIETNAMESE_MOBILE_PREFIXES = {
	viettel: [
		"096",
		"097",
		"098",
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
	vinaphone: ["091", "094", "088", "083", "084", "085", "081", "082"],
	mobifone: ["090", "093", "089", "070", "079", "077", "076", "078"],
	vietnamobile: ["092", "052", "056", "058"],
	gmobile: ["099", "059"],
};

// Vietnamese landline area codes
const VIETNAMESE_LANDLINE_PREFIXES = [
	"024",
	"028", // Hanoi, Ho Chi Minh City
	"0203",
	"0204",
	"0205",
	"0206",
	"0207",
	"0208",
	"0209", // Regional codes
	"0213",
	"0214",
	"0215",
	"0216",
	"0218",
	"0220",
	"0221",
	"0222",
	"0225",
	"0226",
	"0227",
	"0228",
	"0229",
	"0232",
	"0233",
	"0234",
	"0235",
	"0236",
	"0237",
	"0238",
	"0239",
	"0251",
	"0252",
	"0254",
	"0255",
	"0256",
	"0258",
	"0259",
	"0260",
	"0261",
	"0262",
	"0263",
	"0269",
	"0270",
	"0271",
	"0272",
	"0273",
	"0274",
	"0275",
	"0276",
	"0277",
	"0290",
	"0291",
	"0292",
	"0293",
	"0294",
	"0296",
	"0297",
	"0299",
];

/**
 * Normalize phone number by removing spaces, dashes, and other formatting
 */
export function normalizePhoneNumber(phone: string): string {
	return phone.replace(/[\s\-\(\)\+]/g, "");
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
		// Mobile format: 0901 234 567
		return `${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
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

	for (const [carrier, prefixes] of Object.entries(
		VIETNAMESE_MOBILE_PREFIXES,
	)) {
		if (prefixes.includes(prefix)) {
			return carrier;
		}
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

	// Handle international format
	if (normalized.startsWith("84")) {
		const withoutCountryCode = `0${normalized.substring(2)}`;
		return validateVietnamesePhone(withoutCountryCode);
	}

	// Check if it's a valid Vietnamese number
	if (!normalized.startsWith("0")) {
		// Check if it might be an international number
		if (normalized.length > 10 && !normalized.startsWith("0")) {
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
		const isValidLandline = VIETNAMESE_LANDLINE_PREFIXES.some((p) =>
			normalized.startsWith(p),
		);

		if (isValidLandline) {
			return {
				isValid: true,
				formatted: formatVietnamesePhone(normalized),
				type: "landline",
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
