/**
 * Ticket Activity Indicator Components
 * Visual indicators for ticket activity and real-time updates
 */

import { Badge } from "@/components/ui/badge";
import { memo } from "react";

export interface TicketActivity {
	hasRecentActivity: boolean;
	activityCount: number;
	lastActivity?: Date;
}

export interface TicketActivityIndicatorProps {
	ticketId: string;
	ticketCode?: string;
	activity?: TicketActivity;
	showCount?: boolean;
	size?: "sm" | "md" | "lg";
}

/**
 * Activity indicator with pulsing dot and optional count
 */
export const TicketActivityIndicator = memo(function TicketActivityIndicator({
	ticketId,
	ticketCode,
	activity,
	showCount = true,
	size = "md"
}: TicketActivityIndicatorProps) {
	const hasActivity = activity?.hasRecentActivity;
	const activityCount = activity?.activityCount || 0;

	const sizeClasses = {
		sm: "w-1.5 h-1.5",
		md: "w-2 h-2",
		lg: "w-2.5 h-2.5"
	};

	const displayCode = ticketCode || `#${ticketId.slice(0, 8)}`;

	return (
		<div className="flex items-center gap-2">
			<div className="font-medium">
				{displayCode}
			</div>
			{hasActivity && (
				<div className="flex items-center gap-1">
					<div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`} />
					{showCount && activityCount > 1 && (
						<Badge variant="secondary" className="text-xs h-4 px-1">
							{activityCount}
						</Badge>
					)}
				</div>
			)}
		</div>
	);
});

/**
 * Simple activity dot indicator
 */
export const ActivityDot = memo(function ActivityDot({
	hasActivity,
	size = "md",
	color = "blue"
}: {
	hasActivity: boolean;
	size?: "sm" | "md" | "lg";
	color?: "blue" | "green" | "red" | "yellow";
}) {
	if (!hasActivity) return null;

	const sizeClasses = {
		sm: "w-1.5 h-1.5",
		md: "w-2 h-2",
		lg: "w-2.5 h-2.5"
	};

	const colorClasses = {
		blue: "bg-blue-500",
		green: "bg-green-500",
		red: "bg-red-500",
		yellow: "bg-yellow-500"
	};

	return (
		<div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`} />
	);
});

/**
 * Activity count badge
 */
export const ActivityCountBadge = memo(function ActivityCountBadge({
	count,
	threshold = 1
}: {
	count: number;
	threshold?: number;
}) {
	if (count <= threshold) return null;

	return (
		<Badge variant="secondary" className="text-xs h-4 px-1 ml-1">
			{count}
		</Badge>
	);
});

/**
 * Activity status with text description
 */
export const ActivityStatus = memo(function ActivityStatus({
	activity,
	showLastActivity = false
}: {
	activity?: TicketActivity;
	showLastActivity?: boolean;
}) {
	if (!activity?.hasRecentActivity) {
		return <span className="text-xs text-muted-foreground">Không có hoạt động</span>;
	}

	return (
		<div className="flex items-center gap-2 text-xs">
			<ActivityDot hasActivity={true} size="sm" />
			<span className="text-green-600">Có hoạt động gần đây</span>
			{showLastActivity && activity.lastActivity && (
				<span className="text-muted-foreground">
					({new Date(activity.lastActivity).toLocaleTimeString("vi-VN")})
				</span>
			)}
		</div>
	);
});

/**
 * Bulk activity indicator for multiple tickets
 */
export function BulkActivityIndicator({
	activities,
	showDetails = false
}: {
	activities: Record<string, TicketActivity>;
	showDetails?: boolean;
}) {
	const activeTickets = Object.values(activities).filter(a => a.hasRecentActivity).length;
	const totalActivity = Object.values(activities).reduce((sum, a) => sum + a.activityCount, 0);

	if (activeTickets === 0) return null;

	return (
		<div className="flex items-center gap-2 text-sm">
			<ActivityDot hasActivity={true} color="green" />
			<span>
				{activeTickets} phiếu có hoạt động
				{showDetails && totalActivity > activeTickets && (
					<span className="text-muted-foreground ml-1">
						({totalActivity} hoạt động)
					</span>
				)}
			</span>
		</div>
	);
}

/**
 * Activity timeline indicator
 */
export const ActivityTimeline = memo(function ActivityTimeline({
	activities
}: {
	activities: TicketActivity[];
}) {
	const recentActivities = activities
		.filter(a => a.hasRecentActivity && a.lastActivity)
		.sort((a, b) =>
			new Date(b.lastActivity!).getTime() - new Date(a.lastActivity!).getTime()
		)
		.slice(0, 5);

	if (recentActivities.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				Không có hoạt động gần đây
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{recentActivities.map((activity, index) => (
				<div key={index} className="flex items-center gap-2 text-xs">
					<ActivityDot hasActivity={true} size="sm" color="green" />
					<span className="text-muted-foreground">
						{activity.lastActivity?.toLocaleTimeString("vi-VN")}
					</span>
					{activity.activityCount > 1 && (
						<ActivityCountBadge count={activity.activityCount} />
					)}
				</div>
			))}
		</div>
	);
});

/**
 * Real-time activity monitor component
 */
export function ActivityMonitor({
	ticketIds,
	activities,
	onActivityUpdate
}: {
	ticketIds: string[];
	activities: Record<string, TicketActivity>;
	onActivityUpdate?: (ticketId: string, activity: TicketActivity) => void;
}) {
	const activeCount = Object.values(activities).filter(a => a.hasRecentActivity).length;
	const totalActivity = Object.values(activities).reduce((sum, a) => sum + a.activityCount, 0);

	return (
		<div className="flex items-center gap-4 text-sm text-muted-foreground">
			<span>Đang theo dõi: {ticketIds.length} phiếu</span>
			{activeCount > 0 && (
				<div className="flex items-center gap-2">
					<ActivityDot hasActivity={true} color="green" size="sm" />
					<span className="text-green-600">
						{activeCount} phiếu có hoạt động ({totalActivity} hoạt động)
					</span>
				</div>
			)}
		</div>
	);
}