import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Search, Plus, Minus, ShoppingCart, Package, AlertTriangle, CheckCircle, Calculator, Clock, Bookmark } from "lucide-react";
import { usePartsManagement } from "@/hooks/use-parts-management";
import { StockStatusBadge } from "@/components/parts/StockStatusBadge";
import type { Database } from "@/lib/supabase";

type Part = Database["public"]["Tables"]["parts"]["Row"];
type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];

interface SelectedPart {
	part: Part;
	quantity: number;
	notes?: string;
	isReservation?: boolean; // Whether this is a reservation or immediate use
}

interface PartsPickerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (selectedParts: SelectedPart[], totalCost: number) => void;
	onReserve?: (selectedParts: SelectedPart[]) => void; // New callback for reservations
	repairTicket?: RepairTicket;
	customerDeviceModel?: string;
	allowReservations?: boolean; // Whether to show reservation options
}

export function PartsPickerModal({
	isOpen,
	onClose,
	onConfirm,
	onReserve,
	repairTicket,
	customerDeviceModel,
	allowReservations = false
}: PartsPickerModalProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [availableParts, setAvailableParts] = useState<Part[]>([]);
	const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
	const [loading, setLoading] = useState(false);
	const [isReservationMode, setIsReservationMode] = useState(false);
	const [availableStock, setAvailableStock] = useState<Record<string, number>>({});

	const {
		getPartsWithStockStatus,
		searchAvailableParts,
		calculateRepairPartsCost,
		getAvailableStock
	} = usePartsManagement();

	// Load available parts on open
	useEffect(() => {
		if (isOpen) {
			loadAvailableParts();
		}
	}, [isOpen]);

	const loadAvailableParts = async () => {
		try {
			setLoading(true);
			const parts = await getPartsWithStockStatus();
			// Only show parts that are in stock
			const inStockParts = parts.filter(part => part.current_stock > 0);
			setAvailableParts(inStockParts);
		} catch (error) {
			console.error("Error loading parts:", error);
		} finally {
			setLoading(false);
		}
	};

	// Filter parts based on search and device compatibility
	const filteredParts = useMemo(() => {
		let filtered = availableParts;

		// Filter by search term
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(part =>
				part.name?.toLowerCase().includes(searchLower) ||
				part.brand?.toLowerCase().includes(searchLower) ||
				part.category?.toLowerCase().includes(searchLower) ||
				part.part_number?.toLowerCase().includes(searchLower)
			);
		}

		// Prioritize parts compatible with customer's device
		if (customerDeviceModel) {
			const compatibleParts = filtered.filter(part =>
				part.model_compatibility?.some(model =>
					model.toLowerCase().includes(customerDeviceModel.toLowerCase()) ||
					customerDeviceModel.toLowerCase().includes(model.toLowerCase())
				)
			);

			const nonCompatibleParts = filtered.filter(part =>
				!part.model_compatibility?.some(model =>
					model.toLowerCase().includes(customerDeviceModel.toLowerCase()) ||
					customerDeviceModel.toLowerCase().includes(model.toLowerCase())
				)
			);

			// Return compatible parts first, then others
			filtered = [...compatibleParts, ...nonCompatibleParts];
		}

		return filtered;
	}, [availableParts, searchTerm, customerDeviceModel]);

	// Calculate total cost
	const totalCost = useMemo(() => {
		return selectedParts.reduce((total, selected) =>
			total + (selected.part.unit_price || 0) * selected.quantity, 0
		);
	}, [selectedParts]);

	// Add part to selection
	const addPartToSelection = (part: Part) => {
		const existing = selectedParts.find(s => s.part.id === part.id);
		if (existing) {
			// Increase quantity if not exceeding stock
			if (existing.quantity < part.current_stock) {
				setSelectedParts(prev =>
					prev.map(s =>
						s.part.id === part.id
							? { ...s, quantity: s.quantity + 1 }
							: s
					)
				);
			}
		} else {
			// Add new part
			setSelectedParts(prev => [...prev, { part, quantity: 1 }]);
		}
	};

	// Remove part from selection
	const removePartFromSelection = (partId: string) => {
		setSelectedParts(prev => prev.filter(s => s.part.id !== partId));
	};

	// Update part quantity
	const updatePartQuantity = (partId: string, quantity: number) => {
		if (quantity <= 0) {
			removePartFromSelection(partId);
		} else {
			setSelectedParts(prev =>
				prev.map(s =>
					s.part.id === partId
						? { ...s, quantity: Math.min(quantity, s.part.current_stock) }
						: s
				)
			);
		}
	};

	// Check if part is compatible with customer device
	const isPartCompatible = (part: Part): boolean => {
		if (!customerDeviceModel || !part.model_compatibility) return false;
		return part.model_compatibility.some(model =>
			model.toLowerCase().includes(customerDeviceModel.toLowerCase()) ||
			customerDeviceModel.toLowerCase().includes(model.toLowerCase())
		);
	};

	// Table columns for available parts
	const partColumns: ColumnDef<Part>[] = [
		{
			accessorKey: "name",
			header: "Tên linh kiện",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<div>
						<div className="font-medium">{row.original.name}</div>
						<div className="text-sm text-muted-foreground">
							{row.original.part_number}
						</div>
					</div>
					{isPartCompatible(row.original) && (
						<Badge variant="secondary" className="text-xs">
							<CheckCircle className="h-3 w-3 mr-1" />
							Tương thích
						</Badge>
					)}
				</div>
			),
		},
		{
			accessorKey: "category",
			header: "Danh mục",
			cell: ({ row }) => (
				<div>
					<div>{row.original.category}</div>
					<div className="text-sm text-muted-foreground">{row.original.brand}</div>
				</div>
			),
		},
		{
			accessorKey: "current_stock",
			header: "Tồn kho",
			cell: ({ row }) => (
				<div className="text-center">
					<div className="font-medium">{row.original.current_stock}</div>
					<StockStatusBadge part={row.original} showIcon={false} />
				</div>
			),
		},
		{
			accessorKey: "unit_price",
			header: "Giá",
			cell: ({ row }) => (
				<div className="text-right font-medium">
					{new Intl.NumberFormat("vi-VN", {
						style: "currency",
						currency: "VND",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0
					}).format(row.original.unit_price || 0)}
				</div>
			),
		},
		{
			id: "actions",
			header: "Thao tác",
			cell: ({ row }) => {
				const selectedPart = selectedParts.find(s => s.part.id === row.original.id);
				const isSelected = !!selectedPart;
				const canAdd = row.original.current_stock > (selectedPart?.quantity || 0);

				return (
					<div className="flex items-center gap-1">
						{isSelected ? (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => updatePartQuantity(row.original.id, selectedPart.quantity - 1)}
								>
									<Minus className="h-3 w-3" />
								</Button>
								<span className="mx-2 font-medium">{selectedPart.quantity}</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => updatePartQuantity(row.original.id, selectedPart.quantity + 1)}
									disabled={!canAdd}
								>
									<Plus className="h-3 w-3" />
								</Button>
							</>
						) : (
							<Button
								variant="outline"
								size="sm"
								onClick={() => addPartToSelection(row.original)}
								disabled={row.original.current_stock === 0}
							>
								<Plus className="h-4 w-4 mr-1" />
								Chọn
							</Button>
						)}
					</div>
				);
			},
		},
	];

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	};

	const handleConfirm = () => {
		onConfirm(selectedParts, totalCost);
		setSelectedParts([]);
		setSearchTerm("");
		setIsReservationMode(false);
		onClose();
	};

	const handleReserve = () => {
		if (onReserve) {
			onReserve(selectedParts.map(part => ({ ...part, isReservation: true })));
		}
		setSelectedParts([]);
		setSearchTerm("");
		setIsReservationMode(false);
		onClose();
	};

	const handleCancel = () => {
		setSelectedParts([]);
		setSearchTerm("");
		setIsReservationMode(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleCancel}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Chọn linh kiện cho sửa chữa
					</DialogTitle>
					<DialogDescription className="space-y-2">
						{customerDeviceModel && (
							<div>Thiết bị khách hàng: <strong>{customerDeviceModel}</strong></div>
						)}
						{allowReservations && (
							<div className="flex items-center gap-4">
								<span className="text-sm">Chế độ:</span>
								<div className="flex items-center gap-2">
									<Button
										variant={!isReservationMode ? "default" : "outline"}
										size="sm"
										onClick={() => setIsReservationMode(false)}
									>
										<CheckCircle className="h-3 w-3 mr-1" />
										Sử dụng ngay
									</Button>
									<Button
										variant={isReservationMode ? "default" : "outline"}
										size="sm"
										onClick={() => setIsReservationMode(true)}
									>
										<Bookmark className="h-3 w-3 mr-1" />
										Đặt trước
									</Button>
								</div>
							</div>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Available Parts Panel */}
					<div className="lg:col-span-2 space-y-4">
						{/* Search */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder="Tìm kiếm linh kiện theo tên, mã, danh mục..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Device Compatibility Alert */}
						{customerDeviceModel && (
							<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-blue-600" />
									<span className="text-sm text-blue-700">
										Linh kiện tương thích với <strong>{customerDeviceModel}</strong> được ưu tiên hiển thị
									</span>
								</div>
							</div>
						)}

						{/* Parts Table */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">
									Linh kiện có sẵn ({filteredParts.length})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<DataTable
									columns={partColumns}
									data={filteredParts}
									searchKey="name"
									searchPlaceholder="Tìm kiếm trong bảng..."
								/>
							</CardContent>
						</Card>
					</div>

					{/* Selected Parts Panel */}
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-4 w-4" />
									Linh kiện đã chọn ({selectedParts.length})
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{selectedParts.length === 0 ? (
									<div className="text-center text-muted-foreground py-8">
										<Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
										<p>Chưa chọn linh kiện nào</p>
									</div>
								) : (
									<div className="space-y-3">
										{selectedParts.map((selected) => (
											<div key={selected.part.id} className="p-3 border rounded-lg">
												<div className="flex justify-between items-start mb-2">
													<div className="flex-1">
														<div className="font-medium text-sm">{selected.part.name}</div>
														<div className="text-xs text-muted-foreground">
															{selected.part.part_number}
														</div>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => removePartFromSelection(selected.part.id)}
														className="h-6 w-6 p-0"
													>
														<Minus className="h-3 w-3" />
													</Button>
												</div>

												<div className="flex items-center justify-between text-sm">
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => updatePartQuantity(selected.part.id, selected.quantity - 1)}
															className="h-6 w-6 p-0"
														>
															<Minus className="h-3 w-3" />
														</Button>
														<span className="font-medium">{selected.quantity}</span>
														<Button
															variant="outline"
															size="sm"
															onClick={() => updatePartQuantity(selected.part.id, selected.quantity + 1)}
															disabled={selected.quantity >= selected.part.current_stock}
															className="h-6 w-6 p-0"
														>
															<Plus className="h-3 w-3" />
														</Button>
													</div>
													<div className="text-right">
														<div className="font-medium">
															{formatPrice((selected.part.unit_price || 0) * selected.quantity)}
														</div>
														<div className="text-xs text-muted-foreground">
															{formatPrice(selected.part.unit_price || 0)}/cái
														</div>
													</div>
												</div>

												{selected.quantity >= selected.part.current_stock && (
													<div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
														<AlertTriangle className="h-3 w-3" />
														Đã chọn hết tồn kho
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Cost Summary */}
						{selectedParts.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calculator className="h-4 w-4" />
										Tổng chi phí
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span>Tổng số linh kiện:</span>
											<span>{selectedParts.reduce((sum, s) => sum + s.quantity, 0)}</span>
										</div>
										<Separator />
										<div className="flex justify-between font-medium">
											<span>Tổng tiền linh kiện:</span>
											<span className="text-lg">{formatPrice(totalCost)}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>

				<DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
					{isReservationMode && selectedParts.length > 0 && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Clock className="h-4 w-4" />
							<span>Đặt trước 24 giờ - có thể hủy hoặc xác nhận sau</span>
						</div>
					)}
					<div className="flex gap-2 w-full sm:w-auto">
						<Button variant="outline" onClick={handleCancel}>
							Hủy
						</Button>
						{allowReservations && isReservationMode && onReserve ? (
							<Button
								onClick={handleReserve}
								disabled={selectedParts.length === 0}
								className="flex-1 sm:flex-none"
							>
								<Bookmark className="h-4 w-4 mr-2" />
								Đặt trước ({selectedParts.length} linh kiện)
							</Button>
						) : (
							<Button
								onClick={handleConfirm}
								disabled={selectedParts.length === 0}
								className="flex-1 sm:flex-none"
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Xác nhận ({selectedParts.length} linh kiện)
							</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}