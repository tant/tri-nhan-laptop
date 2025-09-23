import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type { Database } from "@/lib/supabase";

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface BulkImportModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface ImportRow {
	row: number;
	data: Partial<Part>;
	status: "pending" | "success" | "error";
	error?: string;
}

interface ImportStats {
	total: number;
	success: number;
	errors: number;
	processed: number;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [importData, setImportData] = useState<ImportRow[]>([]);
	const [importing, setImporting] = useState(false);
	const [stats, setStats] = useState<ImportStats>({
		total: 0,
		success: 0,
		errors: 0,
		processed: 0
	});
	const [phase, setPhase] = useState<"upload" | "preview" | "importing" | "complete">("upload");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { user } = useAuth();

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (!selectedFile) return;

		setFile(selectedFile);

		if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
			await parseCSVFile(selectedFile);
		} else {
			alert("Chỉ hỗ trợ file CSV. Vui lòng chọn file .csv");
		}
	};

	const parseCSVFile = async (file: File) => {
		try {
			const text = await file.text();
			const lines = text.split("\n").filter(line => line.trim());
			const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));

			// Expected CSV format headers
			const expectedHeaders = [
				"name", "part_number", "category", "brand", "description",
				"unit_price", "cost_price", "selling_price", "current_stock",
				"min_stock_level", "supplier_info", "location", "model_compatibility",
				"warranty_period", "part_condition"
			];

			// Validate headers
			const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
			if (missingHeaders.length > 0) {
				alert(`Thiếu các cột: ${missingHeaders.join(", ")}`);
				return;
			}

			const parsedData: ImportRow[] = [];

			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
				const rowData: any = {};

				headers.forEach((header, index) => {
					let value = values[index] || "";

					// Type conversion based on header
					switch (header) {
						case "unit_price":
						case "cost_price":
						case "selling_price":
						case "current_stock":
						case "min_stock_level":
						case "warranty_period":
							rowData[header] = value ? Number(value) : 0;
							break;
						case "model_compatibility":
							rowData[header] = value ? value.split(";").map(s => s.trim()) : [];
							break;
						default:
							rowData[header] = value;
					}
				});

				// Add metadata
				rowData.created_at = new Date().toISOString();
				rowData.updated_at = new Date().toISOString();

				parsedData.push({
					row: i + 1,
					data: rowData,
					status: "pending"
				});
			}

			setImportData(parsedData);
			setStats({
				total: parsedData.length,
				success: 0,
				errors: 0,
				processed: 0
			});
			setPhase("preview");

		} catch (error) {
			console.error("Error parsing CSV:", error);
			alert("Lỗi khi đọc file CSV. Vui lòng kiểm tra định dạng file.");
		}
	};

	const validateRow = (data: any): string | null => {
		if (!data.name?.trim()) return "Thiếu tên linh kiện";
		if (!data.part_number?.trim()) return "Thiếu mã linh kiện";
		if (!data.category?.trim()) return "Thiếu danh mục";
		if (data.unit_price <= 0) return "Giá bán phải lớn hơn 0";
		if (data.selling_price <= 0) return "Giá bán lẻ phải lớn hơn 0";
		if (data.current_stock < 0) return "Tồn kho không được âm";
		if (data.min_stock_level < 0) return "Mức tồn kho tối thiểu không được âm";
		return null;
	};

	const startImport = async () => {
		if (!user) return;

		setImporting(true);
		setPhase("importing");

		const updatedData = [...importData];
		let successCount = 0;
		let errorCount = 0;

		for (let i = 0; i < updatedData.length; i++) {
			const row = updatedData[i];

			// Validate row
			const validationError = validateRow(row.data);
			if (validationError) {
				row.status = "error";
				row.error = validationError;
				errorCount++;
			} else {
				try {
					// Insert into database
					const { error } = await supabase
						.from("parts")
						.insert([row.data]);

					if (error) {
						row.status = "error";
						row.error = error.message;
						errorCount++;
					} else {
						row.status = "success";
						successCount++;
					}
				} catch (error) {
					row.status = "error";
					row.error = "Lỗi khi lưu vào cơ sở dữ liệu";
					errorCount++;
				}
			}

			// Update progress
			setStats(prev => ({
				...prev,
				success: successCount,
				errors: errorCount,
				processed: i + 1
			}));

			setImportData([...updatedData]);

			// Small delay to show progress
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		setImporting(false);
		setPhase("complete");

		// If any imports were successful, refresh the parent component
		if (successCount > 0) {
			onSuccess();
		}
	};

	const downloadTemplate = () => {
		const headers = [
			"name", "part_number", "category", "brand", "description",
			"unit_price", "cost_price", "selling_price", "current_stock",
			"min_stock_level", "supplier_info", "location", "model_compatibility",
			"warranty_period", "part_condition"
		];

		const sampleData = [
			"RAM DDR4 8GB", "RAM-DDR4-8GB-001", "Memory", "Samsung", "Bộ nhớ DDR4 8GB 3200MHz",
			"1500000", "1200000", "1800000", "10", "5", "Công ty ABC - 0123456789",
			"Kệ A-1-3", "Dell Inspiron 15;HP Pavilion 14", "24", "new"
		];

		const csvContent = [headers.join(","), sampleData.join(",")].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "mau_nhap_linh_kien.csv";
		link.click();
	};

	const resetImport = () => {
		setFile(null);
		setImportData([]);
		setStats({ total: 0, success: 0, errors: 0, processed: 0 });
		setPhase("upload");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Nhập linh kiện hàng loạt
					</DialogTitle>
					<DialogDescription>
						Tải lên file CSV để nhập nhiều linh kiện cùng lúc
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Upload Phase */}
					{phase === "upload" && (
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Tải lên file CSV</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="file">Chọn file CSV</Label>
										<Input
											id="file"
											type="file"
											accept=".csv"
											ref={fileInputRef}
											onChange={handleFileSelect}
										/>
									</div>

									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">
											Chỉ chấp nhận file .csv với encoding UTF-8
										</span>
									</div>

									<Separator />

									<div className="space-y-2">
										<Label>Tải xuống mẫu CSV</Label>
										<Button variant="outline" onClick={downloadTemplate}>
											<Download className="h-4 w-4 mr-2" />
											Tải mẫu CSV
										</Button>
										<p className="text-sm text-muted-foreground">
											Tải xuống file mẫu để xem định dạng yêu cầu
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Preview Phase */}
					{phase === "preview" && (
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Xem trước dữ liệu</CardTitle>
									<p className="text-sm text-muted-foreground">
										Tìm thấy {importData.length} dòng dữ liệu trong file
									</p>
								</CardHeader>
								<CardContent>
									<div className="max-h-60 overflow-y-auto">
										<div className="space-y-2">
											{importData.slice(0, 5).map((row) => (
												<div key={row.row} className="p-3 border rounded-lg">
													<div className="grid grid-cols-2 gap-2 text-sm">
														<div>
															<span className="font-medium">Tên:</span> {row.data.name}
														</div>
														<div>
															<span className="font-medium">Mã:</span> {row.data.part_number}
														</div>
														<div>
															<span className="font-medium">Danh mục:</span> {row.data.category}
														</div>
														<div>
															<span className="font-medium">Giá:</span> {formatPrice(row.data.unit_price || 0)}
														</div>
													</div>
												</div>
											))}
											{importData.length > 5 && (
												<p className="text-sm text-muted-foreground text-center">
													... và {importData.length - 5} dòng nữa
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Importing Phase */}
					{phase === "importing" && (
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Đang nhập dữ liệu...</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span>Tiến độ: {stats.processed}/{stats.total}</span>
											<span>{Math.round((stats.processed / stats.total) * 100)}%</span>
										</div>
										<Progress value={(stats.processed / stats.total) * 100} />
									</div>

									<div className="grid grid-cols-3 gap-4 text-center">
										<div>
											<div className="text-2xl font-bold text-green-600">{stats.success}</div>
											<div className="text-sm text-muted-foreground">Thành công</div>
										</div>
										<div>
											<div className="text-2xl font-bold text-red-600">{stats.errors}</div>
											<div className="text-sm text-muted-foreground">Lỗi</div>
										</div>
										<div>
											<div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
											<div className="text-sm text-muted-foreground">Đã xử lý</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Complete Phase */}
					{phase === "complete" && (
						<div className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Kết quả nhập liệu</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-3 gap-4 text-center">
										<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
											<CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
											<div className="text-2xl font-bold text-green-600">{stats.success}</div>
											<div className="text-sm text-green-700">Thành công</div>
										</div>
										<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
											<XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
											<div className="text-2xl font-bold text-red-600">{stats.errors}</div>
											<div className="text-sm text-red-700">Lỗi</div>
										</div>
										<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
											<FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
											<div className="text-2xl font-bold text-blue-600">{stats.total}</div>
											<div className="text-sm text-blue-700">Tổng cộng</div>
										</div>
									</div>

									{/* Error details */}
									{stats.errors > 0 && (
										<div className="space-y-2">
											<Label className="text-red-700">Chi tiết lỗi:</Label>
											<div className="max-h-40 overflow-y-auto space-y-1">
												{importData.filter(row => row.status === "error").map((row) => (
													<div key={row.row} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
														<span className="font-medium">Dòng {row.row}:</span> {row.error}
													</div>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					)}
				</div>

				<DialogFooter>
					{phase === "upload" && (
						<Button variant="outline" onClick={onClose}>
							Đóng
						</Button>
					)}

					{phase === "preview" && (
						<>
							<Button variant="outline" onClick={resetImport}>
								Chọn lại file
							</Button>
							<Button onClick={startImport}>
								Bắt đầu nhập ({importData.length} dòng)
							</Button>
						</>
					)}

					{phase === "importing" && (
						<Button variant="outline" disabled>
							Đang xử lý...
						</Button>
					)}

					{phase === "complete" && (
						<>
							<Button variant="outline" onClick={resetImport}>
								Nhập file khác
							</Button>
							<Button onClick={onClose}>
								Hoàn thành
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}