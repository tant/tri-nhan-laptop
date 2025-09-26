import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserProfileInsert =
	Database["public"]["Tables"]["user_profiles"]["Insert"];
type UserProfileUpdate =
	Database["public"]["Tables"]["user_profiles"]["Update"];

interface CreateStaffData {
	email: string;
	full_name: string;
	role: "shop_owner" | "staff";
	phone?: string;
	password: string;
}

interface StaffManagementError {
	message: string;
	details?: string;
}

export function useStaffManagement() {
	const [staffList, setStaffList] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<StaffManagementError | null>(null);

	// Vietnamese error messages
	const getVietnameseError = (error: any): string => {
		if (typeof error === "string") return error;

		const message = error?.message || "";

		// Map common Supabase errors to Vietnamese
		if (message.includes("duplicate key")) {
			return "Email đã tồn tại trong hệ thống";
		}
		if (message.includes("invalid email")) {
			return "Địa chỉ email không hợp lệ";
		}
		if (message.includes("Password should be at least")) {
			return "Mật khẩu phải có ít nhất 6 ký tự";
		}
		if (message.includes("not authorized")) {
			return "Không có quyền thực hiện thao tác này";
		}
		if (message.includes("network")) {
			return "Lỗi kết nối mạng. Vui lòng thử lại";
		}

		return "Đã xảy ra lỗi. Vui lòng thử lại sau";
	};

	// Load all staff accounts
	const loadStaff = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: fetchError } = await supabase
				.from("user_profiles")
				.select("*")
				.order("created_at", { ascending: false });

			if (fetchError) {
				throw fetchError;
			}

			setStaffList(data || []);
		} catch (err) {
			console.error("Error loading staff:", err);
			setError({
				message: getVietnameseError(err),
				details: err instanceof Error ? err.message : undefined,
			});
		} finally {
			setLoading(false);
		}
	}, []);

	// Create new staff account
	const createStaff = useCallback(
		async (staffData: CreateStaffData) => {
			try {
				setLoading(true);
				setError(null);

				// First create the auth user
				const { data: authData, error: authError } =
					await supabase.auth.admin.createUser({
						email: staffData.email,
						password: staffData.password,
						email_confirm: true,
						user_metadata: {
							full_name: staffData.full_name,
							role: staffData.role,
						},
					});

				if (authError) {
					throw authError;
				}

				if (!authData.user) {
					throw new Error("Không thể tạo tài khoản xác thực");
				}

				// The user profile will be created automatically by the trigger,
				// but we need to update it with additional info if provided
				if (staffData.phone) {
					const { error: updateError } = await supabase
						.from("user_profiles")
						.update({
							phone: staffData.phone,
							full_name: staffData.full_name,
							role: staffData.role,
						})
						.eq("id", authData.user.id);

					if (updateError) {
						console.warn(
							"Warning: Could not update profile with phone:",
							updateError,
						);
					}
				}

				// Reload staff list
				await loadStaff();

				return { success: true, user: authData.user };
			} catch (err) {
				console.error("Error creating staff:", err);
				setError({
					message: getVietnameseError(err),
					details: err instanceof Error ? err.message : undefined,
				});
				return { success: false, error: getVietnameseError(err) };
			} finally {
				setLoading(false);
			}
		},
		[loadStaff],
	);

	// Update staff account
	const updateStaff = useCallback(
		async (staffId: string, updates: UserProfileUpdate) => {
			try {
				setLoading(true);
				setError(null);

				const { data, error: updateError } = await supabase
					.from("user_profiles")
					.update(updates)
					.eq("id", staffId)
					.select()
					.single();

				if (updateError) {
					throw updateError;
				}

				// Update local state
				setStaffList((prev) =>
					prev.map((staff) =>
						staff.id === staffId ? { ...staff, ...updates } : staff,
					),
				);

				return { success: true, data };
			} catch (err) {
				console.error("Error updating staff:", err);
				setError({
					message: getVietnameseError(err),
					details: err instanceof Error ? err.message : undefined,
				});
				return { success: false, error: getVietnameseError(err) };
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Reset staff password
	const resetStaffPassword = useCallback(
		async (email: string, newPassword: string) => {
			try {
				setLoading(true);
				setError(null);

				// Use Supabase admin API to reset password
				const { error: resetError } = await supabase.auth.admin.updateUserById(
					(
						await supabase
							.from("user_profiles")
							.select("id")
							.eq("email", email)
							.single()
					).data?.id || "",
					{ password: newPassword },
				);

				if (resetError) {
					throw resetError;
				}

				return { success: true };
			} catch (err) {
				console.error("Error resetting password:", err);
				setError({
					message: getVietnameseError(err),
					details: err instanceof Error ? err.message : undefined,
				});
				return { success: false, error: getVietnameseError(err) };
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Deactivate staff account (instead of deleting)
	const deactivateStaff = useCallback(
		async (staffId: string) => {
			return await updateStaff(staffId, { is_active: false });
		},
		[updateStaff],
	);

	// Reactivate staff account
	const reactivateStaff = useCallback(
		async (staffId: string) => {
			return await updateStaff(staffId, { is_active: true });
		},
		[updateStaff],
	);

	// Get staff by role
	const getStaffByRole = useCallback(
		(role: "shop_owner" | "staff") => {
			return staffList.filter((staff) => staff.role === role);
		},
		[staffList],
	);

	// Get active staff only
	const getActiveStaff = useCallback(() => {
		return staffList.filter((staff) => staff.is_active);
	}, [staffList]);

	// Load staff on mount
	useEffect(() => {
		loadStaff();
	}, [loadStaff]);

	return {
		// Data
		staffList,
		loading,
		error,

		// Actions
		loadStaff,
		createStaff,
		updateStaff,
		resetStaffPassword,
		deactivateStaff,
		reactivateStaff,

		// Computed
		getStaffByRole,
		getActiveStaff,

		// Utils
		clearError: () => setError(null),
	};
}
