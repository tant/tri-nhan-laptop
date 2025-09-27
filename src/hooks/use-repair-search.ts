/**
 * Repair Tickets Search Hook
 * Focused search and filtering functionality for repair tickets
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useCallback, useState } from "react";

// Database types
type RepairStatus = Database["public"]["Enums"]["repair_status"];
type RepairPriority = "low" | "normal" | "high" | "urgent";

export interface RepairTicketSummary {
	id: string;
	ticket_code: string;
	customer_phone: string;
	customer_name: string;
	device_brand?: string;
	device_model?: string;
	issue_description: string;
	priority: RepairPriority;
	status: RepairStatus;
	estimated_cost: number | null;
	created_at: string;
	estimated_completion_date: string | null;
	technician_name?: string;
}

export interface SearchFilters {
	status?: RepairStatus;
	priority?: RepairPriority;
	customerPhone?: string;
	ticketCode?: string;
	technician?: string;
	dateRange?: {
		from: Date;
		to: Date;
	};
	limit?: number;
}

/**
 * Hook for repair ticket search and filtering
 */
export function useRepairSearch() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Search repair tickets with advanced filtering
	 */
	const getRepairTickets = useCallback(
		async (filters: SearchFilters = {}): Promise<RepairTicketSummary[]> => {
			try {
				setLoading(true);
				setError(null);

				let query = supabase
					.from("repair_tickets")
					.select(`
						id,
						ticket_code,
						customer_phone,
						issue_description,
						priority,
						status,
						estimated_cost,
						created_at,
						estimated_completion_date,
						customers(full_name),
						customer_devices(brand, model),
						user_profiles(full_name)
					`)
					.order("created_at", { ascending: false });

				// Apply filters
				if (filters.status) {
					query = query.eq("status", filters.status);
				}

				if (filters.priority) {
					query = query.eq("priority", filters.priority);
				}

				if (filters.customerPhone) {
					query = query.eq("customer_phone", filters.customerPhone);
				}

				if (filters.ticketCode) {
					query = query.ilike("ticket_code", `%${filters.ticketCode}%`);
				}

				if (filters.technician) {
					query = query.eq("assigned_technician_id", filters.technician);
				}

				if (filters.dateRange) {
					query = query.gte("created_at", filters.dateRange.from.toISOString())
						.lte("created_at", filters.dateRange.to.toISOString());
				}

				if (filters.limit) {
					query = query.limit(filters.limit);
				}

				const { data, error: queryError } = await query;

				if (queryError) {
					throw new Error(`Không thể tải danh sách phiếu sửa chữa: ${queryError.message}`);
				}

				return data.map(ticket => ({
					id: ticket.id,
					ticket_code: ticket.ticket_code,
					customer_phone: ticket.customer_phone,
					customer_name: ticket.customers?.full_name || "Không xác định",
					device_brand: ticket.customer_devices?.brand,
					device_model: ticket.customer_devices?.model,
					issue_description: ticket.issue_description,
					priority: ticket.priority as RepairPriority,
					status: ticket.status,
					estimated_cost: ticket.estimated_cost,
					created_at: ticket.created_at,
					estimated_completion_date: ticket.estimated_completion_date,
					technician_name: ticket.user_profiles?.full_name,
				}));
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	/**
	 * Search tickets by text query
	 */
	const searchByText = useCallback(
		async (query: string, limit: number = 50): Promise<RepairTicketSummary[]> => {
			if (!query.trim()) {
				return [];
			}

			try {
				setLoading(true);
				setError(null);

				const { data, error: queryError } = await supabase
					.from("repair_tickets")
					.select(`
						id,
						ticket_code,
						customer_phone,
						issue_description,
						priority,
						status,
						estimated_cost,
						created_at,
						estimated_completion_date,
						customers(full_name),
						customer_devices(brand, model),
						user_profiles(full_name)
					`)
					.or(`ticket_code.ilike.%${query}%,issue_description.ilike.%${query}%,customer_phone.ilike.%${query}%`)
					.order("created_at", { ascending: false })
					.limit(limit);

				if (queryError) {
					throw new Error(`Không thể tìm kiếm: ${queryError.message}`);
				}

				return data.map(ticket => ({
					id: ticket.id,
					ticket_code: ticket.ticket_code,
					customer_phone: ticket.customer_phone,
					customer_name: ticket.customers?.full_name || "Không xác định",
					device_brand: ticket.customer_devices?.brand,
					device_model: ticket.customer_devices?.model,
					issue_description: ticket.issue_description,
					priority: ticket.priority as RepairPriority,
					status: ticket.status,
					estimated_cost: ticket.estimated_cost,
					created_at: ticket.created_at,
					estimated_completion_date: ticket.estimated_completion_date,
					technician_name: ticket.user_profiles?.full_name,
				}));
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	/**
	 * Get technician workload for assignment optimization
	 */
	const getTechnicianWorkload = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: queryError } = await supabase
				.from("repair_tickets")
				.select(`
					assigned_technician_id,
					status,
					priority,
					user_profiles!repair_tickets_assigned_technician_id_fkey(full_name)
				`)
				.in("status", [
					"device_received",
					"preliminary_inspection",
					"awaiting_repair_plan",
					"approved_for_repair",
					"in_diagnosis",
					"waiting_parts",
					"in_repair",
					"quality_testing"
				]);

			if (queryError) {
				throw new Error(`Không thể tải thông tin kỹ thuật viên: ${queryError.message}`);
			}

			// Group by technician and calculate workload
			const workload = data.reduce((acc, ticket) => {
				if (!ticket.assigned_technician_id) return acc;

				const techId = ticket.assigned_technician_id;
				if (!acc[techId]) {
					acc[techId] = {
						technicianId: techId,
						technicianName: ticket.user_profiles?.full_name || "Không xác định",
						totalTickets: 0,
						urgentTickets: 0,
						highPriorityTickets: 0,
					};
				}

				acc[techId].totalTickets++;
				if (ticket.priority === "urgent") acc[techId].urgentTickets++;
				if (ticket.priority === "high") acc[techId].highPriorityTickets++;

				return acc;
			}, {} as Record<string, {
				technicianId: string;
				technicianName: string;
				totalTickets: number;
				urgentTickets: number;
				highPriorityTickets: number;
			}>);

			return Object.values(workload);
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Lỗi không xác định");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Preview next ticket code
	 */
	const previewNextTicketCode = useCallback(async (): Promise<string> => {
		try {
			// Get current year
			const currentYear = new Date().getFullYear();

			// Get the latest ticket code for this year
			const { data, error } = await supabase
				.from("repair_tickets")
				.select("ticket_code")
				.like("ticket_code", `LRP-${currentYear}-%`)
				.order("ticket_code", { ascending: false })
				.limit(1);

			if (error) {
				throw new Error(`Không thể tạo mã phiếu: ${error.message}`);
			}

			let nextNumber = 1;

			if (data && data.length > 0) {
				const lastCode = data[0].ticket_code;
				const match = lastCode.match(/LRP-\d{4}-(\d{6})$/);
				if (match) {
					nextNumber = parseInt(match[1]) + 1;
				}
			}

			return `LRP-${currentYear}-${nextNumber.toString().padStart(6, '0')}`;
		} catch (err) {
			console.error("Error generating ticket code:", err);
			// Fallback to timestamp-based code
			const timestamp = Date.now().toString().slice(-6);
			return `LRP-${new Date().getFullYear()}-${timestamp}`;
		}
	}, []);

	return {
		loading,
		error,
		getRepairTickets,
		searchByText,
		getTechnicianWorkload,
		previewNextTicketCode,
	};
}