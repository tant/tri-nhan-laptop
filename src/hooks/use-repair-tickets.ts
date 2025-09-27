/**
 * Repair Tickets Management Hook - Refactored
 * Main hook that combines focused sub-hooks for comprehensive repair ticket functionality
 */

import { useRepairTicketsCrud } from "./use-repair-tickets-crud";
import { useRepairTemplates } from "./use-repair-templates";
import { useRepairValidation } from "./use-repair-validation";
import { useRepairSearch } from "./use-repair-search";

// Re-export types for backward compatibility
export type { NewRepairTicket, RepairPriority } from "./use-repair-validation";
export type { RepairTemplate } from "./use-repair-templates";
export type { TicketCreationResult, RepairTicketWithDetails } from "./use-repair-tickets-crud";
export type { RepairTicketSummary, SearchFilters } from "./use-repair-search";

/**
 * Main repair tickets hook - provides all functionality through composed focused hooks
 * This maintains backward compatibility while using the new architecture
 */
export function useRepairTickets() {
	// Compose focused hooks
	const crud = useRepairTicketsCrud();
	const templates = useRepairTemplates();
	const validation = useRepairValidation();
	const search = useRepairSearch();

	// Merge loading and error states
	const loading = crud.loading || search.loading;
	const error = crud.error || search.error;

	// Legacy aliases for test compatibility
	const createTicket = crud.createRepairTicket;

	// Test-compatible version that returns simplified format
	const createTicketFromTemplate = async (templateId: string, ticketData: any) => {
		const template = templates.getTemplateById(templateId);
		if (!template) {
			throw new Error("Template not found");
		}

		// Merge template data with ticket data
		const completeTicketData = {
			...ticketData,
			repairCategory: template.category,
			estimatedCost: template.estimatedCost,
			priority: template.priority || ticketData.priority,
			isDraft: ticketData.isDraft || false,
		};

		const result = await crud.createRepairTicket(completeTicketData);

		if (!result.success) {
			throw new Error(result.error || "Failed to create ticket");
		}

		// Return test-compatible format
		return {
			id: result.ticketId,
			code: result.ticketCode,
			customer: {
				phone: ticketData.customerPhone,
				fullName: ticketData.customerName,
				email: ticketData.customerEmail,
			},
			device: {
				brand: ticketData.deviceBrand,
				model: ticketData.deviceModel,
				type: ticketData.deviceType,
			},
			issue: {
				description: ticketData.issueDescription,
				customerDescription: ticketData.customerDescription,
				category: template.category,
				priority: template.priority || ticketData.priority,
			},
			estimatedCost: template.estimatedCost,
			status: ticketData.isDraft ? "draft" : "device_received",
			createdAt: new Date().toISOString(),
		};
	};

	return {
		// State
		loading,
		error,

		// CRUD Operations
		createRepairTicket: crud.createRepairTicket,
		createTicket, // Alias for test compatibility
		getRepairById: crud.getRepairById,
		updateRepair: crud.updateRepair,
		saveDraft: crud.saveDraft,
		loadDraft: crud.loadDraft,

		// Search & Filtering
		getRepairTickets: search.getRepairTickets,
		searchByText: search.searchByText,
		getTechnicianWorkload: search.getTechnicianWorkload,
		previewNextTicketCode: search.previewNextTicketCode,

		// Templates
		createTemplate: templates.createTemplate,
		getTemplates: templates.getTemplates,
		getTemplatesByCategory: templates.getTemplatesByCategory,
		getTemplateById: templates.getTemplateById,
		getRepairTemplates: templates.getTemplates, // Alias
		createTicketFromTemplate,

		// Validation & Utilities
		validateTicketData: validation.validateTicketData,
		getConditionDescription: validation.getConditionDescription,
		getConditionLabel: validation.getConditionLabel,
		inferRepairCategory: validation.inferRepairCategory,

		// Labels & Categories
		getPriorityLabels: templates.getPriorityLabels,
		getCategoryLabels: templates.getCategoryLabels,
		categorizeProblem: templates.categorizeProblem,
	};
}