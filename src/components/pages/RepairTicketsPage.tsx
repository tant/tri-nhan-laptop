import { SupabaseErrorAlert } from "@/components/error-boundary";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
	PriorityBadge,
	StatusBadge,
} from "@/components/repairs/StatusBadgeComponents";
import { TicketActivityIndicator } from "@/components/repairs/TicketActivityIndicator";
import { PrimaryStatisticsCards } from "@/components/repairs/TicketStatisticsCards";
import { RepairTicketsSkeleton } from "@/components/skeleton-loaders";
import { AssignTechnicianDropdown } from "@/components/tickets/AssignTechnicianDropdown";
import { StatusChangeDropdown } from "@/components/tickets/StatusChangeDropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useMultipleTicketsActivity } from "@/hooks/use-ticket-activity";
import type { Customer, RepairTicket, UserProfile } from "@/lib/database-types";
import { Currency } from "@/lib/formatting";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
// Workflow components temporarily disabled for Phase 3 development

// Combined type for repair with related data
type RepairWithDetails = RepairTicket & {
	customer: Customer;
	technician: UserProfile | null;
	ticket_number?: string;
};

export function RepairTicketsPage() {
	const navigate = useNavigate();
	const [repairs, setRepairs] = useState<RepairWithDetails[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Track activity for all visible tickets
	const ticketIds = repairs.map((repair) => repair.id);
	const ticketActivities = useMultipleTicketsActivity(ticketIds, 30);
	// const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	// const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
	// const currentUser = { id: "mock-user-id", role: "manager" };

	// Fetch repairs with customer and technician details
	const fetchRepairs = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const { data, error } = await supabase
				.from("repair_tickets")
				.select(`
					*,
					customer:customers(*),
					technician:user_profiles!repair_tickets_assigned_technician_id_fkey(*)
				`)
				.order("created_at", { ascending: false });

			if (error) {
				throw error;
			}

			setRepairs(data as RepairWithDetails[]);
		} catch (err) {
			console.error("Error fetching repairs:", err);
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Load repairs on component mount
	useEffect(() => {
		fetchRepairs();
	}, [fetchRepairs]);

	const navigateToCreateTicket = () => {
		navigate({ to: "/phieu-sua-chua/new" });
	};

	// Optimized real-time subscription to repair changes
	useEffect(() => {
		const channel = supabase
			.channel("repair_tickets-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "repair_tickets",
				},
				(payload) => {
					console.log("Repair change detected:", payload);

					// Handle individual record changes instead of full refetch
					if (payload.eventType === "INSERT" && payload.new) {
						// Add new repair ticket to list
						setRepairs((prev) => [payload.new as RepairWithDetails, ...prev]);
					} else if (payload.eventType === "UPDATE" && payload.new) {
						// Update existing repair ticket
						setRepairs((prev) =>
							prev.map((repair) =>
								repair.id === payload.new.id
									? { ...repair, ...payload.new }
									: repair,
							),
						);
					} else if (payload.eventType === "DELETE" && payload.old) {
						// Remove deleted repair ticket
						setRepairs((prev) =>
							prev.filter((repair) => repair.id !== payload.old.id),
						);
					} else {
						// Fallback to full refetch for complex changes
						fetchRepairs();
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [fetchRepairs]);

	// Handle status transition success - temporarily disabled
	// const handleStatusTransitionSuccess = (updatedRepair: Repair) => {
	// 	setRepairs(prev => prev.map(repair =>
	// 		repair.id === updatedRepair.id
	// 			? { ...repair, ...updatedRepair }
	// 			: repair
	// 	));
	// };

	// Table columns definition
	const columns: ColumnDef<RepairWithDetails>[] = [
		{
			accessorKey: "ticket_code",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="ml-4"
				>
					Số phiếu
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const ticketId = row.original.id;
				const ticketCode = row.getValue("ticket_code") as string;
				const activity = ticketActivities[ticketId];

				return (
					<div className="ml-4">
						<TicketActivityIndicator
							ticketId={ticketId}
							ticketCode={ticketCode}
							activity={activity}
						/>
					</div>
				);
			},
		},
		{
			accessorKey: "customer",
			header: "Khách hàng",
			cell: ({ row }) => {
				const customer = row.original.customer;
				return (
					<div>
						<div className="font-medium">{customer.full_name}</div>
						<div className="text-sm text-muted-foreground">
							{customer.phone}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "device_info",
			header: "Thiết bị",
			cell: ({ row }) => {
				const deviceInfo = row.original.device_info;
				return (
					<div>
						<div className="font-medium">{deviceInfo.brand}</div>
						<div className="text-sm text-muted-foreground">
							{deviceInfo.model}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "issue_description",
			header: "Sự cố",
			cell: ({ row }) => (
				<div className="max-w-xs truncate">
					{row.getValue("issue_description")}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Trạng thái
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
		},
		{
			accessorKey: "priority",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Ưu tiên
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
		},
		{
			accessorKey: "estimated_cost",
			header: "Giá dự kiến",
			cell: ({ row }) => (
				<div className="text-right font-mono">
					{Currency.format(row.getValue("estimated_cost"))}
				</div>
			),
		},
		{
			accessorKey: "technician",
			header: "Kỹ thuật viên",
			cell: ({ row }) => {
				const technician = row.original.technician;
				return (
					<div className="text-sm">
						{technician ? technician.full_name : "Chưa phân công"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Thao tác",
			cell: ({ row }) => {
				const repair = row.original;
				return (
					<div className="flex space-x-1">
						{/* Quick Actions - Primary */}
						<AssignTechnicianDropdown
							ticketId={repair.id}
							currentTechnicianId={repair.assigned_technician_id || undefined}
							onAssign={() => fetchRepairs()} // Refresh data after assignment
						/>
						<StatusChangeDropdown
							ticketId={repair.id}
							currentStatus={repair.status}
							onStatusChange={() => fetchRepairs()} // Refresh data after status change
						/>

						{/* Divider */}
						<div className="w-px h-6 bg-border mx-1" />

						{/* Secondary Actions */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								navigate({
									to: "/phieu-sua-chua/$id",
									params: { id: repair.id },
								});
							}}
							title="Xem chi tiết phiếu sửa chữa"
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								navigate({
									to: "/phieu-sua-chua/$id/edit",
									params: { id: repair.id },
								});
							}}
							title="Chỉnh sửa phiếu sửa chữa"
						>
							<Edit className="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	];

	// Loading state
	if (loading) {
		return <RepairTicketsSkeleton />;
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Quản lý phiếu sửa chữa</h1>
				<div className="flex items-center gap-2">
					<NotificationBell />
					<Button variant="outline" onClick={fetchRepairs} disabled={loading}>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Làm mới
					</Button>
					<Button onClick={navigateToCreateTicket}>
						<Plus className="h-4 w-4 mr-2" />
						Tạo phiếu mới
					</Button>
				</div>
			</div>

			{error && (
				<SupabaseErrorAlert
					error={error}
					onRetry={fetchRepairs}
					onDismiss={() => setError(null)}
				/>
			)}

			{/* Statistics Cards */}
			<PrimaryStatisticsCards tickets={repairs} />

			{/* Repair Tickets Table - Full Width */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách phiếu sửa chữa</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={columns}
						data={repairs}
						globalFilterFn={(row, _columnId, filterValue) => {
							if (!filterValue) return true;

							const searchValue = filterValue.toLowerCase();
							const customer = row.original.customer;
							const ticketCode = row.original.ticket_code;

							// Search across customer name, phone, and ticket code
							return (
								customer.full_name?.toLowerCase().includes(searchValue) ||
								customer.phone?.toLowerCase().includes(searchValue) ||
								ticketCode?.toLowerCase().includes(searchValue)
							);
						}}
						searchPlaceholder="Tìm kiếm theo tên, SĐT hoặc số phiếu..."
					/>
				</CardContent>
			</Card>

			{/* Status Transition Dialog */}
			{/* {selectedRepair && (
				<StatusTransitionDialog
					repair={selectedRepair}
					open={statusDialogOpen}
					onOpenChange={setStatusDialogOpen}
					onSuccess={handleStatusTransitionSuccess}
					currentUser={currentUser}
				/>
			)} - Temporarily disabled */}

			{/* Repair Status Timeline Dialog */}
			{/* {selectedRepair && (
				<Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								Lịch sử phiếu #{selectedRepair.ticket_number || selectedRepair.id.slice(0, 8)}
							</DialogTitle>
						</DialogHeader>
						<RepairStatusTimeline
							repairId={selectedRepair.id}
							currentStatus={selectedRepair.status}
						/>
					</DialogContent>
				</Dialog>
			)} - Temporarily disabled */}

			{/* Create Ticket functionality moved to separate page at /phieu-sua-chua/new */}
		</div>
	);
}
