import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { ProtectedRoute } from "@/components/protected-route";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader>
						<CardTitle>Tạo phiếu sửa chữa mới</CardTitle>
					</CardHeader>
					<CardContent>
						<CreateTicketForm
							onTicketCreated={handleTicketCreated}
							onSaveDraft={handleSaveDraft}
						/>
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	);
}

export const Route = createFileRoute("/phieu-sua-chua/tao-moi")({
	component: ProtectedCreateTicket,
});