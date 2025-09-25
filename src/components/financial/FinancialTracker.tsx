/**
 * Financial Tracking Component
 * Comprehensive cost analysis and financial reporting for Vietnamese laptop repair shop
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	type CostBreakdown,
	type CostTrendAnalysis,
	type CustomerProfitability,
	type FinancialSummary,
	addRepairCost,
	analyzeCostTrends,
	analyzeCustomerProfitability,
	getFinancialSummary,
	getRepairCostBreakdown,
} from "@/lib/financial/cost-tracking";
import {
	AlertTriangle,
	BarChart3,
	Calendar,
	DollarSign,
	Minus,
	PieChart,
	Plus,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface FinancialTrackerProps {
	repairTicketId?: string;
}

export function FinancialTracker({ repairTicketId }: FinancialTrackerProps) {
	const [activeTab, setActiveTab] = useState("summary");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Financial data state
	const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(
		null,
	);
	const [financialSummary, setFinancialSummary] =
		useState<FinancialSummary | null>(null);
	const [customerProfitability, setCustomerProfitability] = useState<
		CustomerProfitability[]
	>([]);
	const [costTrends, setCostTrends] = useState<CostTrendAnalysis[]>([]);

	// Add cost dialog state
	const [addCostDialogOpen, setAddCostDialogOpen] = useState(false);
	const [newCostData, setNewCostData] = useState({
		category: "parts" as
			| "parts"
			| "labor"
			| "diagnostic"
			| "shipping"
			| "other",
		description: "",
		quantity: 1,
		unitCost: 0,
		isWarrantyCovered: false,
	});

	// Date filter state
	const [dateFilter, setDateFilter] = useState({
		startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0], // 90 days ago
		endDate: new Date().toISOString().split("T")[0],
	});

	const loadFinancialData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const promises: Promise<unknown>[] = [
				getFinancialSummary(dateFilter.startDate, dateFilter.endDate),
				analyzeCustomerProfitability(20),
			];

			if (repairTicketId) {
				promises.push(getRepairCostBreakdown(repairTicketId));
			}

			// Load cost trends (current vs previous period)
			const periodDays = Math.floor(
				(new Date(dateFilter.endDate).getTime() -
					new Date(dateFilter.startDate).getTime()) /
					(1000 * 60 * 60 * 24),
			);
			const previousStart = new Date(
				new Date(dateFilter.startDate).getTime() -
					periodDays * 24 * 60 * 60 * 1000,
			)
				.toISOString()
				.split("T")[0];
			const previousEnd = dateFilter.startDate;

			promises.push(
				analyzeCostTrends(
					dateFilter.startDate,
					dateFilter.endDate,
					previousStart,
					previousEnd,
				),
			);

			const results = await Promise.all(promises);

			setFinancialSummary(results[0]);
			setCustomerProfitability(results[1]);

			if (repairTicketId) {
				setCostBreakdown(results[2]);
				setCostTrends(results[3]);
			} else {
				setCostTrends(results[2]);
			}
		} catch (err) {
			setError("Không thể tải dữ liệu tài chính");
			console.error("Error loading financial data:", err);
		} finally {
			setLoading(false);
		}
	}, [repairTicketId, dateFilter]);

	useEffect(() => {
		loadFinancialData();
	}, [loadFinancialData]);

	const handleAddCost = async () => {
		if (!repairTicketId) {
			setError("Không có mã phiếu sửa chữa");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// In a real app, you'd get the current user ID from auth
			const result = await addRepairCost(repairTicketId, {
				...newCostData,
				addedBy: "current-user-id", // Replace with actual user ID
			});

			if (result.success) {
				setAddCostDialogOpen(false);
				setNewCostData({
					category: "parts",
					description: "",
					quantity: 1,
					unitCost: 0,
					isWarrantyCovered: false,
				});
				await loadFinancialData(); // Reload data
			} else {
				setError(result.error || "Không thể thêm chi phí");
			}
		} catch (err) {
			setError("Lỗi khi thêm chi phí");
			console.error("Error adding cost:", err);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatPercentage = (value: number) => {
		return `${value.toFixed(1)}%`;
	};

	const getProfitabilityColor = (margin: number) => {
		if (margin >= 20) return "text-green-600";
		if (margin >= 10) return "text-yellow-600";
		return "text-red-600";
	};

	const getTrendIcon = (direction: string) => {
		switch (direction) {
			case "increasing":
				return <TrendingUp className="h-4 w-4 text-red-500" />;
			case "decreasing":
				return <TrendingDown className="h-4 w-4 text-green-500" />;
			default:
				return <Minus className="h-4 w-4 text-gray-500" />;
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Date Filter */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-end gap-4">
						<div>
							<Label htmlFor="startDate">Từ ngày</Label>
							<Input
								id="startDate"
								type="date"
								value={dateFilter.startDate}
								onChange={(e) =>
									setDateFilter((prev) => ({
										...prev,
										startDate: e.target.value,
									}))
								}
							/>
						</div>
						<div>
							<Label htmlFor="endDate">Đến ngày</Label>
							<Input
								id="endDate"
								type="date"
								value={dateFilter.endDate}
								onChange={(e) =>
									setDateFilter((prev) => ({
										...prev,
										endDate: e.target.value,
									}))
								}
							/>
						</div>
						<Button onClick={loadFinancialData} disabled={loading}>
							Cập nhật
						</Button>
					</div>
				</CardContent>
			</Card>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="summary">Tổng Quan</TabsTrigger>
					<TabsTrigger value="breakdown">Chi Tiết</TabsTrigger>
					<TabsTrigger value="customers">Khách Hàng</TabsTrigger>
					<TabsTrigger value="trends">Xu Hướng</TabsTrigger>
				</TabsList>

				<TabsContent value="summary" className="space-y-4">
					{/* Financial Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Tổng doanh thu
										</p>
										<p className="text-lg font-bold">
											{formatCurrency(financialSummary?.totalRevenue || 0)}
										</p>
									</div>
									<DollarSign className="h-8 w-8 text-green-500" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Lợi nhuận gộp
										</p>
										<p className="text-lg font-bold">
											{formatCurrency(financialSummary?.grossProfit || 0)}
										</p>
									</div>
									<TrendingUp className="h-8 w-8 text-blue-500" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Tỷ lệ LN
										</p>
										<p className="text-lg font-bold">
											{formatPercentage(financialSummary?.profitMargin || 0)}
										</p>
									</div>
									<PieChart className="h-8 w-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Số lượng SC
										</p>
										<p className="text-2xl font-bold">
											{financialSummary?.repairCount || 0}
										</p>
									</div>
									<Users className="h-8 w-8 text-orange-500" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Top Categories */}
					{financialSummary?.topCategories &&
						financialSummary.topCategories.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Danh Mục Hàng Đầu</CardTitle>
									<CardDescription>Theo doanh thu trong kỳ</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{financialSummary.topCategories.map((category, index) => (
											<div
												key={`category-${category.category}-${index}`}
												className="flex items-center justify-between p-3 border rounded-lg"
											>
												<div className="flex items-center gap-3">
													<Badge variant="outline">{index + 1}</Badge>
													<span className="font-medium capitalize">
														{category.category}
													</span>
												</div>
												<div className="text-right">
													<div className="font-semibold">
														{formatCurrency(category.revenue)}
													</div>
													<div className="text-sm text-gray-500">
														{category.count} sửa chữa •{" "}
														{formatCurrency(category.avgValue)}/SC
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

					{/* Monthly Trends Chart Placeholder */}
					{financialSummary?.monthlyTrends &&
						financialSummary.monthlyTrends.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Xu Hướng Theo Tháng</CardTitle>
									<CardDescription>Doanh thu và chi phí</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{financialSummary.monthlyTrends.map((trend, index) => (
											<div
												key={`trend-${trend.month}-${index}`}
												className="flex items-center justify-between p-2 border-b"
											>
												<span className="font-medium">{trend.month}</span>
												<div className="flex items-center gap-4 text-sm">
													<span className="text-green-600">
														{formatCurrency(trend.revenue)}
													</span>
													<span className="text-red-600">
														{formatCurrency(trend.costs)}
													</span>
													<span className="text-gray-500">
														{trend.repairs} SC
													</span>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
				</TabsContent>

				<TabsContent value="breakdown" className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Chi Tiết Chi Phí</h3>
						{repairTicketId && (
							<Dialog
								open={addCostDialogOpen}
								onOpenChange={setAddCostDialogOpen}
							>
								<DialogTrigger asChild>
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										Thêm Chi Phí
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Thêm Chi Phí Sửa Chữa</DialogTitle>
										<DialogDescription>
											Thêm khoản chi phí mới cho phiếu sửa chữa
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div>
											<Label htmlFor="category">Loại chi phí</Label>
											<Select
												value={newCostData.category}
												onValueChange={(value: string) =>
													setNewCostData((prev) => ({
														...prev,
														category: value,
													}))
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="parts">Linh kiện</SelectItem>
													<SelectItem value="labor">Nhân công</SelectItem>
													<SelectItem value="diagnostic">Chẩn đoán</SelectItem>
													<SelectItem value="shipping">Vận chuyển</SelectItem>
													<SelectItem value="other">Khác</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor="description">Mô tả</Label>
											<Input
												id="description"
												value={newCostData.description}
												onChange={(e) =>
													setNewCostData((prev) => ({
														...prev,
														description: e.target.value,
													}))
												}
												placeholder="Mô tả chi phí..."
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="quantity">Số lượng</Label>
												<Input
													id="quantity"
													type="number"
													min="1"
													value={newCostData.quantity}
													onChange={(e) =>
														setNewCostData((prev) => ({
															...prev,
															quantity: Number(e.target.value),
														}))
													}
												/>
											</div>
											<div>
												<Label htmlFor="unitCost">Đơn giá</Label>
												<Input
													id="unitCost"
													type="number"
													min="0"
													value={newCostData.unitCost}
													onChange={(e) =>
														setNewCostData((prev) => ({
															...prev,
															unitCost: Number(e.target.value),
														}))
													}
													placeholder="Đơn giá..."
												/>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<input
												id="isWarrantyCovered"
												type="checkbox"
												checked={newCostData.isWarrantyCovered}
												onChange={(e) =>
													setNewCostData((prev) => ({
														...prev,
														isWarrantyCovered: e.target.checked,
													}))
												}
											/>
											<Label htmlFor="isWarrantyCovered">
												Được bảo hành chi trả
											</Label>
										</div>
									</div>
									<DialogFooter>
										<Button onClick={handleAddCost} disabled={loading}>
											Thêm Chi Phí
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}
					</div>

					{costBreakdown ? (
						<Card>
							<CardHeader>
								<CardTitle>Chi Phí Phiếu Sửa Chữa</CardTitle>
								<CardDescription>
									Khách hàng: {costBreakdown.customerPhone}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-6">
									<div>
										<h4 className="font-semibold mb-3">Phân Loại Chi Phí</h4>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span>Linh kiện:</span>
												<span className="font-medium">
													{formatCurrency(costBreakdown.costCategories.parts)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Nhân công:</span>
												<span className="font-medium">
													{formatCurrency(costBreakdown.costCategories.labor)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Chẩn đoán:</span>
												<span className="font-medium">
													{formatCurrency(
														costBreakdown.costCategories.diagnostic,
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Vận chuyển:</span>
												<span className="font-medium">
													{formatCurrency(
														costBreakdown.costCategories.shipping,
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Khác:</span>
												<span className="font-medium">
													{formatCurrency(costBreakdown.costCategories.other)}
												</span>
											</div>
										</div>
									</div>

									<div>
										<h4 className="font-semibold mb-3">Tổng Kết</h4>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span>Tổng chi phí:</span>
												<span className="font-medium">
													{formatCurrency(costBreakdown.totalCost)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Giảm trữ BH:</span>
												<span className="font-medium text-green-600">
													-{formatCurrency(costBreakdown.warrantyDicount)}
												</span>
											</div>
											<div className="flex justify-between border-t pt-2">
												<span className="font-semibold">Chi phí ròng:</span>
												<span className="font-bold">
													{formatCurrency(costBreakdown.netCost)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Lợi nhuận:</span>
												<span
													className={`font-medium ${getProfitabilityColor(costBreakdown.profitMargin)}`}
												>
													{formatCurrency(costBreakdown.profitAmount)} (
													{formatPercentage(costBreakdown.profitMargin)})
												</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					) : repairTicketId ? (
						<Card>
							<CardContent className="p-8 text-center text-gray-500">
								Không có dữ liệu chi phí cho phiếu sửa chữa này
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-8 text-center text-gray-500">
								Chọn phiếu sửa chữa để xem chi tiết chi phí
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="customers" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Phân Tích Lợi Nhuận Khách Hàng</CardTitle>
							<CardDescription>Top khách hàng theo lợi nhuận</CardDescription>
						</CardHeader>
						<CardContent>
							{customerProfitability.length === 0 ? (
								<div className="text-center text-gray-500 py-8">
									Không có dữ liệu khách hàng
								</div>
							) : (
								<div className="space-y-4">
									{customerProfitability.map((customer, index) => (
										<div
											key={`customer-${customer.customer_id || customer.customer_name}-${index}`}
											className="border rounded-lg p-4"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<Badge variant="outline">{index + 1}</Badge>
														<span className="font-semibold">
															{customer.customerName}
														</span>
														<span className="text-sm text-gray-500">
															({customer.customerPhone})
														</span>
														<Badge
															variant={
																customer.riskLevel === "low"
																	? "default"
																	: customer.riskLevel === "medium"
																		? "secondary"
																		: "destructive"
															}
														>
															{customer.riskLevel === "low"
																? "Thấp"
																: customer.riskLevel === "medium"
																	? "Trung bình"
																	: "Cao"}
														</Badge>
													</div>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
														<div>
															<span className="text-gray-500">
																Tổng chi tiêu:
															</span>
															<div className="font-medium">
																{formatCurrency(customer.totalSpent)}
															</div>
														</div>
														<div>
															<span className="text-gray-500">Lợi nhuận:</span>
															<div
																className={`font-medium ${getProfitabilityColor(customer.profitMargin)}`}
															>
																{formatCurrency(customer.totalProfit)}
															</div>
														</div>
														<div>
															<span className="text-gray-500">Tỷ lệ LN:</span>
															<div
																className={`font-medium ${getProfitabilityColor(customer.profitMargin)}`}
															>
																{formatPercentage(customer.profitMargin)}
															</div>
														</div>
														<div>
															<span className="text-gray-500">
																Số lượng SC:
															</span>
															<div className="font-medium">
																{customer.repairCount}
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="mt-3 pt-3 border-t text-sm">
												<div className="flex items-center justify-between">
													<span>
														CLV ước tính:{" "}
														<strong>
															{formatCurrency(customer.customerLifetimeValue)}
														</strong>
													</span>
													<span>
														SC cuối:{" "}
														{new Date(
															customer.lastRepairDate,
														).toLocaleDateString("vi-VN")}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="trends" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Phân Tích Xu Hướng Chi Phí</CardTitle>
							<CardDescription>So sánh với kỳ trước</CardDescription>
						</CardHeader>
						<CardContent>
							{costTrends.length === 0 ? (
								<div className="text-center text-gray-500 py-8">
									Không có dữ liệu xu hướng
								</div>
							) : (
								<div className="space-y-4">
									{costTrends.map((trend, index) => (
										<div
											key={`trend-${trend.period || trend.month || index}`}
											className="border rounded-lg p-4"
										>
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-center gap-3">
													{getTrendIcon(trend.trendDirection)}
													<span className="font-semibold capitalize">
														{trend.category}
													</span>
													<Badge
														variant={
															trend.trendDirection === "increasing"
																? "destructive"
																: trend.trendDirection === "decreasing"
																	? "default"
																	: "secondary"
														}
													>
														{trend.trendDirection === "increasing"
															? "Tăng"
															: trend.trendDirection === "decreasing"
																? "Giảm"
																: "Ổn định"}
														{trend.percentageChange !== 0 &&
															` ${formatPercentage(Math.abs(trend.percentageChange))}`}
													</Badge>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-6 mb-4">
												<div>
													<h5 className="font-medium mb-2">Kỳ hiện tại</h5>
													<div className="space-y-1 text-sm">
														<div className="flex justify-between">
															<span>Tổng chi phí:</span>
															<span className="font-medium">
																{formatCurrency(trend.currentPeriod.totalCost)}
															</span>
														</div>
														<div className="flex justify-between">
															<span>Chi phí TB:</span>
															<span className="font-medium">
																{formatCurrency(trend.currentPeriod.avgCost)}
															</span>
														</div>
														<div className="flex justify-between">
															<span>Số lượng:</span>
															<span className="font-medium">
																{trend.currentPeriod.count}
															</span>
														</div>
													</div>
												</div>

												<div>
													<h5 className="font-medium mb-2">Kỳ trước</h5>
													<div className="space-y-1 text-sm">
														<div className="flex justify-between">
															<span>Tổng chi phí:</span>
															<span className="font-medium">
																{formatCurrency(trend.previousPeriod.totalCost)}
															</span>
														</div>
														<div className="flex justify-between">
															<span>Chi phí TB:</span>
															<span className="font-medium">
																{formatCurrency(trend.previousPeriod.avgCost)}
															</span>
														</div>
														<div className="flex justify-between">
															<span>Số lượng:</span>
															<span className="font-medium">
																{trend.previousPeriod.count}
															</span>
														</div>
													</div>
												</div>
											</div>

											<div className="p-3 bg-blue-50 rounded-lg">
												<p className="text-sm">
													<strong>Khuyến nghị:</strong> {trend.recommendation}
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
