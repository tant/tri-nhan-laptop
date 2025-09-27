import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useCallback, useState } from "react";

// Database types
type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type CustomerDevice = Database["public"]["Tables"]["customer_devices"]["Row"];
type ServicePattern = Database["public"]["Tables"]["service_patterns"]["Row"];
type WarrantyRecord = Database["public"]["Tables"]["warranty_records"]["Row"];
type ServiceNote = Database["public"]["Tables"]["service_notes"]["Row"];
type CustomerServicePreferences =
	Database["public"]["Tables"]["customer_service_preferences"]["Row"];
type RepairCostHistory =
	Database["public"]["Tables"]["repair_cost_history"]["Row"];

// Extended types for comprehensive history
export interface RepairHistoryItem extends RepairTicket {
	device_info: {
		brand: string;
		model: string;
		serial_number?: string;
		device_type: string;
	};
	assigned_technician?: {
		full_name: string;
		email: string;
	};
	total_parts_cost?: number;
	total_labor_cost?: number;
	warranty_info?: WarrantyRecord;
	service_notes?: ServiceNote[];
}

export interface CustomerHistorySummary {
	customerPhone: string;
	customerName: string;
	customerSince: string;
	totalDevices: number;
	totalRepairs: number;
	completedRepairs: number;
	activeRepairs: number;
	totalSpent: number;
	averageRepairCost: number;
	lastRepairDate?: string;
	mostCommonIssue?: string;
	recurringIssues: number;
	averageSatisfaction: number;
	preferredTechnician?: string;
}

export interface DeviceHistoryItem extends CustomerDevice {
	repairCount: number;
	lastRepairDate?: string;
	totalSpent: number;
	warrantyStatus: {
		isUnderWarranty: boolean;
		warrantyType?: string;
		warrantyEndDate?: string;
		daysRemaining?: number;
	};
	commonIssues: Array<{
		category: string;
		frequency: number;
		lastOccurrence: string;
	}>;
}

export interface ServicePatternAnalysis {
	customerPhone: string;
	patternType:
		| "recurring_hardware"
		| "recurring_software"
		| "seasonal"
		| "escalating";
	description: string;
	frequency: number;
	riskLevel: "low" | "medium" | "high";
	recommendation: string;
	lastOccurrence: string;
	affectedDevices: string[];
}

/**
 * Custom hook for managing customer repair history and analytics
 */
export function useCustomerHistory() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Get comprehensive customer history summary
	 */
	const getCustomerHistorySummary = useCallback(
		async (customerPhone: string): Promise<CustomerHistorySummary | null> => {
			try {
				setLoading(true);
				setError(null);

				// Get customer basic info
				const { data: customer, error: customerError } = await supabase
					.from("customers")
					.select("phone, full_name, created_at")
					.eq("phone", customerPhone)
					.single();

				if (customerError) {
					throw new Error(`Error fetching customer: ${customerError.message}`);
				}

				// Get repair summary using the database function
				const { data: summary, error: summaryError } = await supabase.rpc(
					"get_customer_repair_summary",
					{ p_customer_phone: customerPhone },
				);

				if (summaryError) {
					throw new Error(
						`Error fetching repair summary: ${summaryError.message}`,
					);
				}

				// Get customer preferences
				const { data: preferences } = await supabase
					.from("customer_service_preferences")
					.select("preferred_technician_id, user_profiles(full_name)")
					.eq("customer_phone", customerPhone)
					.single();

				const summaryData = summary[0] || {};

				return {
					customerPhone: customer.phone,
					customerName: customer.full_name,
					customerSince: customer.created_at,
					totalDevices: summaryData.total_devices || 0,
					totalRepairs: summaryData.total_repairs || 0,
					completedRepairs: summaryData.completed_repairs || 0,
					activeRepairs: summaryData.active_repairs || 0,
					totalSpent: Number(summaryData.total_spent) || 0,
					averageRepairCost: Number(summaryData.average_repair_cost) || 0,
					lastRepairDate: summaryData.last_repair_date,
					mostCommonIssue: summaryData.most_common_issue,
					recurringIssues: summaryData.recurring_issues || 0,
					averageSatisfaction: Number(summaryData.average_satisfaction) || 0,
					preferredTechnician: preferences?.user_profiles?.full_name,
				};
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error fetching customer history summary:", error);
				setError(error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Get detailed repair history with chronological ordering
	 */
	const getRepairHistory = useCallback(
		async (
			customerPhone: string,
			options: {
				limit?: number;
				deviceId?: string;
				status?: string;
				includeServiceNotes?: boolean;
			} = {},
		): Promise<RepairHistoryItem[]> => {
			try {
				setLoading(true);
				setError(null);

				let query = supabase
					.from("repair_tickets")
					.select(`
						*,
						assigned_technician:user_profiles!assigned_technician_id(full_name, email),
						customer_devices(brand, model, device_type, serial_number),
						warranty_records(*),
						${options.includeServiceNotes ? "service_notes(*)" : ""}
					`)
					.eq("customer_phone", customerPhone)
					.order("created_at", { ascending: false });

				if (options.limit) {
					query = query.limit(options.limit);
				}

				if (options.deviceId) {
					query = query.eq("device_id", options.deviceId);
				}

				if (options.status) {
					query = query.eq("status", options.status);
				}

				const { data: repairs, error: repairsError } = await query;

				if (repairsError) {
					throw new Error(
						`Error fetching repair history: ${repairsError.message}`,
					);
				}

				// Enhance with cost breakdown
				const enhancedRepairs = await Promise.all(
					(repairs || []).map(async (repair) => {
						// Get cost breakdown
						const { data: costs } = await supabase
							.from("repair_cost_history")
							.select("*")
							.eq("repair_ticket_id", repair.id);

						const partsCost =
							costs
								?.filter((c) => c.cost_category === "parts")
								.reduce((sum, c) => sum + Number(c.total_cost), 0) || 0;

						const laborCost =
							costs
								?.filter((c) => c.cost_category === "labor")
								.reduce((sum, c) => sum + Number(c.total_cost), 0) || 0;

						return {
							...repair,
							device_info: repair.customer_devices || {
								brand: "Unknown",
								model: "Unknown",
								device_type: "laptop",
							},
							total_parts_cost: partsCost,
							total_labor_cost: laborCost,
							warranty_info: repair.warranty_records?.[0],
							service_notes: repair.service_notes || [],
						} as RepairHistoryItem;
					}),
				);

				return enhancedRepairs;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error fetching repair history:", error);
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Get customer devices with repair history
	 */
	const getCustomerDevices = useCallback(
		async (customerPhone: string): Promise<DeviceHistoryItem[]> => {
			try {
				setLoading(true);
				setError(null);

				const { data: devices, error: devicesError } = await supabase
					.from("customer_devices")
					.select("*")
					.eq("customer_phone", customerPhone)
					.eq("is_active", true)
					.order("created_at", { ascending: false });

				if (devicesError) {
					throw new Error(`Error fetching devices: ${devicesError.message}`);
				}

				// Enhance with repair history and warranty info
				const enhancedDevices = await Promise.all(
					(devices || []).map(async (device) => {
						// Get repair count and cost
						const { data: repairs, count: repairCount } = await supabase
							.from("repair_tickets")
							.select("total_cost, created_at", { count: "exact" })
							.eq("device_id", device.id);

						const totalSpent =
							repairs?.reduce(
								(sum, r) => sum + (Number(r.total_cost) || 0),
								0,
							) || 0;

						const lastRepairDate = repairs?.[0]?.created_at;

						// Check warranty status
						const { data: warrantyData } = await supabase.rpc(
							"check_warranty_status",
							{ p_device_id: device.id },
						);

						const warrantyStatus = warrantyData?.[0] || {
							is_under_warranty: false,
						};

						// Get common issues
						const { data: patterns } = await supabase
							.from("service_patterns")
							.select("issue_category, frequency_count, last_occurrence")
							.eq("device_id", device.id)
							.order("frequency_count", { ascending: false })
							.limit(3);

						const commonIssues =
							patterns?.map((p) => ({
								category: p.issue_category,
								frequency: p.frequency_count,
								lastOccurrence: p.last_occurrence,
							})) || [];

						return {
							...device,
							repairCount: repairCount || 0,
							lastRepairDate,
							totalSpent,
							warrantyStatus: {
								isUnderWarranty: warrantyStatus.is_under_warranty,
								warrantyType: warrantyStatus.warranty_type,
								warrantyEndDate: warrantyStatus.warranty_end_date,
								daysRemaining: warrantyStatus.days_remaining,
							},
							commonIssues,
						} as DeviceHistoryItem;
					}),
				);

				return enhancedDevices;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error fetching customer devices:", error);
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Analyze service patterns for customer
	 */
	const analyzeServicePatterns = useCallback(
		async (customerPhone: string): Promise<ServicePatternAnalysis[]> => {
			try {
				setLoading(true);
				setError(null);

				const { data: patterns, error: patternsError } = await supabase
					.from("service_patterns")
					.select(`
						*,
						customer_devices(brand, model, device_type)
					`)
					.eq("customer_phone", customerPhone)
					.order("frequency_count", { ascending: false });

				if (patternsError) {
					throw new Error(
						`Error fetching service patterns: ${patternsError.message}`,
					);
				}

				// Analyze patterns and generate insights
				const analyses: ServicePatternAnalysis[] = [];

				for (const pattern of patterns || []) {
					let patternType: ServicePatternAnalysis["patternType"] =
						"recurring_hardware";
					let riskLevel: ServicePatternAnalysis["riskLevel"] = "low";
					let recommendation = "";

					// Determine pattern type and risk
					if (pattern.frequency_count >= 3) {
						if (pattern.issue_category === "hardware") {
							patternType = "recurring_hardware";
							riskLevel = "high";
							recommendation = "Cân nhắc thay thế thiết bị hoặc nâng cấp";
						} else if (pattern.issue_category === "software") {
							patternType = "recurring_software";
							riskLevel = "medium";
							recommendation =
								"Đào tạo người dùng hoặc cài đặt phần mềm bảo mật";
						}
					}

					// Check for escalating issues (frequency increasing over time)
					if (pattern.frequency_count > 1) {
						const daysSinceFirst = Math.floor(
							(new Date(pattern.last_occurrence).getTime() -
								new Date(pattern.first_occurrence).getTime()) /
								(1000 * 60 * 60 * 24),
						);
						if (daysSinceFirst < 90 && pattern.frequency_count >= 2) {
							patternType = "escalating";
							riskLevel = "high";
							recommendation = "Cần kiểm tra toàn diện để tìm nguyên nhân gốc";
						}
					}

					analyses.push({
						customerPhone,
						patternType,
						description: `${pattern.issue_category} - ${pattern.issue_subcategory || "Vấn đề chung"}`,
						frequency: pattern.frequency_count,
						riskLevel,
						recommendation,
						lastOccurrence: pattern.last_occurrence,
						affectedDevices: [
							`${pattern.customer_devices?.brand || "Unknown"} ${pattern.customer_devices?.model || "Unknown"}`,
						],
					});
				}

				return analyses;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error analyzing service patterns:", error);
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Add service note to repair ticket
	 */
	const addServiceNote = useCallback(
		async (
			repairTicketId: string,
			noteData: {
				noteType:
					| "diagnosis"
					| "repair"
					| "customer_interaction"
					| "quality_check";
				noteContent: string;
				isCustomerVisible?: boolean;
				technicianId: string;
			},
		): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				const { error: insertError } = await supabase
					.from("service_notes")
					.insert({
						repair_ticket_id: repairTicketId,
						technician_id: noteData.technicianId,
						note_type: noteData.noteType,
						note_content: noteData.noteContent,
						is_customer_visible: noteData.isCustomerVisible || false,
					});

				if (insertError) {
					throw new Error(`Error adding service note: ${insertError.message}`);
				}

				return true;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error adding service note:", error);
				setError(error);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Update customer service preferences
	 */
	const updateServicePreferences = useCallback(
		async (
			customerPhone: string,
			preferences: Partial<CustomerServicePreferences>,
		): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				const { error: upsertError } = await supabase
					.from("customer_service_preferences")
					.upsert({
						customer_phone: customerPhone,
						...preferences,
					});

				if (upsertError) {
					throw new Error(`Error updating preferences: ${upsertError.message}`);
				}

				return true;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error updating service preferences:", error);
				setError(error);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Export customer history to various formats
	 */
	const exportCustomerHistory = useCallback(
		async (
			customerPhone: string,
			format: "json" | "csv" = "json",
			includeServiceNotes = false,
		): Promise<{ success: boolean; data?: any; error?: string }> => {
			try {
				setLoading(true);
				setError(null);

				// Get comprehensive history data
				const [summary, repairs, devices, patterns] = await Promise.all([
					getCustomerHistorySummary(customerPhone),
					getRepairHistory(customerPhone, { includeServiceNotes }),
					getCustomerDevices(customerPhone),
					analyzeServicePatterns(customerPhone),
				]);

				const exportData = {
					summary,
					repairHistory: repairs,
					devices,
					servicePatterns: patterns,
					exportMetadata: {
						exportDate: new Date().toISOString(),
						format,
						includeServiceNotes,
						customerPhone,
					},
				};

				// Only JSON export is supported
				return { success: true, data: exportData };
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				console.error("Error exporting customer history:", error);
				setError(error);
				return {
					success: false,
					error: error.message,
				};
			} finally {
				setLoading(false);
			}
		},
		[
			getCustomerHistorySummary,
			getRepairHistory,
			getCustomerDevices,
			analyzeServicePatterns,
		],
	);

	return {
		// State
		loading,
		error,

		// Main functions
		getCustomerHistorySummary,
		getRepairHistory,
		getCustomerDevices,
		analyzeServicePatterns,

		// Actions
		addServiceNote,
		updateServicePreferences,
		exportCustomerHistory,
	};
}
