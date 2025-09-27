/**
 * Customer CRUD Operations Hook
 * Focused Create, Read, Update, Delete operations for customers
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import {
	normalizePhoneNumber,
	toStorageFormat,
	validateVietnamesePhone,
} from "@/lib/validation/phone-vietnamese";
import { useCallback, useState } from "react";
import { useCustomerSearch } from "./use-customer-search";
import type { CustomerWithStats } from "./use-customer-search";

// Database types
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type NewCustomer = Database["public"]["Tables"]["customers"]["Insert"];
type UpdateCustomer = Database["public"]["Tables"]["customers"]["Update"];

export interface PhoneChangeRecord {
	oldPhone: string;
	newPhone: string;
	changedAt: string;
	changedBy: string;
	reason?: string;
}

/**
 * Hook for customer CRUD operations
 */
export function useCustomerCrud() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const { findCustomerByPhone } = useCustomerSearch();

	/**
	 * Create new customer with phone number validation
	 */
	const createCustomer = useCallback(
		async (
			customerData: Omit<NewCustomer, "phone"> & { phone: string },
		): Promise<CustomerWithStats | null> => {
			try {
				setLoading(true);
				setError(null);

				// Validate phone number
				const validation = validateVietnamesePhone(customerData.phone);
				if (!validation.isValid) {
					throw new Error(validation.error || "Số điện thoại không hợp lệ");
				}

				const normalizedPhone = toStorageFormat(customerData.phone);

				// Check for duplicate phone number
				const existingCustomer = await findCustomerByPhone(normalizedPhone);
				if (existingCustomer) {
					throw new Error(
						"Số điện thoại này đã được sử dụng bởi khách hàng khác",
					);
				}

				// Create customer
				const { data: newCustomer, error: createError } = await supabase
					.from("customers")
					.insert({
						...customerData,
						phone: normalizedPhone,
					})
					.select("*")
					.single();

				if (createError) {
					throw new Error(
						`Không thể tạo khách hàng mới: ${createError.message}`,
					);
				}

				if (!newCustomer) {
					throw new Error("Không có dữ liệu khách hàng được trả về");
				}

				const customerWithStats: CustomerWithStats = {
					...newCustomer,
					fullName: newCustomer.full_name,
					createdAt: newCustomer.created_at,
					totalRepairs: 0,
					lastRepairDate: null,
					activeRepairs: 0,
				};

				return customerWithStats;
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Lỗi không xác định khi tạo khách hàng");
				console.error("Error creating customer:", error);
				setError(error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[findCustomerByPhone],
	);

	/**
	 * Auto-create customer when first repair ticket is submitted
	 */
	const autoCreateCustomer = useCallback(
		async (
			phone: string,
			fullName: string,
		): Promise<CustomerWithStats | null> => {
			try {
				// Check if customer already exists
				const existingCustomer = await findCustomerByPhone(phone);
				if (existingCustomer) {
					return existingCustomer;
				}

				// Create new customer with minimal data
				return await createCustomer({
					phone,
					full_name: fullName,
					address: null,
					notes: "Tự động tạo từ phiếu sửa chữa",
				});
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Lỗi tạo khách hàng tự động");
				console.error("Error auto-creating customer:", error);
				setError(error);
				return null;
			}
		},
		[findCustomerByPhone, createCustomer],
	);

	/**
	 * Update customer information
	 */
	const updateCustomer = useCallback(
		async (
			phone: string,
			updates: UpdateCustomer,
		): Promise<CustomerWithStats | null> => {
			try {
				setLoading(true);
				setError(null);

				const normalizedPhone = normalizePhoneNumber(phone);

				// If updating phone number, validate new number
				if (updates.phone && updates.phone !== phone) {
					const validation = validateVietnamesePhone(updates.phone);
					if (!validation.isValid) {
						throw new Error(
							validation.error || "Số điện thoại mới không hợp lệ",
						);
					}

					const newNormalizedPhone = toStorageFormat(updates.phone);

					// Check for duplicate
					const existingCustomer =
						await findCustomerByPhone(newNormalizedPhone);
					if (existingCustomer && existingCustomer.phone !== normalizedPhone) {
						throw new Error(
							"Số điện thoại mới đã được sử dụng bởi khách hàng khác",
						);
					}

					updates.phone = newNormalizedPhone;
				}

				const { data: updatedCustomer, error: updateError } = await supabase
					.from("customers")
					.update(updates)
					.eq("phone", normalizedPhone)
					.select("*")
					.single();

				if (updateError) {
					throw new Error(
						`Không thể cập nhật khách hàng: ${updateError.message}`,
					);
				}

				if (!updatedCustomer) {
					throw new Error("Không có dữ liệu khách hàng được trả về");
				}

				// Get updated statistics
				const { data: repairStats } = await supabase
					.from("repair_tickets")
					.select("created_at, status")
					.eq("customer_phone", updatedCustomer.phone);

				const totalRepairs = repairStats?.length || 0;
				const activeRepairs =
					repairStats?.filter(
						(r) =>
							!["completed", "cancelled_by_customer", "abandoned"].includes(
								r.status,
							),
					).length || 0;
				const lastRepairDate =
					repairStats && repairStats.length > 0
						? repairStats.sort(
								(a, b) =>
									new Date(b.created_at).getTime() -
									new Date(a.created_at).getTime(),
							)[0].created_at
						: null;

				const customerWithStats: CustomerWithStats = {
					...updatedCustomer,
					fullName: updatedCustomer.full_name,
					createdAt: updatedCustomer.created_at,
					totalRepairs,
					lastRepairDate,
					activeRepairs,
				};

				return customerWithStats;
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Lỗi không xác định khi cập nhật khách hàng");
				console.error("Error updating customer:", error);
				setError(error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[findCustomerByPhone],
	);

	/**
	 * Delete customer (soft delete by updating status or marking as inactive)
	 */
	const deleteCustomer = useCallback(
		async (phone: string): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				const normalizedPhone = normalizePhoneNumber(phone);

				// Check if customer has active repairs
				const { data: activeRepairs, error: repairsError } = await supabase
					.from("repair_tickets")
					.select("id")
					.eq("customer_phone", normalizedPhone)
					.not("status", "in", "(completed,cancelled_by_customer,abandoned)");

				if (repairsError) {
					throw new Error(`Không thể kiểm tra phiếu sửa chữa: ${repairsError.message}`);
				}

				if (activeRepairs && activeRepairs.length > 0) {
					throw new Error(
						"Không thể xóa khách hàng còn có phiếu sửa chữa đang thực hiện",
					);
				}

				// For now, we'll add a note instead of hard delete to preserve data integrity
				const { error: updateError } = await supabase
					.from("customers")
					.update({
						notes: `${new Date().toISOString()}: Khách hàng đã được đánh dấu xóa`,
					})
					.eq("phone", normalizedPhone);

				if (updateError) {
					throw new Error(`Không thể xóa khách hàng: ${updateError.message}`);
				}

				return true;
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Lỗi không xác định khi xóa khách hàng");
				console.error("Error deleting customer:", error);
				setError(error);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Change customer phone number with history tracking
	 */
	const changeCustomerPhone = useCallback(
		async (
			customerId: string,
			oldPhone: string,
			newPhone: string,
			reason: string,
		): Promise<PhoneChangeRecord | null> => {
			try {
				setLoading(true);
				setError(null);

				// Validate new phone number
				const validation = validateVietnamesePhone(newPhone);
				if (!validation.isValid) {
					throw new Error(validation.error || "Số điện thoại mới không hợp lệ");
				}

				const normalizedNewPhone = toStorageFormat(newPhone);
				const normalizedOldPhone = normalizePhoneNumber(oldPhone);

				// Check if new phone already exists
				const existingCustomer = await findCustomerByPhone(normalizedNewPhone);
				if (existingCustomer && existingCustomer.phone !== normalizedOldPhone) {
					throw new Error(
						"Số điện thoại mới đã được sử dụng bởi khách hàng khác",
					);
				}

				// Update customer phone
				const { error: updateError } = await supabase
					.from("customers")
					.update({ phone: normalizedNewPhone })
					.eq("phone", normalizedOldPhone);

				if (updateError) {
					throw new Error(
						`Không thể cập nhật số điện thoại: ${updateError.message}`,
					);
				}

				// Create phone change record
				const changeRecord: PhoneChangeRecord = {
					oldPhone: normalizedOldPhone,
					newPhone: normalizedNewPhone,
					changedAt: new Date().toISOString(),
					changedBy: customerId,
					reason,
				};

				// Log phone change history (optional table)
				try {
					const { error: historyError } = await supabase
						.from("customer_phone_changes")
						.insert({
							customer_id: customerId,
							old_phone: normalizedOldPhone,
							new_phone: normalizedNewPhone,
							changed_at: changeRecord.changedAt,
							changed_by: customerId,
							reason,
						});

					if (historyError) {
						console.error("Failed to log phone change history:", historyError);
					}
				} catch (err) {
					// Phone change history is optional, don't fail the operation
					console.warn("Phone change history table not available:", err);
				}

				return changeRecord;
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Lỗi không xác định khi thay đổi số điện thoại");
				console.error("Error changing customer phone:", error);
				setError(error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[findCustomerByPhone],
	);

	/**
	 * Get phone change history for a customer
	 */
	const getPhoneChangeHistory = useCallback(
		async (customerId: string): Promise<PhoneChangeRecord[]> => {
			try {
				const { data, error } = await supabase
					.from("customer_phone_changes")
					.select("*")
					.eq("customer_id", customerId)
					.order("changed_at", { ascending: false });

				if (error) {
					// Table might not exist, return empty array
					if (error.code === "42P01") {
						console.warn("customer_phone_changes table not found");
						return [];
					}
					throw new Error(`Không thể tải lịch sử thay đổi: ${error.message}`);
				}

				return (data || []).map((record) => ({
					oldPhone: record.old_phone,
					newPhone: record.new_phone,
					changedAt: record.changed_at,
					changedBy: record.changed_by,
					reason: record.reason,
				}));
			} catch (err) {
				console.error("Error fetching phone change history:", err);
				return [];
			}
		},
		[],
	);

	return {
		loading,
		error,
		createCustomer,
		autoCreateCustomer,
		updateCustomer,
		deleteCustomer,
		changeCustomerPhone,
		getPhoneChangeHistory,
	};
}