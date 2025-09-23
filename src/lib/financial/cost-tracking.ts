/**
 * Financial Cost Tracking System
 * Comprehensive cost analysis and financial reporting for Vietnamese laptop repair shop
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase-types";

// Database types
type RepairCostHistory =
	Database["public"]["Tables"]["repair_cost_history"]["Row"];
type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];

export interface CostBreakdown {
	repairTicketId: string;
	customerPhone: string;
	totalCost: number;
	costCategories: {
		parts: number;
		labor: number;
		diagnostic: number;
		shipping: number;
		other: number;
	};
	warrantyDicount: number;
	netCost: number;
	profitMargin: number;
	profitAmount: number;
}

export interface FinancialSummary {
	period: string;
	totalRevenue: number;
	totalCosts: number;
	grossProfit: number;
	profitMargin: number;
	repairCount: number;
	avgRepairValue: number;
	topCategories: Array<{
		category: string;
		revenue: number;
		count: number;
		avgValue: number;
	}>;
	monthlyTrends: Array<{
		month: string;
		revenue: number;
		costs: number;
		repairs: number;
	}>;
}

export interface CustomerProfitability {
	customerPhone: string;
	customerName: string;
	totalSpent: number;
	totalProfit: number;
	profitMargin: number;
	repairCount: number;
	avgRepairValue: number;
	lastRepairDate: string;
	customerLifetimeValue: number;
	riskLevel: "low" | "medium" | "high";
}

export interface CostTrendAnalysis {
	category: string;
	currentPeriod: {
		totalCost: number;
		avgCost: number;
		count: number;
	};
	previousPeriod: {
		totalCost: number;
		avgCost: number;
		count: number;
	};
	trendDirection: "increasing" | "decreasing" | "stable";
	percentageChange: number;
	recommendation: string;
}

/**
 * Get detailed cost breakdown for a repair ticket
 */
export async function getRepairCostBreakdown(
	repairTicketId: string,
): Promise<CostBreakdown | null> {
	try {
		const { data: ticket, error: ticketError } = await supabase
			.from("repair_tickets")
			.select("customer_phone, total_cost")
			.eq("id", repairTicketId)
			.single();

		if (ticketError) {
			throw new Error(`Error fetching repair ticket: ${ticketError.message}`);
		}

		const { data: costs, error: costsError } = await supabase
			.from("repair_cost_history")
			.select("*")
			.eq("repair_ticket_id", repairTicketId);

		if (costsError) {
			throw new Error(`Error fetching repair costs: ${costsError.message}`);
		}

		const costCategories = {
			parts: 0,
			labor: 0,
			diagnostic: 0,
			shipping: 0,
			other: 0,
		};

		let warrantyDiscount = 0;
		let totalCost = 0;

		for (const cost of costs || []) {
			const amount = Number(cost.total_cost);
			totalCost += amount;

			if (cost.is_warranty_covered && amount < 0) {
				warrantyDiscount += Math.abs(amount);
			} else {
				const category = cost.cost_category as keyof typeof costCategories;
				if (category in costCategories) {
					costCategories[category] += amount;
				} else {
					costCategories.other += amount;
				}
			}
		}

		const netCost = totalCost - warrantyDiscount;
		const estimatedCostBasis =
			costCategories.parts * 0.6 + costCategories.labor * 0.3;
		const profitAmount = netCost - estimatedCostBasis;
		const profitMargin = netCost > 0 ? (profitAmount / netCost) * 100 : 0;

		return {
			repairTicketId,
			customerPhone: ticket.customer_phone,
			totalCost,
			costCategories,
			warrantyDicount: warrantyDiscount,
			netCost,
			profitMargin,
			profitAmount,
		};
	} catch (error) {
		console.error("Error getting repair cost breakdown:", error);
		return null;
	}
}

/**
 * Get financial summary for a specific period
 */
export async function getFinancialSummary(
	startDate: string,
	endDate: string,
): Promise<FinancialSummary> {
	try {
		// Get completed repairs in the period
		const { data: repairs, error: repairsError } = await supabase
			.from("repair_tickets")
			.select(`
				id,
				total_cost,
				repair_category,
				repair_completed_at,
				repair_cost_history(*)
			`)
			.eq("status", "completed")
			.gte("repair_completed_at", startDate)
			.lte("repair_completed_at", endDate);

		if (repairsError) {
			throw new Error(`Error fetching repairs: ${repairsError.message}`);
		}

		let totalRevenue = 0;
		let totalCosts = 0;
		const repairCount = repairs?.length || 0;
		const categoryStats = {} as Record<
			string,
			{ revenue: number; count: number }
		>;
		const monthlyStats = {} as Record<
			string,
			{ revenue: number; costs: number; repairs: number }
		>;

		for (const repair of repairs || []) {
			const revenue = Number(repair.total_cost) || 0;
			totalRevenue += revenue;

			// Calculate costs (parts + labor cost basis)
			const partsCost =
				repair.repair_cost_history
					?.filter((c) => c.cost_category === "parts")
					.reduce((sum, c) => sum + Number(c.total_cost) * 0.6, 0) || 0;
			const laborCost =
				repair.repair_cost_history
					?.filter((c) => c.cost_category === "labor")
					.reduce((sum, c) => sum + Number(c.total_cost) * 0.3, 0) || 0;

			const repairCosts = partsCost + laborCost;
			totalCosts += repairCosts;

			// Category statistics
			const category = repair.repair_category || "unknown";
			if (!categoryStats[category]) {
				categoryStats[category] = { revenue: 0, count: 0 };
			}
			categoryStats[category].revenue += revenue;
			categoryStats[category].count++;

			// Monthly statistics
			if (repair.repair_completed_at) {
				const month = new Date(repair.repair_completed_at)
					.toISOString()
					.substring(0, 7);
				if (!monthlyStats[month]) {
					monthlyStats[month] = { revenue: 0, costs: 0, repairs: 0 };
				}
				monthlyStats[month].revenue += revenue;
				monthlyStats[month].costs += repairCosts;
				monthlyStats[month].repairs++;
			}
		}

		const grossProfit = totalRevenue - totalCosts;
		const profitMargin =
			totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
		const avgRepairValue = repairCount > 0 ? totalRevenue / repairCount : 0;

		// Top categories
		const topCategories = Object.entries(categoryStats)
			.map(([category, stats]) => ({
				category,
				revenue: stats.revenue,
				count: stats.count,
				avgValue: stats.count > 0 ? stats.revenue / stats.count : 0,
			}))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		// Monthly trends
		const monthlyTrends = Object.entries(monthlyStats)
			.map(([month, stats]) => ({
				month,
				revenue: stats.revenue,
				costs: stats.costs,
				repairs: stats.repairs,
			}))
			.sort((a, b) => a.month.localeCompare(b.month));

		return {
			period: `${startDate} to ${endDate}`,
			totalRevenue,
			totalCosts,
			grossProfit,
			profitMargin,
			repairCount,
			avgRepairValue,
			topCategories,
			monthlyTrends,
		};
	} catch (error) {
		console.error("Error getting financial summary:", error);
		return {
			period: `${startDate} to ${endDate}`,
			totalRevenue: 0,
			totalCosts: 0,
			grossProfit: 0,
			profitMargin: 0,
			repairCount: 0,
			avgRepairValue: 0,
			topCategories: [],
			monthlyTrends: [],
		};
	}
}

/**
 * Analyze customer profitability
 */
export async function analyzeCustomerProfitability(
	limit = 50,
): Promise<CustomerProfitability[]> {
	try {
		const { data: customerData, error } = await supabase.rpc(
			"get_customer_profitability_analysis",
			{ p_limit: limit },
		);

		if (
			error &&
			error.message.includes("function") &&
			error.message.includes("does not exist")
		) {
			// Fallback to manual calculation if function doesn't exist
			return await calculateCustomerProfitabilityManually(limit);
		}

		if (error) {
			throw new Error(`Error getting customer profitability: ${error.message}`);
		}

		return customerData || [];
	} catch (error) {
		console.error("Error analyzing customer profitability:", error);
		return await calculateCustomerProfitabilityManually(limit);
	}
}

/**
 * Manual customer profitability calculation (fallback)
 */
async function calculateCustomerProfitabilityManually(
	limit: number,
): Promise<CustomerProfitability[]> {
	try {
		const { data: customers, error } = await supabase
			.from("customers")
			.select(`
				phone,
				full_name,
				created_at,
				repair_tickets!inner(
					total_cost,
					repair_completed_at,
					repair_cost_history(*)
				)
			`)
			.not("repair_tickets.repair_completed_at", "is", null)
			.limit(limit);

		if (error) {
			throw error;
		}

		const profitabilityData: CustomerProfitability[] = [];

		for (const customer of customers || []) {
			const repairs = customer.repair_tickets || [];
			let totalSpent = 0;
			let totalProfit = 0;
			let lastRepairDate = "";

			for (const repair of repairs) {
				const revenue = Number(repair.total_cost) || 0;
				totalSpent += revenue;

				// Estimate costs
				const partsCost =
					repair.repair_cost_history
						?.filter((c) => c.cost_category === "parts")
						.reduce((sum, c) => sum + Number(c.total_cost) * 0.6, 0) || 0;
				const laborCost =
					repair.repair_cost_history
						?.filter((c) => c.cost_category === "labor")
						.reduce((sum, c) => sum + Number(c.total_cost) * 0.3, 0) || 0;

				const repairProfit = revenue - partsCost - laborCost;
				totalProfit += repairProfit;

				if (!lastRepairDate || repair.repair_completed_at > lastRepairDate) {
					lastRepairDate = repair.repair_completed_at;
				}
			}

			const profitMargin =
				totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;
			const avgRepairValue =
				repairs.length > 0 ? totalSpent / repairs.length : 0;

			// Simple CLV calculation (annual spending * 3 years)
			const customerAge = Math.max(
				1,
				(new Date().getTime() - new Date(customer.created_at).getTime()) /
					(1000 * 60 * 60 * 24 * 365),
			);
			const annualSpending = totalSpent / customerAge;
			const customerLifetimeValue = annualSpending * 3;

			const riskLevel = determineCustomerRisk(
				totalSpent,
				repairs.length,
				profitMargin,
				lastRepairDate,
			);

			profitabilityData.push({
				customerPhone: customer.phone,
				customerName: customer.full_name,
				totalSpent,
				totalProfit,
				profitMargin,
				repairCount: repairs.length,
				avgRepairValue,
				lastRepairDate,
				customerLifetimeValue,
				riskLevel,
			});
		}

		return profitabilityData.sort((a, b) => b.totalProfit - a.totalProfit);
	} catch (error) {
		console.error("Error calculating customer profitability manually:", error);
		return [];
	}
}

/**
 * Analyze cost trends over time
 */
export async function analyzeCostTrends(
	currentStart: string,
	currentEnd: string,
	previousStart: string,
	previousEnd: string,
): Promise<CostTrendAnalysis[]> {
	try {
		const [currentData, previousData] = await Promise.all([
			getCostDataForPeriod(currentStart, currentEnd),
			getCostDataForPeriod(previousStart, previousEnd),
		]);

		const trends: CostTrendAnalysis[] = [];
		const categories = new Set([
			...Object.keys(currentData),
			...Object.keys(previousData),
		]);

		for (const category of categories) {
			const current = currentData[category] || {
				totalCost: 0,
				avgCost: 0,
				count: 0,
			};
			const previous = previousData[category] || {
				totalCost: 0,
				avgCost: 0,
				count: 0,
			};

			const percentageChange =
				previous.totalCost > 0
					? ((current.totalCost - previous.totalCost) / previous.totalCost) *
						100
					: current.totalCost > 0
						? 100
						: 0;

			let trendDirection: "increasing" | "decreasing" | "stable" = "stable";
			if (Math.abs(percentageChange) > 5) {
				trendDirection = percentageChange > 0 ? "increasing" : "decreasing";
			}

			trends.push({
				category,
				currentPeriod: current,
				previousPeriod: previous,
				trendDirection,
				percentageChange,
				recommendation: generateCostTrendRecommendation(
					category,
					trendDirection,
					percentageChange,
				),
			});
		}

		return trends.sort(
			(a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange),
		);
	} catch (error) {
		console.error("Error analyzing cost trends:", error);
		return [];
	}
}

/**
 * Get cost data for a specific period
 */
async function getCostDataForPeriod(
	startDate: string,
	endDate: string,
): Promise<
	Record<string, { totalCost: number; avgCost: number; count: number }>
> {
	const { data: costs, error } = await supabase
		.from("repair_cost_history")
		.select("cost_category, total_cost")
		.gte("cost_date", startDate)
		.lte("cost_date", endDate);

	if (error) {
		throw new Error(`Error fetching cost data: ${error.message}`);
	}

	const categoryData = {} as Record<
		string,
		{ totalCost: number; avgCost: number; count: number }
	>;

	for (const cost of costs || []) {
		const category = cost.cost_category;
		const amount = Number(cost.total_cost);

		if (!categoryData[category]) {
			categoryData[category] = { totalCost: 0, avgCost: 0, count: 0 };
		}

		categoryData[category].totalCost += amount;
		categoryData[category].count++;
	}

	// Calculate averages
	for (const category of Object.keys(categoryData)) {
		const data = categoryData[category];
		data.avgCost = data.count > 0 ? data.totalCost / data.count : 0;
	}

	return categoryData;
}

/**
 * Add cost entry to repair ticket
 */
export async function addRepairCost(
	repairTicketId: string,
	costData: {
		category: "parts" | "labor" | "diagnostic" | "shipping" | "other";
		description: string;
		quantity: number;
		unitCost: number;
		isWarrantyCovered?: boolean;
		addedBy: string;
	},
): Promise<{ success: boolean; error?: string }> {
	try {
		const totalCost = costData.quantity * costData.unitCost;

		const { error: insertError } = await supabase
			.from("repair_cost_history")
			.insert({
				repair_ticket_id: repairTicketId,
				cost_category: costData.category,
				item_description: costData.description,
				quantity: costData.quantity,
				unit_cost: costData.unitCost,
				total_cost: totalCost,
				is_warranty_covered: costData.isWarrantyCovered || false,
				added_by: costData.addedBy,
			});

		if (insertError) {
			throw insertError;
		}

		// Update repair ticket total cost
		await updateRepairTicketTotalCost(repairTicketId);

		return { success: true };
	} catch (error) {
		console.error("Error adding repair cost:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Không thể thêm chi phí",
		};
	}
}

/**
 * Update repair ticket total cost
 */
async function updateRepairTicketTotalCost(
	repairTicketId: string,
): Promise<void> {
	try {
		const { data: costs, error: costsError } = await supabase
			.from("repair_cost_history")
			.select("total_cost")
			.eq("repair_ticket_id", repairTicketId);

		if (costsError) {
			throw costsError;
		}

		const totalCost =
			costs?.reduce((sum, cost) => sum + Number(cost.total_cost), 0) || 0;

		const { error: updateError } = await supabase
			.from("repair_tickets")
			.update({ total_cost: totalCost })
			.eq("id", repairTicketId);

		if (updateError) {
			throw updateError;
		}
	} catch (error) {
		console.error("Error updating repair ticket total cost:", error);
	}
}

// Helper functions

function determineCustomerRisk(
	totalSpent: number,
	repairCount: number,
	profitMargin: number,
	lastRepairDate: string,
): "low" | "medium" | "high" {
	const daysSinceLastRepair = Math.floor(
		(new Date().getTime() - new Date(lastRepairDate).getTime()) /
			(1000 * 60 * 60 * 24),
	);

	if (daysSinceLastRepair > 365) return "high";
	if (profitMargin < 10 && totalSpent < 1000000) return "medium"; // < 1M VND
	if (repairCount > 5 && profitMargin > 20) return "low";

	return "medium";
}

function generateCostTrendRecommendation(
	category: string,
	direction: "increasing" | "decreasing" | "stable",
	percentageChange: number,
): string {
	if (direction === "increasing" && percentageChange > 20) {
		switch (category) {
			case "parts":
				return "Chi phí linh kiện tăng cao. Xem xét thay đổi nhà cung cấp hoặc đàm phán giá tốt hơn.";
			case "labor":
				return "Chi phí nhân công tăng. Đánh giá hiệu quả làm việc và quy trình sửa chữa.";
			default:
				return `Chi phí ${category} tăng ${percentageChange.toFixed(1)}%. Cần phân tích chi tiết và tối ưu hóa.`;
		}
	}

	if (direction === "decreasing" && Math.abs(percentageChange) > 20) {
		return `Chi phí ${category} giảm ${Math.abs(percentageChange).toFixed(1)}%. Xu hướng tích cực, duy trì hiệu quả.`;
	}

	return `Chi phí ${category} ổn định. Tiếp tục theo dõi.`;
}
