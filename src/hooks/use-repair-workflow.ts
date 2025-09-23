/**
 * Enhanced Repair Workflow Management Hook
 * 16-State Repair Workflow System with Vietnamese labels and controlled transitions
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  RepairState,
  REPAIR_STATES,
  getValidTransitions,
  isValidTransition,
  getTransitionInfo,
  RepairType,
  getWorkflowPath
} from '@/lib/workflow/repair-states';
import {
  stateValidator,
  ValidationResult,
  TransitionContext
} from '@/lib/workflow/state-validation';

export interface StateChangeLog {
  id: string;
  ticket_id: string;
  from_state: RepairState;
  to_state: RepairState;
  changed_by: string;
  changed_at: string;
  reason: string;
  notes?: string;
  customer_notified: boolean;
  validation_result?: ValidationResult;
}

export interface WorkflowTicket {
  id: string;
  current_state: RepairState;
  repair_type: RepairType;
  customer_phone: string;
  device_info: string;
  assigned_technician?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  upcomingSteps: string[];
  estimatedCompletion?: string;
}

export interface WorkflowStats {
  totalTickets: number;
  byState: Record<RepairState, number>;
  averageCompletionTime: number;
  bottlenecks: Array<{
    state: RepairState;
    averageDuration: number;
    ticketCount: number;
  }>;
}

export interface WorkflowState {
  tickets: WorkflowTicket[];
  stateHistory: StateChangeLog[];
  workflowStats: WorkflowStats | null;
  loading: boolean;
  error: string | null;
}

// 16-State Workflow Management System

export function useRepairWorkflow() {
  const [state, setState] = useState<WorkflowState>({
    tickets: [],
    stateHistory: [],
    workflowStats: null,
    loading: false,
    error: null,
  });

  // Load tickets with workflow state information
  const loadTickets = useCallback(async (filters?: {
    state?: RepairState;
    technician?: string;
    customer?: string;
    dateRange?: { start: string; end: string };
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let query = supabase
        .from('repair_tickets')
        .select(`
          id,
          current_state,
          repair_type,
          customer_phone,
          device_info,
          assigned_technician,
          created_at,
          updated_at,
          metadata,
          customers (
            full_name,
            phone
          )
        `);

      // Apply filters
      if (filters?.state) {
        query = query.eq('current_state', filters.state);
      }
      if (filters?.technician) {
        query = query.eq('assigned_technician', filters.technician);
      }
      if (filters?.customer) {
        query = query.eq('customer_phone', filters.customer);
      }
      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ ...prev, tickets: data || [], loading: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Lỗi khi tải danh sách phiếu sửa chữa'
      }));
    }
  }, []);

  // Load state change history for a ticket
  const loadStateHistory = useCallback(async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('repair_state_changes')
        .select(`
          id,
          ticket_id,
          from_state,
          to_state,
          changed_by,
          changed_at,
          reason,
          notes,
          customer_notified,
          validation_result,
          users (
            full_name
          )
        `)
        .eq('ticket_id', ticketId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ ...prev, stateHistory: data || [] }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Lỗi khi tải lịch sử thay đổi trạng thái'
      }));
    }
  }, []);

  // Change ticket state with validation
  const changeTicketState = useCallback(async (
    ticketId: string,
    newState: RepairState,
    context: {
      reason: string;
      notes?: string;
      userId: string;
      userRole: string;
      hasCustomerApproval?: boolean;
      hasPayment?: boolean;
      partsAvailable?: boolean;
      qualityCheckPassed?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<{ success: boolean; validation?: ValidationResult; error?: string }> => {
    try {
      // Get current ticket information
      const { data: ticket } = await supabase
        .from('repair_tickets')
        .select('current_state, metadata')
        .eq('id', ticketId)
        .single();

      if (!ticket) {
        return { success: false, error: 'Không tìm thấy phiếu sửa chữa' };
      }

      // Validate the transition
      const transitionContext: TransitionContext = {
        userId: context.userId,
        userRole: context.userRole,
        ticketId,
        currentState: ticket.current_state,
        targetState: newState,
        hasCustomerApproval: context.hasCustomerApproval,
        hasPayment: context.hasPayment,
        partsAvailable: context.partsAvailable,
        qualityCheckPassed: context.qualityCheckPassed,
        metadata: { ...ticket.metadata, ...context.metadata }
      };

      const validation = stateValidator.validateTransition(transitionContext);

      if (!validation.isValid) {
        return { success: false, validation, error: validation.errors.join(', ') };
      }

      // Update ticket state
      const { error: updateError } = await supabase
        .from('repair_tickets')
        .update({
          current_state: newState,
          updated_at: new Date().toISOString(),
          metadata: transitionContext.metadata
        })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      // Log state change
      const { error: logError } = await supabase
        .from('repair_state_changes')
        .insert({
          ticket_id: ticketId,
          from_state: ticket.current_state,
          to_state: newState,
          changed_by: context.userId,
          changed_at: new Date().toISOString(),
          reason: context.reason,
          notes: context.notes,
          customer_notified: REPAIR_STATES[newState].notifyCustomer,
          validation_result: validation
        });

      if (logError) throw logError;

      // Send customer notification if required
      if (REPAIR_STATES[newState].notifyCustomer) {
        await sendCustomerNotification(ticketId, newState);
      }

      // Refresh tickets list
      await loadTickets();

      return { success: true, validation };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi khi thay đổi trạng thái'
      };
    }
  }, [loadTickets]);

  // Bulk state change for multiple tickets
  const bulkChangeState = useCallback(async (
    ticketIds: string[],
    newState: RepairState,
    context: {
      reason: string;
      userId: string;
      userRole: string;
      notes?: string;
    }
  ): Promise<{
    success: string[];
    failed: Array<{ ticketId: string; error: string }>;
  }> => {
    const success: string[] = [];
    const failed: Array<{ ticketId: string; error: string }> = [];

    for (const ticketId of ticketIds) {
      const result = await changeTicketState(ticketId, newState, context);

      if (result.success) {
        success.push(ticketId);
      } else {
        failed.push({ ticketId, error: result.error || 'Lỗi không xác định' });
      }
    }

    return { success, failed };
  }, [changeTicketState]);

  // Get workflow progress for a ticket
  const getWorkflowProgress = useCallback((
    ticket: WorkflowTicket
  ): WorkflowProgress => {
    const workflowPath = getWorkflowPath(ticket.repair_type);
    const currentIndex = workflowPath.indexOf(ticket.current_state);

    return {
      currentStep: currentIndex + 1,
      totalSteps: workflowPath.length,
      completedSteps: workflowPath.slice(0, currentIndex + 1).map(state => REPAIR_STATES[state].label),
      upcomingSteps: workflowPath.slice(currentIndex + 1).map(state => REPAIR_STATES[state].label),
      estimatedCompletion: calculateEstimatedCompletion(ticket, workflowPath, currentIndex)
    };
  }, []);

  // Get valid next states for a ticket
  const getNextStates = useCallback((
    ticket: WorkflowTicket,
    userRole: string
  ): Array<{ state: RepairState; label: string; recommended: boolean }> => {
    const validTransitions = getValidTransitions(ticket.current_state);

    return validTransitions.map(state => {
      const context: Omit<TransitionContext, 'targetState'> = {
        userId: 'current_user',
        userRole,
        ticketId: ticket.id,
        currentState: ticket.current_state,
        metadata: ticket.metadata
      };

      const recommended = stateValidator.getRecommendedNextStates(context).includes(state);

      return {
        state,
        label: REPAIR_STATES[state].label,
        recommended
      };
    });
  }, []);

  // Initialize hook
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    // Data
    ...state,

    // Actions
    loadTickets,
    loadStateHistory,
    changeTicketState,
    bulkChangeState,

    // Utilities
    getWorkflowProgress,
    getNextStates,
    getValidTransitions: (state: RepairState) => getValidTransitions(state),
    isValidTransition,
    validateTransition: (context: TransitionContext) => stateValidator.validateTransition(context),

    // State information
    REPAIR_STATES,
    getStateLabel: (state: RepairState) => REPAIR_STATES[state].label,
    getStateColor: (state: RepairState) => REPAIR_STATES[state].color,
    getStateCategory: (state: RepairState) => REPAIR_STATES[state].category
  };
}

// Helper functions
async function sendCustomerNotification(ticketId: string, newState: RepairState): Promise<void> {
  try {
    const { data: ticket } = await supabase
      .from('repair_tickets')
      .select('customer_phone, device_info')
      .eq('id', ticketId)
      .single();

    if (!ticket) return;

    const stateDefinition = REPAIR_STATES[newState];
    const message = `Cập nhật trạng thái: ${ticket.device_info} - ${stateDefinition.label}. ${stateDefinition.description}`;

    // Log notification (implement actual SMS/notification service as needed)
    await supabase
      .from('customer_notifications')
      .insert({
        ticket_id: ticketId,
        customer_phone: ticket.customer_phone,
        message,
        notification_type: 'state_change',
        sent_at: new Date().toISOString()
      });
  } catch (err) {
    console.error('Error sending customer notification:', err);
  }
}

function calculateEstimatedCompletion(
  ticket: WorkflowTicket,
  workflowPath: RepairState[],
  currentIndex: number
): string | undefined {
  // Simple estimation based on repair type and remaining steps
  const remainingSteps = workflowPath.length - currentIndex - 1;
  const baseEstimate = {
    software: 1,
    screen: 2,
    hardware: 3,
    liquid_damage: 4,
    battery: 1.5,
    motherboard: 5
  };

  const daysPerStep = baseEstimate[ticket.repair_type] || 2;
  const estimatedDays = remainingSteps * daysPerStep;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

  return estimatedDate.toISOString().split('T')[0];
}
