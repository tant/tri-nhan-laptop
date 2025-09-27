/**
 * Vietnamese currency formatting utilities for repair shop management
 */

export interface CurrencyFormatOptions {
	showCurrency?: boolean;
	showDecimals?: boolean;
	compact?: boolean;
	sign?: boolean;
}

/**
 * Format VND (Vietnamese Dong) currency
 */
export function formatVND(
	amount: number,
	options: CurrencyFormatOptions = {},
): string {
	const {
		showCurrency = true,
		showDecimals = false,
		compact = false,
		sign = false,
	} = options;

	// Handle null/undefined/NaN
	if (amount == null || Number.isNaN(amount)) {
		return showCurrency ? "0 ₫" : "0";
	}

	// Format number with Vietnamese locale
	const formatOptions: Intl.NumberFormatOptions = {
		minimumFractionDigits: showDecimals ? 0 : 0,
		maximumFractionDigits: showDecimals ? 2 : 0,
	};

	// Compact format for large numbers
	if (compact && Math.abs(amount) >= 1000000) {
		formatOptions.notation = "compact";
		formatOptions.compactDisplay = "short";
	}

	// Handle sign display
	if (sign) {
		formatOptions.signDisplay = "always";
	}

	let formatted = new Intl.NumberFormat("vi-VN", formatOptions).format(amount);

	// Add currency symbol
	if (showCurrency) {
		formatted += " ₫";
	}

	return formatted;
}

/**
 * Format currency for display in tables/lists (compact format)
 */
export function formatVNDCompact(amount: number): string {
	return formatVND(amount, {
		showCurrency: true,
		showDecimals: false,
		compact: true,
	});
}

/**
 * Format currency for detailed views (with decimals)
 */
export function formatVNDDetailed(amount: number): string {
	return formatVND(amount, {
		showCurrency: true,
		showDecimals: true,
		compact: false,
	});
}

/**
 * Format profit/loss with sign indicator
 */
export function formatVNDProfit(amount: number): string {
	const formatted = formatVND(Math.abs(amount), {
		showCurrency: true,
		showDecimals: false,
		compact: false,
	});

	if (amount > 0) {
		return `+${formatted}`;
	}
	if (amount < 0) {
		return `-${formatted}`;
	}
	return formatted;
}

/**
 * Format percentage with Vietnamese locale
 */
export function formatPercentage(
	value: number,
	options: { decimals?: number; showSign?: boolean } = {},
): string {
	const { decimals = 1, showSign = false } = options;

	if (value == null || Number.isNaN(value)) {
		return "0%";
	}

	const formatOptions: Intl.NumberFormatOptions = {
		style: "percent",
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	};

	if (showSign) {
		formatOptions.signDisplay = "always";
	}

	return new Intl.NumberFormat("vi-VN", formatOptions).format(value / 100);
}

/**
 * Parse VND string back to number
 */
export function parseVND(vndString: string): number {
	if (!vndString || typeof vndString !== "string") {
		return 0;
	}

	// Remove currency symbols and spaces
	const cleaned = vndString
		.replace(/₫/g, "")
		.replace(/VND/gi, "")
		.replace(/\s/g, "")
		.replace(/\./g, "") // Remove thousand separators
		.replace(/,/g, "."); // Convert decimal separator

	const parsed = Number.parseFloat(cleaned);
	return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Vietnamese number input formatter (for form inputs)
 */
export function formatNumberInput(value: string): string {
	// Remove all non-digit characters except decimal point
	const cleaned = value.replace(/[^\d.,]/g, "");

	// Convert to standard decimal format
	const standardized = cleaned.replace(/\./g, "").replace(/,/g, ".");

	// Split into integer and decimal parts
	const parts = standardized.split(".");
	const integerPart = parts[0];
	const decimalPart = parts[1];

	// Format integer part with thousand separators
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

	// Reconstruct with decimal part if exists
	if (decimalPart !== undefined) {
		return `${formattedInteger},${decimalPart}`;
	}

	return formattedInteger;
}

/**
 * Color coding for profit margins
 */
export function getProfitMarginColor(margin: number): string {
	if (margin >= 30) return "text-green-600";
	if (margin >= 15) return "text-blue-600";
	if (margin >= 5) return "text-yellow-600";
	if (margin >= 0) return "text-gray-600";
	return "text-red-600";
}

/**
 * Color coding for profit amounts
 */
export function getProfitAmountColor(profit: number): string {
	if (profit > 0) return "text-green-600";
	if (profit < 0) return "text-red-600";
	return "text-gray-600";
}

/**
 * Vietnamese business terms for cost tracking
 */
export const CostTerms = {
	// Cost breakdown types
	parts: "Linh kiện",
	labor: "Công lao động",
	overhead: "Chi phí khác",
	tax: "Thuế VAT",
	discount: "Giảm giá",

	// Quote statuses
	draft: "Nháp",
	sent: "Đã gửi",
	approved: "Đã duyệt",
	rejected: "Từ chối",
	expired: "Hết hạn",

	// Change types
	parts_added: "Thêm linh kiện",
	parts_removed: "Xóa linh kiện",
	labor_updated: "Cập nhật công",
	overhead_added: "Thêm chi phí",
	discount_applied: "Áp dụng giảm giá",
	quote_generated: "Tạo báo giá",

	// Financial terms
	cost: "Chi phí",
	revenue: "Doanh thu",
	profit: "Lợi nhuận",
	profitMargin: "Tỷ suất lợi nhuận",
	subtotal: "Tạm tính",
	total: "Tổng cộng",
	vat: "VAT",
	beforeTax: "Trước thuế",
	afterTax: "Sau thuế",
} as const;
