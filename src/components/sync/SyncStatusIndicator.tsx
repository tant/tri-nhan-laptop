/**
 * Sync Status Indicator Component
 * Shows real-time connection status, sync quality, and conflict information
 */

import { useSyncManager } from "@/hooks/use-sync-manager";
import { cn } from "@/lib/utils";
import React from "react";

interface SyncStatusIndicatorProps {
	className?: string;
	showDetails?: boolean;
	position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
}

export function SyncStatusIndicator({
	className,
	showDetails = false,
	position = "top-right",
}: SyncStatusIndicatorProps) {
	const {
		connectionState,
		syncStats,
		activeSessions,
		hasUnresolvedConflicts,
		isConnected,
		isReconnecting,
	} = useSyncManager();

	const getStatusColor = () => {
		if (hasUnresolvedConflicts) return "text-amber-500";

		switch (connectionState.status) {
			case "connected":
				return connectionState.quality === "excellent"
					? "text-green-500"
					: connectionState.quality === "good"
						? "text-green-400"
						: connectionState.quality === "poor"
							? "text-yellow-500"
							: "text-orange-500";
			case "connecting":
			case "reconnecting":
				return "text-blue-500";
			case "disconnected":
				return "text-gray-400";
			case "error":
				return "text-red-500";
			default:
				return "text-gray-400";
		}
	};

	const getStatusIcon = () => {
		if (hasUnresolvedConflicts) return "⚠️";
		if (isReconnecting) return "🔄";
		if (!isConnected) return "❌";

		switch (connectionState.quality) {
			case "excellent":
				return "🟢";
			case "good":
				return "🟡";
			case "poor":
				return "🟠";
			case "unstable":
				return "🔴";
			default:
				return "⚪";
		}
	};

	const getStatusText = () => {
		if (hasUnresolvedConflicts) return "Có xung đột";

		switch (connectionState.status) {
			case "connected":
				return "Đã kết nối";
			case "connecting":
				return "Đang kết nối...";
			case "reconnecting":
				return "Đang kết nối lại...";
			case "disconnected":
				return "Mất kết nối";
			case "error":
				return "Lỗi kết nối";
			default:
				return "Không xác định";
		}
	};

	const formatLatency = (latency: number) => {
		if (latency < 100) return `${latency}ms (Xuất sắc)`;
		if (latency < 300) return `${latency}ms (Tốt)`;
		if (latency < 1000) return `${latency}ms (Chậm)`;
		return `${latency}ms (Rất chậm)`;
	};

	const formatUptime = (uptime: number) => {
		const hours = Math.floor(uptime / (1000 * 60 * 60));
		const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

		if (hours > 0) return `${hours}h ${minutes}m`;
		if (minutes > 0) return `${minutes}m ${seconds}s`;
		return `${seconds}s`;
	};

	const positionClasses = {
		"top-right": "top-4 right-4",
		"bottom-right": "bottom-4 right-4",
		"top-left": "top-4 left-4",
		"bottom-left": "bottom-4 left-4",
	};

	return (
		<div
			className={cn(
				"fixed z-50 transition-all duration-200",
				positionClasses[position],
				className,
			)}
		>
			<div
				className={cn(
					"bg-white dark:bg-gray-800 rounded-lg shadow-lg border",
					"p-3 min-w-48",
					showDetails ? "max-w-80" : "max-w-48",
				)}
			>
				{/* Status Header */}
				<div className="flex items-center gap-2 mb-2">
					<span className="text-lg">{getStatusIcon()}</span>
					<div className="flex-1">
						<div className={cn("font-medium text-sm", getStatusColor())}>
							{getStatusText()}
						</div>
						{connectionState.latency > 0 && (
							<div className="text-xs text-gray-500">
								{formatLatency(connectionState.latency)}
							</div>
						)}
					</div>
				</div>

				{/* Connection Details */}
				{showDetails && isConnected && (
					<>
						<div className="border-t pt-2 mt-2 space-y-1">
							{/* Active Sessions */}
							<div className="flex justify-between text-xs">
								<span className="text-gray-600">Phiên hoạt động:</span>
								<span className="font-medium">{activeSessions.length}</span>
							</div>

							{/* Sync Stats */}
							<div className="flex justify-between text-xs">
								<span className="text-gray-600">Sự kiện nhận:</span>
								<span className="font-medium">{syncStats.events_received}</span>
							</div>

							<div className="flex justify-between text-xs">
								<span className="text-gray-600">Sự kiện gửi:</span>
								<span className="font-medium">{syncStats.events_sent}</span>
							</div>

							{/* Connection Uptime */}
							<div className="flex justify-between text-xs">
								<span className="text-gray-600">Thời gian kết nối:</span>
								<span className="font-medium">
									{formatUptime(syncStats.connection_uptime)}
								</span>
							</div>

							{/* Sync Lag */}
							{syncStats.sync_lag > 0 && (
								<div className="flex justify-between text-xs">
									<span className="text-gray-600">Độ trễ đồng bộ:</span>
									<span
										className={cn(
											"font-medium",
											syncStats.sync_lag < 100
												? "text-green-600"
												: syncStats.sync_lag < 500
													? "text-yellow-600"
													: "text-red-600",
										)}
									>
										{syncStats.sync_lag}ms
									</span>
								</div>
							)}

							{/* Conflicts */}
							{syncStats.conflicts_resolved > 0 && (
								<div className="flex justify-between text-xs">
									<span className="text-gray-600">Xung đột đã giải quyết:</span>
									<span className="font-medium text-blue-600">
										{syncStats.conflicts_resolved}
									</span>
								</div>
							)}
						</div>

						{/* Active Sessions List */}
						{activeSessions.length > 1 && (
							<div className="border-t pt-2 mt-2">
								<div className="text-xs font-medium text-gray-700 mb-1">
									Người dùng đang online:
								</div>
								<div className="space-y-1 max-h-24 overflow-y-auto">
									{activeSessions.slice(0, 5).map((session) => (
										<div
											key={session.id}
											className="flex items-center gap-2 text-xs"
										>
											<div className="w-2 h-2 bg-green-400 rounded-full" />
											<span className="font-medium">{session.user_name}</span>
											<span className="text-gray-500 text-xs">
												{session.context.current_page &&
													(session.context.current_page.split("/").pop() ||
														"dashboard")}
											</span>
										</div>
									))}
									{activeSessions.length > 5 && (
										<div className="text-xs text-gray-500 text-center">
											+{activeSessions.length - 5} khác
										</div>
									)}
								</div>
							</div>
						)}
					</>
				)}

				{/* Error Details */}
				{connectionState.error_message && (
					<div className="border-t pt-2 mt-2">
						<div className="text-xs text-red-600 bg-red-50 p-2 rounded">
							<div className="font-medium">Lỗi:</div>
							<div>{connectionState.error_message}</div>
						</div>
					</div>
				)}

				{/* Conflicts Warning */}
				{hasUnresolvedConflicts && (
					<div className="border-t pt-2 mt-2">
						<div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
							<div className="font-medium">⚠️ Có xung đột cần giải quyết</div>
							<div>Kiểm tra bảng điều khiển để giải quyết</div>
						</div>
					</div>
				)}

				{/* Reconnection Status */}
				{isReconnecting && (
					<div className="border-t pt-2 mt-2">
						<div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
							<div className="animate-spin">🔄</div>
							<div>Đang thử kết nối lại...</div>
						</div>
					</div>
				)}

				{/* Last Sync Time */}
				{syncStats.last_sync && isConnected && (
					<div className="border-t pt-2 mt-1">
						<div className="text-xs text-gray-500 text-center">
							Đồng bộ lần cuối:{" "}
							{new Date(syncStats.last_sync).toLocaleTimeString("vi-VN")}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Compact version for mobile/small screens
export function CompactSyncStatusIndicator({
	className,
}: { className?: string }) {
	const {
		isConnected,
		isReconnecting,
		hasUnresolvedConflicts,
		connectionState,
	} = useSyncManager();

	return (
		<div className={cn("flex items-center gap-1", className)}>
			<div
				className={cn(
					"w-2 h-2 rounded-full",
					hasUnresolvedConflicts
						? "bg-amber-500"
						: isReconnecting
							? "bg-blue-500 animate-pulse"
							: isConnected
								? "bg-green-500"
								: "bg-red-500",
				)}
			/>

			<span
				className={cn(
					"text-xs",
					hasUnresolvedConflicts
						? "text-amber-600"
						: isReconnecting
							? "text-blue-600"
							: isConnected
								? "text-green-600"
								: "text-red-600",
				)}
			>
				{hasUnresolvedConflicts
					? "Xung đột"
					: isReconnecting
						? "Đang kết nối..."
						: isConnected
							? "Online"
							: "Offline"}
			</span>

			{connectionState.latency > 0 && isConnected && (
				<span className="text-xs text-gray-500">
					{connectionState.latency}ms
				</span>
			)}
		</div>
	);
}
