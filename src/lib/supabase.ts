import { createClient } from "@supabase/supabase-js";

// Environment variables for Supabase connection
// ✅ CORRECT: App connects to Kong endpoint only (aggregates all Supabase services)
const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL || "http://localhost:8000";
const supabaseAnonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJeHxjNa-NEHSDqmaFTUo1fKTbX_C-VzE";

// Create Supabase client with Vietnamese repair shop configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
	realtime: {
		// Enable real-time for repair status updates
		params: {
			eventsPerSecond: 10,
		},
	},
});

// Database Types - Matching Vietnamese repair shop schema
export type Database = {
	public: {
		Tables: {
			user_profiles: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					email: string;
					full_name: string;
					role: "shop_owner" | "staff";
					phone: string | null;
					is_active: boolean;
				};
				Insert: {
					id: string;
					email: string;
					full_name: string;
					role?: "shop_owner" | "staff";
					phone?: string | null;
					is_active?: boolean;
				};
				Update: {
					email?: string;
					full_name?: string;
					role?: "shop_owner" | "staff";
					phone?: string | null;
					is_active?: boolean;
				};
			};
			customers: {
				Row: {
					phone: string; // Primary key
					full_name: string;
					address: string | null;
					notes: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					phone: string;
					full_name: string;
					address?: string | null;
					notes?: string | null;
				};
				Update: {
					full_name?: string;
					address?: string | null;
					notes?: string | null;
				};
			};
			repair_tickets: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					ticket_code: string; // LRP-YYYY-XXXXXX format
					customer_phone: string; // References customers(phone)
					device_info: {
						brand: string;
						model: string;
						serial_number?: string;
						initial_condition: string;
					};
					issue_description: string;
					status:
						| "device_received"
						| "preliminary_inspection"
						| "awaiting_repair_plan"
						| "approved_for_repair"
						| "in_diagnosis"
						| "waiting_parts"
						| "in_repair"
						| "quality_testing"
						| "ready_for_pickup"
						| "completed"
						| "cannot_repair"
						| "cancelled_by_customer"
						| "repair_failed"
						| "customer_no_show"
						| "ready_for_return"
						| "abandoned";
					assigned_technician_id: string | null;
					parts_used: Array<{
						part_id: string;
						name: string;
						quantity: number;
						unit_price: number;
					}> | null;
					estimated_completion: string | null;
					total_cost: number | null;
					deposit_amount: number | null;
					is_paid: boolean;
					paid_at: string | null;
					payment_method: "cash" | "transfer" | "other" | null;
					receipt_note: string | null;
					warranty_until: string | null;
					has_issue_report: boolean;
					customer_approved_at: string | null;
					customer_approved_by: string | null;
					repair_completed_at: string | null;
					repair_completed_by: string | null;
					paid_by: string | null;
				};
				Insert: {
					ticket_code?: string;
					customer_phone: string;
					device_info: {
						brand: string;
						model: string;
						serial_number?: string;
						initial_condition: string;
					};
					issue_description: string;
					status?:
						| "device_received"
						| "preliminary_inspection"
						| "awaiting_repair_plan"
						| "approved_for_repair"
						| "in_diagnosis"
						| "waiting_parts"
						| "in_repair"
						| "quality_testing"
						| "ready_for_pickup"
						| "completed"
						| "cannot_repair"
						| "cancelled_by_customer"
						| "repair_failed"
						| "customer_no_show"
						| "ready_for_return"
						| "abandoned";
					assigned_technician_id?: string | null;
					parts_used?: Array<{
						part_id: string;
						name: string;
						quantity: number;
						unit_price: number;
					}> | null;
					estimated_completion?: string | null;
					total_cost?: number | null;
					deposit_amount?: number | null;
					is_paid?: boolean;
					paid_at?: string | null;
					payment_method?: "cash" | "transfer" | "other" | null;
					receipt_note?: string | null;
					warranty_until?: string | null;
					has_issue_report?: boolean;
					customer_approved_at?: string | null;
					customer_approved_by?: string | null;
					repair_completed_at?: string | null;
					repair_completed_by?: string | null;
					paid_by?: string | null;
				};
				Update: {
					customer_phone?: string;
					device_info?: {
						brand: string;
						model: string;
						serial_number?: string;
						initial_condition: string;
					};
					issue_description?: string;
					status?:
						| "device_received"
						| "preliminary_inspection"
						| "awaiting_repair_plan"
						| "approved_for_repair"
						| "in_diagnosis"
						| "waiting_parts"
						| "in_repair"
						| "quality_testing"
						| "ready_for_pickup"
						| "completed"
						| "cannot_repair"
						| "cancelled_by_customer"
						| "repair_failed"
						| "customer_no_show"
						| "ready_for_return"
						| "abandoned";
					assigned_technician_id?: string | null;
					parts_used?: Array<{
						part_id: string;
						name: string;
						quantity: number;
						unit_price: number;
					}> | null;
					estimated_completion?: string | null;
					total_cost?: number | null;
					deposit_amount?: number | null;
					is_paid?: boolean;
					paid_at?: string | null;
					payment_method?: "cash" | "transfer" | "other" | null;
					receipt_note?: string | null;
					warranty_until?: string | null;
					has_issue_report?: boolean;
					customer_approved_at?: string | null;
					customer_approved_by?: string | null;
					repair_completed_at?: string | null;
					repair_completed_by?: string | null;
					paid_by?: string | null;
				};
			};
			parts: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					name: string;
					category: string;
					brand: string | null;
					model_compatibility: string[];
					current_stock: number;
					unit_cost: number;
					unit_price: number;
					supplier_info: string | null;
				};
				Insert: {
					name: string;
					category: string;
					brand?: string | null;
					model_compatibility?: string[];
					current_stock?: number;
					unit_cost: number;
					unit_price: number;
					supplier_info?: string | null;
				};
				Update: {
					name?: string;
					category?: string;
					brand?: string | null;
					model_compatibility?: string[];
					current_stock?: number;
					unit_cost?: number;
					unit_price?: number;
					supplier_info?: string | null;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			repair_status:
				| "device_received"
				| "preliminary_inspection"
				| "awaiting_repair_plan"
				| "approved_for_repair"
				| "in_diagnosis"
				| "waiting_parts"
				| "in_repair"
				| "quality_testing"
				| "ready_for_pickup"
				| "completed"
				| "cannot_repair"
				| "cancelled_by_customer"
				| "repair_failed"
				| "customer_no_show"
				| "ready_for_return"
				| "abandoned";
			payment_method: "cash" | "transfer" | "other";
			user_role: "shop_owner" | "staff";
		};
	};
};

// Typed Supabase client
export type SupabaseClient = typeof supabase;

// Helper function for error handling
export const handleSupabaseError = (error: any): string => {
	if (error?.message) {
		// Map common PostgreSQL errors to Vietnamese messages
		if (error.message.includes("duplicate key")) {
			return "Dữ liệu đã tồn tại trong hệ thống";
		}
		if (error.message.includes("foreign key")) {
			return "Không thể xóa do có dữ liệu liên quan";
		}
		if (error.message.includes("not authenticated")) {
			return "Bạn cần đăng nhập để thực hiện chức năng này";
		}
		if (error.message.includes("insufficient permissions")) {
			return "Bạn không có quyền thực hiện chức năng này";
		}
		return error.message;
	}
	return "Đã xảy ra lỗi không xác định";
};

// Connection test function
export const testSupabaseConnection = async (): Promise<boolean> => {
	try {
		const { error } = await supabase
			.from("user_profiles")
			.select("count", { count: "exact", head: true });

		if (error) {
			console.error("Supabase connection test failed:", error);
			return false;
		}

		console.log("✅ Supabase connection successful");
		return true;
	} catch (error) {
		console.error("Supabase connection test error:", error);
		return false;
	}
};
