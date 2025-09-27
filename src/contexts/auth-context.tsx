/**
 * @fileoverview Authentication Context for Vietnamese Laptop Repair Shop
 *
 * Provides comprehensive authentication state management with Vietnamese business
 * context, including role-based access control, profile caching, and optimized
 * performance for the repair shop workflow.
 *
 * Features:
 * - localStorage profile caching for instant role validation
 * - Request deduplication to prevent concurrent profile fetches
 * - Vietnamese business role validation (shop_owner, staff)
 * - Optimized authentication flow with fallback mechanisms
 *
 * @version 1.0.0
 * @since Phase 3.4.1
 */

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

// Vietnamese repair shop user profile type from database
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

/**
 * Authentication context interface with Vietnamese business features
 *
 * Provides all necessary authentication state and methods for managing
 * user sessions in a Vietnamese laptop repair shop context.
 */
interface AuthContextType {
	/** Current authenticated user from Supabase Auth */
	user: User | null;
	/** User profile with Vietnamese business role (shop_owner | staff) */
	profile: UserProfile | null;
	/** Current Supabase session */
	session: Session | null;
	/** Loading state during authentication operations */
	loading: boolean;
	/** Sign in with email and password */
	signIn: (email: string, password: string) => Promise<{ error?: Error }>;
	/** Sign out and clear all authentication state */
	signOut: () => Promise<void>;
	/** Quick check if user is authenticated */
	isAuthenticated: boolean;
	/** Check if user has specific Vietnamese business role */
	isRole: (role: UserProfile["role"]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);

	// localStorage key for caching profile
	const PROFILE_CACHE_KEY = "user_profile_cache";
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	// Track to prevent redundant profile fetches
	const [fetchingProfileFor, setFetchingProfileFor] = useState<string | null>(
		null,
	);

	// Cache profile to localStorage
	const cacheProfile = (profile: UserProfile | null) => {
		try {
			if (profile) {
				localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
			} else {
				localStorage.removeItem(PROFILE_CACHE_KEY);
			}
		} catch (error) {
			console.warn("Failed to cache profile:", error);
		}
	};

	// Get cached profile from localStorage
	const getCachedProfile = (): UserProfile | null => {
		try {
			const cached = localStorage.getItem(PROFILE_CACHE_KEY);
			return cached ? JSON.parse(cached) : null;
		} catch (error) {
			console.warn("Failed to get cached profile:", error);
			return null;
		}
	};

	// Fetch user profile from database with better error handling
	const fetchUserProfile = useCallback(
		async (userId: string): Promise<UserProfile | null> => {
			// First check if we already have this user cached
			const cached = getCachedProfile();
			if (cached && cached.id === userId) {
				console.log("📋 Returning cached profile immediately for:", userId);
				return cached;
			}

			try {
				const { data, error } = await supabase
					.from("user_profiles")
					.select("*")
					.eq("id", userId)
					.single();

				if (error) {
					console.error("Error fetching user profile:", error);
					// Return cached profile if available
					const cached = getCachedProfile();
					if (cached && cached.id === userId) {
						console.log("📋 Using cached profile:", cached);
						return cached;
					}
					// Don't throw - return null and let auth continue
					return null;
				}

				// Cache the successful result
				cacheProfile(data);
				return data;
			} catch (error) {
				console.error("Unexpected error fetching user profile:", error);
				// Try cached profile as fallback
				const cached = getCachedProfile();
				if (cached && cached.id === userId) {
					console.log("📋 Using cached profile as fallback:", cached);
					return cached;
				}
				// Don't throw - return null and let auth continue
				return null;
			}
		},
		[],
	);

	// Clear all auth data
	const clearAuthData = () => {
		console.log("🧹 Clearing all auth data...");
		setUser(null);
		setProfile(null);
		setSession(null);
		cacheProfile(null);

		// Clear any additional auth storage
		try {
			localStorage.removeItem(PROFILE_CACHE_KEY);
			localStorage.removeItem("sb-127.0.0.1:54321-auth-token");
			localStorage.removeItem("supabase.auth.token");
		} catch (error) {
			console.warn("Failed to clear auth storage:", error);
		}
	};

	// Sign in function
	const signIn = async (email: string, password: string) => {
		try {
			// First, clear any stale auth data
			clearAuthData();

			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				return { error };
			}
			// Profile will be loaded in the auth state change listener
			return {};
		} catch (error) {
			console.error("💥 Sign in error:", error);
			return { error: error as Error };
		}
	};

	// Sign out function
	const signOut = async () => {
		try {
			console.log("🚪 Signing out...");
			clearAuthData();

			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error("Sign out error:", error);
			}
			console.log("✅ Sign out complete");
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	// Check if user has specific role
	const isRole = (role: UserProfile["role"]): boolean => {
		// Only check current profile (cached profile is validated during initialization)
		return Boolean(profile && profile.role === role);
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
				// Check if we already have the profile for this user
				const cached = getCachedProfile();
				if (cached && cached.id === session.user.id) {
					console.log(
						"📋 Using existing cached profile, skipping DB fetch:",
						cached.role,
					);
					setProfile(cached);
					setLoading(false);
					return;
				}

				// Check if we're already fetching for this user
				if (fetchingProfileFor === session.user.id) {
					console.log(
						"⏳ Already fetching profile for this user, skipping duplicate request",
					);
					return;
				}

				try {
					console.log("🔍 Starting profile fetch for:", session.user.id);
					setFetchingProfileFor(session.user.id);

					// Add timeout to prevent hanging - increased timeout and retry logic
					const profilePromise = fetchUserProfile(session.user.id);
					const timeoutPromise = new Promise<null>(
						(_, reject) =>
							setTimeout(
								() => reject(new Error("Profile fetch timeout")),
								10000,
							), // Increased to 10 seconds
					);

					const userProfile = await Promise.race([
						profilePromise,
						timeoutPromise,
					]);
					setProfile(userProfile);
					// Cache successful profile fetch
					cacheProfile(userProfile);
				} catch (error) {
					console.error("Profile fetch failed or timed out:", error);
					// Don't clear profile immediately on timeout - it might be a temporary network issue
					// Only clear if we don't have an existing profile
					if (!profile) {
						setProfile(null);
					}
					// Retry once after a short delay
					setTimeout(async () => {
						try {
							console.log("🔄 Retrying profile fetch...");
							const userProfile = await fetchUserProfile(session.user.id);
							setProfile(userProfile);
							// Cache successful retry
							if (userProfile) cacheProfile(userProfile);
						} catch (retryError) {
							console.error("Retry profile fetch failed:", retryError);
							setProfile(null);
						} finally {
							setFetchingProfileFor(null);
						}
					}, 2000);
				} finally {
					// Clear the fetching state when done (success or failure)
					setFetchingProfileFor(null);
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

	// Initialize with cached profile only if there's a valid session
	useEffect(() => {
		const checkCachedProfile = async () => {
			const cached = getCachedProfile();
			if (cached && !profile) {
				console.log("🔍 Found cached profile, checking session validity...");

				// Check if there's a current session
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (session && session.user.id === cached.id) {
					console.log("✅ Cached profile matches current session, loading...");
					setProfile(cached);
				} else {
					console.log("❌ Cached profile doesn't match session, clearing...");
					cacheProfile(null);
				}
			}
		};

		checkCachedProfile();
	}, []);

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
