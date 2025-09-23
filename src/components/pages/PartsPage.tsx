import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Edit, Package, AlertTriangle, RefreshCw, Bell, TrendingUp, DollarSign, Settings, Upload, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { SupabaseErrorAlert } from "@/components/error-boundary";
import { PartsInventorySkeleton } from "@/components/skeleton-loaders";
import { usePartsManagement } from "@/hooks/use-parts-management";
import { PartsSearch } from "@/components/parts/PartsSearch";
import { StockAdjustmentModal } from "@/components/parts/StockAdjustmentModal";
import { StockStatusBadge } from "@/components/parts/StockStatusBadge";
import { PartsFormModal } from "@/components/parts/PartsFormModal";
import { BulkImportModal } from "@/components/parts/BulkImportModal";
import { ExportPartsModal } from "@/components/parts/ExportPartsModal";

// Database types
type Part = Database["public"]["Tables"]["parts"]["Row"];

export function PartsPage() {
	const [parts, setParts] = useState<Part[]>([]);
	const [filteredParts, setFilteredParts] = useState<Part[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Modal states
	const [selectedPart, setSelectedPart] = useState<Part | null>(null);
	const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
	const [isPartsFormOpen, setIsPartsFormOpen] = useState(false);
	const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [editingPart, setEditingPart] = useState<Part | null>(null);

	// Legacy search state (to be removed once old search UI is cleaned up)
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [stockFilter, setStockFilter] = useState("all");

	const {
		lowStockParts,
		totalInventoryValue,
		getPartsWithStockStatus,
		getLowStockParts,
		calculateInventoryValue
	} = usePartsManagement();

	// Fetch parts from database with enhanced stock status
	const fetchParts = async () => {
		try {
			setLoading(true);
			setError(null);

			const partsWithStock = await getPartsWithStockStatus();
			setParts(partsWithStock);
			setFilteredParts(partsWithStock); // Initialize filtered parts

			// Also refresh low stock data and inventory value
			await Promise.all([
				getLowStockParts(),
				calculateInventoryValue()
			]);

		} catch (err) {
			console.error("Error fetching parts:", err);
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	};

	// Load parts on component mount
	useEffect(() => {
		fetchParts();
	}, []);

	// Real-time subscription to parts changes
	useEffect(() => {
		const channel = supabase
			.channel("parts-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "parts",
				},
				(payload) => {
					console.log("Part change detected:", payload);
					// Refetch data when changes occur
					fetchParts();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	// Handle stock adjustment
	const openStockAdjustment = (part: Part) => {
		setSelectedPart(part);
		setIsStockAdjustmentOpen(true);
	};

	const closeStockAdjustment = () => {
		setSelectedPart(null);
		setIsStockAdjustmentOpen(false);
	};

	const handleStockAdjustmentSuccess = () => {
		// Refresh parts data after successful adjustment
		fetchParts();
	};

	// Handle parts form
	const openPartsForm = (part?: Part) => {
		setEditingPart(part || null);
		setIsPartsFormOpen(true);
	};

	const closePartsForm = () => {
		setEditingPart(null);
		setIsPartsFormOpen(false);
	};

	const handlePartsFormSuccess = () => {
		fetchParts();
	};

	// Handle search results from the enhanced search component
	const handleSearchResults = (searchResults: Part[]) => {
		setFilteredParts(searchResults);
	};

	// Format currency (Vietnamese dong)
	const formatPrice = (price: number | null) => {
		if (!price) return "Chưa định giá";
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price);
	};

	// Get urgent restock parts (out of stock)
	const outOfStockParts = parts.filter(part => part.current_stock === 0);

	// Get critical stock parts (very low)
	const criticalStockParts = parts.filter(part =>
		part.current_stock > 0 && part.current_stock <= 50
	);

	// Get unique categories for filter dropdown
	const categories = [...new Set(parts.map(part => part.category).filter(Boolean))];

	// Table columns definition
	const columns: ColumnDef<Part>[] = [
		{
			accessorKey: "part_number",
			header: "Mã linh kiện",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("part_number")}</div>
			),
		},
		{
			accessorKey: "name",
			header: "Tên linh kiện",
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.getValue("name")}</div>
					<div className="text-sm text-muted-foreground">
						{row.original.brand || "Không có thương hiệu"}
					</div>
				</div>
			),
		},
		{
			accessorKey: "category",
			header: "Danh mục",
		},
		{
			accessorKey: "unit_price",
			header: "Giá",
			cell: ({ row }) => (
				<div className="text-right">
					{formatPrice(row.getValue("unit_price"))}
				</div>
			),
		},
		{
			accessorKey: "current_stock",
			header: "Tồn kho",
			cell: ({ row }) => (
				<div className="text-center">
					<span className="font-medium">{row.getValue("current_stock")}</span>
					<div className="text-xs text-muted-foreground">
						Tối thiểu: {row.original.min_stock_level || 5}
					</div>
				</div>
			),
		},
		{
			id: "status",
			header: "Trạng thái",
			cell: ({ row }) => <StockStatusBadge part={row.original} />,
		},
		{
			id: "actions",
			header: "Thao tác",
			cell: ({ row }) => (
				<div className="flex space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => openStockAdjustment(row.original)}
						title="Điều chỉnh tồn kho"
					>
						<Settings className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => openPartsForm(row.original)}
						title="Chỉnh sửa linh kiện"
					>
						<Edit className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	// Loading state
	if (loading) {
		return <PartsInventorySkeleton />;
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Quản lý linh kiện</h1>
					<p className="text-muted-foreground">Theo dõi kho linh kiện và phụ kiện laptop</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchParts}
						disabled={loading}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Làm mới
					</Button>
					<Button
						variant="outline"
						onClick={() => setIsExportOpen(true)}
					>
						<Download className="h-4 w-4 mr-2" />
						Xuất CSV
					</Button>
					<Button
						variant="outline"
						onClick={() => setIsBulkImportOpen(true)}
					>
						<Upload className="h-4 w-4 mr-2" />
						Nhập CSV
					</Button>
					<Button onClick={() => openPartsForm()}>
						<Plus className="mr-2 h-4 w-4" />
						Thêm linh kiện
					</Button>
				</div>
			</div>

			{error && (
				<SupabaseErrorAlert
					error={error}
					onRetry={fetchParts}
					onDismiss={() => setError(null)}
				/>
			)}

			{/* Enhanced Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng linh kiện</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{parts.length}</div>
						<p className="text-xs text-muted-foreground">
							{categories.length} danh mục
						</p>
					</CardContent>
				</Card>
				<Card className="border-red-200 bg-red-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-red-800">Hết hàng</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-800">{outOfStockParts.length}</div>
						<p className="text-xs text-red-600">Cần nhập ngay</p>
					</CardContent>
				</Card>
				<Card className="border-orange-200 bg-orange-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-orange-800">Sắp hết</CardTitle>
						<Bell className="h-4 w-4 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-800">{criticalStockParts.length}</div>
						<p className="text-xs text-orange-600">Cần theo dõi</p>
					</CardContent>
				</Card>
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-blue-800">Cảnh báo tồn kho</CardTitle>
						<TrendingUp className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-800">{lowStockParts.length}</div>
						<p className="text-xs text-blue-600">Tổng cảnh báo</p>
					</CardContent>
				</Card>
				<Card className="border-green-200 bg-green-50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-green-800">Giá trị kho</CardTitle>
						<DollarSign className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-800">
							{formatPrice(totalInventoryValue)}
						</div>
						<p className="text-xs text-green-600">Tổng tài sản</p>
					</CardContent>
				</Card>
			</div>

			{/* Low Stock Alert */}
			{lowStockParts.length > 0 && (
				<Card className="border-orange-200 bg-orange-50">
					<CardHeader>
						<CardTitle className="flex items-center text-orange-800">
							<AlertTriangle className="mr-2 h-5 w-5" />
							Cảnh báo tồn kho
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-orange-700 mb-2">
							Có {lowStockParts.length} linh kiện sắp hết hoặc đã hết hàng:
						</p>
						<div className="flex flex-wrap gap-2">
							{lowStockParts.map(part => (
								<Badge key={part.id} variant="outline" className="text-orange-700 border-orange-300">
									{part.name} ({part.current_stock}/100)
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Enhanced Search and Filter */}
			<PartsSearch
				parts={parts}
				onSearchResults={handleSearchResults}
				loading={loading}
			/>

			{/* Enhanced Search and Filter */}
			<Card>
				<CardHeader>
					<CardTitle>Tìm kiếm và lọc</CardTitle>
					<CardDescription>
						Tìm kiếm và lọc linh kiện theo nhiều tiêu chí
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<div className="md:col-span-2">
							<Label htmlFor="search">Tìm kiếm</Label>
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Tìm theo tên, mã linh kiện, mô tả..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="category">Danh mục</Label>
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Chọn danh mục" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả danh mục</SelectItem>
									{categories.map((category, index) => (
										<SelectItem key={category || `empty-${index}`} value={category || ""}>
											{category || "Không phân loại"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="stockFilter">Trạng thái tồn kho</Label>
							<Select value={stockFilter} onValueChange={setStockFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Chọn trạng thái" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả</SelectItem>
									<SelectItem value="in_stock">Còn hàng</SelectItem>
									<SelectItem value="low_stock">Sắp hết hàng</SelectItem>
									<SelectItem value="out_of_stock">Hết hàng</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Quick filter buttons */}
					<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
						<span className="text-sm font-medium text-muted-foreground">Lọc nhanh:</span>
						<Button
							variant={stockFilter === "out_of_stock" ? "default" : "outline"}
							size="sm"
							onClick={() => setStockFilter("out_of_stock")}
							className="h-7"
						>
							<AlertTriangle className="h-3 w-3 mr-1" />
							Hết hàng ({outOfStockParts.length})
						</Button>
						<Button
							variant={stockFilter === "low_stock" ? "default" : "outline"}
							size="sm"
							onClick={() => setStockFilter("low_stock")}
							className="h-7"
						>
							<Bell className="h-3 w-3 mr-1" />
							Sắp hết ({criticalStockParts.length})
						</Button>
						<Button
							variant={stockFilter === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => setStockFilter("all")}
							className="h-7"
						>
							Tất cả ({parts.length})
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Parts List */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách linh kiện</CardTitle>
					<CardDescription>
						Tổng số {filteredParts.length} linh kiện
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={columns}
						data={filteredParts}
						searchKey="name"
						searchPlaceholder="Tìm kiếm theo tên linh kiện..."
					/>
					{filteredParts.length === 0 && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								{searchTerm || categoryFilter !== "all"
									? "Không tìm thấy linh kiện phù hợp"
									: "Chưa có linh kiện nào trong kho"
								}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Modals */}
			<StockAdjustmentModal
				part={selectedPart}
				isOpen={isStockAdjustmentOpen}
				onClose={closeStockAdjustment}
				onSuccess={handleStockAdjustmentSuccess}
			/>

			<PartsFormModal
				part={editingPart}
				isOpen={isPartsFormOpen}
				onClose={closePartsForm}
				onSuccess={handlePartsFormSuccess}
			/>

			<BulkImportModal
				isOpen={isBulkImportOpen}
				onClose={() => setIsBulkImportOpen(false)}
				onSuccess={handlePartsFormSuccess}
			/>

			<ExportPartsModal
				isOpen={isExportOpen}
				onClose={() => setIsExportOpen(false)}
				parts={parts}
			/>
		</div>
	);
}
