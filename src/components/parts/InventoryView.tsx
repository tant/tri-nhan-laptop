/**
 * Parts Inventory View Component
 * Main inventory display table and search functionality for parts management
 */

import { StockStatusBadge } from "@/components/parts/StockStatusBadge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Part } from "@/lib/database-types";
import { Currency } from "@/lib/formatting";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Bell, Edit, Search, Settings } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export interface InventoryViewProps {
	parts: Part[];
	loading: boolean;
	onStockAdjustment: (part: Part) => void;
	onEditPart: (part: Part) => void;
}

export interface InventoryFilters {
	searchTerm: string;
	categoryFilter: string;
	stockFilter: string;
}

/**
 * Calculate filtered parts based on search and filter criteria
 */
function useFilteredParts(parts: Part[], filters: InventoryFilters) {
	return useMemo(() => {
		let filtered = parts;

		// Search filter
		if (filters.searchTerm) {
			const search = filters.searchTerm.toLowerCase();
			filtered = filtered.filter(
				(part) =>
					part.name?.toLowerCase().includes(search) ||
					part.part_number?.toLowerCase().includes(search) ||
					part.description?.toLowerCase().includes(search) ||
					part.brand?.toLowerCase().includes(search),
			);
		}

		// Category filter
		if (filters.categoryFilter && filters.categoryFilter !== "all") {
			filtered = filtered.filter(
				(part) => part.category === filters.categoryFilter,
			);
		}

		// Stock status filter
		if (filters.stockFilter && filters.stockFilter !== "all") {
			switch (filters.stockFilter) {
				case "in_stock":
					filtered = filtered.filter(
						(part) => part.current_stock > (part.min_stock_level || 5),
					);
					break;
				case "low_stock":
					filtered = filtered.filter(
						(part) =>
							part.current_stock > 0 &&
							part.current_stock <= (part.min_stock_level || 5),
					);
					break;
				case "out_of_stock":
					filtered = filtered.filter((part) => part.current_stock === 0);
					break;
			}
		}

		return filtered;
	}, [parts, filters]);
}

/**
 * Calculate inventory statistics
 */
function useInventoryStats(parts: Part[]) {
	return useMemo(() => {
		const outOfStock = parts.filter((part) => part.current_stock === 0);
		const lowStock = parts.filter(
			(part) =>
				part.current_stock > 0 &&
				part.current_stock <= (part.min_stock_level || 5),
		);
		const categories = [
			...new Set(parts.map((part) => part.category).filter(Boolean)),
		];

		return {
			total: parts.length,
			outOfStock: outOfStock.length,
			lowStock: lowStock.length,
			categories: categories.length,
		};
	}, [parts]);
}

/**
 * Inventory table columns
 */
function createInventoryColumns({
	onStockAdjustment,
	onEditPart,
}: {
	onStockAdjustment: (part: Part) => void;
	onEditPart: (part: Part) => void;
}): ColumnDef<Part>[] {
	return [
		{
			accessorKey: "part_number",
			header: "Mã linh kiện",
			cell: ({ row }) => (
				<div className="font-mono text-sm font-medium">
					{row.getValue("part_number")}
				</div>
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
			cell: ({ row }) => (
				<div className="text-sm">
					{row.getValue("category") || "Không phân loại"}
				</div>
			),
		},
		{
			accessorKey: "unit_price",
			header: "Giá",
			cell: ({ row }) => (
				<div className="text-right font-mono">
					{Currency.format(row.getValue("unit_price"))}
				</div>
			),
		},
		{
			accessorKey: "current_stock",
			header: "Tồn kho",
			cell: ({ row }) => (
				<div className="text-center">
					<span className="font-medium font-mono">
						{row.getValue("current_stock")}
					</span>
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
						variant="ghost"
						size="sm"
						onClick={() => onStockAdjustment(row.original)}
						title="Điều chỉnh tồn kho"
					>
						<Settings className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onEditPart(row.original)}
						title="Chỉnh sửa linh kiện"
					>
						<Edit className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];
}

/**
 * Search and filter controls
 */
function InventoryFilters({
	parts,
	filters,
	onChange,
}: {
	parts: Part[];
	filters: InventoryFilters;
	onChange: (filters: InventoryFilters) => void;
}) {
	const stats = useInventoryStats(parts);
	const categories = useMemo(
		() => [...new Set(parts.map((part) => part.category).filter(Boolean))],
		[parts],
	);

	const updateFilter = useCallback(
		(key: keyof InventoryFilters, value: string) => {
			onChange({
				...filters,
				[key]: value,
			});
		},
		[filters, onChange],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tìm kiếm và lọc</CardTitle>
				<CardDescription>
					Tìm kiếm và lọc linh kiện theo nhiều tiêu chí
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-3">
					<div>
						<Label htmlFor="search">Tìm kiếm</Label>
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="search"
								placeholder="Tìm theo tên, mã, thương hiệu..."
								value={filters.searchTerm}
								onChange={(e) => updateFilter("searchTerm", e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="category">Danh mục</Label>
						<Select
							value={filters.categoryFilter}
							onValueChange={(value) => updateFilter("categoryFilter", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn danh mục" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả danh mục</SelectItem>
								{categories.map((category, index) => (
									<SelectItem
										key={category || `empty-${index}`}
										value={category || ""}
									>
										{category || "Không phân loại"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="stockFilter">Trạng thái tồn kho</Label>
						<Select
							value={filters.stockFilter}
							onValueChange={(value) => updateFilter("stockFilter", value)}
						>
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
					<span className="text-sm font-medium text-muted-foreground">
						Lọc nhanh:
					</span>
					<Button
						variant={
							filters.stockFilter === "out_of_stock" ? "default" : "outline"
						}
						size="sm"
						onClick={() => updateFilter("stockFilter", "out_of_stock")}
						className="h-7"
					>
						<AlertTriangle className="h-3 w-3 mr-1" />
						Hết hàng ({stats.outOfStock})
					</Button>
					<Button
						variant={
							filters.stockFilter === "low_stock" ? "default" : "outline"
						}
						size="sm"
						onClick={() => updateFilter("stockFilter", "low_stock")}
						className="h-7"
					>
						<Bell className="h-3 w-3 mr-1" />
						Sắp hết ({stats.lowStock})
					</Button>
					<Button
						variant={filters.stockFilter === "all" ? "default" : "outline"}
						size="sm"
						onClick={() => updateFilter("stockFilter", "all")}
						className="h-7"
					>
						Tất cả ({stats.total})
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Main inventory view component
 */
export function InventoryView({
	parts,
	loading,
	onStockAdjustment,
	onEditPart,
}: InventoryViewProps) {
	const [filters, setFilters] = useState<InventoryFilters>({
		searchTerm: "",
		categoryFilter: "all",
		stockFilter: "all",
	});

	const filteredParts = useFilteredParts(parts, filters);
	const columns = useMemo(
		() => createInventoryColumns({ onStockAdjustment, onEditPart }),
		[onStockAdjustment, onEditPart],
	);

	return (
		<div className="space-y-6">
			{/* Search and Filter */}
			<InventoryFilters parts={parts} filters={filters} onChange={setFilters} />

			{/* Parts Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách linh kiện</CardTitle>
					<CardDescription>
						Tổng số {filteredParts.length} linh kiện
						{filters.searchTerm ||
						filters.categoryFilter !== "all" ||
						filters.stockFilter !== "all"
							? ` (từ ${parts.length} linh kiện)`
							: ""}
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
								{filters.searchTerm ||
								filters.categoryFilter !== "all" ||
								filters.stockFilter !== "all"
									? "Không tìm thấy linh kiện phù hợp với tiêu chí lọc"
									: "Chưa có linh kiện nào trong kho"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Export inventory filters hook for external use
 */
export function useInventoryFilters(
	initialFilters?: Partial<InventoryFilters>,
) {
	const [filters, setFilters] = useState<InventoryFilters>({
		searchTerm: "",
		categoryFilter: "all",
		stockFilter: "all",
		...initialFilters,
	});

	const updateFilter = useCallback(
		(key: keyof InventoryFilters, value: string) => {
			setFilters((prev) => ({
				...prev,
				[key]: value,
			}));
		},
		[],
	);

	const resetFilters = useCallback(() => {
		setFilters({
			searchTerm: "",
			categoryFilter: "all",
			stockFilter: "all",
		});
	}, []);

	return {
		filters,
		setFilters,
		updateFilter,
		resetFilters,
	};
}
