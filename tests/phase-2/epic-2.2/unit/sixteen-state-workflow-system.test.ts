/**
 * Epic 2.2.2: 16-State Repair Workflow Management System Tests
 * Comprehensive unit tests for Vietnamese repair shop workflow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  REPAIR_STATES,
  RepairState,
  validateStateTransition,
  getNextPossibleStates,
  getStateRequirements
} from '@/lib/workflow/repair-states';
import { useRepairWorkflow } from '@/hooks/use-repair-workflow';
import { renderHook, act } from '@testing-library/react';

describe('Epic 2.2.2: 16-State Repair Workflow Management System', () => {

  describe('Complete 16-State Model Implementation', () => {
    it('should implement all 16 repair states with Vietnamese labels', () => {
      const expectedStates: RepairState[] = [
        'device_received',
        'preliminary_inspection',
        'awaiting_repair_plan',
        'approved_for_repair',
        'waiting_parts',
        'in_diagnosis',
        'in_repair',
        'quality_testing',
        'ready_for_pickup',
        'delivered',
        'payment_pending',
        'completed',
        'cancelled_by_customer',
        'on_hold',
        'warranty_claim',
        'abandoned'
      ];

      expect(Object.keys(REPAIR_STATES)).toHaveLength(16);

      for (const state of expectedStates) {
        expect(REPAIR_STATES[state]).toBeDefined();
        expect(REPAIR_STATES[state].label).toBeTruthy();
        expect(REPAIR_STATES[state].description).toBeTruthy();
      }
    });

    it('should have Vietnamese labels for all states', () => {
      const vietnameseLabels = {
        'device_received': 'Đã nhận thiết bị',
        'preliminary_inspection': 'Kiểm tra sơ bộ',
        'awaiting_repair_plan': 'Đang lập kế hoạch sửa chữa',
        'approved_for_repair': 'Đã duyệt sửa chữa',
        'waiting_parts': 'Đang chờ linh kiện',
        'in_diagnosis': 'Đang chẩn đoán',
        'in_repair': 'Đang sửa chữa',
        'quality_testing': 'Kiểm tra chất lượng',
        'ready_for_pickup': 'Sẵn sàng giao',
        'delivered': 'Đã giao hàng',
        'payment_pending': 'Chờ thanh toán',
        'completed': 'Hoàn thành',
        'cancelled_by_customer': 'Khách hàng hủy',
        'on_hold': 'Tạm dừng',
        'warranty_claim': 'Bảo hành',
        'abandoned': 'Bỏ lại'
      };

      for (const [state, expectedLabel] of Object.entries(vietnameseLabels)) {
        expect(REPAIR_STATES[state as RepairState].label).toBe(expectedLabel);
      }
    });

    it('should categorize states correctly', () => {
      const activeStates = Object.values(REPAIR_STATES).filter(s => s.category === 'active');
      const completedStates = Object.values(REPAIR_STATES).filter(s => s.category === 'completed');
      const cancelledStates = Object.values(REPAIR_STATES).filter(s => s.category === 'cancelled');
      const specialStates = Object.values(REPAIR_STATES).filter(s => s.category === 'special');

      expect(activeStates.length).toBeGreaterThan(0);
      expect(completedStates.length).toBeGreaterThan(0);
      expect(cancelledStates.length).toBeGreaterThan(0);
      expect(specialStates.length).toBeGreaterThan(0);
    });
  });

  describe('State Transition Validation', () => {
    it('should enforce valid state transitions', () => {
      // Valid transitions
      expect(validateStateTransition('device_received', 'preliminary_inspection')).toBe(true);
      expect(validateStateTransition('preliminary_inspection', 'awaiting_repair_plan')).toBe(true);
      expect(validateStateTransition('awaiting_repair_plan', 'approved_for_repair')).toBe(true);
      expect(validateStateTransition('approved_for_repair', 'in_repair')).toBe(true);
      expect(validateStateTransition('in_repair', 'quality_testing')).toBe(true);
      expect(validateStateTransition('quality_testing', 'ready_for_pickup')).toBe(true);
      expect(validateStateTransition('ready_for_pickup', 'delivered')).toBe(true);
      expect(validateStateTransition('delivered', 'payment_pending')).toBe(true);
      expect(validateStateTransition('payment_pending', 'completed')).toBe(true);
    });

    it('should prevent invalid state transitions', () => {
      // Invalid transitions (skipping required states)
      expect(validateStateTransition('device_received', 'completed')).toBe(false);
      expect(validateStateTransition('awaiting_repair_plan', 'ready_for_pickup')).toBe(false);
      expect(validateStateTransition('in_repair', 'delivered')).toBe(false);

      // Invalid backwards transitions
      expect(validateStateTransition('completed', 'in_repair')).toBe(false);
      expect(validateStateTransition('delivered', 'awaiting_repair_plan')).toBe(false);
    });

    it('should handle conditional workflow paths', () => {
      // Direct repair path (no parts needed)
      expect(validateStateTransition('approved_for_repair', 'in_repair')).toBe(true);

      // Parts ordering path
      expect(validateStateTransition('approved_for_repair', 'waiting_parts')).toBe(true);
      expect(validateStateTransition('waiting_parts', 'in_repair')).toBe(true);

      // Diagnosis path
      expect(validateStateTransition('approved_for_repair', 'in_diagnosis')).toBe(true);
      expect(validateStateTransition('in_diagnosis', 'in_repair')).toBe(true);
    });

    it('should handle exception workflows', () => {
      // Customer cancellation at any point
      expect(validateStateTransition('device_received', 'cancelled_by_customer')).toBe(true);
      expect(validateStateTransition('awaiting_repair_plan', 'cancelled_by_customer')).toBe(true);
      expect(validateStateTransition('in_repair', 'cancelled_by_customer')).toBe(true);

      // Put on hold
      expect(validateStateTransition('in_repair', 'on_hold')).toBe(true);
      expect(validateStateTransition('on_hold', 'in_repair')).toBe(true);

      // Abandoned workflow
      expect(validateStateTransition('ready_for_pickup', 'abandoned')).toBe(true);
    });
  });

  describe('Business Rules and Requirements', () => {
    it('should identify states requiring customer approval', () => {
      const requiresApproval = Object.values(REPAIR_STATES)
        .filter(state => state.requiresCustomerApproval);

      expect(requiresApproval.length).toBeGreaterThan(0);
      expect(requiresApproval.some(s => s.id === 'awaiting_repair_plan')).toBe(true);
    });

    it('should identify states requiring payment', () => {
      const requiresPayment = Object.values(REPAIR_STATES)
        .filter(state => state.requiresPayment);

      expect(requiresPayment.length).toBeGreaterThan(0);
      expect(requiresPayment.some(s => s.id === 'payment_pending')).toBe(true);
    });

    it('should identify terminal states', () => {
      const terminalStates = Object.values(REPAIR_STATES)
        .filter(state => state.isTerminal);

      expect(terminalStates.length).toBeGreaterThan(0);
      expect(terminalStates.some(s => s.id === 'completed')).toBe(true);
      expect(terminalStates.some(s => s.id === 'cancelled_by_customer')).toBe(true);
      expect(terminalStates.some(s => s.id === 'abandoned')).toBe(true);
    });

    it('should define role-based permissions', () => {
      for (const state of Object.values(REPAIR_STATES)) {
        expect(Array.isArray(state.allowedRoles)).toBe(true);
        expect(state.allowedRoles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Workflow State Management', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should get next possible states correctly', () => {
      const nextStates = getNextPossibleStates('device_received');
      expect(nextStates).toContain('preliminary_inspection');
      expect(nextStates).toContain('cancelled_by_customer');

      const repairStates = getNextPossibleStates('approved_for_repair');
      expect(repairStates).toContain('in_repair');
      expect(repairStates).toContain('waiting_parts');
      expect(repairStates).toContain('in_diagnosis');
    });

    it('should identify state requirements', () => {
      const planningRequirements = getStateRequirements('awaiting_repair_plan');
      expect(planningRequirements.customerApproval).toBe(true);

      const completionRequirements = getStateRequirements('completed');
      expect(completionRequirements.payment).toBe(true);
    });

    it('should handle workflow transitions with validation', async () => {
      const { result } = renderHook(() => useRepairWorkflow());

      const ticketId = 'test-ticket-1';

      await act(async () => {
        // Valid transition
        const success = await result.current.updateTicketState(
          ticketId,
          'device_received',
          'preliminary_inspection'
        );
        expect(success).toBe(true);

        // Invalid transition should fail
        try {
          await result.current.updateTicketState(
            ticketId,
            'device_received',
            'completed'
          );
          expect(true).toBe(false); // Should not reach here
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('Vietnamese State Descriptions', () => {
    it('should provide detailed Vietnamese descriptions for each state', () => {
      const stateDescriptions = {
        'device_received': 'Thiết bị đã được tiếp nhận và đang chờ kiểm tra ban đầu',
        'preliminary_inspection': 'Đang thực hiện kiểm tra sơ bộ để xác định vấn đề',
        'awaiting_repair_plan': 'Đang lập phương án sửa chữa và chờ khách hàng phê duyệt',
        'in_repair': 'Đang thực hiện sửa chữa theo phương án đã được phê duyệt',
        'quality_testing': 'Đang kiểm tra chất lượng sau khi hoàn thành sửa chữa',
        'completed': 'Đã hoàn thành toàn bộ quy trình sửa chữa'
      };

      for (const [state, expectedDesc] of Object.entries(stateDescriptions)) {
        const stateInfo = REPAIR_STATES[state as RepairState];
        expect(stateInfo.description).toContain('Đang') ||
        expect(stateInfo.description).toContain('Đã') ||
        expect(stateInfo.description).toContain('Thiết bị');
      }
    });

    it('should provide appropriate status colors', () => {
      // Active states should have blue/yellow colors
      expect(REPAIR_STATES.device_received.color).toMatch(/blue|yellow|orange/);
      expect(REPAIR_STATES.in_repair.color).toMatch(/blue|yellow|orange/);

      // Completed states should have green colors
      expect(REPAIR_STATES.completed.color).toMatch(/green/);

      // Cancelled states should have red colors
      expect(REPAIR_STATES.cancelled_by_customer.color).toMatch(/red/);
    });
  });

  describe('Workflow Performance and Reliability', () => {
    it('should handle rapid state transitions efficiently', async () => {
      const { result } = renderHook(() => useRepairWorkflow());

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) =>
          result.current.validateTransition(
            'device_received',
            'preliminary_inspection'
          )
        );

        await Promise.all(promises);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should maintain state consistency under concurrent updates', async () => {
      const { result } = renderHook(() => useRepairWorkflow());

      const ticketId = 'concurrent-test';

      await act(async () => {
        // Simulate concurrent state updates
        const updates = [
          result.current.updateTicketState(ticketId, 'device_received', 'preliminary_inspection'),
          result.current.addTicketNote(ticketId, 'Initial inspection note'),
          result.current.updateTicketPriority(ticketId, 'high')
        ];

        const results = await Promise.allSettled(updates);

        // At least some operations should succeed
        const successful = results.filter(r => r.status === 'fulfilled');
        expect(successful.length).toBeGreaterThan(0);
      });
    });
  });

  describe('State Transition History and Audit', () => {
    it('should track state transition history', async () => {
      const { result } = renderHook(() => useRepairWorkflow());

      const ticketId = 'history-test';

      await act(async () => {
        // Make several state transitions
        await result.current.updateTicketState(ticketId, 'device_received', 'preliminary_inspection');
        await result.current.updateTicketState(ticketId, 'preliminary_inspection', 'awaiting_repair_plan');

        const history = await result.current.getStateHistory(ticketId);

        expect(history.length).toBeGreaterThanOrEqual(2);
        expect(history[0].fromState).toBe('preliminary_inspection');
        expect(history[0].toState).toBe('awaiting_repair_plan');
        expect(history[0].timestamp).toBeDefined();
        expect(history[0].staffId).toBeDefined();
      });
    });

    it('should provide Vietnamese transition reasons', async () => {
      const { result } = renderHook(() => useRepairWorkflow());

      const ticketId = 'reason-test';

      await act(async () => {
        await result.current.updateTicketState(
          ticketId,
          'device_received',
          'preliminary_inspection',
          'Bắt đầu kiểm tra thiết bị theo quy trình'
        );

        const history = await result.current.getStateHistory(ticketId);
        const lastTransition = history[0];

        expect(lastTransition.reason).toContain('kiểm tra thiết bị');
      });
    });
  });

  describe('Integration with Customer Notifications', () => {
    it('should identify states that trigger customer notifications', () => {
      const notificationStates = Object.values(REPAIR_STATES)
        .filter(state => state.notifyCustomer);

      expect(notificationStates.length).toBeGreaterThan(0);
      expect(notificationStates.some(s => s.id === 'awaiting_repair_plan')).toBe(true);
      expect(notificationStates.some(s => s.id === 'ready_for_pickup')).toBe(true);
      expect(notificationStates.some(s => s.id === 'completed')).toBe(true);
    });

    it('should provide Vietnamese notification templates', async () => {
      const { result } = renderHook(() => useRepairWorkflow());

      await act(async () => {
        const template = await result.current.getNotificationTemplate(
          'ready_for_pickup',
          'LRP-2025-000001'
        );

        expect(template.subject).toContain('sẵn sàng');
        expect(template.message).toContain('nhận máy');
        expect(template.message).toContain('LRP-2025-000001');
      });
    });
  });
});