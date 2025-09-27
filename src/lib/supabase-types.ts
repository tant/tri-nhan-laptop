/**
 * Enhanced Supabase Types
 * Type-safe wrappers and utilities for Supabase operations
 */

import type { PostgrestError, PostgrestSingleResponse, PostgrestResponse } from "@supabase/supabase-js";
import type { Customer, RepairTicket, Part, UserProfile } from "./database-types";

/**
 * Generic Supabase query result type
 */
export type SupabaseResult<T> = {
	data: T | null;
	error: PostgrestError | null;
};

/**
 * Type-safe query result for arrays
 */
export type SupabaseArrayResult<T> = {
	data: T[] | null;
	error: PostgrestError | null;
};

/**
 * Type-safe query result for single items
 */
export type SupabaseSingleResult<T> = {
	data: T | null;
	error: PostgrestError | null;
};

/**
 * Vietnamese business-specific query types
 */
export namespace VietnameseQueries {
	/**
	 * Customer queries with Vietnamese phone validation
	 */
	export type CustomerQuery = {
		phone?: string;
		full_name?: string;
		address?: string;
		created_after?: string;
		created_before?: string;
	};

	/**
	 * Repair ticket queries with Vietnamese business logic
	 */
	export type RepairTicketQuery = {
		customer_phone?: string;
		status?: RepairTicket["status"];
		priority?: RepairTicket["priority"];
		assigned_technician_id?: string;
		created_after?: string;
		created_before?: string;
		include_customer?: boolean;
		include_technician?: boolean;
	};

	/**
	 * Parts queries with inventory focus
	 */
	export type PartsQuery = {
		category?: string;
		low_stock_only?: boolean;
		out_of_stock_only?: boolean;
		min_price?: number;
		max_price?: number;
		search_term?: string;
	};

	/**
	 * Analytics query parameters
	 */
	export type AnalyticsQuery = {
		start_date: string;
		end_date: string;
		technician_id?: string;
		status_filter?: RepairTicket["status"][];
		include_customer_stats?: boolean;
	};
}

/**
 * Vietnamese business error contexts
 */
export type VietnameseErrorContext =
	| "customer_management"
	| "repair_workflow"
	| "parts_inventory"
	| "user_authentication"
	| "analytics_calculation"
	| "vietnamese_validation";

/**
 * Enhanced error type with Vietnamese business context
 */
export interface VietnameseBusinessError extends PostgrestError {
	context?: VietnameseErrorContext;
	vietnameseMessage?: string;
	businessRule?: string;
}

/**
 * Repair ticket with related data
 */
export type RepairTicketWithRelations = RepairTicket & {
	customer?: Customer;
	technician?: UserProfile;
	parts_used?: Array<{
		part: Part;
		quantity: number;
		unit_cost: number;
	}>;
};

/**
 * Customer with repair statistics
 */
export type CustomerWithRepairStats = Customer & {
	total_repairs: number;
	active_repairs: number;
	last_repair_date: string | null;
	total_spent: number;
	average_repair_cost: number;
	loyalty_tier: "new" | "regular" | "loyal" | "vip";
};

/**
 * Part with usage statistics
 */
export type PartWithUsageStats = Part & {
	usage_count: number;
	last_used_date: string | null;
	average_cost_per_repair: number;
	current_value: number;
	reorder_needed: boolean;
	usage_trend: "increasing" | "stable" | "decreasing";
};

/**
 * Vietnamese repair workflow status transitions
 */
export type StatusTransition = {
	from_status: RepairTicket["status"];
	to_status: RepairTicket["status"];
	allowed: boolean;
	requires_approval: boolean;
	vietnamese_description: string;
	estimated_duration_hours: number;
};

/**
 * Vietnamese business analytics data
 */
export type VietnameseBusinessAnalytics = {
	// Revenue metrics in VND
	total_revenue: number;
	average_repair_cost: number;
	revenue_by_month: Array<{
		month: string;
		revenue: number;
		repair_count: number;
	}>;

	// Customer metrics
	new_customers: number;
	returning_customers: number;
	customer_satisfaction_average: number;

	// Operational metrics
	average_repair_duration_hours: number;
	repairs_completed: number;
	repairs_in_progress: number;
	parts_usage_efficiency: number;

	// Vietnamese-specific metrics
	peak_hours: Array<{
		hour: number;
		vietnamese_time: string;
		activity_level: number;
	}>;
	popular_repair_categories: Array<{
		category: string;
		vietnamese_name: string;
		count: number;
		percentage: number;
	}>;
};

/**
 * Type-safe Supabase query builders
 */
export namespace SupabaseQueries {
	/**
	 * Type-safe customer queries
	 */
	export type CustomerSelectQuery = {
		columns?: (keyof Customer)[];
		filters?: VietnameseQueries.CustomerQuery;
		orderBy?: keyof Customer;
		ascending?: boolean;
		limit?: number;
	};

	/**
	 * Type-safe repair ticket queries
	 */
	export type RepairTicketSelectQuery = {
		columns?: (keyof RepairTicket)[];
		filters?: VietnameseQueries.RepairTicketQuery;
		orderBy?: keyof RepairTicket;
		ascending?: boolean;
		limit?: number;
		includeRelations?: {
			customer?: boolean;
			technician?: boolean;
			parts?: boolean;
		};
	};

	/**
	 * Type-safe parts queries
	 */
	export type PartsSelectQuery = {
		columns?: (keyof Part)[];
		filters?: VietnameseQueries.PartsQuery;
		orderBy?: keyof Part;
		ascending?: boolean;
		limit?: number;
		includeUsageStats?: boolean;
	};
}

/**
 * Vietnamese locale-specific database operations
 */
export namespace VietnameseOperations {
	/**
	 * Create customer with Vietnamese validation
	 */
	export type CreateCustomerInput = {
		phone: string; // Must match Vietnamese phone format
		full_name: string;
		address?: string;
		notes?: string;
	};

	/**
	 * Create repair ticket with Vietnamese business rules
	 */
	export type CreateRepairTicketInput = {
		customer_phone: string;
		issue_description: string; // Technical diagnosis in Vietnamese
		customer_description: string; // Customer's problem description
		device_info: {
			brand: string;
			model: string;
			serial_number?: string;
		};
		priority: RepairTicket["priority"];
		estimated_cost?: number; // In VND
		estimated_completion_date?: string;
	};

	/**
	 * Update repair status with Vietnamese workflow validation
	 */
	export type UpdateRepairStatusInput = {
		ticket_id: string;
		new_status: RepairTicket["status"];
		technician_notes?: string;
		customer_notification_sent?: boolean;
		estimated_completion_date?: string;
	};

	/**
	 * Parts inventory adjustment with Vietnamese business context
	 */
	export type AdjustPartsInventoryInput = {
		part_id: string;
		quantity_change: number; // Positive for addition, negative for usage
		reason: "purchase" | "usage" | "damage" | "return" | "correction";
		vietnamese_reason: string;
		unit_cost?: number; // In VND for purchases
		related_repair_id?: string; // For usage tracking
	};
}

/**
 * Real-time subscription types for Vietnamese business operations
 */
export namespace VietnameseRealtime {
	/**
	 * Repair ticket status change notification
	 */
	export type RepairStatusUpdate = {
		ticket_id: string;
		old_status: RepairTicket["status"];
		new_status: RepairTicket["status"];
		customer_phone: string;
		vietnamese_status_name: string;
		timestamp: string;
		requires_customer_notification: boolean;
	};

	/**
	 * Low stock alert for parts
	 */
	export type LowStockAlert = {
		part_id: string;
		part_name: string;
		current_stock: number;
		minimum_stock: number;
		category: string;
		urgency_level: "low" | "medium" | "high" | "critical";
		vietnamese_alert_message: string;
	};

	/**
	 * New customer registration
	 */
	export type NewCustomerNotification = {
		customer_phone: string;
		customer_name: string;
		registration_time: string;
		is_first_time_customer: boolean;
		vietnamese_welcome_message: string;
	};
}

/**
 * Database row types with Vietnamese business validation
 */
export type ValidatedDatabaseRow<T> = T & {
	_validation: {
		vietnamese_business_rules_passed: boolean;
		validation_timestamp: string;
		validation_context: VietnameseErrorContext;
	};
};

/**
 * Utility types for Vietnamese business operations
 */
export type VietnameseBusinessOperation<TInput, TOutput> = {
	input: TInput;
	output: TOutput;
	business_context: VietnameseErrorContext;
	validation_rules: string[];
	estimated_duration_minutes: number;
	requires_customer_approval: boolean;
};

/**
 * Type for handling Vietnamese locale formatting in queries
 */
export type VietnameseLocaleFormatting = {
	currency_format: "VND";
	date_format: "dd/MM/yyyy";
	time_format: "HH:mm";
	phone_format: "0xxx xxx xxx" | "+84 xxx xxx xxx";
	timezone: "Asia/Ho_Chi_Minh";
};