/**
 * @fileoverview Hook unit tests for use-repair-tickets-crud
 * Tests the core repair ticket CRUD operations with Vietnamese business validation
 *
 * @version 1.0.0
 * @since Phase 3.4.2
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useRepairTicketsCrud } from '@/hooks/use-repair-tickets-crud';
import { supabase } from '@/lib/supabase';
import { EnhancedSupabaseMock, VietnameseMockDataGenerator } from '../utils/supabase-mock';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock the validation hook
vi.mock('@/hooks/use-repair-validation', () => ({
  useRepairValidation: () => ({
    validateTicketData: vi.fn(() => ({ isValid: true, errors: [] })),
    getConditionDescription: vi.fn((condition: string, notes?: string) =>
      notes ? `${condition} - ${notes}` : condition
    ),
    inferRepairCategory: vi.fn((description: string) => {
      if (description.toLowerCase().includes('bàn phím')) return 'keyboard';
      if (description.toLowerCase().includes('màn hình')) return 'display';
      return 'diagnosis';
    }),
  }),
}));

describe('useRepairTicketsCrud', () => {
  let mockSupabase: EnhancedSupabaseMock;
  let mockSupabaseFrom: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = new EnhancedSupabaseMock();
    mockSupabaseFrom = vi.fn(() => mockSupabase.getQueryBuilder());
    (supabase.from as Mock) = mockSupabaseFrom;
  });

  describe('createRepairTicket', () => {
    it('should create repair ticket with complete Vietnamese data', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockTicketData = VietnameseMockDataGenerator.createNewRepairTicket({
        customerPhone: '0901234567',
        customerName: 'Nguyễn Văn An',
        customerDescription: 'Máy tính không khởi động được',
        issueDescription: 'Laptop Dell không bật nguồn, có thể do lỗi bo mạch chủ',
        priority: 'high',
        deviceBrand: 'Dell',
        deviceModel: 'Inspiron 15',
      });

      // Mock successful customer creation
      mockSupabase.mockQueryResponse('customers', []);
      mockSupabase.mockQueryResponse('customers', { phone: '0901234567' });

      // Mock device creation
      mockSupabase.mockQueryResponse('customer_devices', []);
      mockSupabase.mockQueryResponse('customer_devices', { id: 'device-123' });

      // Mock ticket creation
      mockSupabase.mockQueryResponse('repair_tickets', {
        id: 'ticket-123',
        ticket_code: 'LRP-2025-000001'
      });

      // Mock service notes creation
      mockSupabase.mockQueryResponse('service_notes', {});

      const createResult = await result.current.createRepairTicket(mockTicketData);

      expect(createResult.success).toBe(true);
      expect(createResult.ticketId).toBe('ticket-123');
      expect(createResult.ticketCode).toBe('LRP-2025-000001');
    });

    it('should handle customer creation for new customers', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockTicketData = VietnameseMockDataGenerator.createNewRepairTicket({
        customerPhone: '0987654321',
        customerName: 'Trần Thị Bình',
        customerDescription: 'Máy laptop bị nóng và chạy chậm',
      });

      // Mock customer not found (PGRST116 error)
      mockSupabase.mockError('customers', { code: 'PGRST116', message: 'No rows found' });

      // Mock successful customer creation
      mockSupabase.mockQueryResponse('customers', { phone: '0987654321' });

      // Mock other successful operations
      mockSupabase.mockQueryResponse('customer_devices', []);
      mockSupabase.mockQueryResponse('customer_devices', { id: 'device-456' });
      mockSupabase.mockQueryResponse('repair_tickets', {
        id: 'ticket-456',
        ticket_code: 'LRP-2025-000002'
      });

      const createResult = await result.current.createRepairTicket(mockTicketData);

      expect(createResult.success).toBe(true);
      expect(createResult.ticketId).toBe('ticket-456');
    });

    it('should validate required Vietnamese fields', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      // Mock validation failure
      const mockValidation = vi.fn(() => ({
        isValid: false,
        errors: ['customer_description là bắt buộc', 'priority là bắt buộc']
      }));

      vi.mocked(require('@/hooks/use-repair-validation').useRepairValidation).mockReturnValue({
        validateTicketData: mockValidation,
        getConditionDescription: vi.fn(),
        inferRepairCategory: vi.fn(),
      });

      const invalidTicketData = VietnameseMockDataGenerator.createNewRepairTicket({
        customerPhone: '0901234567',
        customerName: 'Test User',
        // Missing required fields
        customerDescription: '',
        issueDescription: '',
      });

      const createResult = await result.current.createRepairTicket(invalidTicketData);

      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain('Dữ liệu không hợp lệ');
      expect(createResult.error).toContain('customer_description là bắt buộc');
    });

    it('should handle database errors gracefully', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockTicketData = VietnameseMockDataGenerator.createNewRepairTicket();

      // Mock database error
      mockSupabase.mockError('customers', {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR'
      });

      const createResult = await result.current.createRepairTicket(mockTicketData);

      expect(createResult.success).toBe(false);
      expect(createResult.error).toContain('Lỗi kiểm tra khách hàng');
    });

    it('should infer repair category from Vietnamese issue description', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockTicketData = VietnameseMockDataGenerator.createNewRepairTicket({
        issueDescription: 'Bàn phím laptop không hoạt động',
        customerDescription: 'Không gõ được phím',
      });

      mockSupabase.mockQueryResponse('customers', { phone: mockTicketData.customerPhone });
      mockSupabase.mockQueryResponse('customer_devices', []);
      mockSupabase.mockQueryResponse('customer_devices', { id: 'device-123' });
      mockSupabase.mockQueryResponse('repair_tickets', {
        id: 'ticket-123',
        ticket_code: 'LRP-2025-000001'
      });

      await result.current.createRepairTicket(mockTicketData);

      // Check that the repair category was inferred correctly
      const insertCall = mockSupabase.getLastInsertCall('repair_tickets');
      expect(insertCall.repair_category).toBe('keyboard');
    });
  });

  describe('getRepairById', () => {
    it('should fetch repair ticket with Vietnamese customer details', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockTicketData = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'ticket-123',
        customer_phone: '0901234567',
        issue_description: 'Laptop không khởi động',
        customer_description: 'Máy tắt đột ngột',
      });

      const mockResponseData = {
        ...mockTicketData,
        customers: {
          full_name: 'Nguyễn Văn An',
          phone: '0901234567',
          email: 'nguyen.van.an@email.com',
        },
        customer_devices: {
          brand: 'Dell',
          model: 'Inspiron 15',
          serial_number: 'DL12345',
        },
        user_profiles: {
          full_name: 'Kỹ thuật viên Minh',
        },
      };

      mockSupabase.mockQueryResponse('repair_tickets', mockResponseData);

      const ticket = await result.current.getRepairById('ticket-123');

      expect(ticket).toBeTruthy();
      expect(ticket?.customer?.full_name).toBe('Nguyễn Văn An');
      expect(ticket?.customer?.phone).toBe('0901234567');
      expect(ticket?.device_info?.brand).toBe('Dell');
      expect(ticket?.technician?.full_name).toBe('Kỹ thuật viên Minh');
    });

    it('should return null for non-existent ticket', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      mockSupabase.mockError('repair_tickets', {
        code: 'PGRST116',
        message: 'No rows found'
      });

      const ticket = await result.current.getRepairById('non-existent');

      expect(ticket).toBeNull();
    });

    it('should handle database errors in Vietnamese', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      mockSupabase.mockError('repair_tickets', {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR'
      });

      await expect(result.current.getRepairById('ticket-123')).rejects.toThrow(
        'Không thể tải thông tin phiếu sửa chữa'
      );
    });
  });

  describe('updateRepair', () => {
    it('should update repair ticket successfully', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockUpdatedTicket = VietnameseMockDataGenerator.createMockRepairTicket({
        id: 'ticket-123',
        status: 'in_progress',
        estimated_cost: 500000,
      });

      mockSupabase.mockQueryResponse('repair_tickets', mockUpdatedTicket);

      const updates = {
        status: 'in_progress' as const,
        estimated_cost: 500000,
      };

      const updatedTicket = await result.current.updateRepair('ticket-123', updates);

      expect(updatedTicket).toBeTruthy();
      expect(updatedTicket.status).toBe('in_progress');
      expect(updatedTicket.estimated_cost).toBe(500000);
    });

    it('should handle update errors with Vietnamese messages', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      mockSupabase.mockError('repair_tickets', {
        message: 'Update failed',
        code: 'UPDATE_ERROR'
      });

      const updates = { status: 'completed' as const };

      await expect(result.current.updateRepair('ticket-123', updates)).rejects.toThrow(
        'Không thể cập nhật phiếu sửa chữa'
      );
    });
  });

  describe('saveDraft', () => {
    it('should save new draft with partial Vietnamese data', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const partialTicketData = {
        customerPhone: '0901234567',
        customerName: 'Nguyễn Văn An',
        customerDescription: 'Máy tính có vấn đề',
        issueDescription: 'Chưa xác định được nguyên nhân',
      };

      mockSupabase.mockQueryResponse('customers', { phone: '0901234567' });
      mockSupabase.mockQueryResponse('customer_devices', []);
      mockSupabase.mockQueryResponse('repair_tickets', {
        id: 'draft-123',
        ticket_code: 'LRP-2025-000001'
      });

      const draftResult = await result.current.saveDraft(partialTicketData);

      expect(draftResult.success).toBe(true);
      expect(draftResult.ticketId).toBe('draft-123');
    });

    it('should update existing draft', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const updatedDraftData = {
        customerDescription: 'Cập nhật mô tả chi tiết hơn',
        issueDescription: 'Có thể do lỗi ổ cứng',
      };

      mockSupabase.mockQueryResponse('repair_tickets', {});

      const draftResult = await result.current.saveDraft(updatedDraftData, 'draft-123');

      expect(draftResult.success).toBe(true);
      expect(draftResult.ticketId).toBe('draft-123');
    });
  });

  describe('loadDraft', () => {
    it('should load draft data in correct Vietnamese format', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      const mockDraftData = {
        id: 'draft-123',
        customer_phone: '0901234567',
        issue_description: 'Chưa hoàn thành chẩn đoán',
        customer_description: 'Máy tính khởi động chậm',
        priority: 'normal',
        estimated_cost: 300000,
        status: 'draft',
      };

      mockSupabase.mockQueryResponse('repair_tickets', mockDraftData);

      const draftData = await result.current.loadDraft('draft-123');

      expect(draftData).toBeTruthy();
      expect(draftData?.customerPhone).toBe('0901234567');
      expect(draftData?.issueDescription).toBe('Chưa hoàn thành chẩn đoán');
      expect(draftData?.customerDescription).toBe('Máy tính khởi động chậm');
      expect(draftData?.priority).toBe('normal');
    });

    it('should return null for non-existent draft', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      mockSupabase.mockError('repair_tickets', {
        code: 'PGRST116',
        message: 'No rows found'
      });

      const draftData = await result.current.loadDraft('non-existent');

      expect(draftData).toBeNull();
    });
  });

  describe('deleteTicket', () => {
    it('should soft delete ticket by updating status', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      mockSupabase.mockQueryResponse('repair_tickets', {});

      const deleteResult = await result.current.deleteTicket('ticket-123');

      expect(deleteResult).toBe(true);

      const updateCall = mockSupabase.getLastUpdateCall('repair_tickets');
      expect(updateCall).toEqual({ status: 'cancelled_by_customer' });
    });

    it('should handle delete errors gracefully', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      mockSupabase.mockError('repair_tickets', {
        message: 'Delete failed',
        code: 'DELETE_ERROR'
      });

      const deleteResult = await result.current.deleteTicket('ticket-123');

      expect(deleteResult).toBe(false);
    });
  });

  describe('loading and error states', () => {
    it('should manage loading state correctly', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      expect(result.current.loading).toBe(false);

      // Start async operation
      const ticketData = VietnameseMockDataGenerator.createNewRepairTicket();
      mockSupabase.mockQueryResponse('customers', { phone: ticketData.customerPhone });
      mockSupabase.mockQueryResponse('customer_devices', []);
      mockSupabase.mockQueryResponse('repair_tickets', { id: 'ticket-123' });

      const createPromise = result.current.createRepairTicket(ticketData);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await createPromise;
    });

    it('should set error state on failures', async () => {
      const { result } = renderHook(() => useRepairTicketsCrud());

      expect(result.current.error).toBeNull();

      mockSupabase.mockError('customers', {
        message: 'Database error',
        code: 'DB_ERROR'
      });

      const ticketData = VietnameseMockDataGenerator.createNewRepairTicket();
      await result.current.createRepairTicket(ticketData);

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('Database error');
    });
  });
});