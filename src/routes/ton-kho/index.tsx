import { PartsPage } from "@/components/pages/PartsPage";
import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";

function ProtectedParts() {
	return (
		<ProtectedRoute requirePermission="can_manage_inventory">
			<PartsPage />
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/ton-kho/")({
	component: ProtectedParts,
});
