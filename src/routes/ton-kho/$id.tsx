import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartsManagement } from "@/hooks/use-parts-management";
import { formatVND } from "@/lib/currency";
import type { Part } from "@/lib/database-types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Edit,
	MapPin,
	Package,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

function ProtectedPartDetail() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { getPartById } = usePartsManagement();
	const [part, setPart] = useState<Part | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadPart() {
			try {
				setLoading(true);
				const data = await getPartById(id);
				setPart(data);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Không thể tải thông tin linh kiện",
				);
			} finally {
				setLoading(false);
			}
		}

		loadPart();
	}, [id, getPartById]);

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

	if (error || !part) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">
							{error || "Không tìm thấy linh kiện"}
						</p>
						<Button
							onClick={() => navigate({ to: "/ton-kho" })}
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

	const isLowStock = part.quantity_in_stock <= part.minimum_stock_level;

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
							<h1 className="text-2xl font-bold">{part.name}</h1>
							<p className="text-muted-foreground">
								{part.brand} {part.model}{" "}
								{part.part_number && `• ${part.part_number}`}
							</p>
						</div>
					</div>
					<Button
						onClick={() =>
							navigate({ to: "/ton-kho/$id/edit", params: { id } })
						}
					>
						<Edit className="h-4 w-4 mr-2" />
						Chỉnh sửa
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Info */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Package className="h-5 w-5 mr-2" />
									Thông tin linh kiện
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Tên linh kiện:
										</p>
										<p className="font-medium">{part.name}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Mã linh kiện:
										</p>
										<p className="font-medium">
											{part.part_number || "Không có"}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Thương hiệu:
										</p>
										<p className="font-medium">
											{part.brand || "Không xác định"}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Model:</p>
										<p className="font-medium">
											{part.model || "Không xác định"}
										</p>
									</div>
								</div>

								{part.description && (
									<div>
										<p className="text-sm text-muted-foreground">Mô tả:</p>
										<p className="font-medium">{part.description}</p>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Thông tin giá</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">Giá vốn:</p>
										<p className="font-medium text-orange-600">
											{part.cost_price ? formatVND(part.cost_price) : "Chưa có"}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Giá bán:</p>
										<p className="font-medium text-green-600">
											{part.selling_price
												? formatVND(part.selling_price)
												: "Chưa có"}
										</p>
									</div>
								</div>

								{part.cost_price && part.selling_price && (
									<div>
										<p className="text-sm text-muted-foreground">Lợi nhuận:</p>
										<p className="font-medium flex items-center">
											{part.selling_price > part.cost_price ? (
												<TrendingUp className="h-4 w-4 mr-1 text-green-500" />
											) : (
												<TrendingDown className="h-4 w-4 mr-1 text-red-500" />
											)}
											{formatVND(part.selling_price - part.cost_price)}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Tình trạng kho</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground">
										Tồn kho hiện tại:
									</p>
									<div className="flex items-center space-x-2">
										<p className="text-2xl font-bold">
											{part.quantity_in_stock}
										</p>
										{isLowStock && (
											<Badge variant="destructive">Tồn kho thấp</Badge>
										)}
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Tồn kho tối thiểu:
									</p>
									<p className="font-medium">{part.minimum_stock_level}</p>
								</div>
								{part.storage_location && (
									<div>
										<p className="text-sm text-muted-foreground">Vị trí:</p>
										<p className="font-medium flex items-center">
											<MapPin className="h-4 w-4 mr-1" />
											{part.storage_location}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Thông tin khác</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="text-sm text-muted-foreground">Ngày tạo:</p>
									<p className="font-medium">
										{new Date(part.created_at).toLocaleDateString("vi-VN")}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Cập nhật lần cuối:
									</p>
									<p className="font-medium">
										{new Date(part.updated_at).toLocaleDateString("vi-VN")}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/ton-kho/$id")({
	component: ProtectedPartDetail,
});
