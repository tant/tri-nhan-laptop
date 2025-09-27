/**
 * Generic Types for Reusable Components
 * Type-safe generic utilities for Vietnamese laptop repair shop components
 */

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

/**
 * Generic table configuration type
 */
export interface GenericTableConfig<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	searchable?: boolean;
	searchPlaceholder?: string;
	sortable?: boolean;
	filterable?: boolean;
	selectable?: boolean;
	pagination?: boolean;
	loading?: boolean;
	emptyMessage?: string;
}

/**
 * Generic action handler types
 */
export interface GenericActionHandlers<TData> {
	onView?: (item: TData) => void;
	onEdit?: (item: TData) => void;
	onDelete?: (item: TData) => void;
	onSelect?: (items: TData[]) => void;
	onBulkAction?: (action: string, items: TData[]) => void;
}

/**
 * Generic form configuration
 */
export interface GenericFormConfig<TData, TFormData = Partial<TData>> {
	initialData?: TFormData;
	onSubmit: (data: TFormData) => Promise<void> | void;
	onCancel?: () => void;
	validationSchema?: unknown; // Could be Zod schema
	loading?: boolean;
	mode: "create" | "edit" | "view";
}

/**
 * Generic modal configuration
 */
export interface GenericModalConfig<TData> {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	data?: TData;
	loading?: boolean;
	size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Generic search and filter configuration
 */
export interface GenericSearchConfig<TData> {
	searchTerm: string;
	onSearchChange: (term: string) => void;
	filters?: Record<string, unknown>;
	onFilterChange?: (key: string, value: unknown) => void;
	sortBy?: keyof TData;
	sortOrder?: "asc" | "desc";
	onSortChange?: (key: keyof TData, order: "asc" | "desc") => void;
	placeholder?: string;
}

/**
 * Generic statistics card configuration
 */
export interface GenericStatCard {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: ReactNode;
	trend?: {
		direction: "up" | "down" | "neutral";
		value: number;
		label: string;
	};
	color?: "default" | "success" | "warning" | "error" | "info";
	loading?: boolean;
}

/**
 * Generic async operation state
 */
export interface GenericAsyncState<TData, TError = Error> {
	data: TData | null;
	loading: boolean;
	error: TError | null;
	lastUpdated?: Date;
}

/**
 * Generic CRUD operations interface
 */
export interface GenericCRUDOperations<TData, TCreateInput, TUpdateInput> {
	create: (input: TCreateInput) => Promise<TData>;
	read: (id: string) => Promise<TData>;
	update: (id: string, input: TUpdateInput) => Promise<TData>;
	delete: (id: string) => Promise<void>;
	list: (params?: unknown) => Promise<TData[]>;
}

/**
 * Generic list view configuration
 */
export interface GenericListConfig<TData> {
	items: TData[];
	loading?: boolean;
	error?: string | null;
	searchConfig?: GenericSearchConfig<TData>;
	actionHandlers?: GenericActionHandlers<TData>;
	emptyState?: {
		title: string;
		description?: string;
		action?: {
			label: string;
			onClick: () => void;
		};
	};
	renderItem?: (item: TData, index: number) => ReactNode;
	renderActions?: (item: TData) => ReactNode;
}

/**
 * Generic pagination configuration
 */
export interface GenericPaginationConfig {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	showPageSizeSelector?: boolean;
	showPageInfo?: boolean;
}

/**
 * Vietnamese business-specific generic types
 */
export namespace VietnameseGenerics {
	/**
	 * Vietnamese currency amount with validation
	 */
	export type CurrencyAmount = {
		amount: number;
		currency: "VND";
		formatted: string;
		isValid: boolean;
	};

	/**
	 * Vietnamese phone number with validation
	 */
	export type PhoneNumber = {
		number: string;
		formatted: string;
		isValid: boolean;
		type: "mobile" | "landline" | "hotline";
	};

	/**
	 * Vietnamese date with locale formatting
	 */
	export type LocaleDate = {
		date: Date;
		isoString: string;
		vietnameseFormat: string;
		relativeFormat: string;
		isValid: boolean;
	};

	/**
	 * Generic Vietnamese business entity
	 */
	export interface VietnameseBusinessEntity {
		id: string;
		created_at: string;
		updated_at: string;
		vietnamese_display_name?: string;
		business_context?: string;
	}

	/**
	 * Vietnamese status with localized labels
	 */
	export interface VietnameseStatus<T extends string = string> {
		key: T;
		vietnamese_label: string;
		english_label: string;
		color: "default" | "success" | "warning" | "error" | "info";
		description?: string;
	}

	/**
	 * Vietnamese business workflow step
	 */
	export interface VietnameseWorkflowStep<TData> {
		stepId: string;
		vietnamese_name: string;
		english_name: string;
		data: TData;
		completed: boolean;
		required: boolean;
		estimated_duration_minutes: number;
		business_rules: string[];
	}
}

/**
 * Generic component props with Vietnamese support
 */
export interface GenericVietnameseComponentProps<TData> {
	data: TData;
	locale?: "vi-VN" | "en-US";
	currency?: "VND" | "USD";
	timezone?: "Asia/Ho_Chi_Minh";
	loading?: boolean;
	error?: string | null;
	className?: string;
	children?: ReactNode;
}

/**
 * Generic validation result
 */
export interface GenericValidationResult<TErrors = Record<string, string>> {
	isValid: boolean;
	errors: TErrors;
	warnings?: TErrors;
	vietnamese_error_messages?: TErrors;
}

/**
 * Generic event handler types
 */
export type GenericEventHandler<TData, TEvent = unknown> = (
	data: TData,
	event?: TEvent
) => void | Promise<void>;

/**
 * Generic callback types
 */
export type GenericCallback<TInput = void, TOutput = void> = (
	input: TInput
) => TOutput | Promise<TOutput>;

/**
 * Generic error boundary props
 */
export interface GenericErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode | ((error: Error) => ReactNode);
	onError?: (error: Error, errorInfo: unknown) => void;
	vietnamese_error_messages?: Record<string, string>;
}

/**
 * Generic loading wrapper props
 */
export interface GenericLoadingWrapperProps {
	loading: boolean;
	children: ReactNode;
	fallback?: ReactNode;
	skeleton?: ReactNode;
	vietnamese_loading_text?: string;
	minimum_display_time?: number;
}

/**
 * Generic responsive design breakpoints
 */
export type GenericBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Generic component size variants
 */
export type GenericSizeVariant = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Generic component color variants
 */
export type GenericColorVariant =
	| "default"
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "error"
	| "info";

/**
 * Generic theme configuration
 */
export interface GenericThemeConfig {
	mode: "light" | "dark" | "system";
	primaryColor: string;
	accentColor: string;
	vietnamese_theme_name?: string;
	business_branding?: {
		logo?: string;
		company_name?: string;
		vietnamese_slogan?: string;
	};
}

/**
 * Utility type for making properties optional except specified ones
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Utility type for making properties required except specified ones
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

/**
 * Utility type for extracting Vietnamese business data
 */
export type VietnameseBusinessData<T> = T & {
	vietnamese_metadata?: {
		display_name: string;
		business_context: string;
		locale_specific_data: Record<string, unknown>;
	};
};

/**
 * Generic hook return type
 */
export interface GenericHookReturn<TData, TActions = Record<string, unknown>> {
	data: TData;
	actions: TActions;
	state: {
		loading: boolean;
		error: string | null;
		lastUpdated?: Date;
	};
}

/**
 * Generic API response wrapper
 */
export interface GenericAPIResponse<TData> {
	success: boolean;
	data?: TData;
	error?: {
		code: string;
		message: string;
		vietnamese_message?: string;
		details?: unknown;
	};
	metadata?: {
		timestamp: string;
		request_id: string;
		vietnamese_locale_applied: boolean;
	};
}