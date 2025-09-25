import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

function ProtectedPartEdit() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const handlePartUpdated = (partId: string) => {
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
						<p>Form chỉnh sửa thông tin linh kiện {id}</p>
						{/* TODO: Implement EditPartForm component */}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/ton-kho/$id/edit")({
	component: ProtectedPartEdit,
});
