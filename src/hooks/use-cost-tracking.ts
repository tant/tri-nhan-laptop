import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/hooks/use-notifications';

export interface CostBreakdown {
  id: string;
  repair_id: string;
  breakdown_type: 'parts' | 'labor' | 'overhead' | 'tax' | 'discount';
  item_id?: string;
  item_name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_cost: number;
  total_price: number;
  profit_amount: number;
  profit_margin: number;
  currency: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface CostSummary {
  parts_cost: number;
  parts_revenue: number;
  labor_cost: number;
  labor_revenue: number;
  overhead_cost: number;
  total_cost: number;
  total_revenue: number;
  profit_amount: number;
  profit_margin: number;
}

export interface CustomerQuote {
  id: string;
  repair_id: string;
  quote_number: string;
  quote_version: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  subtotal_parts: number;
  subtotal_labor: number;
  subtotal_overhead: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until?: string;
  terms_conditions?: string;
  notes?: string;
  generated_by: string;
  sent_at?: string;
  customer_response?: string;
  customer_responded_at?: string;
  created_at: string;
}

export interface CostChangeHistory {
  id: string;
  repair_id: string;
  change_type: 'parts_added' | 'parts_removed' | 'labor_updated' | 'overhead_added' | 'discount_applied' | 'quote_generated';
  previous_total?: number;
  new_total?: number;
  change_amount: number;
  change_reason?: string;
  breakdown_details?: any;
  changed_by: string;
  approved_by?: string;
  approval_required: boolean;
  approved_at?: string;
  created_at: string;
}

export function useCostTracking() {
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    addNotification({
      title: type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : 'Thông báo',
      message,
      type
    });
  };

  // Add cost breakdown item
  const addCostBreakdown = useCallback(async (
    repairId: string,
    breakdownType: CostBreakdown['breakdown_type'],
    itemName: string,
    quantity: number,
    unitCost: number,
    unitPrice: number,
    itemId?: string,
    notes?: string,
    createdBy?: string
  ): Promise<CostBreakdown | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('repair_cost_breakdown')
        .insert({
          repair_id: repairId,
          breakdown_type: breakdownType,
          item_id: itemId,
          item_name: itemName,
          quantity,
          unit_cost: unitCost,
          unit_price: unitPrice,
          notes,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) throw error;

      showNotification('Đã thêm chi phí vào phiếu sửa chữa', 'success');
      return data;
    } catch (error) {
      console.error('Error adding cost breakdown:', error);
      showNotification('Lỗi khi thêm chi phí', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Remove cost breakdown item
  const removeCostBreakdown = useCallback(async (breakdownId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('repair_cost_breakdown')
        .delete()
        .eq('id', breakdownId);

      if (error) throw error;

      showNotification('Đã xóa chi phí khỏi phiếu sửa chữa', 'success');
      return true;
    } catch (error) {
      console.error('Error removing cost breakdown:', error);
      showNotification('Lỗi khi xóa chi phí', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Get cost breakdown for repair
  const getRepairCostBreakdown = useCallback(async (repairId: string): Promise<CostBreakdown[]> => {
    try {
      const { data, error } = await supabase
        .from('repair_cost_breakdown')
        .select('*')
        .eq('repair_id', repairId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting cost breakdown:', error);
      return [];
    }
  }, []);

  // Calculate repair costs using database function
  const calculateRepairCosts = useCallback(async (repairId: string): Promise<CostSummary | null> => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_repair_costs', { repair_uuid: repairId });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error calculating repair costs:', error);
      return null;
    }
  }, []);

  // Update repair totals using database function
  const updateRepairTotals = useCallback(async (repairId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('update_repair_totals', { repair_uuid: repairId });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error updating repair totals:', error);
      return false;
    }
  }, []);

  // Generate customer quote using database function
  const generateCustomerQuote = useCallback(async (
    repairId: string,
    userId: string,
    terms?: string,
    validDays: number = 30
  ): Promise<string | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc('generate_customer_quote', {
          repair_uuid: repairId,
          user_uuid: userId,
          quote_terms: terms,
          valid_days: validDays
        });

      if (error) throw error;

      showNotification('Đã tạo báo giá cho khách hàng', 'success');
      return data; // Returns quote ID
    } catch (error) {
      console.error('Error generating quote:', error);
      showNotification('Lỗi khi tạo báo giá', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Get customer quotes for repair
  const getCustomerQuotes = useCallback(async (repairId: string): Promise<CustomerQuote[]> => {
    try {
      const { data, error } = await supabase
        .from('customer_quotes')
        .select('*')
        .eq('repair_id', repairId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting quotes:', error);
      return [];
    }
  }, []);

  // Update quote status
  const updateQuoteStatus = useCallback(async (
    quoteId: string,
    status: CustomerQuote['status'],
    customerResponse?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (customerResponse) {
        updateData.customer_response = customerResponse;
        updateData.customer_responded_at = new Date().toISOString();
      }

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customer_quotes')
        .update(updateData)
        .eq('id', quoteId);

      if (error) throw error;

      const statusMessages = {
        draft: 'Báo giá đã chuyển về trạng thái nháp',
        sent: 'Đã gửi báo giá cho khách hàng',
        approved: 'Báo giá đã được khách hàng chấp thuận',
        rejected: 'Báo giá bị khách hàng từ chối',
        expired: 'Báo giá đã hết hạn'
      };

      showNotification(statusMessages[status], status === 'approved' ? 'success' : 'info');
      return true;
    } catch (error) {
      console.error('Error updating quote status:', error);
      showNotification('Lỗi khi cập nhật trạng thái báo giá', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Get cost change history
  const getCostChangeHistory = useCallback(async (repairId: string): Promise<CostChangeHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('cost_change_history')
        .select(`
          *,
          user_profiles!changed_by (
            full_name,
            email
          ),
          approval_user:user_profiles!approved_by (
            full_name,
            email
          )
        `)
        .eq('repair_id', repairId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting cost history:', error);
      return [];
    }
  }, []);

  // Approve cost change
  const approveCostChange = useCallback(async (
    changeId: string,
    approvedBy: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('cost_change_history')
        .update({
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', changeId);

      if (error) throw error;

      showNotification('Đã phê duyệt thay đổi chi phí', 'success');
      return true;
    } catch (error) {
      console.error('Error approving cost change:', error);
      showNotification('Lỗi khi phê duyệt thay đổi', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Add parts cost from parts usage
  const addPartsCost = useCallback(async (
    repairId: string,
    partId: string,
    partName: string,
    quantity: number,
    unitCost: number,
    unitPrice: number,
    createdBy?: string
  ) => {
    return await addCostBreakdown(
      repairId,
      'parts',
      partName,
      quantity,
      unitCost,
      unitPrice,
      partId,
      undefined,
      createdBy
    );
  }, [addCostBreakdown]);

  // Add labor cost
  const addLaborCost = useCallback(async (
    repairId: string,
    laborDescription: string,
    hours: number,
    hourlyRate: number,
    createdBy?: string
  ) => {
    return await addCostBreakdown(
      repairId,
      'labor',
      laborDescription,
      hours,
      hourlyRate,
      hourlyRate, // Labor cost = labor price in this case
      undefined,
      undefined,
      createdBy
    );
  }, [addCostBreakdown]);

  // Add overhead cost
  const addOverheadCost = useCallback(async (
    repairId: string,
    overheadDescription: string,
    amount: number,
    createdBy?: string
  ) => {
    return await addCostBreakdown(
      repairId,
      'overhead',
      overheadDescription,
      1,
      amount,
      0, // Overhead is pure cost, no revenue
      undefined,
      undefined,
      createdBy
    );
  }, [addCostBreakdown]);

  // Apply discount
  const applyDiscount = useCallback(async (
    repairId: string,
    discountDescription: string,
    discountAmount: number,
    createdBy?: string
  ) => {
    return await addCostBreakdown(
      repairId,
      'discount',
      discountDescription,
      1,
      0,
      -Math.abs(discountAmount), // Negative price for discount
      undefined,
      undefined,
      createdBy
    );
  }, [addCostBreakdown]);

  return {
    loading,
    addCostBreakdown,
    removeCostBreakdown,
    getRepairCostBreakdown,
    calculateRepairCosts,
    updateRepairTotals,
    generateCustomerQuote,
    getCustomerQuotes,
    updateQuoteStatus,
    getCostChangeHistory,
    approveCostChange,
    addPartsCost,
    addLaborCost,
    addOverheadCost,
    applyDiscount
  };
}