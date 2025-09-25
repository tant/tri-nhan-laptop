/**
 * Real-time Notifications Component
 * Displays live status updates and system notifications
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	type RealtimeEvent,
	useRealtimeUpdates,
} from "@/hooks/use-realtime-updates";
import { cn } from "@/lib/utils";
import {
	Bell,
	BellRing,
	CheckCircle,
	Clock,
	FileText,
	Info,
	Wifi,
	WifiOff,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RealtimeNotificationsProps {
	maxItems?: number;
	showConnectionStatus?: boolean;
	className?: string;
}

export function RealtimeNotifications({
	maxItems = 5,
	showConnectionStatus = true,
	className,
}: RealtimeNotificationsProps) {
	const {
		events,
		connectionStatus,
		clearEvents,
		getRecentEvents,
		isConnected,
		isReconnecting,
		reconnect,
	} = useRealtimeUpdates();

	const [isExpanded, setIsExpanded] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [lastViewedTimestamp, setLastViewedTimestamp] = useState(Date.now());

	// Calculate unread events
	useEffect(() => {
		const newEvents = events.filter(
			(event) => new Date(event.timestamp).getTime() > lastViewedTimestamp,
		);
		setUnreadCount(newEvents.length);
	}, [events, lastViewedTimestamp]);

	// Mark as read when expanded
	useEffect(() => {
		if (isExpanded) {
			setLastViewedTimestamp(Date.now());
			setUnreadCount(0);
		}
	}, [isExpanded]);

	const recentEvents = getRecentEvents(30); // Last 30 minutes
	const displayEvents = isExpanded
		? events.slice(0, maxItems * 2)
		: recentEvents.slice(0, maxItems);

	const getEventIcon = (type: RealtimeEvent["type"]) => {
		switch (type) {
			case "ticket_created":
				return <FileText className="h-4 w-4 text-blue-500" />;
			case "status_changed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "ticket_updated":
				return <Info className="h-4 w-4 text-orange-500" />;
			case "notification_sent":
				return <BellRing className="h-4 w-4 text-purple-500" />;
			default:
				return <Info className="h-4 w-4 text-gray-500" />;
		}
	};

	const getEventBadgeVariant = (type: RealtimeEvent["type"]) => {
		switch (type) {
			case "ticket_created":
				return "default";
			case "status_changed":
				return "secondary";
			case "ticket_updated":
				return "outline";
			case "notification_sent":
				return "secondary";
			default:
				return "outline";
		}
	};

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString("vi-VN", {
			timeZone: "Asia/Ho_Chi_Minh",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatRelativeTime = (timestamp: string) => {
		const now = new Date();
		const eventTime = new Date(timestamp);
		const diffMs = now.getTime() - eventTime.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));

		if (diffMinutes < 1) return "Vừa xong";
		if (diffMinutes < 60) return `${diffMinutes} phút trước`;

		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) return `${diffHours} giờ trước`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} ngày trước`;
	};

	return (
		<div className={cn("relative", className)}>
			{/* Connection Status */}
			{showConnectionStatus && (
				<div className="mb-2 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						{isConnected ? (
							<>
								<Wifi className="h-4 w-4 text-green-500" />
								<span className="text-sm text-green-600 font-medium">
									Kết nối real-time
								</span>
							</>
						) : (
							<>
								<WifiOff className="h-4 w-4 text-red-500" />
								<span className="text-sm text-red-600 font-medium">
									{isReconnecting ? "Đang kết nối lại..." : "Mất kết nối"}
								</span>
								{!isReconnecting && (
									<Button
										variant="outline"
										size="sm"
										onClick={reconnect}
										className="ml-2 h-6 text-xs"
									>
										Kết nối lại
									</Button>
								)}
							</>
						)}
					</div>

					{connectionStatus.error && (
						<div className="text-xs text-red-500">{connectionStatus.error}</div>
					)}
				</div>
			)}

			{/* Notification Bell */}
			<div className="flex items-center justify-between mb-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsExpanded(!isExpanded)}
					className="relative"
				>
					<Bell className="h-4 w-4 mr-2" />
					Thông báo
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</Button>

				<div className="flex items-center space-x-2">
					<Badge variant="outline" className="text-xs">
						{displayEvents.length} sự kiện
					</Badge>
					{events.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearEvents}
							className="h-6 px-2 text-xs"
						>
							<X className="h-3 w-3 mr-1" />
							Xóa
						</Button>
					)}
				</div>
			</div>

			{/* Events List */}
			{(isExpanded || recentEvents.length > 0) && (
				<Card className="max-h-96 overflow-y-auto">
					<CardContent className="p-3 space-y-2">
						{displayEvents.length === 0 ? (
							<div className="text-center py-4 text-gray-500">
								<Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
								<p className="text-sm">Chưa có thông báo nào</p>
							</div>
						) : (
							displayEvents.map((event) => (
								<div
									key={event.id}
									className="flex items-start space-x-3 p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
								>
									{getEventIcon(event.type)}

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<Badge
												variant={getEventBadgeVariant(event.type)}
												className="text-xs"
											>
												{event.type === "ticket_created" && "Phiếu mới"}
												{event.type === "status_changed" && "Thay đổi"}
												{event.type === "ticket_updated" && "Cập nhật"}
												{event.type === "notification_sent" && "Thông báo"}
											</Badge>

											<div className="flex items-center space-x-2 text-xs text-gray-500">
												<span>{formatTime(event.timestamp)}</span>
												<span>•</span>
												<span>{formatRelativeTime(event.timestamp)}</span>
											</div>
										</div>

										<p className="text-sm text-gray-900 font-medium mb-1">
											{event.message}
										</p>

										{event.data.ticket_code && (
											<p className="text-xs text-gray-600 font-mono">
												{event.data.ticket_code}
											</p>
										)}
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			)}

			{/* Show more button */}
			{!isExpanded && events.length > maxItems && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsExpanded(true)}
					className="w-full mt-2 text-xs"
				>
					Xem thêm ({events.length - maxItems} thông báo khác)
				</Button>
			)}
		</div>
	);
}

/**
 * Compact notification indicator for header/toolbar
 */
export function NotificationIndicator() {
	const { getRecentEvents, isConnected } = useRealtimeUpdates();
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		const recent = getRecentEvents(5); // Last 5 minutes
		setUnreadCount(recent.length);
	}, [getRecentEvents]);

	return (
		<div className="relative">
			<Button variant="ghost" size="sm">
				<Bell
					className={cn(
						"h-4 w-4",
						unreadCount > 0 ? "text-blue-600" : "text-gray-500",
					)}
				/>
			</Button>

			{unreadCount > 0 && (
				<Badge
					variant="destructive"
					className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
				>
					{unreadCount > 9 ? "9+" : unreadCount}
				</Badge>
			)}

			{/* Connection status dot */}
			<div
				className={cn(
					"absolute -bottom-1 -right-1 h-2 w-2 rounded-full",
					isConnected ? "bg-green-400" : "bg-red-400",
				)}
			/>
		</div>
	);
}
