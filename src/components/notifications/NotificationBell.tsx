/**
 * Notification Bell Component
 * Header notification bell with unread count and sliding panel
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	type RealtimeEvent,
	useRealtimeUpdates,
} from "@/hooks/use-realtime-updates";
import { cn } from "@/lib/utils";
import {
	Bell,
	BellRing,
	CheckCircle,
	FileText,
	Info,
	Wifi,
	WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationBellProps {
	className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
	const {
		events,
		connectionStatus,
		clearEvents,
		getRecentEvents,
		isConnected,
		isReconnecting,
		reconnect,
	} = useRealtimeUpdates();

	const [isOpen, setIsOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [lastViewedTimestamp, setLastViewedTimestamp] = useState(Date.now());

	// Calculate unread events
	useEffect(() => {
		const newEvents = events.filter(
			(event) => new Date(event.timestamp).getTime() > lastViewedTimestamp,
		);
		setUnreadCount(newEvents.length);
	}, [events, lastViewedTimestamp]);

	// Mark as read when panel opens
	useEffect(() => {
		if (isOpen) {
			setLastViewedTimestamp(Date.now());
			setUnreadCount(0);
		}
	}, [isOpen]);

	const recentEvents = getRecentEvents(60); // Last 60 minutes
	const displayEvents = events.slice(0, 20); // Show up to 20 events

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

	const formatEventTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffInMinutes < 1) return "Vừa xong";
		if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
		if (diffInMinutes < 1440)
			return `${Math.floor(diffInMinutes / 60)} giờ trước`;
		return date.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="sm" className={cn("relative", className)}>
					{unreadCount > 0 ? (
						<BellRing className="h-5 w-5" />
					) : (
						<Bell className="h-5 w-5" />
					)}

					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent className="w-96 sm:w-[400px] p-6">
				<SheetHeader className="pb-4">
					<SheetTitle className="flex items-center gap-3 text-lg">
						<BellRing className="h-5 w-5" />
						Thông báo real-time
					</SheetTitle>
					<SheetDescription className="flex items-center justify-between pt-2 pb-4">
						<span className="text-sm">Cập nhật trạng thái phiếu sửa chữa</span>
						<div className="flex items-center gap-2">
							{isConnected ? (
								<div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
									<Wifi className="h-3 w-3" />
									<span className="text-xs font-medium">Đã kết nối</span>
								</div>
							) : (
								<div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
									<WifiOff className="h-3 w-3" />
									<span className="text-xs font-medium">
										{isReconnecting ? "Đang kết nối lại..." : "Mất kết nối"}
									</span>
								</div>
							)}
						</div>
					</SheetDescription>
					<Separator />
				</SheetHeader>

				<div className="space-y-4">
					{/* Connection Status Section */}
					{(!isConnected || events.length > 0) && (
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2">
								<span className="text-sm font-medium">
									Hoạt động gần đây ({displayEvents.length})
								</span>
								<div className="flex gap-2">
									{!isConnected && (
										<Button
											variant="outline"
											size="sm"
											onClick={reconnect}
											disabled={isReconnecting}
											className="h-8 px-3"
										>
											Kết nối lại
										</Button>
									)}
									{events.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={clearEvents}
											className="h-8 px-3"
										>
											Xóa tất cả
										</Button>
									)}
								</div>
							</div>
							<Separator />
						</div>
					)}

					{/* Events List */}
					<div className="space-y-3 max-h-96 overflow-y-auto pr-2">
						{displayEvents.length === 0 ? (
							<div className="text-center py-12 px-4 text-muted-foreground">
								<Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
								<p className="font-medium mb-2">Chưa có thông báo nào</p>
								<p className="text-sm">
									Thông báo sẽ xuất hiện khi có cập nhật
								</p>
							</div>
						) : (
							<div className="space-y-0">
								{displayEvents.map((event, index) => (
									<div key={event.id}>
										<div className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
											<div className="flex-shrink-0 mt-1">
												{getEventIcon(event.type)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium leading-relaxed mb-2 group-hover:text-foreground">
													{event.message}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatEventTime(event.timestamp)}
												</p>
											</div>
										</div>
										{index < displayEvents.length - 1 && (
											<Separator className="my-2" />
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Recent Activity Summary */}
					{recentEvents.length > 0 && (
						<div className="space-y-4">
							<Separator />
							<div className="text-xs text-muted-foreground text-center px-4 py-3 bg-muted/30 rounded-lg">
								<div className="flex items-center justify-center gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
									<span className="font-medium">{recentEvents.length}</span>{" "}
									hoạt động trong 60 phút qua
								</div>
								{connectionStatus.connection_count > 1 && (
									<div className="mt-2 pt-2 border-t border-muted-foreground/20">
										<span className="text-muted-foreground/70">
											🔄 Kết nối lại {connectionStatus.connection_count} lần
										</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
