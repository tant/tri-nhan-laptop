import { SetupPage } from "@/components/pages/SetupPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/setup")({
	component: SetupPage,
});
