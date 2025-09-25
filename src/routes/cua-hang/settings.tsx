import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ShopSettings() {
	return (
		<ProtectedRoute>
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader>
						<CardTitle>Cài đặt cửa hàng</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Cài đặt và cấu hình thông tin cửa hàng</p>
						{/* TODO: Implement ShopSettingsForm component */}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/cua-hang/settings")({
	component: ShopSettings,
});