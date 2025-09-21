import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

// Database types
type RepairStatus = Database["public"]["Enums"]["repair_status"];

export interface WorkflowAction {
  id: string;
  type: "status_change" | "notification" | "assignment" | "cost_update" | "parts_check";
  description: string;
  automated: boolean;
  conditions?: string[];
  nextActions?: string[];
}

export interface WorkflowStep {
  status: RepairStatus;
  name: string;
  description: string;
  estimatedHours: number;
  requiredActions: WorkflowAction[];
  nextSteps: RepairStatus[];
  autoTransitionConditions?: {
    partsAvailable?: boolean;
    diagnosticComplete?: boolean;
    repairComplete?: boolean;
    customerNotified?: boolean;
  };
}

export interface WorkflowState {
  currentStep?: WorkflowStep;
  availableActions: WorkflowAction[];
  loading: boolean;
  error: Error | null;
}

// Repair workflow configuration
const REPAIR_WORKFLOW: Record<RepairStatus, WorkflowStep> = {
  received: {
    status: "received",
    name: "Tiếp nhận",
    description: "Tiếp nhận thiết bị và tạo phiếu sửa chữa",
    estimatedHours: 0.5,
    requiredActions: [
      {
        id: "create_ticket",
        type: "status_change",
        description: "Tạo phiếu sửa chữa",
        automated: true
      },
      {
        id: "notify_customer_received",
        type: "notification",
        description: "Thông báo khách hàng đã tiếp nhận",
        automated: true
      },
      {
        id: "assign_technician",
        type: "assignment",
        description: "Phân công kỹ thuật viên chẩn đoán",
        automated: false
      }
    ],
    nextSteps: ["diagnosed"]
  },
  diagnosed: {
    status: "diagnosed",
    name: "Chẩn đoán",
    description: "Chẩn đoán lỗi và đưa ra phương án sửa chữa",
    estimatedHours: 1,
    requiredActions: [
      {
        id: "diagnostic_report",
        type: "status_change",
        description: "Tạo báo cáo chẩn đoán",
        automated: false
      },
      {
        id: "estimate_cost",
        type: "cost_update",
        description: "Ước tính chi phí sửa chữa",
        automated: false
      },
      {
        id: "check_parts_needed",
        type: "parts_check",
        description: "Kiểm tra linh kiện cần thiết",
        automated: true
      },
      {
        id: "notify_customer_diagnosis",
        type: "notification",
        description: "Thông báo kết quả chẩn đoán cho khách hàng",
        automated: true
      }
    ],
    nextSteps: ["waiting_parts", "in_progress"],
    autoTransitionConditions: {
      diagnosticComplete: true,
      partsAvailable: true
    }
  },
  waiting_parts: {
    status: "waiting_parts",
    name: "Chờ linh kiện",
    description: "Chờ linh kiện để thực hiện sửa chữa",
    estimatedHours: 0,
    requiredActions: [
      {
        id: "order_parts",
        type: "parts_check",
        description: "Đặt hàng linh kiện",
        automated: false
      },
      {
        id: "notify_customer_waiting",
        type: "notification",
        description: "Thông báo khách hàng đang chờ linh kiện",
        automated: true
      },
      {
        id: "check_parts_arrival",
        type: "parts_check",
        description: "Kiểm tra linh kiện đã về",
        automated: true
      }
    ],
    nextSteps: ["in_progress"],
    autoTransitionConditions: {
      partsAvailable: true
    }
  },
  in_progress: {
    status: "in_progress",
    name: "Đang sửa chữa",
    description: "Thực hiện sửa chữa thiết bị",
    estimatedHours: 4,
    requiredActions: [
      {
        id: "start_repair",
        type: "status_change",
        description: "Bắt đầu quá trình sửa chữa",
        automated: false
      },
      {
        id: "update_progress",
        type: "status_change",
        description: "Cập nhật tiến độ sửa chữa",
        automated: false
      },
      {
        id: "use_parts",
        type: "parts_check",
        description: "Sử dụng linh kiện",
        automated: false
      },
      {
        id: "notify_customer_progress",
        type: "notification",
        description: "Thông báo tiến độ cho khách hàng",
        automated: true
      }
    ],
    nextSteps: ["completed"],
    autoTransitionConditions: {
      repairComplete: true
    }
  },
  completed: {
    status: "completed",
    name: "Hoàn thành",
    description: "Sửa chữa hoàn tất, kiểm tra chất lượng",
    estimatedHours: 0.5,
    requiredActions: [
      {
        id: "quality_check",
        type: "status_change",
        description: "Kiểm tra chất lượng sửa chữa",
        automated: false
      },
      {
        id: "calculate_final_cost",
        type: "cost_update",
        description: "Tính toán chi phí cuối cùng",
        automated: true
      },
      {
        id: "notify_customer_completed",
        type: "notification",
        description: "Thông báo hoàn thành cho khách hàng",
        automated: true
      }
    ],
    nextSteps: ["ready_for_pickup"]
  },
  ready_for_pickup: {
    status: "ready_for_pickup",
    name: "Sẵn sàng giao",
    description: "Sẵn sàng giao thiết bị cho khách hàng",
    estimatedHours: 0,
    requiredActions: [
      {
        id: "prepare_delivery",
        type: "status_change",
        description: "Chuẩn bị giao thiết bị",
        automated: false
      },
      {
        id: "notify_customer_ready",
        type: "notification",
        description: "Thông báo sẵn sàng giao",
        automated: true
      },
      {
        id: "generate_invoice",
        type: "cost_update",
        description: "Tạo hóa đơn",
        automated: true
      }
    ],
    nextSteps: ["delivered"]
  },
  delivered: {
    status: "delivered",
    name: "Đã giao",
    description: "Đã giao thiết bị cho khách hàng",
    estimatedHours: 0,
    requiredActions: [
      {
        id: "confirm_delivery",
        type: "status_change",
        description: "Xác nhận đã giao",
        automated: false
      },
      {
        id: "request_feedback",
        type: "notification",
        description: "Yêu cầu phản hồi từ khách hàng",
        automated: true
      }
    ],
    nextSteps: []
  },
  cancelled: {
    status: "cancelled",
    name: "Đã hủy",
    description: "Hủy phiếu sửa chữa",
    estimatedHours: 0,
    requiredActions: [
      {
        id: "cancel_reason",
        type: "status_change",
        description: "Ghi nhận lý do hủy",
        automated: false
      },
      {
        id: "notify_customer_cancelled",
        type: "notification",
        description: "Thông báo hủy cho khách hàng",
        automated: true
      },
      {
        id: "return_parts",
        type: "parts_check",
        description: "Hoàn trả linh kiện về kho",
        automated: true
      }
    ],
    nextSteps: []
  }
};

export function useRepairWorkflow() {
  const [state, setState] = useState<WorkflowState>({
    availableActions: [],
    loading: false,
    error: null
  });

  // Get workflow step for a status
  const getWorkflowStep = useCallback((status: RepairStatus): WorkflowStep => {
    return REPAIR_WORKFLOW[status];
  }, []);

  // Get available actions for current status
  const getAvailableActions = useCallback((currentStatus: RepairStatus): WorkflowAction[] => {
    const step = REPAIR_WORKFLOW[currentStatus];
    return step.requiredActions;
  }, []);

  // Advance repair to next status
  const advanceRepair = useCallback(async (
    repairId: string,
    newStatus: RepairStatus,
    notes?: string,
    userId?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get current repair data
      const { data: currentRepair, error: fetchError } = await supabase
        .from("repairs")
        .select("*")
        .eq("id", repairId)
        .single();

      if (fetchError) throw fetchError;

      const oldStatus = currentRepair.status;

      // Validate transition
      const currentStep = REPAIR_WORKFLOW[oldStatus as RepairStatus];
      if (!currentStep.nextSteps.includes(newStatus)) {
        throw new Error(`Không thể chuyển từ ${oldStatus} sang ${newStatus}`);
      }

      // Update repair status
      const { error: updateError } = await supabase
        .from("repairs")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", repairId);

      if (updateError) throw updateError;

      // Log status change
      const { error: logError } = await supabase
        .from("repair_status_logs")
        .insert({
          repair_id: repairId,
          old_status: oldStatus,
          new_status: newStatus,
          notes: notes || `Chuyển trạng thái từ ${getVietnameseStatus(oldStatus)} sang ${getVietnameseStatus(newStatus)}`,
          changed_by: userId || "system",
          created_at: new Date().toISOString()
        });

      if (logError) throw logError;

      // Execute automated actions for new status
      await executeAutomatedActions(repairId, newStatus, userId);

      setState(prev => ({ ...prev, loading: false }));
      return true;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
      throw error;
    }
  }, []);

  // Execute automated actions for a status
  const executeAutomatedActions = async (
    repairId: string,
    status: RepairStatus,
    userId?: string
  ) => {
    const step = REPAIR_WORKFLOW[status];
    const automatedActions = step.requiredActions.filter(action => action.automated);

    for (const action of automatedActions) {
      try {
        await executeAction(repairId, action, userId);
      } catch (error) {
        console.error(`Failed to execute automated action ${action.id}:`, error);
      }
    }
  };

  // Execute a specific workflow action
  const executeAction = async (
    repairId: string,
    action: WorkflowAction,
    userId?: string
  ) => {
    switch (action.type) {
      case "notification":
        await sendCustomerNotification(repairId, action.description);
        break;

      case "parts_check":
        await checkPartsAvailability(repairId);
        break;

      case "cost_update":
        await updateRepairCost(repairId);
        break;

      case "assignment":
        await assignTechnician(repairId, userId);
        break;

      default:
        console.log(`Action ${action.type} executed for repair ${repairId}`);
    }
  };

  // Send notification to customer
  const sendCustomerNotification = async (repairId: string, message: string) => {
    // Get repair and customer info
    const { data: repair } = await supabase
      .from("repairs")
      .select(`
        ticket_number,
        status,
        customer:customers(name, phone, email)
      `)
      .eq("id", repairId)
      .single();

    if (repair) {
      // In a real implementation, this would send SMS/Email
      console.log(`Notification sent to ${(repair.customer as any)?.name}: ${message}`);

      // Log notification in repair status logs
      await supabase
        .from("repair_status_logs")
        .insert({
          repair_id: repairId,
          old_status: null,
          new_status: repair.status,
          notes: `Đã gửi thông báo: ${message}`,
          changed_by: "system",
          created_at: new Date().toISOString()
        });
    }
  };

  // Check parts availability for repair
  const checkPartsAvailability = async (repairId: string) => {
    const { data: repairParts } = await supabase
      .from("repair_parts")
      .select(`
        quantity_used,
        part:parts(name, stock_quantity)
      `)
      .eq("repair_id", repairId);

    if (repairParts) {
      const unavailableParts = repairParts.filter(rp =>
        (rp.part as any)?.stock_quantity < rp.quantity_used
      );

      if (unavailableParts.length > 0) {
        console.log(`Parts not available for repair ${repairId}:`, unavailableParts);
        return false;
      }
    }

    return true;
  };

  // Update repair cost automatically
  const updateRepairCost = async (repairId: string) => {
    // Calculate total parts cost
    const { data: partsCost } = await supabase
      .from("repair_parts")
      .select("total_cost")
      .eq("repair_id", repairId);

    if (partsCost) {
      const totalPartsCost = partsCost.reduce((sum, part) => sum + (part.total_cost || 0), 0);

      // Add labor cost (estimated based on hours)
      const { data: repair } = await supabase
        .from("repairs")
        .select("status")
        .eq("id", repairId)
        .single();

      if (repair) {
        const step = REPAIR_WORKFLOW[repair.status as RepairStatus];
        const laborCost = step.estimatedHours * 100000; // 100k VND per hour
        const totalCost = totalPartsCost + laborCost;

        await supabase
          .from("repairs")
          .update({ final_cost: totalCost })
          .eq("id", repairId);
      }
    }
  };

  // Assign technician to repair
  const assignTechnician = async (repairId: string, userId?: string) => {
    if (userId) {
      await supabase
        .from("repairs")
        .update({ technician_id: userId })
        .eq("id", repairId);
    }
  };

  // Get Vietnamese status name
  const getVietnameseStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      received: "Đã tiếp nhận",
      diagnosed: "Đã chẩn đoán",
      waiting_parts: "Chờ linh kiện",
      in_progress: "Đang sửa chữa",
      completed: "Hoàn thành",
      ready_for_pickup: "Sẵn sàng giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy"
    };
    return statusMap[status] || status;
  };

  // Check if auto-transition conditions are met
  const checkAutoTransition = useCallback(async (repairId: string) => {
    const { data: repair } = await supabase
      .from("repairs")
      .select("*")
      .eq("id", repairId)
      .single();

    if (!repair) return false;

    const step = REPAIR_WORKFLOW[repair.status as RepairStatus];
    if (!step.autoTransitionConditions) return false;

    // Check conditions (simplified for demo)
    const conditions = step.autoTransitionConditions;
    let canTransition = true;

    if (conditions.partsAvailable) {
      canTransition &&= await checkPartsAvailability(repairId);
    }

    if (canTransition && step.nextSteps.length > 0) {
      // Auto-advance to next status
      const nextStatus = step.nextSteps[0];
      await advanceRepair(repairId, nextStatus, "Tự động chuyển trạng thái", "system");
    }

    return canTransition;
  }, [advanceRepair]);

  return {
    ...state,
    getWorkflowStep,
    getAvailableActions,
    advanceRepair,
    executeAction,
    checkAutoTransition,
    getVietnameseStatus
  };
}