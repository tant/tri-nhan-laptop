import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase-types";
import {
	normalizePhoneNumber,
	toDisplayFormat,
	toStorageFormat,
	validateVietnamesePhone,
} from "@/lib/validation/phone-vietnamese";
import { useCallback, useState } from "react";

// Database types
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type NewCustomer = Database["public"]["Tables"]["customers"]["Insert"];
type UpdateCustomer = Database["public"]["Tables"]["customers"]["Update"];

export interface CustomerWithStats extends Customer {
	totalRepairs: number;
	lastRepairDate: string | null;
	activeRepairs: number;
}

export interface CustomerSearchOptions {
	query?: string;
	limit?: number;
	includeStats?: boolean;
}

export interface PhoneChangeRecord {
	oldPhone: string;
	newPhone: string;
	changedAt: string;
	changedBy: string;
	reason?: string;
}

/**
 * Custom hook for managing customer data with phone-based identification
 */
export function useCustomers() {
	const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Fetch customers with optional search and statistics
	 */
	const fetchCustomers = useCallback(
		async (options: CustomerSearchOptions = {}) => {
			try {
				setLoading(true);
				setError(null);

				let query = supabase.from("customers").select("*");

				// Apply search filter if provided
				if (options.query) {
					const normalizedQuery = normalizePhoneNumber(options.query);
					query = query.or(
						`phone.ilike.%${normalizedQuery}%,full_name.ilike.%${options.query}%`,
					);
				}

				// Apply limit
				if (options.limit) {
					query = query.limit(options.limit);
				}

				// Order by most recent
				query = query.order("created_at", { ascending: false });

				const { data: customersData, error: customersError } = await query;

				if (customersError) {
					throw new Error(
						`Không thể tải danh sách khách hàng: ${customersError.message}`,
					);
				}

				if (!customersData) {
					setCustomers([]);
					return [];
				}

				// Add repair statistics if requested
				let customersWithStats: CustomerWithStats[];

				if (options.includeStats !== false) {
					customersWithStats = await Promise.all(
						customersData.map(async (customer) => {
							try {
								// Get repair statistics
								const { data: repairStats, error: repairError } = await supabase
									.from("repair_tickets")
									.select("created_at, status")
									.eq("customer_phone", customer.phone);

								if (repairError) {
									console.error(
										"Error fetching repair stats for customer:",
										customer.phone,
										repairError,
									);
									return {
										...customer,
										totalRepairs: 0,
										lastRepairDate: null,
										activeRepairs: 0,
									};
								}

								const totalRepairs = repairStats?.length || 0;
								const activeRepairs =
									repairStats?.filter(
										(r) =>
											![
												"completed",
												"cancelled_by_customer",
												"abandoned",
											].includes(r.status),
									).length || 0;
								const lastRepairDate =
									repairStats && repairStats.length > 0
										? repairStats.sort(
												(a, b) =>
													new Date(b.created_at).getTime() -
													new Date(a.created_at).getTime(),
											)[0].created_at
										: null;

								return {
									...customer,
									totalRepairs,
									lastRepairDate,
									activeRepairs,
								};
							} catch (error) {
								console.error("Error processing customer stats:", error);
								return {
									...customer,
									totalRepairs: 0,
									lastRepairDate: null,
									activeRepairs: 0,
								};
							}
						}),
					);
				} else {
					customersWithStats = customersData.map((customer) => ({
						...customer,
						totalRepairs: 0,
						lastRepairDate: null,
						activeRepairs: 0,
					}));
				}

				setCustomers(customersWithStats);
				return customersWithStats;
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Lỗi không xác định khi tải khách hàng");
				console.error("Error fetching customers:", error);
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Find customer by phone number (primary key lookup)
	 */
	const findCustomerByPhone = useCallback(
		async (phone: string): Promise<CustomerWithStats | null> => {
			try {
				setLoading(true);
				setError(null);

				// Validate and normalize phone number
				const validation = validateVietnamesePhone(phone);
				if (!validation.isValid) {
					throw new Error(validation.error || "Số điện thoại không hợp lệ");
				}

				const normalizedPhone = normalizePhoneNumber(phone);

				const { data: customer, error: customerError } = await supabase
					.from("customers")
					.select("*")
					.eq("phone", normalizedPhone)
					.single();

				if (customerError) {
					if (customerError.code === "PGRST116") {
						// No customer found
						return null;
					}
					throw new Error(`Không thể tìm khách hàng: ${customerError.message}`);
				}

				if (!customer) return null;

				// Get repair statistics
				const { data: repairStats } = await supabase
					.from("repair_tickets")
					.select("created_at, status")
					.eq("customer_phone", customer.phone);

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
					...customer,
					totalRepairs,
					lastRepairDate,
					activeRepairs,
				};

				return customerWithStats;
			} catch (err) {
				const error =
					err instanceof Error
						? err
						: new Error("Lỗi không xác định khi tìm khách hàng");
				console.error("Error finding customer by phone:", error);
				setError(error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

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
					totalRepairs: 0,
					lastRepairDate: null,
					activeRepairs: 0,
				};

				// Update local state
				setCustomers((prev) => [customerWithStats, ...prev]);

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
					totalRepairs,
					lastRepairDate,
					activeRepairs,
				};

				// Update local state
				setCustomers((prev) =>
					prev.map((customer) =>
						customer.phone === normalizedPhone ? customerWithStats : customer,
					),
				);

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
	 * Search customers by phone number with partial matching
	 */
	const searchCustomers = useCallback(
		async (query: string): Promise<CustomerWithStats[]> => {
			if (!query || query.length < 3) {
				return [];
			}

			return fetchCustomers({ query, limit: 50, includeStats: true });
		},
		[fetchCustomers],
	);

	/**
	 * Format phone number for display
	 */
	const formatPhoneForDisplay = useCallback((phone: string): string => {
		return toDisplayFormat(phone);
	}, []);

	/**
	 * Validate phone number input
	 */
	const validatePhone = useCallback((phone: string) => {
		return validateVietnamesePhone(phone);
	}, []);

	return {
		// State
		customers,
		loading,
		error,

		// Main operations
		fetchCustomers,
		findCustomerByPhone,
		createCustomer,
		updateCustomer,
		autoCreateCustomer,

		// Search and utilities
		searchCustomers,
		formatPhoneForDisplay,
		validatePhone,

		// Utilities for phone number handling
		normalizePhone: normalizePhoneNumber,
		toStorageFormat,
		toDisplayFormat,
	};
}
