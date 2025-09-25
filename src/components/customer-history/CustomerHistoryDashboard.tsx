/**
 * Customer History Dashboard
 * Comprehensive customer history tracking and analytics dashboard for Vietnamese laptop repair shop
 */

import { FinancialTracker } from "@/components/financial/FinancialTracker";
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
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyManager } from "@/components/warranty/WarrantyManager";
import { useCustomerHistory } from "@/hooks/use-customer-history";
import type {
	CustomerHistorySummary,
	DeviceHistoryItem,
	RepairHistoryItem,
	ServicePatternAnalysis,
} from "@/hooks/use-customer-history";
import { analyzeCustomerPatterns } from "@/lib/analytics/repair-patterns";
import {
	AlertTriangle,
	BarChart3,
	DollarSign,
	Download,
	Eye,
	History,
	Search,
	Settings,
	Smartphone,
	TrendingUp,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CustomerHistoryDashboardProps {
	initialCustomerPhone?: string;
}

export function CustomerHistoryDashboard({
	initialCustomerPhone,
}: CustomerHistoryDashboardProps) {
	const {
		loading,
		error,
		getCustomerHistorySummary,
		getRepairHistory,
		getCustomerDevices,
		analyzeServicePatterns,
		exportCustomerHistory,
	} = useCustomerHistory();

	// Search and customer state
	const [searchPhone, setSearchPhone] = useState(initialCustomerPhone || "");
	const [currentCustomer, setCurrentCustomer] = useState<string>("");
	const [activeTab, setActiveTab] = useState("overview");

	// Data state
	const [customerSummary, setCustomerSummary] =
		useState<CustomerHistorySummary | null>(null);
	const [repairHistory, setRepairHistory] = useState<RepairHistoryItem[]>([]);
	const [devices, setDevices] = useState<DeviceHistoryItem[]>([]);
	const [servicePatterns, setServicePatterns] = useState<
		ServicePatternAnalysis[]
	>([]);
	const [patternAnalysis, setPatternAnalysis] = useState<{
		patterns: Array<{
			type: string;
			frequency: number;
			[key: string]: unknown;
		}>;
		trends: Array<{ period: string; count: number; [key: string]: unknown }>;
		[key: string]: unknown;
	} | null>(null);

	// Dialog states
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [selectedRepair, setSelectedRepair] =
		useState<RepairHistoryItem | null>(null);
	const [selectedDevice, setSelectedDevice] =
		useState<DeviceHistoryItem | null>(null);

	useEffect(() => {
		if (initialCustomerPhone) {
			handleSearchCustomer();
		}
	}, [initialCustomerPhone]);

	const handleSearchCustomer = async () => {
		if (!searchPhone.trim()) return;

		try {
			setCurrentCustomer(searchPhone);
			await loadCustomerData(searchPhone);
		} catch (err) {
			console.error("Error searching customer:", err);
		}
	};

	const loadCustomerData = async (customerPhone: string) => {
		try {
			const [summary, repairs, customerDevices, patterns] = await Promise.all([
				getCustomerHistorySummary(customerPhone),
				getRepairHistory(customerPhone, { includeServiceNotes: true }),
				getCustomerDevices(customerPhone),
				analyzeServicePatterns(customerPhone),
			]);

			setCustomerSummary(summary);
			setRepairHistory(repairs);
			setDevices(customerDevices);
			setServicePatterns(patterns);

			// Analyze repair patterns for advanced insights
			if (repairs.length > 0) {
				const analysis = analyzeCustomerPatterns(
					repairs.map((repair) => ({
						id: repair.id,
						created_at: repair.created_at,
						repair_category: repair.repair_category || "unknown",
						issue_description: repair.issue_description,
						total_cost: repair.total_cost || 0,
						device_id: repair.device_id,
						status: repair.status,
						recurring_issue: repair.recurring_issue || false,
					})),
				);
				setPatternAnalysis(analysis);
			}
		} catch (err) {
			console.error("Error loading customer data:", err);
		}
	};

	const handleExportData = async (
		format: "json" | "csv",
		includeNotes: boolean,
	) => {
		if (!currentCustomer) return;

		try {
			const result = await exportCustomerHistory(
				currentCustomer,
				format,
				includeNotes,
			);
			if (result.success && result.data) {
				// Create download
				const dataStr =
					format === "json"
						? JSON.stringify(result.data, null, 2)
						: result.data;
				const dataBlob = new Blob([dataStr], {
					type: format === "json" ? "application/json" : "text/csv",
				});

				const url = URL.createObjectURL(dataBlob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `customer-history-${currentCustomer}-${new Date().toISOString().split("T")[0]}.${format}`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				setExportDialogOpen(false);
			}
		} catch (err) {
			console.error("Error exporting data:", err);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const getStatusBadge = (status: string) => {
		const statusMap = {
			pending: { variant: "secondary" as const, label: "Chờ xử lý" },
			in_progress: { variant: "default" as const, label: "Đang sửa" },
			awaiting_parts: { variant: "warning" as const, label: "Chờ linh kiện" },
			quality_testing: {
				variant: "default" as const,
				label: "Kiểm tra chất lượng",
			},
			completed: { variant: "default" as const, label: "Hoàn thành" },
			cancelled_by_customer: {
				variant: "destructive" as const,
				label: "Khách hủy",
			},
			abandoned: { variant: "destructive" as const, label: "Bỏ dở" },
		};
		return (
			statusMap[status] || { variant: "secondary" as const, label: status }
		);
	};

	const getRiskBadge = (riskLevel: string) => {
		switch (riskLevel) {
			case "low":
				return <Badge variant="default">Thấp</Badge>;
			case "medium":
				return <Badge variant="secondary">Trung bình</Badge>;
			case "high":
				return <Badge variant="destructive">Cao</Badge>;
			default:
				return <Badge variant="secondary">Không xác định</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			{/* Search Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Tìm Kiếm Khách Hàng
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1">
							<Label htmlFor="searchPhone">Số điện thoại</Label>
							<Input
								id="searchPhone"
								value={searchPhone}
								onChange={(e) => setSearchPhone(e.target.value)}
								placeholder="Nhập số điện thoại khách hàng..."
								onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
							/>
						</div>
						<div className="flex items-end">
							<Button
								onClick={handleSearchCustomer}
								disabled={loading || !searchPhone.trim()}
							>
								<Search className="h-4 w-4 mr-2" />
								Tìm Kiếm
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Customer Summary */}
			{customerSummary && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									{customerSummary.customerName}
								</CardTitle>
								<CardDescription>
									Khách hàng từ{" "}
									{new Date(customerSummary.customerSince).toLocaleDateString(
										"vi-VN",
									)}
								</CardDescription>
							</div>
							<div className="flex gap-2">
								<Dialog
									open={exportDialogOpen}
									onOpenChange={setExportDialogOpen}
								>
									<DialogTrigger asChild>
										<Button variant="outline" size="sm">
											<Download className="h-4 w-4 mr-2" />
											Xuất dữ liệu
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Xuất Dữ Liệu Khách Hàng</DialogTitle>
											<DialogDescription>
												Chọn định dạng và nội dung xuất dữ liệu
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4">
											<div className="flex gap-4">
												<Button onClick={() => handleExportData("json", true)}>
													Xuất JSON (đầy đủ)
												</Button>
												<Button onClick={() => handleExportData("csv", false)}>
													Xuất CSV (cơ bản)
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="flex items-center gap-2">
								<Smartphone className="h-4 w-4 text-blue-500" />
								<div>
									<p className="text-sm text-gray-500">Thiết bị</p>
									<p className="font-semibold">
										{customerSummary.totalDevices}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Settings className="h-4 w-4 text-green-500" />
								<div>
									<p className="text-sm text-gray-500">Tổng sửa chữa</p>
									<p className="font-semibold">
										{customerSummary.totalRepairs}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-purple-500" />
								<div>
									<p className="text-sm text-gray-500">Tổng chi tiêu</p>
									<p className="font-semibold">
										{formatCurrency(customerSummary.totalSpent)}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-orange-500" />
								<div>
									<p className="text-sm text-gray-500">Trung bình/SC</p>
									<p className="font-semibold">
										{formatCurrency(customerSummary.averageRepairCost)}
									</p>
								</div>
							</div>
						</div>

						{customerSummary.recurringIssues > 0 && (
							<div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
								<div className="flex items-center gap-2">
									<AlertTriangle className="h-4 w-4 text-yellow-600" />
									<span className="text-sm font-medium text-yellow-800">
										Cảnh báo: Có {customerSummary.recurringIssues} vấn đề lặp
										lại
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{currentCustomer && (
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-6">
						<TabsTrigger value="overview">Tổng Quan</TabsTrigger>
						<TabsTrigger value="repairs">Lịch Sử SC</TabsTrigger>
						<TabsTrigger value="devices">Thiết Bị</TabsTrigger>
						<TabsTrigger value="patterns">Xu Hướng</TabsTrigger>
						<TabsTrigger value="warranty">Bảo Hành</TabsTrigger>
						<TabsTrigger value="financial">Tài Chính</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Recent Repairs */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<History className="h-5 w-5" />
										Sửa Chữa Gần Đây
									</CardTitle>
								</CardHeader>
								<CardContent>
									{repairHistory.slice(0, 5).map((repair) => (
										<div
											key={repair.id}
											className="flex items-start justify-between py-2 border-b last:border-b-0"
										>
											<div className="flex-1">
												<div className="font-medium">
													{repair.device_info.brand} {repair.device_info.model}
												</div>
												<div className="text-sm text-gray-500 truncate max-w-48">
													{repair.issue_description}
												</div>
												<div className="text-xs text-gray-400">
													{new Date(repair.created_at).toLocaleDateString(
														"vi-VN",
													)}
												</div>
											</div>
											<div className="text-right">
												<Badge {...getStatusBadge(repair.status)}>
													{getStatusBadge(repair.status).label}
												</Badge>
												<div className="text-sm font-medium mt-1">
													{formatCurrency(repair.total_cost || 0)}
												</div>
											</div>
										</div>
									))}
									{repairHistory.length === 0 && (
										<div className="text-center text-gray-500 py-4">
											Chưa có lịch sử sửa chữa
										</div>
									)}
								</CardContent>
							</Card>

							{/* Service Patterns */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<BarChart3 className="h-5 w-5" />
										Mô Hình Dịch Vụ
									</CardTitle>
								</CardHeader>
								<CardContent>
									{servicePatterns.slice(0, 5).map((pattern, index) => (
										<div
											key={`pattern-${pattern.id || index}`}
											className="flex items-start justify-between py-2 border-b last:border-b-0"
										>
											<div className="flex-1">
												<div className="font-medium">{pattern.description}</div>
												<div className="text-sm text-gray-500">
													Tần suất: {pattern.frequency} lần
												</div>
												<div className="text-xs text-gray-400">
													Lần cuối:{" "}
													{new Date(pattern.lastOccurrence).toLocaleDateString(
														"vi-VN",
													)}
												</div>
											</div>
											<div className="text-right">
												{getRiskBadge(pattern.riskLevel)}
											</div>
										</div>
									))}
									{servicePatterns.length === 0 && (
										<div className="text-center text-gray-500 py-4">
											Chưa phát hiện mô hình đặc biệt
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Pattern Analysis Summary */}
						{patternAnalysis && patternAnalysis.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Phân Tích Xu Hướng Chi Tiết</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{patternAnalysis.map(
											(
												analysis: {
													type: string;
													frequency: number;
													[key: string]: unknown;
												},
												index: number,
											) => (
												<div
													key={`analysis-${analysis.type}-${index}`}
													className="p-4 border rounded-lg"
												>
													<div className="flex items-start justify-between mb-2">
														<span className="font-medium">
															{analysis.description}
														</span>
														<Badge
															variant={
																analysis.severity === "high"
																	? "destructive"
																	: analysis.severity === "medium"
																		? "secondary"
																		: "default"
															}
														>
															{analysis.severity === "high"
																? "Cao"
																: analysis.severity === "medium"
																	? "Trung bình"
																	: "Thấp"}
														</Badge>
													</div>
													<div className="text-sm text-gray-600 mb-2">
														{analysis.recommendation}
													</div>
													<div className="text-xs text-gray-500">
														Độ tin cậy: {Math.round(analysis.confidence * 100)}%
													</div>
												</div>
											),
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="repairs" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Lịch Sử Sửa Chữa Chi Tiết</CardTitle>
								<CardDescription>
									Tổng cộng {repairHistory.length} lần sửa chữa
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{repairHistory.map((repair) => (
										<div key={repair.id} className="border rounded-lg p-4">
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<span className="font-semibold">
															{repair.device_info.brand}{" "}
															{repair.device_info.model}
														</span>
														<Badge {...getStatusBadge(repair.status)}>
															{getStatusBadge(repair.status).label}
														</Badge>
														{repair.recurring_issue && (
															<Badge variant="warning">Vấn đề lặp lại</Badge>
														)}
													</div>
													<div className="text-sm text-gray-600 mb-2">
														<strong>Vấn đề:</strong> {repair.issue_description}
													</div>
													<div className="text-sm text-gray-500">
														<strong>Ngày tạo:</strong>{" "}
														{new Date(repair.created_at).toLocaleDateString(
															"vi-VN",
														)}
														{repair.repair_completed_at && (
															<>
																{" "}
																• <strong>Hoàn thành:</strong>{" "}
																{new Date(
																	repair.repair_completed_at,
																).toLocaleDateString("vi-VN")}
															</>
														)}
													</div>
													{repair.assigned_technician && (
														<div className="text-sm text-gray-500">
															<strong>Kỹ thuật viên:</strong>{" "}
															{repair.assigned_technician.full_name}
														</div>
													)}
												</div>
												<div className="text-right">
													<div className="font-semibold text-lg">
														{formatCurrency(repair.total_cost || 0)}
													</div>
													{(repair.total_parts_cost ||
														repair.total_labor_cost) && (
														<div className="text-sm text-gray-500">
															LK: {formatCurrency(repair.total_parts_cost || 0)}{" "}
															• NC:{" "}
															{formatCurrency(repair.total_labor_cost || 0)}
														</div>
													)}
													<Button
														variant="outline"
														size="sm"
														className="mt-2"
														onClick={() => setSelectedRepair(repair)}
													>
														<Eye className="h-4 w-4 mr-1" />
														Chi tiết
													</Button>
												</div>
											</div>

											{repair.service_notes &&
												repair.service_notes.length > 0 && (
													<div className="mt-3 pt-3 border-t">
														<h5 className="font-medium mb-2">
															Ghi chú kỹ thuật:
														</h5>
														<div className="space-y-2">
															{repair.service_notes
																.slice(0, 2)
																.map((note, index) => (
																	<div
																		key={`note-${note.id || index}`}
																		className="text-sm p-2 bg-gray-50 rounded"
																	>
																		<div className="font-medium">
																			{note.note_type}
																		</div>
																		<div>{note.note_content}</div>
																		<div className="text-xs text-gray-500 mt-1">
																			{new Date(
																				note.note_timestamp,
																			).toLocaleString("vi-VN")}
																		</div>
																	</div>
																))}
														</div>
													</div>
												)}
										</div>
									))}

									{repairHistory.length === 0 && (
										<div className="text-center text-gray-500 py-8">
											Chưa có lịch sử sửa chữa
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="devices" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{devices.map((device) => (
								<Card key={device.id}>
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											<span>
												{device.brand} {device.model}
											</span>
											{device.warrantyStatus.isUnderWarranty && (
												<Badge variant="default">Còn BH</Badge>
											)}
										</CardTitle>
										<CardDescription>
											{device.device_type} • SN: {device.serial_number || "N/A"}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label>Số lần sửa chữa</Label>
												<div className="font-medium">{device.repairCount}</div>
											</div>
											<div>
												<Label>Tổng chi tiêu</Label>
												<div className="font-medium">
													{formatCurrency(device.totalSpent)}
												</div>
											</div>
											{device.lastRepairDate && (
												<div>
													<Label>Sửa chữa cuối</Label>
													<div className="font-medium">
														{new Date(device.lastRepairDate).toLocaleDateString(
															"vi-VN",
														)}
													</div>
												</div>
											)}
											{device.warrantyStatus.isUnderWarranty && (
												<div>
													<Label>BH còn lại</Label>
													<div className="font-medium">
														{device.warrantyStatus.daysRemaining} ngày
													</div>
												</div>
											)}
										</div>

										{device.commonIssues.length > 0 && (
											<div>
												<Label>Vấn đề thường gặp</Label>
												<div className="space-y-1">
													{device.commonIssues
														.slice(0, 3)
														.map((issue, index) => (
															<div
																key={`issue-${issue.id || issue.type || index}`}
																className="text-sm flex justify-between"
															>
																<span>{issue.category}</span>
																<span className="text-gray-500">
																	{issue.frequency} lần
																</span>
															</div>
														))}
												</div>
											</div>
										)}

										<Button
											variant="outline"
											size="sm"
											onClick={() => setSelectedDevice(device)}
											className="w-full"
										>
											<Eye className="h-4 w-4 mr-2" />
											Xem chi tiết
										</Button>
									</CardContent>
								</Card>
							))}
						</div>

						{devices.length === 0 && (
							<Card>
								<CardContent className="text-center text-gray-500 py-8">
									Chưa có thiết bị nào được đăng ký
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="patterns" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Phân Tích Mô Hình Dịch Vụ</CardTitle>
								<CardDescription>
									Phát hiện xu hướng và đưa ra khuyến nghị
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{servicePatterns.map((pattern, index) => (
										<div
											key={`service-pattern-${pattern.id || pattern.type || index}`}
											className="border rounded-lg p-4"
										>
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<span className="font-semibold">
															{pattern.description}
														</span>
														{getRiskBadge(pattern.riskLevel)}
														<Badge variant="outline">
															{pattern.patternType === "recurring_hardware"
																? "Phần cứng lặp"
																: pattern.patternType === "recurring_software"
																	? "Phần mềm lặp"
																	: pattern.patternType === "seasonal"
																		? "Theo mùa"
																		: "Tăng dần"}
														</Badge>
													</div>
													<div className="text-sm text-gray-600 mb-2">
														<strong>Tần suất:</strong> {pattern.frequency} lần
													</div>
													<div className="text-sm text-gray-500">
														<strong>Lần cuối:</strong>{" "}
														{new Date(
															pattern.lastOccurrence,
														).toLocaleDateString("vi-VN")}
													</div>
												</div>
											</div>

											<div className="p-3 bg-blue-50 rounded-lg">
												<div className="text-sm">
													<strong>Khuyến nghị:</strong> {pattern.recommendation}
												</div>
											</div>

											{pattern.affectedDevices.length > 0 && (
												<div className="mt-3 pt-3 border-t">
													<div className="text-sm">
														<strong>Thiết bị ảnh hưởng:</strong>{" "}
														{pattern.affectedDevices.join(", ")}
													</div>
												</div>
											)}
										</div>
									))}

									{servicePatterns.length === 0 && (
										<div className="text-center text-gray-500 py-8">
											Chưa phát hiện mô hình dịch vụ đặc biệt
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="warranty" className="space-y-4">
						<WarrantyManager deviceId={selectedDevice?.id} />
					</TabsContent>

					<TabsContent value="financial" className="space-y-4">
						<FinancialTracker repairTicketId={selectedRepair?.id} />
					</TabsContent>
				</Tabs>
			)}

			{/* Repair Detail Dialog */}
			{selectedRepair && (
				<Dialog
					open={!!selectedRepair}
					onOpenChange={() => setSelectedRepair(null)}
				>
					<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Chi Tiết Phiếu Sửa Chữa</DialogTitle>
							<DialogDescription>
								{selectedRepair.device_info.brand}{" "}
								{selectedRepair.device_info.model}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Trạng thái</Label>
									<div>
										<Badge {...getStatusBadge(selectedRepair.status)}>
											{getStatusBadge(selectedRepair.status).label}
										</Badge>
									</div>
								</div>
								<div>
									<Label>Tổng chi phí</Label>
									<div className="font-semibold">
										{formatCurrency(selectedRepair.total_cost || 0)}
									</div>
								</div>
								<div>
									<Label>Ngày tạo</Label>
									<div>
										{new Date(selectedRepair.created_at).toLocaleDateString(
											"vi-VN",
										)}
									</div>
								</div>
								<div>
									<Label>Kỹ thuật viên</Label>
									<div>
										{selectedRepair.assigned_technician?.full_name ||
											"Chưa phân công"}
									</div>
								</div>
							</div>

							<div>
								<Label>Mô tả vấn đề</Label>
								<div className="p-3 bg-gray-50 rounded-lg">
									{selectedRepair.issue_description}
								</div>
							</div>

							{selectedRepair.service_notes &&
								selectedRepair.service_notes.length > 0 && (
									<div>
										<Label>Ghi chú kỹ thuật</Label>
										<div className="space-y-3">
											{selectedRepair.service_notes.map((note, index) => (
												<div
													key={`service-note-${note.id || note.note_timestamp || index}`}
													className="p-3 border rounded-lg"
												>
													<div className="flex items-center gap-2 mb-2">
														<Badge variant="outline">{note.note_type}</Badge>
														<span className="text-sm text-gray-500">
															{new Date(note.note_timestamp).toLocaleString(
																"vi-VN",
															)}
														</span>
													</div>
													<div className="text-sm">{note.note_content}</div>
												</div>
											))}
										</div>
									</div>
								)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
