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

	// Create new staff account using Edge Function
	const createStaff = useCallback(
		async (staffData: CreateStaffData) => {
			try {
				setLoading(true);
				setError(null);

				// Get current user's session for authentication
				const { data: { session } } = await supabase.auth.getSession();
				
				if (!session) {
					throw new Error("Phiên đăng nhập đã hết hạn");
				}

				// Call the Edge Function
				const { data, error } = await supabase.functions.invoke(
					'admin-user-management',
					{
						body: {
							email: staffData.email,
							password: staffData.password,
							full_name: staffData.full_name,
							role: staffData.role,
							phone: staffData.phone,
						},
						headers: {
							Authorization: `Bearer ${session.access_token}`,
						},
					}
				);

				if (error) {
					console.error("Edge Function error:", error);
					throw new Error(error.message || "Không thể tạo tài khoản");
				}

				if (!data || !data.success) {
					throw new Error(data?.error || "Không thể tạo tài khoản");
				}

				// Reload staff list
				await loadStaff();

				return { success: true, user: data.user };
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
		[loadStaff, getVietnameseError],
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

	// Reset staff password using Edge Function
	const resetStaffPassword = useCallback(
		async (email: string, newPassword: string) => {
			try {
				setLoading(true);
				setError(null);

				// Get user ID from email
				const { data: userProfile } = await supabase
					.from("user_profiles")
					.select("id")
					.eq("email", email)
					.single();

				if (!userProfile) {
					throw new Error("Không tìm thấy tài khoản với email này");
				}

				// Get current session for authentication
				const { data: { session } } = await supabase.auth.getSession();
				
				if (!session) {
					throw new Error("Phiên đăng nhập đã hết hạn");
				}

				// Call the Edge Function
				const { data, error } = await supabase.functions.invoke(
					'admin-user-management/reset-password',
					{
						body: {
							user_id: userProfile.id,
							new_password: newPassword,
						},
						headers: {
							Authorization: `Bearer ${session.access_token}`,
						},
					}
				);

				if (error) {
					throw new Error(error.message || "Không thể đặt lại mật khẩu");
				}

				if (!data || !data.success) {
					throw new Error(data?.error || "Không thể đặt lại mật khẩu");
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
		[getVietnameseError],
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
