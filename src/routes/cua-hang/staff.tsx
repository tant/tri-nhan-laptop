import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StaffManagement() {
	return (
		<ProtectedRoute>
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader>
						<CardTitle>Quản lý nhân viên</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Quản lý thông tin nhân viên và phân quyền</p>
						{/* TODO: Implement StaffManagementTable component */}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/cua-hang/staff")({
	component: StaffManagement,
});