import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRepairTickets } from "@/hooks/use-repair-tickets";
import { formatVND } from "@/lib/currency";
import type { Database } from "@/lib/supabase";
import {
	ArrowLeft,
	Calendar,
	Clock,
	DollarSign,
	Edit,
	FileText,
	Laptop,
	Phone,
	User,
	MapPin,
	Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AssignTechnicianDropdown } from "@/components/tickets/AssignTechnicianDropdown";
import { StatusChangeDropdown } from "@/components/tickets/StatusChangeDropdown";

type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface RepairWithDetails extends RepairTicket {
	customer: Customer;
	technician: UserProfile | null;
}

interface TicketDetailViewProps {
	ticketId: string;
}

export function TicketDetailView({ ticketId }: TicketDetailViewProps) {
	const navigate = useNavigate();
	const { getRepairById } = useRepairTickets();
	const [ticket, setTicket] = useState<RepairWithDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadTicket = async () => {
		try {
			setLoading(true);
			const data = await getRepairById(ticketId);
			setTicket(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không thể tải thông tin phiếu sửa chữa");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTicket();
	}, [ticketId, getRepairById]);

	if (loading) {
		return (
			<div className="container mx-auto py-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded mb-4"></div>
					<div className="h-64 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (error || !ticket) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">{error || "Không tìm thấy phiếu sửa chữa"}</p>
						<Button
							onClick={() => navigate({ to: "/phieu-sua-chua" })}
							className="mt-4"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại danh sách
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			device_received: { label: "Tiếp nhận thiết bị", variant: "outline" },
			preliminary_inspection: { label: "Kiểm tra sơ bộ", variant: "secondary" },
			awaiting_repair_plan: { label: "Chờ phương án sửa chữa", variant: "secondary" },
			approved_for_repair: { label: "Đã phê duyệt sửa chữa", variant: "default" },
			in_diagnosis: { label: "Đang chẩn đoán", variant: "default" },
			waiting_parts: { label: "Chờ linh kiện", variant: "destructive" },
			in_repair: { label: "Đang sửa chữa", variant: "default" },
			quality_testing: { label: "Kiểm tra chất lượng", variant: "default" },
			ready_for_pickup: { label: "Sẵn sàng nhận", variant: "default" },
			completed: { label: "Hoàn thành", variant: "default" },
			cannot_repair: { label: "Không thể sửa", variant: "destructive" },
			cancelled_by_customer: { label: "Khách hàng hủy", variant: "destructive" },
			repair_failed: { label: "Sửa chữa thất bại", variant: "destructive" },
			customer_no_show: { label: "Khách không đến", variant: "destructive" },
			ready_for_return: { label: "Sẵn sàng trả", variant: "outline" },
			abandoned: { label: "Bỏ qua", variant: "destructive" },
		};

		const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
		return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
	};

	const getPriorityBadge = (priority: string) => {
		const priorityMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			low: { label: "Thấp", variant: "outline" },
			normal: { label: "Bình thường", variant: "secondary" },
			high: { label: "Cao", variant: "destructive" },
			urgent: { label: "Khẩn cấp", variant: "destructive" },
		};

		const priorityInfo = priorityMap[priority] || { label: priority, variant: "outline" as const };
		return <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>;
	};

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate({ to: "/phieu-sua-chua" })}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>
					<div>
						<h1 className="text-2xl font-bold">
							Phiếu sửa chữa #{ticket.ticket_code || ticket.id.slice(0, 8)}
						</h1>
						<div className="flex items-center space-x-2 mt-1">
							{getStatusBadge(ticket.status)}
							{getPriorityBadge(ticket.priority)}
						</div>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					{/* Quick Actions */}
					<AssignTechnicianDropdown
						ticketId={ticket.id}
						currentTechnicianId={ticket.assigned_technician_id || undefined}
						onAssign={loadTicket} // Refresh data after assignment
					/>
					<StatusChangeDropdown
						ticketId={ticket.id}
						currentStatus={ticket.status}
						onStatusChange={loadTicket} // Refresh data after status change
					/>
					<Separator orientation="vertical" className="h-6" />
					<Button
						onClick={() => navigate({ to: "/phieu-sua-chua/$id/edit", params: { id: ticketId } })}
					>
						<Edit className="h-4 w-4 mr-2" />
						Chỉnh sửa
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					<Tabs defaultValue="details" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="details">Chi tiết</TabsTrigger>
							<TabsTrigger value="timeline">Tiến trình</TabsTrigger>
							<TabsTrigger value="parts">Linh kiện</TabsTrigger>
							<TabsTrigger value="costs">Chi phí</TabsTrigger>
						</TabsList>

						<TabsContent value="details" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<FileText className="h-5 w-5 mr-2" />
										Thông tin sự cố
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-2">Mô tả vấn đề:</p>
									<p className="mb-4">{ticket.issue_description}</p>

									{ticket.initial_diagnosis && (
										<div>
											<p className="text-sm text-muted-foreground mb-2">Chẩn đoán ban đầu:</p>
											<p>{ticket.initial_diagnosis}</p>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Laptop className="h-5 w-5 mr-2" />
										Thông tin thiết bị
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">Thương hiệu:</p>
											<p className="font-medium">{ticket.device_info?.brand || "Không xác định"}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Model:</p>
											<p className="font-medium">{ticket.device_info?.model || "Không xác định"}</p>
										</div>
										{ticket.device_info?.serial_number && (
											<div className="col-span-2">
												<p className="text-sm text-muted-foreground">Số serial:</p>
												<p className="font-medium">{ticket.device_info.serial_number}</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="timeline">
							<Card>
								<CardHeader>
									<CardTitle>Lịch sử xử lý</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">Lịch sử tiến trình sửa chữa sẽ được hiển thị ở đây</p>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="parts">
							<Card>
								<CardHeader>
									<CardTitle>Linh kiện sử dụng</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">Danh sách linh kiện sử dụng sẽ được hiển thị ở đây</p>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="costs">
							<Card>
								<CardHeader>
									<CardTitle>Chi phí sửa chữa</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between">
											<span>Chi phí ước tính:</span>
											<span className="font-medium">
												{ticket.estimated_cost ? formatVND(ticket.estimated_cost) : "Chưa ước tính"}
											</span>
										</div>
										<div className="flex justify-between">
											<span>Chi phí thực tế:</span>
											<span className="font-medium">
												{ticket.final_cost ? formatVND(ticket.final_cost) : "Chưa xác định"}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<User className="h-5 w-5 mr-2" />
								Thông tin khách hàng
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Tên khách hàng:</p>
								<p className="font-medium">{ticket.customer.full_name}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Số điện thoại:</p>
								<p className="font-medium flex items-center">
									<Phone className="h-4 w-4 mr-1" />
									{ticket.customer.phone}
								</p>
							</div>
							{ticket.customer.email && (
								<div>
									<p className="text-sm text-muted-foreground">Email:</p>
									<p className="font-medium flex items-center">
										<Mail className="h-4 w-4 mr-1" />
										{ticket.customer.email}
									</p>
								</div>
							)}
							{ticket.customer.address && (
								<div>
									<p className="text-sm text-muted-foreground">Địa chỉ:</p>
									<p className="font-medium flex items-start">
										<MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
										{ticket.customer.address}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Clock className="h-5 w-5 mr-2" />
								Thời gian
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Ngày tạo:</p>
								<p className="font-medium flex items-center">
									<Calendar className="h-4 w-4 mr-1" />
									{new Date(ticket.created_at).toLocaleDateString("vi-VN")}
								</p>
							</div>
							{ticket.expected_completion_date && (
								<div>
									<p className="text-sm text-muted-foreground">Dự kiến hoàn thành:</p>
									<p className="font-medium">
										{new Date(ticket.expected_completion_date).toLocaleDateString("vi-VN")}
									</p>
								</div>
							)}
							{ticket.completed_at && (
								<div>
									<p className="text-sm text-muted-foreground">Đã hoàn thành:</p>
									<p className="font-medium">
										{new Date(ticket.completed_at).toLocaleDateString("vi-VN")}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{ticket.technician && (
						<Card>
							<CardHeader>
								<CardTitle>Kỹ thuật viên phụ trách</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="font-medium">{ticket.technician.full_name}</p>
								<p className="text-sm text-muted-foreground">
									{ticket.technician.role === "shop_owner" ? "Chủ cửa hàng" : "Nhân viên"}
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}