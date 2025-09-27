/**
 * Enhanced Supabase Types
 * Type-safe wrappers and utilities for Supabase operations
 */

import type { PostgrestError } from "@supabase/supabase-js";
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
 * Common query types for Vietnamese repair shop
 */
export type CustomerQuery = {
	phone?: string;
	full_name?: string;
	address?: string;
	created_after?: string;
	created_before?: string;
};

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
 * Enhanced error type with business context
 */
export interface BusinessError extends PostgrestError {
	context?: string;
	vietnameseMessage?: string;
	businessRule?: string;
}

/**
 * Repair ticket with related data (commonly used extension)
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
 * Customer with basic repair statistics
 */
export type CustomerWithStats = Customer & {
	total_repairs: number;
	active_repairs: number;
	last_repair_date: string | null;
};

/**
 * Part with stock status information
 */
export type PartWithStock = Part & {
	is_low_stock: boolean;
	stock_value: number;
};