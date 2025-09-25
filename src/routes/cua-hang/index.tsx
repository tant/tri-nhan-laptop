import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Settings, Users } from "lucide-react";

function StorePage() {
	const navigate = useNavigate();

	return (
		<ProtectedRoute>
			<div className="p-6 space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Quản lý cửa hàng</h1>
						<p className="text-muted-foreground">
							Tổng quan và quản lý các hoạt động cửa hàng
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Cài đặt cửa hàng
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								Quản lý thông tin cơ bản và cấu hình cửa hàng
							</p>
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/cua-hang/settings" })}
							>
								Cài đặt
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Quản lý nhân viên
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								Quản lý nhân viên và phân quyền
							</p>
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/cua-hang/staff" })}
							>
								Nhân viên
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								Báo cáo & Phân tích
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								Xem báo cáo doanh thu và hiệu suất
							</p>
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/cua-hang/reports" })}
							>
								Báo cáo
							</Button>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Laptop cũ</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								Quản lý laptop cũ có sẵn để bán
							</p>
							<div className="text-center py-8">
								<p className="text-sm text-muted-foreground">
									Tính năng đang phát triển
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Linh kiện bán lẻ</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								Quản lý linh kiện có sẵn để bán
							</p>
							<div className="text-center py-8">
								<p className="text-sm text-muted-foreground">
									Tính năng đang phát triển
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/cua-hang/")({
	component: StorePage,
});
