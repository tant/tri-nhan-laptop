import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

// Database types
type Part = Database["public"]["Tables"]["parts"]["Row"];

export interface PartUsage {
	part_id: string;
	quantity_used: number;
	cost_per_unit: number;
	notes?: string;
}

export interface PartWithStock extends Part {
	is_low_stock: boolean;
	stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface PartReservation {
	id: string;
	part_id: string;
	repair_id: string;
	quantity_reserved: number;
	reserved_by: string;
	reserved_at: string;
	expires_at: string;
	status: "active" | "confirmed" | "cancelled" | "expired";
	notes?: string;
}

export interface InventoryTransaction {
	id: string;
	part_id: string;
	transaction_type:
		| "purchase"
		| "usage"
		| "adjustment"
		| "reservation"
		| "return";
	quantity_change: number;
	quantity_before: number;
	quantity_after: number;
	cost_per_unit?: number;
	total_cost?: number;
	reference_id?: string;
	reference_type?: "repair" | "reservation" | "adjustment" | "purchase";
	notes?: string;
	performed_by?: string;
	created_at: string;
}

export interface PartsManagementState {
	loading: boolean;
	error: Error | null;
	lowStockParts: Part[];
	totalInventoryValue: number;
	activeReservations: PartReservation[];
}

export function usePartsManagement() {
	const [state, setState] = useState<PartsManagementState>({
		loading: false,
		error: null,
		lowStockParts: [],
		totalInventoryValue: 0,
		activeReservations: [],
	});

	// Add parts to a repair
	const addPartsToRepair = useCallback(
		async (repairId: string, parts: PartUsage[], userId: string) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				// Start a transaction-like operation
				const partUpdates = [];
				const usageRecords = [];

				for (const partUsage of parts) {
					// Get current part stock
					const { data: currentPart, error: fetchError } = await supabase
						.from("parts")
						.select("*")
						.eq("id", partUsage.part_id)
						.single();

					if (fetchError) throw fetchError;

					// Check if sufficient stock available
					if (currentPart.current_stock < partUsage.quantity_used) {
						throw new Error(
							`Không đủ linh kiện ${currentPart.name}. Tồn kho: ${currentPart.current_stock}, cần: ${partUsage.quantity_used}`,
						);
					}

					// Calculate new stock quantity
					const newStockQuantity =
						currentPart.current_stock - partUsage.quantity_used;

					// Prepare stock update
					partUpdates.push({
						id: partUsage.part_id,
						current_stock: newStockQuantity,
						updated_at: new Date().toISOString(),
					});

					// Prepare usage record
					usageRecords.push({
						repair_id: repairId,
						part_id: partUsage.part_id,
						quantity_used: partUsage.quantity_used,
						cost_per_unit: partUsage.cost_per_unit,
						total_cost: partUsage.quantity_used * partUsage.cost_per_unit,
						notes: partUsage.notes,
						used_by: userId,
						used_at: new Date().toISOString(),
					});
				}

				// Execute stock updates
				for (const update of partUpdates) {
					const { error: updateError } = await supabase
						.from("parts")
						.update({
							current_stock: update.current_stock,
							updated_at: update.updated_at,
						})
						.eq("id", update.id);

					if (updateError) throw updateError;
				}

				// Insert usage records
				const { error: usageError } = await supabase
					.from("repair_parts")
					.insert(usageRecords);

				if (usageError) throw usageError;

				// Log activity
				await logPartsUsage(repairId, parts, userId);

				setState((prev) => ({ ...prev, loading: false }));
				return true;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[],
	);

	// Get parts used in a repair
	const getRepairParts = useCallback(async (repairId: string) => {
		const { data, error } = await supabase
			.from("repair_parts")
			.select(`
				*,
				part:parts(*)
			`)
			.eq("repair_id", repairId)
			.order("used_at", { ascending: false });

		if (error) throw error;
		return data;
	}, []);

	// Calculate total parts cost for a repair
	const calculateRepairPartsCost = useCallback(async (repairId: string) => {
		const { data, error } = await supabase
			.from("repair_parts")
			.select("total_cost")
			.eq("repair_id", repairId);

		if (error) throw error;

		const totalCost = data.reduce(
			(sum, item) => sum + (item.total_cost || 0),
			0,
		);
		return totalCost;
	}, []);

	// Get low stock parts
	const getLowStockParts = useCallback(async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const { data, error } = await supabase
				.from("parts")
				.select("*")
				.order("current_stock", { ascending: true });

			if (error) throw error;

			// Filter for low stock parts on client side
			const lowStockParts = (data || []).filter(part =>
				part.current_stock <= part.min_stock_level || part.current_stock === 0
			);

			setState((prev) => ({
				...prev,
				loading: false,
				lowStockParts: lowStockParts,
			}));

			return lowStockParts;
		} catch (error) {
			setState((prev) => ({
				...prev,
				loading: false,
				error: error as Error,
			}));
			throw error;
		}
	}, []);

	// Calculate total inventory value
	const calculateInventoryValue = useCallback(async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const { data, error } = await supabase
				.from("parts")
				.select("current_stock, selling_price");

			if (error) throw error;

			const totalValue = (data || []).reduce((sum, part) => {
				return sum + part.current_stock * (part.selling_price || 0);
			}, 0);

			setState((prev) => ({
				...prev,
				loading: false,
				totalInventoryValue: totalValue,
			}));

			return totalValue;
		} catch (error) {
			setState((prev) => ({
				...prev,
				loading: false,
				error: error as Error,
			}));
			throw error;
		}
	}, []);

	// Get parts with enhanced stock status
	const getPartsWithStockStatus = useCallback(async (): Promise<
		PartWithStock[]
	> => {
		const { data, error } = await supabase
			.from("parts")
			.select("*")
			.order("name", { ascending: true });

		if (error) throw error;

		return (data || []).map((part) => {
			const isLowStock = part.current_stock <= part.min_stock_level;
			const isOutOfStock = part.current_stock === 0;

			let stockStatus: "in_stock" | "low_stock" | "out_of_stock";
			if (isOutOfStock) {
				stockStatus = "out_of_stock";
			} else if (isLowStock) {
				stockStatus = "low_stock";
			} else {
				stockStatus = "in_stock";
			}

			return {
				...part,
				is_low_stock: isLowStock,
				stock_status: stockStatus,
			};
		});
	}, []);

	// Search parts for repair (available parts only) with caching
	const searchAvailableParts = useCallback(
		async (searchTerm: string, limit = 10) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const { data, error } = await supabase
					.from("parts")
					.select("*")
					.gt("current_stock", 0)
					.or(
						`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,supplier_info.ilike.%${searchTerm}%`,
					)
					.order("name", { ascending: true })
					.limit(limit);

				if (error) throw error;

				setState((prev) => ({ ...prev, loading: false }));
				return data || [];
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[],
	);

	// Note: Search functionality is handled client-side in PartsSearch component
	// This keeps the architecture simple and leverages React's strengths for filtering

	// Update part stock manually (for receiving new inventory)
	const updatePartStock = useCallback(
		async (
			partId: string,
			newQuantity: number,
			cost: number,
			userId: string,
			notes?: string,
		) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				// Update part stock
				const { data: updatedPart, error: updateError } = await supabase
					.from("parts")
					.update({
						current_stock: newQuantity,
						cost_price: cost,
						updated_at: new Date().toISOString(),
					})
					.eq("id", partId)
					.select()
					.single();

				if (updateError) throw updateError;

				// Log stock update
				await logStockUpdate(partId, newQuantity, cost, userId, notes);

				setState((prev) => ({ ...prev, loading: false }));
				return updatedPart;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[],
	);

	// Reserve parts for repair planning
	const reservePartsForRepair = useCallback(
		async (
			partId: string,
			repairId: string,
			quantity: number,
			userId: string,
			durationHours = 24,
			notes?: string,
		) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const { data, error } = await supabase.rpc("reserve_parts_for_repair", {
					p_part_id: partId,
					p_repair_id: repairId,
					p_quantity: quantity,
					p_reserved_by: userId,
					p_duration_hours: durationHours,
				});

				if (error) throw error;

				// Insert additional notes if provided
				if (notes && data) {
					await supabase
						.from("parts_reservations")
						.update({ notes })
						.eq("id", data);
				}

				setState((prev) => ({ ...prev, loading: false }));
				return data; // Returns reservation ID
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[],
	);

	// Confirm parts reservation and update stock
	const confirmPartsReservation = useCallback(
		async (reservationId: string, userId: string) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const { data, error } = await supabase.rpc(
					"confirm_parts_reservation",
					{
						p_reservation_id: reservationId,
						p_confirmed_by: userId,
					},
				);

				if (error) throw error;

				setState((prev) => ({ ...prev, loading: false }));
				return data;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[],
	);

	// Cancel parts reservation
	const cancelPartsReservation = useCallback(
		async (reservationId: string, userId: string) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const { data, error } = await supabase.rpc("cancel_parts_reservation", {
					p_reservation_id: reservationId,
					p_cancelled_by: userId,
				});

				if (error) throw error;

				setState((prev) => ({ ...prev, loading: false }));
				return data;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[],
	);

	// Get available stock considering reservations
	const getAvailableStock = useCallback(async (partId: string) => {
		try {
			const { data, error } = await supabase.rpc("get_available_stock", {
				part_uuid: partId,
			});

			if (error) throw error;
			return data as number;
		} catch (error) {
			console.error("Error getting available stock:", error);
			throw error;
		}
	}, []);

	// Get active reservations for a repair
	const getRepairReservations = useCallback(async (repairId: string) => {
		const { data, error } = await supabase
			.from("parts_reservations")
			.select(`
				*,
				part:parts(name)
			`)
			.eq("repair_id", repairId)
			.eq("status", "active")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data;
	}, []);

	// Get all active reservations
	const getActiveReservations = useCallback(async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const { data, error } = await supabase
				.from("parts_reservations")
				.select(`
					*,
					part:parts(name),
					reserved_by_user:user_profiles(full_name)
				`)
				.eq("status", "active")
				.order("expires_at", { ascending: true });

			if (error) throw error;

			setState((prev) => ({
				...prev,
				loading: false,
				activeReservations: data || [],
			}));

			return data || [];
		} catch (error) {
			setState((prev) => ({
				...prev,
				loading: false,
				error: error as Error,
			}));
			throw error;
		}
	}, []);

	// Get inventory transactions for audit trail
	const getInventoryTransactions = useCallback(
		async (partId?: string, limit = 50) => {
			let query = supabase
				.from("inventory_transactions")
				.select(`
				*,
				part:parts(name),
				performer:user_profiles(full_name)
			`)
				.order("created_at", { ascending: false })
				.limit(limit);

			if (partId) {
				query = query.eq("part_id", partId);
			}

			const { data, error } = await query;

			if (error) throw error;
			return data;
		},
		[],
	);

	// Enhanced addPartsToRepair with reservation confirmation
	const addPartsToRepairWithReservation = useCallback(
		async (
			repairId: string,
			parts: PartUsage[],
			userId: string,
			reservationIds?: string[],
		) => {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			try {
				// If reservation IDs provided, confirm them first
				if (reservationIds && reservationIds.length > 0) {
					for (const reservationId of reservationIds) {
						await confirmPartsReservation(reservationId, userId);
					}
				} else {
					// Use the original addPartsToRepair method
					await addPartsToRepair(repairId, parts, userId);
				}

				setState((prev) => ({ ...prev, loading: false }));
				return true;
			} catch (error) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: error as Error,
				}));
				throw error;
			}
		},
		[addPartsToRepair, confirmPartsReservation],
	);

	// Load initial data
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				await Promise.all([
					getLowStockParts(),
					calculateInventoryValue(),
					getActiveReservations(),
				]);
			} catch (error) {
				console.error("Failed to load initial parts data:", error);
			}
		};

		loadInitialData();
	}, [getLowStockParts, calculateInventoryValue, getActiveReservations]);

	return {
		...state,
		addPartsToRepair,
		getRepairParts,
		calculateRepairPartsCost,
		getLowStockParts,
		calculateInventoryValue,
		getPartsWithStockStatus,
		searchAvailableParts,
		updatePartStock,
		// Reservation system functions
		reservePartsForRepair,
		confirmPartsReservation,
		cancelPartsReservation,
		getAvailableStock,
		getRepairReservations,
		getActiveReservations,
		getInventoryTransactions,
		addPartsToRepairWithReservation,
	};
}

// Helper function to log parts usage
async function logPartsUsage(
	repairId: string,
	parts: PartUsage[],
	userId: string,
) {
	const partsList = parts
		.map((p) => `${p.quantity_used}x part_${p.part_id}`)
		.join(", ");

	const { error } = await supabase.from("repair_status_logs").insert({
		repair_id: repairId,
		old_status: null,
		new_status: null,
		notes: `Sử dụng linh kiện: ${partsList}`,
		changed_by: userId,
		created_at: new Date().toISOString(),
	});

	if (error) {
		console.error("Failed to log parts usage:", error);
	}
}

// Helper function to log stock updates and trigger notifications
async function logStockUpdate(
	partId: string,
	newQuantity: number,
	cost: number,
	userId: string,
	notes?: string,
) {
	// Get part details for notifications
	const { data: part } = await supabase
		.from("parts")
		.select("*")
		.eq("id", partId)
		.single();

	if (part) {
		const minStock = part.min_stock_level || 5;

		// Check if we need to send low stock notifications
		if (newQuantity <= minStock && newQuantity > 0) {
			// Low stock notification
			console.log(
				`Low stock notification for ${part.name}: ${newQuantity} remaining`,
			);
		} else if (newQuantity === 0) {
			// Out of stock notification
			console.log(`Out of stock notification for ${part.name}`);
		}
	}

	// Log the stock update
	console.log(
		`Stock update logged: Part ${partId}, Quantity: ${newQuantity}, Cost: ${cost}, User: ${userId}, Notes: ${notes}`,
	);
}
