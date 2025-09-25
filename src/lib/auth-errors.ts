/**
 * Vietnamese localization for Supabase authentication errors
 * Maps English error messages to Vietnamese for repair shop staff
 */

export interface AuthError {
	message: string;
	code?: string;
	details?: string;
}

/**
 * Translates Supabase auth errors to Vietnamese
 */
export function translateAuthError(error: AuthError | Error | string): string {
	const message =
		typeof error === "string" ? error : error?.message || "Unknown error";

	const lowerMessage = message.toLowerCase();

	// Email validation errors
	if (
		lowerMessage.includes("invalid email") ||
		lowerMessage.includes("email is not valid")
	) {
		return "Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: admin@trinhanlaptop.vn).";
	}

	// Password errors
	if (
		lowerMessage.includes("invalid login credentials") ||
		lowerMessage.includes("invalid email or password")
	) {
		return "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.";
	}

	if (
		lowerMessage.includes("password is too short") ||
		lowerMessage.includes("password should be at least")
	) {
		return "Mật khẩu quá ngắn. Mật khẩu phải có ít nhất 6 ký tự.";
	}

	if (lowerMessage.includes("password is too weak")) {
		return "Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn với chữ hoa, chữ thường và số.";
	}

	// Account status errors
	if (
		lowerMessage.includes("email not confirmed") ||
		lowerMessage.includes("confirm your email")
	) {
		return "Tài khoản chưa được xác nhận. Vui lòng kiểm tra email và nhấp vào liên kết xác nhận.";
	}

	if (lowerMessage.includes("user not found")) {
		return "Không tìm thấy tài khoản với email này. Vui lòng liên hệ quản trị viên để tạo tài khoản.";
	}

	if (
		lowerMessage.includes("account is disabled") ||
		lowerMessage.includes("user is disabled")
	) {
		return "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
	}

	// Rate limiting
	if (
		lowerMessage.includes("rate limit") ||
		lowerMessage.includes("too many requests")
	) {
		return "Đăng nhập thất bại quá nhiều lần. Vui lòng chờ 5 phút trước khi thử lại.";
	}

	if (lowerMessage.includes("email rate limit")) {
		return "Gửi email quá nhiều lần. Vui lòng chờ trước khi yêu cầu email xác nhận mới.";
	}

	// Session and token errors
	if (lowerMessage.includes("jwt") || lowerMessage.includes("token")) {
		return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
	}

	if (
		lowerMessage.includes("not authenticated") ||
		lowerMessage.includes("authentication required")
	) {
		return "Bạn cần đăng nhập để sử dụng chức năng này.";
	}

	if (
		lowerMessage.includes("insufficient permissions") ||
		lowerMessage.includes("unauthorized")
	) {
		return "Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên.";
	}

	// Network and connectivity errors
	if (
		lowerMessage.includes("failed to fetch") ||
		lowerMessage.includes("network error")
	) {
		return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";
	}

	if (
		lowerMessage.includes("timeout") ||
		lowerMessage.includes("request timeout")
	) {
		return "Kết nối quá chậm. Vui lòng thử lại sau ít phút.";
	}

	// Server errors
	if (
		lowerMessage.includes("internal server error") ||
		lowerMessage.includes("500")
	) {
		return "Lỗi máy chủ. Hệ thống đang gặp sự cố, vui lòng thử lại sau.";
	}

	if (
		lowerMessage.includes("service unavailable") ||
		lowerMessage.includes("503")
	) {
		return "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau ít phút.";
	}

	// Password reset specific errors
	if (
		lowerMessage.includes("password reset") &&
		lowerMessage.includes("expired")
	) {
		return "Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu liên kết mới.";
	}

	if (lowerMessage.includes("invalid reset token")) {
		return "Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu liên kết mới.";
	}

	// Database constraint errors
	if (
		lowerMessage.includes("duplicate") ||
		lowerMessage.includes("already exists")
	) {
		return "Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập với tài khoản hiện có.";
	}

	if (
		lowerMessage.includes("foreign key") ||
		lowerMessage.includes("constraint")
	) {
		return "Không thể thực hiện thao tác do vi phạm ràng buộc dữ liệu. Vui lòng liên hệ quản trị viên.";
	}

	// Signup specific errors
	if (
		lowerMessage.includes("signup disabled") ||
		lowerMessage.includes("registration disabled")
	) {
		return "Đăng ký tài khoản mới đã bị tắt. Vui lòng liên hệ quản trị viên để được tạo tài khoản.";
	}

	// CAPTCHA errors
	if (
		lowerMessage.includes("captcha") ||
		lowerMessage.includes("verification")
	) {
		return "Xác minh bảo mật thất bại. Vui lòng thử lại.";
	}

	// Generic fallback
	if (message.length > 0) {
		return `Lỗi đăng nhập: ${message}. Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi tiếp tục xảy ra.`;
	}

	return "Đã xảy ra lỗi không xác định. Vui lòng thử lại hoặc liên hệ quản trị viên.";
}

/**
 * Vietnamese authentication success messages
 */
export const authSuccessMessages = {
	loginSuccess: "Đăng nhập thành công! Chào mừng bạn quay trở lại.",
	logoutSuccess: "Đã đăng xuất an toàn. Hẹn gặp lại!",
	passwordResetSent:
		"Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
	passwordResetSuccess:
		"Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.",
	emailConfirmed:
		"Email đã được xác nhận thành công! Bây giờ bạn có thể đăng nhập.",
	profileUpdated: "Thông tin cá nhân đã được cập nhật thành công.",
	accountCreated:
		"Tài khoản đã được tạo thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
} as const;

/**
 * Vietnamese form validation messages for authentication forms
 */
export const authValidationMessages = {
	emailRequired: "Vui lòng nhập địa chỉ email.",
	emailInvalid: "Định dạng email không hợp lệ.",
	passwordRequired: "Vui lòng nhập mật khẩu.",
	passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự.",
	passwordConfirmRequired: "Vui lòng xác nhận mật khẩu.",
	passwordsNoMatch: "Mật khẩu xác nhận không khớp.",
	fullNameRequired: "Vui lòng nhập họ tên đầy đủ.",
	phoneRequired: "Vui lòng nhập số điện thoại.",
	phoneInvalid: "Số điện thoại không hợp lệ (ví dụ đúng: 0901234567).",
} as const;

/**
 * Helper function to get appropriate validation message
 */
export function getValidationMessage(
	field: keyof typeof authValidationMessages,
): string {
	return authValidationMessages[field];
}

/**
 * Helper function to get appropriate success message
 */
export function getSuccessMessage(
	type: keyof typeof authSuccessMessages,
): string {
	return authSuccessMessages[type];
}
