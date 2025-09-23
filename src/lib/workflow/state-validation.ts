/**
 * State Transition Validation System
 * Business rules enforcement and validation for repair workflow state changes
 */

import { RepairState, StateTransition, REPAIR_STATES, STATE_TRANSITIONS, getTransitionInfo } from './repair-states';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredActions: string[];
}

export interface TransitionContext {
  userId: string;
  userRole: string;
  ticketId: string;
  currentState: RepairState;
  targetState: RepairState;
  hasCustomerApproval?: boolean;
  hasPayment?: boolean;
  partsAvailable?: boolean;
  qualityCheckPassed?: boolean;
  customerContactAttempts?: number;
  daysInCurrentState?: number;
  metadata?: Record<string, any>;
}

export class StateValidator {
  /**
   * Validates if a state transition is allowed based on business rules
   */
  validateTransition(context: TransitionContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      requiredActions: []
    };

    // Check if transition exists in state machine
    const transitionInfo = getTransitionInfo(context.currentState, context.targetState);
    if (!transitionInfo) {
      result.isValid = false;
      result.errors.push(`Không thể chuyển từ "${REPAIR_STATES[context.currentState].label}" sang "${REPAIR_STATES[context.targetState].label}"`);
      return result;
    }

    // Validate user permissions
    this.validateUserPermissions(context, result);

    // Validate business rules for the transition
    this.validateBusinessRules(context, transitionInfo, result);

    // Validate state-specific requirements
    this.validateStateRequirements(context, result);

    // Check for warnings and recommendations
    this.addWarningsAndRecommendations(context, result);

    return result;
  }

  private validateUserPermissions(context: TransitionContext, result: ValidationResult): void {
    const currentStateDefinition = REPAIR_STATES[context.currentState];
    const targetStateDefinition = REPAIR_STATES[context.targetState];

    // Check permission for current state
    if (!currentStateDefinition.allowedRoles.includes(context.userRole)) {
      result.isValid = false;
      result.errors.push(`Bạn không có quyền thay đổi trạng thái "${currentStateDefinition.label}"`);
    }

    // Check permission for target state
    if (!targetStateDefinition.allowedRoles.includes(context.userRole)) {
      result.isValid = false;
      result.errors.push(`Bạn không có quyền chuyển sang trạng thái "${targetStateDefinition.label}"`);
    }

    // Special role validations
    if (context.targetState === 'completed' && !['manager', 'admin'].includes(context.userRole)) {
      result.warnings.push('Trạng thái hoàn thành thường yêu cầu xác nhận từ quản lý');
    }

    if (context.targetState === 'cancelled_by_customer' && !['receptionist', 'manager', 'admin'].includes(context.userRole)) {
      result.errors.push('Chỉ lễ tân hoặc quản lý mới có thể xử lý hủy đơn');
      result.isValid = false;
    }
  }

  private validateBusinessRules(context: TransitionContext, transition: StateTransition, result: ValidationResult): void {
    // Validate based on specific business rules for each transition
    switch (`${context.currentState}_to_${context.targetState}`) {
      case 'awaiting_repair_plan_to_approved_for_repair':
        if (!context.hasCustomerApproval) {
          result.isValid = false;
          result.errors.push('Cần có xác nhận từ khách hàng trước khi duyệt sửa chữa');
          result.requiredActions.push('Liên hệ khách hàng để xác nhận báo giá');
        }
        if (!context.hasPayment) {
          result.isValid = false;
          result.errors.push('Cần thanh toán cọc trước khi bắt đầu sửa chữa');
          result.requiredActions.push('Thu tiền cọc từ khách hàng');
        }
        break;

      case 'approved_for_repair_to_waiting_parts':
        if (context.partsAvailable === true) {
          result.warnings.push('Linh kiện đã có sẵn, có thể chuyển thẳng sang sửa chữa');
        }
        break;

      case 'waiting_parts_to_in_repair':
        if (!context.partsAvailable) {
          result.isValid = false;
          result.errors.push('Chưa có đủ linh kiện để bắt đầu sửa chữa');
          result.requiredActions.push('Kiểm tra và xác nhận linh kiện đã về');
        }
        break;

      case 'quality_testing_to_ready_for_pickup':
        if (!context.qualityCheckPassed) {
          result.isValid = false;
          result.errors.push('Chưa vượt qua kiểm tra chất lượng');
          result.requiredActions.push('Hoàn thành tất cả các bước kiểm tra chất lượng');
        }
        break;

      case 'ready_for_pickup_to_abandoned':
        const daysWaiting = context.daysInCurrentState || 0;
        const contactAttempts = context.customerContactAttempts || 0;

        if (daysWaiting < 30) {
          result.isValid = false;
          result.errors.push('Chưa đủ 30 ngày để coi là bỏ lại');
        }
        if (contactAttempts < 3) {
          result.isValid = false;
          result.errors.push('Cần ít nhất 3 lần liên hệ khách hàng trước khi coi là bỏ lại');
          result.requiredActions.push('Thêm các lần liên hệ khách hàng');
        }
        break;

      case 'delivered_to_warranty_claim':
        const daysSinceDelivery = context.daysInCurrentState || 0;
        if (daysSinceDelivery > 90) {
          result.warnings.push('Đã quá thời gian bảo hành thông thường (90 ngày)');
        }
        break;
    }

    // Terminal state protection
    if (REPAIR_STATES[context.currentState].isTerminal && context.targetState !== 'warranty_claim') {
      result.warnings.push('Đang chuyển từ trạng thái đã kết thúc. Cần xác nhận đặc biệt.');
    }
  }

  private validateStateRequirements(context: TransitionContext, result: ValidationResult): void {
    const targetStateDefinition = REPAIR_STATES[context.targetState];

    // Validate customer approval requirement
    if (targetStateDefinition.requiresCustomerApproval && !context.hasCustomerApproval) {
      result.isValid = false;
      result.errors.push(`Trạng thái "${targetStateDefinition.label}" yêu cầu xác nhận từ khách hàng`);
      result.requiredActions.push('Lấy xác nhận từ khách hàng');
    }

    // Validate payment requirement
    if (targetStateDefinition.requiresPayment && !context.hasPayment) {
      result.isValid = false;
      result.errors.push(`Trạng thái "${targetStateDefinition.label}" yêu cầu thanh toán`);
      result.requiredActions.push('Xử lý thanh toán');
    }

    // Check for conditional transitions
    const transitionInfo = getTransitionInfo(context.currentState, context.targetState);
    if (transitionInfo?.condition) {
      this.validateCondition(transitionInfo.condition, context, result);
    }
  }

  private validateCondition(condition: string, context: TransitionContext, result: ValidationResult): void {
    switch (condition) {
      case 'parts_needed':
        if (context.partsAvailable === true) {
          result.warnings.push('Linh kiện đã có sẵn, có thể bỏ qua việc chờ linh kiện');
        }
        break;

      case 'diagnosis_needed':
        if (context.metadata?.diagnosisComplete) {
          result.warnings.push('Chẩn đoán đã hoàn thành, có thể chuyển thẳng sang sửa chữa');
        }
        break;

      case 'ready_to_repair':
        if (!context.partsAvailable) {
          result.isValid = false;
          result.errors.push('Chưa có đủ linh kiện để sửa chữa');
        }
        if (!context.metadata?.technicianAssigned) {
          result.warnings.push('Chưa phân công kỹ thuật viên');
        }
        break;

      case 'payment_incomplete':
        if (context.hasPayment) {
          result.warnings.push('Thanh toán đã hoàn thành, có thể chuyển thẳng sang hoàn thành');
        }
        break;
    }
  }

  private addWarningsAndRecommendations(context: TransitionContext, result: ValidationResult): void {
    const targetStateDefinition = REPAIR_STATES[context.targetState];
    const currentStateDefinition = REPAIR_STATES[context.currentState];

    // Time-based warnings
    const daysInCurrentState = context.daysInCurrentState || 0;

    if (daysInCurrentState > 7 && currentStateDefinition.category === 'active') {
      result.warnings.push(`Đã ở trạng thái "${currentStateDefinition.label}" quá 7 ngày`);
    }

    if (daysInCurrentState > 30) {
      result.warnings.push('Cần xem xét liên hệ khách hàng về tiến độ');
    }

    // Customer notification recommendations
    if (targetStateDefinition.notifyCustomer) {
      result.requiredActions.push('Gửi thông báo cập nhật trạng thái cho khách hàng');
    }

    // Auto-advance recommendations
    if (targetStateDefinition.autoAdvanceAfter) {
      result.warnings.push(`Trạng thái này sẽ tự động chuyển sau ${targetStateDefinition.autoAdvanceAfter} phút`);
    }

    // Quality recommendations
    if (context.targetState === 'in_repair' && !context.metadata?.repairPlanApproved) {
      result.warnings.push('Nên có kế hoạch sửa chữa chi tiết trước khi bắt đầu');
    }

    if (context.targetState === 'delivered' && !context.metadata?.customerSatisfactionChecked) {
      result.requiredActions.push('Kiểm tra sự hài lòng của khách hàng');
    }

    // Special state recommendations
    if (context.targetState === 'on_hold') {
      result.requiredActions.push('Ghi rõ lý do tạm dừng và thời gian dự kiến tiếp tục');
    }

    if (context.targetState === 'warranty_claim') {
      result.requiredActions.push('Xác minh thời hạn bảo hành và điều kiện áp dụng');
    }
  }

  /**
   * Validates bulk state transitions (for batch operations)
   */
  validateBulkTransition(
    contexts: TransitionContext[],
    targetState: RepairState
  ): { success: TransitionContext[]; failed: Array<{ context: TransitionContext; result: ValidationResult }> } {
    const success: TransitionContext[] = [];
    const failed: Array<{ context: TransitionContext; result: ValidationResult }> = [];

    for (const context of contexts) {
      const contextWithTarget = { ...context, targetState };
      const result = this.validateTransition(contextWithTarget);

      if (result.isValid) {
        success.push(contextWithTarget);
      } else {
        failed.push({ context: contextWithTarget, result });
      }
    }

    return { success, failed };
  }

  /**
   * Gets recommended next states based on current state and context
   */
  getRecommendedNextStates(context: Omit<TransitionContext, 'targetState'>): RepairState[] {
    const validTransitions = STATE_TRANSITIONS
      .filter(t => t.from === context.currentState)
      .map(t => t.to);

    const recommended: RepairState[] = [];

    for (const targetState of validTransitions) {
      const transitionContext = { ...context, targetState };
      const result = this.validateTransition(transitionContext);

      if (result.isValid || (result.errors.length === 0 && result.warnings.length > 0)) {
        recommended.push(targetState);
      }
    }

    return recommended;
  }
}

export const stateValidator = new StateValidator();