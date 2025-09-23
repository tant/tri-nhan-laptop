import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	Eye,
	FileText,
	Mail,
	Phone,
	Plus,
	Search,
	Trash2,
	Wrench,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { CreateTicketForm } from "../../components/tickets/CreateTicketForm";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../components/ui/tabs";
import { useRepairTickets } from "../../hooks/use-repair-tickets";

interface RepairTicket {
	id: string;
	ticket_number: string;
	customer_name: string;
	customer_phone: string;
	customer_email?: string;
	device_brand: string;
	device_model: string;
	problem_description: string;
	problem_category: string;
	status: string;
	urgency_level: string;
	created_at: string;
	updated_at: string;
	estimated_cost?: number;
	final_cost?: number;
	technician_name?: string;
	completion_date?: string;
}

export const TicketsPage: React.FC = () => {
	const { getRepairTickets, loading: isLoading } = useRepairTickets();

	const [tickets, setTickets] = useState<RepairTicket[]>([]);
	const [filteredTickets, setFilteredTickets] = useState<RepairTicket[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [urgencyFilter, setUrgencyFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(
		null,
	);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [ticketsPerPage] = useState(10);

	const statusOptions = [
		{ value: "all", label: "Tất cả trạng thái" },
		{ value: "draft", label: "Nháp" },
		{ value: "pending", label: "Chờ xử lý" },
		{ value: "in_progress", label: "Đang sửa chữa" },
		{ value: "waiting_parts", label: "Chờ linh kiện" },
		{ value: "completed", label: "Hoàn thành" },
		{ value: "delivered", label: "Đã giao" },
		{ value: "cancelled", label: "Đã hủy" },
	];

	const urgencyOptions = [
		{ value: "all", label: "Tất cả mức độ" },
		{ value: "low", label: "Thấp" },
		{ value: "medium", label: "Trung bình" },
		{ value: "high", label: "Cao" },
		{ value: "urgent", label: "Khẩn cấp" },
	];

	const categoryOptions = [
		{ value: "all", label: "Tất cả loại" },
		{ value: "hardware", label: "Phần cứng" },
		{ value: "software", label: "Phần mềm" },
		{ value: "screen", label: "Màn hình" },
		{ value: "keyboard", label: "Bàn phím" },
		{ value: "battery", label: "Pin" },
		{ value: "charging", label: "Sạc" },
		{ value: "performance", label: "Hiệu suất" },
		{ value: "virus", label: "Virus/Malware" },
		{ value: "data_recovery", label: "Khôi phục dữ liệu" },
		{ value: "other", label: "Khác" },
	];

	useEffect(() => {
		loadTickets();
	}, []);

	useEffect(() => {
		filterTickets();
	}, [tickets, searchQuery, statusFilter, urgencyFilter, categoryFilter]);

	const loadTickets = async () => {
		try {
			const ticketsData = await getRepairTickets();
			// Convert RepairTicketSummary to RepairTicket format
			const convertedTickets = ticketsData.map((ticket: any) => ({
				id: ticket.id,
				ticket_number: ticket.ticket_number,
				customer_name: ticket.customer_name || "",
				customer_phone: ticket.customer_phone || "",
				customer_email: ticket.customer_email,
				device_brand: ticket.device_brand || "",
				device_model: ticket.device_model || "",
				problem_description: ticket.problem_description || "",
				problem_category: ticket.problem_category || "other",
				status: ticket.status || "pending",
				urgency_level: ticket.urgency_level || "medium",
				created_at: ticket.created_at,
				updated_at: ticket.updated_at,
				estimated_cost: ticket.estimated_cost,
				final_cost: ticket.final_cost,
				technician_name: ticket.technician_name,
				completion_date: ticket.completion_date,
			}));
			setTickets(convertedTickets);
		} catch (error) {
			console.error("Error loading tickets:", error);
		}
	};

	const filterTickets = () => {
		let filtered = tickets;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(ticket) =>
					ticket.ticket_number.toLowerCase().includes(query) ||
					ticket.customer_name.toLowerCase().includes(query) ||
					ticket.customer_phone.includes(query) ||
					ticket.device_brand.toLowerCase().includes(query) ||
					ticket.device_model.toLowerCase().includes(query) ||
					ticket.problem_description.toLowerCase().includes(query),
			);
		}

		if (statusFilter !== "all") {
			filtered = filtered.filter((ticket) => ticket.status === statusFilter);
		}

		if (urgencyFilter !== "all") {
			filtered = filtered.filter(
				(ticket) => ticket.urgency_level === urgencyFilter,
			);
		}

		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(ticket) => ticket.problem_category === categoryFilter,
			);
		}

		setFilteredTickets(filtered);
		setCurrentPage(1);
	};

	const getStatusBadge = (status: string) => {
		const statusMap = {
			draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
			pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
			in_progress: { color: "bg-blue-100 text-blue-800", icon: Wrench },
			waiting_parts: {
				color: "bg-orange-100 text-orange-800",
				icon: AlertCircle,
			},
			completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
			delivered: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
			cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
		};

		const config =
			statusMap[status as keyof typeof statusMap] || statusMap.pending;
		const Icon = config.icon;

		return (
			<Badge className={config.color}>
				<Icon className="h-3 w-3 mr-1" />
				{statusOptions.find((s) => s.value === status)?.label || status}
			</Badge>
		);
	};

	const getUrgencyBadge = (urgency: string) => {
		const urgencyMap = {
			low: "bg-green-100 text-green-800",
			medium: "bg-yellow-100 text-yellow-800",
			high: "bg-orange-100 text-orange-800",
			urgent: "bg-red-100 text-red-800",
		};

		return (
			<Badge
				className={
					urgencyMap[urgency as keyof typeof urgencyMap] || urgencyMap.medium
				}
			>
				{urgencyOptions.find((u) => u.value === urgency)?.label || urgency}
			</Badge>
		);
	};

	const handleTicketCreated = (_ticketId: string) => {
		setIsCreateDialogOpen(false);
		loadTickets();
	};

	const handleViewTicket = (ticket: RepairTicket) => {
		setSelectedTicket(ticket);
		setIsViewDialogOpen(true);
	};

	const handleDeleteTicket = (ticketId: string) => {
		setTicketToDelete(ticketId);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (ticketToDelete) {
			try {
				// Mock delete - remove from local state
				setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete));
				setIsDeleteDialogOpen(false);
				setTicketToDelete(null);
			} catch (error) {
				console.error("Error deleting ticket:", error);
			}
		}
	};

	const handleStatusUpdate = async (_ticketId: string, _newStatus: string) => {
		try {
			// Mock update - would normally call API
			loadTickets();
		} catch (error) {
			console.error("Error updating ticket status:", error);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatCurrency = (amount: number) => {
		return `${amount.toLocaleString("vi-VN")} VNĐ`;
	};

	// Pagination
	const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
	const startIndex = (currentPage - 1) * ticketsPerPage;
	const endIndex = startIndex + ticketsPerPage;
	const currentTickets = filteredTickets.slice(startIndex, endIndex);

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">Quản lý phiếu sửa chữa</h1>
					<p className="text-gray-600">
						Tổng cộng {filteredTickets.length} phiếu
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="flex items-center gap-2">
							<Plus className="h-4 w-4" />
							Tạo phiếu mới
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Tạo phiếu sửa chữa mới</DialogTitle>
						</DialogHeader>
						<CreateTicketForm onTicketCreated={handleTicketCreated} />
					</DialogContent>
				</Dialog>
			</div>

			{/* Filters */}
			<Card className="mb-6">
				<CardContent className="pt-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div className="lg:col-span-2">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Tìm kiếm theo số phiếu, khách hàng, thiết bị..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{urgencyOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categoryOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Tickets List */}
			<div className="grid gap-4">
				{currentTickets.map((ticket) => (
					<Card key={ticket.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-4 mb-3">
										<h3 className="text-lg font-semibold">
											#{ticket.ticket_number}
										</h3>
										{getStatusBadge(ticket.status)}
										{getUrgencyBadge(ticket.urgency_level)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
										<div>
											<h4 className="font-medium text-sm text-gray-500 mb-1">
												KHÁCH HÀNG
											</h4>
											<p className="font-medium">{ticket.customer_name}</p>
											<div className="flex items-center gap-1 text-sm text-gray-600">
												<Phone className="h-3 w-3" />
												{ticket.customer_phone}
											</div>
											{ticket.customer_email && (
												<div className="flex items-center gap-1 text-sm text-gray-600">
													<Mail className="h-3 w-3" />
													{ticket.customer_email}
												</div>
											)}
										</div>

										<div>
											<h4 className="font-medium text-sm text-gray-500 mb-1">
												THIẾT BỊ
											</h4>
											<p className="font-medium">
												{ticket.device_brand} {ticket.device_model}
											</p>
											<p className="text-sm text-gray-600">
												{
													categoryOptions.find(
														(c) => c.value === ticket.problem_category,
													)?.label
												}
											</p>
										</div>

										<div>
											<h4 className="font-medium text-sm text-gray-500 mb-1">
												THỜI GIAN
											</h4>
											<div className="flex items-center gap-1 text-sm">
												<Calendar className="h-3 w-3" />
												{formatDate(ticket.created_at)}
											</div>
											{ticket.completion_date && (
												<div className="text-sm text-green-600">
													Hoàn thành: {formatDate(ticket.completion_date)}
												</div>
											)}
										</div>
									</div>

									<div className="mb-4">
										<h4 className="font-medium text-sm text-gray-500 mb-1">
											VẤN ĐỀ
										</h4>
										<p className="text-sm text-gray-700 line-clamp-2">
											{ticket.problem_description}
										</p>
									</div>

									{(ticket.estimated_cost || ticket.final_cost) && (
										<div className="flex gap-4 text-sm">
											{ticket.estimated_cost && (
												<span className="text-gray-600">
													Ước tính: {formatCurrency(ticket.estimated_cost)}
												</span>
											)}
											{ticket.final_cost && (
												<span className="font-medium text-green-600">
													Thực tế: {formatCurrency(ticket.final_cost)}
												</span>
											)}
										</div>
									)}
								</div>

								<div className="flex flex-col gap-2 ml-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleViewTicket(ticket)}
										className="flex items-center gap-1"
									>
										<Eye className="h-3 w-3" />
										Xem
									</Button>

									<Select
										value={ticket.status}
										onValueChange={(value) =>
											handleStatusUpdate(ticket.id, value)
										}
									>
										<SelectTrigger className="w-32 h-8 text-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{statusOptions.slice(1).map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteTicket(ticket.id)}
										className="flex items-center gap-1 text-red-600 hover:text-red-700"
									>
										<Trash2 className="h-3 w-3" />
										Xóa
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredTickets.length === 0 && !isLoading && (
				<Card>
					<CardContent className="text-center py-8">
						<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Không có phiếu sửa chữa
						</h3>
						<p className="text-gray-500 mb-4">
							Chưa có phiếu sửa chữa nào được tạo.
						</p>
						<Dialog
							open={isCreateDialogOpen}
							onOpenChange={setIsCreateDialogOpen}
						>
							<DialogTrigger asChild>
								<Button>Tạo phiếu đầu tiên</Button>
							</DialogTrigger>
							<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>Tạo phiếu sửa chữa mới</DialogTitle>
								</DialogHeader>
								<CreateTicketForm onTicketCreated={handleTicketCreated} />
							</DialogContent>
						</Dialog>
					</CardContent>
				</Card>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 mt-6">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
					>
						Trước
					</Button>

					<div className="flex gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "outline"}
								size="sm"
								onClick={() => setCurrentPage(page)}
								className="w-8"
							>
								{page}
							</Button>
						))}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setCurrentPage((prev) => Math.min(prev + 1, totalPages))
						}
						disabled={currentPage === totalPages}
					>
						Sau
					</Button>
				</div>
			)}

			{/* View Ticket Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Chi tiết phiếu #{selectedTicket?.ticket_number}
						</DialogTitle>
					</DialogHeader>

					{selectedTicket && (
						<div className="space-y-6">
							<div className="flex gap-4">
								{getStatusBadge(selectedTicket.status)}
								{getUrgencyBadge(selectedTicket.urgency_level)}
							</div>

							<Tabs defaultValue="info" className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="info">Thông tin</TabsTrigger>
									<TabsTrigger value="timeline">Lịch sử</TabsTrigger>
									<TabsTrigger value="files">Tài liệu</TabsTrigger>
								</TabsList>

								<TabsContent value="info" className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<Card>
											<CardHeader>
												<CardTitle className="text-base">Khách hàng</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-2">
													<p>
														<strong>Tên:</strong> {selectedTicket.customer_name}
													</p>
													<p>
														<strong>Điện thoại:</strong>{" "}
														{selectedTicket.customer_phone}
													</p>
													{selectedTicket.customer_email && (
														<p>
															<strong>Email:</strong>{" "}
															{selectedTicket.customer_email}
														</p>
													)}
												</div>
											</CardContent>
										</Card>

										<Card>
											<CardHeader>
												<CardTitle className="text-base">Thiết bị</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-2">
													<p>
														<strong>Thương hiệu:</strong>{" "}
														{selectedTicket.device_brand}
													</p>
													<p>
														<strong>Model:</strong>{" "}
														{selectedTicket.device_model}
													</p>
													<p>
														<strong>Loại vấn đề:</strong>{" "}
														{
															categoryOptions.find(
																(c) =>
																	c.value === selectedTicket.problem_category,
															)?.label
														}
													</p>
												</div>
											</CardContent>
										</Card>
									</div>

									<Card>
										<CardHeader>
											<CardTitle className="text-base">Mô tả vấn đề</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="whitespace-pre-wrap">
												{selectedTicket.problem_description}
											</p>
										</CardContent>
									</Card>

									{(selectedTicket.estimated_cost ||
										selectedTicket.final_cost) && (
										<Card>
											<CardHeader>
												<CardTitle className="text-base">Chi phí</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-2">
													{selectedTicket.estimated_cost && (
														<p>
															<strong>Ước tính:</strong>{" "}
															{formatCurrency(selectedTicket.estimated_cost)}
														</p>
													)}
													{selectedTicket.final_cost && (
														<p>
															<strong>Thực tế:</strong>{" "}
															{formatCurrency(selectedTicket.final_cost)}
														</p>
													)}
												</div>
											</CardContent>
										</Card>
									)}
								</TabsContent>

								<TabsContent value="timeline">
									<Card>
										<CardContent className="pt-6">
											<div className="space-y-4">
												<div className="flex items-start gap-4">
													<div className="bg-blue-100 rounded-full p-2">
														<FileText className="h-4 w-4 text-blue-600" />
													</div>
													<div>
														<p className="font-medium">Phiếu được tạo</p>
														<p className="text-sm text-gray-600">
															{formatDate(selectedTicket.created_at)}
														</p>
													</div>
												</div>

												{selectedTicket.updated_at !==
													selectedTicket.created_at && (
													<div className="flex items-start gap-4">
														<div className="bg-yellow-100 rounded-full p-2">
															<Edit className="h-4 w-4 text-yellow-600" />
														</div>
														<div>
															<p className="font-medium">Phiếu được cập nhật</p>
															<p className="text-sm text-gray-600">
																{formatDate(selectedTicket.updated_at)}
															</p>
														</div>
													</div>
												)}

												{selectedTicket.completion_date && (
													<div className="flex items-start gap-4">
														<div className="bg-green-100 rounded-full p-2">
															<CheckCircle className="h-4 w-4 text-green-600" />
														</div>
														<div>
															<p className="font-medium">Sửa chữa hoàn thành</p>
															<p className="text-sm text-gray-600">
																{formatDate(selectedTicket.completion_date)}
															</p>
														</div>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="files">
									<Card>
										<CardContent className="pt-6">
											<p className="text-gray-500 text-center">
												Chức năng quản lý tài liệu sẽ được triển khai.
											</p>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa phiếu</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa phiếu sửa chữa này? Hành động này không
							thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
