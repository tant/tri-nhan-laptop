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
 * Basic phone formatting for display (add spaces for readability)
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";

  // Clean the phone number first
  const cleaned = phone.replace(/\s+/g, '');

  // Add spaces for readability if it looks like a phone number
  if (cleaned.length >= 10) {
    // Format: XXXX XXX XXX
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return cleaned;
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
      error: "Số điện thoại không được để trống"
    };
  }

  return {
    isValid: true
  };
}

/**
 * Legacy compatibility - alias functions for existing code
 */
export const toStorageFormat = normalizePhone;
export const toDisplayFormat = formatPhoneDisplay;
export const normalizePhoneNumber = normalizePhone;
export const validateVietnamesePhone = validatePhone;
export const formatVietnamesePhone = formatPhoneDisplay;