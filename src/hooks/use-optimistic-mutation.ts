import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface OptimisticMutationOptions<T> {
	table: string;
	onSuccess?: (data: T) => void;
	onError?: (error: Error, rollbackData?: T) => void;
	onOptimisticUpdate?: (optimisticData: T) => void;
	onRollback?: (rollbackData: T) => void;
	generateOptimisticId?: () => string;
}

export interface OptimisticMutationState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
	isOptimistic: boolean;
	optimisticId: string | null;
}

export function useOptimisticMutation<T = any>(
	options: OptimisticMutationOptions<T>
) {
	const {
		table,
		onSuccess,
		onError,
		onOptimisticUpdate,
		onRollback,
		generateOptimisticId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
	} = options;

	const [state, setState] = useState<OptimisticMutationState<T>>({
		data: null,
		loading: false,
		error: null,
		isOptimistic: false,
		optimisticId: null,
	});

	const rollbackRef = useRef<T | null>(null);

	// Create operation with optimistic update
	const create = useCallback(async (data: Partial<T>) => {
		const optimisticId = generateOptimisticId();
		const optimisticData = {
			...data,
			id: optimisticId,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		} as T;

		// Apply optimistic update immediately
		setState({
			data: optimisticData,
			loading: true,
			error: null,
			isOptimistic: true,
			optimisticId,
		});

		onOptimisticUpdate?.(optimisticData);

		try {
			const { data: result, error } = await supabase
				.from(table)
				.insert(data)
				.select()
				.single();

			if (error) throw error;

			// Replace optimistic data with real data
			setState({
				data: result,
				loading: false,
				error: null,
				isOptimistic: false,
				optimisticId: null,
			});

			onSuccess?.(result);
			return result;
		} catch (error) {
			const err = error as Error;

			// Rollback optimistic update
			setState({
				data: null,
				loading: false,
				error: err,
				isOptimistic: false,
				optimisticId: null,
			});

			onRollback?.(optimisticData);
			onError?.(err, optimisticData);
			throw err;
		}
	}, [table, generateOptimisticId, onOptimisticUpdate, onSuccess, onRollback, onError]);

	// Update operation with optimistic update
	const update = useCallback(async (id: string, updates: Partial<T>, currentData: T) => {
		// Store current data for rollback
		rollbackRef.current = currentData;

		const optimisticData = {
			...currentData,
			...updates,
			updated_at: new Date().toISOString(),
		} as T;

		// Apply optimistic update immediately
		setState({
			data: optimisticData,
			loading: true,
			error: null,
			isOptimistic: true,
			optimisticId: id,
		});

		onOptimisticUpdate?.(optimisticData);

		try {
			const { data: result, error } = await supabase
				.from(table)
				.update(updates)
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;

			// Replace optimistic data with real data
			setState({
				data: result,
				loading: false,
				error: null,
				isOptimistic: false,
				optimisticId: null,
			});

			onSuccess?.(result);
			return result;
		} catch (error) {
			const err = error as Error;

			// Rollback to previous data
			setState({
				data: rollbackRef.current,
				loading: false,
				error: err,
				isOptimistic: false,
				optimisticId: null,
			});

			if (rollbackRef.current) {
				onRollback?.(rollbackRef.current);
			}
			onError?.(err, rollbackRef.current || undefined);
			throw err;
		}
	}, [table, onOptimisticUpdate, onSuccess, onRollback, onError]);

	// Delete operation with optimistic update
	const deleteRecord = useCallback(async (id: string, currentData: T) => {
		// Store current data for rollback
		rollbackRef.current = currentData;

		// Apply optimistic delete immediately (remove from UI)
		setState({
			data: null,
			loading: true,
			error: null,
			isOptimistic: true,
			optimisticId: id,
		});

		onOptimisticUpdate?.(null as any);

		try {
			const { error } = await supabase
				.from(table)
				.delete()
				.eq('id', id);

			if (error) throw error;

			// Confirm deletion
			setState({
				data: null,
				loading: false,
				error: null,
				isOptimistic: false,
				optimisticId: null,
			});

			onSuccess?.(null as any);
			return true;
		} catch (error) {
			const err = error as Error;

			// Rollback to previous data
			setState({
				data: rollbackRef.current,
				loading: false,
				error: err,
				isOptimistic: false,
				optimisticId: null,
			});

			if (rollbackRef.current) {
				onRollback?.(rollbackRef.current);
			}
			onError?.(err, rollbackRef.current || undefined);
			throw err;
		}
	}, [table, onOptimisticUpdate, onSuccess, onRollback, onError]);

	const reset = useCallback(() => {
		setState({
			data: null,
			loading: false,
			error: null,
			isOptimistic: false,
			optimisticId: null,
		});
		rollbackRef.current = null;
	}, []);

	return {
		...state,
		create,
		update,
		delete: deleteRecord,
		reset,
	};
}

// Specialized hook for list operations with optimistic updates
export function useOptimisticList<T extends { id: string }>(
	initialData: T[] = []
) {
	const [items, setItems] = useState<T[]>(initialData);
	const [optimisticItems, setOptimisticItems] = useState<Set<string>>(new Set());

	const addOptimisticItem = useCallback((item: T) => {
		setItems(prev => [item, ...prev]);
		setOptimisticItems(prev => new Set([...prev, item.id]));
	}, []);

	const updateOptimisticItem = useCallback((id: string, updates: Partial<T>) => {
		setItems(prev => prev.map(item =>
			item.id === id ? { ...item, ...updates } : item
		));
		setOptimisticItems(prev => new Set([...prev, id]));
	}, []);

	const removeOptimisticItem = useCallback((id: string) => {
		setItems(prev => prev.filter(item => item.id !== id));
		setOptimisticItems(prev => {
			const newSet = new Set(prev);
			newSet.delete(id);
			return newSet;
		});
	}, []);

	const confirmOptimisticItem = useCallback((tempId: string, realItem: T) => {
		setItems(prev => prev.map(item =>
			item.id === tempId ? realItem : item
		));
		setOptimisticItems(prev => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});
	}, []);

	const rollbackOptimisticItem = useCallback((id: string) => {
		setItems(prev => prev.filter(item => item.id !== id));
		setOptimisticItems(prev => {
			const newSet = new Set(prev);
			newSet.delete(id);
			return newSet;
		});
	}, []);

	const isOptimistic = useCallback((id: string) => {
		return optimisticItems.has(id);
	}, [optimisticItems]);

	const setData = useCallback((newData: T[]) => {
		setItems(newData);
		setOptimisticItems(new Set());
	}, []);

	return {
		items,
		setData,
		addOptimisticItem,
		updateOptimisticItem,
		removeOptimisticItem,
		confirmOptimisticItem,
		rollbackOptimisticItem,
		isOptimistic,
		optimisticItemsCount: optimisticItems.size,
	};
}