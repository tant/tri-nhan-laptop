/**
 * Repair Templates Management Hook
 * Focused template creation and management for repair tickets
 */

import type { RepairPriority } from "./use-repair-validation";

export interface RepairTemplate {
	id: string;
	name: string;
	category: string;
	description: string;
	priority?: RepairPriority;
	estimatedRepairTime?: number;
	estimatedCost?: number;
	symptoms?: string[];
	createdAt?: string;
	updatedAt?: string;
}

interface GlobalTemplate {
	id: string;
	name: string;
	category: string;
	description: string;
	priority?: RepairPriority;
	symptoms?: string[];
	estimatedRepairTime?: number;
	estimatedCost?: number;
}

// Module-level template storage - persists across hook re-instantiations
const globalTemplates: GlobalTemplate[] = [
	{
		id: "1",
		name: "Laptop Display Repair",
		category: "display",
		description: "Standard laptop screen replacement",
		priority: "normal",
		estimatedRepairTime: 120, // minutes
		estimatedCost: 2000000, // VND
		symptoms: ["Màn hình bị vỡ", "Không hiển thị", "Có vệt sáng"]
	},
	{
		id: "2",
		name: "Keyboard Replacement",
		category: "keyboard",
		description: "Laptop keyboard repair and replacement",
		priority: "normal",
		estimatedRepairTime: 90,
		estimatedCost: 800000,
		symptoms: ["Phím không hoạt động", "Phím bị dính", "Bàn phím bị nước vào"]
	},
	{
		id: "3",
		name: "Battery Service",
		category: "battery",
		description: "Battery replacement and calibration",
		priority: "normal",
		estimatedRepairTime: 60,
		estimatedCost: 1500000,
		symptoms: ["Pin không sạc", "Pin tụt nhanh", "Laptop không khởi động"]
	},
	{
		id: "4",
		name: "Cooling System Cleaning",
		category: "cooling",
		description: "Fan cleaning and thermal paste replacement",
		priority: "normal",
		estimatedRepairTime: 180,
		estimatedCost: 500000,
		symptoms: ["Máy nóng", "Quạt kêu to", "Tắt máy đột ngột"]
	},
	{
		id: "5",
		name: "Audio System Repair",
		category: "audio",
		description: "Speaker and audio jack repair",
		priority: "low",
		estimatedRepairTime: 120,
		estimatedCost: 600000,
		symptoms: ["Không có âm thanh", "Âm thanh bị méo", "Loa kêu rè"]
	}
];

/**
 * Hook for repair template management
 */
export function useRepairTemplates() {
	/**
	 * Get all available repair templates
	 */
	const getTemplates = (): RepairTemplate[] => {
		return globalTemplates.map(template => ({
			...template,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}));
	};

	/**
	 * Get templates by category
	 */
	const getTemplatesByCategory = (category: string): RepairTemplate[] => {
		return getTemplates().filter(template => template.category === category);
	};

	/**
	 * Get template by ID
	 */
	const getTemplateById = (id: string): RepairTemplate | null => {
		const template = globalTemplates.find(t => t.id === id);
		return template ? {
			...template,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		} : null;
	};

	/**
	 * Create a new repair template
	 */
	const createTemplate = (templateData: Omit<RepairTemplate, 'id' | 'createdAt' | 'updatedAt'>): RepairTemplate => {
		const newTemplate: GlobalTemplate = {
			...templateData,
			id: Date.now().toString(), // Simple ID generation for now
		};

		globalTemplates.push(newTemplate);

		return {
			...newTemplate,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	};

	/**
	 * Update an existing template
	 */
	const updateTemplate = (id: string, updates: Partial<RepairTemplate>): RepairTemplate | null => {
		const templateIndex = globalTemplates.findIndex(t => t.id === id);

		if (templateIndex === -1) {
			return null;
		}

		globalTemplates[templateIndex] = {
			...globalTemplates[templateIndex],
			...updates,
			id, // Ensure ID doesn't change
		};

		return {
			...globalTemplates[templateIndex],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	};

	/**
	 * Delete a template
	 */
	const deleteTemplate = (id: string): boolean => {
		const templateIndex = globalTemplates.findIndex(t => t.id === id);

		if (templateIndex === -1) {
			return false;
		}

		globalTemplates.splice(templateIndex, 1);
		return true;
	};

	/**
	 * Get priority labels in Vietnamese
	 */
	const getPriorityLabels = () => ({
		low: "Thấp",
		normal: "Bình thường",
		high: "Cao",
		urgent: "Khẩn cấp"
	});

	/**
	 * Get category labels in Vietnamese
	 */
	const getCategoryLabels = () => ({
		display: "Màn hình",
		keyboard: "Bàn phím",
		battery: "Pin",
		cooling: "Tản nhiệt",
		audio: "Âm thanh",
		network: "Kết nối",
		storage: "Lưu trữ",
		memory: "Bộ nhớ",
		other: "Khác"
	});

	/**
	 * Categorize problem based on issue description
	 */
	const categorizeProblem = (issueDescription: string): {
		category: string;
		suggestedTemplates: RepairTemplate[];
		confidence: number;
	} => {
		const description = issueDescription.toLowerCase();
		let category = "other";
		let confidence = 0;

		// Scoring system for category detection
		const categoryKeywords = {
			display: ["màn hình", "hiển thị", "screen", "lcd", "led", "vỡ", "nứt", "tối", "sáng"],
			keyboard: ["bàn phím", "keyboard", "phím", "gõ", "key"],
			battery: ["pin", "battery", "sạc", "charge", "điện", "tắt đột ngột"],
			cooling: ["quạt", "fan", "nóng", "nhiệt", "thermal", "cooling"],
			audio: ["âm thanh", "loa", "sound", "audio", "speaker", "mic"],
			network: ["wifi", "mạng", "internet", "kết nối", "network"],
			storage: ["ổ cứng", "ssd", "hdd", "storage", "hard drive", "dữ liệu"],
			memory: ["ram", "memory", "bộ nhớ", "lag", "chậm"]
		};

		let bestMatch = { category: "other", score: 0 };

		for (const [cat, keywords] of Object.entries(categoryKeywords)) {
			const score = keywords.reduce((acc, keyword) => {
				return acc + (description.includes(keyword) ? 1 : 0);
			}, 0);

			if (score > bestMatch.score) {
				bestMatch = { category: cat, score };
			}
		}

		category = bestMatch.category;
		confidence = Math.min(bestMatch.score * 0.3, 1); // Convert to 0-1 scale

		const suggestedTemplates = getTemplatesByCategory(category).slice(0, 3);

		return {
			category,
			suggestedTemplates,
			confidence
		};
	};

	return {
		getTemplates,
		getTemplatesByCategory,
		getTemplateById,
		createTemplate,
		updateTemplate,
		deleteTemplate,
		getPriorityLabels,
		getCategoryLabels,
		categorizeProblem,
	};
}