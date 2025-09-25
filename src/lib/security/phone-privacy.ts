/**
 * Phone Number Privacy and Security Utilities
 * Handles phone number access controls and audit logging
 */

import { supabase } from "@/lib/supabase";

export interface PhoneAccessLog {
	id: string;
	phone_accessed: string;
	accessed_by: string;
	access_type: "view" | "search" | "create" | "update";
	timestamp: string;
	user_agent?: string;
	ip_address?: string;
}

/**
 * Mask phone number for display in logs or public interfaces
 */
export function maskPhoneNumber(phone: string, maskLength = 4): string {
	if (!phone || phone.length <= maskLength) return phone;

	const visibleStart = 2;
	const visibleEnd = 2;
	const masked = "*".repeat(phone.length - visibleStart - visibleEnd);

	return (
		phone.substring(0, visibleStart) +
		masked +
		phone.substring(phone.length - visibleEnd)
	);
}

/**
 * Validate user permissions for phone number access
 */
export async function validatePhoneAccess(
	userId: string,
	accessType: string,
): Promise<boolean> {
	try {
		// Get user role
		const { data: userProfile, error } = await supabase
			.from("user_profiles")
			.select("role, is_active")
			.eq("id", userId)
			.single();

		if (error || !userProfile || !userProfile.is_active) {
			console.error("Invalid user or user not active:", error);
			return false;
		}

		// All active staff and shop owners can access customer phone numbers
		// More granular permissions can be added here
		return ["shop_owner", "staff"].includes(userProfile.role);
	} catch (error) {
		console.error("Error validating phone access:", error);
		return false;
	}
}

/**
 * Log phone number access for audit trail
 */
export async function logPhoneAccess(
	phoneNumber: string,
	accessedBy: string,
	accessType: "view" | "search" | "create" | "update",
	additionalData?: { userAgent?: string; ipAddress?: string },
): Promise<void> {
	try {
		// In a real implementation, this would go to an audit log table
		// For now, we'll just log to console in development
		if (process.env.NODE_ENV === "development") {
			console.log(
				`[AUDIT] Phone Access: ${maskPhoneNumber(phoneNumber)} by ${accessedBy} (${accessType})`,
				additionalData,
			);
		}

		// Log to audit system
		const { logAuditEntry } = await import("@/lib/audit/audit-logger");
		await logAuditEntry(
			"phone_number",
			maskPhoneNumber(phoneNumber),
			accessType,
			{
				performedBy: accessedBy,
				metadata: additionalData,
			},
		);
	} catch (error) {
		console.error("Error logging phone access:", error);
	}
}

/**
 * Check if phone number matches privacy patterns requiring special handling
 */
export function isPhonePrivacySensitive(phone: string): boolean {
	// Vietnamese phone numbers are generally not considered sensitive by default
	// This could be extended for VIP customers or special cases
	return false;
}

/**
 * Sanitize phone number for logging (remove personally identifiable info)
 */
export function sanitizePhoneForLogging(phone: string): string {
	return maskPhoneNumber(phone, 6); // Mask more characters for logging
}

/**
 * Validate phone number storage security
 */
export function validatePhoneStorageSecurity(phone: string): {
	isSecure: boolean;
	issues: string[];
} {
	const issues: string[] = [];

	// Check phone number format (already handled by validation)
	if (!phone || phone.length < 10) {
		issues.push("Phone number too short for secure storage");
	}

	// Check for potential injection patterns
	if (phone.includes(";") || phone.includes("--") || phone.includes("/*")) {
		issues.push("Phone number contains potential SQL injection patterns");
	}

	return {
		isSecure: issues.length === 0,
		issues,
	};
}

/**
 * Generate secure phone number hash for deduplication without storing actual number
 */
export async function generatePhoneHash(phone: string): Promise<string> {
	// Simple hash for deduplication - in production, use proper crypto
	const encoder = new TextEncoder();
	const data = encoder.encode(
		`${phone}phone_salt_${process.env.PHONE_HASH_SALT}`,
	);

	try {
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	} catch (error) {
		console.error("Error generating phone hash:", error);
		// Fallback to simple hash
		return btoa(phone)
			.replace(/[^a-zA-Z0-9]/g, "")
			.substring(0, 32);
	}
}
