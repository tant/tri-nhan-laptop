import { ProtectedRoute } from "@/components/protected-route";
import { TicketDetailView } from "@/components/tickets/TicketDetailView";
import { createFileRoute } from "@tanstack/react-router";

function ProtectedTicketDetail() {
	const { id } = Route.useParams();

	return (
		<ProtectedRoute>
			<TicketDetailView ticketId={id} />
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/phieu-sua-chua/$id")({
	component: ProtectedTicketDetail,
});