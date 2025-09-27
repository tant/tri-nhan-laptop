import { SupabaseErrorAlert } from "@/components/error-boundary";
import {
	InventoryActions,
	InventoryPageHeader,
} from "@/components/parts/InventoryActions";
import {
	InventoryModals,
	useInventoryModals,
} from "@/components/parts/InventoryModals";
import {
	InventoryStatisticsCards,
	LowStockAlert,
} from "@/components/parts/InventoryStatistics";
import { InventoryView } from "@/components/parts/InventoryView";
import { PartsInventorySkeleton } from "@/components/skeleton-loaders";
import { usePartsManagement } from "@/hooks/use-parts-management";
import type { Part } from "@/lib/database-types";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export function PartsPage() {
	const [parts, setParts] = useState<Part[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Modal management
	const {
		modalState,
		openStockAdjustment,
		closeStockAdjustment,
		openPartsForm,
		closePartsForm,
		openBulkImport,
		closeBulkImport,
		openExport,
		closeExport,
	} = useInventoryModals();

	const {
		totalInventoryValue,
		getPartsWithStockStatus,
		getLowStockParts,
		calculateInventoryValue,
	} = usePartsManagement();

	// Fetch parts from database with enhanced stock status
	const fetchParts = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const partsWithStock = await getPartsWithStockStatus();
			setParts(partsWithStock);

			// Also refresh low stock data and inventory value
			await Promise.all([getLowStockParts(), calculateInventoryValue()]);
		} catch (err) {
			console.error("Error fetching parts:", err);
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [getPartsWithStockStatus, getLowStockParts, calculateInventoryValue]);

	// Load parts on component mount
	useEffect(() => {
		fetchParts();
	}, [fetchParts]);

	// Optimized real-time subscription to parts changes
	useEffect(() => {
		const channel = supabase
			.channel("parts-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "parts",
				},
				(payload) => {
					console.log("Part change detected:", payload);

					// Handle individual record changes instead of full refetch
					if (payload.eventType === "INSERT" && payload.new) {
						// Add new part to list
						const newPart = payload.new as Part;
						setParts((prev) => [newPart, ...prev]);
					} else if (payload.eventType === "UPDATE" && payload.new) {
						// Update existing part
						const updatedPart = payload.new as Part;
						setParts((prev) =>
							prev.map((part) =>
								part.id === updatedPart.id ? updatedPart : part,
							),
						);
					} else if (payload.eventType === "DELETE" && payload.old) {
						// Remove deleted part
						const deletedId = payload.old.id;
						setParts((prev) => prev.filter((part) => part.id !== deletedId));
					} else {
						// Fallback to full refetch for complex changes
						fetchParts();
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [fetchParts]);

	// Modal success handlers
	const handleStockAdjustmentSuccess = () => {
		fetchParts();
	};

	const handlePartsFormSuccess = () => {
		fetchParts();
	};

	// Loading state
	if (loading) {
		return <PartsInventorySkeleton />;
	}

	return (
		<div className="p-6 space-y-6">
			<InventoryPageHeader
				actions={
					<InventoryActions
						onRefresh={fetchParts}
						onAddPart={() => openPartsForm()}
						onBulkImport={openBulkImport}
						onExport={openExport}
						loading={loading}
					/>
				}
			/>

			{error && (
				<SupabaseErrorAlert
					error={error}
					onRetry={fetchParts}
					onDismiss={() => setError(null)}
				/>
			)}

			<InventoryStatisticsCards
				parts={parts}
				totalInventoryValue={totalInventoryValue}
			/>

			<LowStockAlert parts={parts} />

			<InventoryView
				parts={parts}
				loading={loading}
				onStockAdjustment={openStockAdjustment}
				onEditPart={openPartsForm}
			/>

			<InventoryModals
				modalState={modalState}
				parts={parts}
				onStockAdjustmentSuccess={handleStockAdjustmentSuccess}
				onPartsFormSuccess={handlePartsFormSuccess}
				onBulkImportSuccess={handlePartsFormSuccess}
				onClose={{
					stockAdjustment: closeStockAdjustment,
					partsForm: closePartsForm,
					bulkImport: closeBulkImport,
					export: closeExport,
				}}
			/>
		</div>
	);
}
