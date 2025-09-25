import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePartsManagement } from "@/hooks/use-parts-management";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

function ProtectedCreatePart() {
	const navigate = useNavigate();
	const { addPart } = usePartsManagement();
	const [formData, setFormData] = useState({
		name: "",
		brand: "",
		model: "",
		partNumber: "",
		description: "",
		costPrice: "",
		sellingPrice: "",
		quantity: "",
		minimumStock: "",
		location: "",
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			setError(null);

			const partData = {
				name: formData.name,
				brand: formData.brand,
				model: formData.model,
				part_number: formData.partNumber,
				description: formData.description,
				cost_price: Number(formData.costPrice) || 0,
				selling_price: Number(formData.sellingPrice) || 0,
				quantity_in_stock: Number(formData.quantity) || 0,
				minimum_stock_level: Number(formData.minimumStock) || 0,
				storage_location: formData.location,
			};

			const partId = await addPart(partData);
			console.log("New part created:", partId);

			// Navigate back to inventory list
			navigate({ to: "/ton-kho" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Không thể thêm linh kiện");
		} finally {
			setSaving(false);
		}
	};

	return (
		<ProtectedRoute requirePermission="can_manage_inventory">
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate({ to: "/ton-kho" })}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Thêm linh kiện mới</h1>
							<p className="text-muted-foreground">
								Thêm linh kiện mới vào kho hàng
							</p>
						</div>
					</div>
					<Button onClick={handleSave} disabled={saving}>
						<Save className="h-4 w-4 mr-2" />
						{saving ? "Đang lưu..." : "Lưu linh kiện"}
					</Button>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-md p-4">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Basic Info */}
					<Card>
						<CardHeader>
							<CardTitle>Thông tin cơ bản</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="name">Tên linh kiện *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="Tên linh kiện"
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="brand">Thương hiệu</Label>
									<Input
										id="brand"
										value={formData.brand}
										onChange={(e) => handleInputChange("brand", e.target.value)}
										placeholder="Thương hiệu"
									/>
								</div>
								<div>
									<Label htmlFor="model">Model</Label>
									<Input
										id="model"
										value={formData.model}
										onChange={(e) => handleInputChange("model", e.target.value)}
										placeholder="Model"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="partNumber">Mã linh kiện</Label>
								<Input
									id="partNumber"
									value={formData.partNumber}
									onChange={(e) =>
										handleInputChange("partNumber", e.target.value)
									}
									placeholder="Mã linh kiện"
								/>
							</div>

							<div>
								<Label htmlFor="description">Mô tả</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										handleInputChange("description", e.target.value)
									}
									placeholder="Mô tả linh kiện"
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Pricing & Inventory */}
					<Card>
						<CardHeader>
							<CardTitle>Giá & Tồn kho</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="costPrice">Giá vốn (VND)</Label>
									<Input
										id="costPrice"
										type="number"
										value={formData.costPrice}
										onChange={(e) =>
											handleInputChange("costPrice", e.target.value)
										}
										placeholder="0"
										min="0"
									/>
								</div>
								<div>
									<Label htmlFor="sellingPrice">Giá bán (VND)</Label>
									<Input
										id="sellingPrice"
										type="number"
										value={formData.sellingPrice}
										onChange={(e) =>
											handleInputChange("sellingPrice", e.target.value)
										}
										placeholder="0"
										min="0"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="quantity">Số lượng tồn kho</Label>
									<Input
										id="quantity"
										type="number"
										value={formData.quantity}
										onChange={(e) =>
											handleInputChange("quantity", e.target.value)
										}
										placeholder="0"
										min="0"
									/>
								</div>
								<div>
									<Label htmlFor="minimumStock">Tồn kho tối thiểu</Label>
									<Input
										id="minimumStock"
										type="number"
										value={formData.minimumStock}
										onChange={(e) =>
											handleInputChange("minimumStock", e.target.value)
										}
										placeholder="0"
										min="0"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="location">Vị trí trong kho</Label>
								<Input
									id="location"
									value={formData.location}
									onChange={(e) =>
										handleInputChange("location", e.target.value)
									}
									placeholder="Kệ A1, Ngăn 3..."
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/ton-kho/new")({
	component: ProtectedCreatePart,
});
