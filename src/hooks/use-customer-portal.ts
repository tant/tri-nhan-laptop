import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

// Database types
type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type RepairStatus = Database["public"]["Enums"]["repair_status"];

export interface CustomerRepairInfo extends RepairTicket {
	customer: Customer;
	status_history?: {
		old_status: RepairStatus | null;
		new_status: RepairStatus;
		notes: string | null;
		created_at: string;
		changed_by_user: { full_name: string };
	}[];
}

export interface RepairLookupState {
	loading: boolean;
	error: Error | null;
	repairInfo: CustomerRepairInfo | null;
}

export interface ServiceHistoryEntry {
	id: string;
	ticket_code: string;
	device_info: {
		brand: string;
		model: string;
		serial_number?: string;
		initial_condition: string;
	};
	issue_description: string;
	status: RepairStatus;
	created_at: string;
	warranty_until: string | null;
	total_cost: number | null;
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
			// Find repair by ticket code and verify customer phone
			const { data: repairData, error: repairError } = await supabase
				.from("repair_tickets")
				.select(`
					*,
					customer:customers!inner(*)
				`)
				.eq("ticket_code", ticketNumber)
				.eq("customers.phone", customerPhone)
				.single();

			if (repairError) {
				if (repairError.code === 'PGRST116') {
					throw new Error("Không tìm thấy phiếu sửa chữa với thông tin này");
				}
				throw repairError;
			}

			// Note: Status history and parts are now stored in the ticket record
			// Status history can be built from a separate table if needed
			// Parts used are in the parts_used JSONB field

			const repairInfo: CustomerRepairInfo = {
				...repairData,
				status_history: [] // Can be populated from status logs if needed
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
	const lookupRepairByEmail = useCallback(async (_customerEmail: string, customerPhone: string) => {
		setState(prev => ({ ...prev, loading: true, error: null, repairInfo: null }));

		try {
			// Find repairs by customer phone (email not stored in customers table per docs)
			const { data: repairData, error: repairError } = await supabase
				.from("repair_tickets")
				.select(`
					*,
					customer:customers!inner(*)
				`)
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

			const repairInfo: CustomerRepairInfo = {
				...repairData,
				status_history: [] // Can be populated from status logs if needed
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
				.from("repair_tickets")
				.select(`
					id,
					ticket_code,
					device_info,
					issue_description,
					status,
					created_at,
					warranty_until,
					total_cost,
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
				.from("repair_tickets")
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
					table: "repair_tickets",
					filter: `id=eq.${repairId}`
				},
				async () => {
					// Reload complete repair info when changes occur
					try {
						const { data: updatedRepair } = await supabase
							.from("repair_tickets")
							.select(`
								*,
								customer:customers(*)
							`)
							.eq("id", repairId)
							.single();

						if (updatedRepair) {
							callback({
								...updatedRepair,
								status_history: []
							} as CustomerRepairInfo);
						}
					} catch (error) {
						console.error("Failed to reload repair data:", error);
					}
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
			device_received: "Đã tiếp nhận thiết bị",
			preliminary_inspection: "Đang kiểm tra ban đầu",
			awaiting_repair_plan: "Chờ xác nhận phương án sửa chữa",
			approved_for_repair: "Đã xác nhận sửa chữa",
			in_diagnosis: "Đang chẩn đoán chi tiết",
			waiting_parts: "Đang đặt hàng linh kiện",
			in_repair: "Đang thực hiện sửa chữa",
			quality_testing: "Đang kiểm tra chất lượng",
			ready_for_pickup: "Sẵn sàng nhận máy",
			completed: "Đã hoàn thành",
			cannot_repair: "Không thể sửa chữa",
			cancelled_by_customer: "Đã hủy sửa chữa",
			repair_failed: "Sửa chữa gặp khó khăn",
			customer_no_show: "Chờ khách hàng liên hệ",
			ready_for_return: "Sẵn sàng trả máy",
			abandoned: "Liên hệ để nhận máy"
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
		// Accept multiple formats: TK001, MS001, TNL-YYMMDD-XXX
		const tkFormat = /^TK\d+$/;  // Our sample data format
		const msFormat = /^MS\d+$/;  // Legacy format
		const newFormat = /^[A-Z]{2,4}-\d{6}-\d{3,4}$/; // Full format
		return tkFormat.test(ticketNumber) || msFormat.test(ticketNumber) || newFormat.test(ticketNumber);
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