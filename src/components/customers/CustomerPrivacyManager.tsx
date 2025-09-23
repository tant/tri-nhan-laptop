import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	type CustomerDataSummary,
	type DataExportRequest,
	checkDataRetention,
	exportCustomerData,
	generateCustomerDataSummary,
	requestDataDeletion,
	updateCustomerConsent,
	validateCustomerConsent,
} from "@/lib/privacy/customer-privacy";
import {
	AlertTriangle,
	Download,
	Eye,
	FileText,
	Lock,
	Shield,
	Trash2,
	UserCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface CustomerPrivacyManagerProps {
	customerPhone: string;
	customerName: string;
	onConsentUpdate?: (hasValidConsent: boolean) => void;
}

export function CustomerPrivacyManager({
	customerPhone,
	customerName,
	onConsentUpdate,
}: CustomerPrivacyManagerProps) {
	const [consentStatus, setConsentStatus] = useState<{
		hasValidConsent: boolean;
		missingConsents: string[];
		consentDate?: string;
	}>({ hasValidConsent: false, missingConsents: [] });

	const [dataSummary, setDataSummary] = useState<CustomerDataSummary | null>(
		null,
	);
	const [retentionInfo, setRetentionInfo] = useState<{
		shouldRetain: boolean;
		retentionReason?: string;
		canDelete: boolean;
		nextReviewDate?: string;
	}>({ shouldRetain: false, canDelete: true });

	const [loading, setLoading] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [showDataSummary, setShowDataSummary] = useState(false);
	const [showConsentDialog, setShowConsentDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Consent form state
	const [newConsents, setNewConsents] = useState({
		dataProcessing: false,
		marketing: false,
	});

	// Export form state
	const [exportConfig, setExportConfig] = useState<{
		type: DataExportRequest["exportType"];
		format: DataExportRequest["format"];
	}>({
		type: "full",
		format: "json",
	});

	// Delete form state
	const [deleteReason, setDeleteReason] = useState("");

	// Load customer privacy data
	const loadPrivacyData = useCallback(async () => {
		setLoading(true);
		try {
			// Validate consent
			const consent = await validateCustomerConsent(customerPhone);
			setConsentStatus(consent);

			// Load data summary
			const summary = await generateCustomerDataSummary(customerPhone);
			setDataSummary(summary);

			// Check retention
			const retention = await checkDataRetention(customerPhone);
			setRetentionInfo(retention);

			// Update parent component
			onConsentUpdate?.(consent.hasValidConsent);
		} catch (error) {
			console.error("Error loading privacy data:", error);
		} finally {
			setLoading(false);
		}
	}, [customerPhone, onConsentUpdate]);

	useEffect(() => {
		loadPrivacyData();
	}, [loadPrivacyData]);

	// Handle consent update
	const handleConsentUpdate = useCallback(async () => {
		setLoading(true);
		try {
			const result = await updateCustomerConsent(
				customerPhone,
				newConsents,
				"staff", // TODO: Get actual user ID
			);

			if (result.success) {
				await loadPrivacyData();
				setShowConsentDialog(false);
			} else {
				console.error("Failed to update consent:", result.error);
			}
		} catch (error) {
			console.error("Error updating consent:", error);
		} finally {
			setLoading(false);
		}
	}, [customerPhone, newConsents, loadPrivacyData]);

	// Handle data export
	const handleDataExport = useCallback(async () => {
		setExporting(true);
		try {
			const result = await exportCustomerData(
				customerPhone,
				exportConfig.type,
				exportConfig.format,
				"staff", // TODO: Get actual user ID
			);

			if (result.success && result.data) {
				// Create download link
				const blob = new Blob([JSON.stringify(result.data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `customer-data-${customerPhone}-${Date.now()}.${exportConfig.format}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} else {
				console.error("Export failed:", result.error);
			}
		} catch (error) {
			console.error("Error exporting data:", error);
		} finally {
			setExporting(false);
		}
	}, [customerPhone, exportConfig]);

	// Handle data deletion request
	const handleDeleteRequest = useCallback(async () => {
		setLoading(true);
		try {
			const result = await requestDataDeletion(
				customerPhone,
				"staff", // TODO: Get actual user ID
				deleteReason,
			);

			if (result.success) {
				setShowDeleteDialog(false);
				setDeleteReason("");
				await loadPrivacyData();
			} else {
				console.error("Deletion request failed:", result.error);
			}
		} catch (error) {
			console.error("Error requesting deletion:", error);
		} finally {
			setLoading(false);
		}
	}, [customerPhone, deleteReason, loadPrivacyData]);

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Chưa xác định";
		return new Date(dateString).toLocaleString("vi-VN");
	};

	return (
		<div className="space-y-6">
			{/* Privacy Status Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Trạng thái bảo mật dữ liệu
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="text-sm font-medium">
								Trạng thái đồng ý xử lý dữ liệu
							</Label>
							<p className="text-xs text-muted-foreground">
								{consentStatus.hasValidConsent
									? "Khách hàng đã đồng ý xử lý dữ liệu"
									: "Cần cập nhật đồng ý từ khách hàng"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{consentStatus.hasValidConsent ? (
								<UserCheck className="h-5 w-5 text-green-600" />
							) : (
								<AlertTriangle className="h-5 w-5 text-red-600" />
							)}
							<span
								className={`text-sm font-medium ${
									consentStatus.hasValidConsent
										? "text-green-600"
										: "text-red-600"
								}`}
							>
								{consentStatus.hasValidConsent ? "Hợp lệ" : "Cần cập nhật"}
							</span>
						</div>
					</div>

					{!consentStatus.hasValidConsent && (
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								Khách hàng chưa đồng ý đầy đủ về xử lý dữ liệu. Cần thiết:
								<ul className="list-disc list-inside mt-2">
									{consentStatus.missingConsents.map((consent) => (
										<li key={consent}>
											{consent === "data_processing"
												? "Đồng ý xử lý dữ liệu cá nhân"
												: consent === "marketing_preferences"
													? "Tùy chọn nhận thông tin marketing"
													: consent}
										</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					{consentStatus.consentDate && (
						<div className="text-sm text-muted-foreground">
							Đồng ý lần cuối: {formatDate(consentStatus.consentDate)}
						</div>
					)}

					<div className="flex gap-2">
						<Dialog
							open={showConsentDialog}
							onOpenChange={setShowConsentDialog}
						>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm">
									<Lock className="h-4 w-4 mr-2" />
									Cập nhật đồng ý
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Cập nhật đồng ý xử lý dữ liệu
									</DialogTitle>
									<DialogDescription>
										Cập nhật thông tin đồng ý từ khách hàng {customerName}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="data-processing"
											checked={newConsents.dataProcessing}
											onCheckedChange={(checked) =>
												setNewConsents((prev) => ({
													...prev,
													dataProcessing: checked === true,
												}))
											}
										/>
										<Label htmlFor="data-processing" className="text-sm">
											Đồng ý xử lý dữ liệu cá nhân cho mục đích sửa chữa
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="marketing"
											checked={newConsents.marketing}
											onCheckedChange={(checked) =>
												setNewConsents((prev) => ({
													...prev,
													marketing: checked === true,
												}))
											}
										/>
										<Label htmlFor="marketing" className="text-sm">
											Đồng ý nhận thông tin khuyến mãi và marketing
										</Label>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setShowConsentDialog(false)}
									>
										Hủy
									</Button>
									<Button onClick={handleConsentUpdate} disabled={loading}>
										Cập nhật
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowDataSummary(!showDataSummary)}
						>
							<Eye className="h-4 w-4 mr-2" />
							{showDataSummary ? "Ẩn" : "Xem"} tóm tắt dữ liệu
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Data Summary */}
			{showDataSummary && dataSummary && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Tóm tắt dữ liệu khách hàng
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<h4 className="font-medium">Thông tin cá nhân</h4>
								<div className="text-sm space-y-1">
									<p>
										<strong>Điện thoại:</strong> {dataSummary.personalInfo.phone}
									</p>
									<p>
										<strong>Họ tên:</strong> {dataSummary.personalInfo.fullName}
									</p>
									{dataSummary.personalInfo.email && (
										<p>
											<strong>Email:</strong> {dataSummary.personalInfo.email}
										</p>
									)}
									<p>
										<strong>Loại:</strong>{" "}
										{dataSummary.personalInfo.category === "individual"
											? "Cá nhân"
											: "Doanh nghiệp"}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium">Lịch sử sửa chữa</h4>
								<div className="text-sm space-y-1">
									<p>
										<strong>Tổng phiếu:</strong>{" "}
										{dataSummary.repairHistory.totalRepairs}
									</p>
									<p>
										<strong>Đang sửa:</strong>{" "}
										{dataSummary.repairHistory.activeRepairs}
									</p>
									{dataSummary.repairHistory.lastRepair && (
										<p>
											<strong>Lần cuối:</strong>{" "}
											{formatDate(dataSummary.repairHistory.lastRepair)}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium">Lịch sử liên hệ</h4>
								<div className="text-sm space-y-1">
									<p>
										<strong>Tổng liên hệ:</strong>{" "}
										{dataSummary.contactHistory.totalContacts}
									</p>
									{dataSummary.contactHistory.lastContact && (
										<p>
											<strong>Lần cuối:</strong>{" "}
											{formatDate(dataSummary.contactHistory.lastContact)}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium">Sử dụng dữ liệu</h4>
								<div className="text-sm space-y-1">
									<p>
										<strong>Tạo lúc:</strong>{" "}
										{formatDate(dataSummary.dataUsage.createdAt)}
									</p>
									<p>
										<strong>Cập nhật:</strong>{" "}
										{formatDate(dataSummary.dataUsage.lastUpdated)}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Data Management Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						Quản lý dữ liệu
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Data Export */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Xuất dữ liệu khách hàng</Label>
						<div className="flex gap-2">
							<Select
								value={exportConfig.type}
								onValueChange={(value: DataExportRequest["exportType"]) =>
									setExportConfig((prev) => ({ ...prev, type: value }))
								}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="full">Toàn bộ dữ liệu</SelectItem>
									<SelectItem value="personal_only">
										Chỉ thông tin cá nhân
									</SelectItem>
									<SelectItem value="contact_only">
										Chỉ thông tin liên hệ
									</SelectItem>
									<SelectItem value="history_only">Chỉ lịch sử</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={exportConfig.format}
								onValueChange={(value: DataExportRequest["format"]) =>
									setExportConfig((prev) => ({ ...prev, format: value }))
								}
							>
								<SelectTrigger className="w-[120px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="json">JSON</SelectItem>
									<SelectItem value="csv">CSV</SelectItem>
									<SelectItem value="pdf" disabled>
										PDF (Sắp có)
									</SelectItem>
								</SelectContent>
							</Select>

							<Button
								onClick={handleDataExport}
								disabled={exporting || !consentStatus.hasValidConsent}
								size="sm"
							>
								{exporting ? "Đang xuất..." : "Xuất dữ liệu"}
							</Button>
						</div>
						{!consentStatus.hasValidConsent && (
							<p className="text-xs text-muted-foreground">
								Cần đồng ý hợp lệ từ khách hàng để xuất dữ liệu
							</p>
						)}
					</div>

					<Separator />

					{/* Data Retention */}
					<div className="space-y-2">
						<Label className="text-sm font-medium">Lưu trữ dữ liệu</Label>
						<div className="text-sm space-y-1">
							<p>
								<strong>Trạng thái:</strong>{" "}
								{retentionInfo.shouldRetain
									? "Cần lưu trữ"
									: "Có thể xóa theo yêu cầu"}
							</p>
							{retentionInfo.retentionReason && (
								<p>
									<strong>Lý do:</strong> {retentionInfo.retentionReason}
								</p>
							)}
							{retentionInfo.nextReviewDate && (
								<p>
									<strong>Xem xét lại:</strong>{" "}
									{formatDate(retentionInfo.nextReviewDate)}
								</p>
							)}
						</div>
					</div>

					<Separator />

					{/* Data Deletion */}
					<div className="space-y-3">
						<Label className="text-sm font-medium text-red-600">
							Xóa dữ liệu khách hàng
						</Label>
						<p className="text-xs text-muted-foreground">
							Yêu cầu xóa dữ liệu khách hàng theo quyền "được quên" (GDPR)
						</p>

						<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
							<DialogTrigger asChild>
								<Button
									variant="destructive"
									size="sm"
									disabled={!retentionInfo.canDelete}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Yêu cầu xóa dữ liệu
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle className="text-red-600">
										Xác nhận yêu cầu xóa dữ liệu
									</DialogTitle>
									<DialogDescription>
										Hành động này sẽ tạo yêu cầu xóa toàn bộ dữ liệu của khách
										hàng {customerName}. Vui lòng xác nhận thông tin.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="delete-reason">Lý do xóa dữ liệu</Label>
										<Textarea
											id="delete-reason"
											value={deleteReason}
											onChange={(e) => setDeleteReason(e.target.value)}
											placeholder="Nhập lý do yêu cầu xóa dữ liệu..."
											rows={3}
										/>
									</div>
									{!retentionInfo.canDelete && (
										<Alert>
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												Không thể xóa dữ liệu lúc này do:{" "}
												{retentionInfo.retentionReason}
											</AlertDescription>
										</Alert>
									)}
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setShowDeleteDialog(false)}
									>
										Hủy
									</Button>
									<Button
										variant="destructive"
										onClick={handleDeleteRequest}
										disabled={loading || !retentionInfo.canDelete}
									>
										Xác nhận xóa
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						{!retentionInfo.canDelete && (
							<p className="text-xs text-red-600">
								Không thể xóa dữ liệu: {retentionInfo.retentionReason}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}