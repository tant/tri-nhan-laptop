import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, RefreshCw, ArrowUpDown, Eye, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { SupabaseErrorAlert } from "@/components/error-boundary";
import { RepairTicketsSkeleton } from "@/components/skeleton-loaders";
// Workflow components temporarily disabled for Phase 3 development

// Database types
type Repair = Database["public"]["Tables"]["repairs"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

// Combined type for repair with related data
type RepairWithDetails = Repair & {
	customer: Customer;
	technician: UserProfile | null;
	ticket_number?: string;
};

export function RepairTicketsPage() {
	const [repairs, setRepairs] = useState<RepairWithDetails[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	// Temporarily disabled for Phase 3 development
	// const [selectedRepair, setSelectedRepair] = useState<RepairWithDetails | null>(null);
	// const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	// const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
	// const currentUser = { id: "mock-user-id", role: "manager" };

	// Fetch repairs with customer and technician details
	const fetchRepairs = async () => {
		try {
			setLoading(true);
			setError(null);

			const { data, error } = await supabase
				.from("repairs")
				.select(`
					*,
					customer:customers(*),
					technician:user_profiles(*)
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
	};

	// Load repairs on component mount
	useEffect(() => {
		fetchRepairs();
	}, []);

	// Real-time subscription to repair changes
	useEffect(() => {
		const channel = supabase
			.channel("repairs-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "repairs",
				},
				(payload) => {
					console.log("Repair change detected:", payload);
					// Refetch data when changes occur
					fetchRepairs();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	// Status badge mapping
	const getStatusBadge = (status: Repair["status"]) => {
		const statusMap = {
			received: { label: "Tiếp nhận", variant: "outline" as const },
			diagnosed: { label: "Đã chẩn đoán", variant: "secondary" as const },
			waiting_parts: { label: "Chờ linh kiện", variant: "destructive" as const },
			in_progress: { label: "Đang sửa chữa", variant: "default" as const },
			completed: { label: "Hoàn thành", variant: "default" as const },
			ready_for_pickup: { label: "Sẵn sàng giao", variant: "default" as const },
			delivered: { label: "Đã giao", variant: "outline" as const },
			cancelled: { label: "Đã hủy", variant: "destructive" as const },
		};

		const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
		return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
	};

	// Priority badge mapping
	const getPriorityBadge = (priority: Repair["priority"]) => {
		const priorityMap = {
			low: { label: "Thấp", variant: "outline" as const },
			normal: { label: "Bình thường", variant: "secondary" as const },
			high: { label: "Cao", variant: "destructive" as const },
			urgent: { label: "Khẩn cấp", variant: "destructive" as const },
		};

		const priorityInfo = priorityMap[priority] || { label: priority, variant: "outline" as const };
		return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
	};

	// Format currency (Vietnamese dong)
	const formatCurrency = (amount: number | null) => {
		if (!amount) return "Chưa định giá";
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

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
			accessorKey: "ticket_number",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Số phiếu
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("ticket_number") || `#${row.original.id.slice(0, 8)}`}</div>
			),
		},
		{
			accessorKey: "customer",
			header: "Khách hàng",
			cell: ({ row }) => {
				const customer = row.original.customer;
				return (
					<div>
						<div className="font-medium">{customer.name}</div>
						<div className="text-sm text-muted-foreground">{customer.phone}</div>
					</div>
				);
			},
		},
		{
			accessorKey: "device_type",
			header: "Thiết bị",
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.getValue("device_type")}</div>
					<div className="text-sm text-muted-foreground">{row.original.device_model}</div>
				</div>
			),
		},
		{
			accessorKey: "issue_description",
			header: "Sự cố",
			cell: ({ row }) => (
				<div className="max-w-xs truncate">{row.getValue("issue_description")}</div>
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
			cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
			cell: ({ row }) => getPriorityBadge(row.getValue("priority")),
		},
		{
			accessorKey: "estimated_cost",
			header: "Giá dự kiến",
			cell: ({ row }) => (
				<div className="text-right">
					{formatCurrency(row.getValue("estimated_cost"))}
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
					<div className="flex space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								// setSelectedRepair(repair);
								// setTimelineDialogOpen(true);
								console.log("View repair:", repair.id);
							}}
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								// setSelectedRepair(repair);
								// setStatusDialogOpen(true);
								console.log("Edit repair:", repair.id);
							}}
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
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchRepairs}
						disabled={loading}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Làm mới
					</Button>
					<Button>
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
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng phiếu
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{repairs.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Đang sửa chữa
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{repairs.filter(r => r.status === "in_progress").length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Chờ linh kiện
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{repairs.filter(r => r.status === "waiting_parts").length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Hoàn thành hôm nay
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{repairs.filter(r =>
								r.status === "completed" &&
								r.completed_at &&
								new Date(r.completed_at).toDateString() === new Date().toDateString()
							).length}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Technician Workload Dashboard */}
			{/* <TechnicianWorkloadDashboard /> - Temporarily disabled */}

			{/* Repair Tickets Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách phiếu sửa chữa</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={columns}
						data={repairs}
						searchKey="customer"
						searchPlaceholder="Tìm kiếm theo tên khách hàng..."
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
		</div>
	);
}