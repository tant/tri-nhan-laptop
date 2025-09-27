/**
 * @fileoverview Hook unit tests for use-customer-crud
 * Tests customer CRUD operations with Vietnamese phone validation and business logic
 *
 * @version 1.0.0
 * @since Phase 3.4.2
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useCustomerCrud } from '@/hooks/use-customer-crud';
import { supabase } from '@/lib/supabase';
import { EnhancedSupabaseMock, VietnameseMockDataGenerator } from '../utils/supabase-mock';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock phone validation
vi.mock('@/lib/validation/phone-vietnamese', () => ({
  normalizePhoneNumber: vi.fn((phone: string) => phone.replace(/\D/g, '')),
  toStorageFormat: vi.fn((phone: string) => phone.replace(/\D/g, '')),
  validateVietnamesePhone: vi.fn((phone: string) => ({
    isValid: /^(03|05|07|08|09)[0-9]{8}$/.test(phone.replace(/\D/g, '')),
    error: /^(03|05|07|08|09)[0-9]{8}$/.test(phone.replace(/\D/g, ''))
      ? null
      : 'Số điện thoại không đúng định dạng Việt Nam',
  })),
}));

// Mock customer search hook
vi.mock('@/hooks/use-customer-search', () => ({
  useCustomerSearch: () => ({
    findCustomerByPhone: vi.fn(),
  }),
}));

describe('useCustomerCrud', () => {
  let mockSupabase: EnhancedSupabaseMock;
  let mockSupabaseFrom: Mock;
  let mockFindCustomerByPhone: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = new EnhancedSupabaseMock();
    mockSupabaseFrom = vi.fn(() => mockSupabase.getQueryBuilder());
    (supabase.from as Mock) = mockSupabaseFrom;

    mockFindCustomerByPhone = vi.fn();
    vi.mocked(require('@/hooks/use-customer-search').useCustomerSearch).mockReturnValue({
      findCustomerByPhone: mockFindCustomerByPhone,
    });
  });

  describe('createCustomer', () => {
    it('should create customer with valid Vietnamese phone number', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const newCustomerData = {
        phone: '0901234567',
        full_name: 'Nguyễn Văn An',
        address: 'Số 123, Đường Nguyễn Trãi, Quận 1, TP.HCM',
        notes: 'Khách hàng VIP',
      };

      // Mock phone validation success
      mockFindCustomerByPhone.mockResolvedValue(null); // No existing customer

      // Mock successful customer creation
      const mockCreatedCustomer = VietnameseMockDataGenerator.createMockCustomer({
        ...newCustomerData,
        phone: '0901234567',
      });

      mockSupabase.mockQueryResponse('customers', mockCreatedCustomer);

      const createdCustomer = await result.current.createCustomer(newCustomerData);

      expect(createdCustomer).toBeTruthy();
      expect(createdCustomer?.phone).toBe('0901234567');
      expect(createdCustomer?.fullName).toBe('Nguyễn Văn An');
      expect(createdCustomer?.totalRepairs).toBe(0);
      expect(createdCustomer?.activeRepairs).toBe(0);
    });

    it('should reject invalid Vietnamese phone numbers', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const invalidCustomerData = {
        phone: '123456789', // Invalid Vietnamese phone
        full_name: 'Test User',
        address: 'Test Address',
      };

      // Mock phone validation failure
      vi.mocked(require('@/lib/validation/phone-vietnamese').validateVietnamesePhone)
        .mockReturnValue({
          isValid: false,
          error: 'Số điện thoại không đúng định dạng Việt Nam',
        });

      const createdCustomer = await result.current.createCustomer(invalidCustomerData);

      expect(createdCustomer).toBeNull();
      expect(result.current.error?.message).toContain('Số điện thoại không đúng định dạng Việt Nam');
    });

    it('should prevent duplicate phone numbers', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const newCustomerData = {
        phone: '0901234567',
        full_name: 'Nguyễn Văn An',
        address: 'Test Address',
      };

      // Mock existing customer found
      const existingCustomer = VietnameseMockDataGenerator.createMockCustomer({
        phone: '0901234567',
        full_name: 'Existing Customer',
      });

      mockFindCustomerByPhone.mockResolvedValue(existingCustomer);

      const createdCustomer = await result.current.createCustomer(newCustomerData);

      expect(createdCustomer).toBeNull();
      expect(result.current.error?.message).toContain('Số điện thoại này đã được sử dụng');
    });

    it('should handle database creation errors', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const newCustomerData = {
        phone: '0901234567',
        full_name: 'Nguyễn Văn An',
        address: 'Test Address',
      };

      mockFindCustomerByPhone.mockResolvedValue(null);

      // Mock database error
      mockSupabase.mockError('customers', {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR'
      });

      const createdCustomer = await result.current.createCustomer(newCustomerData);

      expect(createdCustomer).toBeNull();
      expect(result.current.error?.message).toContain('Không thể tạo khách hàng mới');
    });
  });

  describe('autoCreateCustomer', () => {
    it('should auto-create customer with minimal data', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const phone = '0901234567';
      const fullName = 'Nguyễn Văn An';

      // Mock no existing customer
      mockFindCustomerByPhone.mockResolvedValue(null);

      // Mock successful creation
      const mockCreatedCustomer = VietnameseMockDataGenerator.createMockCustomer({
        phone,
        full_name: fullName,
        notes: 'Tự động tạo từ phiếu sửa chữa',
      });

      mockSupabase.mockQueryResponse('customers', mockCreatedCustomer);

      const createdCustomer = await result.current.autoCreateCustomer(phone, fullName);

      expect(createdCustomer).toBeTruthy();
      expect(createdCustomer?.phone).toBe(phone);
      expect(createdCustomer?.fullName).toBe(fullName);
      expect(createdCustomer?.notes).toContain('Tự động tạo từ phiếu sửa chữa');
    });

    it('should return existing customer if found', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const phone = '0901234567';
      const fullName = 'Nguyễn Văn An';

      const existingCustomer = VietnameseMockDataGenerator.createMockCustomer({
        phone,
        full_name: 'Existing Name',
      });

      mockFindCustomerByPhone.mockResolvedValue(existingCustomer);

      const returnedCustomer = await result.current.autoCreateCustomer(phone, fullName);

      expect(returnedCustomer).toBe(existingCustomer);
      expect(returnedCustomer?.phone).toBe(phone);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer information successfully', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const phone = '0901234567';
      const updates = {
        full_name: 'Nguyễn Văn An - Cập nhật',
        address: 'Địa chỉ mới, Quận 2, TP.HCM',
        notes: 'Cập nhật thông tin khách hàng',
      };

      const mockUpdatedCustomer = VietnameseMockDataGenerator.createMockCustomer({
        phone,
        ...updates,
      });

      // Mock successful update
      mockSupabase.mockQueryResponse('customers', mockUpdatedCustomer);

      // Mock repair stats
      const mockRepairStats = [
        { created_at: '2025-01-01T00:00:00Z', status: 'completed' },
        { created_at: '2025-01-15T00:00:00Z', status: 'in_progress' },
      ];
      mockSupabase.mockQueryResponse('repair_tickets', mockRepairStats);

      const updatedCustomer = await result.current.updateCustomer(phone, updates);

      expect(updatedCustomer).toBeTruthy();
      expect(updatedCustomer?.fullName).toBe('Nguyễn Văn An - Cập nhật');
      expect(updatedCustomer?.address).toBe('Địa chỉ mới, Quận 2, TP.HCM');
      expect(updatedCustomer?.totalRepairs).toBe(2);
      expect(updatedCustomer?.activeRepairs).toBe(1);
    });

    it('should validate new phone number when updating', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const currentPhone = '0901234567';
      const updates = {
        phone: '0912345678',
        full_name: 'Updated Name',
      };

      // Mock phone validation success for new number
      vi.mocked(require('@/lib/validation/phone-vietnamese').validateVietnamesePhone)
        .mockImplementation((phone: string) => ({
          isValid: phone === '0912345678',
          error: phone === '0912345678' ? null : 'Invalid phone',
        }));

      // Mock no duplicate found
      mockFindCustomerByPhone.mockResolvedValue(null);

      const mockUpdatedCustomer = VietnameseMockDataGenerator.createMockCustomer({
        phone: '0912345678',
        full_name: 'Updated Name',
      });

      mockSupabase.mockQueryResponse('customers', mockUpdatedCustomer);
      mockSupabase.mockQueryResponse('repair_tickets', []);

      const updatedCustomer = await result.current.updateCustomer(currentPhone, updates);

      expect(updatedCustomer).toBeTruthy();
      expect(updatedCustomer?.phone).toBe('0912345678');
    });

    it('should prevent phone number conflicts when updating', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const currentPhone = '0901234567';
      const updates = {
        phone: '0912345678', // This phone already exists
      };

      // Mock validation success but duplicate found
      const existingCustomer = VietnameseMockDataGenerator.createMockCustomer({
        phone: '0912345678',
        full_name: 'Different Customer',
      });

      mockFindCustomerByPhone.mockResolvedValue(existingCustomer);

      const updatedCustomer = await result.current.updateCustomer(currentPhone, updates);

      expect(updatedCustomer).toBeNull();
      expect(result.current.error?.message).toContain('Số điện thoại mới đã được sử dụng');
    });
  });

  describe('deleteCustomer', () => {
    it('should soft delete customer by adding note', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const phone = '0901234567';

      // Mock no active repairs
      mockSupabase.mockQueryResponse('repair_tickets', []);

      // Mock successful update
      mockSupabase.mockQueryResponse('customers', {});

      const deleteResult = await result.current.deleteCustomer(phone);

      expect(deleteResult).toBe(true);

      const updateCall = mockSupabase.getLastUpdateCall('customers');
      expect(updateCall.notes).toContain('Khách hàng đã được đánh dấu xóa');
    });

    it('should prevent deletion of customers with active repairs', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const phone = '0901234567';

      // Mock active repairs found
      const activeRepairs = [
        { id: 'ticket-1', status: 'in_progress' },
        { id: 'ticket-2', status: 'device_received' },
      ];

      mockSupabase.mockQueryResponse('repair_tickets', activeRepairs);

      const deleteResult = await result.current.deleteCustomer(phone);

      expect(deleteResult).toBe(false);
      expect(result.current.error?.message).toContain('Không thể xóa khách hàng còn có phiếu sửa chữa');
    });
  });

  describe('changeCustomerPhone', () => {
    it('should change phone number with history tracking', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const customerId = 'customer-123';
      const oldPhone = '0901234567';
      const newPhone = '0912345678';
      const reason = 'Khách hàng yêu cầu thay đổi số điện thoại';

      // Mock validation success
      mockFindCustomerByPhone.mockResolvedValue(null);

      // Mock successful phone update
      mockSupabase.mockQueryResponse('customers', {});

      // Mock phone change history creation
      mockSupabase.mockQueryResponse('customer_phone_changes', {});

      const changeRecord = await result.current.changeCustomerPhone(
        customerId,
        oldPhone,
        newPhone,
        reason
      );

      expect(changeRecord).toBeTruthy();
      expect(changeRecord?.oldPhone).toBe(oldPhone);
      expect(changeRecord?.newPhone).toBe(newPhone);
      expect(changeRecord?.reason).toBe(reason);
      expect(changeRecord?.changedBy).toBe(customerId);
    });

    it('should validate new phone number format', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const customerId = 'customer-123';
      const oldPhone = '0901234567';
      const invalidNewPhone = '123456789';
      const reason = 'Test change';

      // Mock validation failure
      vi.mocked(require('@/lib/validation/phone-vietnamese').validateVietnamesePhone)
        .mockReturnValue({
          isValid: false,
          error: 'Số điện thoại mới không hợp lệ',
        });

      const changeRecord = await result.current.changeCustomerPhone(
        customerId,
        oldPhone,
        invalidNewPhone,
        reason
      );

      expect(changeRecord).toBeNull();
      expect(result.current.error?.message).toContain('Số điện thoại mới không hợp lệ');
    });

    it('should handle phone change history table not existing', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const customerId = 'customer-123';
      const oldPhone = '0901234567';
      const newPhone = '0912345678';
      const reason = 'Test change';

      mockFindCustomerByPhone.mockResolvedValue(null);
      mockSupabase.mockQueryResponse('customers', {});

      // Mock history table not found
      mockSupabase.mockError('customer_phone_changes', {
        code: '42P01',
        message: 'relation "customer_phone_changes" does not exist'
      });

      const changeRecord = await result.current.changeCustomerPhone(
        customerId,
        oldPhone,
        newPhone,
        reason
      );

      // Should still succeed even if history table doesn't exist
      expect(changeRecord).toBeTruthy();
      expect(changeRecord?.oldPhone).toBe(oldPhone);
      expect(changeRecord?.newPhone).toBe(newPhone);
    });
  });

  describe('getPhoneChangeHistory', () => {
    it('should retrieve phone change history for customer', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const customerId = 'customer-123';

      const mockHistoryData = [
        {
          old_phone: '0901234567',
          new_phone: '0912345678',
          changed_at: '2025-01-15T10:00:00Z',
          changed_by: 'customer-123',
          reason: 'Thay đổi số điện thoại cũ',
        },
        {
          old_phone: '0987654321',
          new_phone: '0901234567',
          changed_at: '2025-01-01T08:00:00Z',
          changed_by: 'customer-123',
          reason: 'Số cũ không sử dụng',
        },
      ];

      mockSupabase.mockQueryResponse('customer_phone_changes', mockHistoryData);

      const history = await result.current.getPhoneChangeHistory(customerId);

      expect(history).toHaveLength(2);
      expect(history[0].oldPhone).toBe('0901234567');
      expect(history[0].newPhone).toBe('0912345678');
      expect(history[0].reason).toBe('Thay đổi số điện thoại cũ');
    });

    it('should return empty array if history table does not exist', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      const customerId = 'customer-123';

      mockSupabase.mockError('customer_phone_changes', {
        code: '42P01',
        message: 'relation does not exist'
      });

      const history = await result.current.getPhoneChangeHistory(customerId);

      expect(history).toEqual([]);
    });
  });

  describe('loading and error states', () => {
    it('should manage loading state during operations', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      expect(result.current.loading).toBe(false);

      const customerData = {
        phone: '0901234567',
        full_name: 'Test Customer',
        address: 'Test Address',
      };

      mockFindCustomerByPhone.mockResolvedValue(null);
      mockSupabase.mockQueryResponse('customers', VietnameseMockDataGenerator.createMockCustomer(customerData));

      const createPromise = result.current.createCustomer(customerData);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await createPromise;
    });

    it('should clear error state on successful operations', async () => {
      const { result } = renderHook(() => useCustomerCrud());

      // First, trigger an error
      mockFindCustomerByPhone.mockRejectedValue(new Error('Test error'));

      const customerData = {
        phone: '0901234567',
        full_name: 'Test Customer',
        address: 'Test Address',
      };

      await result.current.createCustomer(customerData);
      expect(result.current.error).toBeTruthy();

      // Then, perform a successful operation
      mockFindCustomerByPhone.mockResolvedValue(null);
      mockSupabase.mockQueryResponse('customers', VietnameseMockDataGenerator.createMockCustomer(customerData));

      await result.current.createCustomer(customerData);
      expect(result.current.error).toBeNull();
    });
  });
});