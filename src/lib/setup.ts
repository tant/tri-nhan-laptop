// Application setup utilities for admin user creation
import { createClient } from "@supabase/supabase-js";

export interface SetupStatus {
	isSetupRequired: boolean;
	hasAdminUser: boolean;
	error?: string;
}

export interface AdminUserConfig {
	email: string;
	password: string;
	fullName: string;
	role: "shop_owner" | "manager" | "technician" | "staff";
}

// Create admin client with service role key for user management
const getAdminClient = () => {
	const supabaseUrl =
		import.meta.env.VITE_SUPABASE_URL || "http://localhost:8000";
	const serviceRoleKey = import.meta.env.VITE_SERVICE_ROLE_KEY;

	if (!serviceRoleKey) {
		throw new Error("Service role key not found in environment");
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};

// Get admin user configuration from existing environment variables
export const getAdminUserConfig = (): AdminUserConfig => {
	return {
		email: process.env.SHOP_ADMIN_EMAIL || "admin@laptop-repair-shop.local",
		password: process.env.SHOP_ADMIN_PASSWORD || "AdminPass123!",
		fullName: process.env.SHOP_ADMIN_NAME || "Shop Manager",
		role:
			(process.env.SHOP_ADMIN_ROLE as AdminUserConfig["role"]) || "shop_owner",
	};
};

// Check if initial setup is required
export const checkSetupStatus = async (): Promise<SetupStatus> => {
	try {
		const adminClient = getAdminClient();

		// Check if any users exist in the auth system
		const {
			data: { users },
			error: listError,
		} = await adminClient.auth.admin.listUsers();

		if (listError) {
			console.error("Error checking users:", listError);
			return {
				isSetupRequired: true,
				hasAdminUser: false,
				error: listError.message,
			};
		}

		const hasAdminUser = users && users.length > 0;

		return {
			isSetupRequired: !hasAdminUser,
			hasAdminUser: !!hasAdminUser,
		};
	} catch (error) {
		console.error("Setup status check failed:", error);
		return {
			isSetupRequired: true,
			hasAdminUser: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

// Create admin user and profile
export const createAdminUser = async (config: AdminUserConfig) => {
	try {
		const adminClient = getAdminClient();
		console.log("🔧 Creating admin user:", config.email);

		// Create user in auth system
		const { data: authData, error: authError } =
			await adminClient.auth.admin.createUser({
				email: config.email,
				password: config.password,
				email_confirm: true,
				user_metadata: {
					full_name: config.fullName,
					role: config.role,
				},
			});

		if (authError) {
			throw new Error(`Failed to create auth user: ${authError.message}`);
		}

		if (!authData.user) {
			throw new Error("No user data returned from auth creation");
		}

		console.log("✅ Auth user created:", authData.user.id);

		// Create user profile
		const { error: profileError } = await adminClient
			.from("user_profiles")
			.insert({
				id: authData.user.id,
				full_name: config.fullName,
				role: config.role,
				is_active: true,
				can_create_users: true,
				can_manage_inventory: true,
				can_view_financials: true,
				can_delete_repairs: true,
			});

		if (profileError) {
			console.warn(
				"Profile creation failed, but auth user exists:",
				profileError,
			);
			// Don't throw here - user can still login even without profile table
		} else {
			console.log("✅ User profile created");
		}

		return {
			success: true,
			user: authData.user,
			message: "Admin user created successfully",
		};
	} catch (error) {
		console.error("❌ Admin user creation failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

// Test admin user login
export const testAdminLogin = async (email: string, password: string) => {
	try {
		const adminClient = getAdminClient();
		const { error } = await adminClient.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw new Error(`Login test failed: ${error.message}`);
		}

		// Sign out immediately after test
		await adminClient.auth.signOut();

		return {
			success: true,
			message: "Admin login test successful",
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Login test failed",
		};
	}
};
