import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { ProtectedRoute } from "@/components/protected-route";

function ProtectedDashboard() {
	return (
		<ProtectedRoute>
			<DashboardPage />
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/dashboard")({
	component: ProtectedDashboard,
});