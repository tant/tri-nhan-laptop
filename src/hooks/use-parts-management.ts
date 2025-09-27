import { useCallback, useEffect, useState } from "react";
import { usePartsInventory } from "./use-parts-inventory";
import type { PartWithStock } from "./use-parts-inventory";
import { usePartsReservations } from "./use-parts-reservations";
import type { PartReservation } from "./use-parts-reservations";
import { usePartsUsage } from "./use-parts-usage";
import type { PartUsage } from "./use-parts-usage";

// Re-export types for backward compatibility
export type { PartUsage } from "./use-parts-usage";
export type {
	PartWithStock,
	InventoryTransaction,
} from "./use-parts-inventory";
export type { PartReservation } from "./use-parts-reservations";

export interface PartsManagementState {
	loading: boolean;
	error: Error | null;
	lowStockParts: any[];
	totalInventoryValue: number;
	activeReservations: PartReservation[];
}

/**
 * Main parts management hook - provides comprehensive parts functionality through composed focused hooks
 * This maintains backward compatibility while using the new architecture
 */
export function usePartsManagement() {
	const [state, setState] = useState<PartsManagementState>({
		loading: false,
		error: null,
		lowStockParts: [],
		totalInventoryValue: 0,
		activeReservations: [],
	});

	// Compose focused hooks
	const inventory = usePartsInventory();
	const usage = usePartsUsage();
	const reservations = usePartsReservations();

	// Merge loading and error states
	const combinedLoading =
		state.loading || inventory.loading || usage.loading || reservations.loading;
	const combinedError =
		state.error || inventory.error || usage.error || reservations.error;

	// Legacy compatibility wrappers for composed hooks
	const addPartsToRepair = useCallback(
		async (repairId: string, parts: PartUsage[], userId: string) => {
			return usage.addPartsToRepair(repairId, parts, userId);
		},
		[usage],
	);

	const getRepairParts = useCallback(
		async (repairId: string) => {
			return usage.getRepairParts(repairId);
		},
		[usage],
	);

	const calculateRepairPartsCost = useCallback(
		async (repairId: string) => {
			return usage.calculateRepairPartsCost(repairId);
		},
		[usage],
	);

	const getLowStockParts = useCallback(async () => {
		const result = await inventory.getLowStockParts();
		setState((prev) => ({ ...prev, lowStockParts: result }));
		return result;
	}, [inventory]);

	const calculateInventoryValue = useCallback(async () => {
		const result = await inventory.calculateInventoryValue();
		setState((prev) => ({ ...prev, totalInventoryValue: result }));
		return result;
	}, [inventory]);

	const getPartsWithStockStatus = useCallback(async (): Promise<
		PartWithStock[]
	> => {
		return inventory.getPartsWithStockStatus();
	}, [inventory]);

	const searchAvailableParts = useCallback(
		async (searchTerm: string, limit = 10) => {
			return inventory.searchParts(searchTerm, false, limit);
		},
		[inventory],
	);

	const updatePartStock = useCallback(
		async (
			partId: string,
			newQuantity: number,
			cost: number,
			userId: string,
			notes?: string,
		) => {
			return inventory.updatePartStock(
				partId,
				newQuantity,
				cost,
				userId,
				notes,
			);
		},
		[inventory],
	);

	// Reservation system functions (composed from reservations hook)
	const reservePartsForRepair = useCallback(
		async (
			partId: string,
			repairId: string,
			quantity: number,
			userId: string,
			durationHours = 24,
			notes?: string,
		) => {
			return reservations.reservePartsForRepair(
				partId,
				repairId,
				quantity,
				userId,
				durationHours,
				notes,
			);
		},
		[reservations],
	);

	const confirmPartsReservation = useCallback(
		async (reservationId: string, userId: string) => {
			return reservations.confirmPartsReservation(reservationId, userId);
		},
		[reservations],
	);

	const cancelPartsReservation = useCallback(
		async (reservationId: string, userId: string) => {
			return reservations.cancelPartsReservation(reservationId, userId);
		},
		[reservations],
	);

	const getAvailableStock = useCallback(
		async (partId: string) => {
			return inventory.getAvailableStock(partId);
		},
		[inventory],
	);

	const getRepairReservations = useCallback(
		async (repairId: string) => {
			return reservations.getRepairReservations(repairId);
		},
		[reservations],
	);

	const getActiveReservations = useCallback(async () => {
		const result = await reservations.getActiveReservations();
		setState((prev) => ({ ...prev, activeReservations: result }));
		return result;
	}, [reservations]);

	const getInventoryTransactions = useCallback(
		async (partId?: string, limit = 50) => {
			return inventory.getInventoryTransactions(partId, limit);
		},
		[inventory],
	);

	const addPartsToRepairWithReservation = useCallback(
		async (
			repairId: string,
			parts: PartUsage[],
			userId: string,
			reservationIds?: string[],
		) => {
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
				return true;
			} catch (error) {
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
		// State (merged from composed hooks)
		...state,
		loading: combinedLoading,
		error: combinedError,

		// Parts Usage (from usage hook)
		addPartsToRepair,
		getRepairParts,
		calculateRepairPartsCost,
		removePartsFromRepair: usage.removePartsFromRepair,
		updateRepairPartUsage: usage.updateRepairPartUsage,
		getRepairPartsSummary: usage.getRepairPartsSummary,

		// Inventory Management (from inventory hook)
		getLowStockParts,
		calculateInventoryValue,
		getPartsWithStockStatus,
		searchAvailableParts,
		updatePartStock,
		adjustPartStock: inventory.adjustPartStock,
		getAvailableStock,
		getInventoryTransactions,
		getInventoryStats: inventory.getInventoryStats,

		// Reservation System (from reservations hook)
		reservePartsForRepair,
		confirmPartsReservation,
		cancelPartsReservation,
		getRepairReservations,
		getActiveReservations,
		getExpiringReservations: reservations.getExpiringReservations,
		extendReservation: reservations.extendReservation,
		cleanupExpiredReservations: reservations.cleanupExpiredReservations,

		// Enhanced operations
		addPartsToRepairWithReservation,
	};
}
