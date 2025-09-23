/**
 * Repair Tickets Management Hook
 * Comprehensive repair ticket creation and management for Vietnamese laptop repair shop
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase-types";
import { useState, useCallback } from "react";

// Database types
type RepairTicket = Database["public"]["Tables"]["repair_tickets"]["Row"];
type CustomerDevice = Database["public"]["Tables"]["customer_devices"]["Row"];

export type RepairPriority = "low" | "normal" | "high" | "urgent";

export interface NewRepairTicket {
	// Customer information
	customerPhone: string;
	customerName: string;
	customerEmail?: string;

	// Device information
	deviceBrand: string;
	deviceModel: string;
	deviceType: "laptop" | "desktop" | "tablet" | "phone" | "other";
	serialNumber?: string;
	deviceAge?: number;
	warrantyStatus?: boolean;

	// Problem description
	issueDescription: string;
	customerDescription: string;
	symptoms: string[];
	urgencyReason?: string;

	// Initial assessment
	preliminaryDiagnosis?: string;
	estimatedRepairTime?: number;
	estimatedCost?: number;
	repairComplexity?: "simple" | "medium" | "complex" | "specialized";

	// Device condition
	physicalCondition: {
		general: "excellent" | "good" | "fair" | "poor" | "damaged";
		screen: "excellent" | "good" | "fair" | "poor" | "broken";
		keyboard: "excellent" | "good" | "fair" | "poor" | "damaged";
		ports: "excellent" | "good" | "fair" | "poor" | "damaged";
		battery: "excellent" | "good" | "fair" | "poor" | "dead";
		notes: string;
	};

	// Priority and assignment
	priority: RepairPriority;
	assignedTechnicianId?: string;
	repairCategory?: string;

	// Attachments
	photos?: File[];
	documents?: File[];

	// Workflow
	isDraft: boolean;
	templateId?: string;
}

export interface RepairTemplate {
	id: string;
	name: string;
	description: string;
	deviceType: string;
	repairCategory: string;
	issueDescription: string;
	preliminaryDiagnosis: string;
	estimatedRepairTime: number;
	estimatedCost: number;
	priority: RepairPriority;
	symptoms: string[];
	createdBy: string;
	usageCount: number;
}

export interface RepairTicketSummary {
	id: string;
	ticketCode: string;
	customerPhone: string;
	customerName: string;
	deviceInfo: string;
	issueDescription: string;
	priority: RepairPriority;
	status: string;
	assignedTechnician?: {
		id: string;
		name: string;
	};
	createdAt: string;
	estimatedCompletion?: string;
	totalCost?: number;
}

export interface TicketCreationResult {
	success: boolean;
	ticketId?: string;
	ticketCode?: string;
	error?: string;
	warnings?: string[];
}

/**
 * Hook for managing repair tickets
 */
export function useRepairTickets() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Create a new repair ticket
	 */
	const createRepairTicket = useCallback(
		async (ticketData: NewRepairTicket): Promise<TicketCreationResult> => {
			try {
				setLoading(true);
				setError(null);

				// Validate required fields
				const validation = validateTicketData(ticketData);
				if (!validation.isValid) {
					return {
						success: false,
						error: `Dữ liệu không hợp lệ: ${validation.errors.join(", ")}`,
					};
				}

				// Check if customer exists, create if not
				const { data: customer, error: customerError } = await supabase
					.from("customers")
					.select("phone, full_name")
					.eq("phone", ticketData.customerPhone)
					.single();

				if (customerError && customerError.code === "PGRST116") {
					// Customer doesn't exist, create new one
					const { error: createCustomerError } = await supabase
						.from("customers")
						.insert({
							phone: ticketData.customerPhone,
							full_name: ticketData.customerName,
							email: ticketData.customerEmail,
						});

					if (createCustomerError) {
						return {
							success: false,
							error: `Không thể tạo khách hàng: ${createCustomerError.message}`,
						};
					}
				} else if (customerError) {
					return {
						success: false,
						error: `Lỗi kiểm tra khách hàng: ${customerError.message}`,
					};
				}

				// Create or find device
				let deviceId: string | null = null;
				if (ticketData.serialNumber) {
					const { data: existingDevice } = await supabase
						.from("customer_devices")
						.select("id")
						.eq("customer_phone", ticketData.customerPhone)
						.eq("serial_number", ticketData.serialNumber)
						.single();

					deviceId = existingDevice?.id || null;
				}

				if (!deviceId) {
					const { data: newDevice, error: deviceError } = await supabase
						.from("customer_devices")
						.insert({
							customer_phone: ticketData.customerPhone,
							device_type: ticketData.deviceType,
							brand: ticketData.deviceBrand,
							model: ticketData.deviceModel,
							serial_number: ticketData.serialNumber,
							device_notes: `Tình trạng: ${getConditionDescription(ticketData.physicalCondition)}`,
						})
						.select("id")
						.single();

					if (deviceError) {
						return {
							success: false,
							error: `Không thể tạo thông tin thiết bị: ${deviceError.message}`,
						};
					}

					deviceId = newDevice.id;
				}

				// Generate ticket code
				const ticketCode = await generateTicketCode();

				// Create repair ticket
				const ticketInsert = {
					ticket_code: ticketCode,
					customer_phone: ticketData.customerPhone,
					device_id: deviceId,
					issue_description: ticketData.issueDescription,
					customer_description: ticketData.customerDescription,
					repair_category: ticketData.repairCategory || inferRepairCategory(ticketData.issueDescription),
					priority: ticketData.priority,
					estimated_repair_time: ticketData.estimatedRepairTime,
					estimated_cost: ticketData.estimatedCost,
					complexity_level: ticketData.repairComplexity || "medium",
					assigned_technician_id: ticketData.assignedTechnicianId,
					status: ticketData.isDraft ? "draft" : "device_received",
					preliminary_diagnosis: ticketData.preliminaryDiagnosis,
				};

				const { data: ticket, error: ticketError } = await supabase
					.from("repair_tickets")
					.insert(ticketInsert)
					.select("id, ticket_code")
					.single();

				if (ticketError) {
					return {
						success: false,
						error: `Không thể tạo phiếu sửa chữa: ${ticketError.message}`,
					};
				}

				// Add initial service note
				if (ticketData.preliminaryDiagnosis || ticketData.physicalCondition.notes) {
					await supabase.from("service_notes").insert({
						repair_ticket_id: ticket.id,
						technician_id: ticketData.assignedTechnicianId || (await supabase.auth.getUser()).data.user?.id,
						note_type: "diagnosis",
						note_content: `Tình trạng thiết bị: ${getConditionDescription(ticketData.physicalCondition)}${
							ticketData.preliminaryDiagnosis ? `\n\nChẩn đoán sơ bộ: ${ticketData.preliminaryDiagnosis}` : ""
						}`,
						is_customer_visible: false,
					});
				}

				// Handle file uploads
				const warnings: string[] = [];
				if (ticketData.photos && ticketData.photos.length > 0) {
					const uploadResult = await uploadTicketFiles(ticket.id, ticketData.photos, "photos");
					if (!uploadResult.success) {
						warnings.push(`Một số ảnh không thể tải lên: ${uploadResult.error}`);
					}
				}

				if (ticketData.documents && ticketData.documents.length > 0) {
					const uploadResult = await uploadTicketFiles(ticket.id, ticketData.documents, "documents");
					if (!uploadResult.success) {
						warnings.push(`Một số tài liệu không thể tải lên: ${uploadResult.error}`);
					}
				}

				return {
					success: true,
					ticketId: ticket.id,
					ticketCode: ticket.ticket_code,
					warnings: warnings.length > 0 ? warnings : undefined,
				};
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				return {
					success: false,
					error: error.message,
				};
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Save ticket as draft
	 */
	const saveDraft = useCallback(
		async (ticketData: Partial<NewRepairTicket>, draftId?: string): Promise<TicketCreationResult> => {
			try {
				setLoading(true);
				setError(null);

				const draftData = {
					...ticketData,
					isDraft: true,
				};

				if (draftId) {
					// Update existing draft
					const { error: updateError } = await supabase
						.from("repair_tickets")
						.update(draftData)
						.eq("id", draftId)
						.eq("status", "draft");

					if (updateError) {
						return {
							success: false,
							error: `Không thể lưu bản nháp: ${updateError.message}`,
						};
					}

					return {
						success: true,
						ticketId: draftId,
					};
				} else {
					// Create new draft
					return await createRepairTicket(draftData as NewRepairTicket);
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				return {
					success: false,
					error: error.message,
				};
			} finally {
				setLoading(false);
			}
		},
		[createRepairTicket],
	);

	/**
	 * Get repair tickets with filters
	 */
	const getRepairTickets = useCallback(
		async (filters: {
			status?: string;
			priority?: RepairPriority;
			assignedTo?: string;
			customerPhone?: string;
			dateRange?: { start: string; end: string };
			limit?: number;
		} = {}): Promise<RepairTicketSummary[]> => {
			try {
				setLoading(true);
				setError(null);

				let query = supabase
					.from("repair_tickets")
					.select(`
						id,
						ticket_code,
						customer_phone,
						issue_description,
						priority,
						status,
						estimated_cost,
						created_at,
						estimated_completion_date,
						customers(full_name),
						customer_devices(brand, model),
						user_profiles(full_name)
					`)
					.order("created_at", { ascending: false });

				if (filters.status) {
					query = query.eq("status", filters.status);
				}

				if (filters.priority) {
					query = query.eq("priority", filters.priority);
				}

				if (filters.assignedTo) {
					query = query.eq("assigned_technician_id", filters.assignedTo);
				}

				if (filters.customerPhone) {
					query = query.eq("customer_phone", filters.customerPhone);
				}

				if (filters.dateRange) {
					query = query
						.gte("created_at", filters.dateRange.start)
						.lte("created_at", filters.dateRange.end);
				}

				if (filters.limit) {
					query = query.limit(filters.limit);
				}

				const { data: tickets, error: ticketsError } = await query;

				if (ticketsError) {
					throw new Error(`Lỗi tải danh sách phiếu: ${ticketsError.message}`);
				}

				return (tickets || []).map(ticket => ({
					id: ticket.id,
					ticketCode: ticket.ticket_code,
					customerPhone: ticket.customer_phone,
					customerName: ticket.customers?.full_name || "Không xác định",
					deviceInfo: ticket.customer_devices
						? `${ticket.customer_devices.brand} ${ticket.customer_devices.model}`
						: "Không xác định",
					issueDescription: ticket.issue_description,
					priority: ticket.priority as RepairPriority,
					status: ticket.status,
					assignedTechnician: ticket.user_profiles
						? {
								id: ticket.assigned_technician_id || "",
								name: ticket.user_profiles.full_name,
						  }
						: undefined,
					createdAt: ticket.created_at,
					estimatedCompletion: ticket.estimated_completion_date,
					totalCost: ticket.estimated_cost,
				}));
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/**
	 * Get repair templates
	 */
	const getRepairTemplates = useCallback(
		async (deviceType?: string): Promise<RepairTemplate[]> => {
			try {
				setLoading(true);
				setError(null);

				// For now, return a hardcoded list since we don't have templates table yet
				// This would be replaced with actual database query in production
				const templates: RepairTemplate[] = [
					{
						id: "laptop-screen",
						name: "Thay màn hình laptop",
						description: "Template cho việc thay thế màn hình laptop bị hỏng",
						deviceType: "laptop",
						repairCategory: "hardware",
						issueDescription: "Màn hình laptop bị vỡ/hỏng, cần thay thế",
						preliminaryDiagnosis: "Màn hình LCD bị hư hỏng, cần thay thế hoàn toàn",
						estimatedRepairTime: 2,
						estimatedCost: 2000000,
						priority: "normal" as RepairPriority,
						symptoms: ["Màn hình vỡ", "Không hiển thị", "Có vệt đen"],
						createdBy: "system",
						usageCount: 15,
					},
					{
						id: "laptop-keyboard",
						name: "Sửa bàn phím laptop",
						description: "Template cho việc sửa chữa/thay bàn phím laptop",
						deviceType: "laptop",
						repairCategory: "hardware",
						issueDescription: "Bàn phím laptop không hoạt động hoặc một số phím bị hỏng",
						preliminaryDiagnosis: "Bàn phím bị hỏng, có thể cần thay thế",
						estimatedRepairTime: 1,
						estimatedCost: 800000,
						priority: "normal" as RepairPriority,
						symptoms: ["Phím không nhấn được", "Phím dính", "Bàn phím không phản hồi"],
						createdBy: "system",
						usageCount: 23,
					},
					{
						id: "laptop-battery",
						name: "Thay pin laptop",
						description: "Template cho việc thay thế pin laptop hết dung lượng",
						deviceType: "laptop",
						repairCategory: "hardware",
						issueDescription: "Pin laptop không giữ được điện hoặc sạc không vào",
						preliminaryDiagnosis: "Pin laptop hết tuổi thọ, cần thay thế",
						estimatedRepairTime: 0.5,
						estimatedCost: 1200000,
						priority: "normal" as RepairPriority,
						symptoms: ["Pin tụt nhanh", "Không sạc được", "Laptop chỉ chạy khi cắm sạc"],
						createdBy: "system",
						usageCount: 31,
					},
					{
						id: "virus-cleanup",
						name: "Diệt virus và tối ưu hệ thống",
						description: "Template cho việc diệt virus và tối ưu hóa hệ thống",
						deviceType: "laptop",
						repairCategory: "software",
						issueDescription: "Máy tính bị nhiễm virus, chạy chậm hoặc có quảng cáo spam",
						preliminaryDiagnosis: "Hệ thống bị nhiễm malware, cần làm sạch và tối ưu",
						estimatedRepairTime: 3,
						estimatedCost: 300000,
						priority: "normal" as RepairPriority,
						symptoms: ["Máy chạy chậm", "Xuất hiện quảng cáo", "Phần mềm lạ tự cài đặt"],
						createdBy: "system",
						usageCount: 45,
					},
					{
						id: "os-install",
						name: "Cài đặt lại hệ điều hành",
						description: "Template cho việc cài đặt lại Windows và phần mềm cần thiết",
						deviceType: "laptop",
						repairCategory: "software",
						issueDescription: "Cần cài đặt lại hệ điều hành và các phần mềm cơ bản",
						preliminaryDiagnosis: "Hệ thống cần cài đặt lại để hoạt động ổn định",
						estimatedRepairTime: 4,
						estimatedCost: 400000,
						priority: "normal" as RepairPriority,
						symptoms: ["Hệ thống không khởi động", "Lỗi hệ điều hành", "Blue screen"],
						createdBy: "system",
						usageCount: 38,
					},
				];

				return deviceType
					? templates.filter(t => t.deviceType === deviceType)
					: templates;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Lỗi không xác định");
				setError(error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return {
		loading,
		error,
		createRepairTicket,
		saveDraft,
		getRepairTickets,
		getRepairTemplates,
	};
}

// Helper functions

function validateTicketData(data: NewRepairTicket): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!data.customerPhone?.trim()) {
		errors.push("Số điện thoại khách hàng là bắt buộc");
	}

	if (!data.customerName?.trim()) {
		errors.push("Tên khách hàng là bắt buộc");
	}

	if (!data.deviceBrand?.trim()) {
		errors.push("Hãng thiết bị là bắt buộc");
	}

	if (!data.deviceModel?.trim()) {
		errors.push("Mẫu thiết bị là bắt buộc");
	}

	if (!data.issueDescription?.trim()) {
		errors.push("Mô tả vấn đề là bắt buộc");
	}

	if (!data.customerDescription?.trim()) {
		errors.push("Mô tả của khách hàng là bắt buộc");
	}

	if (!["low", "normal", "high", "urgent"].includes(data.priority)) {
		errors.push("Mức độ ưu tiên không hợp lệ");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

async function generateTicketCode(): Promise<string> {
	const today = new Date();
	const year = today.getFullYear().toString().slice(-2);
	const month = (today.getMonth() + 1).toString().padStart(2, "0");
	const day = today.getDate().toString().padStart(2, "0");

	// Get count of tickets created today
	const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

	const { count } = await supabase
		.from("repair_tickets")
		.select("*", { count: "exact", head: true })
		.gte("created_at", startOfDay.toISOString())
		.lt("created_at", endOfDay.toISOString());

	const sequence = ((count || 0) + 1).toString().padStart(3, "0");

	return `SC${year}${month}${day}${sequence}`;
}

function getConditionDescription(condition: NewRepairTicket["physicalCondition"]): string {
	const conditions = [
		`Tổng thể: ${getConditionLabel(condition.general)}`,
		`Màn hình: ${getConditionLabel(condition.screen)}`,
		`Bàn phím: ${getConditionLabel(condition.keyboard)}`,
		`Cổng kết nối: ${getConditionLabel(condition.ports)}`,
		`Pin: ${getConditionLabel(condition.battery)}`,
	];

	if (condition.notes) {
		conditions.push(`Ghi chú: ${condition.notes}`);
	}

	return conditions.join(", ");
}

function getConditionLabel(condition: string): string {
	const labels = {
		excellent: "Tuyệt vời",
		good: "Tốt",
		fair: "Khá",
		poor: "Kém",
		damaged: "Hư hỏng",
		broken: "Vỡ",
		dead: "Hỏng hoàn toàn",
	};
	return labels[condition] || condition;
}

function inferRepairCategory(issueDescription: string): string {
	const description = issueDescription.toLowerCase();

	if (description.includes("màn hình") || description.includes("screen")) return "hardware";
	if (description.includes("bàn phím") || description.includes("keyboard")) return "hardware";
	if (description.includes("pin") || description.includes("battery")) return "hardware";
	if (description.includes("virus") || description.includes("malware")) return "software";
	if (description.includes("windows") || description.includes("hệ điều hành")) return "software";
	if (description.includes("chậm") || description.includes("lag")) return "performance";
	if (description.includes("nước") || description.includes("đổ")) return "physical_damage";

	return "hardware";
}

async function uploadTicketFiles(
	ticketId: string,
	files: File[],
	type: "photos" | "documents",
): Promise<{ success: boolean; error?: string }> {
	try {
		const uploadPromises = files.map(async (file, index) => {
			const fileName = `${ticketId}/${type}/${Date.now()}_${index}_${file.name}`;
			const { error } = await supabase.storage
				.from("ticket-attachments")
				.upload(fileName, file);

			if (error) throw error;
			return fileName;
		});

		await Promise.all(uploadPromises);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Lỗi tải file",
		};
	}
}