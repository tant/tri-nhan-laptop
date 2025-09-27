/**
 * Inventory Statistics Components
 * Statistics cards and overview displays for parts inventory
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Part } from "@/lib/database-types";
import { Currency } from "@/lib/formatting";
import {
	AlertTriangle,
	Bell,
	DollarSign,
	Package,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

export interface InventoryStatisticsProps {
	parts: Part[];
	totalInventoryValue?: number;
}

export interface InventoryStats {
	total: number;
	outOfStock: number;
	lowStock: number;
	categories: number;
	totalValue: number;
	averageValue: number;
}

/**
 * Calculate comprehensive inventory statistics
 */
export function useInventoryStatistics(
	parts: Part[],
	totalInventoryValue?: number,
): InventoryStats {
	return useMemo(() => {
		const outOfStockParts = parts.filter((part) => part.current_stock === 0);
		const lowStockParts = parts.filter(
			(part) =>
				part.current_stock > 0 &&
				part.current_stock <= (part.min_stock_level || 5),
		);
		const categories = [
			...new Set(parts.map((part) => part.category).filter(Boolean)),
		];

		// Calculate total value if not provided
		const calculatedValue =
			totalInventoryValue ??
			parts.reduce((total, part) => {
				return total + (part.unit_price || 0) * part.current_stock;
			}, 0);

		const averageValue = parts.length > 0 ? calculatedValue / parts.length : 0;

		return {
			total: parts.length,
			outOfStock: outOfStockParts.length,
			lowStock: lowStockParts.length,
			categories: categories.length,
			totalValue: calculatedValue,
			averageValue,
		};
	}, [parts, totalInventoryValue]);
}

/**
 * Get low stock parts for detailed display
 */
export function useLowStockParts(parts: Part[]) {
	return useMemo(() => {
		return parts
			.filter((part) => part.current_stock <= (part.min_stock_level || 5))
			.sort((a, b) => a.current_stock - b.current_stock);
	}, [parts]);
}

/**
 * Main statistics cards display
 */
export function InventoryStatisticsCards({
	parts,
	totalInventoryValue,
}: InventoryStatisticsProps) {
	const stats = useInventoryStatistics(parts, totalInventoryValue);

	return (
		<div className="grid gap-4 md:grid-cols-5">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Tổng linh kiện</CardTitle>
					<Package className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.total}</div>
					<p className="text-xs text-muted-foreground">
						{stats.categories} danh mục
					</p>
				</CardContent>
			</Card>

			<Card className="border-red-200 bg-red-50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-red-800">
						Hết hàng
					</CardTitle>
					<AlertTriangle className="h-4 w-4 text-red-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-red-800">
						{stats.outOfStock}
					</div>
					<p className="text-xs text-red-600">Cần nhập ngay</p>
				</CardContent>
			</Card>

			<Card className="border-orange-200 bg-orange-50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-orange-800">
						Sắp hết
					</CardTitle>
					<Bell className="h-4 w-4 text-orange-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-orange-800">
						{stats.lowStock}
					</div>
					<p className="text-xs text-orange-600">Cần theo dõi</p>
				</CardContent>
			</Card>

			<Card className="border-blue-200 bg-blue-50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-blue-800">
						Cảnh báo tồn kho
					</CardTitle>
					<TrendingUp className="h-4 w-4 text-blue-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-blue-800">
						{stats.lowStock + stats.outOfStock}
					</div>
					<p className="text-xs text-blue-600">Tổng cảnh báo</p>
				</CardContent>
			</Card>

			<Card className="border-green-200 bg-green-50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-green-800">
						Giá trị kho
					</CardTitle>
					<DollarSign className="h-4 w-4 text-green-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-green-800">
						{Currency.formatCompact(stats.totalValue)}
					</div>
					<p className="text-xs text-green-600">Tổng tài sản</p>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Compact statistics display
 */
export function CompactInventoryStats({
	parts,
	totalInventoryValue,
}: InventoryStatisticsProps) {
	const stats = useInventoryStatistics(parts, totalInventoryValue);

	return (
		<div className="flex items-center gap-6 text-sm text-muted-foreground">
			<span>
				Tổng: <strong className="text-foreground">{stats.total}</strong>
			</span>
			<span>
				Danh mục:{" "}
				<strong className="text-foreground">{stats.categories}</strong>
			</span>
			{stats.outOfStock > 0 && (
				<span className="text-red-600">
					Hết hàng: <strong>{stats.outOfStock}</strong>
				</span>
			)}
			{stats.lowStock > 0 && (
				<span className="text-orange-600">
					Sắp hết: <strong>{stats.lowStock}</strong>
				</span>
			)}
			<span>
				Giá trị:{" "}
				<strong className="text-foreground">
					{Currency.formatCompact(stats.totalValue)}
				</strong>
			</span>
		</div>
	);
}

/**
 * Low stock alert card
 */
export function LowStockAlert({ parts }: { parts: Part[] }) {
	const lowStockParts = useLowStockParts(parts);

	if (lowStockParts.length === 0) {
		return null;
	}

	return (
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
					{lowStockParts.slice(0, 10).map((part) => (
						<Badge
							key={part.id}
							variant="outline"
							className="text-orange-700 border-orange-300"
						>
							{part.name} ({part.current_stock}/{part.min_stock_level || 5})
						</Badge>
					))}
					{lowStockParts.length > 10 && (
						<Badge
							variant="outline"
							className="text-orange-700 border-orange-300"
						>
							+{lowStockParts.length - 10} khác
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Value breakdown by category
 */
export function CategoryValueBreakdown({ parts }: { parts: Part[] }) {
	const categoryValues = useMemo(() => {
		const values: Record<string, { count: number; value: number }> = {};

		parts.forEach((part) => {
			const category = part.category || "Không phân loại";
			const value = (part.unit_price || 0) * part.current_stock;

			if (!values[category]) {
				values[category] = { count: 0, value: 0 };
			}

			values[category].count += 1;
			values[category].value += value;
		});

		return Object.entries(values)
			.map(([category, data]) => ({ category, ...data }))
			.sort((a, b) => b.value - a.value);
	}, [parts]);

	const totalValue = categoryValues.reduce((sum, item) => sum + item.value, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Phân bố giá trị theo danh mục</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{categoryValues.map(({ category, count, value }) => {
					const percentage =
						totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
					return (
						<div key={category} className="flex justify-between items-center">
							<div>
								<span className="text-sm font-medium">{category}</span>
								<span className="text-xs text-muted-foreground ml-2">
									({count} linh kiện)
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">
									{Currency.formatCompact(value)}
								</span>
								<span className="text-xs text-muted-foreground">
									({percentage}%)
								</span>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}

/**
 * Stock level distribution
 */
export function StockLevelDistribution({ parts }: { parts: Part[] }) {
	const distribution = useMemo(() => {
		const outOfStock = parts.filter((p) => p.current_stock === 0).length;
		const lowStock = parts.filter(
			(p) => p.current_stock > 0 && p.current_stock <= (p.min_stock_level || 5),
		).length;
		const adequateStock = parts.filter(
			(p) =>
				p.current_stock > (p.min_stock_level || 5) && p.current_stock <= 100,
		).length;
		const highStock = parts.filter((p) => p.current_stock > 100).length;

		return [
			{ label: "Hết hàng", count: outOfStock, color: "text-red-600" },
			{ label: "Sắp hết", count: lowStock, color: "text-orange-600" },
			{ label: "Đủ hàng", count: adequateStock, color: "text-green-600" },
			{ label: "Dư thừa", count: highStock, color: "text-blue-600" },
		];
	}, [parts]);

	const total = parts.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Phân bố mức tồn kho</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{distribution.map(({ label, count, color }) => {
					const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
					return (
						<div key={label} className="flex justify-between items-center">
							<span className={`text-sm font-medium ${color}`}>{label}</span>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">{count}</span>
								<span className="text-xs text-muted-foreground">
									({percentage}%)
								</span>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
