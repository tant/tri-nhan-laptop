/**
 * Consistent Error Handling Utilities
 * Standardized error handling patterns for the Vietnamese Laptop Repair Shop system
 */

import type { PostgrestError } from "@supabase/supabase-js";

export interface ErrorInfo {
	message: string;
	code?: string;
	details?: unknown;
	isUserFriendly: boolean;
}

export interface ErrorResult {
	error: ErrorInfo;
	shouldLog: boolean;
	shouldNotify: boolean;
}

/**
 * Map Supabase error codes to Vietnamese user-friendly messages
 */
const SUPABASE_ERROR_MAP: Record<string, string> = {
	// Authentication errors
	invalid_credentials: "Thông tin đăng nhập không chính xác",
	email_not_confirmed: "Email chưa được xác nhận",
	user_not_found: "Không tìm thấy người dùng",
	invalid_grant: "Phiên đăng nhập đã hết hạn",
	signup_disabled: "Đăng ký tài khoản đã bị tắt",

	// Database errors
	PGRST116: "Không tìm thấy dữ liệu",
	"23505": "Dữ liệu đã tồn tại trong hệ thống",
	"23503": "Không thể xóa do có dữ liệu liên quan",
	"23502": "Thiếu thông tin bắt buộc",
	"23514": "Dữ liệu không hợp lệ",
	"42P01": "Bảng dữ liệu không tồn tại",
	"42703": "Trường dữ liệu không tồn tại",

	// Network errors
	network_error: "Lỗi kết nối mạng",
	timeout: "Hết thời gian chờ",
	fetch_error: "Không thể tải dữ liệu",

	// Business logic errors
	insufficient_permissions: "Không có quyền thực hiện thao tác này",
	resource_not_found: "Không tìm thấy tài nguyên",
	validation_failed: "Dữ liệu không hợp lệ",
	operation_failed: "Thao tác không thành công",
};

/**
 * Generic error messages for fallback
 */
const GENERIC_ERRORS = {
	database: "Lỗi cơ sở dữ liệu",
	network: "Lỗi kết nối mạng",
	validation: "Dữ liệu không hợp lệ",
	permission: "Không có quyền truy cập",
	unknown: "Lỗi không xác định",
};

/**
 * Business context error messages
 */
const BUSINESS_ERRORS = {
	// Customer errors
	customer_not_found: "Không tìm thấy thông tin khách hàng",
	customer_phone_exists: "Số điện thoại này đã được sử dụng",
	customer_has_active_repairs: "Khách hàng còn phiếu sửa chữa đang thực hiện",

	// Repair ticket errors
	ticket_not_found: "Không tìm thấy phiếu sửa chữa",
	ticket_status_invalid: "Trạng thái phiếu sửa chữa không hợp lệ",
	ticket_cannot_edit: "Không thể chỉnh sửa phiếu này",
	ticket_already_completed: "Phiếu sửa chữa đã hoàn thành",

	// Parts errors
	part_not_found: "Không tìm thấy linh kiện",
	part_insufficient_stock: "Không đủ tồn kho",
	part_already_reserved: "Linh kiện đã được đặt trước",

	// User errors
	user_not_found: "Không tìm thấy người dùng",
	technician_not_available: "Kỹ thuật viên không khả dụng",
	unauthorized_action: "Không có quyền thực hiện thao tác này",
};

/**
 * Process different types of errors into standardized format
 */
export function processError(error: unknown, context?: string): ErrorResult {
	// Handle Supabase PostgrestError
	if (isPostgrestError(error)) {
		return processPostgrestError(error, context);
	}

	// Handle standard JavaScript Error
	if (error instanceof Error) {
		return processJavaScriptError(error, context);
	}

	// Handle string errors
	if (typeof error === "string") {
		return processStringError(error, context);
	}

	// Handle unknown error types
	return {
		error: {
			message: GENERIC_ERRORS.unknown,
			details: error,
			isUserFriendly: true,
		},
		shouldLog: true,
		shouldNotify: true,
	};
}

/**
 * Process Supabase PostgrestError
 */
function processPostgrestError(
	error: PostgrestError,
	context?: string,
): ErrorResult {
	const code = error.code;
	const message = SUPABASE_ERROR_MAP[code] || error.message;

	return {
		error: {
			message: addContext(message, context),
			code: error.code,
			details: error.details,
			isUserFriendly: true,
		},
		shouldLog: true,
		shouldNotify: !["PGRST116"].includes(code), // Don't notify for "not found" errors
	};
}

/**
 * Process standard JavaScript Error
 */
function processJavaScriptError(error: Error, context?: string): ErrorResult {
	// Check for business logic errors first
	const businessError =
		BUSINESS_ERRORS[error.message as keyof typeof BUSINESS_ERRORS];
	if (businessError) {
		return {
			error: {
				message: addContext(businessError, context),
				code: error.message,
				details: error.stack,
				isUserFriendly: true,
			},
			shouldLog: true,
			shouldNotify: true,
		};
	}

	// Check for known error patterns
	if (error.message.includes("fetch")) {
		return {
			error: {
				message: addContext(GENERIC_ERRORS.network, context),
				details: error.message,
				isUserFriendly: true,
			},
			shouldLog: true,
			shouldNotify: true,
		};
	}

	if (error.message.includes("validation")) {
		return {
			error: {
				message: addContext(GENERIC_ERRORS.validation, context),
				details: error.message,
				isUserFriendly: true,
			},
			shouldLog: false, // Validation errors are expected
			shouldNotify: false,
		};
	}

	// Generic error handling
	return {
		error: {
			message: addContext(error.message || GENERIC_ERRORS.unknown, context),
			details: error.stack,
			isUserFriendly: false, // Raw error messages may not be user-friendly
		},
		shouldLog: true,
		shouldNotify: true,
	};
}

/**
 * Process string errors
 */
function processStringError(error: string, context?: string): ErrorResult {
	// Check if it's a business error key
	const businessError = BUSINESS_ERRORS[error as keyof typeof BUSINESS_ERRORS];
	if (businessError) {
		return {
			error: {
				message: addContext(businessError, context),
				code: error,
				isUserFriendly: true,
			},
			shouldLog: false,
			shouldNotify: true,
		};
	}

	return {
		error: {
			message: addContext(error, context),
			isUserFriendly: false,
		},
		shouldLog: true,
		shouldNotify: true,
	};
}

/**
 * Add context to error message
 */
function addContext(message: string, context?: string): string {
	if (!context) return message;
	return `${context}: ${message}`;
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		"message" in error &&
		"details" in error
	);
}

/**
 * Create standardized error for common scenarios
 */
export const createError = {
	notFound: (resource: string) => new Error(`${resource}_not_found`),
	validation: (field: string, reason: string) =>
		new Error(`Trường ${field}: ${reason}`),
	permission: (action: string) => new Error(`Không có quyền ${action}`),
	business: (code: keyof typeof BUSINESS_ERRORS) => new Error(code),
	network: (details?: string) =>
		new Error(`Lỗi kết nối${details ? `: ${details}` : ""}`),
};

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: unknown, context?: string): string {
	const result = processError(error, context);
	return result.error.message;
}

/**
 * Format error for logging (with technical details)
 */
export function formatErrorForLogging(
	error: unknown,
	context?: string,
): string {
	const result = processError(error, context);
	const { message, code, details } = result.error;

	let logMessage = `Error: ${message}`;
	if (code) logMessage += ` (Code: ${code})`;
	if (context) logMessage += ` (Context: ${context})`;
	if (details && typeof details === "string") {
		logMessage += `\nDetails: ${details}`;
	}

	return logMessage;
}

/**
 * Handle async operation with consistent error processing
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	context?: string,
): Promise<{ data?: T; error?: ErrorInfo }> {
	try {
		const data = await operation();
		return { data };
	} catch (err) {
		const result = processError(err, context);

		// Log if needed
		if (result.shouldLog) {
			console.error(formatErrorForLogging(err, context));
		}

		return { error: result.error };
	}
}

/**
 * React hook-friendly error handler
 */
export function useErrorHandler() {
	return {
		processError,
		getErrorMessage,
		createError,
		withErrorHandling,
		formatErrorForLogging,
	};
}
