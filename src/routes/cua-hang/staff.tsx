import { AdminRoute } from "@/components/protected-route";
import { StaffManagementTable } from "@/components/staff/StaffManagementTable";
import { createFileRoute } from "@tanstack/react-router";

function StaffManagement() {
	return (
		<AdminRoute>
			<div className="container mx-auto py-6">
				<StaffManagementTable />
			</div>
		</AdminRoute>
	);
}

export const Route = createFileRoute("/cua-hang/staff")({
	component: StaffManagement,
});
