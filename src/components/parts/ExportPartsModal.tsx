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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import {
	AlertTriangle,
	CheckCircle,
	Download,
	FileText,
	Package,
} from "lucide-react";
import { useState } from "react";

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface ExportPartsModalProps {
	isOpen: boolean;
	onClose: () => void;
	parts: Part[];
}

interface ExportFilters {
	category: string;
	stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
	brand: string;
}

interface ExportFields {
	basic: boolean;
	pricing: boolean;
	inventory: boolean;
	supplier: boolean;
	compatibility: boolean;
	all: boolean;
}

export function ExportPartsModal({
	isOpen,
	onClose,
	parts,
}: ExportPartsModalProps) {
	const [filters, setFilters] = useState<ExportFilters>({
		category: "all",
		stockStatus: "all",
		brand: "all",
	});

	const [fields, setFields] = useState<ExportFields>({
		basic: true,
		pricing: false,
		inventory: true,
		supplier: false,
		compatibility: false,
		all: false,
	});

	const [exporting, setExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);
	const [phase, setPhase] = useState<"setup" | "exporting" | "complete">(
		"setup",
	);

	// Get unique values for filters
	const categories = [
		...new Set(parts.map((part) => part.category).filter(Boolean)),
	];
	const brands = [...new Set(parts.map((part) => part.brand).filter(Boolean))];

	// Filter parts based on selected criteria
	const getFilteredParts = (): Part[] => {
		return parts.filter((part) => {
			// Category filter
			if (filters.category !== "all" && part.category !== filters.category) {
				return false;
			}

			// Brand filter
			if (filters.brand !== "all" && part.brand !== filters.brand) {
				return false;
			}

			// Stock status filter
			if (filters.stockStatus !== "all") {
				const minStock = part.min_stock_level || 5;
				const currentStock = part.current_stock;

				switch (filters.stockStatus) {
					case "out_of_stock":
						if (currentStock !== 0) return false;
						break;
					case "low_stock":
						if (currentStock === 0 || currentStock > minStock) return false;
						break;
					case "in_stock":
						if (currentStock <= minStock) return false;
						break;
				}
			}

			return true;
		});
	};

	const filteredParts = getFilteredParts();

	const updateFields = (field: keyof ExportFields, value: boolean) => {
		if (field === "all") {
			setFields({
				basic: value,
				pricing: value,
				inventory: value,
				supplier: value,
				compatibility: value,
				all: value,
			});
		} else {
			const newFields = { ...fields, [field]: value };
			newFields.all = Object.keys(newFields).every(
				(key) => key === "all" || newFields[key as keyof ExportFields],
			);
			setFields(newFields);
		}
	};

	const getSelectedColumns = (): string[] => {
		const columns: string[] = [];

		if (fields.basic) {
			columns.push("name", "part_number", "category", "brand", "description");
		}

		if (fields.pricing) {
			columns.push("unit_price", "cost_price", "selling_price");
		}

		if (fields.inventory) {
			columns.push("current_stock", "min_stock_level", "location");
		}

		if (fields.supplier) {
			columns.push("supplier_info", "warranty_period", "part_condition");
		}

		if (fields.compatibility) {
			columns.push("model_compatibility");
		}

		return columns;
	};

	const exportToCSV = async () => {
		setExporting(true);
		setPhase("exporting");

		try {
			const columns = getSelectedColumns();
			const csvHeaders = columns.join(",");

			// Progress simulation
			setExportProgress(10);

			const csvRows = filteredParts.map((part, index) => {
				// Update progress
				const progress = 10 + ((index + 1) / filteredParts.length) * 80;
				setExportProgress(progress);

				return columns
					.map((column) => {
						let value = part[column as keyof Part];

						// Special handling for different data types
						if (column === "model_compatibility" && Array.isArray(value)) {
							value = value.join(";");
						} else if (typeof value === "object" && value !== null) {
							value = JSON.stringify(value);
						} else if (value === null || value === undefined) {
							value = "";
						}

						// Escape commas and quotes in CSV
						const stringValue = String(value);
						if (
							stringValue.includes(",") ||
							stringValue.includes('"') ||
							stringValue.includes("\n")
						) {
							return `"${stringValue.replace(/"/g, '""')}"`;
						}

						return stringValue;
					})
					.join(",");
			});

			setExportProgress(90);

			const csvContent = [csvHeaders, ...csvRows].join("\n");

			// Add BOM for Vietnamese characters
			const BOM = "\uFEFF";
			const blob = new Blob([BOM + csvContent], {
				type: "text/csv;charset=utf-8;",
			});

			setExportProgress(95);

			// Generate filename with timestamp
			const timestamp = new Date()
				.toISOString()
				.slice(0, 19)
				.replace(/[:-]/g, "");
			const filename = `linh_kien_${timestamp}.csv`;

			// Download file
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = filename;
			link.click();

			setExportProgress(100);
			setPhase("complete");

			// Auto close after success
			setTimeout(() => {
				onClose();
				resetExport();
			}, 2000);
		} catch (error) {
			console.error("Export error:", error);
			alert("Lỗi khi xuất file. Vui lòng thử lại.");
			setExporting(false);
			setPhase("setup");
		}
	};

	const resetExport = () => {
		setExporting(false);
		setExportProgress(0);
		setPhase("setup");
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						Xuất danh sách linh kiện
					</DialogTitle>
					<DialogDescription>
						Xuất dữ liệu linh kiện ra file CSV
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Setup Phase */}
					{phase === "setup" && (
						<>
							{/* Filters */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Bộ lọc dữ liệu</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label>Danh mục</Label>
											<Select
												value={filters.category}
												onValueChange={(value) =>
													setFilters({ ...filters, category: value })
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">Tất cả danh mục</SelectItem>
													{categories.map((category) => (
														<SelectItem key={category} value={category}>
															{category}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>Thương hiệu</Label>
											<Select
												value={filters.brand}
												onValueChange={(value) =>
													setFilters({ ...filters, brand: value })
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														Tất cả thương hiệu
													</SelectItem>
													{brands.map((brand) => (
														<SelectItem key={brand} value={brand}>
															{brand}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>Tình trạng tồn kho</Label>
											<Select
												value={filters.stockStatus}
												onValueChange={(value: typeof filters.stockStatus) =>
													setFilters({ ...filters, stockStatus: value })
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">Tất cả</SelectItem>
													<SelectItem value="in_stock">Còn hàng</SelectItem>
													<SelectItem value="low_stock">Sắp hết</SelectItem>
													<SelectItem value="out_of_stock">Hết hàng</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
										<div className="flex items-center gap-2">
											<Package className="h-4 w-4 text-blue-600" />
											<span className="text-sm text-blue-700">
												Sẽ xuất {filteredParts.length} linh kiện từ tổng số{" "}
												{parts.length}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Field Selection */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Chọn dữ liệu xuất</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="all"
												checked={fields.all}
												onCheckedChange={(checked) =>
													updateFields("all", !!checked)
												}
											/>
											<Label htmlFor="all" className="font-medium">
												Chọn tất cả
											</Label>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
											<div className="flex items-center space-x-2">
												<Checkbox
													id="basic"
													checked={fields.basic}
													onCheckedChange={(checked) =>
														updateFields("basic", !!checked)
													}
												/>
												<Label htmlFor="basic">Thông tin cơ bản</Label>
											</div>

											<div className="flex items-center space-x-2">
												<Checkbox
													id="pricing"
													checked={fields.pricing}
													onCheckedChange={(checked) =>
														updateFields("pricing", !!checked)
													}
												/>
												<Label htmlFor="pricing">Thông tin giá cả</Label>
											</div>

											<div className="flex items-center space-x-2">
												<Checkbox
													id="inventory"
													checked={fields.inventory}
													onCheckedChange={(checked) =>
														updateFields("inventory", !!checked)
													}
												/>
												<Label htmlFor="inventory">Thông tin tồn kho</Label>
											</div>

											<div className="flex items-center space-x-2">
												<Checkbox
													id="supplier"
													checked={fields.supplier}
													onCheckedChange={(checked) =>
														updateFields("supplier", !!checked)
													}
												/>
												<Label htmlFor="supplier">Thông tin nhà cung cấp</Label>
											</div>

											<div className="flex items-center space-x-2">
												<Checkbox
													id="compatibility"
													checked={fields.compatibility}
													onCheckedChange={(checked) =>
														updateFields("compatibility", !!checked)
													}
												/>
												<Label htmlFor="compatibility">Tương thích model</Label>
											</div>
										</div>
									</div>

									<div className="text-sm text-muted-foreground">
										<p>
											<strong>Thông tin cơ bản:</strong> Tên, mã, danh mục,
											thương hiệu, mô tả
										</p>
										<p>
											<strong>Thông tin giá cả:</strong> Giá nhập, giá sỉ, giá
											bán lẻ
										</p>
										<p>
											<strong>Thông tin tồn kho:</strong> Tồn kho hiện tại, mức
											tối thiểu, vị trí
										</p>
										<p>
											<strong>Thông tin nhà cung cấp:</strong> Nhà cung cấp, bảo
											hành, tình trạng
										</p>
										<p>
											<strong>Tương thích model:</strong> Danh sách laptop tương
											thích
										</p>
									</div>
								</CardContent>
							</Card>
						</>
					)}

					{/* Exporting Phase */}
					{phase === "exporting" && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Đang xuất dữ liệu...</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Tiến độ xuất file</span>
										<span>{Math.round(exportProgress)}%</span>
									</div>
									<Progress value={exportProgress} />
								</div>

								<div className="text-center">
									<FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
									<p className="text-sm text-muted-foreground">
										Đang xử lý {filteredParts.length} linh kiện...
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Complete Phase */}
					{phase === "complete" && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Xuất file thành công!</CardTitle>
							</CardHeader>
							<CardContent className="text-center space-y-4">
								<CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
								<div>
									<p className="text-lg font-medium">File đã được tải xuống</p>
									<p className="text-sm text-muted-foreground">
										Đã xuất {filteredParts.length} linh kiện ra file CSV
									</p>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				<DialogFooter>
					{phase === "setup" && (
						<>
							<Button variant="outline" onClick={onClose}>
								Hủy
							</Button>
							<Button
								onClick={exportToCSV}
								disabled={
									getSelectedColumns().length === 0 ||
									filteredParts.length === 0
								}
							>
								<Download className="h-4 w-4 mr-2" />
								Xuất CSV ({filteredParts.length} linh kiện)
							</Button>
						</>
					)}

					{phase === "exporting" && (
						<Button variant="outline" disabled>
							Đang xuất...
						</Button>
					)}

					{phase === "complete" && (
						<Button
							onClick={() => {
								onClose();
								resetExport();
							}}
						>
							Hoàn thành
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
