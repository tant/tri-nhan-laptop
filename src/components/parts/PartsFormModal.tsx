import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Package, Plus, X, Save, FileEdit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type { Database } from "@/lib/supabase";

type Part = Database["public"]["Tables"]["parts"]["Row"];

interface PartsFormModalProps {
	part?: Part | null; // undefined = create new, null = closed, Part = edit existing
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface PartFormData {
	name: string;
	part_number: string;
	category: string;
	brand: string;
	description: string;
	unit_price: number;
	cost_price: number;
	selling_price: number;
	current_stock: number;
	min_stock_level: number;
	supplier_info: string;
	location: string;
	model_compatibility: string[];
	warranty_period: number;
	part_condition: "new" | "refurbished" | "used";
}

const PART_CATEGORIES = [
	"Memory", "Storage", "Display", "Battery", "Cooling", "Input",
	"Power", "Network", "Audio", "Motherboard", "CPU", "Graphics"
];

const POPULAR_BRANDS = [
	"Samsung", "SK Hynix", "Crucial", "Kingston", "Western Digital",
	"Seagate", "Intel", "AMD", "NVIDIA", "LG", "BOE", "AUO"
];

const LAPTOP_MODELS = [
	"Dell Inspiron 15", "HP Pavilion 14", "Lenovo ThinkPad E14",
	"Asus ROG Strix", "Acer Aspire 5", "MacBook Pro 13",
	"HP ProBook 450", "Dell Latitude 7420"
];

export function PartsFormModal({ part, isOpen, onClose, onSuccess }: PartsFormModalProps) {
	const [formData, setFormData] = useState<PartFormData>({
		name: "",
		part_number: "",
		category: "",
		brand: "",
		description: "",
		unit_price: 0,
		cost_price: 0,
		selling_price: 0,
		current_stock: 0,
		min_stock_level: 5,
		supplier_info: "",
		location: "",
		model_compatibility: [],
		warranty_period: 12,
		part_condition: "new"
	});

	const [modelInput, setModelInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { user } = useAuth();
	const isEditMode = !!part;

	// Load part data when editing
	useEffect(() => {
		if (part) {
			setFormData({
				name: part.name || "",
				part_number: part.part_number || "",
				category: part.category || "",
				brand: part.brand || "",
				description: part.description || "",
				unit_price: part.unit_price || 0,
				cost_price: part.cost_price || 0,
				selling_price: part.selling_price || 0,
				current_stock: part.current_stock || 0,
				min_stock_level: part.min_stock_level || 5,
				supplier_info: part.supplier_info || "",
				location: part.location || "",
				model_compatibility: part.model_compatibility || [],
				warranty_period: part.warranty_period || 12,
				part_condition: (part.part_condition as "new" | "refurbished" | "used") || "new"
			});
		} else {
			// Reset form for new part
			setFormData({
				name: "",
				part_number: "",
				category: "",
				brand: "",
				description: "",
				unit_price: 0,
				cost_price: 0,
				selling_price: 0,
				current_stock: 0,
				min_stock_level: 5,
				supplier_info: "",
				location: "",
				model_compatibility: [],
				warranty_period: 12,
				part_condition: "new"
			});
		}
		setErrors({});
	}, [part]);

	const updateFormData = (field: keyof PartFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const addModelCompatibility = (model: string) => {
		if (model && !formData.model_compatibility.includes(model)) {
			updateFormData("model_compatibility", [...formData.model_compatibility, model]);
		}
		setModelInput("");
	};

	const removeModelCompatibility = (model: string) => {
		updateFormData("model_compatibility",
			formData.model_compatibility.filter(m => m !== model)
		);
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Tên linh kiện là bắt buộc";
		}

		if (!formData.part_number.trim()) {
			newErrors.part_number = "Mã linh kiện là bắt buộc";
		}

		if (!formData.category) {
			newErrors.category = "Danh mục là bắt buộc";
		}

		if (formData.unit_price <= 0) {
			newErrors.unit_price = "Giá bán phải lớn hơn 0";
		}

		if (formData.cost_price < 0) {
			newErrors.cost_price = "Giá nhập không được âm";
		}

		if (formData.selling_price <= 0) {
			newErrors.selling_price = "Giá bán lẻ phải lớn hơn 0";
		}

		if (formData.current_stock < 0) {
			newErrors.current_stock = "Tồn kho không được âm";
		}

		if (formData.min_stock_level < 0) {
			newErrors.min_stock_level = "Mức tồn kho tối thiểu không được âm";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!user || !validateForm()) return;

		try {
			setLoading(true);

			const partData = {
				...formData,
				updated_at: new Date().toISOString(),
				...(isEditMode ? {} : { created_at: new Date().toISOString() })
			};

			if (isEditMode && part) {
				// Update existing part
				const { error } = await supabase
					.from("parts")
					.update(partData)
					.eq("id", part.id);

				if (error) throw error;
			} else {
				// Create new part
				const { error } = await supabase
					.from("parts")
					.insert([partData]);

				if (error) throw error;
			}

			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error saving part:", error);
			setErrors({ submit: "Lỗi khi lưu linh kiện. Vui lòng thử lại." });
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{isEditMode ? (
							<>
								<FileEdit className="h-5 w-5" />
								Chỉnh sửa linh kiện
							</>
						) : (
							<>
								<Plus className="h-5 w-5" />
								Thêm linh kiện mới
							</>
						)}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? `Cập nhật thông tin cho ${part?.name}`
							: "Nhập thông tin chi tiết cho linh kiện mới"
						}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Tên linh kiện *</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => updateFormData("name", e.target.value)}
										placeholder="VD: RAM DDR4 8GB"
										className={errors.name ? "border-red-500" : ""}
									/>
									{errors.name && (
										<p className="text-sm text-red-500">{errors.name}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="part_number">Mã linh kiện *</Label>
									<Input
										id="part_number"
										value={formData.part_number}
										onChange={(e) => updateFormData("part_number", e.target.value)}
										placeholder="VD: RAM-DDR4-8GB-001"
										className={errors.part_number ? "border-red-500" : ""}
									/>
									{errors.part_number && (
										<p className="text-sm text-red-500">{errors.part_number}</p>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="category">Danh mục *</Label>
									<Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
										<SelectTrigger className={errors.category ? "border-red-500" : ""}>
											<SelectValue placeholder="Chọn danh mục" />
										</SelectTrigger>
										<SelectContent>
											{PART_CATEGORIES.map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.category && (
										<p className="text-sm text-red-500">{errors.category}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="brand">Thương hiệu</Label>
									<Select value={formData.brand} onValueChange={(value) => updateFormData("brand", value)}>
										<SelectTrigger>
											<SelectValue placeholder="Chọn thương hiệu" />
										</SelectTrigger>
										<SelectContent>
											{POPULAR_BRANDS.map((brand) => (
												<SelectItem key={brand} value={brand}>
													{brand}
												</SelectItem>
											))}
											<SelectItem value="other">Khác...</SelectItem>
										</SelectContent>
									</Select>
									{formData.brand === "other" && (
										<Input
											placeholder="Nhập thương hiệu khác"
											onChange={(e) => updateFormData("brand", e.target.value)}
											className="mt-2"
										/>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Mô tả</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => updateFormData("description", e.target.value)}
									placeholder="Mô tả chi tiết về linh kiện..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Pricing Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Thông tin giá cả</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="cost_price">Giá nhập (VND)</Label>
									<Input
										id="cost_price"
										type="number"
										min="0"
										value={formData.cost_price}
										onChange={(e) => updateFormData("cost_price", Number(e.target.value))}
										placeholder="0"
										className={errors.cost_price ? "border-red-500" : ""}
									/>
									{errors.cost_price && (
										<p className="text-sm text-red-500">{errors.cost_price}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="unit_price">Giá sỉ (VND) *</Label>
									<Input
										id="unit_price"
										type="number"
										min="0"
										value={formData.unit_price}
										onChange={(e) => updateFormData("unit_price", Number(e.target.value))}
										placeholder="0"
										className={errors.unit_price ? "border-red-500" : ""}
									/>
									{errors.unit_price && (
										<p className="text-sm text-red-500">{errors.unit_price}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="selling_price">Giá bán lẻ (VND) *</Label>
									<Input
										id="selling_price"
										type="number"
										min="0"
										value={formData.selling_price}
										onChange={(e) => updateFormData("selling_price", Number(e.target.value))}
										placeholder="0"
										className={errors.selling_price ? "border-red-500" : ""}
									/>
									{errors.selling_price && (
										<p className="text-sm text-red-500">{errors.selling_price}</p>
									)}
								</div>
							</div>

							{/* Profit Margin Preview */}
							{formData.cost_price > 0 && formData.selling_price > 0 && (
								<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
									<div className="grid grid-cols-3 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Lợi nhuận:</span>
											<div className="font-semibold text-green-700">
												{formatPrice(formData.selling_price - formData.cost_price)}
											</div>
										</div>
										<div>
											<span className="text-muted-foreground">Tỷ suất lợi nhuận:</span>
											<div className="font-semibold text-green-700">
												{(((formData.selling_price - formData.cost_price) / formData.cost_price) * 100).toFixed(1)}%
											</div>
										</div>
										<div>
											<span className="text-muted-foreground">Biên lợi nhuận:</span>
											<div className="font-semibold text-green-700">
												{(((formData.selling_price - formData.cost_price) / formData.selling_price) * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Stock & Inventory */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Tồn kho & Kho bãi</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="current_stock">Tồn kho hiện tại</Label>
									<Input
										id="current_stock"
										type="number"
										min="0"
										value={formData.current_stock}
										onChange={(e) => updateFormData("current_stock", Number(e.target.value))}
										placeholder="0"
										className={errors.current_stock ? "border-red-500" : ""}
									/>
									{errors.current_stock && (
										<p className="text-sm text-red-500">{errors.current_stock}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="min_stock_level">Mức tồn kho tối thiểu</Label>
									<Input
										id="min_stock_level"
										type="number"
										min="0"
										value={formData.min_stock_level}
										onChange={(e) => updateFormData("min_stock_level", Number(e.target.value))}
										placeholder="5"
										className={errors.min_stock_level ? "border-red-500" : ""}
									/>
									{errors.min_stock_level && (
										<p className="text-sm text-red-500">{errors.min_stock_level}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="location">Vị trí trong kho</Label>
									<Input
										id="location"
										value={formData.location}
										onChange={(e) => updateFormData("location", e.target.value)}
										placeholder="VD: Kệ A-1-3"
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Model Compatibility */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Tương thích với laptop</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									value={modelInput}
									onChange={(e) => setModelInput(e.target.value)}
									placeholder="Nhập tên model laptop..."
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addModelCompatibility(modelInput);
										}
									}}
								/>
								<Button
									type="button"
									onClick={() => addModelCompatibility(modelInput)}
									disabled={!modelInput.trim()}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>

							{/* Popular models quick add */}
							<div>
								<Label className="text-sm text-muted-foreground">Thêm nhanh:</Label>
								<div className="flex flex-wrap gap-2 mt-2">
									{LAPTOP_MODELS.map((model) => (
										<Button
											key={model}
											type="button"
											variant="outline"
											size="sm"
											onClick={() => addModelCompatibility(model)}
											disabled={formData.model_compatibility.includes(model)}
										>
											{model}
										</Button>
									))}
								</div>
							</div>

							{/* Selected models */}
							{formData.model_compatibility.length > 0 && (
								<div>
									<Label className="text-sm text-muted-foreground">Đã chọn:</Label>
									<div className="flex flex-wrap gap-2 mt-2">
										{formData.model_compatibility.map((model) => (
											<Badge key={model} variant="secondary" className="flex items-center gap-1">
												{model}
												<X
													className="h-3 w-3 cursor-pointer"
													onClick={() => removeModelCompatibility(model)}
												/>
											</Badge>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Additional Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="supplier_info">Thông tin nhà cung cấp</Label>
									<Textarea
										id="supplier_info"
										value={formData.supplier_info}
										onChange={(e) => updateFormData("supplier_info", e.target.value)}
										placeholder="VD: Công ty ABC - 0123456789 - Địa chỉ..."
										rows={3}
									/>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="warranty_period">Bảo hành (tháng)</Label>
										<Input
											id="warranty_period"
											type="number"
											min="0"
											value={formData.warranty_period}
											onChange={(e) => updateFormData("warranty_period", Number(e.target.value))}
											placeholder="12"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="part_condition">Tình trạng linh kiện</Label>
										<Select
											value={formData.part_condition}
											onValueChange={(value: "new" | "refurbished" | "used") => updateFormData("part_condition", value)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="new">Mới</SelectItem>
												<SelectItem value="refurbished">Tân trang</SelectItem>
												<SelectItem value="used">Đã sử dụng</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Error Display */}
					{errors.submit && (
						<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
							<AlertTriangle className="h-4 w-4 text-red-500" />
							<span className="text-sm text-red-700">{errors.submit}</span>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={loading}>
						{loading ? "Đang lưu..." : (
							<>
								<Save className="h-4 w-4 mr-2" />
								{isEditMode ? "Cập nhật" : "Thêm mới"}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}