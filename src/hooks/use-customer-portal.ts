import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

// Database types
type Repair = Database["public"]["Tables"]["repairs"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type RepairStatus = Database["public"]["Enums"]["repair_status"];

export interface CustomerRepairInfo extends Repair {
	customer: Customer;
	status_history?: {
		old_status: RepairStatus | null;
		new_status: RepairStatus;
		notes: string | null;
		created_at: string;
		changed_by_user: { full_name: string };
	}[];
	parts_used?: {
		id: string;
		part_name: string;
		quantity_used: number;
		total_cost: number;
	}[];
}

export interface RepairLookupState {
	loading: boolean;
	error: Error | null;
	repairInfo: CustomerRepairInfo | null;
}

export interface ServiceHistoryEntry {
	id: string;
	ticket_number?: string;
	device_type: string;
	device_model: string;
	issue_description: string;
	status: RepairStatus;
	created_at: string;
	completed_at: string | null;
	final_cost: number | null;
}

export function useCustomerPortal() {
	const [state, setState] = useState<RepairLookupState>({
		loading: false,
		error: null,
		repairInfo: null
	});

	// Lookup repair by ticket number and customer phone
	const lookupRepair = useCallback(async (ticketNumber: string, customerPhone: string) => {
		setState(prev => ({ ...prev, loading: true, error: null, repairInfo: null }));

		try {
			// Find repair by ticket number and verify customer phone
			const { data: repairData, error: repairError } = await supabase
				.from("repairs")
				.select(`
					*,
					customer:customers!inner(*)
				`)
				.eq("ticket_number", ticketNumber)
				.eq("customers.phone", customerPhone)
				.single();

			if (repairError) {
				if (repairError.code === 'PGRST116') {
					throw new Error("Không tìm thấy phiếu sửa chữa với thông tin này");
				}
				throw repairError;
			}

			// Get status history
			const { data: statusHistory, error: historyError } = await supabase
				.from("repair_status_logs")
				.select(`
					old_status,
					new_status,
					notes,
					created_at,
					changed_by_user:user_profiles(full_name)
				`)
				.eq("repair_id", repairData.id)
				.order("created_at", { ascending: true });

			if (historyError) {
				console.warn("Could not load status history:", historyError);
			}

			// Get parts used
			const { data: partsUsed, error: partsError } = await supabase
				.from("repair_parts")
				.select(`
					id,
					quantity_used,
					total_cost,
					part:parts(name)
				`)
				.eq("repair_id", repairData.id);

			if (partsError) {
				console.warn("Could not load parts used:", partsError);
			}

			// Transform parts data
			const transformedParts = (partsUsed || []).map(part => ({
				id: part.id,
				part_name: (part.part as any)?.name || "Unknown Part",
				quantity_used: part.quantity_used,
				total_cost: part.total_cost
			}));

			const repairInfo: CustomerRepairInfo = {
				...repairData,
				status_history: statusHistory as any || [],
				parts_used: transformedParts
			};

			setState(prev => ({
				...prev,
				loading: false,
				repairInfo
			}));

			return repairInfo;

		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				error: error as Error
			}));
			throw error;
		}
	}, []);

	// Lookup repair by customer email and phone (alternative method)
	const lookupRepairByEmail = useCallback(async (customerEmail: string, customerPhone: string) => {
		setState(prev => ({ ...prev, loading: true, error: null, repairInfo: null }));

		try {
			// Find repairs by customer email and phone
			const { data: repairData, error: repairError } = await supabase
				.from("repairs")
				.select(`
					*,
					customer:customers!inner(*)
				`)
				.eq("customers.email", customerEmail)
				.eq("customers.phone", customerPhone)
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (repairError) {
				if (repairError.code === 'PGRST116') {
					throw new Error("Không tìm thấy phiếu sửa chữa với thông tin này");
				}
				throw repairError;
			}

			// Get additional data same as lookupRepair
			const [statusHistoryResult, partsUsedResult] = await Promise.all([
				supabase
					.from("repair_status_logs")
					.select(`
						old_status,
						new_status,
						notes,
						created_at,
						changed_by_user:user_profiles(full_name)
					`)
					.eq("repair_id", repairData.id)
					.order("created_at", { ascending: true }),

				supabase
					.from("repair_parts")
					.select(`
						id,
						quantity_used,
						total_cost,
						part:parts(name)
					`)
					.eq("repair_id", repairData.id)
			]);

			const transformedParts = (partsUsedResult.data || []).map(part => ({
				id: part.id,
				part_name: (part.part as any)?.name || "Unknown Part",
				quantity_used: part.quantity_used,
				total_cost: part.total_cost
			}));

			const repairInfo: CustomerRepairInfo = {
				...repairData,
				status_history: statusHistoryResult.data as any || [],
				parts_used: transformedParts
			};

			setState(prev => ({
				...prev,
				loading: false,
				repairInfo
			}));

			return repairInfo;

		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				error: error as Error
			}));
			throw error;
		}
	}, []);

	// Get customer service history
	const getServiceHistory = useCallback(async (customerPhone: string) => {
		try {
			const { data, error } = await supabase
				.from("repairs")
				.select(`
					id,
					device_type,
					device_model,
					issue_description,
					status,
					created_at,
					completed_at,
					final_cost,
					customer:customers!inner(phone)
				`)
				.eq("customers.phone", customerPhone)
				.order("created_at", { ascending: false });

			if (error) throw error;

			return data as ServiceHistoryEntry[];
		} catch (error) {
			console.error("Failed to get service history:", error);
			throw error;
		}
	}, []);

	// Submit customer feedback
	const submitFeedback = useCallback(async (
		repairId: string,
		customerPhone: string,
		rating: number,
		comments: string
	) => {
		try {
			// Verify the repair belongs to the customer
			const { error: verifyError } = await supabase
				.from("repairs")
				.select(`
					id,
					customer:customers!inner(phone)
				`)
				.eq("id", repairId)
				.eq("customers.phone", customerPhone)
				.single();

			if (verifyError) {
				throw new Error("Không tìm thấy phiếu sửa chữa hoặc không có quyền truy cập");
			}

			// Insert feedback
			const { error: insertError } = await supabase
				.from("customer_feedback")
				.insert({
					repair_id: repairId,
					rating,
					comments,
					submitted_at: new Date().toISOString()
				});

			if (insertError) throw insertError;

			return true;
		} catch (error) {
			console.error("Failed to submit feedback:", error);
			throw error;
		}
	}, []);

	// Get real-time status updates for a repair
	const subscribeToRepairUpdates = useCallback((repairId: string, callback: (repairInfo: CustomerRepairInfo) => void) => {
		const channel = supabase
			.channel(`repair-updates-${repairId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "repairs",
					filter: `id=eq.${repairId}`
				},
				async () => {
					// Reload complete repair info when changes occur
					try {
						const { data: updatedRepair } = await supabase
							.from("repairs")
							.select(`
								*,
								customer:customers(*)
							`)
							.eq("id", repairId)
							.single();

						if (updatedRepair) {
							callback(updatedRepair as CustomerRepairInfo);
						}
					} catch (error) {
						console.error("Failed to reload repair data:", error);
					}
				}
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "repair_status_logs",
					filter: `repair_id=eq.${repairId}`
				},
				() => {
					// Reload repair info when status changes - would need ticket_number field
					// For now, just reload the current repair info
					console.log("Status changed for repair:", repairId);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [lookupRepair, state.repairInfo]);

	// Format Vietnamese status labels
	const getVietnameseStatus = useCallback((status: RepairStatus) => {
		const statusMap: Record<RepairStatus, string> = {
			received: "Đã tiếp nhận",
			diagnosed: "Đã chẩn đoán",
			waiting_parts: "Chờ linh kiện",
			in_progress: "Đang sửa chữa",
			completed: "Hoàn thành",
			ready_for_pickup: "Sẵn sàng giao",
			delivered: "Đã giao",
			cancelled: "Đã hủy"
		};
		return statusMap[status] || status;
	}, []);

	// Format currency
	const formatCurrency = useCallback((amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	}, []);

	// Validate ticket number format
	const isValidTicketNumber = useCallback((ticketNumber: string) => {
		// Accept both old format (MS001) and new format (TNL-YYMMDD-XXX)
		const oldFormat = /^MS\d+$/;
		const newFormat = /^[A-Z]{2,4}-\d{6}-\d{3,4}$/;
		return oldFormat.test(ticketNumber) || newFormat.test(ticketNumber);
	}, []);

	// Validate phone number
	const isValidPhoneNumber = useCallback((phone: string) => {
		const pattern = /^(09|03|07|08|05)\d{8}$/;
		return pattern.test(phone);
	}, []);

	// Validate email
	const isValidEmail = useCallback((email: string) => {
		const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return pattern.test(email);
	}, []);

	return {
		...state,
		lookupRepair,
		lookupRepairByEmail,
		getServiceHistory,
		submitFeedback,
		subscribeToRepairUpdates,
		getVietnameseStatus,
		formatCurrency,
		isValidTicketNumber,
		isValidPhoneNumber,
		isValidEmail
	};
}