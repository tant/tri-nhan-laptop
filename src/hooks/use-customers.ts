import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import {
	normalizePhoneNumber,
	toDisplayFormat,
	toStorageFormat,
	validateVietnamesePhone,
} from "@/lib/validation/phone-vietnamese";
import { useCallback, useState } from "react";
import { useCustomerSearch } from "./use-customer-search";
import { useCustomerCrud } from "./use-customer-crud";
import type { CustomerWithStats, CustomerSearchOptions } from "./use-customer-search";
import type { PhoneChangeRecord } from "./use-customer-crud";

// Database types
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type NewCustomer = Database["public"]["Tables"]["customers"]["Insert"];
type UpdateCustomer = Database["public"]["Tables"]["customers"]["Update"];

// Re-export types for backward compatibility
export type { CustomerWithStats, CustomerSearchOptions } from "./use-customer-search";
export type { PhoneChangeRecord } from "./use-customer-crud";

/**
 * Main customer hook - provides comprehensive customer management through composed focused hooks
 * This maintains backward compatibility while using the new architecture
 */
export function useCustomers() {
	const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Compose focused hooks
	const search = useCustomerSearch();
	const crud = useCustomerCrud();

	// Merge loading and error states
	const combinedLoading = loading || search.loading || crud.loading;
	const combinedError = error || search.error || crud.error;

	/**
	 * Fetch customers with optional search and statistics (legacy compatibility)
	 */
	const fetchCustomers = useCallback(
		async (options: CustomerSearchOptions = {}) => {
			const result = await search.searchCustomers(options);
			setCustomers(result);
			return result;
		},
		[search],
	);

	/**
	 * Find customer by phone number (legacy compatibility)
	 */
	const findCustomerByPhone = useCallback(
		async (phone: string): Promise<CustomerWithStats | null> => {
			return search.findCustomerByPhone(phone);
		},
		[search],
	);

	/**
	 * Create new customer (legacy compatibility)
	 */
	const createCustomer = useCallback(
		async (
			customerData: Omit<NewCustomer, "phone"> & { phone: string },
		): Promise<CustomerWithStats | null> => {
			const result = await crud.createCustomer(customerData);
			if (result) {
				// Update local state
				setCustomers((prev) => [result, ...prev]);
			}
			return result;
		},
		[crud],
	);

	/**
	 * Auto-create customer (legacy compatibility)
	 */
	const autoCreateCustomer = useCallback(
		async (
			phone: string,
			fullName: string,
		): Promise<CustomerWithStats | null> => {
			const result = await crud.autoCreateCustomer(phone, fullName);
			if (result) {
				// Update local state
				setCustomers((prev) => [result, ...prev]);
			}
			return result;
		},
		[crud],
	);

	/**
	 * Update customer (legacy compatibility)
	 */
	const updateCustomer = useCallback(
		async (
			phone: string,
			updates: UpdateCustomer,
		): Promise<CustomerWithStats | null> => {
			const result = await crud.updateCustomer(phone, updates);
			if (result) {
				// Update local state
				const normalizedPhone = normalizePhoneNumber(phone);
				setCustomers((prev) =>
					prev.map((customer) =>
						customer.phone === normalizedPhone ? result : customer,
					),
				);
			}
			return result;
		},
		[crud],
	);

	/**
	 * Search customers by text query (legacy compatibility)
	 */
	const searchCustomers = useCallback(
		async (query: string): Promise<CustomerWithStats[]> => {
			if (!query || query.length < 3) {
				return [];
			}

			return search.searchCustomers({ query, limit: 50, includeStats: true });
		},
		[search],
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
		loading: combinedLoading,
		error: combinedError,

		// Main operations
		fetchCustomers,
		findCustomerByPhone,
		createCustomer,
		updateCustomer,
		autoCreateCustomer,

		// Search operations (composed from search hook)
		searchCustomers,
		quickSearch: search.quickSearch,
		getCustomerSuggestions: search.getCustomerSuggestions,
		searchActiveCustomers: search.searchActiveCustomers,

		// Utilities
		formatPhoneForDisplay,
		validatePhone,

		// CRUD operations (composed from CRUD hook)
		deleteCustomer: crud.deleteCustomer,

		// Phone change tracking (composed from CRUD hook)
		changeCustomerPhone: crud.changeCustomerPhone,
		getPhoneChangeHistory: crud.getPhoneChangeHistory,

		// Utilities for phone number handling
		normalizePhone: normalizePhoneNumber,
		toStorageFormat,
		toDisplayFormat,
	};
}
