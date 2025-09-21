import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/pages/AdminPage";
import { AdminRoute } from "@/components/protected-route";

function ProtectedAdmin() {
	return (
		<AdminRoute>
			<AdminPage />
		</AdminRoute>
	);
}

export const Route = createFileRoute("/admin")({
	component: ProtectedAdmin,
});