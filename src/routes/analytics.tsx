import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics" as any)({
	component: () => (
		<div className="p-6 space-y-6">
			<AnalyticsDashboard />
		</div>
	),
});
