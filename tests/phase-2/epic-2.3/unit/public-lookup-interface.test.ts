/**
 * Epic 2.3.1: Public Lookup Interface Unit Tests
 * Tests for customer-facing repair lookup functionality with Vietnamese phone validation
 * and LRP ticket code security validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCustomerPortal } from '@/hooks/use-customer-portal'
import { phoneValidation, ticketCodePatterns, vietnameseTestData } from '../../../phase-1/utils/vietnamese-test-helpers'

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  let mockTickets = [
    {
      id: 'test-ticket-1',
      ticket_code: 'LRP-2025-000001',
      status: 'in_repair',
      device_info: 'ASUS VivoBook',
      issue_description: 'Màn hình laptop bị vỡ',
      created_at: '2025-01-01T00:00:00Z',
      total_cost: 2500000,
      warranty_until: null,
      customer: {
        id: 'customer-1',
        phone: '0901234567',
        full_name: 'Nguyễn Văn A',
        address: '123 Nguyễn Trãi, Q1, TP.HCM',
        created_at: '2024-12-01T00:00:00Z'
      }
    },
    {
      id: 'test-ticket-2',
      ticket_code: 'LRP-2025-000002',
      status: 'ready_for_pickup',
      device_info: 'Dell Inspiron',
      issue_description: 'Pin không sạc được',
      created_at: '2025-01-02T00:00:00Z',
      total_cost: 1800000,
      warranty_until: '2026-01-02',
      customer: {
        id: 'customer-2',
        phone: '0987654321',
        full_name: 'Trần Thị B',
        address: '456 Lê Văn Sỹ, Q3, TP.HCM',
        created_at: '2024-12-02T00:00:00Z'
      }
    }
  ]

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'repair_tickets') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string, value: string) => {
              if (field === 'ticket_code') {
                const ticket = mockTickets.find(t => t.ticket_code === value)
                return {
                  eq: vi.fn((innerField: string, innerValue: string) => {
                    if (innerField === 'customers.phone' && ticket?.customer.phone === innerValue) {
                      return {
                        single: vi.fn(() => Promise.resolve({
                          data: ticket,
                          error: null
                        }))
                      }
                    }
                    return {
                      single: vi.fn(() => Promise.resolve({
                        data: null,
                        error: { code: 'PGRST116' }
                      }))
                    }
                  }),
                  single: vi.fn(() => {
                    if (ticket) {
                      return Promise.resolve({ data: ticket, error: null })
                    }
                    return Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                  })
                }
              }
              if (field === 'customers.phone') {
                const customerTickets = mockTickets.filter(t => t.customer.phone === value)
                return {
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      single: vi.fn(() => {
                        if (customerTickets.length > 0) {
                          return Promise.resolve({ data: customerTickets[0], error: null })
                        }
                        return Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                      })
                    }))
                  }))
                }
              }
              return {
                single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
              }
            }),
            order: vi.fn(() => ({
              // For service history queries
              then: vi.fn((callback) => {
                const result = mockTickets.filter(t => true) // Return all for service history
                return Promise.resolve(callback({ data: result, error: null }))
              })
            }))
          }))
        }
      }

      if (table === 'customer_feedback') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null }))
        }
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      }
    }),

    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      }))
    })),

    removeChannel: vi.fn()
  }

  return {
    supabase: mockSupabase
  }
})

describe('Epic 2.3.1: Public Lookup Interface System', () => {
  describe('AC2: Phone-Based Lookup - Vietnamese phone number validation', () => {
    describe('2.3-UNIT-003: Vietnamese phone validation logic (P0)', () => {
      it('should validate Vietnamese mobile phone numbers correctly', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Valid Vietnamese mobile numbers
        const validNumbers = [
          '0901234567', // Viettel
          '0987654321', // Vinaphone
          '0812345678', // Vinaphone
          '0707123456', // Viettel
          '0523456789', // Viettel
          '0334567890'  // Vinaphone
        ]

        validNumbers.forEach(phone => {
          expect(result.current.isValidPhoneNumber(phone)).toBe(true)
        })
      })

      it('should reject invalid Vietnamese phone numbers', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Invalid phone numbers
        const invalidNumbers = [
          '123456789',   // Too short
          '01234567890', // Too long
          '0123456789',  // Invalid prefix (01)
          '0223456789',  // Invalid prefix (02)
          '0423456789',  // Invalid prefix (04)
          '0623456789',  // Invalid prefix (06)
          '1234567890',  // No leading 0
          'abcdefghij',  // Non-numeric
          '',            // Empty
          '090-123-4567' // With dashes (should be normalized first)
        ]

        invalidNumbers.forEach(phone => {
          expect(result.current.isValidPhoneNumber(phone)).toBe(false)
        })
      })

      it('should use Vietnamese phone validation helper consistently', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Test consistency with Vietnamese test helpers
        vietnameseTestData.phoneNumbers.forEach(phone => {
          const hookResult = result.current.isValidPhoneNumber(phone)
          const helperResult = phoneValidation.validate(phone)
          expect(hookResult).toBe(helperResult)
        })
      })
    })

    describe('2.3-UNIT-004: Phone format normalization (P0)', () => {
      it('should normalize phone number format for display', () => {
        const testCases = [
          { input: '0901234567', expected: '090 123 4567' },
          { input: '0987654321', expected: '098 765 4321' },
          { input: '090 123 4567', expected: '090 123 4567' }, // Already formatted
          { input: '090-123-4567', expected: '090 123 4567' }, // With dashes
          { input: '(090) 123-4567', expected: '090 123 4567' } // With parentheses
        ]

        testCases.forEach(({ input, expected }) => {
          expect(phoneValidation.format(input)).toBe(expected)
        })
      })

      it('should handle malformed phone input gracefully', () => {
        const malformedInputs = [
          '123',      // Too short
          'invalid',  // Non-numeric
          '',         // Empty
          '12345678901' // Too long
        ]

        malformedInputs.forEach(input => {
          // Should return original input if can't format
          expect(phoneValidation.format(input)).toBe(input)
        })
      })
    })

    describe('2.3-UNIT-005: Phone lookup service calls (P1)', () => {
      it('should successfully lookup repair by phone number', async () => {
        const { result } = renderHook(() => useCustomerPortal())

        await act(async () => {
          const repairInfo = await result.current.lookupRepairByEmail('', '0901234567')
          expect(repairInfo).toBeDefined()
          expect(repairInfo.customer.phone).toBe('0901234567')
          expect(repairInfo.ticket_code).toBe('LRP-2025-000001')
        })
      })

      it('should handle phone lookup with no results', async () => {
        const { result } = renderHook(() => useCustomerPortal())

        await act(async () => {
          try {
            await result.current.lookupRepairByEmail('', '0999999999')
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect((error as Error).message).toBe('Không tìm thấy phiếu sửa chữa với thông tin này')
          }
        })
      })
    })
  })

  describe('AC3: Ticket Code Verification - LRP-YYYY-XXXXXX format security', () => {
    describe('2.3-UNIT-006: LRP code format validation (P0)', () => {
      it('should validate LRP ticket code format correctly', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Valid LRP formats
        const validCodes = [
          'LRP-2025-000001',
          'LRP-2024-123456',
          'LRP-2026-999999',
          // Legacy formats still supported
          'TK001',
          'MS001'
        ]

        validCodes.forEach(code => {
          expect(result.current.isValidTicketNumber(code)).toBe(true)
        })
      })

      it('should reject invalid ticket code formats', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Invalid formats
        const invalidCodes = [
          'LRP-25-000001',   // Wrong year format
          'LRP-2025-1234',   // Too few digits
          'LRP-2025-0000000', // Too many digits
          'ABC-2025-000001', // Wrong prefix
          'LRP2025000001',   // No separators
          'lrp-2025-000001', // Wrong case
          '',                // Empty
          '123',             // Just numbers
          'INVALID'          // Invalid format
        ]

        invalidCodes.forEach(code => {
          expect(result.current.isValidTicketNumber(code)).toBe(false)
        })
      })

      it('should use ticket code pattern validation consistently', () => {
        const validLRPCode = 'LRP-2025-000001'
        const validMSCode = 'MS001'
        const validTKCode = 'TK001'

        // Test pattern consistency
        expect(ticketCodePatterns.lrpFormat.test(validLRPCode)).toBe(true)
        expect(ticketCodePatterns.msFormat.test(validMSCode)).toBe(true)
        expect(ticketCodePatterns.tkFormat.test(validTKCode)).toBe(true)
      })
    })

    describe('2.3-UNIT-007: Ticket code sanitization (P0)', () => {
      it('should sanitize ticket code input for security', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Test that malicious inputs are properly rejected by validation
        const maliciousInputs = [
          '<script>alert("xss")</script>',
          "'; DROP TABLE repair_tickets; --",
          '../../../etc/passwd',
          '${7*7}',
          '{{constructor.constructor("alert(1)")()}}'
        ]

        maliciousInputs.forEach(input => {
          expect(result.current.isValidTicketNumber(input)).toBe(false)
        })
      })

      it('should handle ticket code lookup safely', async () => {
        const { result } = renderHook(() => useCustomerPortal())

        await act(async () => {
          try {
            // Should safely handle malicious ticket code
            await result.current.lookupRepair('<script>alert("xss")</script>', '0901234567')
            // Should not reach here
            expect(true).toBe(false)
          } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect((error as Error).message).toBe('Không tìm thấy phiếu sửa chữa với thông tin này')
          }
        })
      })
    })
  })

  describe('AC1: Public Access Interface - Route validation', () => {
    describe('2.3-UNIT-001: Public route access validation (P1)', () => {
      it('should allow public access without authentication', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Hook should initialize successfully without authentication
        expect(result.current).toBeDefined()
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
      })
    })

    describe('2.3-UNIT-002: Interface rendering without auth (P2)', () => {
      it('should provide all necessary public interface functions', () => {
        const { result } = renderHook(() => useCustomerPortal())

        // Verify all public functions are available
        expect(typeof result.current.lookupRepair).toBe('function')
        expect(typeof result.current.lookupRepairByEmail).toBe('function')
        expect(typeof result.current.getServiceHistory).toBe('function')
        expect(typeof result.current.isValidTicketNumber).toBe('function')
        expect(typeof result.current.isValidPhoneNumber).toBe('function')
        expect(typeof result.current.getVietnameseStatus).toBe('function')
      })
    })
  })

  describe('Integration Tests: Lookup Flow', () => {
    it('should handle complete lookup flow with valid data', async () => {
      const { result } = renderHook(() => useCustomerPortal())

      await act(async () => {
        const repairInfo = await result.current.lookupRepair('LRP-2025-000001', '0901234567')

        expect(repairInfo).toBeDefined()
        expect(repairInfo.ticket_code).toBe('LRP-2025-000001')
        expect(repairInfo.customer.phone).toBe('0901234567')
        expect(repairInfo.status).toBe('in_repair')
      })
    })

    it('should handle phone/ticket mismatch securely', async () => {
      const { result } = renderHook(() => useCustomerPortal())

      await act(async () => {
        try {
          // Valid ticket code but wrong phone number
          await result.current.lookupRepair('LRP-2025-000001', '0987654321')
          // Should not reach here
          expect(true).toBe(false)
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toBe('Không tìm thấy phiếu sửa chữa với thông tin này')
        }
      })
    })

    it('should provide Vietnamese error messages consistently', async () => {
      const { result } = renderHook(() => useCustomerPortal())

      await act(async () => {
        try {
          await result.current.lookupRepair('INVALID-CODE', '0901234567')
        } catch (error) {
          expect((error as Error).message).toContain('Không tìm thấy')
          expect((error as Error).message).toBeDefined()
        }
      })
    })
  })
})