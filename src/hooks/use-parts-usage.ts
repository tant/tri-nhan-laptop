/**
 * Parts Usage in Repairs Hook
 * Focused parts usage tracking and repair cost calculations
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useCallback, useState } from "react";

// Database types
type Part = Database["public"]["Tables"]["parts"]["Row"];

export interface PartUsage {
	part_id: string;
	quantity_used: number;
	cost_per_unit: number;
	notes?: string;
}

export interface RepairPart {
	id: string;
	repair_id: string;
	part_id: string;
	quantity_used: number;
	cost_per_unit: number;
	total_cost: number;
	notes?: string;
	used_by: string;
	used_at: string;
	part?: Part;
}

/**
 * Hook for parts usage in repairs
 */
export function usePartsUsage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Add parts to a repair
	 */
	const addPartsToRepair = useCallback(
		async (
			repairId: string,
			parts: PartUsage[],
			userId: string,
		): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

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

					if (fetchError) {
						throw new Error(
							`Không thể tải thông tin linh kiện: ${fetchError.message}`,
						);
					}

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

					if (updateError) {
						throw new Error(
							`Không thể cập nhật tồn kho: ${updateError.message}`,
						);
					}
				}

				// Insert usage records
				const { error: usageError } = await supabase
					.from("repair_parts")
					.insert(usageRecords);

				if (usageError) {
					throw new Error(
						`Không thể ghi nhận sử dụng linh kiện: ${usageError.message}`,
					);
				}

				// Log activity
				await logPartsUsage(repairId, parts, userId);

				return true;
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Get parts used in a repair
	 */
	const getRepairParts = useCallback(
		async (repairId: string): Promise<RepairPart[]> => {
			try {
				setLoading(true);
				setError(null);

				const { data, error: queryError } = await supabase
					.from("repair_parts")
					.select(`
					*,
					part:parts(*)
				`)
					.eq("repair_id", repairId)
					.order("used_at", { ascending: false });

				if (queryError) {
					throw new Error(
						`Không thể tải danh sách linh kiện đã sử dụng: ${queryError.message}`,
					);
				}

				return data || [];
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Calculate total parts cost for a repair
	 */
	const calculateRepairPartsCost = useCallback(
		async (repairId: string): Promise<number> => {
			try {
				const { data, error: queryError } = await supabase
					.from("repair_parts")
					.select("total_cost")
					.eq("repair_id", repairId);

				if (queryError) {
					throw new Error(
						`Không thể tính tổng chi phí linh kiện: ${queryError.message}`,
					);
				}

				const totalCost = (data || []).reduce(
					(sum, item) => sum + (item.total_cost || 0),
					0,
				);

				return totalCost;
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Lỗi không xác định");
				throw error;
			}
		},
		[],
	);

	/**
	 * Remove/return parts from a repair (for corrections)
	 */
	const removePartsFromRepair = useCallback(
		async (repairPartId: string, userId: string): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				// Get the repair part record
				const { data: repairPart, error: fetchError } = await supabase
					.from("repair_parts")
					.select("*")
					.eq("id", repairPartId)
					.single();

				if (fetchError) {
					throw new Error(
						`Không thể tải thông tin linh kiện: ${fetchError.message}`,
					);
				}

				// Get current part stock
				const { data: currentPart, error: partFetchError } = await supabase
					.from("parts")
					.select("current_stock")
					.eq("id", repairPart.part_id)
					.single();

				if (partFetchError) {
					throw new Error(
						`Không thể tải thông tin tồn kho: ${partFetchError.message}`,
					);
				}

				// Return parts to stock
				const newStockQuantity =
					currentPart.current_stock + repairPart.quantity_used;

				const { error: updateError } = await supabase
					.from("parts")
					.update({
						current_stock: newStockQuantity,
						updated_at: new Date().toISOString(),
					})
					.eq("id", repairPart.part_id);

				if (updateError) {
					throw new Error(`Không thể cập nhật tồn kho: ${updateError.message}`);
				}

				// Remove the repair part record
				const { error: deleteError } = await supabase
					.from("repair_parts")
					.delete()
					.eq("id", repairPartId);

				if (deleteError) {
					throw new Error(
						`Không thể xóa bản ghi sử dụng linh kiện: ${deleteError.message}`,
					);
				}

				// Log the return
				await logPartsReturn(repairPart.repair_id, repairPart, userId);

				return true;
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Update parts usage in a repair
	 */
	const updateRepairPartUsage = useCallback(
		async (
			repairPartId: string,
			newQuantity: number,
			newCostPerUnit: number,
			userId: string,
			notes?: string,
		): Promise<RepairPart> => {
			try {
				setLoading(true);
				setError(null);

				// Get the current repair part record
				const { data: currentRepairPart, error: fetchError } = await supabase
					.from("repair_parts")
					.select("*")
					.eq("id", repairPartId)
					.single();

				if (fetchError) {
					throw new Error(
						`Không thể tải thông tin linh kiện: ${fetchError.message}`,
					);
				}

				// Calculate quantity difference
				const quantityDifference =
					newQuantity - currentRepairPart.quantity_used;

				if (quantityDifference !== 0) {
					// Get current part stock
					const { data: currentPart, error: partFetchError } = await supabase
						.from("parts")
						.select("current_stock")
						.eq("id", currentRepairPart.part_id)
						.single();

					if (partFetchError) {
						throw new Error(
							`Không thể tải thông tin tồn kho: ${partFetchError.message}`,
						);
					}

					// Check if sufficient stock for increase
					if (
						quantityDifference > 0 &&
						currentPart.current_stock < quantityDifference
					) {
						throw new Error(
							`Không đủ tồn kho để tăng số lượng. Tồn kho hiện tại: ${currentPart.current_stock}`,
						);
					}

					// Update part stock
					const newStockQuantity =
						currentPart.current_stock - quantityDifference;

					const { error: updateStockError } = await supabase
						.from("parts")
						.update({
							current_stock: newStockQuantity,
							updated_at: new Date().toISOString(),
						})
						.eq("id", currentRepairPart.part_id);

					if (updateStockError) {
						throw new Error(
							`Không thể cập nhật tồn kho: ${updateStockError.message}`,
						);
					}
				}

				// Update repair part record
				const { data: updatedRepairPart, error: updateError } = await supabase
					.from("repair_parts")
					.update({
						quantity_used: newQuantity,
						cost_per_unit: newCostPerUnit,
						total_cost: newQuantity * newCostPerUnit,
						notes: notes || currentRepairPart.notes,
						updated_at: new Date().toISOString(),
					})
					.eq("id", repairPartId)
					.select("*")
					.single();

				if (updateError) {
					throw new Error(
						`Không thể cập nhật thông tin sử dụng linh kiện: ${updateError.message}`,
					);
				}

				// Log the update
				await logPartsUsageUpdate(currentRepairPart, updatedRepairPart, userId);

				return updatedRepairPart;
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Get parts usage summary for a repair
	 */
	const getRepairPartsSummary = useCallback(async (repairId: string) => {
		try {
			const { data, error: queryError } = await supabase
				.from("repair_parts")
				.select(`
						quantity_used,
						total_cost,
						part:parts(name, category)
					`)
				.eq("repair_id", repairId);

			if (queryError) {
				throw new Error(
					`Không thể tải tóm tắt linh kiện: ${queryError.message}`,
				);
			}

			const summary = {
				totalParts: data?.length || 0,
				totalCost: (data || []).reduce(
					(sum, item) => sum + (item.total_cost || 0),
					0,
				),
				categories: {} as Record<string, { count: number; cost: number }>,
			};

			// Group by category
			(data || []).forEach((item) => {
				const category = item.part?.category || "Khác";
				if (!summary.categories[category]) {
					summary.categories[category] = { count: 0, cost: 0 };
				}
				summary.categories[category].count += item.quantity_used;
				summary.categories[category].cost += item.total_cost || 0;
			});

			return summary;
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Lỗi không xác định");
			throw error;
		}
	}, []);

	return {
		loading,
		error,
		addPartsToRepair,
		getRepairParts,
		calculateRepairPartsCost,
		removePartsFromRepair,
		updateRepairPartUsage,
		getRepairPartsSummary,
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

	try {
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
	} catch (err) {
		console.warn("repair_status_logs table not available:", err);
	}
}

// Helper function to log parts return
async function logPartsReturn(
	repairId: string,
	repairPart: any,
	userId: string,
) {
	try {
		const { error } = await supabase.from("repair_status_logs").insert({
			repair_id: repairId,
			old_status: null,
			new_status: null,
			notes: `Trả lại linh kiện: ${repairPart.quantity_used}x part_${repairPart.part_id}`,
			changed_by: userId,
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.error("Failed to log parts return:", error);
		}
	} catch (err) {
		console.warn("repair_status_logs table not available:", err);
	}
}

// Helper function to log parts usage updates
async function logPartsUsageUpdate(
	oldRepairPart: any,
	newRepairPart: any,
	userId: string,
) {
	try {
		const { error } = await supabase.from("repair_status_logs").insert({
			repair_id: oldRepairPart.repair_id,
			old_status: null,
			new_status: null,
			notes: `Cập nhật sử dụng linh kiện: từ ${oldRepairPart.quantity_used}x thành ${newRepairPart.quantity_used}x part_${oldRepairPart.part_id}`,
			changed_by: userId,
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.error("Failed to log parts usage update:", error);
		}
	} catch (err) {
		console.warn("repair_status_logs table not available:", err);
	}
}
