import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/contexts/auth-context";
import { usePartsManagement } from "@/hooks/use-parts-management";
import type { Database } from "@/lib/supabase";
import {
	AlertTriangle,
	Minus,
	Package,
	Plus,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface StockAdjustmentModalProps {
	part: Part | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

type AdjustmentType = "increase" | "decrease" | "set_absolute";
type ReasonCode =
	| "received_shipment"
	| "damaged_goods"
	| "theft_loss"
	| "used_in_repair"
	| "inventory_count"
	| "returned_goods"
	| "other";

const REASON_CODES: Record<ReasonCode, string> = {
	received_shipment: "Nhận hàng từ nhà cung cấp",
	damaged_goods: "Hàng hóa bị hỏng",
	theft_loss: "Mất mát/Trộm cắp",
	used_in_repair: "Đã sử dụng trong sửa chữa",
	inventory_count: "Kiểm kê kho",
	returned_goods: "Hàng trả lại",
	other: "Lý do khác",
};

export function StockAdjustmentModal({
	part,
	isOpen,
	onClose,
	onSuccess,
}: StockAdjustmentModalProps) {
	const [adjustmentType, setAdjustmentType] =
		useState<AdjustmentType>("increase");
	const [quantity, setQuantity] = useState<number>(0);
	const [newStock, setNewStock] = useState<number>(0);
	const [reasonCode, setReasonCode] = useState<ReasonCode>("received_shipment");
	const [notes, setNotes] = useState("");
	const [cost, setCost] = useState<number>(0);
	const [loading, setLoading] = useState(false);

	const { updatePartStock } = usePartsManagement();
	const { user } = useAuth();

	// Calculate final stock quantity based on adjustment type
	const calculateFinalStock = () => {
		if (!part) return 0;

		switch (adjustmentType) {
			case "increase":
				return part.current_stock + quantity;
			case "decrease":
				return Math.max(0, part.current_stock - quantity);
			case "set_absolute":
				return newStock;
			default:
				return part.current_stock;
		}
	};

	const finalStock = calculateFinalStock();

	// Get stock status for the new quantity
	const getStockStatus = (stock: number) => {
		const minStock = part?.min_stock_level || 5;
		if (stock === 0) {
			return {
				label: "Hết hàng",
				variant: "destructive" as const,
				icon: AlertTriangle,
			};
		}
		if (stock <= minStock) {
			return {
				label: "Sắp hết",
				variant: "outline" as const,
				icon: TrendingDown,
			};
		}
		return {
			label: "Còn hàng",
			variant: "secondary" as const,
			icon: Package,
		};
	};

	const handleSubmit = async () => {
		if (!part || !user) return;

		try {
			setLoading(true);

			await updatePartStock(
				part.id,
				finalStock,
				cost,
				user.id,
				`${REASON_CODES[reasonCode]}${notes ? ` - ${notes}` : ""}`,
			);

			onSuccess();
			onClose();
			resetForm();
		} catch (error) {
			console.error("Stock adjustment failed:", error);
			// TODO: Show error notification
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setAdjustmentType("increase");
		setQuantity(0);
		setNewStock(0);
		setReasonCode("received_shipment");
		setNotes("");
		setCost(0);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	if (!part) return null;

	const currentStatus = getStockStatus(part.current_stock);
	const newStatus = getStockStatus(finalStock);
	const CurrentIcon = currentStatus.icon;
	const _NewIcon = newStatus.icon;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Điều chỉnh tồn kho
					</DialogTitle>
					<DialogDescription>
						Cập nhật số lượng tồn kho cho {part.name}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Current Stock Info */}
					<Card>
						<CardContent className="pt-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium">
										Tồn kho hiện tại
									</Label>
									<div className="flex items-center gap-2 mt-1">
										<span className="text-2xl font-bold">
											{part.current_stock}
										</span>
										<Badge variant={currentStatus.variant}>
											<CurrentIcon className="h-3 w-3 mr-1" />
											{currentStatus.label}
										</Badge>
									</div>
								</div>
								<div>
									<Label className="text-sm font-medium">
										Tồn kho tối thiểu
									</Label>
									<div className="text-2xl font-bold text-muted-foreground mt-1">
										{part.min_stock_level || 5}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Adjustment Type */}
					<div className="space-y-2">
						<Label>Loại điều chỉnh</Label>
						<Select
							value={adjustmentType}
							onValueChange={(value: AdjustmentType) =>
								setAdjustmentType(value)
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="increase">
									<div className="flex items-center gap-2">
										<Plus className="h-4 w-4 text-green-500" />
										Tăng tồn kho
									</div>
								</SelectItem>
								<SelectItem value="decrease">
									<div className="flex items-center gap-2">
										<Minus className="h-4 w-4 text-red-500" />
										Giảm tồn kho
									</div>
								</SelectItem>
								<SelectItem value="set_absolute">
									<div className="flex items-center gap-2">
										<TrendingUp className="h-4 w-4 text-blue-500" />
										Đặt số lượng cụ thể
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Quantity Input */}
					<div className="grid grid-cols-2 gap-4">
						{adjustmentType === "set_absolute" ? (
							<div className="space-y-2">
								<Label htmlFor="newStock">Số lượng mới</Label>
								<Input
									id="newStock"
									type="number"
									min="0"
									value={newStock}
									onChange={(e) => setNewStock(Number(e.target.value))}
									placeholder="Nhập số lượng mới"
								/>
							</div>
						) : (
							<div className="space-y-2">
								<Label htmlFor="quantity">
									Số lượng {adjustmentType === "increase" ? "tăng" : "giảm"}
								</Label>
								<Input
									id="quantity"
									type="number"
									min="0"
									max={
										adjustmentType === "decrease"
											? part.current_stock
											: undefined
									}
									value={quantity}
									onChange={(e) => setQuantity(Number(e.target.value))}
									placeholder={`Nhập số lượng ${adjustmentType === "increase" ? "tăng" : "giảm"}`}
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="cost">Giá nhập (VND)</Label>
							<Input
								id="cost"
								type="number"
								min="0"
								value={cost}
								onChange={(e) => setCost(Number(e.target.value))}
								placeholder="Nhập giá nhập"
							/>
						</div>
					</div>

					{/* Reason Code */}
					<div className="space-y-2">
						<Label>Lý do điều chỉnh</Label>
						<Select
							value={reasonCode}
							onValueChange={(value: ReasonCode) => setReasonCode(value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(REASON_CODES).map(([code, label]) => (
									<SelectItem key={code} value={code}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
						<Textarea
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Nhập ghi chú bổ sung..."
							rows={3}
						/>
					</div>

					{/* Preview */}
					<Card className="border-dashed">
						<CardContent className="pt-6">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<Label className="text-sm text-muted-foreground">
										Hiện tại
									</Label>
									<div className="flex items-center justify-center gap-2 mt-1">
										<span className="text-xl font-bold">
											{part.current_stock}
										</span>
										<Badge variant={currentStatus.variant} className="text-xs">
											{currentStatus.label}
										</Badge>
									</div>
								</div>
								<div className="flex items-center justify-center">
									<TrendingUp className="h-6 w-6 text-muted-foreground" />
								</div>
								<div>
									<Label className="text-sm text-muted-foreground">
										Sau điều chỉnh
									</Label>
									<div className="flex items-center justify-center gap-2 mt-1">
										<span className="text-xl font-bold">{finalStock}</span>
										<Badge variant={newStatus.variant} className="text-xs">
											{newStatus.label}
										</Badge>
									</div>
								</div>
							</div>
							{cost > 0 && (
								<div className="mt-4 pt-4 border-t text-center">
									<Label className="text-sm text-muted-foreground">
										Tổng giá trị
									</Label>
									<div className="text-lg font-semibold text-green-600 mt-1">
										{formatPrice(finalStock * cost)}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Warnings */}
					{finalStock === 0 && (
						<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
							<AlertTriangle className="h-4 w-4 text-red-500" />
							<span className="text-sm text-red-700">
								Cảnh báo: Sau điều chỉnh, linh kiện này sẽ hết hàng
							</span>
						</div>
					)}
					{finalStock > 0 && finalStock <= (part.min_stock_level || 5) && (
						<div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
							<TrendingDown className="h-4 w-4 text-orange-500" />
							<span className="text-sm text-orange-700">
								Cảnh báo: Số lượng sau điều chỉnh thấp hơn mức tối thiểu
							</span>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Hủy
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={
							loading ||
							(adjustmentType !== "set_absolute" && quantity === 0) ||
							(adjustmentType === "set_absolute" && newStock < 0)
						}
					>
						{loading ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
