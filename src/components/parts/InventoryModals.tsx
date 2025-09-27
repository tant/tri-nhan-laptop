/**
 * Inventory Modal Management
 * Centralized modal state and components for inventory management
 */

import type { Part } from "@/lib/database-types";
import { Suspense, lazy, useReducer } from "react";

// Lazy load modals to reduce initial bundle size
const BulkImportModal = lazy(() =>
	import("@/components/parts/BulkImportModal").then((m) => ({
		default: m.BulkImportModal,
	})),
);
const ExportPartsModal = lazy(() =>
	import("@/components/parts/ExportPartsModal").then((m) => ({
		default: m.ExportPartsModal,
	})),
);
const PartsFormModal = lazy(() =>
	import("@/components/parts/PartsFormModal").then((m) => ({
		default: m.PartsFormModal,
	})),
);
const StockAdjustmentModal = lazy(() =>
	import("@/components/parts/StockAdjustmentModal").then((m) => ({
		default: m.StockAdjustmentModal,
	})),
);

// Modal state management types
export type ModalState = {
	stockAdjustment: boolean;
	partsForm: boolean;
	bulkImport: boolean;
	export: boolean;
	selectedPart: Part | null;
	editingPart: Part | null;
};

export type ModalAction =
	| { type: "OPEN_STOCK_ADJUSTMENT"; part: Part }
	| { type: "CLOSE_STOCK_ADJUSTMENT" }
	| { type: "OPEN_PARTS_FORM"; part?: Part }
	| { type: "CLOSE_PARTS_FORM" }
	| { type: "OPEN_BULK_IMPORT" }
	| { type: "CLOSE_BULK_IMPORT" }
	| { type: "OPEN_EXPORT" }
	| { type: "CLOSE_EXPORT" }
	| { type: "CLOSE_ALL" };

const initialModalState: ModalState = {
	stockAdjustment: false,
	partsForm: false,
	bulkImport: false,
	export: false,
	selectedPart: null,
	editingPart: null,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
	switch (action.type) {
		case "OPEN_STOCK_ADJUSTMENT":
			return {
				...initialModalState, // Close all others
				stockAdjustment: true,
				selectedPart: action.part,
			};
		case "CLOSE_STOCK_ADJUSTMENT":
			return { ...state, stockAdjustment: false, selectedPart: null };
		case "OPEN_PARTS_FORM":
			return {
				...initialModalState, // Close all others
				partsForm: true,
				editingPart: action.part || null,
			};
		case "CLOSE_PARTS_FORM":
			return { ...state, partsForm: false, editingPart: null };
		case "OPEN_BULK_IMPORT":
			return { ...initialModalState, bulkImport: true };
		case "CLOSE_BULK_IMPORT":
			return { ...state, bulkImport: false };
		case "OPEN_EXPORT":
			return { ...initialModalState, export: true };
		case "CLOSE_EXPORT":
			return { ...state, export: false };
		case "CLOSE_ALL":
			return initialModalState;
		default:
			return state;
	}
}

/**
 * Hook for managing inventory modals
 */
export function useInventoryModals() {
	const [modalState, dispatch] = useReducer(modalReducer, initialModalState);

	const openStockAdjustment = (part: Part) => {
		dispatch({ type: "OPEN_STOCK_ADJUSTMENT", part });
	};

	const closeStockAdjustment = () => {
		dispatch({ type: "CLOSE_STOCK_ADJUSTMENT" });
	};

	const openPartsForm = (part?: Part) => {
		dispatch({ type: "OPEN_PARTS_FORM", part });
	};

	const closePartsForm = () => {
		dispatch({ type: "CLOSE_PARTS_FORM" });
	};

	const openBulkImport = () => {
		dispatch({ type: "OPEN_BULK_IMPORT" });
	};

	const closeBulkImport = () => {
		dispatch({ type: "CLOSE_BULK_IMPORT" });
	};

	const openExport = () => {
		dispatch({ type: "OPEN_EXPORT" });
	};

	const closeExport = () => {
		dispatch({ type: "CLOSE_EXPORT" });
	};

	const closeAll = () => {
		dispatch({ type: "CLOSE_ALL" });
	};

	return {
		modalState,
		openStockAdjustment,
		closeStockAdjustment,
		openPartsForm,
		closePartsForm,
		openBulkImport,
		closeBulkImport,
		openExport,
		closeExport,
		closeAll,
	};
}

/**
 * Modal components wrapper
 */
export interface InventoryModalsProps {
	modalState: ModalState;
	parts: Part[];
	onStockAdjustmentSuccess: () => void;
	onPartsFormSuccess: () => void;
	onBulkImportSuccess: () => void;
	onClose: {
		stockAdjustment: () => void;
		partsForm: () => void;
		bulkImport: () => void;
		export: () => void;
	};
}

export function InventoryModals({
	modalState,
	parts,
	onStockAdjustmentSuccess,
	onPartsFormSuccess,
	onBulkImportSuccess,
	onClose,
}: InventoryModalsProps) {
	return (
		<Suspense fallback={null}>
			{modalState.stockAdjustment && modalState.selectedPart && (
				<StockAdjustmentModal
					part={modalState.selectedPart}
					isOpen={modalState.stockAdjustment}
					onClose={onClose.stockAdjustment}
					onSuccess={onStockAdjustmentSuccess}
				/>
			)}

			{modalState.partsForm && (
				<PartsFormModal
					part={modalState.editingPart}
					isOpen={modalState.partsForm}
					onClose={onClose.partsForm}
					onSuccess={onPartsFormSuccess}
				/>
			)}

			{modalState.bulkImport && (
				<BulkImportModal
					isOpen={modalState.bulkImport}
					onClose={onClose.bulkImport}
					onSuccess={onBulkImportSuccess}
				/>
			)}

			{modalState.export && (
				<ExportPartsModal
					isOpen={modalState.export}
					onClose={onClose.export}
					parts={parts}
				/>
			)}
		</Suspense>
	);
}

/**
 * Individual modal component wrappers for more granular control
 */
export function StockAdjustmentModalWrapper({
	part,
	isOpen,
	onClose,
	onSuccess,
}: {
	part: Part | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	if (!part || !isOpen) return null;

	return (
		<Suspense fallback={null}>
			<StockAdjustmentModal
				part={part}
				isOpen={isOpen}
				onClose={onClose}
				onSuccess={onSuccess}
			/>
		</Suspense>
	);
}

export function PartsFormModalWrapper({
	part,
	isOpen,
	onClose,
	onSuccess,
}: {
	part: Part | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	if (!isOpen) return null;

	return (
		<Suspense fallback={null}>
			<PartsFormModal
				part={part}
				isOpen={isOpen}
				onClose={onClose}
				onSuccess={onSuccess}
			/>
		</Suspense>
	);
}

export function BulkImportModalWrapper({
	isOpen,
	onClose,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	if (!isOpen) return null;

	return (
		<Suspense fallback={null}>
			<BulkImportModal
				isOpen={isOpen}
				onClose={onClose}
				onSuccess={onSuccess}
			/>
		</Suspense>
	);
}

export function ExportPartsModalWrapper({
	parts,
	isOpen,
	onClose,
}: {
	parts: Part[];
	isOpen: boolean;
	onClose: () => void;
}) {
	if (!isOpen) return null;

	return (
		<Suspense fallback={null}>
			<ExportPartsModal isOpen={isOpen} onClose={onClose} parts={parts} />
		</Suspense>
	);
}

/**
 * Helper function to check if any modal is open
 */
export function hasOpenModal(modalState: ModalState): boolean {
	return Object.values(modalState).some((value) =>
		typeof value === "boolean" ? value : false,
	);
}

/**
 * Helper function to get currently open modal name
 */
export function getOpenModalName(modalState: ModalState): string | null {
	if (modalState.stockAdjustment) return "stockAdjustment";
	if (modalState.partsForm) return "partsForm";
	if (modalState.bulkImport) return "bulkImport";
	if (modalState.export) return "export";
	return null;
}
