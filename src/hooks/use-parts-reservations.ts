/**
 * Parts Reservation System Hook
 * Focused parts reservation management for repair planning
 */

import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

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
	part?: {
		name: string;
		category?: string;
	};
	reserved_by_user?: {
		full_name: string;
	};
}

/**
 * Hook for parts reservation management
 */
export function usePartsReservations() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Reserve parts for repair planning
	 */
	const reservePartsForRepair = useCallback(
		async (
			partId: string,
			repairId: string,
			quantity: number,
			userId: string,
			durationHours = 24,
			notes?: string,
		): Promise<string | null> => {
			try {
				setLoading(true);
				setError(null);

				// Check if RPC function exists, otherwise create manual reservation
				const { data, error: rpcError } = await supabase.rpc(
					"reserve_parts_for_repair",
					{
						p_part_id: partId,
						p_repair_id: repairId,
						p_quantity: quantity,
						p_reserved_by: userId,
						p_duration_hours: durationHours,
					},
				);

				if (rpcError) {
					// Fallback: manual reservation if RPC not available
					const expiresAt = new Date();
					expiresAt.setHours(expiresAt.getHours() + durationHours);

					const { data: reservation, error: insertError } = await supabase
						.from("parts_reservations")
						.insert({
							part_id: partId,
							repair_id: repairId,
							quantity_reserved: quantity,
							reserved_by: userId,
							reserved_at: new Date().toISOString(),
							expires_at: expiresAt.toISOString(),
							status: "active",
							notes: notes || null,
						})
						.select("id")
						.single();

					if (insertError) {
						throw new Error(
							`Không thể tạo đặt chỗ linh kiện: ${insertError.message}`,
						);
					}

					return reservation.id;
				}

				// Insert additional notes if provided and RPC succeeded
				if (notes && data) {
					await supabase
						.from("parts_reservations")
						.update({ notes })
						.eq("id", data);
				}

				return data; // Returns reservation ID
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
	 * Confirm parts reservation and update stock
	 */
	const confirmPartsReservation = useCallback(
		async (reservationId: string, userId: string): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				// Check if RPC function exists
				const { data, error: rpcError } = await supabase.rpc(
					"confirm_parts_reservation",
					{
						p_reservation_id: reservationId,
						p_confirmed_by: userId,
					},
				);

				if (rpcError) {
					// Fallback: manual confirmation if RPC not available
					const { error: updateError } = await supabase
						.from("parts_reservations")
						.update({
							status: "confirmed",
							confirmed_at: new Date().toISOString(),
							confirmed_by: userId,
						})
						.eq("id", reservationId)
						.eq("status", "active");

					if (updateError) {
						throw new Error(
							`Không thể xác nhận đặt chỗ: ${updateError.message}`,
						);
					}

					return true;
				}

				return !!data;
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
	 * Cancel parts reservation
	 */
	const cancelPartsReservation = useCallback(
		async (reservationId: string, userId: string): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				// Check if RPC function exists
				const { data, error: rpcError } = await supabase.rpc(
					"cancel_parts_reservation",
					{
						p_reservation_id: reservationId,
						p_cancelled_by: userId,
					},
				);

				if (rpcError) {
					// Fallback: manual cancellation if RPC not available
					const { error: updateError } = await supabase
						.from("parts_reservations")
						.update({
							status: "cancelled",
							cancelled_at: new Date().toISOString(),
							cancelled_by: userId,
						})
						.eq("id", reservationId)
						.in("status", ["active"]);

					if (updateError) {
						throw new Error(`Không thể hủy đặt chỗ: ${updateError.message}`);
					}

					return true;
				}

				return !!data;
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
	 * Get active reservations for a repair
	 */
	const getRepairReservations = useCallback(
		async (repairId: string): Promise<PartReservation[]> => {
			try {
				const { data, error: queryError } = await supabase
					.from("parts_reservations")
					.select(`
						*,
						part:parts(name, category),
						reserved_by_user:user_profiles(full_name)
					`)
					.eq("repair_id", repairId)
					.eq("status", "active")
					.order("created_at", { ascending: false });

				if (queryError) {
					// Table might not exist
					if (queryError.code === "42P01") {
						console.warn("parts_reservations table not found");
						return [];
					}
					throw new Error(
						`Không thể tải danh sách đặt chỗ: ${queryError.message}`,
					);
				}

				return data || [];
			} catch (err) {
				console.error("Error fetching repair reservations:", err);
				return [];
			}
		},
		[],
	);

	/**
	 * Get all active reservations
	 */
	const getActiveReservations = useCallback(async (): Promise<
		PartReservation[]
	> => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: queryError } = await supabase
				.from("parts_reservations")
				.select(`
					*,
					part:parts(name, category),
					reserved_by_user:user_profiles(full_name)
				`)
				.eq("status", "active")
				.order("expires_at", { ascending: true });

			if (queryError) {
				// Table might not exist
				if (queryError.code === "42P01") {
					console.warn("parts_reservations table not found");
					return [];
				}
				throw new Error(
					`Không thể tải danh sách đặt chỗ: ${queryError.message}`,
				);
			}

			return data || [];
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Lỗi không xác định");
			setError(error);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Get reservations that are about to expire
	 */
	const getExpiringReservations = useCallback(
		async (hoursUntilExpiry = 2): Promise<PartReservation[]> => {
			try {
				const expiryThreshold = new Date();
				expiryThreshold.setHours(expiryThreshold.getHours() + hoursUntilExpiry);

				const { data, error: queryError } = await supabase
					.from("parts_reservations")
					.select(`
						*,
						part:parts(name, category),
						reserved_by_user:user_profiles(full_name)
					`)
					.eq("status", "active")
					.lte("expires_at", expiryThreshold.toISOString())
					.order("expires_at", { ascending: true });

				if (queryError) {
					// Table might not exist
					if (queryError.code === "42P01") {
						console.warn("parts_reservations table not found");
						return [];
					}
					throw new Error(
						`Không thể tải danh sách đặt chỗ sắp hết hạn: ${queryError.message}`,
					);
				}

				return data || [];
			} catch (err) {
				console.error("Error fetching expiring reservations:", err);
				return [];
			}
		},
		[],
	);

	/**
	 * Extend reservation expiry time
	 */
	const extendReservation = useCallback(
		async (
			reservationId: string,
			additionalHours: number,
			userId: string,
		): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				// Get current reservation
				const { data: reservation, error: fetchError } = await supabase
					.from("parts_reservations")
					.select("expires_at")
					.eq("id", reservationId)
					.eq("status", "active")
					.single();

				if (fetchError) {
					throw new Error(
						`Không thể tải thông tin đặt chỗ: ${fetchError.message}`,
					);
				}

				// Calculate new expiry time
				const newExpiryTime = new Date(reservation.expires_at);
				newExpiryTime.setHours(newExpiryTime.getHours() + additionalHours);

				// Update expiry time
				const { error: updateError } = await supabase
					.from("parts_reservations")
					.update({
						expires_at: newExpiryTime.toISOString(),
						updated_at: new Date().toISOString(),
					})
					.eq("id", reservationId);

				if (updateError) {
					throw new Error(`Không thể gia hạn đặt chỗ: ${updateError.message}`);
				}

				// Log the extension
				console.log(
					`Reservation ${reservationId} extended by ${additionalHours} hours by user ${userId}`,
				);

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
	 * Clean up expired reservations
	 */
	const cleanupExpiredReservations = useCallback(async (): Promise<number> => {
		try {
			const { data, error: queryError } = await supabase
				.from("parts_reservations")
				.update({ status: "expired" })
				.eq("status", "active")
				.lt("expires_at", new Date().toISOString())
				.select("id");

			if (queryError) {
				console.error("Error cleaning up expired reservations:", queryError);
				return 0;
			}

			const cleanedCount = data?.length || 0;
			if (cleanedCount > 0) {
				console.log(`Cleaned up ${cleanedCount} expired reservations`);
			}

			return cleanedCount;
		} catch (err) {
			console.error("Error in cleanup expired reservations:", err);
			return 0;
		}
	}, []);

	return {
		loading,
		error,
		reservePartsForRepair,
		confirmPartsReservation,
		cancelPartsReservation,
		getRepairReservations,
		getActiveReservations,
		getExpiringReservations,
		extendReservation,
		cleanupExpiredReservations,
	};
}
