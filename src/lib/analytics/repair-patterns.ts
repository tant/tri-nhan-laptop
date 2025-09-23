/**
 * Repair Pattern Analysis and Service Intelligence
 * Analyzes customer repair data to identify patterns, predict issues, and generate insights
 */

export interface PatternAnalysisResult {
	patternId: string;
	patternType:
		| "recurring"
		| "seasonal"
		| "escalating"
		| "device_aging"
		| "user_behavior";
	severity: "low" | "medium" | "high" | "critical";
	confidence: number; // 0-1 scale
	description: string;
	recommendation: string;
	affectedCustomers: number;
	financialImpact: number;
	preventionStrategy?: string;
}

export interface CustomerRiskProfile {
	customerPhone: string;
	riskScore: number; // 0-100 scale
	riskFactors: Array<{
		factor: string;
		impact: number;
		description: string;
	}>;
	recommendations: string[];
	nextPredictedIssue?: {
		category: string;
		probability: number;
		timeframe: string;
		estimatedCost: number;
	};
}

export interface RepairTrendAnalysis {
	period: string;
	totalRepairs: number;
	averageCost: number;
	commonIssues: Array<{
		category: string;
		frequency: number;
		trend: "increasing" | "stable" | "decreasing";
	}>;
	seasonalPatterns: Array<{
		month: number;
		repairCount: number;
		avgCost: number;
		commonIssue: string;
	}>;
	deviceLifecycleInsights: Array<{
		deviceAge: number;
		failureRate: number;
		avgRepairCost: number;
		commonFailures: string[];
	}>;
}

/**
 * Analyze repair patterns for a specific customer
 */
export function analyzeCustomerPatterns(
	repairHistory: Array<{
		id: string;
		created_at: string;
		repair_category: string;
		issue_description: string;
		total_cost: number;
		device_id?: string;
		status: string;
		recurring_issue: boolean;
	}>,
): PatternAnalysisResult[] {
	const patterns: PatternAnalysisResult[] = [];

	// Group repairs by category
	const categoryGroups = repairHistory.reduce(
		(groups, repair) => {
			const category = repair.repair_category || "unknown";
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(repair);
			return groups;
		},
		{} as Record<string, typeof repairHistory>,
	);

	// Analyze recurring issues
	for (const [category, repairs] of Object.entries(categoryGroups)) {
		if (repairs.length >= 2) {
			const frequency = repairs.length;
			const avgCost =
				repairs.reduce((sum, r) => sum + (r.total_cost || 0), 0) /
				repairs.length;
			const timeSpan = getTimeSpanDays(
				repairs[0].created_at,
				repairs[repairs.length - 1].created_at,
			);
			const hasRecurringFlag = repairs.some((r) => r.recurring_issue);

			let severity: PatternAnalysisResult["severity"] = "low";
			let confidence = 0.5;

			if (frequency >= 3 && timeSpan < 180) {
				severity = "high";
				confidence = 0.8;
			} else if (frequency >= 2 && timeSpan < 90) {
				severity = "medium";
				confidence = 0.7;
			}

			if (hasRecurringFlag) {
				confidence += 0.1;
			}

			patterns.push({
				patternId: `recurring_${category}`,
				patternType: "recurring",
				severity,
				confidence: Math.min(confidence, 1),
				description: `Vấn đề ${category} lặp lại ${frequency} lần trong ${timeSpan} ngày`,
				recommendation: generateRecurringIssueRecommendation(
					category,
					frequency,
					avgCost,
				),
				affectedCustomers: 1,
				financialImpact: avgCost * frequency,
				preventionStrategy: generatePreventionStrategy(category),
			});
		}
	}

	// Analyze escalating issues (increasing frequency over time)
	const timeWindows = groupRepairsByTimeWindow(repairHistory, 90); // 90-day windows
	if (timeWindows.length >= 2) {
		const recentWindow = timeWindows[timeWindows.length - 1];
		const previousWindow = timeWindows[timeWindows.length - 2];

		if (recentWindow.count > previousWindow.count * 1.5) {
			patterns.push({
				patternId: "escalating_frequency",
				patternType: "escalating",
				severity: "high",
				confidence: 0.75,
				description: `Tần suất sửa chữa tăng ${Math.round((recentWindow.count / previousWindow.count - 1) * 100)}% trong 90 ngày gần đây`,
				recommendation:
					"Cần kiểm tra toàn diện thiết bị để tìm nguyên nhân gốc",
				affectedCustomers: 1,
				financialImpact: recentWindow.totalCost,
				preventionStrategy: "Thực hiện bảo trì định kỳ và đào tạo người dùng",
			});
		}
	}

	// Analyze device aging patterns
	const deviceGroups = repairHistory.reduce(
		(groups, repair) => {
			const deviceId = repair.device_id || "unknown";
			if (!groups[deviceId]) {
				groups[deviceId] = [];
			}
			groups[deviceId].push(repair);
			return groups;
		},
		{} as Record<string, typeof repairHistory>,
	);

	for (const [deviceId, deviceRepairs] of Object.entries(deviceGroups)) {
		if (deviceRepairs.length >= 2) {
			const sortedRepairs = deviceRepairs.sort(
				(a, b) =>
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
			);

			const timeSpan = getTimeSpanDays(
				sortedRepairs[0].created_at,
				sortedRepairs[sortedRepairs.length - 1].created_at,
			);
			const avgFrequency = deviceRepairs.length / (timeSpan / 30); // repairs per month

			if (avgFrequency > 1) {
				// More than 1 repair per month
				patterns.push({
					patternId: `device_aging_${deviceId}`,
					patternType: "device_aging",
					severity: avgFrequency > 2 ? "high" : "medium",
					confidence: 0.6,
					description: `Thiết bị ${deviceId} có ${deviceRepairs.length} lần sửa chữa trong ${Math.round(timeSpan)} ngày`,
					recommendation:
						avgFrequency > 2
							? "Cân nhắc thay thế thiết bị"
							: "Tăng cường bảo trì định kỳ",
					affectedCustomers: 1,
					financialImpact: deviceRepairs.reduce(
						(sum, r) => sum + (r.total_cost || 0),
						0,
					),
					preventionStrategy: "Lập kế hoạch thay thế thiết bị có tuổi đời cao",
				});
			}
		}
	}

	return patterns;
}

/**
 * Generate customer risk profile based on repair history
 */
export function generateCustomerRiskProfile(
	repairHistory: Array<{
		created_at: string;
		repair_category: string;
		total_cost: number;
		status: string;
		recurring_issue: boolean;
		customer_satisfaction_rating?: number;
	}>,
	deviceInfo: Array<{
		purchase_date?: string;
		device_type: string;
		brand: string;
		model: string;
	}>,
): CustomerRiskProfile {
	let riskScore = 0;
	const riskFactors: CustomerRiskProfile["riskFactors"] = [];
	const recommendations: string[] = [];

	// Factor 1: Repair frequency (0-30 points)
	const repairsLast6Months = repairHistory.filter((r) =>
		isWithinDays(r.created_at, 180),
	).length;

	if (repairsLast6Months >= 3) {
		riskScore += 25;
		riskFactors.push({
			factor: "Tần suất sửa chữa cao",
			impact: 25,
			description: `${repairsLast6Months} lần sửa chữa trong 6 tháng qua`,
		});
		recommendations.push("Đánh giá toàn diện nhu cầu thay thế thiết bị");
	} else if (repairsLast6Months >= 2) {
		riskScore += 15;
		riskFactors.push({
			factor: "Tần suất sửa chữa trung bình",
			impact: 15,
			description: `${repairsLast6Months} lần sửa chữa trong 6 tháng qua`,
		});
	}

	// Factor 2: Recurring issues (0-25 points)
	const recurringIssues = repairHistory.filter((r) => r.recurring_issue).length;
	if (recurringIssues > 0) {
		const impact = Math.min(recurringIssues * 8, 25);
		riskScore += impact;
		riskFactors.push({
			factor: "Vấn đề lặp lại",
			impact,
			description: `${recurringIssues} vấn đề đã lặp lại`,
		});
		recommendations.push("Tìm hiểu nguyên nhân gốc của vấn đề lặp lại");
	}

	// Factor 3: High repair costs (0-20 points)
	const avgRepairCost =
		repairHistory.reduce((sum, r) => sum + (r.total_cost || 0), 0) /
		repairHistory.length;
	if (avgRepairCost > 2000000) {
		// > 2 triệu VND
		riskScore += 20;
		riskFactors.push({
			factor: "Chi phí sửa chữa cao",
			impact: 20,
			description: `Chi phí trung bình ${formatCurrency(avgRepairCost)}`,
		});
		recommendations.push("Xem xét bảo hiểm thiết bị hoặc gói bảo trì");
	} else if (avgRepairCost > 1000000) {
		// > 1 triệu VND
		riskScore += 10;
		riskFactors.push({
			factor: "Chi phí sửa chữa trung bình cao",
			impact: 10,
			description: `Chi phí trung bình ${formatCurrency(avgRepairCost)}`,
		});
	}

	// Factor 4: Device age (0-15 points)
	const oldDevices = deviceInfo.filter((d) => {
		if (!d.purchase_date) return false;
		const ageYears = getDeviceAgeYears(d.purchase_date);
		return ageYears > 3;
	}).length;

	if (oldDevices > 0) {
		const impact = Math.min(oldDevices * 7, 15);
		riskScore += impact;
		riskFactors.push({
			factor: "Thiết bị cũ",
			impact,
			description: `${oldDevices} thiết bị trên 3 năm tuổi`,
		});
		recommendations.push("Lập kế hoạch nâng cấp thiết bị cũ");
	}

	// Factor 5: Customer satisfaction (0-10 points)
	const satisfactionRatings = repairHistory
		.filter((r) => r.customer_satisfaction_rating)
		.map((r) => r.customer_satisfaction_rating!);

	if (satisfactionRatings.length > 0) {
		const avgSatisfaction =
			satisfactionRatings.reduce((sum, r) => sum + r, 0) /
			satisfactionRatings.length;
		if (avgSatisfaction < 3) {
			riskScore += 10;
			riskFactors.push({
				factor: "Mức độ hài lòng thấp",
				impact: 10,
				description: `Điểm hài lòng trung bình: ${avgSatisfaction.toFixed(1)}/5`,
			});
			recommendations.push("Cải thiện chất lượng dịch vụ và giao tiếp");
		}
	}

	// Predict next issue
	let nextPredictedIssue: CustomerRiskProfile["nextPredictedIssue"];
	if (repairHistory.length >= 2) {
		const mostCommonCategory = getMostCommonCategory(repairHistory);
		const categoryHistory = repairHistory.filter(
			(r) => r.repair_category === mostCommonCategory,
		);

		if (categoryHistory.length >= 2) {
			const avgInterval = getAverageRepairInterval(categoryHistory);
			const lastRepair = new Date(
				Math.max(...repairHistory.map((r) => new Date(r.created_at).getTime())),
			);
			const daysSinceLastRepair =
				(Date.now() - lastRepair.getTime()) / (1000 * 60 * 60 * 24);

			const probability = Math.min(
				(daysSinceLastRepair / avgInterval) * 0.8,
				0.9,
			);

			if (probability > 0.3) {
				nextPredictedIssue = {
					category: mostCommonCategory,
					probability,
					timeframe: avgInterval < 90 ? "1-3 tháng tới" : "3-6 tháng tới",
					estimatedCost:
						categoryHistory.reduce((sum, r) => sum + (r.total_cost || 0), 0) /
						categoryHistory.length,
				};
			}
		}
	}

	// Add general recommendations
	if (riskScore < 30) {
		recommendations.push("Duy trì bảo trì định kỳ để phòng ngừa sự cố");
	} else if (riskScore < 60) {
		recommendations.push("Tăng cường theo dõi và bảo trì thiết bị");
	} else {
		recommendations.push("Cần đánh giá toàn diện và có kế hoạch can thiệp");
	}

	return {
		customerPhone: "unknown", // Will be set by caller
		riskScore: Math.min(riskScore, 100),
		riskFactors,
		recommendations,
		nextPredictedIssue,
	};
}

/**
 * Analyze seasonal repair trends
 */
export function analyzeSeasonalTrends(
	repairData: Array<{
		created_at: string;
		repair_category: string;
		total_cost: number;
	}>,
): RepairTrendAnalysis["seasonalPatterns"] {
	const monthlyData: Record<
		number,
		{
			repairs: Array<(typeof repairData)[0]>;
			count: number;
			totalCost: number;
		}
	> = {};

	// Initialize months
	for (let i = 1; i <= 12; i++) {
		monthlyData[i] = { repairs: [], count: 0, totalCost: 0 };
	}

	// Group repairs by month
	repairData.forEach((repair) => {
		const month = new Date(repair.created_at).getMonth() + 1;
		monthlyData[month].repairs.push(repair);
		monthlyData[month].count++;
		monthlyData[month].totalCost += repair.total_cost || 0;
	});

	// Generate seasonal patterns
	return Object.entries(monthlyData).map(([month, data]) => {
		const avgCost = data.count > 0 ? data.totalCost / data.count : 0;
		const commonIssue = getMostCommonCategory(data.repairs);

		return {
			month: Number.parseInt(month),
			repairCount: data.count,
			avgCost,
			commonIssue: commonIssue || "Không có dữ liệu",
		};
	});
}

// Helper functions
function getTimeSpanDays(startDate: string, endDate: string): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	return Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function isWithinDays(dateString: string, days: number): boolean {
	const date = new Date(dateString);
	const now = new Date();
	const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
	return diffDays <= days;
}

function getDeviceAgeYears(purchaseDate: string): number {
	const purchase = new Date(purchaseDate);
	const now = new Date();
	return (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365);
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(amount);
}

function getMostCommonCategory(
	repairs: Array<{ repair_category: string }>,
): string {
	const categoryCount: Record<string, number> = {};

	repairs.forEach((repair) => {
		const category = repair.repair_category || "unknown";
		categoryCount[category] = (categoryCount[category] || 0) + 1;
	});

	return (
		Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
		"unknown"
	);
}

function getAverageRepairInterval(
	repairs: Array<{ created_at: string }>,
): number {
	if (repairs.length < 2) return 365; // Default to 1 year

	const dates = repairs
		.map((r) => new Date(r.created_at))
		.sort((a, b) => a.getTime() - b.getTime());

	const intervals: number[] = [];
	for (let i = 1; i < dates.length; i++) {
		const intervalDays =
			(dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
		intervals.push(intervalDays);
	}

	return (
		intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
	);
}

function groupRepairsByTimeWindow(
	repairs: Array<{ created_at: string; total_cost: number }>,
	windowDays: number,
): Array<{ startDate: Date; endDate: Date; count: number; totalCost: number }> {
	if (repairs.length === 0) return [];

	const sortedRepairs = repairs.sort(
		(a, b) =>
			new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
	);

	const windows: Array<{
		startDate: Date;
		endDate: Date;
		count: number;
		totalCost: number;
	}> = [];
	const firstDate = new Date(sortedRepairs[0].created_at);
	const lastDate = new Date(sortedRepairs[sortedRepairs.length - 1].created_at);

	let currentStart = new Date(firstDate);
	while (currentStart < lastDate) {
		const currentEnd = new Date(currentStart);
		currentEnd.setDate(currentEnd.getDate() + windowDays);

		const windowRepairs = sortedRepairs.filter((r) => {
			const repairDate = new Date(r.created_at);
			return repairDate >= currentStart && repairDate < currentEnd;
		});

		windows.push({
			startDate: new Date(currentStart),
			endDate: new Date(currentEnd),
			count: windowRepairs.length,
			totalCost: windowRepairs.reduce((sum, r) => sum + (r.total_cost || 0), 0),
		});

		currentStart = new Date(currentEnd);
	}

	return windows;
}

function generateRecurringIssueRecommendation(
	category: string,
	frequency: number,
	avgCost: number,
): string {
	if (frequency >= 3) {
		if (avgCost > 1500000) {
			return "Cân nhắc thay thế thiết bị hoặc nâng cấp để tránh chi phí cao liên tục";
		}
		return "Tìm hiểu nguyên nhân gốc và thực hiện giải pháp phòng ngừa lâu dài";
	}

	if (category === "software") {
		return "Đào tạo người dùng và cài đặt phần mềm bảo mật để giảm lỗi phần mềm";
	}

	if (category === "hardware") {
		return "Tăng cường bảo trì định kỳ và kiểm tra phần cứng";
	}

	return "Theo dõi sát sao và thực hiện bảo trì định kỳ";
}

function generatePreventionStrategy(category: string): string {
	switch (category) {
		case "hardware":
			return "Bảo trì định kỳ, làm sạch hệ thống tản nhiệt, kiểm tra linh kiện";
		case "software":
			return "Cập nhật hệ điều hành, quét virus định kỳ, đào tạo người dùng";
		case "performance":
			return "Tối ưu hóa hệ thống, nâng cấp RAM/SSD, dọn dẹp file rác";
		case "physical_damage":
			return "Sử dụng túi bảo vệ, tránh va đập, bảo quản nơi khô ráo";
		default:
			return "Bảo trì định kỳ và sử dụng đúng cách";
	}
}
