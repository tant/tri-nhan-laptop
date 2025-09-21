import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export function NetworkStatus() {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [showOfflineMessage, setShowOfflineMessage] = useState(false);
	const [wasOffline, setWasOffline] = useState(false);

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			if (wasOffline) {
				// Show reconnection message briefly
				setShowOfflineMessage(true);
				setTimeout(() => setShowOfflineMessage(false), 3000);
				setWasOffline(false);
			}
		};

		const handleOffline = () => {
			setIsOnline(false);
			setShowOfflineMessage(true);
			setWasOffline(true);
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Show offline message if starting offline
		if (!navigator.onLine) {
			setShowOfflineMessage(true);
			setWasOffline(true);
		}

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [wasOffline]);

	const handleDismiss = () => {
		setShowOfflineMessage(false);
	};

	const handleRetry = () => {
		window.location.reload();
	};

	if (!showOfflineMessage) return null;

	return (
		<div className="fixed top-4 right-4 z-50 max-w-sm">
			{!isOnline ? (
				<Alert variant="destructive">
					<WifiOff className="h-4 w-4" />
					<AlertDescription className="space-y-2">
						<div className="font-medium">Mất kết nối mạng</div>
						<p className="text-sm">
							Không thể kết nối đến internet. Một số tính năng có thể không hoạt động.
						</p>
						<div className="flex gap-2">
							<Button size="sm" variant="outline" onClick={handleRetry}>
								<RefreshCw className="h-3 w-3 mr-1" />
								Thử lại
							</Button>
							<Button size="sm" variant="ghost" onClick={handleDismiss}>
								Đóng
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			) : (
				<Alert className="border-green-200 bg-green-50">
					<Wifi className="h-4 w-4 text-green-600" />
					<AlertDescription className="space-y-2">
						<div className="font-medium text-green-800">Đã kết nối lại</div>
						<p className="text-sm text-green-700">
							Kết nối mạng đã được khôi phục. Tất cả tính năng hoạt động bình thường.
						</p>
						<Button size="sm" variant="ghost" onClick={handleDismiss}>
							Đóng
						</Button>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

// Hook to get current network status
export function useNetworkStatus() {
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	return isOnline;
}