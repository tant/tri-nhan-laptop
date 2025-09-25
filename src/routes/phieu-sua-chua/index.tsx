import { RepairTicketsPage } from "@/components/pages/RepairTicketsPage";
import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute } from "@tanstack/react-router";

function ProtectedRepairTickets() {
	return (
		<ProtectedRoute>
			<RepairTicketsPage />
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/phieu-sua-chua/")({
	component: ProtectedRepairTickets,
});