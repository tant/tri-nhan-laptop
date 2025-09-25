import { ProtectedRoute } from "@/components/protected-route";
import { EditTicketForm } from "@/components/tickets/EditTicketForm";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

function ProtectedTicketEdit() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const handleTicketUpdated = (ticketId: string) => {
		console.log("Ticket updated:", ticketId);
		// Navigate back to ticket detail
		navigate({ to: "/phieu-sua-chua/$id", params: { id } });
	};

	return (
		<ProtectedRoute>
			<EditTicketForm
				ticketId={id}
				onTicketUpdated={handleTicketUpdated}
			/>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/phieu-sua-chua/$id/edit")({
	component: ProtectedTicketEdit,
});