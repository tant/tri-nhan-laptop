import { CostBreakdownModal } from "@/components/costs/CostBreakdownModal";
import { QuoteGenerationModal } from "@/components/costs/QuoteGenerationModal";
import { ReservationStatusModal } from "@/components/inventory/ReservationStatusModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCostTracking } from "@/hooks/use-cost-tracking";
import { usePartsManagement } from "@/hooks/use-parts-management";
import { formatVND } from "@/lib/currency";
import type { Database } from "@/lib/supabase";
import {
	Calculator,
	Calendar,
	Clock,
	FileText,
	Laptop,
	Package,
	Phone,
	Plus,
	Settings,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PartsPickerModal } from "./PartsPickerModal";

type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface RepairWithDetails extends RepairTicket {
	customer: Customer;
	technician: UserProfile | null;
}

interface PartsUsed {
	part_id: string;
	part_name: string;
	quantity: number;
	unit_price: number;
	total_cost: number;
}

interface RepairDetailsModalProps {
	repair: RepairWithDetails | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdate?: () => void;
}

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface SelectedPart {
	part: Part;
	quantity: number;
	notes?: string;
}

interface RepairPartData {
	part_id: string;
	quantity_used: number;
	cost_per_unit: number;
	total_cost: number;
	part: Part;
}

export function RepairDetailsModal({
	repair,
	isOpen,
	onClose,
	onUpdate,
}: RepairDetailsModalProps) {
	const [isPartsPickerOpen, setIsPartsPickerOpen] = useState(false);
	const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
	const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
	const [isQuoteGenerationOpen, setIsQuoteGenerationOpen] = useState(false);
	const [currentParts, setCurrentParts] = useState<PartsUsed[]>([]);
	const [laborCost, setLaborCost] = useState(0);
	const [estimatedHours, setEstimatedHours] = useState(0);
	const [notes, setNotes] = useState("");

	const {
		getRepairParts,
		addPartsToRepair,
		calculateRepairPartsCost,
		reservePartsForRepair,
		addPartsToRepairWithReservation,
	} = usePartsManagement();

	const { calculateRepairCosts, loading: costLoading } = useCostTracking();

	// Load current parts when repair changes
	useEffect(() => {
		if (repair?.id) {
			loadRepairParts();
			setLaborCost(repair.labor_cost || 0);
			setEstimatedHours(repair.estimated_hours || 0);
			setNotes(repair.repair_notes || "");
		}
	}, [
		repair?.id,
		repair?.labor_cost,
		repair?.estimated_hours,
		repair?.repair_notes,
	]);

	const loadRepairParts = async () => {
		if (!repair?.id) return;

		try {
			const partsData = await getRepairParts(repair.id);
			// Transform the data to match our interface
			const formattedParts: PartsUsed[] = partsData.map(
				(item: RepairPartData) => ({
					part_id: item.part_id,
					part_name: item.part.name,
					quantity: item.quantity_used,
					unit_price: item.cost_per_unit,
					total_cost: item.total_cost,
				}),
			);
			setCurrentParts(formattedParts);
		} catch (error) {
			console.error("Error loading repair parts:", error);
		}
	};

	const handleAddParts = async (
		selectedParts: SelectedPart[],
		_totalCost: number,
	) => {
		if (!repair?.id) return;

		try {
			// Transform selected parts to the format expected by addPartsToRepair
			const partsToAdd = selectedParts.map((selected) => ({
				part_id: selected.part.id,
				quantity_used: selected.quantity,
				cost_per_unit: selected.part.unit_price || 0,
				notes: selected.notes,
			}));

			// Add parts to repair
			await addPartsToRepair(repair.id, partsToAdd, "current-user-id"); // TODO: Get real user ID

			// Reload parts list
			await loadRepairParts();

			// Update parent component if callback provided
			if (onUpdate) {
				onUpdate();
			}
		} catch (error) {
			console.error("Error adding parts to repair:", error);
		}
	};

	const handleReserveParts = async (selectedParts: SelectedPart[]) => {
		if (!repair?.id) return;

		try {
			// Reserve each part for the repair
			for (const selected of selectedParts) {
				await reservePartsForRepair(
					selected.part.id,
					repair.id,
					selected.quantity,
					"current-user-id", // TODO: Get real user ID
					24, // 24 hours reservation
					selected.notes,
				);
			}

			// Show success notification or update UI
			console.log(
				`Reserved ${selectedParts.length} parts for repair ${repair.id}`,
			);

			// Update parent component if callback provided
			if (onUpdate) {
				onUpdate();
			}
		} catch (error) {
			console.error("Error reserving parts:", error);
		}
	};

	// Calculate total costs
	const partsTotalCost = currentParts.reduce(
		(sum, part) => sum + part.total_cost,
		0,
	);
	const totalRepairCost = partsTotalCost + laborCost;

	// Get status badge variant
	const getStatusVariant = (status: string) => {
		switch (status) {
			case "device_received":
				return "secondary";
			case "in_diagnosis":
				return "default";
			case "awaiting_repair_plan":
				return "outline";
			case "in_repair":
				return "default";
			case "quality_testing":
				return "secondary";
			case "ready_for_pickup":
				return "default";
			case "completed":
				return "default";
			case "cancelled":
				return "destructive";
			default:
				return "secondary";
		}
	};

	// Handlers for cost tracking modals
	const handleCostUpdate = () => {
		// Reload parts and update UI when costs change
		loadRepairParts();
		if (onUpdate) {
			onUpdate();
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (!repair) return null;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Chi tiết phiếu sửa chữa #{repair.ticket_code}
						</DialogTitle>
						<DialogDescription>
							Quản lý thông tin chi tiết và linh kiện cho phiếu sửa chữa
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue="overview" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="overview">Tổng quan</TabsTrigger>
							<TabsTrigger value="parts">Linh kiện</TabsTrigger>
							<TabsTrigger value="costs">Chi phí</TabsTrigger>
							<TabsTrigger value="timeline">Lịch sử</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value="overview" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Customer Information */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<User className="h-4 w-4" />
											Thông tin khách hàng
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										<div className="flex items-center gap-2">
											<span className="font-medium">
												{repair.customer.full_name}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-muted-foreground" />
											<span>{repair.customer.phone}</span>
										</div>
										<div className="text-sm text-muted-foreground">
											{repair.customer.email}
										</div>
									</CardContent>
								</Card>

								{/* Device Information */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Laptop className="h-4 w-4" />
											Thông tin thiết bị
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										<div>
											<span className="font-medium">
												{repair.device_info?.brand} {repair.device_info?.model}
											</span>
										</div>
										<div className="text-sm text-muted-foreground">
											S/N: {repair.device_info?.serial_number || "Không có"}
										</div>
										<div className="text-sm">
											Tình trạng ban đầu:{" "}
											{repair.device_info?.initial_condition}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Repair Status and Details */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-4 w-4" />
										Thông tin sửa chữa
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-4">
										<div>
											<Label className="text-sm text-muted-foreground">
												Trạng thái:
											</Label>
											<div>
												<Badge variant={getStatusVariant(repair.status)}>
													{repair.status}
												</Badge>
											</div>
										</div>
										<div>
											<Label className="text-sm text-muted-foreground">
												Độ ưu tiên:
											</Label>
											<div>
												<Badge variant="outline">{repair.priority}</Badge>
											</div>
										</div>
										<div>
											<Label className="text-sm text-muted-foreground">
												Ngày tạo:
											</Label>
											<div className="text-sm">
												{formatDate(repair.created_at)}
											</div>
										</div>
									</div>

									<div>
										<Label className="text-sm text-muted-foreground">
											Mô tả vấn đề:
										</Label>
										<div className="mt-1 p-2 bg-muted rounded">
											{repair.problem_description}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="estimatedHours">
												Thời gian ước tính (giờ)
											</Label>
											<Input
												id="estimatedHours"
												type="number"
												value={estimatedHours}
												onChange={(e) =>
													setEstimatedHours(Number(e.target.value))
												}
												min="0"
												step="0.5"
											/>
										</div>
										<div>
											<Label htmlFor="laborCost">Chi phí nhân công (VND)</Label>
											<Input
												id="laborCost"
												type="number"
												value={laborCost}
												onChange={(e) => setLaborCost(Number(e.target.value))}
												min="0"
											/>
										</div>
									</div>

									<div>
										<Label htmlFor="notes">Ghi chú sửa chữa</Label>
										<Textarea
											id="notes"
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
											placeholder="Nhập ghi chú về quá trình sửa chữa..."
											rows={3}
										/>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Parts Tab */}
						<TabsContent value="parts" className="space-y-4">
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="flex items-center gap-2">
											<Package className="h-4 w-4" />
											Linh kiện đã sử dụng ({currentParts.length})
										</CardTitle>
										<div className="flex gap-2">
											<Button
												variant="outline"
												onClick={() => setIsReservationModalOpen(true)}
												title="Xem trạng thái đặt trước"
											>
												<Clock className="h-4 w-4 mr-2" />
												Đặt trước
											</Button>
											<Button onClick={() => setIsPartsPickerOpen(true)}>
												<Plus className="h-4 w-4 mr-2" />
												Thêm linh kiện
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{currentParts.length === 0 ? (
										<div className="text-center text-muted-foreground py-8">
											<Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
											<p>Chưa sử dụng linh kiện nào</p>
											<Button
												variant="outline"
												className="mt-2"
												onClick={() => setIsPartsPickerOpen(true)}
											>
												Thêm linh kiện đầu tiên
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{currentParts.map((part, index) => (
												<div
													key={`${part.part_id}-${part.quantity_used}-${index}`}
													className="flex items-center justify-between p-3 border rounded-lg"
												>
													<div className="flex-1">
														<div className="font-medium">{part.part_name}</div>
														<div className="text-sm text-muted-foreground">
															Số lượng: {part.quantity} ×{" "}
															{formatVND(part.unit_price)}
														</div>
													</div>
													<div className="text-right">
														<div className="font-medium">
															{formatVND(part.total_cost)}
														</div>
													</div>
												</div>
											))}
											<Separator />
											<div className="flex justify-between font-medium">
												<span>Tổng chi phí linh kiện:</span>
												<span>{formatVND(partsTotalCost)}</span>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Costs Tab */}
						<TabsContent value="costs" className="space-y-4">
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="flex items-center gap-2">
											<Calculator className="h-4 w-4" />
											Quản lý chi phí và báo giá
										</CardTitle>
										<div className="flex gap-2">
											<Button
												variant="outline"
												onClick={() => setIsCostBreakdownOpen(true)}
												disabled={costLoading}
											>
												<Calculator className="h-4 w-4 mr-2" />
												Chi tiết chi phí
											</Button>
											<Button
												onClick={() => setIsQuoteGenerationOpen(true)}
												disabled={costLoading}
											>
												<FileText className="h-4 w-4 mr-2" />
												Tạo báo giá
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
											<div className="text-sm text-blue-700 mb-1">
												Chi phí linh kiện
											</div>
											<div className="text-2xl font-bold text-blue-800">
												{formatVND(partsTotalCost)}
											</div>
											<div className="text-sm text-blue-600">
												{currentParts.length} linh kiện
											</div>
										</div>

										<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
											<div className="text-sm text-green-700 mb-1">
												Chi phí nhân công
											</div>
											<div className="text-2xl font-bold text-green-800">
												{formatVND(laborCost)}
											</div>
											<div className="text-sm text-green-600">
												{estimatedHours} giờ
											</div>
										</div>
									</div>

									<Separator />

									<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
										<div className="flex justify-between items-center">
											<div>
												<div className="text-lg font-medium text-orange-800">
													Tổng chi phí sửa chữa
												</div>
												<div className="text-sm text-orange-600">
													Bao gồm linh kiện và nhân công
												</div>
											</div>
											<div className="text-3xl font-bold text-orange-800">
												{formatVND(totalRepairCost)}
											</div>
										</div>
									</div>

									{/* Cost Breakdown */}
									<div className="space-y-2">
										<Label className="text-sm font-medium">
											Chi tiết chi phí:
										</Label>
										<div className="space-y-1 text-sm">
											<div className="flex justify-between">
												<span>Linh kiện:</span>
												<span>{formatVND(partsTotalCost)}</span>
											</div>
											<div className="flex justify-between">
												<span>Nhân công:</span>
												<span>{formatVND(laborCost)}</span>
											</div>
											<Separator />
											<div className="flex justify-between font-medium">
												<span>Tổng cộng:</span>
												<span>{formatVND(totalRepairCost)}</span>
											</div>
										</div>
									</div>

									{/* Advanced Cost Tracking Info */}
									<div className="mt-4 p-3 bg-gray-50 rounded-lg">
										<div className="text-sm text-muted-foreground mb-2">
											Sử dụng "Chi tiết chi phí" để theo dõi chi phí và lợi
											nhuận chi tiết bao gồm:
										</div>
										<ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
											<li>
												Phân tích lợi nhuận theo từng linh kiện và dịch vụ
											</li>
											<li>Theo dõi chi phí overhead và thuế</li>
											<li>Lịch sử thay đổi chi phí với audit trail</li>
											<li>Tính toán tự động với tỷ suất lợi nhuận</li>
										</ul>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Timeline Tab */}
						<TabsContent value="timeline" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Lịch sử sửa chữa
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
											<div className="flex-1">
												<div className="font-medium">Tiếp nhận thiết bị</div>
												<div className="text-sm text-muted-foreground">
													{formatDate(repair.created_at)}
												</div>
											</div>
										</div>

										{repair.updated_at !== repair.created_at && (
											<div className="flex items-start gap-3">
												<div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
												<div className="flex-1">
													<div className="font-medium">Cập nhật gần nhất</div>
													<div className="text-sm text-muted-foreground">
														{formatDate(repair.updated_at)}
													</div>
												</div>
											</div>
										)}

										{/* Add more timeline events based on repair status */}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>

			{/* Parts Picker Modal */}
			<PartsPickerModal
				isOpen={isPartsPickerOpen}
				onClose={() => setIsPartsPickerOpen(false)}
				onConfirm={handleAddParts}
				onReserve={handleReserveParts}
				repairTicket={repair}
				customerDeviceModel={`${repair.device_info?.brand} ${repair.device_info?.model}`}
				allowReservations={true}
			/>

			{/* Reservation Status Modal */}
			<ReservationStatusModal
				isOpen={isReservationModalOpen}
				onClose={() => setIsReservationModalOpen(false)}
				repairId={repair?.id}
				onReservationUpdate={handleCostUpdate}
			/>

			{/* Cost Breakdown Modal */}
			<CostBreakdownModal
				isOpen={isCostBreakdownOpen}
				onClose={() => setIsCostBreakdownOpen(false)}
				repairId={repair?.id}
				onCostUpdate={handleCostUpdate}
			/>

			{/* Quote Generation Modal */}
			<QuoteGenerationModal
				isOpen={isQuoteGenerationOpen}
				onClose={() => setIsQuoteGenerationOpen(false)}
				repairId={repair?.id}
				onQuoteUpdate={handleCostUpdate}
			/>
		</>
	);
}
