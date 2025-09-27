/**
 * Formatting Utilities
 * Consolidated formatting functions for Vietnamese locale
 *
 * This module provides consistent formatting for Vietnamese business operations including:
 * - Currency formatting in Vietnamese Dong (VND)
 * - Date/time formatting for Asia/Ho_Chi_Minh timezone
 * - Phone number formatting for Vietnamese mobile numbers
 * - Business-specific formatting for repair shop operations
 *
 * @module formatting
 * @version 1.0.0
 * @author Vietnamese Laptop Repair Shop Team
 */

// Vietnamese locale constants
export const VIETNAMESE_LOCALE = "vi-VN";
export const VIETNAMESE_CURRENCY = "VND";
export const VIETNAMESE_TIMEZONE = "Asia/Ho_Chi_Minh";

// Currency formatters (cached for performance)
const currencyFormatter = new Intl.NumberFormat(VIETNAMESE_LOCALE, {
	style: "currency",
	currency: VIETNAMESE_CURRENCY,
});

const numberFormatter = new Intl.NumberFormat(VIETNAMESE_LOCALE);

const compactCurrencyFormatter = new Intl.NumberFormat(VIETNAMESE_LOCALE, {
	style: "currency",
	currency: VIETNAMESE_CURRENCY,
	notation: "compact",
	maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat(VIETNAMESE_LOCALE, {
	style: "percent",
	minimumFractionDigits: 0,
	maximumFractionDigits: 1,
});

// Date formatters (cached for performance)
const dateFormatter = new Intl.DateTimeFormat(VIETNAMESE_LOCALE, {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat(VIETNAMESE_LOCALE, {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat(VIETNAMESE_LOCALE, {
	hour: "2-digit",
	minute: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat(VIETNAMESE_LOCALE, {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
});

/**
 * Currency Formatting Functions
 * Vietnamese Dong (VND) formatting utilities for repair shop operations
 */
export const Currency = {
	/**
	 * Format amount to Vietnamese currency with proper VND symbol and locale
	 *
	 * @param amount - The amount to format (in VND)
	 * @returns Formatted currency string in Vietnamese locale
	 *
	 * @example
	 * ```typescript
	 * Currency.format(150000) // "150.000 ₫"
	 * Currency.format(null) // "Chưa định giá"
	 * Currency.format(0) // "Miễn phí"
	 * ```
	 *
	 * @since 1.0.0
	 */
	format: (amount: number | null | undefined): string => {
		if (amount === null || amount === undefined) {
			return "Chưa định giá";
		}
		if (amount === 0) {
			return "Miễn phí";
		}
		return currencyFormatter.format(amount);
	},

	/**
	 * Format amount to compact Vietnamese currency (for charts/tables)
	 *
	 * @param amount - The amount to format in VND
	 * @returns Compact formatted currency string (e.g., "1,5TR ₫" for 1,500,000)
	 *
	 * @example
	 * ```typescript
	 * Currency.formatCompact(1500000) // "1,5TR ₫"
	 * Currency.formatCompact(null) // "N/A"
	 * Currency.formatCompact(0) // "0đ"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatCompact: (amount: number | null | undefined): string => {
		if (amount === null || amount === undefined) {
			return "N/A";
		}
		if (amount === 0) {
			return "0đ";
		}
		return compactCurrencyFormatter.format(amount);
	},

	/**
	 * Format amount without currency symbol for calculations
	 *
	 * @param amount - The numeric amount to format
	 * @returns Formatted number string without currency symbol
	 *
	 * @example
	 * ```typescript
	 * Currency.formatNumber(150000) // "150.000"
	 * Currency.formatNumber(null) // "0"
	 * Currency.formatNumber(undefined) // "0"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatNumber: (amount: number | null | undefined): string => {
		if (amount === null || amount === undefined) {
			return "0";
		}
		return numberFormatter.format(amount);
	},

	/**
	 * Parse Vietnamese currency string back to numeric value
	 *
	 * @param currencyString - Currency string with Vietnamese formatting
	 * @returns Parsed numeric value, 0 if parsing fails
	 *
	 * @example
	 * ```typescript
	 * Currency.parse("150.000 ₫") // 150000
	 * Currency.parse("1,5TR ₫") // Returns parsed value
	 * Currency.parse("invalid") // 0
	 * ```
	 *
	 * @since 1.0.0
	 */
	parse: (currencyString: string): number => {
		// Remove currency symbols and spaces, handle Vietnamese number format
		const cleaned = currencyString
			.replace(/[₫đ]/g, "")
			.replace(/\s/g, "")
			.replace(/\./g, "")
			.replace(/,/g, ".");

		const parsed = parseFloat(cleaned);
		return isNaN(parsed) ? 0 : parsed;
	},

	/**
	 * Format detailed cost breakdown for repair estimates
	 *
	 * @param parts - Cost of parts in VND
	 * @param labor - Labor cost in VND
	 * @param other - Additional costs (optional, defaults to 0)
	 * @returns Object with total and detailed breakdown string
	 *
	 * @example
	 * ```typescript
	 * Currency.formatBreakdown(500000, 200000, 50000)
	 * // {
	 * //   total: "750.000 ₫",
	 * //   breakdown: "Linh kiện: 500.000 ₫, Công: 200.000 ₫, Khác: 50.000 ₫"
	 * // }
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatBreakdown: (
		parts: number,
		labor: number,
		other: number = 0
	): { total: string; breakdown: string } => {
		const total = parts + labor + other;
		const breakdown = `Linh kiện: ${Currency.format(parts)}, Công: ${Currency.format(labor)}${
			other > 0 ? `, Khác: ${Currency.format(other)}` : ""
		}`;

		return {
			total: Currency.format(total),
			breakdown,
		};
	},

	/**
	 * Format price range display for repair estimates
	 *
	 * @param min - Minimum price in VND
	 * @param max - Maximum price in VND
	 * @returns Formatted price range string, single price if min equals max
	 *
	 * @example
	 * ```typescript
	 * Currency.formatRange(100000, 200000) // "100.000 ₫ - 200.000 ₫"
	 * Currency.formatRange(150000, 150000) // "150.000 ₫"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatRange: (min: number, max: number): string => {
		if (min === max) {
			return Currency.format(min);
		}
		return `${Currency.format(min)} - ${Currency.format(max)}`;
	},
};

/**
 * Date and Time Formatting Functions
 * Vietnamese locale date/time utilities for Asia/Ho_Chi_Minh timezone
 *
 * @namespace DateTime
 */
export const DateTime = {
	/**
	 * Format date to Vietnamese format (dd/mm/yyyy)
	 *
	 * @param date - Date string (ISO) or Date object to format
	 * @returns Formatted date string in Vietnamese format or error message
	 *
	 * @example
	 * ```typescript
	 * DateTime.formatDate("2024-01-15T10:30:00Z") // "15/01/2024"
	 * DateTime.formatDate(new Date()) // "26/09/2025"
	 * DateTime.formatDate("invalid") // "Ngày không hợp lệ"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatDate: (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (isNaN(dateObj.getTime())) {
			return "Ngày không hợp lệ";
		}
		return dateFormatter.format(dateObj);
	},

	/**
	 * Format datetime to Vietnamese format (dd/mm/yyyy hh:mm)
	 *
	 * @param date - Date string (ISO) or Date object to format
	 * @returns Formatted datetime string in Vietnamese format or error message
	 *
	 * @example
	 * ```typescript
	 * DateTime.formatDateTime("2024-01-15T10:30:00Z") // "15/01/2024 17:30"
	 * DateTime.formatDateTime(new Date()) // "26/09/2025 14:25"
	 * DateTime.formatDateTime("invalid") // "Ngày không hợp lệ"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatDateTime: (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (isNaN(dateObj.getTime())) {
			return "Ngày không hợp lệ";
		}
		return dateTimeFormatter.format(dateObj);
	},

	/**
	 * Format time only in 24-hour Vietnamese format (hh:mm)
	 *
	 * @param date - Date string (ISO) or Date object to extract time from
	 * @returns Formatted time string or error message
	 *
	 * @example
	 * ```typescript
	 * DateTime.formatTime("2024-01-15T10:30:00Z") // "17:30"
	 * DateTime.formatTime(new Date()) // "14:25"
	 * DateTime.formatTime("invalid") // "Giờ không hợp lệ"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatTime: (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (isNaN(dateObj.getTime())) {
			return "Giờ không hợp lệ";
		}
		return timeFormatter.format(dateObj);
	},

	/**
	 * Format long date with weekday in Vietnamese (Thứ hai, 1 tháng 1, 2024)
	 *
	 * @param date - Date string (ISO) or Date object to format
	 * @returns Long formatted date string in Vietnamese or error message
	 *
	 * @example
	 * ```typescript
	 * DateTime.formatLongDate("2024-01-15T10:30:00Z") // "Thứ hai, 15 tháng 1, 2024"
	 * DateTime.formatLongDate(new Date()) // "Thứ năm, 26 tháng 9, 2025"
	 * DateTime.formatLongDate("invalid") // "Ngày không hợp lệ"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatLongDate: (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (isNaN(dateObj.getTime())) {
			return "Ngày không hợp lệ";
		}
		return longDateFormatter.format(dateObj);
	},

	/**
	 * Format relative time in Vietnamese (x phút trước, x giờ trước, etc.)
	 *
	 * @param date - Date string (ISO) or Date object to compare against current time
	 * @returns Relative time string in Vietnamese or error message
	 *
	 * @example
	 * ```typescript
	 * DateTime.formatRelative(new Date(Date.now() - 5 * 60 * 1000)) // "5 phút trước"
	 * DateTime.formatRelative(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2 giờ trước"
	 * DateTime.formatRelative(new Date(Date.now() - 30 * 1000)) // "Vừa xong"
	 * DateTime.formatRelative("invalid") // "Ngày không hợp lệ"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatRelative: (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (isNaN(dateObj.getTime())) {
			return "Ngày không hợp lệ";
		}

		const now = new Date();
		const diffMs = now.getTime() - dateObj.getTime();
		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffSeconds < 60) {
			return "Vừa xong";
		} else if (diffMinutes < 60) {
			return `${diffMinutes} phút trước`;
		} else if (diffHours < 24) {
			return `${diffHours} giờ trước`;
		} else if (diffDays < 7) {
			return `${diffDays} ngày trước`;
		} else {
			return DateTime.formatDate(dateObj);
		}
	},

	/**
	 * Format duration in minutes to human readable Vietnamese format
	 *
	 * @param minutes - Duration in minutes to format
	 * @returns Human-readable duration string in Vietnamese
	 *
	 * @example
	 * ```typescript
	 * DateTime.formatDuration(30) // "30 phút"
	 * DateTime.formatDuration(90) // "1 giờ 30 phút"
	 * DateTime.formatDuration(120) // "2 giờ"
	 * DateTime.formatDuration(0) // "0 phút"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatDuration: (minutes: number): string => {
		if (minutes < 60) {
			return `${minutes} phút`;
		}

		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;

		if (remainingMinutes === 0) {
			return `${hours} giờ`;
		}

		return `${hours} giờ ${remainingMinutes} phút`;
	},

	/**
	 * Get Vietnamese day of week name from date
	 *
	 * @param date - Date string (ISO) or Date object to get day name from
	 * @returns Vietnamese day name (Chủ nhật through Thứ bảy)
	 *
	 * @example
	 * ```typescript
	 * DateTime.getDayOfWeek(new Date('2024-01-15')) // "Thứ hai"
	 * DateTime.getDayOfWeek("2024-01-14T00:00:00Z") // "Chủ nhật"
	 * ```
	 *
	 * @since 1.0.0
	 */
	getDayOfWeek: (date: string | Date): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
		return days[dateObj.getDay()];
	},
};

/**
 * Number and Percentage Formatting Functions
 * Vietnamese locale number formatting utilities
 *
 * @namespace Numbers
 */
export const Numbers = {
	/**
	 * Format number with Vietnamese locale (thousands separators)
	 *
	 * @param num - Number to format, null/undefined defaults to 0
	 * @returns Formatted number string with Vietnamese thousands separators
	 *
	 * @example
	 * ```typescript
	 * Numbers.format(150000) // "150.000"
	 * Numbers.format(1234567) // "1.234.567"
	 * Numbers.format(null) // "0"
	 * Numbers.format(undefined) // "0"
	 * ```
	 *
	 * @since 1.0.0
	 */
	format: (num: number | null | undefined): string => {
		if (num === null || num === undefined) {
			return "0";
		}
		return numberFormatter.format(num);
	},

	/**
	 * Format percentage calculation with Vietnamese locale
	 *
	 * @param value - Numerator value
	 * @param total - Denominator value (total)
	 * @returns Formatted percentage string or "0%" if total is zero
	 *
	 * @example
	 * ```typescript
	 * Numbers.formatPercent(75, 100) // "75%"
	 * Numbers.formatPercent(1, 3) // "33,3%"
	 * Numbers.formatPercent(10, 0) // "0%"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatPercent: (value: number, total: number): string => {
		if (total === 0) return "0%";
		const percentage = value / total;
		return percentFormatter.format(percentage);
	},

	/**
	 * Format file size in human-readable format
	 *
	 * @param bytes - File size in bytes
	 * @returns Human-readable file size string
	 *
	 * @example
	 * ```typescript
	 * Numbers.formatFileSize(1024) // "1 KB"
	 * Numbers.formatFileSize(1048576) // "1 MB"
	 * Numbers.formatFileSize(0) // "0 Bytes"
	 * Numbers.formatFileSize(1536) // "1.5 KB"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatFileSize: (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	},

	/**
	 * Format quantity with Vietnamese unit label
	 *
	 * @param quantity - Numeric quantity to format
	 * @param unit - Unit label (defaults to "cái" - Vietnamese for "pieces")
	 * @returns Formatted quantity string with unit
	 *
	 * @example
	 * ```typescript
	 * Numbers.formatQuantity(5) // "5 cái"
	 * Numbers.formatQuantity(10, "chiếc") // "10 chiếc"
	 * Numbers.formatQuantity(1000, "kg") // "1.000 kg"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatQuantity: (quantity: number, unit: string = "cái"): string => {
		return `${Numbers.format(quantity)} ${unit}`;
	},

	/**
	 * Format rating with star display (out of 5 stars)
	 *
	 * @param rating - Rating value (0-5)
	 * @returns Formatted rating string with stars and numeric value
	 *
	 * @example
	 * ```typescript
	 * Numbers.formatRating(4.5) // "★★★★☆ (4.5)"
	 * Numbers.formatRating(3) // "★★★☆☆ (3.0)"
	 * Numbers.formatRating(5) // "★★★★★ (5.0)"
	 * Numbers.formatRating(0) // "☆☆☆☆☆ (0.0)"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatRating: (rating: number): string => {
		const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
		return `${stars} (${rating.toFixed(1)})`;
	},
};

/**
 * Text Formatting Functions
 * Vietnamese-specific text processing and formatting utilities
 *
 * @namespace Text
 */
export const Text = {
	/**
	 * Truncate text with ellipsis for display in constrained spaces
	 *
	 * @param text - Text string to truncate
	 * @param maxLength - Maximum length before truncation
	 * @returns Truncated text with "..." if over maxLength, original text otherwise
	 *
	 * @example
	 * ```typescript
	 * Text.truncate("This is a very long description", 20) // "This is a very long..."
	 * Text.truncate("Short text", 20) // "Short text"
	 * Text.truncate("", 10) // ""
	 * ```
	 *
	 * @since 1.0.0
	 */
	truncate: (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + "...";
	},

	/**
	 * Capitalize first letter of text (Vietnamese-safe)
	 *
	 * @param text - Text string to capitalize
	 * @returns String with first letter capitalized, rest lowercase
	 *
	 * @example
	 * ```typescript
	 * Text.capitalize("nguyễn văn an") // "Nguyễn văn an"
	 * Text.capitalize("DELL LAPTOP") // "Dell laptop"
	 * Text.capitalize("") // ""
	 * ```
	 *
	 * @since 1.0.0
	 */
	capitalize: (text: string): string => {
		if (!text) return "";
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	},

	/**
	 * Format phone number for display (simplified)
	 *
	 * @param phone - Raw phone number string
	 * @returns Basic formatted phone number
	 *
	 * @example
	 * ```typescript
	 * Text.formatPhone("0901234567") // "0901 234 567"
	 * Text.formatPhone("123456789") // "1234 567 89"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatPhone: (phone: string): string => {
		if (!phone) return "";
		const cleaned = phone.replace(/\s+/g, '');
		if (cleaned.length >= 10) {
			return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
		}
		return cleaned;
	},

	/**
	 * Format repair ticket code to standard format
	 *
	 * @param code - Raw ticket code or number
	 * @returns Formatted ticket code (LRP-YYYY-XXXXXX)
	 *
	 * @example
	 * ```typescript
	 * Text.formatTicketCode("LRP-2024-000001") // "LRP-2024-000001"
	 * Text.formatTicketCode("123") // "LRP-2025-000123"
	 * Text.formatTicketCode("invalid") // "invalid"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatTicketCode: (code: string): string => {
		// Ensure ticket code is properly formatted (LRP-YYYY-XXXXXX)
		if (code.match(/^LRP-\d{4}-\d{6}$/)) {
			return code;
		}

		// If just numbers, format as ticket code
		if (code.match(/^\d+$/)) {
			const year = new Date().getFullYear();
			const paddedCode = code.padStart(6, "0");
			return `LRP-${year}-${paddedCode}`;
		}

		return code;
	},

	/**
	 * Format status or priority enum for human-readable display
	 *
	 * @param status - Status string (usually snake_case)
	 * @returns Human-readable status with proper capitalization
	 *
	 * @example
	 * ```typescript
	 * Text.formatStatus("device_received") // "Device Received"
	 * Text.formatStatus("in_repair") // "In Repair"
	 * Text.formatStatus("normal") // "Normal"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatStatus: (status: string): string => {
		return status
			.split("_")
			.map(word => Text.capitalize(word))
			.join(" ");
	},
};

/**
 * Business-specific formatting functions
 * Vietnamese laptop repair shop domain-specific formatters
 *
 * @namespace Business
 */
export const Business = {
	/**
	 * Format repair estimate summary with cost and duration
	 *
	 * @param cost - Estimated repair cost in VND
	 * @param duration - Estimated duration in minutes
	 * @returns Combined cost and time estimate string
	 *
	 * @example
	 * ```typescript
	 * Business.formatEstimate(500000, 120) // "500.000 ₫ • 2 giờ"
	 * Business.formatEstimate(150000, 45) // "150.000 ₫ • 45 phút"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatEstimate: (cost: number, duration: number): string => {
		return `${Currency.format(cost)} • ${DateTime.formatDuration(duration)}`;
	},

	/**
	 * Format customer summary with contact info and repair history
	 *
	 * @param name - Customer full name
	 * @param phone - Customer phone number
	 * @param totalRepairs - Total number of previous repairs
	 * @returns Formatted customer summary string
	 *
	 * @example
	 * ```typescript
	 * Business.formatCustomerSummary("Nguyễn Văn An", "0901234567", 3)
	 * // "Nguyễn Văn An (0901 234 567) • 3 lần sửa chữa"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatCustomerSummary: (
		name: string,
		phone: string,
		totalRepairs: number
	): string => {
		return `${name} (${Text.formatPhone(phone)}) • ${totalRepairs} lần sửa chữa`;
	},

	/**
	 * Format parts usage summary for repair estimates
	 *
	 * @param partName - Name of the part
	 * @param quantity - Quantity used
	 * @param totalCost - Total cost for this part line item
	 * @returns Formatted parts line item string
	 *
	 * @example
	 * ```typescript
	 * Business.formatPartsSummary("RAM DDR4 8GB", 2, 800000)
	 * // "RAM DDR4 8GB x2 = 800.000 ₫"
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatPartsSummary: (
		partName: string,
		quantity: number,
		totalCost: number
	): string => {
		return `${partName} x${quantity} = ${Currency.format(totalCost)}`;
	},

	/**
	 * Format inventory status with Vietnamese business context
	 *
	 * @param current - Current stock quantity
	 * @param minimum - Minimum stock threshold
	 * @returns Object with formatted text and status level
	 *
	 * @example
	 * ```typescript
	 * Business.formatInventoryStatus(0, 5)
	 * // { text: "Hết hàng", status: "out" }
	 *
	 * Business.formatInventoryStatus(3, 5)
	 * // { text: "Sắp hết (3 còn lại)", status: "low" }
	 *
	 * Business.formatInventoryStatus(10, 5)
	 * // { text: "Còn 10", status: "good" }
	 * ```
	 *
	 * @since 1.0.0
	 */
	formatInventoryStatus: (
		current: number,
		minimum: number
	): { text: string; status: "good" | "low" | "out" } => {
		if (current === 0) {
			return { text: "Hết hàng", status: "out" };
		} else if (current <= minimum) {
			return { text: `Sắp hết (${current} còn lại)`, status: "low" };
		} else {
			return { text: `Còn ${Numbers.format(current)}`, status: "good" };
		}
	},
};