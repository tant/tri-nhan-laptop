/**
 * Centralized Database Type Aliases
 * Common type shortcuts for database tables to avoid duplication
 */

import type { Database } from "@/lib/supabase";

// Table Row Types (most commonly used)
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type RepairTicket =
	Database["public"]["Tables"]["repair_tickets"]["Row"];
export type Part = Database["public"]["Tables"]["parts"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type CustomerDevice =
	Database["public"]["Tables"]["customer_devices"]["Row"];

// Insert Types
export type NewCustomer = Database["public"]["Tables"]["customers"]["Insert"];
export type NewRepairTicket =
	Database["public"]["Tables"]["repair_tickets"]["Insert"];
export type NewPart = Database["public"]["Tables"]["parts"]["Insert"];
export type NewUserProfile =
	Database["public"]["Tables"]["user_profiles"]["Insert"];

// Update Types
export type UpdateCustomer =
	Database["public"]["Tables"]["customers"]["Update"];
export type UpdateRepairTicket =
	Database["public"]["Tables"]["repair_tickets"]["Update"];
export type UpdatePart = Database["public"]["Tables"]["parts"]["Update"];
export type UpdateUserProfile =
	Database["public"]["Tables"]["user_profiles"]["Update"];

// Enum Types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type RepairPriority = Database["public"]["Enums"]["repair_priority"];
export type RepairStatus =
	Database["public"]["Tables"]["repair_tickets"]["Row"]["status"];
