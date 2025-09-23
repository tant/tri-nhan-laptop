/**
 * Warranty Management Component
 * Comprehensive warranty tracking and claim management for Vietnamese laptop repair shop
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
	type WarrantyClaimInfo,
	type WarrantyExpirationAlert,
	type WarrantyStatus,
	calculateWarrantyCoverage,
	checkDeviceWarrantyStatus,
	createWarrantyClaim,
	getWarrantyAnalytics,
	getWarrantyExpirationAlerts,
} from "@/lib/warranty/warranty-manager";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface WarrantyManagerProps {
	deviceId?: string;
	repairTicketId?: string;
}

export function WarrantyManager({
	deviceId,
	repairTicketId,
}: WarrantyManagerProps) {
	const [activeTab, setActiveTab] = useState("status");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Warranty status state
	const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus | null>(
		null,
	);
	const [expirationAlerts, setExpirationAlerts] = useState<
		WarrantyExpirationAlert[]
	>([]);

	// Claim creation state
	const [claimData, setClaimData] = useState({
		warrantyType: "",
		claimAmount: 0,
		coveragePercentage: 100,
		claimNotes: "",
	});

	// Cost coverage state
	const [repairCosts, setRepairCosts] = useState([
		{ category: "parts", amount: 0, description: "Linh kiện" },
		{ category: "labor", amount: 0, description: "Chi phí nhân công" },
	]);
	const [coverageCalculation, setCoverageCalculation] = useState<any>(null);

	// Analytics state
	const [analyticsData, setAnalyticsData] = useState<any>(null);

	useEffect(() => {
		if (deviceId) {
			loadWarrantyStatus();
		}
		loadExpirationAlerts();
		loadAnalytics();
	}, [deviceId]);

	const loadWarrantyStatus = async () => {
		if (!deviceId) return;

		try {
			setLoading(true);
			setError(null);

			const status = await checkDeviceWarrantyStatus(deviceId);
			setWarrantyStatus(status);

			if (status) {
				setClaimData((prev) => ({
					...prev,
					warrantyType: status.warrantyType,
				}));
			}
		} catch (err) {
			setError("Không thể tải thông tin bảo hành");
			console.error("Error loading warranty status:", err);
		} finally {
			setLoading(false);
		}
	};

	const loadExpirationAlerts = async () => {
		try {
			const alerts = await getWarrantyExpirationAlerts(30);
			setExpirationAlerts(alerts);
		} catch (err) {
			console.error("Error loading expiration alerts:", err);
		}
	};

	const loadAnalytics = async () => {
		try {
			const endDate = new Date().toISOString().split("T")[0];
			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 3);
			const startDateStr = startDate.toISOString().split("T")[0];

			const analytics = await getWarrantyAnalytics(startDateStr, endDate);
			setAnalyticsData(analytics);
		} catch (err) {
			console.error("Error loading analytics:", err);
		}
	};

	const handleCreateClaim = async () => {
		if (!repairTicketId || !deviceId) {
			setError("Thiếu thông tin phiếu sửa chữa hoặc thiết bị");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const result = await createWarrantyClaim(repairTicketId, deviceId, {
				warrantyType: claimData.warrantyType,
				claimAmount: claimData.claimAmount,
				coveragePercentage: claimData.coveragePercentage,
				claimNotes: claimData.claimNotes,
			});

			if (result.success) {
				alert("Tạo yêu cầu bảo hành thành công!");
				loadWarrantyStatus();
			} else {
				setError(result.error || "Không thể tạo yêu cầu bảo hành");
			}
		} catch (err) {
			setError("Lỗi khi tạo yêu cầu bảo hành");
			console.error("Error creating warranty claim:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleCalculateCoverage = async () => {
		if (!deviceId) return;

		try {
			setLoading(true);
			const validCosts = repairCosts.filter((cost) => cost.amount > 0);
			const calculation = await calculateWarrantyCoverage(deviceId, validCosts);
			setCoverageCalculation(calculation);
		} catch (err) {
			console.error("Error calculating coverage:", err);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadgeColor = (status: WarrantyStatus) => {
		if (!status.isUnderWarranty) return "destructive";
		if (status.daysRemaining <= 30) return "warning";
		return "default";
	};

	const getAlertBadgeColor = (level: string) => {
		switch (level) {
			case "urgent":
				return "destructive";
			case "warning":
				return "warning";
			default:
				return "secondary";
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="status">Trạng Thái</TabsTrigger>
					<TabsTrigger value="claims">Yêu Cầu BH</TabsTrigger>
					<TabsTrigger value="alerts">Cảnh Báo</TabsTrigger>
					<TabsTrigger value="analytics">Thống Kê</TabsTrigger>
				</TabsList>

				<TabsContent value="status" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle className="h-5 w-5" />
								Trạng Thái Bảo Hành
							</CardTitle>
							<CardDescription>
								Thông tin bảo hành thiết bị hiện tại
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{loading ? (
								<div>Đang tải...</div>
							) : warrantyStatus ? (
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Trạng thái</Label>
										<Badge variant={getStatusBadgeColor(warrantyStatus)}>
											{warrantyStatus.isUnderWarranty
												? "Còn bảo hành"
												: "Hết bảo hành"}
										</Badge>
									</div>
									<div>
										<Label>Loại bảo hành</Label>
										<div>{warrantyStatus.warrantyProvider}</div>
									</div>
									<div>
										<Label>Ngày hết hạn</Label>
										<div className="flex items-center gap-1">
											<Calendar className="h-4 w-4" />
											{new Date(
												warrantyStatus.warrantyEndDate,
											).toLocaleDateString("vi-VN")}
										</div>
									</div>
									<div>
										<Label>Số ngày còn lại</Label>
										<div className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											{warrantyStatus.daysRemaining} ngày
										</div>
									</div>
									<div className="col-span-2">
										<Label>Mức độ bảo hành</Label>
										<Badge
											variant={
												warrantyStatus.coverageLevel === "full"
													? "default"
													: "secondary"
											}
										>
											{warrantyStatus.coverageLevel === "full"
												? "Toàn bộ"
												: warrantyStatus.coverageLevel === "partial"
													? "Một phần"
													: "Hết hạn"}
										</Badge>
									</div>
								</div>
							) : (
								<div>Không có thông tin bảo hành</div>
							)}

							<div className="border-t pt-4">
								<h4 className="font-semibold mb-2">
									Tính Toán Chi Phí Bảo Hành
								</h4>
								<div className="grid grid-cols-2 gap-4">
									{repairCosts.map((cost, index) => (
										<div key={index}>
											<Label>{cost.description}</Label>
											<Input
												type="number"
												value={cost.amount}
												onChange={(e) => {
													const newCosts = [...repairCosts];
													newCosts[index].amount = Number(e.target.value);
													setRepairCosts(newCosts);
												}}
												placeholder="Nhập số tiền"
											/>
										</div>
									))}
								</div>
								<Button
									onClick={handleCalculateCoverage}
									disabled={loading}
									className="mt-2"
								>
									Tính Toán Bảo Hành
								</Button>

								{coverageCalculation && (
									<div className="mt-4 p-4 bg-gray-50 rounded-lg">
										<h5 className="font-semibold mb-2">Kết Quả Tính Toán</h5>
										<div className="grid grid-cols-3 gap-4 text-sm">
											<div>
												<Label>Tổng chi phí</Label>
												<div className="font-medium">
													{formatCurrency(coverageCalculation.totalCost)}
												</div>
											</div>
											<div>
												<Label>Bảo hành chi trả</Label>
												<div className="font-medium text-green-600">
													{formatCurrency(coverageCalculation.coveredAmount)}
												</div>
											</div>
											<div>
												<Label>Khách hàng trả</Label>
												<div className="font-medium text-blue-600">
													{formatCurrency(coverageCalculation.customerAmount)}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="claims" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5" />
								Tạo Yêu Cầu Bảo Hành
							</CardTitle>
							<CardDescription>
								Tạo yêu cầu bảo hành cho phiếu sửa chữa
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="warrantyType">Loại bảo hành</Label>
									<Select
										value={claimData.warrantyType}
										onValueChange={(value) =>
											setClaimData((prev) => ({ ...prev, warrantyType: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn loại bảo hành" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="manufacturer">
												Bảo hành nhà sản xuất
											</SelectItem>
											<SelectItem value="extended">Bảo hành mở rộng</SelectItem>
											<SelectItem value="shop_warranty">
												Bảo hành cửa hàng
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="claimAmount">Số tiền yêu cầu</Label>
									<Input
										id="claimAmount"
										type="number"
										value={claimData.claimAmount}
										onChange={(e) =>
											setClaimData((prev) => ({
												...prev,
												claimAmount: Number(e.target.value),
											}))
										}
										placeholder="Nhập số tiền"
									/>
								</div>
								<div>
									<Label htmlFor="coveragePercentage">
										Phần trăm bảo hành (%)
									</Label>
									<Input
										id="coveragePercentage"
										type="number"
										min="0"
										max="100"
										value={claimData.coveragePercentage}
										onChange={(e) =>
											setClaimData((prev) => ({
												...prev,
												coveragePercentage: Number(e.target.value),
											}))
										}
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="claimNotes">Ghi chú</Label>
									<Textarea
										id="claimNotes"
										value={claimData.claimNotes}
										onChange={(e) =>
											setClaimData((prev) => ({
												...prev,
												claimNotes: e.target.value,
											}))
										}
										placeholder="Mô tả chi tiết về yêu cầu bảo hành..."
									/>
								</div>
							</div>

							<Button
								onClick={handleCreateClaim}
								disabled={
									loading || !claimData.warrantyType || !claimData.claimAmount
								}
								className="w-full"
							>
								Tạo Yêu Cầu Bảo Hành
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="alerts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5" />
								Cảnh Báo Hết Hạn Bảo Hành
							</CardTitle>
							<CardDescription>
								Thiết bị sắp hết hoặc đã hết hạn bảo hành
							</CardDescription>
						</CardHeader>
						<CardContent>
							{expirationAlerts.length === 0 ? (
								<div className="text-center text-gray-500 py-4">
									Không có cảnh báo nào
								</div>
							) : (
								<div className="space-y-4">
									{expirationAlerts.map((alert, index) => (
										<div key={index} className="border rounded-lg p-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<Badge
															variant={getAlertBadgeColor(alert.alertLevel)}
														>
															{alert.alertLevel === "urgent"
																? "Khẩn cấp"
																: alert.alertLevel === "warning"
																	? "Cảnh báo"
																	: "Thông tin"}
														</Badge>
														<span className="font-medium">
															{alert.customerName}
														</span>
														<span className="text-sm text-gray-500">
															({alert.customerPhone})
														</span>
													</div>
													<div className="text-sm space-y-1">
														<div>
															<strong>Thiết bị:</strong> {alert.deviceInfo}
														</div>
														<div>
															<strong>Loại BH:</strong> {alert.warrantyType}
														</div>
														<div>
															<strong>Hết hạn:</strong>{" "}
															{new Date(
																alert.expirationDate,
															).toLocaleDateString("vi-VN")}
														</div>
														<div>
															<strong>Còn lại:</strong>{" "}
															{alert.daysUntilExpiration} ngày
														</div>
													</div>
												</div>
											</div>
											<div className="mt-2 p-2 bg-blue-50 rounded text-sm">
												<strong>Khuyến nghị:</strong> {alert.recommendedAction}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Tổng yêu cầu BH
										</p>
										<p className="text-2xl font-bold">
											{analyticsData?.totalClaims || 0}
										</p>
									</div>
									<CheckCircle className="h-8 w-8 text-green-500" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Được duyệt
										</p>
										<p className="text-2xl font-bold">
											{analyticsData?.approvedClaims || 0}
										</p>
									</div>
									<XCircle className="h-8 w-8 text-blue-500" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">
											Tiết kiệm
										</p>
										<p className="text-lg font-bold">
											{formatCurrency(analyticsData?.totalSavings || 0)}
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
											TB/Yêu cầu
										</p>
										<p className="text-lg font-bold">
											{formatCurrency(analyticsData?.avgClaimAmount || 0)}
										</p>
									</div>
									<Calendar className="h-8 w-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>
					</div>

					{analyticsData?.topWarrantyTypes &&
						analyticsData.topWarrantyTypes.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Top Loại Bảo Hành</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{analyticsData.topWarrantyTypes.map(
											(type: any, index: number) => (
												<div
													key={index}
													className="flex items-center justify-between p-2 border rounded"
												>
													<span className="font-medium">{type.type}</span>
													<div className="flex items-center gap-4 text-sm">
														<span>{type.count} yêu cầu</span>
														<span className="text-green-600">
															{formatCurrency(type.savings)}
														</span>
													</div>
												</div>
											),
										)}
									</div>
								</CardContent>
							</Card>
						)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
