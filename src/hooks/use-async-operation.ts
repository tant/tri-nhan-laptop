import { useCallback, useState } from "react";

export interface AsyncOperationOptions<T = unknown> {
	maxRetries?: number;
	retryDelay?: number;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
	autoRetry?: boolean;
}

export interface AsyncOperationState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
	retryCount: number;
	isRetrying: boolean;
}

export function useAsyncOperation<T = unknown>(
	asyncFunction: () => Promise<T>,
	options: AsyncOperationOptions<T> = {},
) {
	const {
		maxRetries = 3,
		retryDelay = 1000,
		onSuccess,
		onError,
		autoRetry = false,
	} = options;

	const [state, setState] = useState<AsyncOperationState<T>>({
		data: null,
		loading: false,
		error: null,
		retryCount: 0,
		isRetrying: false,
	});

	const execute = useCallback(
		async (forceRefresh = false) => {
			// Don't execute if already loading (prevent duplicate calls)
			if (state.loading && !forceRefresh) return;

			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
				isRetrying: prev.retryCount > 0,
			}));

			try {
				const result = await asyncFunction();
				setState((prev) => ({
					...prev,
					data: result,
					loading: false,
					error: null,
					isRetrying: false,
				}));

				onSuccess?.(result);
				return result;
			} catch (error) {
				const err = error as Error;
				setState((prev) => ({
					...prev,
					loading: false,
					error: err,
					isRetrying: false,
				}));

				onError?.(err);
				throw err;
			}
		},
		[asyncFunction, onSuccess, onError, state.loading],
	);

	const retry = useCallback(async () => {
		if (state.retryCount >= maxRetries) {
			return;
		}

		setState((prev) => ({
			...prev,
			retryCount: prev.retryCount + 1,
		}));

		// Exponential backoff with jitter
		const delay = Math.min(
			retryDelay * 2 ** state.retryCount + Math.random() * 1000,
			10000,
		);

		await new Promise((resolve) => setTimeout(resolve, delay));

		try {
			await execute(true);
		} catch (error) {
			// If auto-retry is enabled and we haven't hit max retries, try again
			if (autoRetry && state.retryCount < maxRetries - 1) {
				setTimeout(() => retry(), delay);
			}
		}
	}, [execute, maxRetries, retryDelay, state.retryCount, autoRetry]);

	const reset = useCallback(() => {
		setState({
			data: null,
			loading: false,
			error: null,
			retryCount: 0,
			isRetrying: false,
		});
	}, []);

	const canRetry = state.retryCount < maxRetries && !state.loading;

	return {
		...state,
		execute,
		retry,
		reset,
		canRetry,
	};
}

// Specialized hook for Supabase operations
export function useSupabaseOperation<T = unknown>(
	asyncFunction: () => Promise<T>,
	options: AsyncOperationOptions<T> = {},
) {
	return useAsyncOperation(asyncFunction, {
		maxRetries: 3,
		retryDelay: 1000,
		autoRetry: false,
		...options,
	});
}

// Hook for operations that should auto-retry on network errors
export function useNetworkOperation<T = unknown>(
	asyncFunction: () => Promise<T>,
	options: AsyncOperationOptions<T> = {},
) {
	return useAsyncOperation(asyncFunction, {
		maxRetries: 5,
		retryDelay: 2000,
		autoRetry: true,
		...options,
	});
}
