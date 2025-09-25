/**
 * Customer Data Filtering System
 * Filters and transforms customer data based on access level and privacy requirements
 */

export interface DataFilterOptions {
	accessLevel: "admin" | "staff" | "public" | "customer";
	includeInternalNotes?: boolean;
	includeCostInfo?: boolean;
	includeStaffInfo?: boolean;
	includeSensitiveData?: boolean;
	includeHistoricalData?: boolean;
}

export interface FilteredCustomerData {
	// Always included basic info
	id?: string;
	phone?: string;
	full_name?: string;
	category?: "individual" | "business";

	// Conditionally included personal info
	email?: string;
	address?: string;
	emergency_contact?: string;
	business_name?: string;
	tax_code?: string;

	// Privacy and consent info (admin only)
	privacy_consent?: boolean;
	data_consent_date?: string;
	contact_preferences?: Record<string, unknown>;

	// Timestamps (filtered based on access level)
	created_at?: string;
	updated_at?: string;
	last_contact?: string;

	// Internal notes (staff+ only)
	internal_notes?: string;
	staff_notes?: string[];

	// Filtered metadata
	metadata?: Record<string, unknown>;
}

export interface FilteredRepairData {
	// Always included basic info
	ticket_code?: string;
	customer_name?: string;
	device_type?: string;
	device_model?: string;
	device_brand?: string;
	current_status?: string;
	created_at?: string;

	// Conditionally included repair details
	issue_description?: string;
	solution_description?: string;
	estimated_completion_date?: string;
	actual_completion_date?: string;
	last_status_update?: string;

	// Cost information (internal only)
	estimated_cost?: number;
	actual_cost?: number;
	parts_cost?: number;
	labor_cost?: number;
	profit_margin?: number;

	// Staff information (internal only)
	assigned_technician?: string;
	technician_notes?: string;
	internal_notes?: string;
	staff_comments?: Array<{
		author: string;
		comment: string;
		timestamp: string;
	}>;

	// Customer communication
	customer_notes?: string;
	customer_feedback?: string;

	// Sensitive diagnostic info
	diagnostic_results?: Record<string, unknown>;
	technical_details?: Record<string, unknown>;

	// Filtered metadata
	filtered_metadata?: Record<string, unknown>;
}

/**
 * Filter customer data based on access level and privacy requirements
 */
export function filterCustomerData(
	rawData: any,
	options: DataFilterOptions,
): FilteredCustomerData {
	const {
		accessLevel,
		includeInternalNotes = false,
		includeCostInfo = false,
		includeSensitiveData = false,
	} = options;

	const filtered: FilteredCustomerData = {};

	// Always include basic identification (with appropriate masking)
	if (rawData.id) filtered.id = rawData.id;
	if (rawData.phone) {
		filtered.phone =
			accessLevel === "public"
				? maskPhoneNumber(rawData.phone)
				: rawData.phone;
	}
	if (rawData.full_name) {
		filtered.full_name =
			accessLevel === "public"
				? maskCustomerName(rawData.full_name)
				: rawData.full_name;
	}
	if (rawData.category) filtered.category = rawData.category;

	// Personal information (based on access level)
	if (accessLevel !== "public") {
		if (rawData.email && (accessLevel === "admin" || accessLevel === "staff")) {
			filtered.email = rawData.email;
		}
		if (
			rawData.address &&
			(accessLevel === "admin" || accessLevel === "staff")
		) {
			filtered.address = rawData.address;
		}
		if (
			rawData.emergency_contact &&
			(accessLevel === "admin" || accessLevel === "staff")
		) {
			filtered.emergency_contact = rawData.emergency_contact;
		}
	}

	// Business information
	if (rawData.business_name && accessLevel !== "public") {
		filtered.business_name = rawData.business_name;
	}
	if (rawData.tax_code && accessLevel === "admin" && includeSensitiveData) {
		filtered.tax_code = rawData.tax_code;
	}

	// Privacy and consent information (admin only)
	if (accessLevel === "admin") {
		if (rawData.privacy_consent !== undefined) {
			filtered.privacy_consent = rawData.privacy_consent;
		}
		if (rawData.data_consent_date) {
			filtered.data_consent_date = rawData.data_consent_date;
		}
		if (rawData.contact_preferences) {
			filtered.contact_preferences = rawData.contact_preferences;
		}
	}

	// Timestamps (filtered based on access level)
	if (rawData.created_at) {
		filtered.created_at = rawData.created_at;
	}
	if (rawData.updated_at && accessLevel !== "public") {
		filtered.updated_at = rawData.updated_at;
	}
	if (rawData.last_contact && accessLevel !== "public") {
		filtered.last_contact = rawData.last_contact;
	}

	// Internal notes (staff+ only)
	if (includeInternalNotes && accessLevel !== "public") {
		if (rawData.internal_notes && accessLevel === "admin") {
			filtered.internal_notes = rawData.internal_notes;
		}
		if (rawData.staff_notes) {
			filtered.staff_notes = Array.isArray(rawData.staff_notes)
				? rawData.staff_notes
				: [];
		}
	}

	// Filtered metadata (remove sensitive keys)
	if (rawData.metadata && accessLevel !== "public") {
		filtered.metadata = filterMetadata(rawData.metadata, accessLevel);
	}

	return filtered;
}

/**
 * Filter repair ticket data based on access level
 */
export function filterRepairData(
	rawData: any,
	options: DataFilterOptions,
): FilteredRepairData {
	const {
		accessLevel,
		includeInternalNotes = false,
		includeCostInfo = false,
		includeStaffInfo = false,
	} = options;

	const filtered: FilteredRepairData = {};

	// Always include basic ticket information
	if (rawData.ticket_code) filtered.ticket_code = rawData.ticket_code;
	if (rawData.customer_name) {
		filtered.customer_name =
			accessLevel === "public"
				? maskCustomerName(rawData.customer_name)
				: rawData.customer_name;
	}
	if (rawData.device_type) filtered.device_type = rawData.device_type;
	if (rawData.device_model) filtered.device_model = rawData.device_model;
	if (rawData.device_brand) filtered.device_brand = rawData.device_brand;
	if (rawData.current_status) filtered.current_status = rawData.current_status;
	if (rawData.created_at) filtered.created_at = rawData.created_at;

	// Repair details (public gets filtered version)
	if (rawData.issue_description) {
		filtered.issue_description =
			accessLevel === "public"
				? sanitizeDescriptionForPublic(rawData.issue_description)
				: rawData.issue_description;
	}

	if (rawData.solution_description && accessLevel !== "public") {
		filtered.solution_description = rawData.solution_description;
	}

	if (rawData.estimated_completion_date) {
		filtered.estimated_completion_date = rawData.estimated_completion_date;
	}

	if (rawData.actual_completion_date && accessLevel !== "public") {
		filtered.actual_completion_date = rawData.actual_completion_date;
	}

	if (rawData.last_status_update) {
		filtered.last_status_update = rawData.last_status_update;
	}

	// Cost information (internal only)
	if (includeCostInfo && (accessLevel === "admin" || accessLevel === "staff")) {
		if (rawData.estimated_cost) filtered.estimated_cost = rawData.estimated_cost;
		if (rawData.actual_cost) filtered.actual_cost = rawData.actual_cost;
		if (rawData.parts_cost) filtered.parts_cost = rawData.parts_cost;
		if (rawData.labor_cost) filtered.labor_cost = rawData.labor_cost;
		if (rawData.profit_margin && accessLevel === "admin") {
			filtered.profit_margin = rawData.profit_margin;
		}
	}

	// Staff information (internal only)
	if (includeStaffInfo && (accessLevel === "admin" || accessLevel === "staff")) {
		if (rawData.assigned_technician) {
			filtered.assigned_technician = rawData.assigned_technician;
		}
	}

	// Internal notes (staff+ only)
	if (includeInternalNotes && accessLevel !== "public") {
		if (rawData.technician_notes && accessLevel !== "customer") {
			filtered.technician_notes = rawData.technician_notes;
		}
		if (rawData.internal_notes && accessLevel === "admin") {
			filtered.internal_notes = rawData.internal_notes;
		}
		if (rawData.staff_comments && accessLevel !== "customer") {
			filtered.staff_comments = rawData.staff_comments;
		}
	}

	// Customer-facing information
	if (rawData.customer_notes) {
		filtered.customer_notes = rawData.customer_notes;
	}
	if (rawData.customer_feedback) {
		filtered.customer_feedback = rawData.customer_feedback;
	}

	// Technical details (internal only)
	if (
		rawData.diagnostic_results &&
		(accessLevel === "admin" || accessLevel === "staff")
	) {
		filtered.diagnostic_results = rawData.diagnostic_results;
	}
	if (
		rawData.technical_details &&
		(accessLevel === "admin" || accessLevel === "staff")
	) {
		filtered.technical_details = rawData.technical_details;
	}

	return filtered;
}

/**
 * Mask phone number for public display
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
 * Mask customer name for public display
 */
function maskCustomerName(name: string): string {
	if (!name) return "Khách hàng";

	const words = name.trim().split(" ");
	if (words.length === 1) {
		// Single word - show first and last character
		if (words[0].length <= 2) return words[0];
		return (
			words[0][0] + "*".repeat(words[0].length - 2) + words[0].slice(-1)
		);
	}

	// Multiple words - show first word and mask middle words, keep last word
	const firstWord = words[0];
	const lastWord = words[words.length - 1];
	const middleCount = words.length - 2;

	if (middleCount <= 0) {
		return `${firstWord} ${lastWord[0]}***`;
	}

	return `${firstWord} ${"***".repeat(middleCount)} ${lastWord[0]}***`;
}

/**
 * Sanitize description for public display
 */
function sanitizeDescriptionForPublic(description: string): string {
	if (!description) return "Đang xử lý";

	// Remove internal references, part numbers, costs, staff names
	let sanitized = description
		// Remove cost references
		.replace(/\b\d+[k|K|đ|vnđ|VNĐ]\b/g, "[chi phí]")
		// Remove part numbers and technical codes
		.replace(/\b[A-Z0-9]{3,}-[A-Z0-9]{3,}\b/g, "[mã linh kiện]")
		// Remove staff references
		.replace(/\b(anh|chị|thầy|cô)\s+[A-Z][a-z]+/gi, "[kỹ thuật viên]")
		// Remove internal notes markers
		.replace(/\[INTERNAL\].*?\[\/INTERNAL\]/gi, "")
		.replace(/\(nội bộ:.*?\)/gi, "");

	// Limit length and add ellipsis if needed
	if (sanitized.length > 200) {
		sanitized = sanitized.substring(0, 197) + "...";
	}

	return sanitized.trim() || "Đang xử lý";
}

/**
 * Filter metadata by removing sensitive keys
 */
function filterMetadata(
	metadata: Record<string, unknown>,
	accessLevel: string,
): Record<string, unknown> {
	const sensitiveKeys = [
		"internal_id",
		"staff_id",
		"cost_breakdown",
		"profit_analysis",
		"vendor_info",
		"internal_notes",
		"debug_info",
		"system_logs",
		"private_flags",
	];

	const adminOnlyKeys = [
		"audit_trail",
		"user_sessions",
		"access_history",
		"system_metadata",
	];

	const filtered: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(metadata)) {
		// Skip sensitive keys for all users
		if (sensitiveKeys.includes(key)) {
			continue;
		}

		// Skip admin-only keys for non-admin users
		if (adminOnlyKeys.includes(key) && accessLevel !== "admin") {
			continue;
		}

		filtered[key] = value;
	}

	return filtered;
}

/**
 * Create public-safe summary of customer data
 */
export function createPublicCustomerSummary(customerData: any): {
	name: string;
	phone: string;
	category: string;
	hasActiveRepairs: boolean;
	totalRepairs: number;
} {
	return {
		name: maskCustomerName(customerData.full_name || "Khách hàng"),
		phone: maskPhoneNumber(customerData.phone || ""),
		category: customerData.category === "business" ? "Doanh nghiệp" : "Cá nhân",
		hasActiveRepairs: Boolean(customerData.active_repair_count > 0),
		totalRepairs: Math.min(customerData.total_repairs || 0, 99), // Cap for privacy
	};
}

/**
 * Validate that filtered data doesn't contain sensitive information
 */
export function validateFilteredData(
	filteredData: any,
	accessLevel: string,
): { isValid: boolean; violations: string[] } {
	const violations: string[] = [];

	// Check for sensitive patterns that shouldn't appear in public data
	if (accessLevel === "public") {
		const sensitivePatterns = [
			/\b\d{4,6}[k|K|đ|vnđ|VNĐ]\b/, // Cost patterns
			/\b[0-9]{10,12}\b/, // Unmasked phone numbers
			/\b[A-Za-z]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
			/\b(anh|chị|thầy|cô)\s+[A-Z][a-z]+\b/i, // Staff names
			/\[INTERNAL\]/i, // Internal markers
		];

		const dataString = JSON.stringify(filteredData);

		for (const pattern of sensitivePatterns) {
			if (pattern.test(dataString)) {
				violations.push(`Sensitive pattern detected: ${pattern.source}`);
			}
		}

		// Check for specific sensitive keys
		const flatKeys = getFlatObjectKeys(filteredData);
		const prohibitedKeys = [
			"tax_code",
			"internal_notes",
			"staff_notes",
			"actual_cost",
			"profit_margin",
			"technician_notes",
		];

		for (const key of prohibitedKeys) {
			if (flatKeys.includes(key)) {
				violations.push(`Prohibited key in public data: ${key}`);
			}
		}
	}

	return {
		isValid: violations.length === 0,
		violations,
	};
}

/**
 * Get all keys from nested object (for validation)
 */
function getFlatObjectKeys(obj: any, prefix = ""): string[] {
	let keys: string[] = [];

	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			keys.push(fullKey);

			if (typeof obj[key] === "object" && obj[key] !== null) {
				keys = keys.concat(getFlatObjectKeys(obj[key], fullKey));
			}
		}
	}

	return keys;
}