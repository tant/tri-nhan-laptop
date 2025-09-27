/**
 * Reusable Table Column Definitions
 * Common column configurations for TanStack Table across the application
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Currency, DateTime, Numbers, Text } from "@/lib/formatting";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { memo } from "react";

/**
 * Common column header with sorting
 * Generic type-safe sortable header component
 */
export function createSortableHeader<TData>(title: string) {
	return ({ column }: { column: import("@tanstack/react-table").Column<TData, unknown> }) => (
		<Button
			variant="ghost"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			className="h-8 px-2 lg:px-3"
		>
			{title}
			<ArrowUpDown className="ml-2 h-4 w-4" />
		</Button>
	);
}

/**
 * Action column with view/edit/delete buttons
 */
export function createActionColumn<T>(options: {
	onView?: (item: T) => void;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	viewLabel?: string;
	editLabel?: string;
	deleteLabel?: string;
}): ColumnDef<T> {
	return {
		id: "actions",
		header: "Thao tác",
		cell: ({ row }) => {
			const item = row.original;
			return (
				<div className="flex space-x-2">
					{options.onView && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => options.onView!(item)}
							title={options.viewLabel || "Xem chi tiết"}
						>
							<Eye className="h-4 w-4" />
						</Button>
					)}
					{options.onEdit && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => options.onEdit!(item)}
							title={options.editLabel || "Chỉnh sửa"}
						>
							<Edit className="h-4 w-4" />
						</Button>
					)}
					{options.onDelete && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => options.onDelete!(item)}
							title={options.deleteLabel || "Xóa"}
							className="text-destructive hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			);
		},
	};
}

/**
 * Currency column
 */
export function createCurrencyColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: {
		sortable?: boolean;
		compact?: boolean;
		allowNull?: boolean;
	}
): ColumnDef<T> {
	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const value = row.getValue(accessorKey as string) as number | null;
			const formatted = options?.compact
				? Currency.formatCompact(value)
				: Currency.format(value);

			return <div className="text-right font-mono">{formatted}</div>;
		},
	};
}

/**
 * Date column
 */
export function createDateColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: {
		sortable?: boolean;
		format?: "date" | "datetime" | "relative";
	}
): ColumnDef<T> {
	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const value = row.getValue(accessorKey as string) as string;
			let formatted: string;

			switch (options?.format) {
				case "datetime":
					formatted = DateTime.formatDateTime(value);
					break;
				case "relative":
					formatted = DateTime.formatRelative(value);
					break;
				default:
					formatted = DateTime.formatDate(value);
			}

			return <div className="text-sm">{formatted}</div>;
		},
	};
}

/**
 * Status badge column
 */
export function createStatusColumn<T>(
	accessorKey: keyof T,
	header: string,
	statusMap: Record<string, { label: string; variant: any }>,
	options?: {
		sortable?: boolean;
	}
): ColumnDef<T> {
	const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
		const statusInfo = statusMap[status] || { label: status, variant: "outline" };
		return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
	});

	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const status = row.getValue(accessorKey as string) as string;
			return <StatusBadge status={status} />;
		},
	};
}

/**
 * Phone number column
 */
export function createPhoneColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: { sortable?: boolean }
): ColumnDef<T> {
	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const phone = row.getValue(accessorKey as string) as string;
			return <div className="font-mono">{Text.formatPhone(phone)}</div>;
		},
	};
}

/**
 * Truncated text column
 */
export function createTextColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: {
		sortable?: boolean;
		maxLength?: number;
		className?: string;
	}
): ColumnDef<T> {
	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const value = row.getValue(accessorKey as string) as string;
			const text = options?.maxLength
				? Text.truncate(value, options.maxLength)
				: value;

			return (
				<div
					className={options?.className || "max-w-[200px]"}
					title={value}
				>
					{text}
				</div>
			);
		},
	};
}

/**
 * Number column with formatting
 */
export function createNumberColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: {
		sortable?: boolean;
		unit?: string;
		format?: "default" | "percent" | "rating";
	}
): ColumnDef<T> {
	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const value = row.getValue(accessorKey as string) as number;
			let formatted: string;

			switch (options?.format) {
				case "percent":
					formatted = Numbers.formatPercent(value, 1);
					break;
				case "rating":
					formatted = Numbers.formatRating(value);
					break;
				default:
					formatted = Numbers.format(value);
					if (options?.unit) {
						formatted += ` ${options.unit}`;
					}
			}

			return <div className="text-right">{formatted}</div>;
		},
	};
}

/**
 * Customer info column (name + phone)
 */
export function createCustomerColumn<T>(
	nameAccessor: keyof T,
	phoneAccessor: keyof T,
	header: string = "Khách hàng"
): ColumnDef<T> {
	return {
		id: "customer",
		header,
		cell: ({ row }) => {
			const name = row.getValue(nameAccessor as string) as string;
			const phone = row.getValue(phoneAccessor as string) as string;

			return (
				<div className="space-y-1">
					<div className="font-medium">{name}</div>
					<div className="text-sm text-muted-foreground font-mono">
						{Text.formatPhone(phone)}
					</div>
				</div>
			);
		},
	};
}

/**
 * Boolean column with Yes/No or custom labels
 */
export function createBooleanColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: {
		sortable?: boolean;
		trueLabel?: string;
		falseLabel?: string;
		showBadge?: boolean;
	}
): ColumnDef<T> {
	const trueLabel = options?.trueLabel || "Có";
	const falseLabel = options?.falseLabel || "Không";

	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const value = row.getValue(accessorKey as string) as boolean;
			const label = value ? trueLabel : falseLabel;

			if (options?.showBadge) {
				return (
					<Badge variant={value ? "default" : "outline"}>
						{label}
					</Badge>
				);
			}

			return <div>{label}</div>;
		},
	};
}

/**
 * Inventory status column
 */
export function createInventoryStatusColumn<T>(
	currentStockAccessor: keyof T,
	minStockAccessor: keyof T,
	header: string = "Tình trạng"
): ColumnDef<T> {
	return {
		id: "inventory_status",
		header,
		cell: ({ row }) => {
			const current = row.getValue(currentStockAccessor as string) as number;
			const minimum = row.getValue(minStockAccessor as string) as number;

			const { text, status } = Currency.formatInventoryStatus(current, minimum);

			const variantMap = {
				good: "default",
				low: "destructive",
				out: "destructive",
			} as const;

			return <Badge variant={variantMap[status]}>{text}</Badge>;
		},
	};
}

/**
 * Progress column
 */
export function createProgressColumn<T>(
	accessorKey: keyof T,
	header: string,
	options?: {
		sortable?: boolean;
		max?: number;
		showPercentage?: boolean;
	}
): ColumnDef<T> {
	const max = options?.max || 100;

	return {
		accessorKey: accessorKey as string,
		header: options?.sortable ? createSortableHeader(header) : header,
		cell: ({ row }) => {
			const value = row.getValue(accessorKey as string) as number;
			const percentage = Math.round((value / max) * 100);

			return (
				<div className="flex items-center space-x-2">
					<div className="w-16 bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full"
							style={{ width: `${percentage}%` }}
						/>
					</div>
					{options?.showPercentage && (
						<span className="text-sm text-muted-foreground">
							{percentage}%
						</span>
					)}
				</div>
			);
		},
	};
}

/**
 * Common column configurations for specific entities
 */
export const CommonColumns = {
	/**
	 * ID column (usually hidden, for row selection)
	 */
	id<T>(accessorKey: keyof T = "id" as keyof T): ColumnDef<T> {
		return {
			accessorKey: accessorKey as string,
			header: "ID",
			meta: { hidden: true },
		};
	},

	/**
	 * Created date column
	 */
	createdAt<T>(accessorKey: keyof T = "created_at" as keyof T): ColumnDef<T> {
		return createDateColumn(accessorKey, "Ngày tạo", {
			sortable: true,
			format: "date"
		});
	},

	/**
	 * Updated date column
	 */
	updatedAt<T>(accessorKey: keyof T = "updated_at" as keyof T): ColumnDef<T> {
		return createDateColumn(accessorKey, "Cập nhật", {
			sortable: true,
			format: "relative"
		});
	},

	/**
	 * Row number column
	 */
	rowNumber<T>(): ColumnDef<T> {
		return {
			id: "row_number",
			header: "#",
			cell: ({ row }) => (
				<div className="text-center text-muted-foreground">
					{row.index + 1}
				</div>
			),
		};
	},

	/**
	 * Selection checkbox column
	 */
	select<T>(): ColumnDef<T> {
		return {
			id: "select",
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllPageRowsSelected()}
					onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
					className="rounded border-gray-300"
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={(e) => row.toggleSelected(e.target.checked)}
					className="rounded border-gray-300"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		};
	},
};