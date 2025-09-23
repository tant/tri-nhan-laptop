/**
 * Warranty Management System
 * Handles warranty calculations, tracking, and notifications for Vietnamese laptop repair shop
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase-types";

// Database types
type WarrantyRecord = Database["public"]["Tables"]["warranty_records"]["Row"];
type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type CustomerDevice = Database["public"]["Tables"]["customer_devices"]["Row"];

export interface WarrantyStatus {
	deviceId: string;
	isUnderWarranty: boolean;
	warrantyType: string;
	warrantyEndDate: string;
	daysRemaining: number;
	coverageLevel: "full" | "partial" | "expired";
	warrantyProvider: string;
}

export interface WarrantyClaimInfo {
	repairTicketId: string;
	deviceId: string;
	warrantyType: string;
	claimAmount: number;
	coveragePercentage: number;
	claimStatus: "pending" | "approved" | "denied" | "processing";
	claimDate: string;
	expectedReimbursement: number;
}

export interface WarrantyExpirationAlert {
	deviceId: string;
	customerPhone: string;
	customerName: string;
	deviceInfo: string;
	warrantyType: string;
	expirationDate: string;
	daysUntilExpiration: number;
	alertLevel: "info" | "warning" | "urgent";
	recommendedAction: string;
}

/**
 * Check warranty status for a specific device
 */
export async function checkDeviceWarrantyStatus(
	deviceId: string,
	serviceDate?: string,
): Promise<WarrantyStatus | null> {
	try {
		const checkDate = serviceDate || new Date().toISOString().split("T")[0];

		const { data: warrantyData, error } = await supabase.rpc(
			"check_warranty_status",
			{
				p_device_id: deviceId,
				p_service_date: checkDate,
			},
		);

		if (error) {
			throw new Error(`Error checking warranty status: ${error.message}`);
		}

		if (!warrantyData || warrantyData.length === 0) {
			return null;
		}

		const warranty = warrantyData[0];
		const daysRemaining = warranty.days_remaining || 0;

		return {
			deviceId,
			isUnderWarranty: warranty.is_under_warranty,
			warrantyType: warranty.warranty_type,
			warrantyEndDate: warranty.warranty_end_date,
			daysRemaining,
			coverageLevel: determineCoverageLevel(
				warranty.warranty_type,
				daysRemaining,
			),
			warrantyProvider: getWarrantyProvider(warranty.warranty_type),
		};
	} catch (error) {
		console.error("Error checking device warranty status:", error);
		return null;
	}
}

/**
 * Get all warranty expiration alerts for the repair shop
 */
export async function getWarrantyExpirationAlerts(
	daysAhead = 30,
): Promise<WarrantyExpirationAlert[]> {
	try {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + daysAhead);
		const checkDate = futureDate.toISOString().split("T")[0];

		const { data: expiringWarranties, error } = await supabase
			.from("warranty_records")
			.select(`
				device_id,
				warranty_type,
				warranty_end_date,
				customer_devices!inner(
					customer_phone,
					brand,
					model,
					customers!inner(full_name)
				)
			`)
			.eq("is_active", true)
			.lte("warranty_end_date", checkDate)
			.gte("warranty_end_date", new Date().toISOString().split("T")[0]);

		if (error) {
			throw new Error(`Error fetching expiring warranties: ${error.message}`);
		}

		const alerts: WarrantyExpirationAlert[] = [];

		for (const warranty of expiringWarranties || []) {
			const device = warranty.customer_devices;
			const customer = device?.customers;

			if (!device || !customer) continue;

			const expirationDate = new Date(warranty.warranty_end_date);
			const daysUntilExpiration = Math.ceil(
				(expirationDate.getTime() - new Date().getTime()) /
					(1000 * 60 * 60 * 24),
			);

			alerts.push({
				deviceId: warranty.device_id,
				customerPhone: device.customer_phone,
				customerName: customer.full_name,
				deviceInfo: `${device.brand} ${device.model}`,
				warrantyType: warranty.warranty_type,
				expirationDate: warranty.warranty_end_date,
				daysUntilExpiration,
				alertLevel: getAlertLevel(daysUntilExpiration),
				recommendedAction: getRecommendedAction(
					warranty.warranty_type,
					daysUntilExpiration,
				),
			});
		}

		return alerts.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
	} catch (error) {
		console.error("Error getting warranty expiration alerts:", error);
		return [];
	}
}

/**
 * Create warranty claim for repair ticket
 */
export async function createWarrantyClaim(
	repairTicketId: string,
	deviceId: string,
	claimDetails: {
		warrantyType: string;
		claimAmount: number;
		coveragePercentage?: number;
		claimNotes?: string;
	},
): Promise<{ success: boolean; claimId?: string; error?: string }> {
	try {
		// Check if warranty is still valid
		const warrantyStatus = await checkDeviceWarrantyStatus(deviceId);
		if (!warrantyStatus?.isUnderWarranty) {
			return {
				success: false,
				error: "Thiết bị không còn trong thời gian bảo hành",
			};
		}

		// Calculate expected reimbursement
		const coveragePercentage =
			claimDetails.coveragePercentage ||
			getDefaultCoverage(claimDetails.warrantyType);
		const expectedReimbursement =
			claimDetails.claimAmount * (coveragePercentage / 100);

		// Create warranty claim record
		const { data: claimRecord, error: claimError } = await supabase
			.from("warranty_records")
			.update({
				claimed_at: new Date().toISOString(),
			})
			.eq("device_id", deviceId)
			.eq("warranty_type", claimDetails.warrantyType)
			.eq("is_active", true)
			.select()
			.single();

		if (claimError) {
			throw new Error(`Error creating warranty claim: ${claimError.message}`);
		}

		// Add cost entry for warranty coverage
		const { error: costError } = await supabase
			.from("repair_cost_history")
			.insert({
				repair_ticket_id: repairTicketId,
				cost_category: "warranty_coverage",
				item_description: `Bảo hành ${claimDetails.warrantyType} - ${coveragePercentage}%`,
				quantity: 1,
				unit_cost: -expectedReimbursement,
				total_cost: -expectedReimbursement,
				is_warranty_covered: true,
				added_by: (await supabase.auth.getUser()).data.user?.id || "",
			});

		if (costError) {
			throw new Error(`Error adding warranty cost entry: ${costError.message}`);
		}

		return {
			success: true,
			claimId: claimRecord.id,
		};
	} catch (error) {
		console.error("Error creating warranty claim:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Không thể tạo yêu cầu bảo hành",
		};
	}
}

/**
 * Calculate warranty coverage for repair costs
 */
export async function calculateWarrantyCoverage(
	deviceId: string,
	repairCosts: Array<{
		category: string;
		amount: number;
		description: string;
	}>,
): Promise<{
	totalCost: number;
	coveredAmount: number;
	customerAmount: number;
	coverageDetails: Array<{
		category: string;
		amount: number;
		coveragePercentage: number;
		coveredAmount: number;
	}>;
}> {
	try {
		const warrantyStatus = await checkDeviceWarrantyStatus(deviceId);

		let totalCost = 0;
		let coveredAmount = 0;
		const coverageDetails = [];

		for (const cost of repairCosts) {
			totalCost += cost.amount;

			if (warrantyStatus?.isUnderWarranty) {
				const coveragePercentage = getCostCoverage(
					warrantyStatus.warrantyType,
					cost.category,
				);
				const itemCoveredAmount = cost.amount * (coveragePercentage / 100);

				coveredAmount += itemCoveredAmount;
				coverageDetails.push({
					category: cost.category,
					amount: cost.amount,
					coveragePercentage,
					coveredAmount: itemCoveredAmount,
				});
			} else {
				coverageDetails.push({
					category: cost.category,
					amount: cost.amount,
					coveragePercentage: 0,
					coveredAmount: 0,
				});
			}
		}

		return {
			totalCost,
			coveredAmount,
			customerAmount: totalCost - coveredAmount,
			coverageDetails,
		};
	} catch (error) {
		console.error("Error calculating warranty coverage:", error);
		return {
			totalCost: repairCosts.reduce((sum, cost) => sum + cost.amount, 0),
			coveredAmount: 0,
			customerAmount: repairCosts.reduce((sum, cost) => sum + cost.amount, 0),
			coverageDetails: repairCosts.map((cost) => ({
				category: cost.category,
				amount: cost.amount,
				coveragePercentage: 0,
				coveredAmount: 0,
			})),
		};
	}
}

/**
 * Get warranty analytics for business reporting
 */
export async function getWarrantyAnalytics(
	startDate: string,
	endDate: string,
): Promise<{
	totalClaims: number;
	approvedClaims: number;
	totalSavings: number;
	avgClaimAmount: number;
	topWarrantyTypes: Array<{
		type: string;
		count: number;
		savings: number;
	}>;
	monthlyTrends: Array<{
		month: string;
		claims: number;
		savings: number;
	}>;
}> {
	try {
		const { data: claimsData, error } = await supabase
			.from("warranty_records")
			.select(`
				warranty_type,
				claimed_at,
				repair_cost_history!inner(total_cost)
			`)
			.not("claimed_at", "is", null)
			.gte("claimed_at", startDate)
			.lte("claimed_at", endDate);

		if (error) {
			throw new Error(`Error fetching warranty analytics: ${error.message}`);
		}

		const claims = claimsData || [];
		const totalClaims = claims.length;
		const approvedClaims = claims.filter(
			(c) => c.repair_cost_history?.total_cost,
		).length;

		const totalSavings = claims.reduce(
			(sum, claim) =>
				sum + Math.abs(claim.repair_cost_history?.total_cost || 0),
			0,
		);

		const avgClaimAmount =
			approvedClaims > 0 ? totalSavings / approvedClaims : 0;

		// Group by warranty type
		const typeGroups = claims.reduce(
			(groups, claim) => {
				const type = claim.warranty_type;
				if (!groups[type]) {
					groups[type] = { count: 0, savings: 0 };
				}
				groups[type].count++;
				groups[type].savings += Math.abs(
					claim.repair_cost_history?.total_cost || 0,
				);
				return groups;
			},
			{} as Record<string, { count: number; savings: number }>,
		);

		const topWarrantyTypes = Object.entries(typeGroups)
			.map(([type, data]) => ({
				type,
				count: data.count,
				savings: data.savings,
			}))
			.sort((a, b) => b.savings - a.savings)
			.slice(0, 5);

		// Group by month
		const monthGroups = claims.reduce(
			(groups, claim) => {
				if (!claim.claimed_at) return groups;

				const month = new Date(claim.claimed_at).toISOString().substring(0, 7);
				if (!groups[month]) {
					groups[month] = { claims: 0, savings: 0 };
				}
				groups[month].claims++;
				groups[month].savings += Math.abs(
					claim.repair_cost_history?.total_cost || 0,
				);
				return groups;
			},
			{} as Record<string, { claims: number; savings: number }>,
		);

		const monthlyTrends = Object.entries(monthGroups)
			.map(([month, data]) => ({
				month,
				claims: data.claims,
				savings: data.savings,
			}))
			.sort((a, b) => a.month.localeCompare(b.month));

		return {
			totalClaims,
			approvedClaims,
			totalSavings,
			avgClaimAmount,
			topWarrantyTypes,
			monthlyTrends,
		};
	} catch (error) {
		console.error("Error getting warranty analytics:", error);
		return {
			totalClaims: 0,
			approvedClaims: 0,
			totalSavings: 0,
			avgClaimAmount: 0,
			topWarrantyTypes: [],
			monthlyTrends: [],
		};
	}
}

// Helper functions

function determineCoverageLevel(
	warrantyType: string,
	daysRemaining: number,
): "full" | "partial" | "expired" {
	if (daysRemaining <= 0) return "expired";
	if (warrantyType === "manufacturer" && daysRemaining > 90) return "full";
	if (warrantyType === "extended" && daysRemaining > 30) return "full";
	return "partial";
}

function getWarrantyProvider(warrantyType: string): string {
	switch (warrantyType) {
		case "manufacturer":
			return "Nhà sản xuất";
		case "extended":
			return "Bảo hành mở rộng";
		case "shop_warranty":
			return "Bảo hành cửa hàng";
		default:
			return "Không xác định";
	}
}

function getAlertLevel(
	daysUntilExpiration: number,
): "info" | "warning" | "urgent" {
	if (daysUntilExpiration <= 7) return "urgent";
	if (daysUntilExpiration <= 14) return "warning";
	return "info";
}

function getRecommendedAction(
	warrantyType: string,
	daysUntilExpiration: number,
): string {
	if (daysUntilExpiration <= 7) {
		return "Liên hệ khách hàng ngay để thông báo hết hạn bảo hành";
	}
	if (daysUntilExpiration <= 14) {
		return "Chuẩn bị thông báo khách hàng về việc hết hạn bảo hành";
	}
	if (warrantyType === "manufacturer") {
		return "Đề xuất khách hàng mua bảo hành mở rộng";
	}
	return "Theo dõi định kỳ";
}

function getDefaultCoverage(warrantyType: string): number {
	switch (warrantyType) {
		case "manufacturer":
			return 100;
		case "extended":
			return 80;
		case "shop_warranty":
			return 90;
		default:
			return 0;
	}
}

function getCostCoverage(warrantyType: string, costCategory: string): number {
	const coverageMatrix = {
		manufacturer: {
			parts: 100,
			labor: 100,
			diagnostic: 0,
			shipping: 0,
			other: 0,
		},
		extended: {
			parts: 80,
			labor: 80,
			diagnostic: 50,
			shipping: 0,
			other: 0,
		},
		shop_warranty: {
			parts: 90,
			labor: 100,
			diagnostic: 100,
			shipping: 100,
			other: 50,
		},
	};

	return coverageMatrix[warrantyType]?.[costCategory] || 0;
}
