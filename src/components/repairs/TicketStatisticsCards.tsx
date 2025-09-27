/**
 * Ticket Statistics Cards
 * Reusable statistics card components for repair tickets dashboard
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepairTicket } from "@/lib/database-types";
import { useMemo } from "react";

export interface TicketStatisticsProps {
	tickets: RepairTicket[];
}

export interface StatCard {
	title: string;
	value: number;
	description?: string;
}

/**
 * Calculate statistics from repair tickets
 */
export function useTicketStatistics(tickets: RepairTicket[]) {
	return useMemo(() => {
		const total = tickets.length;
		const inProgress = tickets.filter((t) => t.status === "in_repair").length;
		const waitingParts = tickets.filter(
			(t) => t.status === "waiting_parts",
		).length;

		// Calculate completed today
		const today = new Date().toDateString();
		const completedToday = tickets.filter(
			(t) =>
				t.status === "completed" &&
				t.completed_at &&
				new Date(t.completed_at).toDateString() === today,
		).length;

		// Additional statistics
		const pending = tickets.filter((t) =>
			[
				"device_received",
				"preliminary_inspection",
				"awaiting_repair_plan",
			].includes(t.status),
		).length;

		const urgent = tickets.filter((t) => t.priority === "urgent").length;
		const overdue = tickets.filter((t) => {
			if (!t.expected_completion_date) return false;
			return (
				new Date(t.expected_completion_date) < new Date() &&
				!["completed", "cancelled_by_customer", "cannot_repair"].includes(
					t.status,
				)
			);
		}).length;

		return {
			total,
			inProgress,
			waitingParts,
			completedToday,
			pending,
			urgent,
			overdue,
		};
	}, [tickets]);
}

/**
 * Primary statistics cards for the main dashboard
 */
export function PrimaryStatisticsCards({ tickets }: TicketStatisticsProps) {
	const stats = useTicketStatistics(tickets);

	const primaryStats: StatCard[] = [
		{
			title: "Tổng phiếu",
			value: stats.total,
			description: "Tất cả phiếu sửa chữa",
		},
		{
			title: "Đang sửa chữa",
			value: stats.inProgress,
			description: "Phiếu đang được thực hiện",
		},
		{
			title: "Chờ linh kiện",
			value: stats.waitingParts,
			description: "Phiếu chờ linh kiện",
		},
		{
			title: "Hoàn thành hôm nay",
			value: stats.completedToday,
			description: "Phiếu hoàn thành trong ngày",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{primaryStats.map((stat, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stat.value}</div>
						{stat.description && (
							<p className="text-xs text-muted-foreground mt-1">
								{stat.description}
							</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}

/**
 * Extended statistics cards for detailed view
 */
export function ExtendedStatisticsCards({ tickets }: TicketStatisticsProps) {
	const stats = useTicketStatistics(tickets);

	const extendedStats: StatCard[] = [
		{
			title: "Chờ xử lý",
			value: stats.pending,
			description: "Phiếu mới và chờ phê duyệt",
		},
		{
			title: "Khẩn cấp",
			value: stats.urgent,
			description: "Phiếu có độ ưu tiên cao",
		},
		{
			title: "Quá hạn",
			value: stats.overdue,
			description: "Phiếu vượt thời gian dự kiến",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{extendedStats.map((stat, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stat.value}</div>
						{stat.description && (
							<p className="text-xs text-muted-foreground mt-1">
								{stat.description}
							</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}

/**
 * Compact single-line statistics display
 */
export function CompactStatistics({ tickets }: TicketStatisticsProps) {
	const stats = useTicketStatistics(tickets);

	return (
		<div className="flex items-center gap-6 text-sm text-muted-foreground">
			<span>
				Tổng: <strong className="text-foreground">{stats.total}</strong>
			</span>
			<span>
				Đang sửa:{" "}
				<strong className="text-foreground">{stats.inProgress}</strong>
			</span>
			<span>
				Chờ linh kiện:{" "}
				<strong className="text-foreground">{stats.waitingParts}</strong>
			</span>
			{stats.urgent > 0 && (
				<span className="text-destructive">
					Khẩn cấp: <strong>{stats.urgent}</strong>
				</span>
			)}
			{stats.overdue > 0 && (
				<span className="text-destructive">
					Quá hạn: <strong>{stats.overdue}</strong>
				</span>
			)}
		</div>
	);
}

/**
 * Status breakdown with percentages
 */
export function StatusBreakdownCard({ tickets }: TicketStatisticsProps) {
	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		tickets.forEach((ticket) => {
			counts[ticket.status] = (counts[ticket.status] || 0) + 1;
		});
		return counts;
	}, [tickets]);

	const total = tickets.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Phân bố trạng thái</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{Object.entries(statusCounts).map(([status, count]) => {
					const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
					return (
						<div key={status} className="flex justify-between items-center">
							<span className="text-sm capitalize">
								{status.replace(/_/g, " ")}
							</span>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">{count}</span>
								<span className="text-xs text-muted-foreground">
									({percentage}%)
								</span>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
