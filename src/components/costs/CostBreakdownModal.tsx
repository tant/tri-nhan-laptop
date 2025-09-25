import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	type CostBreakdown,
	type CostSummary,
	useCostTracking,
} from "@/hooks/use-cost-tracking";
import {
	CostTerms,
	formatNumberInput,
	formatPercentage,
	formatVND,
	formatVNDDetailed,
	getProfitAmountColor,
	getProfitMarginColor,
	parseVND,
} from "@/lib/currency";
import {
	AlertCircle,
	Calculator,
	Clock,
	DollarSign,
	Edit3,
	Minus,
	Package,
	Plus,
	Settings,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CostBreakdownModalProps {
	isOpen: boolean;
	onClose: () => void;
	repairId?: string;
	onCostUpdate?: () => void;
}

interface AddCostItemForm {
	breakdown_type: CostBreakdown["breakdown_type"];
	item_name: string;
	quantity: number;
	unit_cost: number;
	unit_price: number;
	notes: string;
}

export function CostBreakdownModal({
	isOpen,
	onClose,
	repairId,
	onCostUpdate,
}: CostBreakdownModalProps) {
	const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
	const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
	const [loading, setLoading] = useState(false);
	const [showAddForm, setShowAddForm] = useState(false);
	const [addItemForm, setAddItemForm] = useState<AddCostItemForm>({
		breakdown_type: "parts",
		item_name: "",
		quantity: 1,
		unit_cost: 0,
		unit_price: 0,
		notes: "",
	});

	const {
		getRepairCostBreakdown,
		calculateRepairCosts,
		addCostBreakdown,
		removeCostBreakdown,
		updateRepairTotals,
	} = useCostTracking();

	// Load cost breakdown when modal opens
	useEffect(() => {
		if (isOpen && repairId) {
			loadCostBreakdown();
		}
	}, [isOpen, repairId]);

	const loadCostBreakdown = async () => {
		if (!repairId) return;

		try {
			setLoading(true);

			// Load cost breakdown items
			const breakdown = await getRepairCostBreakdown(repairId);
			setCostBreakdown(breakdown);

			// Calculate cost summary
			const summary = await calculateRepairCosts(repairId);
			setCostSummary(summary);
		} catch (error) {
			console.error("Error loading cost breakdown:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddCostItem = async () => {
		if (!repairId) return;

		try {
			setLoading(true);

			const newItem = await addCostBreakdown(
				repairId,
				addItemForm.breakdown_type,
				addItemForm.item_name,
				addItemForm.quantity,
				addItemForm.unit_cost,
				addItemForm.unit_price,
				undefined, // item_id
				addItemForm.notes || undefined,
				"current-user-id", // TODO: Get real user ID
			);

			if (newItem) {
				// Reload cost breakdown
				await loadCostBreakdown();

				// Update repair totals
				await updateRepairTotals(repairId);

				// Reset form
				setAddItemForm({
					breakdown_type: "parts",
					item_name: "",
					quantity: 1,
					unit_cost: 0,
					unit_price: 0,
					notes: "",
				});

				setShowAddForm(false);

				if (onCostUpdate) {
					onCostUpdate();
				}
			}
		} catch (error) {
			console.error("Error adding cost item:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveCostItem = async (itemId: string) => {
		try {
			setLoading(true);

			const success = await removeCostBreakdown(itemId);
			if (success && repairId) {
				// Reload cost breakdown
				await loadCostBreakdown();

				// Update repair totals
				await updateRepairTotals(repairId);

				if (onCostUpdate) {
					onCostUpdate();
				}
			}
		} catch (error) {
			console.error("Error removing cost item:", error);
		} finally {
			setLoading(false);
		}
	};

	const getBreakdownTypeIcon = (type: CostBreakdown["breakdown_type"]) => {
		switch (type) {
			case "parts":
				return <Package className="h-4 w-4" />;
			case "labor":
				return <Clock className="h-4 w-4" />;
			case "overhead":
				return <Settings className="h-4 w-4" />;
			case "tax":
				return <TrendingUp className="h-4 w-4" />;
			case "discount":
				return <Minus className="h-4 w-4" />;
			default:
				return <DollarSign className="h-4 w-4" />;
		}
	};

	const getBreakdownTypeBadge = (type: CostBreakdown["breakdown_type"]) => {
		const colors = {
			parts: "bg-blue-100 text-blue-800",
			labor: "bg-green-100 text-green-800",
			overhead: "bg-gray-100 text-gray-800",
			tax: "bg-orange-100 text-orange-800",
			discount: "bg-red-100 text-red-800",
		};

		return (
			<Badge variant="outline" className={colors[type]}>
				{getBreakdownTypeIcon(type)}
				<span className="ml-1">{CostTerms[type]}</span>
			</Badge>
		);
	};

	const handleFormFieldChange = (
		field: keyof AddCostItemForm,
		value: AddCostItemForm[keyof AddCostItemForm],
	) => {
		setAddItemForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleNumberInput = (
		field: "quantity" | "unit_cost" | "unit_price",
		value: string,
	) => {
		if (field === "quantity") {
			const numValue = Number.parseFloat(value) || 0;
			setAddItemForm((prev) => ({ ...prev, [field]: numValue }));
		} else {
			const numValue = parseVND(value);
			setAddItemForm((prev) => ({ ...prev, [field]: numValue }));
		}
	};

	if (loading && costBreakdown.length === 0) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Calculator className="h-5 w-5" />
							Chi tiết chi phí sửa chữa
						</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center py-8">
						<div className="text-muted-foreground">
							Đang tải chi tiết chi phí...
						</div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Chi tiết chi phí sửa chữa
					</DialogTitle>
					<DialogDescription>
						Quản lý chi phí chi tiết và theo dõi lợi nhuận cho phiếu sửa chữa
						này
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Cost Summary */}
					{costSummary && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									Tổng quan chi phí
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">
											Chi phí tổng
										</div>
										<div className="text-lg font-semibold">
											{formatVNDDetailed(costSummary.total_cost)}
										</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">
											Doanh thu
										</div>
										<div className="text-lg font-semibold">
											{formatVNDDetailed(costSummary.total_revenue)}
										</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">
											Lợi nhuận
										</div>
										<div
											className={`text-lg font-semibold ${getProfitAmountColor(costSummary.profit_amount)}`}
										>
											{formatVNDDetailed(costSummary.profit_amount)}
										</div>
									</div>
									<div className="text-center p-4 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">
											Tỷ suất LN
										</div>
										<div
											className={`text-lg font-semibold ${getProfitMarginColor(costSummary.profit_margin)}`}
										>
											{formatPercentage(costSummary.profit_margin)}
										</div>
									</div>
								</div>

								<Separator className="my-4" />

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
									<div className="flex justify-between">
										<span>Linh kiện:</span>
										<div className="text-right">
											<div>
												{formatVND(costSummary.parts_revenue)} -{" "}
												{formatVND(costSummary.parts_cost)}
											</div>
											<div
												className={getProfitAmountColor(
													costSummary.parts_revenue - costSummary.parts_cost,
												)}
											>
												={" "}
												{formatVNDDetailed(
													costSummary.parts_revenue - costSummary.parts_cost,
												)}
											</div>
										</div>
									</div>
									<div className="flex justify-between">
										<span>Công lao động:</span>
										<div className="text-right">
											<div>
												{formatVND(costSummary.labor_revenue)} -{" "}
												{formatVND(costSummary.labor_cost)}
											</div>
											<div
												className={getProfitAmountColor(
													costSummary.labor_revenue - costSummary.labor_cost,
												)}
											>
												={" "}
												{formatVNDDetailed(
													costSummary.labor_revenue - costSummary.labor_cost,
												)}
											</div>
										</div>
									</div>
									<div className="flex justify-between">
										<span>Chi phí khác:</span>
										<div className="text-right">
											<div className="text-red-600">
												{formatVND(costSummary.overhead_cost)}
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Add Item Form */}
					{showAddForm && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Plus className="h-4 w-4" />
									Thêm chi phí mới
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="breakdown_type">Loại chi phí</Label>
										<Select
											value={addItemForm.breakdown_type}
											onValueChange={(value) =>
												handleFormFieldChange("breakdown_type", value)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Chọn loại chi phí" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="parts">{CostTerms.parts}</SelectItem>
												<SelectItem value="labor">{CostTerms.labor}</SelectItem>
												<SelectItem value="overhead">
													{CostTerms.overhead}
												</SelectItem>
												<SelectItem value="tax">{CostTerms.tax}</SelectItem>
												<SelectItem value="discount">
													{CostTerms.discount}
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="item_name">Tên mục chi phí</Label>
										<Input
											id="item_name"
											value={addItemForm.item_name}
											onChange={(e) =>
												handleFormFieldChange("item_name", e.target.value)
											}
											placeholder="Mô tả chi phí..."
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label htmlFor="quantity">Số lượng</Label>
										<Input
											id="quantity"
											type="number"
											step="0.01"
											min="0"
											value={addItemForm.quantity}
											onChange={(e) =>
												handleNumberInput("quantity", e.target.value)
											}
										/>
									</div>
									<div>
										<Label htmlFor="unit_cost">Đơn giá vốn (₫)</Label>
										<Input
											id="unit_cost"
											value={formatNumberInput(
												addItemForm.unit_cost.toString(),
											)}
											onChange={(e) =>
												handleNumberInput("unit_cost", e.target.value)
											}
											placeholder="0"
										/>
									</div>
									<div>
										<Label htmlFor="unit_price">Đơn giá bán (₫)</Label>
										<Input
											id="unit_price"
											value={formatNumberInput(
												addItemForm.unit_price.toString(),
											)}
											onChange={(e) =>
												handleNumberInput("unit_price", e.target.value)
											}
											placeholder="0"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
									<Textarea
										id="notes"
										value={addItemForm.notes}
										onChange={(e) =>
											handleFormFieldChange("notes", e.target.value)
										}
										placeholder="Ghi chú thêm về chi phí này..."
										rows={2}
									/>
								</div>

								{/* Preview */}
								{addItemForm.item_name && addItemForm.quantity > 0 && (
									<div className="p-3 bg-muted rounded-lg">
										<div className="text-sm text-muted-foreground">
											Xem trước:
										</div>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
											<div>
												<span className="font-medium">Chi phí: </span>
												{formatVND(
													addItemForm.quantity * addItemForm.unit_cost,
												)}
											</div>
											<div>
												<span className="font-medium">Doanh thu: </span>
												{formatVND(
													addItemForm.quantity * addItemForm.unit_price,
												)}
											</div>
											<div>
												<span className="font-medium">Lợi nhuận: </span>
												<span
													className={getProfitAmountColor(
														addItemForm.quantity * addItemForm.unit_price -
															addItemForm.quantity * addItemForm.unit_cost,
													)}
												>
													{formatVND(
														addItemForm.quantity * addItemForm.unit_price -
															addItemForm.quantity * addItemForm.unit_cost,
													)}
												</span>
											</div>
											<div>
												<span className="font-medium">Tỷ suất: </span>
												<span
													className={getProfitMarginColor(
														addItemForm.unit_price > 0
															? ((addItemForm.quantity *
																	addItemForm.unit_price -
																	addItemForm.quantity *
																		addItemForm.unit_cost) /
																	(addItemForm.quantity *
																		addItemForm.unit_price)) *
																	100
															: 0,
													)}
												>
													{formatPercentage(
														addItemForm.unit_price > 0
															? ((addItemForm.quantity *
																	addItemForm.unit_price -
																	addItemForm.quantity *
																		addItemForm.unit_cost) /
																	(addItemForm.quantity *
																		addItemForm.unit_price)) *
																	100
															: 0,
													)}
												</span>
											</div>
										</div>
									</div>
								)}

								<div className="flex gap-2 justify-end">
									<Button
										variant="outline"
										onClick={() => setShowAddForm(false)}
										disabled={loading}
									>
										Hủy
									</Button>
									<Button
										onClick={handleAddCostItem}
										disabled={
											loading ||
											!addItemForm.item_name ||
											addItemForm.quantity <= 0
										}
									>
										{loading ? "Đang thêm..." : "Thêm chi phí"}
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Cost Breakdown Items */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">
								Chi tiết chi phí ({costBreakdown.length} mục)
							</h3>
							{!showAddForm && (
								<Button onClick={() => setShowAddForm(true)} disabled={loading}>
									<Plus className="h-4 w-4 mr-2" />
									Thêm chi phí
								</Button>
							)}
						</div>

						{costBreakdown.length === 0 ? (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Chưa có chi phí nào được thêm cho phiếu sửa chữa này. Nhấn
									"Thêm chi phí" để bắt đầu theo dõi chi phí.
								</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-3">
								{costBreakdown.map((item) => (
									<Card key={item.id}>
										<CardContent className="pt-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														{getBreakdownTypeBadge(item.breakdown_type)}
														<h4 className="font-medium">{item.item_name}</h4>
													</div>

													<div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
														<div>
															<div className="text-muted-foreground">
																Số lượng
															</div>
															<div className="font-medium">{item.quantity}</div>
														</div>
														<div>
															<div className="text-muted-foreground">
																Giá vốn/đơn vị
															</div>
															<div className="font-medium">
																{formatVND(item.unit_cost)}
															</div>
														</div>
														<div>
															<div className="text-muted-foreground">
																Giá bán/đơn vị
															</div>
															<div className="font-medium">
																{formatVND(item.unit_price)}
															</div>
														</div>
														<div>
															<div className="text-muted-foreground">
																Tổng chi phí
															</div>
															<div className="font-medium text-red-600">
																{formatVND(item.total_cost)}
															</div>
														</div>
														<div>
															<div className="text-muted-foreground">
																Tổng doanh thu
															</div>
															<div className="font-medium text-green-600">
																{formatVND(item.total_price)}
															</div>
														</div>
														<div>
															<div className="text-muted-foreground">
																Lợi nhuận
															</div>
															<div
																className={`font-medium ${getProfitAmountColor(item.profit_amount)}`}
															>
																{formatVND(item.profit_amount)}
															</div>
															<div
																className={`text-xs ${getProfitMarginColor(item.profit_margin)}`}
															>
																{formatPercentage(item.profit_margin)}
															</div>
														</div>
													</div>

													{item.notes && (
														<div className="mt-2 text-sm text-muted-foreground">
															<span className="font-medium">Ghi chú: </span>
															{item.notes}
														</div>
													)}
												</div>

												<div className="flex gap-1 ml-4">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setEditingItem(item)}
														disabled={loading}
													>
														<Edit3 className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveCostItem(item.id)}
														disabled={loading}
														className="text-red-600 hover:text-red-700"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Đóng
					</Button>
					<Button onClick={loadCostBreakdown} disabled={loading}>
						<Calculator className="h-4 w-4 mr-2" />
						{loading ? "Đang tải..." : "Làm mới"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
