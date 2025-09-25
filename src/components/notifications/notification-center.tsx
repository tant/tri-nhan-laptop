import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	type NotificationMessage,
	useNotifications,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import {
	Bell,
	BellRing,
	Check,
	CheckCheck,
	Info,
	Package,
	Settings,
	Star,
	Trash2,
	Wrench,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationCenterProps {
	userId?: string;
	className?: string;
}

export function NotificationCenter({
	userId,
	className,
}: NotificationCenterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [showUnreadOnly, setShowUnreadOnly] = useState(false);

	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		removeNotification,
		clearAll,
		requestNotificationPermission,
	} = useNotifications(userId);

	// Request notification permission on mount
	useEffect(() => {
		requestNotificationPermission();
	}, [requestNotificationPermission]);

	const filteredNotifications = showUnreadOnly
		? notifications.filter((n) => !n.read)
		: notifications;

	const getNotificationIcon = (type: NotificationMessage["type"]) => {
		const iconMap = {
			repair_status: Wrench,
			new_repair: Wrench,
			low_stock: Package,
			feedback: Star,
			system: Settings,
		};
		return iconMap[type] || Info;
	};

	const getPriorityColor = (priority: NotificationMessage["priority"]) => {
		const colorMap = {
			low: "text-gray-500",
			normal: "text-blue-500",
			high: "text-orange-500",
			urgent: "text-red-500",
		};
		return colorMap[priority];
	};

	const getPriorityBadge = (priority: NotificationMessage["priority"]) => {
		if (priority === "low" || priority === "normal") return null;

		const badgeMap = {
			high: { variant: "secondary" as const, text: "Quan trọng" },
			urgent: { variant: "destructive" as const, text: "Khẩn cấp" },
		};

		const badge = badgeMap[priority];
		return badge ? (
			<Badge variant={badge.variant} className="text-xs">
				{badge.text}
			</Badge>
		) : null;
	};

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInMinutes < 1) return "Vừa xong";
		if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
		if (diffInHours < 24) return `${diffInHours} giờ trước`;
		if (diffInDays < 7) return `${diffInDays} ngày trước`;

		return date.toLocaleDateString("vi-VN");
	};

	const handleNotificationClick = (notification: NotificationMessage) => {
		if (!notification.read) {
			markAsRead(notification.id);
		}
	};

	return (
		<div className={cn("relative", className)}>
			{/* Notification Bell Button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="relative"
			>
				{unreadCount > 0 ? (
					<BellRing className="h-5 w-5 text-[#299fce]" />
				) : (
					<Bell className="h-5 w-5" />
				)}

				{unreadCount > 0 && (
					<Badge
						variant="destructive"
						className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
					>
						{unreadCount > 99 ? "99+" : unreadCount}
					</Badge>
				)}
			</Button>

			{/* Notification Panel */}
			{isOpen && (
				<Card className="absolute right-0 top-12 w-96 max-h-[600px] shadow-lg border-[#299fce]/20 z-50">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg">Thông báo</CardTitle>
								<CardDescription>
									{unreadCount > 0
										? `${unreadCount} thông báo chưa đọc`
										: "Tất cả đã đọc"}
								</CardDescription>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsOpen(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>

						{/* Action Buttons */}
						{notifications.length > 0 && (
							<div className="flex gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowUnreadOnly(!showUnreadOnly)}
									className="flex-1"
								>
									{showUnreadOnly ? "Tất cả" : "Chưa đọc"}
								</Button>

								{unreadCount > 0 && (
									<Button variant="outline" size="sm" onClick={markAllAsRead}>
										<CheckCheck className="h-4 w-4 mr-1" />
										Đánh dấu đã đọc
									</Button>
								)}

								<Button variant="outline" size="sm" onClick={clearAll}>
									<Trash2 className="h-4 w-4 mr-1" />
									Xóa tất cả
								</Button>
							</div>
						)}
					</CardHeader>

					<Separator />

					<CardContent className="p-0">
						{filteredNotifications.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p>
									{showUnreadOnly
										? "Không có thông báo chưa đọc"
										: "Chưa có thông báo"}
								</p>
							</div>
						) : (
							<ScrollArea className="h-[400px]">
								<div className="space-y-1">
									{filteredNotifications.map((notification, index) => {
										const IconComponent = getNotificationIcon(
											notification.type,
										);
										const priorityBadge = getPriorityBadge(
											notification.priority,
										);

										return (
											<div key={notification.id}>
												<Button
													variant="ghost"
													className={cn(
														"p-4 h-auto w-full justify-start text-left hover:bg-muted/50 transition-colors",
														!notification.read &&
															"bg-[#299fce]/5 border-l-4 border-l-[#299fce]",
													)}
													onClick={() => handleNotificationClick(notification)}
												>
													<div className="flex items-start gap-3">
														<div
															className={cn(
																"p-2 rounded-full shrink-0",
																!notification.read
																	? "bg-[#299fce]/10"
																	: "bg-muted",
															)}
														>
															<IconComponent
																className={cn(
																	"h-4 w-4",
																	getPriorityColor(notification.priority),
																)}
															/>
														</div>

														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between gap-2 mb-1">
																<h4
																	className={cn(
																		"text-sm font-medium truncate",
																		!notification.read && "font-semibold",
																	)}
																>
																	{notification.title}
																</h4>

																<div className="flex items-center gap-2 shrink-0">
																	{priorityBadge}
																	{!notification.read && (
																		<div className="w-2 h-2 bg-[#299fce] rounded-full" />
																	)}
																</div>
															</div>

															<p className="text-sm text-muted-foreground mb-2">
																{notification.message}
															</p>

															<div className="flex items-center justify-between">
																<span className="text-xs text-muted-foreground">
																	{formatTime(notification.timestamp)}
																</span>

																<div className="flex gap-1">
																	{!notification.read && (
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={(e) => {
																				e.stopPropagation();
																				markAsRead(notification.id);
																			}}
																			className="h-6 w-6 p-0"
																		>
																			<Check className="h-3 w-3" />
																		</Button>
																	)}

																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={(e) => {
																			e.stopPropagation();
																			removeNotification(notification.id);
																		}}
																		className="h-6 w-6 p-0"
																	>
																		<X className="h-3 w-3" />
																	</Button>
																</div>
															</div>
														</div>
													</div>
												</Button>

												{index < filteredNotifications.length - 1 && (
													<Separator />
												)}
											</div>
										);
									})}
								</div>
							</ScrollArea>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
