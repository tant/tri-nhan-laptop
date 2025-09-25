/**
 * Comprehensive Audit Logging System
 * Handles all system access logging and security tracking
 */

import { supabase } from "@/lib/supabase";

export interface AuditLogEntry {
	id?: string;
	resourceType: string;
	resourceId: string;
	action: string;
	performedBy?: string;
	performedByRole?: string;
	ipAddress?: string;
	userAgent?: string;
	sessionId?: string;
	success: boolean;
	errorMessage?: string;
	metadata?: Record<string, unknown>;
	createdAt?: string;
}

export interface CustomerAccessLog {
	id?: string;
	customerPhoneMasked: string;
	accessType: string;
	accessedBy?: string;
	accessSource: string;
	dataAccessed?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	success: boolean;
	privacyConsentVerified?: boolean;
	createdAt?: string;
}

export interface RateLimitResult {
	allowed: boolean;
	currentCount: number;
	maxRequests: number;
	windowEnd: string;
	remaining?: number;
	resetTime: string;
	blockedUntil?: string;
}

/**
 * Log a general audit entry for system actions
 */
export async function logAuditEntry(
	resourceType: string,
	resourceId: string,
	action: string,
	options: {
		performedBy?: string;
		ipAddress?: string;
		userAgent?: string;
		metadata?: Record<string, unknown>;
		success?: boolean;
		errorMessage?: string;
	} = {},
): Promise<string | null> {
	try {
		const { data, error } = await supabase.rpc("log_audit_entry", {
			p_resource_type: resourceType,
			p_resource_id: resourceId,
			p_action: action,
			p_performed_by: options.performedBy || null,
			p_ip_address: options.ipAddress || null,
			p_user_agent: options.userAgent || null,
			p_metadata: options.metadata || null,
		});

		if (error) {
			console.error("Failed to log audit entry:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Error logging audit entry:", error);
		return null;
	}
}

/**
 * Log customer data access for privacy compliance
 */
export async function logCustomerAccess(
	customerPhoneMasked: string,
	accessType: string,
	accessSource: string,
	options: {
		dataAccessed?: Record<string, unknown>;
		accessedBy?: string;
		ipAddress?: string;
		userAgent?: string;
		privacyConsentVerified?: boolean;
	} = {},
): Promise<string | null> {
	try {
		const { data, error } = await supabase.rpc("log_customer_access", {
			p_customer_phone_masked: customerPhoneMasked,
			p_access_type: accessType,
			p_access_source: accessSource,
			p_data_accessed: options.dataAccessed || null,
			p_accessed_by: options.accessedBy || null,
			p_ip_address: options.ipAddress || null,
			p_user_agent: options.userAgent || null,
		});

		if (error) {
			console.error("Failed to log customer access:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Error logging customer access:", error);
		return null;
	}
}

/**
 * Check rate limit for API endpoint or action
 */
export async function checkRateLimit(
	identifier: string,
	identifierType: "ip" | "user" | "phone",
	endpoint: string,
	options: {
		windowMinutes?: number;
		maxRequests?: number;
	} = {},
): Promise<RateLimitResult | null> {
	try {
		const { data, error } = await supabase.rpc("check_rate_limit", {
			p_identifier: identifier,
			p_identifier_type: identifierType,
			p_endpoint: endpoint,
			p_window_minutes: options.windowMinutes || 60,
			p_max_requests: options.maxRequests || 100,
		});

		if (error) {
			console.error("Failed to check rate limit:", error);
			return null;
		}

		return data as RateLimitResult;
	} catch (error) {
		console.error("Error checking rate limit:", error);
		return null;
	}
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(headers?: Record<string, string>): string {
	if (!headers) return "unknown";

	// Check common IP headers
	const ipHeaders = [
		"x-forwarded-for",
		"x-real-ip",
		"x-client-ip",
		"cf-connecting-ip",
		"x-forwarded",
		"forwarded-for",
		"forwarded",
	];

	for (const header of ipHeaders) {
		const ip = headers[header];
		if (ip) {
			// Take first IP if comma-separated
			return ip.split(",")[0].trim();
		}
	}

	return "unknown";
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(headers?: Record<string, string>): string {
	if (!headers) return "unknown";
	return headers["user-agent"] || "unknown";
}

/**
 * Audit logging wrapper for customer data access
 */
export async function auditCustomerDataAccess<T>(
	customerPhone: string,
	accessType: string,
	accessSource: string,
	operation: () => Promise<T>,
	options: {
		ipAddress?: string;
		userAgent?: string;
		dataDescription?: string;
	} = {},
): Promise<T> {
	const startTime = Date.now();
	let success = false;
	let error: unknown = null;
	let result: T;

	try {
		// Perform the operation
		result = await operation();
		success = true;
		return result;
	} catch (err) {
		error = err;
		throw err;
	} finally {
		// Log the access attempt
		const maskedPhone = maskPhoneNumber(customerPhone);
		const executionTime = Date.now() - startTime;

		await logCustomerAccess(maskedPhone, accessType, accessSource, {
			dataAccessed: {
				description: options.dataDescription,
				executionTime,
				success,
				error: error ? String(error) : undefined,
			},
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
		});

		// Also log general audit entry
		await logAuditEntry("customer", maskedPhone, accessType, {
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			success,
			errorMessage: error ? String(error) : undefined,
			metadata: {
				accessSource,
				executionTime,
			},
		});
	}
}

/**
 * Audit logging wrapper for repair ticket operations
 */
export async function auditRepairTicketAccess<T>(
	ticketCode: string,
	action: string,
	operation: () => Promise<T>,
	options: {
		ipAddress?: string;
		userAgent?: string;
		accessSource?: string;
		userId?: string;
	} = {},
): Promise<T> {
	const startTime = Date.now();
	let success = false;
	let error: unknown = null;
	let result: T;

	try {
		result = await operation();
		success = true;
		return result;
	} catch (err) {
		error = err;
		throw err;
	} finally {
		const executionTime = Date.now() - startTime;

		await logAuditEntry("repair_ticket", ticketCode, action, {
			performedBy: options.userId,
			ipAddress: options.ipAddress,
			userAgent: options.userAgent,
			success,
			errorMessage: error ? String(error) : undefined,
			metadata: {
				accessSource: options.accessSource || "unknown",
				executionTime,
			},
		});
	}
}

/**
 * Mask phone number for audit logging
 */
function maskPhoneNumber(phone: string): string {
	if (!phone || phone.length <= 4) return phone;

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
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
	// Public repair lookup - stricter limits
	PUBLIC_LOOKUP: {
		windowMinutes: 15,
		maxRequests: 10,
	},
	// Customer search by staff
	CUSTOMER_SEARCH: {
		windowMinutes: 60,
		maxRequests: 500,
	},
	// Repair ticket operations
	TICKET_OPERATIONS: {
		windowMinutes: 60,
		maxRequests: 200,
	},
	// General API operations
	GENERAL_API: {
		windowMinutes: 60,
		maxRequests: 1000,
	},
} as const;

/**
 * Audit configuration for different resource types
 */
export const AUDIT_CONFIG = {
	CUSTOMER: {
		resourceType: "customer",
		actions: {
			VIEW: "view_profile",
			SEARCH: "search",
			CREATE: "create_profile",
			UPDATE: "update_profile",
			DELETE: "delete_profile",
		},
	},
	REPAIR_TICKET: {
		resourceType: "repair_ticket",
		actions: {
			VIEW: "view_ticket",
			CREATE: "create_ticket",
			UPDATE: "update_ticket",
			STATUS_CHANGE: "status_change",
			PUBLIC_LOOKUP: "public_lookup",
		},
	},
	PUBLIC_INTERFACE: {
		resourceType: "public_interface",
		actions: {
			LOOKUP_ATTEMPT: "lookup_attempt",
			INVALID_LOOKUP: "invalid_lookup",
			RATE_LIMITED: "rate_limited",
		},
	},
} as const;
