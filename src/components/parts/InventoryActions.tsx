/**
 * Inventory Action Components
 * Action buttons and management controls for parts inventory
 */

import { Button } from "@/components/ui/button";
import { Download, Plus, RefreshCw, Upload } from "lucide-react";
import { memo } from "react";

export interface InventoryActionsProps {
	onRefresh: () => void;
	onAddPart: () => void;
	onBulkImport: () => void;
	onExport: () => void;
	loading?: boolean;
}

/**
 * Primary action buttons for inventory management
 */
export const InventoryActions = memo(function InventoryActions({
	onRefresh,
	onAddPart,
	onBulkImport,
	onExport,
	loading = false
}: InventoryActionsProps) {
	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				onClick={onRefresh}
				disabled={loading}
				title="Làm mới dữ liệu"
			>
				<RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
				Làm mới
			</Button>
			<Button
				variant="outline"
				onClick={onExport}
				title="Xuất danh sách ra file CSV"
			>
				<Download className="h-4 w-4 mr-2" />
				Xuất CSV
			</Button>
			<Button
				variant="outline"
				onClick={onBulkImport}
				title="Nhập hàng loạt từ file CSV"
			>
				<Upload className="h-4 w-4 mr-2" />
				Nhập CSV
			</Button>
			<Button
				onClick={onAddPart}
				title="Thêm linh kiện mới"
			>
				<Plus className="mr-2 h-4 w-4" />
				Thêm linh kiện
			</Button>
		</div>
	);
});

/**
 * Compact action bar for small spaces
 */
export const CompactInventoryActions = memo(function CompactInventoryActions({
	onRefresh,
	onAddPart,
	loading = false
}: Pick<InventoryActionsProps, "onRefresh" | "onAddPart" | "loading">) {
	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={onRefresh}
				disabled={loading}
			>
				<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
			</Button>
			<Button size="sm" onClick={onAddPart}>
				<Plus className="h-4 w-4" />
			</Button>
		</div>
	);
});

/**
 * Bulk operation actions
 */
export function BulkOperationActions({
	selectedCount,
	onBulkStockAdjustment,
	onBulkDelete,
	onBulkExport
}: {
	selectedCount: number;
	onBulkStockAdjustment?: () => void;
	onBulkDelete?: () => void;
	onBulkExport?: () => void;
}) {
	if (selectedCount === 0) return null;

	return (
		<div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
			<span className="text-sm font-medium">
				Đã chọn {selectedCount} linh kiện
			</span>
			<div className="flex gap-2 ml-auto">
				{onBulkStockAdjustment && (
					<Button variant="outline" size="sm" onClick={onBulkStockAdjustment}>
						Điều chỉnh tồn kho
					</Button>
				)}
				{onBulkExport && (
					<Button variant="outline" size="sm" onClick={onBulkExport}>
						<Download className="h-4 w-4 mr-1" />
						Xuất
					</Button>
				)}
				{onBulkDelete && (
					<Button variant="destructive" size="sm" onClick={onBulkDelete}>
						Xóa
					</Button>
				)}
			</div>
		</div>
	);
}

/**
 * Quick action buttons for single part
 */
export function PartQuickActions({
	onStockAdjustment,
	onEdit,
	onDelete,
	disabled = false
}: {
	onStockAdjustment: () => void;
	onEdit: () => void;
	onDelete?: () => void;
	disabled?: boolean;
}) {
	return (
		<div className="flex space-x-1">
			<Button
				variant="ghost"
				size="sm"
				onClick={onStockAdjustment}
				disabled={disabled}
				title="Điều chỉnh tồn kho"
			>
				Tồn kho
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={onEdit}
				disabled={disabled}
				title="Chỉnh sửa linh kiện"
			>
				Sửa
			</Button>
			{onDelete && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onDelete}
					disabled={disabled}
					title="Xóa linh kiện"
					className="text-destructive hover:text-destructive"
				>
					Xóa
				</Button>
			)}
		</div>
	);
}

/**
 * Page header with title and actions
 */
export function InventoryPageHeader({
	title = "Quản lý linh kiện",
	description = "Theo dõi kho linh kiện và phụ kiện laptop",
	actions
}: {
	title?: string;
	description?: string;
	actions?: React.ReactNode;
}) {
	return (
		<div className="flex justify-between items-center">
			<div>
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			{actions && <div>{actions}</div>}
		</div>
	);
}

/**
 * Filter and sort actions
 */
export function InventoryFiltersActions({
	onClearFilters,
	onSortByName,
	onSortByStock,
	onSortByValue,
	currentSort
}: {
	onClearFilters: () => void;
	onSortByName: () => void;
	onSortByStock: () => void;
	onSortByValue: () => void;
	currentSort?: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium text-muted-foreground">Sắp xếp:</span>
			<div className="flex gap-1">
				<Button
					variant={currentSort === "name" ? "default" : "outline"}
					size="sm"
					onClick={onSortByName}
				>
					Tên
				</Button>
				<Button
					variant={currentSort === "stock" ? "default" : "outline"}
					size="sm"
					onClick={onSortByStock}
				>
					Tồn kho
				</Button>
				<Button
					variant={currentSort === "value" ? "default" : "outline"}
					size="sm"
					onClick={onSortByValue}
				>
					Giá trị
				</Button>
			</div>
			<Button variant="ghost" size="sm" onClick={onClearFilters}>
				Xóa bộ lọc
			</Button>
		</div>
	);
}