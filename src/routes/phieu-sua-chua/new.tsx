import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

function ProtectedCreateTicket() {
	const navigate = useNavigate();

	const handleTicketCreated = (ticketId: string) => {
		console.log("New ticket created:", ticketId);
		// Navigate back to repair tickets list
		navigate({ to: "/phieu-sua-chua" });
	};

	const handleSaveDraft = (draftId: string) => {
		console.log("Draft saved:", draftId);
		// Navigate back to repair tickets list
		navigate({ to: "/phieu-sua-chua" });
	};

	return (
		<ProtectedRoute>
			<CreateTicketForm
				onTicketCreated={handleTicketCreated}
				onSaveDraft={handleSaveDraft}
			/>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/phieu-sua-chua/new")({
	component: ProtectedCreateTicket,
});