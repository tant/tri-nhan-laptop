import { useAuth } from "@/contexts/auth-context";
import type { Database } from "@/lib/supabase";
import { Navigate } from "@tanstack/react-router";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireRole?: UserProfile["role"];
	fallbackPath?: string;
}

export function ProtectedRoute({
	children,
	requireRole,
	fallbackPath = "/login",
}: ProtectedRouteProps) {
	const { isAuthenticated, loading, profile, isRole } = useAuth();

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#299fce] mx-auto" />
					<p className="text-muted-foreground">
						Đang kiểm tra quyền truy cập...
					</p>
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to={fallbackPath} />;
	}

	// Check role requirement
	if (requireRole && !isRole(requireRole)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4 max-w-md">
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							Không có quyền truy cập
						</h2>
						<p className="text-red-600 text-sm">
							Bạn không có quyền truy cập vào trang này. Yêu cầu vai trò:{" "}
							{requireRole}
						</p>
						<p className="text-red-600 text-sm mt-2">
							Vai trò hiện tại: {profile?.role || "Không xác định"}
						</p>
					</div>
					<button
						onClick={() => window.history.back()}
						className="text-[#299fce] hover:underline text-sm"
					>
						← Quay lại trang trước
					</button>
				</div>
			</div>
		);
	}

	// All checks passed, render children
	return <>{children}</>;
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
	return <ProtectedRoute requireRole="shop_owner">{children}</ProtectedRoute>;
}

// Convenience wrapper for shop_owner routes
export function ManagerRoute({ children }: { children: React.ReactNode }) {
	const { isRole } = useAuth();

	// Allow shop_owner only
	if (!isRole("shop_owner")) {
		return <ProtectedRoute requireRole="shop_owner">{children}</ProtectedRoute>;
	}

	return <ProtectedRoute>{children}</ProtectedRoute>;
}
