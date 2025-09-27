/**
 * Simplified Customer Privacy and Data Management Utilities
 * Handles customer data privacy controls and consent management
 * Updated for simplified customer structure: phone, full_name, address only
 */

import { maskPhoneNumber } from "@/lib/security/phone-privacy";
import { supabase } from "@/lib/supabase";

export interface CustomerPrivacySettings {
	customerId: string;
	dataProcessingConsent: boolean;
	consentDate: string;
	lastUpdated: string;
	updatedBy?: string;
}

export interface DataExportRequest {
	customerId: string;
	requestedBy: string;
	exportType: "full" | "personal_only" | "contact_only" | "history_only";
	format: "json" | "csv" | "pdf";
	includeHistory: boolean;
	requestDate: string;
	status: "pending" | "processing" | "completed" | "failed";
}

export interface CustomerDataSummary {
	personalInfo: {
		phone: string;
		fullName: string;
		address?: string;
	};
	contactHistory: {
		totalContacts: number;
		lastContact?: string;
	};
	repairHistory: {
		totalRepairs: number;
		activeRepairs: number;
		lastRepair?: string;
	};
	dataProcessing: {
		consentGiven: boolean;
		consentDate?: string;
		dataRetentionPeriod: string;
	};
	exportHistory: {
		totalExports: number;
		lastExport?: string;
	};
}

/**
 * Get customer data summary for privacy dashboard
 */
export async function getCustomerDataSummary(
	customerPhone: string,
): Promise<CustomerDataSummary | null> {
	try {
		// Get customer basic info
		const { data: customer, error: customerError } = await supabase
			.from("customers")
			.select("phone, full_name, address, created_at")
			.eq("phone", customerPhone)
			.single();

		if (customerError || !customer) {
			console.error("Error fetching customer:", customerError);
			return null;
		}

		// Get repair history
		const { data: repairs, error: repairsError } = await supabase
			.from("repair_tickets")
			.select("id, status, created_at")
			.eq("customer_phone", customerPhone);

		if (repairsError) {
			console.error("Error fetching repairs:", repairsError);
		}

		const totalRepairs = repairs?.length || 0;
		const activeRepairs =
			repairs?.filter(
				(r) =>
					!["completed", "cancelled_by_customer", "abandoned"].includes(
						r.status,
					),
			).length || 0;
		const lastRepair = repairs?.length
			? Math.max(...repairs.map((r) => new Date(r.created_at).getTime()))
			: undefined;

		return {
			personalInfo: {
				phone: customer.phone,
				fullName: customer.full_name,
				address: customer.address,
			},
			contactHistory: {
				totalContacts: 0, // Simplified - no contact tracking
				lastContact: undefined,
			},
			repairHistory: {
				totalRepairs,
				activeRepairs,
				lastRepair: lastRepair ? new Date(lastRepair).toISOString() : undefined,
			},
			dataProcessing: {
				consentGiven: true, // Simplified - assume consent for existing customers
				consentDate: customer.created_at,
				dataRetentionPeriod: "5 years", // Standard retention
			},
			exportHistory: {
				totalExports: 0, // Simplified - no export tracking
				lastExport: undefined,
			},
		};
	} catch (error) {
		console.error("Error getting customer data summary:", error);
		return null;
	}
}

/**
 * Export customer data for privacy compliance
 */
export async function exportCustomerData(
	customerPhone: string,
	exportType:
		| "full"
		| "personal_only"
		| "contact_only"
		| "history_only" = "full",
): Promise<any> {
	try {
		const result: any = {};

		if (exportType === "full" || exportType === "personal_only") {
			// Get customer basic info
			const { data: customer, error: customerError } = await supabase
				.from("customers")
				.select("*")
				.eq("phone", customerPhone)
				.single();

			if (!customerError && customer) {
				result.personalInfo = {
					phone: customer.phone,
					fullName: customer.full_name,
					address: customer.address,
					createdAt: customer.created_at,
					updatedAt: customer.updated_at,
				};
			}
		}

		if (exportType === "full" || exportType === "history_only") {
			// Get repair history
			const { data: repairs, error: repairsError } = await supabase
				.from("repair_tickets")
				.select(`
					id, ticket_code, status, device_info,
					issue_description, customer_description,
					total_cost, created_at, updated_at
				`)
				.eq("customer_phone", customerPhone);

			if (!repairsError && repairs) {
				result.repairHistory = repairs.map((repair) => ({
					ticketCode: repair.ticket_code,
					status: repair.status,
					deviceInfo: repair.device_info,
					issueDescription: repair.issue_description,
					customerDescription: repair.customer_description,
					totalCost: repair.total_cost,
					createdAt: repair.created_at,
					updatedAt: repair.updated_at,
				}));
			}
		}

		return {
			exportDate: new Date().toISOString(),
			exportType,
			customerPhone: maskPhoneNumber(customerPhone), // Mask in export
			data: result,
		};
	} catch (error) {
		console.error("Error exporting customer data:", error);
		throw error;
	}
}

/**
 * Delete customer data for privacy compliance
 * Note: This only removes the customer record, not repair history (business requirement)
 */
export async function deleteCustomerData(
	customerPhone: string,
	requestedBy: string,
): Promise<{ success: boolean; message: string }> {
	try {
		// Check if customer has active repairs
		const { data: activeRepairs, error: repairsError } = await supabase
			.from("repair_tickets")
			.select("id")
			.eq("customer_phone", customerPhone)
			.not("status", "in", ["completed", "cancelled_by_customer", "abandoned"]);

		if (repairsError) {
			console.error("Error checking active repairs:", repairsError);
			return { success: false, message: "Error checking active repairs" };
		}

		if (activeRepairs && activeRepairs.length > 0) {
			return {
				success: false,
				message: "Cannot delete customer with active repair tickets",
			};
		}

		// Delete customer record
		const { error: deleteError } = await supabase
			.from("customers")
			.delete()
			.eq("phone", customerPhone);

		if (deleteError) {
			console.error("Error deleting customer:", deleteError);
			return { success: false, message: "Error deleting customer data" };
		}

		return {
			success: true,
			message: "Customer data deleted successfully",
		};
	} catch (error) {
		console.error("Error in deleteCustomerData:", error);
		return { success: false, message: "Unexpected error occurred" };
	}
}

/**
 * Anonymize customer data (replace with generic values)
 */
export async function anonymizeCustomerData(
	customerPhone: string,
): Promise<{ success: boolean; message: string }> {
	try {
		const anonymizedData = {
			full_name: "Khách hàng đã xóa",
			address: null,
		};

		const { error } = await supabase
			.from("customers")
			.update(anonymizedData)
			.eq("phone", customerPhone);

		if (error) {
			console.error("Error anonymizing customer:", error);
			return { success: false, message: "Error anonymizing customer data" };
		}

		return {
			success: true,
			message: "Customer data anonymized successfully",
		};
	} catch (error) {
		console.error("Error in anonymizeCustomerData:", error);
		return { success: false, message: "Unexpected error occurred" };
	}
}

/**
 * Check if customer phone number should be masked for display
 */
export function shouldMaskPhoneNumber(
	viewerRole: string,
	customerPhone: string,
	viewerPhone?: string,
): boolean {
	// Admin and staff can see all phone numbers
	if (viewerRole === "shop_owner" || viewerRole === "staff") {
		return false;
	}

	// Customer can see their own phone number
	if (viewerPhone === customerPhone) {
		return false;
	}

	// Everyone else gets masked phone
	return true;
}

/**
 * Get privacy-compliant customer display data
 */
export function getDisplayCustomerData(
	customer: any,
	viewerRole: string,
	viewerPhone?: string,
): {
	phone: string;
	fullName: string;
	address?: string;
} {
	const shouldMask = shouldMaskPhoneNumber(
		viewerRole,
		customer.phone,
		viewerPhone,
	);

	return {
		phone: shouldMask ? maskPhoneNumber(customer.phone) : customer.phone,
		fullName: customer.full_name,
		address: viewerRole === "public" ? undefined : customer.address,
	};
}
