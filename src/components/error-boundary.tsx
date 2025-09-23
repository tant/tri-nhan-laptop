import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { translateAuthError } from "@/lib/auth-errors";
import { AlertTriangle, RefreshCw, Server, WifiOff } from "lucide-react";
import {
	Component,
	type ErrorInfo,
	type ReactNode,
	useEffect,
	useState,
} from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	retryCount: number;
	isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		retryCount: 0,
		isRetrying: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error, retryCount: 0, isRetrying: false };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	private handleRetry = async () => {
		const maxRetries = 3;
		const { retryCount } = this.state;

		if (retryCount >= maxRetries) {
			return;
		}

		this.setState({ isRetrying: true });

		// Add exponential backoff delay
		const delay = Math.min(1000 * 2 ** retryCount, 5000);
		await new Promise((resolve) => setTimeout(resolve, delay));

		this.setState({
			hasError: false,
			error: undefined,
			retryCount: retryCount + 1,
			isRetrying: false,
		});
	};

	private getErrorType = (error: Error): "network" | "server" | "client" => {
		const message = error.message.toLowerCase();
		if (
			message.includes("fetch") ||
			message.includes("network") ||
			message.includes("connection")
		) {
			return "network";
		}
		if (
			message.includes("500") ||
			message.includes("502") ||
			message.includes("503")
		) {
			return "server";
		}
		return "client";
	};

	private getErrorIcon = (errorType: "network" | "server" | "client") => {
		switch (errorType) {
			case "network":
				return WifiOff;
			case "server":
				return Server;
			default:
				return AlertTriangle;
		}
	};

	private getErrorTitle = (
		errorType: "network" | "server" | "client",
	): string => {
		switch (errorType) {
			case "network":
				return "Lỗi kết nối mạng";
			case "server":
				return "Lỗi máy chủ";
			default:
				return "Đã xảy ra lỗi";
		}
	};

	private getErrorMessage = (
		errorType: "network" | "server" | "client",
	): string => {
		switch (errorType) {
			case "network":
				return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";
			case "server":
				return "Máy chủ đang gặp sự cố. Chúng tôi đang khắc phục và sẽ hoạt động trở lại sớm.";
			default:
				return "Ứng dụng đã gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi tiếp tục xảy ra.";
		}
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const errorType = this.state.error
				? this.getErrorType(this.state.error)
				: "client";
			const ErrorIcon = this.getErrorIcon(errorType);
			const maxRetries = 3;
			const canRetry = this.state.retryCount < maxRetries;

			return (
				<div className="min-h-screen flex items-center justify-center p-4">
					<div className="max-w-md w-full space-y-4">
						<Alert variant="destructive">
							<ErrorIcon className="h-4 w-4" />
							<AlertDescription className="space-y-2">
								<div className="font-medium">
									{this.getErrorTitle(errorType)}
								</div>
								<p>{this.getErrorMessage(errorType)}</p>

								{this.state.retryCount > 0 && (
									<div className="text-sm opacity-75">
										Đã thử lại: {this.state.retryCount}/{maxRetries}
									</div>
								)}

								{this.state.error && (
									<details className="mt-2">
										<summary className="cursor-pointer text-sm opacity-75">
											Chi tiết lỗi
										</summary>
										<pre className="mt-1 text-xs bg-red-50 p-2 rounded border overflow-auto">
											{this.state.error.message}
										</pre>
									</details>
								)}
							</AlertDescription>
						</Alert>
						<div className="flex gap-2 justify-center">
							{canRetry && (
								<Button
									onClick={this.handleRetry}
									variant="outline"
									disabled={this.state.isRetrying}
								>
									<RefreshCw
										className={`h-4 w-4 mr-2 ${this.state.isRetrying ? "animate-spin" : ""}`}
									/>
									{this.state.isRetrying ? "Đang thử lại..." : "Thử lại"}
								</Button>
							)}
							<Button
								onClick={() => window.location.reload()}
								variant="default"
							>
								Tải lại trang
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Functional error boundary hook for React 19
export function useErrorHandler() {
	return (error: Error, errorInfo?: ErrorInfo) => {
		console.error("Application error:", error, errorInfo);
		// Could integrate with error reporting service here
	};
}

// Enhanced Supabase-specific error handler with auto-retry
export function SupabaseErrorAlert({
	error,
	onRetry,
	onDismiss,
	autoRetry = false,
	maxRetries = 3,
}: {
	error: any;
	onRetry?: () => void;
	onDismiss?: () => void;
	autoRetry?: boolean;
	maxRetries?: number;
}) {
	const [retryCount, setRetryCount] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);
	const [isOnline, setIsOnline] = useState(navigator.onLine ?? true);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	// Auto-retry for network errors when connection is restored
	useEffect(() => {
		if (
			autoRetry &&
			isOnline &&
			isNetworkError(error) &&
			retryCount < maxRetries &&
			onRetry
		) {
			const timer = setTimeout(() => {
				handleRetry();
			}, 2000); // Wait 2 seconds after connection is restored

			return () => clearTimeout(timer);
		}
	}, [isOnline, autoRetry, error, retryCount, maxRetries, onRetry]);

	const isNetworkError = (error: any): boolean => {
		const message = error?.message?.toLowerCase() || "";
		return (
			message.includes("failed to fetch") ||
			message.includes("network") ||
			message.includes("connection") ||
			message.includes("timeout")
		);
	};

	const handleRetry = async () => {
		if (!onRetry || retryCount >= maxRetries) return;

		setIsRetrying(true);
		setRetryCount((prev) => prev + 1);

		// Exponential backoff
		const delay = Math.min(1000 * 2 ** retryCount, 5000);
		await new Promise((resolve) => setTimeout(resolve, delay));

		try {
			await onRetry();
		} catch (err) {
			console.error("Retry failed:", err);
		} finally {
			setIsRetrying(false);
		}
	};

	const getErrorMessage = (error: any): string => {
		// Use the comprehensive Vietnamese translation utility
		return translateAuthError(error);
	};

	const networkError = isNetworkError(error);
	const canRetry = onRetry && retryCount < maxRetries;

	return (
		<Alert variant="destructive" className="mb-4">
			{networkError ? (
				<WifiOff className="h-4 w-4" />
			) : (
				<AlertTriangle className="h-4 w-4" />
			)}
			<AlertDescription className="space-y-2">
				<div className="font-medium">
					{networkError ? "Lỗi kết nối" : "Lỗi thao tác"}
				</div>
				<p>{getErrorMessage(error)}</p>

				{!isOnline && (
					<div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border">
						⚠️ Không có kết nối mạng. Vui lòng kiểm tra kết nối internet.
					</div>
				)}

				{autoRetry && networkError && (
					<div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border">
						🔄 Sẽ tự động thử lại khi có kết nối mạng.
					</div>
				)}

				{retryCount > 0 && (
					<div className="text-sm opacity-75">
						Đã thử lại: {retryCount}/{maxRetries}
					</div>
				)}

				<div className="flex gap-2 mt-3">
					{canRetry && (
						<Button
							size="sm"
							variant="outline"
							onClick={handleRetry}
							disabled={isRetrying || !isOnline}
						>
							<RefreshCw
								className={`h-3 w-3 mr-1 ${isRetrying ? "animate-spin" : ""}`}
							/>
							{isRetrying ? "Đang thử lại..." : "Thử lại"}
						</Button>
					)}
					{onDismiss && (
						<Button size="sm" variant="ghost" onClick={onDismiss}>
							Đóng
						</Button>
					)}
				</div>
			</AlertDescription>
		</Alert>
	);
}
