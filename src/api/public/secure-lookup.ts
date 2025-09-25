/**
 * Secure Public Repair Lookup API
 * Handles public repair status lookups with comprehensive security measures
 */

import { supabase } from "@/lib/supabase";
import {
	auditRepairTicketAccess,
	checkRateLimit,
	getClientIP,
	getUserAgent,
	logAuditEntry,
	RATE_LIMITS,
	AUDIT_CONFIG,
} from "@/lib/audit/audit-logger";
import { maskPhoneNumber } from "@/lib/security/phone-privacy";
import { translateStatusForCustomer } from "@/lib/translation/status-translator";
import { filterCustomerData } from "@/lib/security/customer-data-filter";

export interface PublicLookupRequest {
	phone: string;
	ticketCode: string;
}

export interface PublicLookupResponse {
	success: boolean;
	data?: {
		ticketCode: string;
		customerName: string;
		deviceInfo: string;
		status: {
			current: string;
			description: string;
			vietnameseLabel: string;
			estimatedCompletion?: string;
			progressPercentage: number;
		};
		createdAt: string;
		lastUpdated: string;
		shopInfo: {
			name: string;
			phone: string;
			address: string;
			hours: string;
		};
	};
	error?: string;
	rateLimitInfo?: {
		remaining: number;
		resetTime: string;
	};
}

export interface SecurityHeaders {
	[key: string]: string;
}

/**
 * Secure public repair lookup with comprehensive security measures
 */
export async function secureRepairLookup(
	request: PublicLookupRequest,
	headers: Record<string, string> = {},
): Promise<PublicLookupResponse> {
	const clientIP = getClientIP(headers);
	const userAgent = getUserAgent(headers);
	const timestamp = new Date().toISOString();

	// 1. Rate Limiting Check
	const rateLimitResult = await checkRateLimit(
		clientIP,
		"ip",
		"public_lookup",
		RATE_LIMITS.PUBLIC_LOOKUP,
	);

	if (!rateLimitResult?.allowed) {
		// Log rate limit violation
		await logAuditEntry(
			AUDIT_CONFIG.PUBLIC_INTERFACE.resourceType,
			clientIP,
			AUDIT_CONFIG.PUBLIC_INTERFACE.actions.RATE_LIMITED,
			{
				ipAddress: clientIP,
				userAgent,
				success: false,
				errorMessage: "Rate limit exceeded",
				metadata: {
					phone: maskPhoneNumber(request.phone),
					ticketCode: request.ticketCode,
					rateLimitInfo: rateLimitResult,
				},
			},
		);

		return {
			success: false,
			error: "Quá nhiều yêu cầu tra cứu. Vui lòng thử lại sau.",
			rateLimitInfo: rateLimitResult
				? {
						remaining: rateLimitResult.remaining || 0,
						resetTime: rateLimitResult.resetTime,
					}
				: undefined,
		};
	}

	// 2. Input Validation and Sanitization
	const validationResult = validateLookupInput(request);
	if (!validationResult.valid) {
		await logAuditEntry(
			AUDIT_CONFIG.PUBLIC_INTERFACE.resourceType,
			clientIP,
			AUDIT_CONFIG.PUBLIC_INTERFACE.actions.INVALID_LOOKUP,
			{
				ipAddress: clientIP,
				userAgent,
				success: false,
				errorMessage: validationResult.error,
				metadata: {
					phone: maskPhoneNumber(request.phone),
					ticketCode: request.ticketCode,
				},
			},
		);

		return {
			success: false,
			error: validationResult.error,
			rateLimitInfo: {
				remaining: rateLimitResult.remaining || 0,
				resetTime: rateLimitResult.resetTime,
			},
		};
	}

	// 3. Secure Database Lookup
	try {
		const lookupResult = await auditRepairTicketAccess(
			request.ticketCode,
			AUDIT_CONFIG.REPAIR_TICKET.actions.PUBLIC_LOOKUP,
			async () => {
				return await performSecureLookup(request.phone, request.ticketCode);
			},
			{
				ipAddress: clientIP,
				userAgent,
				accessSource: "public_interface",
			},
		);

		if (!lookupResult) {
			return {
				success: false,
				error: "Không tìm thấy thông tin phiếu sửa chữa với số điện thoại và mã phiếu này.",
				rateLimitInfo: {
					remaining: rateLimitResult.remaining || 0,
					resetTime: rateLimitResult.resetTime,
				},
			};
		}

		// 4. Filter and Transform Data for Public Display
		const publicData = await transformForPublicDisplay(lookupResult);

		return {
			success: true,
			data: publicData,
			rateLimitInfo: {
				remaining: rateLimitResult.remaining || 0,
				resetTime: rateLimitResult.resetTime,
			},
		};
	} catch (error) {
		console.error("Secure lookup error:", error);

		await logAuditEntry(
			AUDIT_CONFIG.REPAIR_TICKET.resourceType,
			request.ticketCode,
			AUDIT_CONFIG.REPAIR_TICKET.actions.PUBLIC_LOOKUP,
			{
				ipAddress: clientIP,
				userAgent,
				success: false,
				errorMessage: String(error),
				metadata: {
					phone: maskPhoneNumber(request.phone),
				},
			},
		);

		return {
			success: false,
			error: "Có lỗi xảy ra khi tra cứu thông tin. Vui lòng thử lại sau.",
			rateLimitInfo: {
				remaining: rateLimitResult.remaining || 0,
				resetTime: rateLimitResult.resetTime,
			},
		};
	}
}

/**
 * Validate and sanitize lookup input
 */
function validateLookupInput(request: PublicLookupRequest): {
	valid: boolean;
	error?: string;
} {
	// Phone validation
	if (!request.phone) {
		return { valid: false, error: "Vui lòng nhập số điện thoại." };
	}

	const phonePattern = /^(0[3-9])\d{8}$/;
	if (!phonePattern.test(request.phone.replace(/\s+/g, ""))) {
		return {
			valid: false,
			error: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam.",
		};
	}

	// Ticket code validation
	if (!request.ticketCode) {
		return { valid: false, error: "Vui lòng nhập mã phiếu sửa chữa." };
	}

	const ticketPattern = /^LRP-\d{4}-\d{6}$/;
	if (!ticketPattern.test(request.ticketCode.trim().toUpperCase())) {
		return {
			valid: false,
			error: "Mã phiếu sửa chữa không hợp lệ. Định dạng: LRP-YYYY-XXXXXX",
		};
	}

	// Check for potential injection attempts
	const dangerousPatterns = [
		/[<>'"`;]/,
		/union.*select/i,
		/drop.*table/i,
		/insert.*into/i,
		/delete.*from/i,
	];

	for (const pattern of dangerousPatterns) {
		if (pattern.test(request.phone) || pattern.test(request.ticketCode)) {
			return {
				valid: false,
				error: "Dữ liệu nhập không hợp lệ.",
			};
		}
	}

	return { valid: true };
}

/**
 * Perform secure database lookup with RLS policies
 */
async function performSecureLookup(phone: string, ticketCode: string) {
	const { data, error } = await supabase
		.from("repair_tickets")
		.select(
			`
			ticket_code,
			customer_phone,
			customer_name,
			device_type,
			device_model,
			device_brand,
			issue_description,
			current_status,
			estimated_completion_date,
			created_at,
			last_status_update,
			customers!repair_tickets_customer_phone_fkey (
				full_name,
				phone
			)
		`,
		)
		.eq("customer_phone", phone.trim())
		.eq("ticket_code", ticketCode.trim().toUpperCase())
		.single();

	if (error) {
		console.error("Database lookup error:", error);
		return null;
	}

	return data;
}

/**
 * Transform internal data for safe public display
 */
async function transformForPublicDisplay(
	ticketData: any,
): Promise<PublicLookupResponse["data"]> {
	// Filter sensitive data
	const filteredData = filterCustomerData(ticketData, {
		accessLevel: "public",
		includeInternalNotes: false,
		includeCostInfo: false,
	});

	// Translate status for customer
	const customerStatus = await translateStatusForCustomer(
		filteredData.current_status,
	);

	// Calculate progress percentage
	const progressPercentage = calculateProgressPercentage(
		filteredData.current_status,
	);

	return {
		ticketCode: filteredData.ticket_code,
		customerName: filteredData.customer_name || "Khách hàng",
		deviceInfo: `${filteredData.device_brand || ""} ${
			filteredData.device_model || ""
		}`.trim(),
		status: {
			current: filteredData.current_status,
			description: filteredData.issue_description || "Đang xử lý",
			vietnameseLabel: customerStatus.vietnameseLabel,
			estimatedCompletion: filteredData.estimated_completion_date,
			progressPercentage,
		},
		createdAt: filteredData.created_at,
		lastUpdated: filteredData.last_status_update || filteredData.created_at,
		shopInfo: {
			name: "Laptop Repair Pro",
			phone: "0123 456 789",
			address: "123 Đường ABC, Quận 1, TP.HCM",
			hours: "8:00 - 18:00 (Thứ 2 - Thứ 7)",
		},
	};
}

/**
 * Calculate repair progress percentage based on status
 */
function calculateProgressPercentage(status: string): number {
	const statusProgress: Record<string, number> = {
		pending_customer_confirmation: 5,
		confirmed: 10,
		device_received: 15,
		initial_diagnosis: 25,
		diagnosis_complete: 35,
		quote_provided: 40,
		quote_approved: 45,
		parts_ordered: 55,
		parts_received: 60,
		repair_in_progress: 70,
		repair_complete: 85,
		quality_check: 90,
		ready_for_pickup: 95,
		completed: 100,
		cancelled: 0,
		on_hold: 50,
	};

	return statusProgress[status] || 0;
}

/**
 * Generate security headers for public API responses
 */
export function generateSecurityHeaders(): SecurityHeaders {
	return {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"X-XSS-Protection": "1; mode=block",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Content-Security-Policy": "default-src 'self'",
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
		"Cache-Control": "no-store, no-cache, must-revalidate, private",
		"Pragma": "no-cache",
		"Expires": "0",
	};
}

/**
 * Validate request origin and headers
 */
export function validateRequestSecurity(
	headers: Record<string, string>,
): boolean {
	// Check for required headers
	const requiredHeaders = ["user-agent"];
	for (const header of requiredHeaders) {
		if (!headers[header]) {
			return false;
		}
	}

	// Check for suspicious patterns in User-Agent
	const userAgent = headers["user-agent"];
	const suspiciousPatterns = [
		/bot/i,
		/crawler/i,
		/spider/i,
		/scraper/i,
		/automated/i,
	];

	// Allow legitimate bots but block obvious scrapers
	const allowedBots = [/googlebot/i, /bingbot/i];
	const isAllowedBot = allowedBots.some((pattern) =>
		pattern.test(userAgent),
	);
	const isSuspicious = suspiciousPatterns.some((pattern) =>
		pattern.test(userAgent),
	);

	if (isSuspicious && !isAllowedBot) {
		return false;
	}

	return true;
}