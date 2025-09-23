import { createFileRoute } from "@tanstack/react-router";
import { PartsPage } from "@/components/pages/PartsPage";
import { ProtectedRoute } from "@/components/protected-route";

function ProtectedParts() {
	return (
		<ProtectedRoute requirePermission="can_manage_inventory">
			<PartsPage />
		</ProtectedRoute>
	)
}

export const Route = createFileRoute("/ton-kho")({
	component: ProtectedParts,
});