import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/components/pages/CustomersPage";
import { ProtectedRoute } from "@/components/protected-route";

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