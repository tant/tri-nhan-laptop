import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

function ShopSettings() {
	return (
		<ProtectedRoute>
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader>
						<CardTitle>Cài đặt cửa hàng</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								Trang cài đặt cửa hàng chưa được triển khai.
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Liên hệ quản trị viên để cấu hình hệ thống.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/cua-hang/settings")({
	component: ShopSettings,
});
