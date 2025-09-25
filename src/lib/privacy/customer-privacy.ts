/**
 * Customer Privacy and Data Management Utilities
 * Handles customer data privacy controls and consent management
 */

import { maskPhoneNumber } from "@/lib/security/phone-privacy";
import { supabase } from "@/lib/supabase";

export interface CustomerPrivacySettings {
	customerId: string;
	dataProcessingConsent: boolean;
	marketingConsent: boolean;
	dataRetentionConsent: boolean;
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
	includeSensitiveData: boolean;
	requestDate: string;
	status: "pending" | "processing" | "completed" | "failed";
}

export interface CustomerDataSummary {
	personalInfo: {
		phone: string;
		fullName: string;
		email?: string;
		address?: string;
		category: "individual" | "business";
	};
	businessInfo?: {
		businessName?: string;
		taxCode?: string;
	};
	contactHistory: {
		totalContacts: number;
		lastContact?: string;
		contactMethods: string[];
	};
	repairHistory: {
		totalRepairs: number;
		activeRepairs: number;
		lastRepair?: string;
	};
	dataUsage: {
		createdAt: string;
		lastUpdated: string;
		accessCount: number;
		lastAccessed?: string;
	};
}

/**
 * Check if customer has given required privacy consents
 */
export async function validateCustomerConsent(customerPhone: string): Promise<{
	hasValidConsent: boolean;
	missingConsents: string[];
	consentDate?: string;
}> {
	try {
		const { data: customer, error } = await supabase
			.from("customers")
			.select("privacy_consent, data_consent_date, contact_preferences")
			.eq("phone", customerPhone)
			.single();

		if (error) {
			throw new Error(`Error fetching customer consent: ${error.message}`);
		}

		const missingConsents: string[] = [];

		if (!customer.privacy_consent) {
			missingConsents.push("data_processing");
		}

		// Check contact preferences for marketing consent
		const contactPrefs = customer.contact_preferences as Record<
			string,
			unknown
		>;
		if (contactPrefs?.allowMarketing === undefined) {
			missingConsents.push("marketing_preferences");
		}

		return {
			hasValidConsent: missingConsents.length === 0,
			missingConsents,
			consentDate: customer.data_consent_date,
		};
	} catch (error) {
		console.error("Error validating customer consent:", error);
		return {
			hasValidConsent: false,
			missingConsents: ["validation_error"],
		};
	}
}

/**
 * Update customer privacy consent
 */
export async function updateCustomerConsent(
	customerPhone: string,
	consents: {
		dataProcessing: boolean;
		marketing: boolean;
	},
	updatedBy?: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Update main privacy consent
		const { error: updateError } = await supabase
			.from("customers")
			.update({
				privacy_consent: consents.dataProcessing,
				data_consent_date: new Date().toISOString(),
				contact_preferences: {
					allowMarketing: consents.marketing,
					preferredMethod: "phone",
					preferredTime: "any",
					language: "vi",
				},
			})
			.eq("phone", customerPhone);

		if (updateError) {
			throw updateError;
		}

		// Log consent change
		await logPrivacyAction(
			customerPhone,
			"consent_update",
			{
				dataProcessing: consents.dataProcessing,
				marketing: consents.marketing,
			},
			updatedBy,
		);

		return { success: true };
	} catch (error) {
		console.error("Error updating customer consent:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Log privacy-related actions
 */
export async function logPrivacyAction(
	customerPhone: string,
	action: string,
	details: Record<string, unknown>,
	performedBy?: string,
): Promise<void> {
	try {
		// In a real implementation, this would go to a privacy audit table
		// For now, we'll log to console in development
		if (process.env.NODE_ENV === "development") {
			console.log(`[PRIVACY AUDIT] ${action} for customer ${customerPhone}:`, {
				details,
				performedBy,
				timestamp: new Date().toISOString(),
			});
		}

		// TODO: Implement privacy audit table
		// const { error } = await supabase
		//   .from('privacy_audit_log')
		//   .insert({
		//     customer_phone: customerPhone,
		//     action,
		//     details,
		//     performed_by: performedBy,
		//     created_at: new Date().toISOString()
		//   });
	} catch (error) {
		console.error("Error logging privacy action:", error);
	}
}

/**
 * Generate customer data summary for export/review
 */
export async function generateCustomerDataSummary(
	customerPhone: string,
): Promise<CustomerDataSummary | null> {
	try {
		// Get customer basic info
		const { data: customer, error: customerError } = await supabase
			.from("customers")
			.select("*")
			.eq("phone", customerPhone)
			.single();

		if (customerError) {
			throw customerError;
		}

		// Get contact history count
		const { count: contactCount } = await supabase
			.from("customer_contact_history")
			.select("*", { count: "exact", head: true })
			.eq("customer_phone", customerPhone);

		// Get repair history
		const { data: repairData, count: repairCount } = await supabase
			.from("repair_tickets")
			.select("status, created_at", { count: "exact" })
			.eq("customer_phone", customerPhone);

		const activeRepairs =
			repairData?.filter(
				(r) =>
					!["completed", "cancelled_by_customer", "abandoned"].includes(
						r.status,
					),
			).length || 0;

		const lastRepair =
			repairData && repairData.length > 0
				? repairData.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					)[0].created_at
				: undefined;

		// Get latest contact
		const { data: latestContact } = await supabase
			.from("customer_contact_history")
			.select("contact_date, contact_type")
			.eq("customer_phone", customerPhone)
			.order("contact_date", { ascending: false })
			.limit(1)
			.single();

		return {
			personalInfo: {
				phone: customer.phone,
				fullName: customer.full_name,
				email: customer.email,
				address: customer.address_details
					? `${customer.address_details}, ${customer.address_ward}, ${customer.address_district}, ${customer.address_province}`
					: undefined,
				category: customer.category,
			},
			businessInfo:
				customer.category === "business"
					? {
							businessName: customer.business_name,
							taxCode: customer.tax_code,
						}
					: undefined,
			contactHistory: {
				totalContacts: contactCount || 0,
				lastContact: latestContact?.contact_date,
				contactMethods: latestContact ? [latestContact.contact_type] : [],
			},
			repairHistory: {
				totalRepairs: repairCount || 0,
				activeRepairs,
				lastRepair,
			},
			dataUsage: {
				createdAt: customer.created_at,
				lastUpdated: customer.updated_at,
				accessCount: await getCustomerAccessCount(customerPhone),
				lastAccessed: undefined,
			},
		};
	} catch (error) {
		console.error("Error generating customer data summary:", error);
		return null;
	}
}

/**
 * Export customer data in specified format
 */
export async function exportCustomerData(
	customerPhone: string,
	exportType: DataExportRequest["exportType"] = "full",
	format: DataExportRequest["format"] = "json",
	requestedBy?: string,
): Promise<{
	success: boolean;
	data?: Record<string, unknown>;
	downloadUrl?: string;
	error?: string;
}> {
	try {
		// Validate consent first
		const consentCheck = await validateCustomerConsent(customerPhone);
		if (!consentCheck.hasValidConsent) {
			return {
				success: false,
				error: "Customer has not provided required data processing consent",
			};
		}

		// Generate data summary
		const dataSummary = await generateCustomerDataSummary(customerPhone);
		if (!dataSummary) {
			return {
				success: false,
				error: "Failed to generate customer data summary",
			};
		}

		// Filter data based on export type
		let exportData: Record<string, unknown> = {};

		switch (exportType) {
			case "personal_only":
				exportData = {
					personalInfo: dataSummary.personalInfo,
					businessInfo: dataSummary.businessInfo,
				} as Record<string, unknown>;
				break;
			case "contact_only":
				exportData = {
					personalInfo: {
						phone: dataSummary.personalInfo.phone,
						fullName: dataSummary.personalInfo.fullName,
						email: dataSummary.personalInfo.email,
					},
					contactHistory: dataSummary.contactHistory,
				} as Record<string, unknown>;
				break;
			case "history_only":
				exportData = {
					repairHistory: dataSummary.repairHistory,
					contactHistory: dataSummary.contactHistory,
				} as Record<string, unknown>;
				break;
			default:
				exportData = dataSummary as unknown as Record<string, unknown>;
		}

		// Add export metadata
		exportData._metadata = {
			exportDate: new Date().toISOString(),
			exportType,
			requestedBy,
			customerPhone,
		};

		// Log export action
		await logPrivacyAction(
			customerPhone,
			"data_export",
			{ exportType, format },
			requestedBy,
		);

		// Format data based on requested format
		switch (format) {
			case "json":
				return {
					success: true,
					data: exportData,
				};
			case "csv":
				// Data export functionality removed from Phase 2 requirements
				return {
					success: false,
					error:
						"CSV export functionality not implemented - removed from Phase 2",
				};
			case "pdf":
				// Data export functionality removed from Phase 2 requirements
				return {
					success: false,
					error:
						"PDF export functionality not implemented - removed from Phase 2",
				};
			default:
				return {
					success: true,
					data: exportData,
				};
		}
	} catch (error) {
		console.error("Error exporting customer data:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Export failed",
		};
	}
}

/**
 * Request customer data deletion (GDPR right to be forgotten)
 */
export async function requestDataDeletion(
	customerPhone: string,
	requestedBy?: string,
	reason?: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Check if customer has active repair tickets
		const { data: activeRepairs, error: repairError } = await supabase
			.from("repair_tickets")
			.select("id, status")
			.eq("customer_phone", customerPhone)
			.not("status", "in", '("completed","cancelled_by_customer","abandoned")');

		if (repairError) {
			throw repairError;
		}

		if (activeRepairs && activeRepairs.length > 0) {
			return {
				success: false,
				error:
					"Cannot delete customer data while there are active repair tickets",
			};
		}

		// Log deletion request
		await logPrivacyAction(
			customerPhone,
			"deletion_request",
			{ reason },
			requestedBy,
		);

		// In a real implementation, this would mark data for deletion
		// rather than immediately deleting it
		console.log(
			`[PRIVACY] Data deletion requested for customer ${customerPhone}`,
		);

		return { success: true };
	} catch (error) {
		console.error("Error requesting data deletion:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Deletion request failed",
		};
	}
}

/**
 * Simple CSV conversion utility
 */
function convertToCSV(data: Record<string, unknown>): string {
	// This is a simplified CSV converter
	// In a real implementation, you'd use a proper CSV library
	const headers = Object.keys(data);
	const values = Object.values(data).map((v) =>
		typeof v === "object" ? JSON.stringify(v) : String(v),
	);

	return [headers.join(","), values.join(",")].join("\n");
}

/**
 * Check customer data retention period
 */
export async function checkDataRetention(customerPhone: string): Promise<{
	shouldRetain: boolean;
	retentionReason?: string;
	canDelete: boolean;
	nextReviewDate?: string;
}> {
	try {
		const dataSummary = await generateCustomerDataSummary(customerPhone);
		if (!dataSummary) {
			return { shouldRetain: false, canDelete: true };
		}

		// Check if customer has recent activity
		const lastActivity = dataSummary.repairHistory.lastRepair;
		if (lastActivity) {
			const lastActivityDate = new Date(lastActivity);
			const threeYearsAgo = new Date();
			threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

			if (lastActivityDate > threeYearsAgo) {
				return {
					shouldRetain: true,
					retentionReason: "Recent repair activity within 3 years",
					canDelete: false,
					nextReviewDate: new Date(
						lastActivityDate.getFullYear() + 3,
						lastActivityDate.getMonth(),
						lastActivityDate.getDate(),
					).toISOString(),
				};
			}
		}

		// Check if customer has active repairs
		if (dataSummary.repairHistory.activeRepairs > 0) {
			return {
				shouldRetain: true,
				retentionReason: "Active repair tickets",
				canDelete: false,
			};
		}

		return {
			shouldRetain: false,
			canDelete: true,
		};
	} catch (error) {
		console.error("Error checking data retention:", error);
		return { shouldRetain: true, canDelete: false };
	}
}

/**
 * Get customer access count from audit logs
 */
async function getCustomerAccessCount(customerPhone: string): Promise<number> {
	try {
		const maskedPhone = maskPhoneNumber(customerPhone);
		const { count, error } = await supabase
			.from("customer_access_logs")
			.select("*", { count: "exact", head: true })
			.eq("customer_phone_masked", maskedPhone);

		if (error) {
			console.error("Error getting customer access count:", error);
			return 0;
		}

		return count || 0;
	} catch (error) {
		console.error("Error getting customer access count:", error);
		return 0;
	}
}
