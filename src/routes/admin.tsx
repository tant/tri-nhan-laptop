import { AdminPage } from "@/components/pages/AdminPage";
import { AdminRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";

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
