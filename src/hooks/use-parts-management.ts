import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

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

export interface PartsManagementState {
	loading: boolean;
	error: Error | null;
	lowStockParts: Part[];
	totalInventoryValue: number;
}

export function usePartsManagement() {
	const [state, setState] = useState<PartsManagementState>({
		loading: false,
		error: null,
		lowStockParts: [],
		totalInventoryValue: 0
	});

	// Add parts to a repair
	const addPartsToRepair = useCallback(async (
		repairId: string,
		parts: PartUsage[],
		userId: string
	) => {
		setState(prev => ({ ...prev, loading: true, error: null }));

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
				if (currentPart.stock_quantity < partUsage.quantity_used) {
					throw new Error(`Không đủ linh kiện ${currentPart.name}. Tồn kho: ${currentPart.stock_quantity}, cần: ${partUsage.quantity_used}`);
				}

				// Calculate new stock quantity
				const newStockQuantity = currentPart.stock_quantity - partUsage.quantity_used;

				// Prepare stock update
				partUpdates.push({
					id: partUsage.part_id,
					stock_quantity: newStockQuantity,
					updated_at: new Date().toISOString()
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
					used_at: new Date().toISOString()
				});
			}

			// Execute stock updates
			for (const update of partUpdates) {
				const { error: updateError } = await supabase
					.from("parts")
					.update({
						stock_quantity: update.stock_quantity,
						updated_at: update.updated_at
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

			setState(prev => ({ ...prev, loading: false }));
			return true;

		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				error: error as Error
			}));
			throw error;
		}
	}, []);

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

		const totalCost = data.reduce((sum, item) => sum + (item.total_cost || 0), 0);
		return totalCost;
	}, []);

	// Get low stock parts
	const getLowStockParts = useCallback(async () => {
		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const { data, error } = await supabase
				.from("parts")
				.select("*")
				.or("stock_quantity.lte.min_stock_level,stock_quantity.eq.0")
				.order("stock_quantity", { ascending: true });

			if (error) throw error;

			setState(prev => ({
				...prev,
				loading: false,
				lowStockParts: data || []
			}));

			return data || [];
		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				error: error as Error
			}));
			throw error;
		}
	}, []);

	// Calculate total inventory value
	const calculateInventoryValue = useCallback(async () => {
		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			const { data, error } = await supabase
				.from("parts")
				.select("stock_quantity, selling_price");

			if (error) throw error;

			const totalValue = (data || []).reduce((sum, part) => {
				return sum + (part.stock_quantity * (part.selling_price || 0));
			}, 0);

			setState(prev => ({
				...prev,
				loading: false,
				totalInventoryValue: totalValue
			}));

			return totalValue;
		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				error: error as Error
			}));
			throw error;
		}
	}, []);

	// Get parts with enhanced stock status
	const getPartsWithStockStatus = useCallback(async (): Promise<PartWithStock[]> => {
		const { data, error } = await supabase
			.from("parts")
			.select("*")
			.order("name", { ascending: true });

		if (error) throw error;

		return (data || []).map(part => {
			const isLowStock = part.stock_quantity <= part.min_stock_level;
			const isOutOfStock = part.stock_quantity === 0;

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
				stock_status: stockStatus
			};
		});
	}, []);

	// Search parts for repair (available parts only)
	const searchAvailableParts = useCallback(async (searchTerm: string, limit: number = 10) => {
		const { data, error } = await supabase
			.from("parts")
			.select("*")
			.gt("stock_quantity", 0)
			.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
			.order("name", { ascending: true })
			.limit(limit);

		if (error) throw error;
		return data || [];
	}, []);

	// Update part stock manually (for receiving new inventory)
	const updatePartStock = useCallback(async (
		partId: string,
		newQuantity: number,
		cost: number,
		userId: string,
		notes?: string
	) => {
		setState(prev => ({ ...prev, loading: true, error: null }));

		try {
			// Update part stock
			const { data: updatedPart, error: updateError } = await supabase
				.from("parts")
				.update({
					stock_quantity: newQuantity,
					cost_price: cost,
					updated_at: new Date().toISOString()
				})
				.eq("id", partId)
				.select()
				.single();

			if (updateError) throw updateError;

			// Log stock update
			await logStockUpdate(partId, newQuantity, cost, userId, notes);

			setState(prev => ({ ...prev, loading: false }));
			return updatedPart;

		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				error: error as Error
			}));
			throw error;
		}
	}, []);

	// Load initial data
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				await Promise.all([
					getLowStockParts(),
					calculateInventoryValue()
				]);
			} catch (error) {
				console.error("Failed to load initial parts data:", error);
			}
		};

		loadInitialData();
	}, [getLowStockParts, calculateInventoryValue]);

	return {
		...state,
		addPartsToRepair,
		getRepairParts,
		calculateRepairPartsCost,
		getLowStockParts,
		calculateInventoryValue,
		getPartsWithStockStatus,
		searchAvailableParts,
		updatePartStock
	};
}

// Helper function to log parts usage
async function logPartsUsage(
	repairId: string,
	parts: PartUsage[],
	userId: string
) {
	const partsList = parts.map(p => `${p.quantity_used}x part_${p.part_id}`).join(", ");

	const { error } = await supabase
		.from("repair_status_logs")
		.insert({
			repair_id: repairId,
			old_status: null,
			new_status: null,
			notes: `Sử dụng linh kiện: ${partsList}`,
			changed_by: userId,
			created_at: new Date().toISOString()
		});

	if (error) {
		console.error("Failed to log parts usage:", error);
	}
}

// Helper function to log stock updates
async function logStockUpdate(
	partId: string,
	newQuantity: number,
	cost: number,
	userId: string,
	notes?: string
) {
	// In a real app, you might want a separate parts_logs table
	console.log(`Stock update logged: Part ${partId}, Quantity: ${newQuantity}, Cost: ${cost}, User: ${userId}, Notes: ${notes}`);
}