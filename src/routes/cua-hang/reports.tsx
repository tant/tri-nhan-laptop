import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ShopReports() {
	return (
		<ProtectedRoute>
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader>
						<CardTitle>Báo cáo & Phân tích</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Báo cáo doanh thu và hiệu suất kinh doanh</p>
						{/* TODO: Implement ShopReportsDashboard component */}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/cua-hang/reports")({
	component: ShopReports,
});