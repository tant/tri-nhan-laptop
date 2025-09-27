/**
 * Simple phone utilities - just basic string operations and formatting
 * Replaces complex Vietnamese phone validation with simple approach
 */

/**
 * Simple phone validation - just check if it's a non-empty string
 */
export function isValidPhone(phone: string): boolean {
	return !!(phone && phone.trim().length > 0);
}

/**
 * Basic phone formatting for display (just clean up extra whitespace)
 */
export function formatPhoneDisplay(phone: string): string {
	if (!phone) return "";

	// Just clean up excessive whitespace and return as-is
	return phone.trim().replace(/\s+/g, " ");
}

/**
 * Normalize phone for storage - just trim whitespace
 */
export function normalizePhone(phone: string): string {
	if (!phone) return "";
	return phone.trim();
}

/**
 * Simple phone validation result for compatibility
 */
export interface SimplePhoneValidation {
	isValid: boolean;
	error?: string;
}

/**
 * Simple phone validation - just check if not empty
 */
export function validatePhone(phone: string): SimplePhoneValidation {
	if (!phone || !phone.trim()) {
		return {
			isValid: false,
			error: "Số điện thoại không được để trống",
		};
	}

	return {
		isValid: true,
	};
}
