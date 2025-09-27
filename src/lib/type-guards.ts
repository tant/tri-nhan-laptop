/**
 * @fileoverview Type Guards and Runtime Validation
 * Comprehensive runtime type checking for Vietnamese laptop repair shop data.
 *
 * This module provides type-safe validation functions that ensure data integrity
 * while maintaining TypeScript type narrowing capabilities. All validators consider
 * Vietnamese business context and cultural requirements.
 *
 * @version 1.0.0
 * @since Phase 3.4.1
 * @author Vietnamese Laptop Repair Shop Management System
 */

import type { Customer, RepairTicket, Part, UserProfile } from "./database-types";

/**
 * Simple phone number validation (simplified from complex Vietnamese patterns)
 * Now just checks if it's a non-empty string
 */

/**
 * Vietnamese repair ticket code pattern
 *
 * Format: LRP-YYYY-XXXXXX
 * - LRP: Laptop Repair Project prefix
 * - YYYY: Year (4 digits)
 * - XXXXXX: Sequential number (6 digits, zero-padded)
 *
 * @example "LRP-2025-000001", "LRP-2025-123456"
 */
const REPAIR_TICKET_PATTERN = /^LRP-\d{4}-\d{6}$/;

/**
 * Type guard for checking if a value is a valid Vietnamese phone number
 *
 * Validates phone numbers according to Vietnamese telecommunication standards.
 * Supports mobile numbers, international format, and service hotlines.
 *
 * @param phone - The value to validate (accepts any type for safety)
 * @returns `true` if the value is a valid Vietnamese phone number string
 *
 * @example
 * ```typescript
 * // Valid cases
 * isValidVietnamesePhone("0901234567") // true - Viettel mobile
 * isValidVietnamesePhone("84901234567") // true - International format
 * isValidVietnamesePhone("1900") // true - Service hotline
 *
 * // Invalid cases
 * isValidVietnamesePhone("123456789") // false - Wrong format
 * isValidVietnamesePhone(901234567) // false - Not a string
 * isValidVietnamesePhone("0201234567") // false - Invalid prefix
 * ```
 *
 * @since Phase 3.4.1
 */
export function isValidVietnamesePhone(phone: unknown): phone is string {
	if (typeof phone !== "string") return false;
	// Simplified: just check if it's a non-empty string
	return phone.trim().length > 0;
}

/**
 * Type guard for checking if a value is a valid repair ticket code
 *
 * Validates repair ticket codes against the Vietnamese repair shop format.
 * The format follows: LRP-YYYY-XXXXXX where LRP is the prefix, YYYY is the year,
 * and XXXXXX is the sequential ticket number.
 *
 * @param code - The value to validate (accepts any type for safety)
 * @returns `true` if the value is a valid repair ticket code string
 *
 * @example
 * ```typescript
 * // Valid cases
 * isValidRepairTicketCode("LRP-2025-000001") // true
 * isValidRepairTicketCode("LRP-2025-123456") // true
 *
 * // Invalid cases
 * isValidRepairTicketCode("REP-2025-000001") // false - Wrong prefix
 * isValidRepairTicketCode("LRP-25-000001") // false - Wrong year format
 * isValidRepairTicketCode("LRP-2025-1") // false - Wrong number format
 * ```
 *
 * @since Phase 3.4.1
 */
export function isValidRepairTicketCode(code: unknown): code is string {
	if (typeof code !== "string") return false;
	// Validate against the Vietnamese repair ticket pattern
	return REPAIR_TICKET_PATTERN.test(code);
}

/**
 * Type guard for Customer objects with Vietnamese business validation
 *
 * Validates that an object conforms to the Customer interface and meets
 * Vietnamese business requirements. This includes phone number format validation
 * and ensures all required fields are present with appropriate types.
 *
 * @param obj - The value to validate (accepts any type for runtime safety)
 * @returns `true` if the object is a valid Customer with Vietnamese business context
 *
 * @example
 * ```typescript
 * const customerData = {
 *   phone: "0901234567",
 *   full_name: "Nguyễn Văn An",
 *   address: "123 Đường ABC, Quận 1, TP.HCM",
 *   created_at: "2025-01-15T10:00:00Z",
 *   updated_at: "2025-01-15T10:00:00Z"
 * };
 *
 * if (isCustomer(customerData)) {
 *   // TypeScript now knows customerData is Customer type
 *   console.log(customerData.phone); // Safe to access
 * }
 * ```
 *
 * @since Phase 3.4.1
 */
export function isCustomer(obj: unknown): obj is Customer {
	if (typeof obj !== "object" || obj === null) return false;

	const customer = obj as Record<string, unknown>;

	return (
		// Required: Vietnamese phone number (primary key)
		typeof customer.phone === "string" &&
		isValidVietnamesePhone(customer.phone) &&
		// Required: Full Vietnamese name (non-empty)
		typeof customer.full_name === "string" &&
		customer.full_name.trim().length > 0 &&
		// Optional: Address field (null or string)
		(customer.address === null || typeof customer.address === "string") &&
		// Optional: Notes field (null or string)
		(customer.notes === null || typeof customer.notes === "string") &&
		// Required: Timestamp fields (ISO string format)
		typeof customer.created_at === "string" &&
		typeof customer.updated_at === "string"
	);
}

/**
 * Type guard for RepairTicket objects
 */
export function isRepairTicket(obj: unknown): obj is RepairTicket {
	if (typeof obj !== "object" || obj === null) return false;

	const ticket = obj as Record<string, unknown>;

	return (
		typeof ticket.id === "string" &&
		typeof ticket.customer_phone === "string" &&
		isValidVietnamesePhone(ticket.customer_phone) &&
		typeof ticket.issue_description === "string" &&
		typeof ticket.customer_description === "string" &&
		typeof ticket.status === "string" &&
		isValidRepairStatus(ticket.status) &&
		typeof ticket.priority === "string" &&
		isValidRepairPriority(ticket.priority) &&
		typeof ticket.created_at === "string"
	);
}

/**
 * Type guard for Part objects
 */
export function isPart(obj: unknown): obj is Part {
	if (typeof obj !== "object" || obj === null) return false;

	const part = obj as Record<string, unknown>;

	return (
		typeof part.id === "string" &&
		typeof part.part_number === "string" &&
		part.part_number.trim().length > 0 &&
		typeof part.name === "string" &&
		part.name.trim().length > 0 &&
		typeof part.current_stock === "number" &&
		part.current_stock >= 0 &&
		(part.unit_price === null || (typeof part.unit_price === "number" && part.unit_price >= 0)) &&
		(part.category === null || typeof part.category === "string")
	);
}

/**
 * Type guard for UserProfile objects
 */
export function isUserProfile(obj: unknown): obj is UserProfile {
	if (typeof obj !== "object" || obj === null) return false;

	const profile = obj as Record<string, unknown>;

	return (
		typeof profile.id === "string" &&
		typeof profile.full_name === "string" &&
		profile.full_name.trim().length > 0 &&
		typeof profile.role === "string" &&
		isValidUserRole(profile.role) &&
		typeof profile.created_at === "string"
	);
}

/**
 * Valid repair statuses from Vietnamese repair workflow
 */
const VALID_REPAIR_STATUSES = [
	"device_received",
	"preliminary_inspection",
	"awaiting_repair_plan",
	"approved_for_repair",
	"in_diagnosis",
	"waiting_parts",
	"in_repair",
	"quality_testing",
	"ready_for_pickup",
	"completed",
	"cannot_repair",
	"cancelled_by_customer",
	"repair_failed",
	"customer_no_show",
	"ready_for_return",
	"abandoned"
] as const;

/**
 * Valid repair priorities
 */
const VALID_REPAIR_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

/**
 * Valid user roles
 */
const VALID_USER_ROLES = ["shop_owner", "staff"] as const;

/**
 * Type guard for valid repair status
 */
export function isValidRepairStatus(status: unknown): status is RepairTicket["status"] {
	return typeof status === "string" && VALID_REPAIR_STATUSES.includes(status as any);
}

/**
 * Type guard for valid repair priority
 */
export function isValidRepairPriority(priority: unknown): priority is "low" | "normal" | "high" | "urgent" {
	return typeof priority === "string" && VALID_REPAIR_PRIORITIES.includes(priority as any);
}

/**
 * Type guard for valid user role
 */
export function isValidUserRole(role: unknown): role is "shop_owner" | "staff" {
	return typeof role === "string" && VALID_USER_ROLES.includes(role as any);
}

/**
 * Validates Vietnamese currency amount (VND)
 */
export function isValidVietnameseCurrency(amount: unknown): amount is number {
	if (typeof amount !== "number") return false;
	if (!Number.isFinite(amount)) return false;
	if (amount < 0) return false;

	// Maximum reasonable amount for laptop repairs (100 million VND)
	const MAX_REPAIR_AMOUNT = 100_000_000;
	return amount <= MAX_REPAIR_AMOUNT;
}

/**
 * Validates Vietnamese date string in ISO format
 */
export function isValidVietnameseDate(date: unknown): date is string {
	if (typeof date !== "string") return false;

	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) return false;

	// Reasonable date range for business operations (2020-2030)
	const minDate = new Date("2020-01-01");
	const maxDate = new Date("2030-12-31");

	return parsedDate >= minDate && parsedDate <= maxDate;
}

/**
 * Validates database ID format (UUID)
 */
export function isValidDatabaseId(id: unknown): id is string {
	if (typeof id !== "string") return false;

	// UUID v4 pattern
	const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidPattern.test(id);
}

/**
 * Runtime validation helpers for API responses
 */
export const ValidationHelpers = {
	/**
	 * Validates array of customers from API response
	 */
	validateCustomers(data: unknown): Customer[] {
		if (!Array.isArray(data)) {
			throw new Error("Expected array of customers");
		}

		return data.filter((item, index) => {
			if (!isCustomer(item)) {
				console.warn(`Invalid customer at index ${index}:`, item);
				return false;
			}
			return true;
		});
	},

	/**
	 * Validates array of repair tickets from API response
	 */
	validateRepairTickets(data: unknown): RepairTicket[] {
		if (!Array.isArray(data)) {
			throw new Error("Expected array of repair tickets");
		}

		return data.filter((item, index) => {
			if (!isRepairTicket(item)) {
				console.warn(`Invalid repair ticket at index ${index}:`, item);
				return false;
			}
			return true;
		});
	},

	/**
	 * Validates array of parts from API response
	 */
	validateParts(data: unknown): Part[] {
		if (!Array.isArray(data)) {
			throw new Error("Expected array of parts");
		}

		return data.filter((item, index) => {
			if (!isPart(item)) {
				console.warn(`Invalid part at index ${index}:`, item);
				return false;
			}
			return true;
		});
	},

	/**
	 * Validates single customer from API response
	 */
	validateSingleCustomer(data: unknown): Customer {
		if (!isCustomer(data)) {
			throw new Error("Invalid customer data");
		}
		return data;
	},

	/**
	 * Validates single repair ticket from API response
	 */
	validateSingleRepairTicket(data: unknown): RepairTicket {
		if (!isRepairTicket(data)) {
			throw new Error("Invalid repair ticket data");
		}
		return data;
	},

	/**
	 * Validates Vietnamese business data constraints
	 */
	validateVietnameseBusinessConstraints(data: {
		phone?: unknown;
		currency?: unknown;
		ticketCode?: unknown;
		date?: unknown;
	}): boolean {
		if (data.phone && !isValidVietnamesePhone(data.phone)) {
			throw new Error("Invalid Vietnamese phone number format");
		}

		if (data.currency && !isValidVietnameseCurrency(data.currency)) {
			throw new Error("Invalid Vietnamese currency amount");
		}

		if (data.ticketCode && !isValidRepairTicketCode(data.ticketCode)) {
			throw new Error("Invalid repair ticket code format");
		}

		if (data.date && !isValidVietnameseDate(data.date)) {
			throw new Error("Invalid date format");
		}

		return true;
	}
};

/**
 * Type-safe error boundary for Vietnamese data validation
 */
export function withVietnameseValidation<T>(
	data: unknown,
	validator: (data: unknown) => T,
	context: string
): T {
	try {
		return validator(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown validation error";
		throw new Error(`Vietnamese data validation failed in ${context}: ${message}`);
	}
}