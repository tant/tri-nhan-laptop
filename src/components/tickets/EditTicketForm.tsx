import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRepairTickets } from "@/hooks/use-repair-tickets";
import type { Database } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";

type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface RepairWithDetails extends RepairTicket {
	customer: Customer;
	technician: UserProfile | null;
}

interface EditTicketFormProps {
	ticketId: string;
	onTicketUpdated?: (ticketId: string) => void;
}

export function EditTicketForm({
	ticketId,
	onTicketUpdated,
}: EditTicketFormProps) {
	const navigate = useNavigate();
	const { getRepairById, updateRepair } = useRepairTickets();
	const [ticket, setTicket] = useState<RepairWithDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form fields
	const [issueDescription, setIssueDescription] = useState("");
	const [initialDiagnosis, setInitialDiagnosis] = useState("");
	const [priority, setPriority] = useState("");
	const [status, setStatus] = useState("");
	const [estimatedCost, setEstimatedCost] = useState("");
	const [notes, setNotes] = useState("");

	useEffect(() => {
		async function loadTicket() {
			try {
				setLoading(true);
				const data = await getRepairById(ticketId);
				setTicket(data);

				// Populate form fields
				setIssueDescription(data.issue_description || "");
				setInitialDiagnosis(data.initial_diagnosis || "");
				setPriority(data.priority);
				setStatus(data.status);
				setEstimatedCost(data.estimated_cost?.toString() || "");
				setNotes(data.notes || "");
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Không thể tải thông tin phiếu sửa chữa",
				);
			} finally {
				setLoading(false);
			}
		}

		loadTicket();
	}, [ticketId, getRepairById]);

	const handleSave = async () => {
		if (!ticket) return;

		try {
			setSaving(true);
			setError(null);

			const updates = {
				issue_description: issueDescription,
				initial_diagnosis: initialDiagnosis,
				priority,
				status,
				estimated_cost: estimatedCost ? Number(estimatedCost) : null,
				notes,
				updated_at: new Date().toISOString(),
			};

			await updateRepair(ticketId, updates);
			onTicketUpdated?.(ticketId);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Không thể cập nhật phiếu sửa chữa",
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto py-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded mb-4" />
					<div className="h-64 bg-gray-200 rounded" />
				</div>
			</div>
		);
	}

	if (error && !ticket) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">{error}</p>
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

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							navigate({ to: "/phieu-sua-chua/$id", params: { id: ticketId } })
						}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>
					<div>
						<h1 className="text-2xl font-bold">
							Chỉnh sửa phiếu #{ticket?.ticket_number || ticketId.slice(0, 8)}
						</h1>
						<p className="text-muted-foreground">
							Khách hàng: {ticket?.customer.full_name}
						</p>
					</div>
				</div>
				<Button onClick={handleSave} disabled={saving}>
					<Save className="h-4 w-4 mr-2" />
					{saving ? "Đang lưu..." : "Lưu thay đổi"}
				</Button>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<p className="text-red-700">{error}</p>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Main Form */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Thông tin sự cố</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="issue_description">Mô tả vấn đề *</Label>
								<Textarea
									id="issue_description"
									value={issueDescription}
									onChange={(e) => setIssueDescription(e.target.value)}
									placeholder="Mô tả chi tiết vấn đề của thiết bị"
									rows={4}
									required
								/>
							</div>

							<div>
								<Label htmlFor="initial_diagnosis">Chẩn đoán ban đầu</Label>
								<Textarea
									id="initial_diagnosis"
									value={initialDiagnosis}
									onChange={(e) => setInitialDiagnosis(e.target.value)}
									placeholder="Chẩn đoán sơ bộ về nguyên nhân"
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="notes">Ghi chú</Label>
								<Textarea
									id="notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Ghi chú bổ sung"
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Settings */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Cài đặt phiếu</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="priority">Mức độ ưu tiên *</Label>
								<Select value={priority} onValueChange={setPriority} required>
									<SelectTrigger>
										<SelectValue placeholder="Chọn mức độ ưu tiên" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Thấp</SelectItem>
										<SelectItem value="normal">Bình thường</SelectItem>
										<SelectItem value="high">Cao</SelectItem>
										<SelectItem value="urgent">Khẩn cấp</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="status">Trạng thái</Label>
								<Select value={status} onValueChange={setStatus}>
									<SelectTrigger>
										<SelectValue placeholder="Chọn trạng thái" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="device_received">
											Tiếp nhận thiết bị
										</SelectItem>
										<SelectItem value="preliminary_inspection">
											Kiểm tra sơ bộ
										</SelectItem>
										<SelectItem value="awaiting_repair_plan">
											Chờ phương án sửa chữa
										</SelectItem>
										<SelectItem value="approved_for_repair">
											Đã phê duyệt sửa chữa
										</SelectItem>
										<SelectItem value="in_diagnosis">Đang chẩn đoán</SelectItem>
										<SelectItem value="waiting_parts">Chờ linh kiện</SelectItem>
										<SelectItem value="in_repair">Đang sửa chữa</SelectItem>
										<SelectItem value="quality_testing">
											Kiểm tra chất lượng
										</SelectItem>
										<SelectItem value="ready_for_pickup">
											Sẵn sàng nhận
										</SelectItem>
										<SelectItem value="completed">Hoàn thành</SelectItem>
										<SelectItem value="cannot_repair">Không thể sửa</SelectItem>
										<SelectItem value="cancelled_by_customer">
											Khách hàng hủy
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="estimated_cost">Chi phí ước tính (VND)</Label>
								<Input
									id="estimated_cost"
									type="number"
									value={estimatedCost}
									onChange={(e) => setEstimatedCost(e.target.value)}
									placeholder="0"
									min="0"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Device Info (read-only) */}
					<Card>
						<CardHeader>
							<CardTitle>Thông tin thiết bị</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Thương hiệu:</p>
								<p className="font-medium">
									{ticket?.device_info?.brand || "Không xác định"}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Model:</p>
								<p className="font-medium">
									{ticket?.device_info?.model || "Không xác định"}
								</p>
							</div>
							{ticket?.device_info?.serial_number && (
								<div>
									<p className="text-sm text-muted-foreground">Số serial:</p>
									<p className="font-medium">
										{ticket.device_info.serial_number}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
