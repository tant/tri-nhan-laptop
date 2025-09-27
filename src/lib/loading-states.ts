/**
 * Loading State Management Utilities
 * Standardized loading state patterns for the Vietnamese Laptop Repair Shop system
 */

import { useCallback, useState } from "react";
import { type ErrorInfo, processError } from "./error-handling";

export interface LoadingState {
	isLoading: boolean;
	error: ErrorInfo | null;
	lastUpdated?: Date;
}

export interface AsyncOperationState<T> extends LoadingState {
	data: T | null;
}

export interface AsyncOperation<T> {
	execute: () => Promise<T>;
	loading: boolean;
	error: ErrorInfo | null;
	data: T | null;
	reset: () => void;
	retry: () => Promise<void>;
}

/**
 * Hook for managing simple loading states
 */
export function useLoadingState(initialLoading = false): [
	LoadingState,
	{
		setLoading: (loading: boolean) => void;
		setError: (error: unknown) => void;
		clearError: () => void;
		withLoading: <T>(operation: () => Promise<T>) => Promise<T>;
	},
] {
	const [state, setState] = useState<LoadingState>({
		isLoading: initialLoading,
		error: null,
		lastUpdated: undefined,
	});

	const setLoading = useCallback((loading: boolean) => {
		setState((prev) => ({
			...prev,
			isLoading: loading,
			lastUpdated: new Date(),
		}));
	}, []);

	const setError = useCallback((error: unknown) => {
		const processedError = processError(error);
		setState((prev) => ({
			...prev,
			isLoading: false,
			error: processedError.error,
			lastUpdated: new Date(),
		}));
	}, []);

	const clearError = useCallback(() => {
		setState((prev) => ({
			...prev,
			error: null,
			lastUpdated: new Date(),
		}));
	}, []);

	const withLoading = useCallback(
		async <T>(operation: () => Promise<T>): Promise<T> => {
			try {
				setLoading(true);
				clearError();
				const result = await operation();
				setLoading(false);
				return result;
			} catch (error) {
				setError(error);
				throw error;
			}
		},
		[setLoading, setError, clearError],
	);

	return [
		state,
		{
			setLoading,
			setError,
			clearError,
			withLoading,
		},
	];
}

/**
 * Hook for managing data fetching with loading states
 */
export function useAsyncData<T>(initialData: T | null = null): [
	AsyncOperationState<T>,
	{
		setData: (data: T | null) => void;
		setLoading: (loading: boolean) => void;
		setError: (error: unknown) => void;
		clearError: () => void;
		refresh: (operation: () => Promise<T>) => Promise<void>;
		mutate: (operation: () => Promise<T>) => Promise<void>;
	},
] {
	const [state, setState] = useState<AsyncOperationState<T>>({
		data: initialData,
		isLoading: false,
		error: null,
		lastUpdated: undefined,
	});

	const setData = useCallback((data: T | null) => {
		setState((prev) => ({
			...prev,
			data,
			error: null,
			lastUpdated: new Date(),
		}));
	}, []);

	const setLoading = useCallback((loading: boolean) => {
		setState((prev) => ({
			...prev,
			isLoading: loading,
			lastUpdated: new Date(),
		}));
	}, []);

	const setError = useCallback((error: unknown) => {
		const processedError = processError(error);
		setState((prev) => ({
			...prev,
			isLoading: false,
			error: processedError.error,
			lastUpdated: new Date(),
		}));
	}, []);

	const clearError = useCallback(() => {
		setState((prev) => ({
			...prev,
			error: null,
			lastUpdated: new Date(),
		}));
	}, []);

	const refresh = useCallback(
		async (operation: () => Promise<T>) => {
			try {
				setLoading(true);
				clearError();
				const result = await operation();
				setData(result);
				setLoading(false);
			} catch (error) {
				setError(error);
			}
		},
		[setLoading, setData, setError, clearError],
	);

	const mutate = useCallback(
		async (operation: () => Promise<T>) => {
			try {
				setLoading(true);
				clearError();
				const result = await operation();
				setData(result);
				setLoading(false);
			} catch (error) {
				setError(error);
				throw error; // Re-throw for caller handling
			}
		},
		[setLoading, setData, setError, clearError],
	);

	return [
		state,
		{
			setData,
			setLoading,
			setError,
			clearError,
			refresh,
			mutate,
		},
	];
}

/**
 * Hook for managing async operations with built-in retry logic
 */
export function useAsyncOperation<T>(
	operation: () => Promise<T>,
	dependencies: unknown[] = [],
): AsyncOperation<T> {
	const [state, setState] = useState<AsyncOperationState<T>>({
		data: null,
		isLoading: false,
		error: null,
		lastUpdated: undefined,
	});

	const execute = useCallback(async (): Promise<T> => {
		try {
			setState((prev) => ({
				...prev,
				isLoading: true,
				error: null,
				lastUpdated: new Date(),
			}));

			const result = await operation();

			setState((prev) => ({
				...prev,
				data: result,
				isLoading: false,
				lastUpdated: new Date(),
			}));

			return result;
		} catch (error) {
			const processedError = processError(error);
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: processedError.error,
				lastUpdated: new Date(),
			}));
			throw error;
		}
	}, [operation, ...dependencies]);

	const reset = useCallback(() => {
		setState({
			data: null,
			isLoading: false,
			error: null,
			lastUpdated: undefined,
		});
	}, []);

	const retry = useCallback(async () => {
		await execute();
	}, [execute]);

	return {
		execute,
		loading: state.isLoading,
		error: state.error,
		data: state.data,
		reset,
		retry,
	};
}

/**
 * Hook for managing multiple concurrent loading states
 */
export function useMultipleLoadingStates<T extends Record<string, unknown>>(
	keys: (keyof T)[],
): [
	Record<keyof T, boolean>,
	{
		setLoading: (key: keyof T, loading: boolean) => void;
		setAllLoading: (loading: boolean) => void;
		isAnyLoading: () => boolean;
		isAllLoading: () => boolean;
	},
] {
	const [loadingStates, setLoadingStates] = useState<Record<keyof T, boolean>>(
		keys.reduce(
			(acc, key) => ({ ...acc, [key]: false }),
			{} as Record<keyof T, boolean>,
		),
	);

	const setLoading = useCallback((key: keyof T, loading: boolean) => {
		setLoadingStates((prev) => ({
			...prev,
			[key]: loading,
		}));
	}, []);

	const setAllLoading = useCallback(
		(loading: boolean) => {
			setLoadingStates((prev) =>
				keys.reduce(
					(acc, key) => ({ ...acc, [key]: loading }),
					{} as Record<keyof T, boolean>,
				),
			);
		},
		[keys],
	);

	const isAnyLoading = useCallback(() => {
		return Object.values(loadingStates).some((loading) => loading);
	}, [loadingStates]);

	const isAllLoading = useCallback(() => {
		return Object.values(loadingStates).every((loading) => loading);
	}, [loadingStates]);

	return [
		loadingStates,
		{
			setLoading,
			setAllLoading,
			isAnyLoading,
			isAllLoading,
		},
	];
}

/**
 * Hook for debounced loading operations
 */
export function useDebouncedAsyncOperation<T>(
	operation: () => Promise<T>,
	delay = 300,
	dependencies: unknown[] = [],
): {
	execute: () => void;
	loading: boolean;
	error: ErrorInfo | null;
	data: T | null;
	cancel: () => void;
} {
	const [state, setState] = useState<AsyncOperationState<T>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const cancel = useCallback(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			setTimeoutId(null);
			setState((prev) => ({ ...prev, isLoading: false }));
		}
	}, [timeoutId]);

	const execute = useCallback(() => {
		// Cancel existing timeout
		cancel();

		// Set loading immediately
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		// Set new timeout
		const newTimeoutId = setTimeout(async () => {
			try {
				const result = await operation();
				setState((prev) => ({
					...prev,
					data: result,
					isLoading: false,
				}));
			} catch (error) {
				const processedError = processError(error);
				setState((prev) => ({
					...prev,
					isLoading: false,
					error: processedError.error,
				}));
			}
			setTimeoutId(null);
		}, delay);

		setTimeoutId(newTimeoutId);
	}, [operation, delay, cancel, ...dependencies]);

	// Cleanup on unmount
	useState(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	return {
		execute,
		loading: state.isLoading,
		error: state.error,
		data: state.data,
		cancel,
	};
}

/**
 * Create a standardized loading wrapper for any async function
 */
export function createAsyncWrapper<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => Promise<TReturn>,
	context?: string,
) {
	return async (
		...args: TArgs
	): Promise<{ data?: TReturn; error?: ErrorInfo }> => {
		try {
			const data = await fn(...args);
			return { data };
		} catch (error) {
			const processedError = processError(error, context);
			return { error: processedError.error };
		}
	};
}

/**
 * Loading state utilities for common UI patterns
 */
export const LoadingUtils = {
	/**
	 * Get loading text based on operation type
	 */
	getLoadingText: (operation: string): string => {
		const operationMap: Record<string, string> = {
			fetch: "Đang tải dữ liệu...",
			save: "Đang lưu...",
			delete: "Đang xóa...",
			update: "Đang cập nhật...",
			create: "Đang tạo...",
			search: "Đang tìm kiếm...",
			upload: "Đang tải lên...",
			download: "Đang tải xuống...",
			process: "Đang xử lý...",
			validate: "Đang kiểm tra...",
		};

		return operationMap[operation] || "Đang xử lý...";
	},

	/**
	 * Get appropriate skeleton count based on expected data size
	 */
	getSkeletonCount: (dataType: string): number => {
		const countMap: Record<string, number> = {
			table: 5,
			list: 8,
			card: 6,
			form: 4,
			detail: 1,
		};

		return countMap[dataType] || 3;
	},

	/**
	 * Check if operation should show loading indicator based on duration
	 */
	shouldShowLoading: (startTime: Date, minDuration = 200): boolean => {
		return Date.now() - startTime.getTime() > minDuration;
	},
};
