import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

// Define user profile type from database
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface AuthContextType {
	user: User | null;
	profile: UserProfile | null;
	session: Session | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error?: Error }>;
	signOut: () => Promise<void>;
	isAuthenticated: boolean;
	isRole: (role: UserProfile["role"]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	// Fetch user profile from database with better error handling
	const fetchUserProfile = useCallback(
		async (userId: string): Promise<UserProfile | null> => {
			try {
				console.log("🔍 Fetching user profile for:", userId);

				const { data, error } = await supabase
					.from("user_profiles")
					.select("*")
					.eq("id", userId)
					.single();

				if (error) {
					console.error("Error fetching user profile:", error);
					// Don't throw - return null and let auth continue
					return null;
				}

				console.log("✅ User profile fetched successfully:", data);
				return data;
			} catch (error) {
				console.error("Unexpected error fetching user profile:", error);
				// Don't throw - return null and let auth continue
				return null;
			}
		},
		[],
	);

	// Sign in function
	const signIn = async (email: string, password: string) => {
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error("Sign in error:", error);
				return { error };
			}

			// Profile will be loaded in the auth state change listener
			return {};
		} catch (error) {
			console.error("Sign in error:", error);
			return { error: error as Error };
		}
	};

	// Sign out function
	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error("Sign out error:", error);
			}
			// State will be cleared in the auth state change listener
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	// Check if user has specific role
	const isRole = (role: UserProfile["role"]): boolean => {
		if (!profile) return false;
		return profile.role === role;
	};

	// Handle auth state changes with better error handling
	const handleAuthStateChange = useCallback(
		async (session: Session | null) => {
			console.log(
				"🔄 Auth state change:",
				session ? "authenticated" : "not authenticated",
			);

			setSession(session);
			setUser(session?.user ?? null);

			if (session?.user) {
				try {
					// Add timeout to prevent hanging
					const profilePromise = fetchUserProfile(session.user.id);
					const timeoutPromise = new Promise<null>((_, reject) =>
						setTimeout(() => reject(new Error("Profile fetch timeout")), 5000),
					);

					const userProfile = await Promise.race([
						profilePromise,
						timeoutPromise,
					]);
					setProfile(userProfile);
				} catch (error) {
					console.error("Profile fetch failed or timed out:", error);
					// Set profile to null but don't block auth
					setProfile(null);
				}
			} else {
				// Clear profile when signed out
				setProfile(null);
			}

			console.log("✅ Auth state updated, setting loading to false");
			setLoading(false);
		},
		[fetchUserProfile],
	);

	// Listen for auth state changes
	useEffect(() => {
		console.log("🚀 Setting up auth state listener");

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("📡 Auth event:", event);
			await handleAuthStateChange(session);
		});

		return () => {
			console.log("🧹 Cleaning up auth state listener");
			subscription.unsubscribe();
		};
	}, [handleAuthStateChange]);

	// Check initial session
	useEffect(() => {
		console.log("🔍 Checking initial session");

		const checkSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();

				console.log("📋 Initial session:", session ? "found" : "not found");
				await handleAuthStateChange(session);
			} catch (error) {
				console.error("Error checking initial session:", error);
				setLoading(false); // Always set loading to false
			}
		};

		checkSession();
	}, [handleAuthStateChange]);

	const value: AuthContextType = {
		user,
		profile,
		session,
		loading,
		signIn,
		signOut,
		isAuthenticated: !!user,
		isRole,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
	return function AuthenticatedComponent(props: P) {
		const { isAuthenticated, loading } = useAuth();

		if (loading) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#299fce] mx-auto mb-4" />
						<p className="text-muted-foreground">Đang tải...</p>
					</div>
				</div>
			);
		}

		if (!isAuthenticated) {
			window.location.href = "/login";
			return null;
		}

		return <Component {...props} />;
	};
}

// Role-based access control component
export function RequireRole({
	role,
	children,
	fallback = null,
}: {
	role: UserProfile["role"];
	children: ReactNode;
	fallback?: ReactNode;
}) {
	const { isRole } = useAuth();

	if (!isRole(role)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
