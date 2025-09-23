import { CustomersPage } from "@/components/pages/CustomersPage";
import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";

function ProtectedCustomers() {
	return (
		<ProtectedRoute>
			<CustomersPage />
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/khach-hang")({
	component: ProtectedCustomers,
});
