/**
 * Parts Inventory Management Hook
 * Focused inventory tracking, stock management, and value calculations
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useCallback, useState } from "react";

// Database types
type Part = Database["public"]["Tables"]["parts"]["Row"];

export interface PartWithStock extends Part {
	is_low_stock: boolean;
	stock_status: "in_stock" | "low_stock" | "out_of_stock";
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

export interface InventoryStats {
	totalParts: number;
	totalValue: number;
	lowStockCount: number;
	outOfStockCount: number;
	averageValue: number;
}

/**
 * Hook for parts inventory management
 */
export function usePartsInventory() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Get all parts with enhanced stock status
	 */
	const getPartsWithStockStatus = useCallback(async (): Promise<
		PartWithStock[]
	> => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: queryError } = await supabase
				.from("parts")
				.select("*")
				.order("name", { ascending: true });

			if (queryError) {
				throw new Error(
					`Không thể tải danh sách linh kiện: ${queryError.message}`,
				);
			}

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
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Lỗi không xác định");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Get low stock parts
	 */
	const getLowStockParts = useCallback(async (): Promise<Part[]> => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: queryError } = await supabase
				.from("parts")
				.select("*")
				.order("current_stock", { ascending: true });

			if (queryError) {
				throw new Error(
					`Không thể tải danh sách linh kiện sắp hết: ${queryError.message}`,
				);
			}

			// Filter for low stock parts on client side
			const lowStockParts = (data || []).filter(
				(part) =>
					part.current_stock <= part.min_stock_level ||
					part.current_stock === 0,
			);

			return lowStockParts;
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Lỗi không xác định");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Calculate total inventory value
	 */
	const calculateInventoryValue = useCallback(async (): Promise<number> => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: queryError } = await supabase
				.from("parts")
				.select("current_stock, selling_price");

			if (queryError) {
				throw new Error(
					`Không thể tính giá trị tồn kho: ${queryError.message}`,
				);
			}

			const totalValue = (data || []).reduce((sum, part) => {
				return sum + part.current_stock * (part.selling_price || 0);
			}, 0);

			return totalValue;
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Lỗi không xác định");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Get comprehensive inventory statistics
	 */
	const getInventoryStats = useCallback(async (): Promise<InventoryStats> => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: queryError } = await supabase
				.from("parts")
				.select("current_stock, min_stock_level, selling_price");

			if (queryError) {
				throw new Error(
					`Không thể tải thống kê tồn kho: ${queryError.message}`,
				);
			}

			const parts = data || [];
			const totalParts = parts.length;
			const totalValue = parts.reduce((sum, part) => {
				return sum + part.current_stock * (part.selling_price || 0);
			}, 0);

			const lowStockCount = parts.filter(
				(part) =>
					part.current_stock <= part.min_stock_level && part.current_stock > 0,
			).length;

			const outOfStockCount = parts.filter(
				(part) => part.current_stock === 0,
			).length;

			const averageValue = totalParts > 0 ? totalValue / totalParts : 0;

			return {
				totalParts,
				totalValue,
				lowStockCount,
				outOfStockCount,
				averageValue,
			};
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Lỗi không xác định");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Update part stock manually (for receiving new inventory)
	 */
	const updatePartStock = useCallback(
		async (
			partId: string,
			newQuantity: number,
			cost: number,
			userId: string,
			notes?: string,
		): Promise<Part> => {
			try {
				setLoading(true);
				setError(null);

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

				if (updateError) {
					throw new Error(`Không thể cập nhật tồn kho: ${updateError.message}`);
				}

				// Log stock update
				await logStockUpdate(partId, newQuantity, cost, userId, notes);

				return updatedPart;
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
	 * Adjust part stock (for inventory corrections)
	 */
	const adjustPartStock = useCallback(
		async (
			partId: string,
			quantityChange: number,
			reason: string,
			userId: string,
		): Promise<Part> => {
			try {
				setLoading(true);
				setError(null);

				// Get current part stock
				const { data: currentPart, error: fetchError } = await supabase
					.from("parts")
					.select("current_stock")
					.eq("id", partId)
					.single();

				if (fetchError) {
					throw new Error(
						`Không thể tải thông tin linh kiện: ${fetchError.message}`,
					);
				}

				const newQuantity = Math.max(
					0,
					currentPart.current_stock + quantityChange,
				);

				// Update part stock
				const { data: updatedPart, error: updateError } = await supabase
					.from("parts")
					.update({
						current_stock: newQuantity,
						updated_at: new Date().toISOString(),
					})
					.eq("id", partId)
					.select()
					.single();

				if (updateError) {
					throw new Error(
						`Không thể điều chỉnh tồn kho: ${updateError.message}`,
					);
				}

				// Log adjustment
				await logInventoryAdjustment(
					partId,
					quantityChange,
					currentPart.current_stock,
					newQuantity,
					reason,
					userId,
				);

				return updatedPart;
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
	 * Get available stock considering reservations
	 */
	const getAvailableStock = useCallback(
		async (partId: string): Promise<number> => {
			try {
				const { data, error: rpcError } = await supabase.rpc(
					"get_available_stock",
					{
						part_uuid: partId,
					},
				);

				if (rpcError) {
					// Fallback: just return current stock if RPC not available
					const { data: part, error: fallbackError } = await supabase
						.from("parts")
						.select("current_stock")
						.eq("id", partId)
						.single();

					if (fallbackError) {
						throw new Error(
							`Không thể tải tồn kho khả dụng: ${fallbackError.message}`,
						);
					}

					return part.current_stock;
				}

				return data as number;
			} catch (err) {
				console.error("Error getting available stock:", err);
				throw err;
			}
		},
		[],
	);

	/**
	 * Get inventory transactions for audit trail
	 */
	const getInventoryTransactions = useCallback(
		async (partId?: string, limit = 50): Promise<InventoryTransaction[]> => {
			try {
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

				const { data, error: queryError } = await query;

				if (queryError) {
					// Table might not exist, return empty array
					if (queryError.code === "42P01") {
						console.warn("inventory_transactions table not found");
						return [];
					}
					throw new Error(
						`Không thể tải lịch sử giao dịch: ${queryError.message}`,
					);
				}

				return data || [];
			} catch (err) {
				console.error("Error fetching inventory transactions:", err);
				return [];
			}
		},
		[],
	);

	/**
	 * Search parts by various criteria
	 */
	const searchParts = useCallback(
		async (
			searchTerm: string,
			includeOutOfStock = false,
			limit = 50,
		): Promise<PartWithStock[]> => {
			try {
				setLoading(true);
				setError(null);

				let query = supabase
					.from("parts")
					.select("*")
					.or(
						`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,supplier_info.ilike.%${searchTerm}%`,
					)
					.order("name", { ascending: true })
					.limit(limit);

				if (!includeOutOfStock) {
					query = query.gt("current_stock", 0);
				}

				const { data, error: queryError } = await query;

				if (queryError) {
					throw new Error(
						`Không thể tìm kiếm linh kiện: ${queryError.message}`,
					);
				}

				// Enhance with stock status
				const partsWithStock = (data || []).map((part) => {
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

				return partsWithStock;
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

	return {
		loading,
		error,
		getPartsWithStockStatus,
		getLowStockParts,
		calculateInventoryValue,
		getInventoryStats,
		updatePartStock,
		adjustPartStock,
		getAvailableStock,
		getInventoryTransactions,
		searchParts,
	};
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

// Helper function to log inventory adjustments
async function logInventoryAdjustment(
	partId: string,
	quantityChange: number,
	quantityBefore: number,
	quantityAfter: number,
	reason: string,
	userId: string,
) {
	try {
		// Try to insert into inventory_transactions table if it exists
		const { error } = await supabase.from("inventory_transactions").insert({
			part_id: partId,
			transaction_type: "adjustment",
			quantity_change: quantityChange,
			quantity_before: quantityBefore,
			quantity_after: quantityAfter,
			notes: reason,
			performed_by: userId,
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.warn("Failed to log inventory adjustment:", error);
		}
	} catch (err) {
		console.warn("Inventory transactions table not available:", err);
	}

	// Console log as fallback
	console.log(
		`Inventory adjustment: Part ${partId}, Change: ${quantityChange}, Before: ${quantityBefore}, After: ${quantityAfter}, Reason: ${reason}, User: ${userId}`,
	);
}
