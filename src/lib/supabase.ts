import { createClient } from "@supabase/supabase-js";

// Environment variables for Supabase connection
const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL || "http://localhost:8000";
const supabaseAnonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

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
					full_name: string;
					role: "shop_owner" | "manager" | "technician" | "staff";
					phone: string | null;
					is_active: boolean;
					can_create_users: boolean;
					can_manage_inventory: boolean;
					can_view_financials: boolean;
					can_delete_repairs: boolean;
					created_by: string | null;
				};
				Insert: {
					id: string;
					full_name: string;
					role?: "shop_owner" | "manager" | "technician" | "staff";
					phone?: string | null;
					is_active?: boolean;
					can_create_users?: boolean;
					can_manage_inventory?: boolean;
					can_view_financials?: boolean;
					can_delete_repairs?: boolean;
					created_by?: string | null;
				};
				Update: {
					full_name?: string;
					role?: "shop_owner" | "manager" | "technician" | "staff";
					phone?: string | null;
					is_active?: boolean;
					can_create_users?: boolean;
					can_manage_inventory?: boolean;
					can_view_financials?: boolean;
					can_delete_repairs?: boolean;
				};
			};
			customers: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					name: string;
					phone: string;
					email: string | null;
					address: string | null;
					notes: string | null;
				};
				Insert: {
					name: string;
					phone: string;
					email?: string | null;
					address?: string | null;
					notes?: string | null;
				};
				Update: {
					name?: string;
					phone?: string;
					email?: string | null;
					address?: string | null;
					notes?: string | null;
				};
			};
			repairs: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					ticket_number: string;
					customer_id: string;
					device_type: string;
					device_model: string;
					issue_description: string;
					status:
						| "received"
						| "diagnosed"
						| "waiting_parts"
						| "in_progress"
						| "completed"
						| "ready_for_pickup"
						| "delivered"
						| "cancelled";
					priority: "low" | "normal" | "high" | "urgent";
					estimated_cost: number | null;
					final_cost: number | null;
					technician_id: string | null;
					notes: string | null;
					images: string[] | null;
					estimated_completion: string | null;
					completed_at: string | null;
				};
				Insert: {
					ticket_number?: string;
					customer_id: string;
					device_type: string;
					device_model: string;
					issue_description: string;
					status?:
						| "received"
						| "diagnosed"
						| "waiting_parts"
						| "in_progress"
						| "completed"
						| "ready_for_pickup"
						| "delivered"
						| "cancelled";
					priority?: "low" | "normal" | "high" | "urgent";
					estimated_cost?: number | null;
					final_cost?: number | null;
					technician_id?: string | null;
					notes?: string | null;
					images?: string[] | null;
					estimated_completion?: string | null;
				};
				Update: {
					ticket_number?: string;
					device_type?: string;
					device_model?: string;
					issue_description?: string;
					status?:
						| "received"
						| "diagnosed"
						| "waiting_parts"
						| "in_progress"
						| "completed"
						| "ready_for_pickup"
						| "delivered"
						| "cancelled";
					priority?: "low" | "normal" | "high" | "urgent";
					estimated_cost?: number | null;
					final_cost?: number | null;
					technician_id?: string | null;
					notes?: string | null;
					images?: string[] | null;
					estimated_completion?: string | null;
					completed_at?: string | null;
				};
			};
			parts: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					name: string;
					description: string | null;
					sku: string | null;
					cost_price: number;
					selling_price: number;
					stock_quantity: number;
					min_stock_level: number;
					supplier: string | null;
					category: string | null;
				};
				Insert: {
					name: string;
					description?: string | null;
					sku?: string | null;
					cost_price: number;
					selling_price: number;
					stock_quantity?: number;
					min_stock_level?: number;
					supplier?: string | null;
					category?: string | null;
				};
				Update: {
					name?: string;
					description?: string | null;
					sku?: string | null;
					cost_price?: number;
					selling_price?: number;
					stock_quantity?: number;
					min_stock_level?: number;
					supplier?: string | null;
					category?: string | null;
				};
			};
			repair_parts: {
				Row: {
					id: string;
					repair_id: string;
					part_id: string;
					quantity: number;
					unit_price: number;
					created_at: string;
				};
				Insert: {
					repair_id: string;
					part_id: string;
					quantity: number;
					unit_price: number;
				};
				Update: {
					quantity?: number;
					unit_price?: number;
				};
			};
			repair_status_logs: {
				Row: {
					id: string;
					repair_id: string;
					old_status: string | null;
					new_status: string;
					notes: string | null;
					changed_by: string;
					created_at: string;
				};
				Insert: {
					repair_id: string;
					old_status?: string | null;
					new_status: string;
					notes?: string | null;
					changed_by: string;
				};
				Update: {
					notes?: string | null;
				};
				customer_feedback: {
					Row: {
						id: string;
						repair_id: string;
						rating: number;
						comments: string;
						submitted_at: string;
						created_at: string;
					};
					Insert: {
						repair_id: string;
						rating: number;
						comments: string;
						submitted_at?: string;
					};
					Update: {
						rating?: number;
						comments?: string;
					};
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
				| "received"
				| "diagnosed"
				| "waiting_parts"
				| "in_progress"
				| "completed"
				| "ready_for_pickup"
				| "delivered"
				| "cancelled";
			repair_priority: "low" | "normal" | "high" | "urgent";
			user_role: "shop_owner" | "manager" | "technician" | "staff";
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
