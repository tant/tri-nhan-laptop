/**
 * Customer Search Hook
 * Focused search and filtering functionality for customers
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { normalizePhone, validatePhone } from "@/lib/phone-utils";
import { useCallback, useState } from "react";

// Database types
type Customer = Database["public"]["Tables"]["customers"]["Row"];

export interface CustomerWithStats extends Customer {
	fullName: string; // Alias for full_name to match test expectations
	createdAt: string; // Alias for created_at to match test expectations
	totalRepairs: number;
	lastRepairDate: string | null;
	activeRepairs: number;
}

export interface CustomerSearchOptions {
	query?: string;
	limit?: number;
	includeStats?: boolean;
}

export interface CustomerSummary {
	phone: string;
	full_name: string;
	email?: string;
	address?: string;
	created_at: string;
	totalRepairs: number;
	lastRepairDate: string | null;
	activeRepairs: number;
}

/**
 * Hook for customer search and filtering
 */
export function useCustomerSearch() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Fetch repair statistics for a customer
	 */
	const fetchRepairStats = useCallback(async (customerPhone: string) => {
		try {
			const { data: repairStats, error: repairError } = await supabase
				.from("repair_tickets")
				.select("created_at, status")
				.eq("customer_phone", customerPhone);

			if (repairError) {
				console.error("Error fetching repair stats for customer:", customerPhone, repairError);
				return {
					totalRepairs: 0,
					lastRepairDate: null,
					activeRepairs: 0,
				};
			}

			const totalRepairs = repairStats?.length || 0;
			const activeRepairs = repairStats?.filter(
				(r) => !["completed", "cancelled_by_customer", "abandoned"].includes(r.status),
			).length || 0;

			const lastRepairDate = repairStats && repairStats.length > 0
				? repairStats.sort(
					(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
				)[0].created_at
				: null;

			return {
				totalRepairs,
				lastRepairDate,
				activeRepairs,
			};
		} catch (error) {
			console.error("Error processing customer stats:", error);
			return {
				totalRepairs: 0,
				lastRepairDate: null,
				activeRepairs: 0,
			};
		}
	}, []);

	/**
	 * Search customers with advanced filtering and statistics
	 */
	const searchCustomers = useCallback(
		async (options: CustomerSearchOptions = {}): Promise<CustomerWithStats[]> => {
			try {
				setLoading(true);
				setError(null);

				let query = supabase.from("customers").select("*");

				// Apply search filter if provided
				if (options.query) {
					const normalizedQuery = normalizePhone(options.query);
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
						`Không thể tìm kiếm khách hàng: ${customersError.message}`,
					);
				}

				if (!customersData) {
					return [];
				}

				// Add repair statistics if requested
				let customersWithStats: CustomerWithStats[];

				if (options.includeStats !== false) {
					customersWithStats = await Promise.all(
						customersData.map(async (customer) => {
							const stats = await fetchRepairStats(customer.phone);
							return {
								...customer,
								fullName: customer.full_name,
								createdAt: customer.created_at,
								...stats,
							};
						}),
					);
				} else {
					customersWithStats = customersData.map((customer) => ({
						...customer,
						fullName: customer.full_name,
						createdAt: customer.created_at,
						totalRepairs: 0,
						lastRepairDate: null,
						activeRepairs: 0,
					}));
				}

				return customersWithStats;
			} catch (err) {
				const error = err instanceof Error
					? err
					: new Error("Lỗi không xác định khi tìm kiếm khách hàng");
				console.error("Error searching customers:", error);
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[fetchRepairStats],
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
				const validation = validatePhone(phone);
				if (!validation.isValid) {
					throw new Error(validation.error || "Số điện thoại không hợp lệ");
				}

				const normalizedPhone = normalizePhone(phone);

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
				const stats = await fetchRepairStats(customer.phone);

				const customerWithStats: CustomerWithStats = {
					...customer,
					fullName: customer.full_name,
					createdAt: customer.created_at,
					...stats,
				};

				return customerWithStats;
			} catch (err) {
				const error = err instanceof Error
					? err
					: new Error("Lỗi không xác định khi tìm khách hàng");
				console.error("Error finding customer by phone:", error);
				setError(error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[fetchRepairStats],
	);

	/**
	 * Quick search customers by text query (phone or name)
	 */
	const quickSearch = useCallback(
		async (query: string, limit: number = 10): Promise<CustomerWithStats[]> => {
			if (!query || query.length < 2) {
				return [];
			}

			return searchCustomers({
				query,
				limit,
				includeStats: false // Quick search without heavy stats for performance
			});
		},
		[searchCustomers],
	);

	/**
	 * Get customer suggestions for autocomplete
	 */
	const getCustomerSuggestions = useCallback(
		async (query: string): Promise<CustomerSummary[]> => {
			if (!query || query.length < 2) {
				return [];
			}

			try {
				const normalizedQuery = normalizePhone(query);

				const { data: customers, error } = await supabase
					.from("customers")
					.select("phone, full_name, email, address, created_at")
					.or(`phone.ilike.%${normalizedQuery}%,full_name.ilike.%${query}%`)
					.order("created_at", { ascending: false })
					.limit(5);

				if (error) {
					throw new Error(`Không thể tải gợi ý khách hàng: ${error.message}`);
				}

				if (!customers) return [];

				// Get basic stats for suggestions
				return Promise.all(
					customers.map(async (customer) => {
						const stats = await fetchRepairStats(customer.phone);
						return {
							...customer,
							...stats,
						};
					})
				);
			} catch (err) {
				console.error("Error getting customer suggestions:", err);
				return [];
			}
		},
		[fetchRepairStats],
	);

	/**
	 * Search customers with active repairs
	 */
	const searchActiveCustomers = useCallback(async (): Promise<CustomerWithStats[]> => {
		try {
			setLoading(true);
			setError(null);

			// Get customers with active repair tickets
			const { data: activeRepairs, error: repairsError } = await supabase
				.from("repair_tickets")
				.select("customer_phone")
				.not("status", "in", "(completed,cancelled_by_customer,abandoned)");

			if (repairsError) {
				throw new Error(`Không thể tìm khách hàng có phiếu đang sửa: ${repairsError.message}`);
			}

			if (!activeRepairs || activeRepairs.length === 0) {
				return [];
			}

			// Get unique customer phones
			const uniquePhones = [...new Set(activeRepairs.map(r => r.customer_phone))];

			// Get customer details
			const { data: customers, error: customersError } = await supabase
				.from("customers")
				.select("*")
				.in("phone", uniquePhones);

			if (customersError) {
				throw new Error(`Không thể tải thông tin khách hàng: ${customersError.message}`);
			}

			if (!customers) return [];

			// Add stats for each customer
			const customersWithStats = await Promise.all(
				customers.map(async (customer) => {
					const stats = await fetchRepairStats(customer.phone);
					return {
						...customer,
						fullName: customer.full_name,
						createdAt: customer.created_at,
						...stats,
					};
				})
			);

			return customersWithStats;
		} catch (err) {
			const error = err instanceof Error
				? err
				: new Error("Lỗi không xác định khi tìm khách hàng có phiếu đang sửa");
			console.error("Error searching active customers:", error);
			setError(error);
			return [];
		} finally {
			setLoading(false);
		}
	}, [fetchRepairStats]);

	return {
		loading,
		error,
		searchCustomers,
		findCustomerByPhone,
		quickSearch,
		getCustomerSuggestions,
		searchActiveCustomers,
		fetchRepairStats,
	};
}