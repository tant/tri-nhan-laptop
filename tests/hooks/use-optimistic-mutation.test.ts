/**
 * @fileoverview Hook unit tests for use-optimistic-mutation
 * Tests optimistic UI updates with rollback functionality for Vietnamese business data
 *
 * @version 1.0.0
 * @since Phase 3.4.2
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useOptimisticMutation, useOptimisticList } from '@/hooks/use-optimistic-mutation';
import { supabase } from '@/lib/supabase';
import { EnhancedSupabaseMock, VietnameseMockDataGenerator } from '../utils/supabase-mock';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock data interfaces for testing
interface TestRepairTicket {
  id: string;
  customer_phone: string;
  issue_description: string;
  customer_description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TestCustomer {
  id: string;
  phone: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

describe('useOptimisticMutation', () => {
  let mockSupabase: EnhancedSupabaseMock;
  let mockSupabaseFrom: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = new EnhancedSupabaseMock();
    mockSupabaseFrom = vi.fn(() => mockSupabase.getQueryBuilder());
    (supabase.from as Mock) = mockSupabaseFrom;
  });

  describe('create operation', () => {
    it('should perform optimistic create for Vietnamese repair ticket', async () => {
      const onOptimisticUpdate = vi.fn();
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticMutation<TestRepairTicket>({
          table: 'repair_tickets',
          onOptimisticUpdate,
          onSuccess,
          onError,
        })
      );

      const newTicketData = {
        customer_phone: '0901234567',
        issue_description: 'Laptop Dell không khởi động được',
        customer_description: 'Máy tính tắt đột ngột và không bật lại',
        status: 'device_received',
      };

      // Mock successful API response
      const mockCreatedTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'ticket-123',
        ...newTicketData,
      });

      mockSupabase.mockQueryResponse('repair_tickets', mockCreatedTicket);

      let createPromise: Promise<any>;
      act(() => {
        createPromise = result.current.create(newTicketData);
      });

      // Check optimistic state immediately
      expect(result.current.isOptimistic).toBe(true);
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeTruthy();
      expect(result.current.data?.customer_phone).toBe('0901234567');
      expect(result.current.data?.issue_description).toBe('Laptop Dell không khởi động được');

      // Check optimistic update callback was called
      expect(onOptimisticUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_phone: '0901234567',
          issue_description: 'Laptop Dell không khởi động được',
        })
      );

      // Wait for API completion
      await act(async () => {
        await createPromise;
      });

      // Check final state
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.data?.id).toBe('ticket-123');
      expect(result.current.error).toBeNull();

      expect(onSuccess).toHaveBeenCalledWith(mockCreatedTicket);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should rollback optimistic create on API failure', async () => {
      const onOptimisticUpdate = vi.fn();
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onRollback = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticMutation<TestRepairTicket>({
          table: 'repair_tickets',
          onOptimisticUpdate,
          onSuccess,
          onError,
          onRollback,
        })
      );

      const newTicketData = {
        customer_phone: '0901234567',
        issue_description: 'Test ticket',
        customer_description: 'Test description',
        status: 'device_received',
      };

      // Mock API error
      mockSupabase.mockError('repair_tickets', {
        message: 'Lỗi kết nối cơ sở dữ liệu',
        code: 'CONNECTION_ERROR'
      });

      let createPromise: Promise<any>;
      act(() => {
        createPromise = result.current.create(newTicketData);
      });

      // Check optimistic state
      expect(result.current.isOptimistic).toBe(true);
      expect(result.current.data).toBeTruthy();

      // Wait for API failure
      await act(async () => {
        try {
          await createPromise;
        } catch (error) {
          // Expected to throw
        }
      });

      // Check rollback state
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error?.message).toBe('Lỗi kết nối cơ sở dữ liệu');

      expect(onRollback).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining(newTicketData)
      );
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('update operation', () => {
    it('should perform optimistic update for Vietnamese customer data', async () => {
      const onOptimisticUpdate = vi.fn();
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticMutation<TestCustomer>({
          table: 'customers',
          onOptimisticUpdate,
          onSuccess,
        })
      );

      const currentCustomer: TestCustomer = {
        id: 'customer-123',
        phone: '0901234567',
        full_name: 'Nguyễn Văn An',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const updates = {
        full_name: 'Nguyễn Văn An - Cập nhật',
        phone: '0912345678',
      };

      const mockUpdatedCustomer = {
        ...currentCustomer,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      mockSupabase.mockQueryResponse('customers', mockUpdatedCustomer);

      let updatePromise: Promise<any>;
      act(() => {
        updatePromise = result.current.update('customer-123', updates, currentCustomer);
      });

      // Check optimistic state
      expect(result.current.isOptimistic).toBe(true);
      expect(result.current.loading).toBe(true);
      expect(result.current.data?.full_name).toBe('Nguyễn Văn An - Cập nhật');
      expect(result.current.data?.phone).toBe('0912345678');

      expect(onOptimisticUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Nguyễn Văn An - Cập nhật',
          phone: '0912345678',
        })
      );

      // Wait for API completion
      await act(async () => {
        await updatePromise;
      });

      // Check final state
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockUpdatedCustomer);

      expect(onSuccess).toHaveBeenCalledWith(mockUpdatedCustomer);
    });

    it('should rollback optimistic update on failure', async () => {
      const onRollback = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticMutation<TestCustomer>({
          table: 'customers',
          onRollback,
          onError,
        })
      );

      const currentCustomer: TestCustomer = {
        id: 'customer-123',
        phone: '0901234567',
        full_name: 'Nguyễn Văn An',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const updates = {
        phone: '0912345678', // This will fail
      };

      // Mock API error
      mockSupabase.mockError('customers', {
        message: 'Số điện thoại đã tồn tại',
        code: 'UNIQUE_VIOLATION'
      });

      let updatePromise: Promise<any>;
      act(() => {
        updatePromise = result.current.update('customer-123', updates, currentCustomer);
      });

      // Check optimistic state
      expect(result.current.data?.phone).toBe('0912345678');

      // Wait for API failure
      await act(async () => {
        try {
          await updatePromise;
        } catch (error) {
          // Expected to throw
        }
      });

      // Check rollback state
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.data).toEqual(currentCustomer);
      expect(result.current.error?.message).toBe('Số điện thoại đã tồn tại');

      expect(onRollback).toHaveBeenCalledWith(currentCustomer);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), currentCustomer);
    });
  });

  describe('delete operation', () => {
    it('should perform optimistic delete for repair ticket', async () => {
      const onOptimisticUpdate = vi.fn();
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticMutation<TestRepairTicket>({
          table: 'repair_tickets',
          onOptimisticUpdate,
          onSuccess,
        })
      );

      const currentTicket: TestRepairTicket = {
        id: 'ticket-123',
        customer_phone: '0901234567',
        issue_description: 'Test issue',
        customer_description: 'Test description',
        status: 'completed',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.mockQueryResponse('repair_tickets', {});

      let deletePromise: Promise<any>;
      act(() => {
        deletePromise = result.current.delete('ticket-123', currentTicket);
      });

      // Check optimistic state (item removed)
      expect(result.current.isOptimistic).toBe(true);
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();

      expect(onOptimisticUpdate).toHaveBeenCalledWith(null);

      // Wait for API completion
      await act(async () => {
        await deletePromise;
      });

      // Check final state
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();

      expect(onSuccess).toHaveBeenCalledWith(null);
    });

    it('should rollback optimistic delete on failure', async () => {
      const onRollback = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticMutation<TestRepairTicket>({
          table: 'repair_tickets',
          onRollback,
          onError,
        })
      );

      const currentTicket: TestRepairTicket = {
        id: 'ticket-123',
        customer_phone: '0901234567',
        issue_description: 'Test issue',
        customer_description: 'Test description',
        status: 'in_progress',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      // Mock delete error
      mockSupabase.mockError('repair_tickets', {
        message: 'Không thể xóa phiếu đang thực hiện',
        code: 'DELETE_CONSTRAINT'
      });

      let deletePromise: Promise<any>;
      act(() => {
        deletePromise = result.current.delete('ticket-123', currentTicket);
      });

      // Check optimistic state (item removed)
      expect(result.current.data).toBeNull();

      // Wait for API failure
      await act(async () => {
        try {
          await deletePromise;
        } catch (error) {
          // Expected to throw
        }
      });

      // Check rollback state (item restored)
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.data).toEqual(currentTicket);
      expect(result.current.error?.message).toBe('Không thể xóa phiếu đang thực hiện');

      expect(onRollback).toHaveBeenCalledWith(currentTicket);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), currentTicket);
    });
  });

  describe('reset functionality', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() =>
        useOptimisticMutation<TestRepairTicket>({
          table: 'repair_tickets',
        })
      );

      // Simulate some state changes
      act(() => {
        result.current.create({
          customer_phone: '0901234567',
          issue_description: 'Test',
          customer_description: 'Test',
          status: 'device_received',
        });
      });

      // State should be modified
      expect(result.current.data).toBeTruthy();
      expect(result.current.isOptimistic).toBe(true);

      // Reset state
      act(() => {
        result.current.reset();
      });

      // Check reset state
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.optimisticId).toBeNull();
    });
  });
});

describe('useOptimisticList', () => {
  describe('list operations', () => {
    it('should manage optimistic list operations for Vietnamese repair tickets', () => {
      const initialTickets: TestRepairTicket[] = [
        VietnameseMockDataGenerator.createMockRepairTicket({
          id: 'ticket-1',
          customer_phone: '0901234567',
          issue_description: 'Sửa bàn phím',
          status: 'completed',
        }),
        VietnameseMockDataGenerator.createMockRepairTicket({
          id: 'ticket-2',
          customer_phone: '0912345678',
          issue_description: 'Thay màn hình',
          status: 'in_progress',
        }),
      ];

      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>(initialTickets)
      );

      expect(result.current.items).toHaveLength(2);
      expect(result.current.optimisticItemsCount).toBe(0);
    });

    it('should add optimistic item to beginning of list', () => {
      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>([])
      );

      const newTicket: TestRepairTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'temp-123',
        customer_phone: '0901234567',
        issue_description: 'Phiếu mới tạm thời',
        status: 'device_received',
      });

      act(() => {
        result.current.addOptimisticItem(newTicket);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual(newTicket);
      expect(result.current.isOptimistic('temp-123')).toBe(true);
      expect(result.current.optimisticItemsCount).toBe(1);
    });

    it('should update optimistic item in list', () => {
      const initialTickets: TestRepairTicket[] = [
        VietnameseMockDataGenerator.createMockRepairTicket({
          id: 'ticket-1',
          status: 'device_received',
        }),
      ];

      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>(initialTickets)
      );

      act(() => {
        result.current.updateOptimisticItem('ticket-1', {
          status: 'diagnosis_complete',
          issue_description: 'Cập nhật chẩn đoán: Lỗi bo mạch chủ',
        });
      });

      expect(result.current.items[0].status).toBe('diagnosis_complete');
      expect(result.current.items[0].issue_description).toBe('Cập nhật chẩn đoán: Lỗi bo mạch chủ');
      expect(result.current.isOptimistic('ticket-1')).toBe(true);
    });

    it('should remove optimistic item from list', () => {
      const initialTickets: TestRepairTicket[] = [
        VietnameseMockDataGenerator.createMockRepairTicket({ id: 'ticket-1' }),
        VietnameseMockDataGenerator.createMockRepairTicket({ id: 'ticket-2' }),
      ];

      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>(initialTickets)
      );

      act(() => {
        result.current.removeOptimisticItem('ticket-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('ticket-2');
      expect(result.current.isOptimistic('ticket-1')).toBe(false);
    });

    it('should confirm optimistic item with real data', () => {
      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>([])
      );

      const tempTicket: TestRepairTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'temp-123',
        customer_phone: '0901234567',
        issue_description: 'Phiếu tạm thời',
      });

      const realTicket: TestRepairTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'ticket-456',
        customer_phone: '0901234567',
        issue_description: 'Phiếu tạm thời',
        ticket_code: 'LRP-2025-000456',
      });

      act(() => {
        result.current.addOptimisticItem(tempTicket);
      });

      expect(result.current.isOptimistic('temp-123')).toBe(true);

      act(() => {
        result.current.confirmOptimisticItem('temp-123', realTicket);
      });

      expect(result.current.items[0]).toEqual(realTicket);
      expect(result.current.isOptimistic('temp-123')).toBe(false);
      expect(result.current.isOptimistic('ticket-456')).toBe(false);
    });

    it('should rollback optimistic item', () => {
      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>([])
      );

      const tempTicket: TestRepairTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'temp-123',
        customer_phone: '0901234567',
        issue_description: 'Phiếu sẽ bị rollback',
      });

      act(() => {
        result.current.addOptimisticItem(tempTicket);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.rollbackOptimisticItem('temp-123');
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.isOptimistic('temp-123')).toBe(false);
    });

    it('should set new data and clear optimistic state', () => {
      const { result } = renderHook(() =>
        useOptimisticList<TestRepairTicket>([])
      );

      // Add some optimistic items first
      const tempTicket: TestRepairTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'temp-123',
      });

      act(() => {
        result.current.addOptimisticItem(tempTicket);
      });

      expect(result.current.optimisticItemsCount).toBe(1);

      // Set new data
      const newData: TestRepairTicket[] = [
        VietnameseMockDataGenerator.createMockRepairTicket({ id: 'ticket-1' }),
        VietnameseMockDataGenerator.createMockRepairTicket({ id: 'ticket-2' }),
      ];

      act(() => {
        result.current.setData(newData);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items).toEqual(newData);
      expect(result.current.optimisticItemsCount).toBe(0);
    });
  });
});