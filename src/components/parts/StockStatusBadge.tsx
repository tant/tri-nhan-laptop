import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import type { Database } from "@/lib/supabase";

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface StockStatusBadgeProps {
	part: Part;
	showIcon?: boolean;
}

export function StockStatusBadge({ part, showIcon = true }: StockStatusBadgeProps) {
	const minStock = part.min_stock_level || 5;
	const currentStock = part.current_stock;

	// Determine stock status
	let status: "out_of_stock" | "low_stock" | "in_stock";
	let label: string;
	let variant: "destructive" | "outline" | "secondary";
	let icon: React.ComponentType<{ className?: string }>;

	if (currentStock === 0) {
		status = "out_of_stock";
		label = "Hết hàng";
		variant = "destructive";
		icon = AlertTriangle;
	} else if (currentStock <= minStock) {
		status = "low_stock";
		label = "Sắp hết";
		variant = "outline";
		icon = TrendingDown;
	} else {
		status = "in_stock";
		label = "Còn hàng";
		variant = "secondary";
		icon = Package;
	}

	const IconComponent = icon;

	return (
		<Badge variant={variant} className="flex items-center gap-1">
			{showIcon && <IconComponent className="h-3 w-3" />}
			{label}
		</Badge>
	);
}

export function getStockStatusInfo(part: Part) {
	const minStock = part.min_stock_level || 5;
	const currentStock = part.current_stock;

	if (currentStock === 0) {
		return {
			status: "out_of_stock" as const,
			label: "Hết hàng",
			variant: "destructive" as const,
			icon: AlertTriangle,
			priority: 3
		};
	} else if (currentStock <= minStock) {
		return {
			status: "low_stock" as const,
			label: "Sắp hết",
			variant: "outline" as const,
			icon: TrendingDown,
			priority: 2
		};
	} else {
		return {
			status: "in_stock" as const,
			label: "Còn hàng",
			variant: "secondary" as const,
			icon: Package,
			priority: 1
		};
	}
}