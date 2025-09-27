import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

function ProtectedPartEdit() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const _handlePartUpdated = (partId: string) => {
		console.log("Part updated:", partId);
		// Navigate back to part detail
		navigate({ to: "/ton-kho/$id", params: { id } });
	};

	return (
		<ProtectedRoute requirePermission="can_manage_inventory">
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader>
						<CardTitle>Chỉnh sửa linh kiện #{id}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								Chức năng chỉnh sửa linh kiện chưa được triển khai.
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Vui lòng quay lại danh sách linh kiện.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/ton-kho/$id/edit")({
	component: ProtectedPartEdit,
});
