import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import error boundary
import { ErrorBoundary } from "@/components/error-boundary";
// Import auth provider
import { AuthProvider } from "@/contexts/auth-context";
// Import Supabase connection test
import { testSupabaseConnection } from "@/lib/supabase";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Test Supabase connection on app start
testSupabaseConnection().then((connected) => {
	if (connected) {
		console.log(
			"🚀 Supabase kết nối thành công - Ready for Vietnamese repair shop!",
		);
	} else {
		console.warn(
			"⚠️ Supabase connection failed - Check Docker services with 'make dev'",
		);
	}
});

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ErrorBoundary>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</ErrorBoundary>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
