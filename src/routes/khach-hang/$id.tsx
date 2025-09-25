import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/use-customers";
import type { Database } from "@/lib/supabase";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Edit, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

function ProtectedCustomerDetail() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { getCustomerById } = useCustomers();
	const [customer, setCustomer] = useState<Customer | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadCustomer() {
			try {
				setLoading(true);
				const data = await getCustomerById(id);
				setCustomer(data);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Không thể tải thông tin khách hàng",
				);
			} finally {
				setLoading(false);
			}
		}

		loadCustomer();
	}, [id, getCustomerById]);

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

	if (error || !customer) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">
							{error || "Không tìm thấy khách hàng"}
						</p>
						<Button
							onClick={() => navigate({ to: "/khach-hang" })}
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
		<ProtectedRoute>
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate({ to: "/khach-hang" })}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
						<div>
							<h1 className="text-2xl font-bold">{customer.full_name}</h1>
							<p className="text-muted-foreground">
								Mã khách hàng: {customer.phone}
							</p>
						</div>
					</div>
					<Button
						onClick={() =>
							navigate({ to: "/khach-hang/$id/edit", params: { id } })
						}
					>
						<Edit className="h-4 w-4 mr-2" />
						Chỉnh sửa
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Basic Info */}
					<Card>
						<CardHeader>
							<CardTitle>Thông tin cơ bản</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Họ và tên:</p>
								<p className="font-medium">{customer.full_name}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Số điện thoại:</p>
								<p className="font-medium flex items-center">
									<Phone className="h-4 w-4 mr-2" />
									{customer.phone}
								</p>
							</div>
							{customer.email && (
								<div>
									<p className="text-sm text-muted-foreground">Email:</p>
									<p className="font-medium flex items-center">
										<Mail className="h-4 w-4 mr-2" />
										{customer.email}
									</p>
								</div>
							)}
							{customer.address && (
								<div>
									<p className="text-sm text-muted-foreground">Địa chỉ:</p>
									<p className="font-medium flex items-start">
										<MapPin className="h-4 w-4 mr-2 mt-1" />
										<span>
											{typeof customer.address === "string"
												? customer.address
												: JSON.stringify(customer.address)}
										</span>
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Additional Info */}
					<Card>
						<CardHeader>
							<CardTitle>Thông tin bổ sung</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Ngày tạo:</p>
								<p className="font-medium">
									{new Date(customer.created_at).toLocaleDateString("vi-VN")}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Cập nhật lần cuối:
								</p>
								<p className="font-medium">
									{new Date(customer.updated_at).toLocaleDateString("vi-VN")}
								</p>
							</div>
							{customer.notes && (
								<div>
									<p className="text-sm text-muted-foreground">Ghi chú:</p>
									<p className="font-medium">{customer.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Repair History */}
				<Card>
					<CardHeader>
						<CardTitle>Lịch sử sửa chữa</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Lịch sử sửa chữa của khách hàng sẽ được hiển thị ở đây
						</p>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/khach-hang/$id")({
	component: ProtectedCustomerDetail,
});
