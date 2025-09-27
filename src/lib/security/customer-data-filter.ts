/**
 * Simplified Customer Data Filtering System
 * Filters and transforms customer data based on access level and privacy requirements
 * Updated for simplified customer structure: phone, full_name, address only
 */

import { maskPhoneNumber } from "./phone-privacy";

export interface DataFilterOptions {
	accessLevel: "admin" | "staff" | "public" | "customer";
	includeInternalNotes?: boolean;
	includeCostInfo?: boolean;
	includeStaffInfo?: boolean;
	includeSensitiveData?: boolean;
	includeHistoricalData?: boolean;
}

export interface FilteredCustomerData {
	// Basic customer info (simplified structure)
	phone?: string; // May be masked based on access level
	full_name?: string; // May be partially masked
	address?: string; // May be filtered or masked

	// Timestamps (filtered based on access level)
	created_at?: string;
	updated_at?: string;

	// Filtered metadata
	metadata?: Record<string, unknown>;
}

export interface FilteredRepairData {
	// Always included basic info
	id?: string;
	ticket_code?: string;
	customer_phone?: string; // Masked based on access level
	status?: string;

	// Cost info (filtered based on access level)
	total_cost?: number;
	deposit_amount?: number;

	// Device info (basic)
	device_brand?: string;
	device_model?: string;

	// Timestamps
	created_at?: string;
	estimated_completion?: string;

	// Filtered metadata
	metadata?: Record<string, unknown>;
}

/**
 * Filter customer data based on access level and privacy settings
 */
export function filterCustomerData(
	customerData: any,
	options: DataFilterOptions,
): FilteredCustomerData {
	const { accessLevel, includeSensitiveData = false } = options;

	const filtered: FilteredCustomerData = {};

	// Phone number filtering
	if (customerData.phone) {
		switch (accessLevel) {
			case "admin":
			case "staff":
				filtered.phone = customerData.phone;
				break;
			case "customer":
				// Customer can see their own full phone
				filtered.phone = customerData.phone;
				break;
			case "public":
				// Public access gets masked phone
				filtered.phone = maskPhoneNumber(customerData.phone);
				break;
		}
	}

	// Full name filtering
	if (customerData.full_name) {
		switch (accessLevel) {
			case "admin":
			case "staff":
			case "customer":
				filtered.full_name = customerData.full_name;
				break;
			case "public":
				// Public access gets first name only
				const nameParts = customerData.full_name.split(" ");
				filtered.full_name = nameParts[0] + (nameParts.length > 1 ? " *" : "");
				break;
		}
	}

	// Address filtering
	if (customerData.address) {
		switch (accessLevel) {
			case "admin":
			case "staff":
				filtered.address = customerData.address;
				break;
			case "customer":
				// Customer can see their own address
				filtered.address = customerData.address;
				break;
			case "public":
				// Public access gets no address
				break;
		}
	}

	// Timestamps (staff+ only)
	if (accessLevel === "admin" || accessLevel === "staff") {
		filtered.created_at = customerData.created_at;
		filtered.updated_at = customerData.updated_at;
	}

	// Add filtered metadata
	filtered.metadata = {
		filtered_at: new Date().toISOString(),
		access_level: accessLevel,
		data_complete: accessLevel === "admin" || accessLevel === "staff",
	};

	return filtered;
}

/**
 * Filter repair ticket data based on access level
 */
export function filterRepairData(
	repairData: any,
	options: DataFilterOptions,
): FilteredRepairData {
	const { accessLevel, includeCostInfo = false } = options;

	const filtered: FilteredRepairData = {};

	// Basic info (always included)
	filtered.id = repairData.id;
	filtered.ticket_code = repairData.ticket_code;
	filtered.status = repairData.status;

	// Customer phone (filtered)
	if (repairData.customer_phone) {
		switch (accessLevel) {
			case "admin":
			case "staff":
				filtered.customer_phone = repairData.customer_phone;
				break;
			case "customer":
			case "public":
				filtered.customer_phone = maskPhoneNumber(repairData.customer_phone);
				break;
		}
	}

	// Cost information (staff+ or explicit permission)
	if (accessLevel === "admin" || accessLevel === "staff" || includeCostInfo) {
		filtered.total_cost = repairData.total_cost;
		filtered.deposit_amount = repairData.deposit_amount;
	}

	// Device info (basic)
	if (repairData.device_info) {
		filtered.device_brand = repairData.device_info.brand;
		filtered.device_model = repairData.device_info.model;
	}

	// Timestamps
	filtered.created_at = repairData.created_at;
	filtered.estimated_completion = repairData.estimated_completion;

	// Add filtered metadata
	filtered.metadata = {
		filtered_at: new Date().toISOString(),
		access_level: accessLevel,
		cost_info_included: includeCostInfo,
	};

	return filtered;
}

/**
 * Check if user has permission to access customer data
 */
export function canAccessCustomerData(
	userRole: string,
	accessType: "read" | "write" | "delete",
): boolean {
	switch (userRole) {
		case "shop_owner":
			return true; // Full access
		case "staff":
			return accessType !== "delete"; // Read and write, but no delete
		default:
			return false; // No access for other roles
	}
}

/**
 * Sanitize customer data for API responses
 */
export function sanitizeCustomerForAPI(
	customer: any,
	userRole: string,
): FilteredCustomerData {
	const accessLevel =
		userRole === "shop_owner"
			? "admin"
			: userRole === "staff"
				? "staff"
				: "public";

	return filterCustomerData(customer, {
		accessLevel,
		includeSensitiveData: accessLevel === "admin",
	});
}
