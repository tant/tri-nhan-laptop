import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

// Database types
type RepairStatus = Database["public"]["Enums"]["repair_status"];

export interface AnalyticsMetrics {
  // Revenue metrics
  totalRevenue: number;
  monthlyRevenue: number;
  averageRepairValue: number;
  revenueGrowth: number;

  // Repair metrics
  totalRepairs: number;
  completedRepairs: number;
  pendingRepairs: number;
  averageRepairTime: number;

  // Customer metrics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerSatisfaction: number;

  // Parts metrics
  lowStockItems: number;
  totalInventoryValue: number;
  partsUsageValue: number;

  // Performance metrics
  technicianEfficiency: number;
  completionRate: number;
  onTimeDelivery: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  repairs: number;
  averageValue: number;
}

export interface RepairStatusDistribution {
  status: RepairStatus;
  count: number;
  percentage: number;
  vietnameseName: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  repairCount: number;
  lastVisit: string;
}

export interface PopularDevice {
  deviceType: string;
  deviceModel: string;
  count: number;
  averageCost: number;
  averageTime: number;
}

export interface TechnicianPerformance {
  id: string;
  name: string;
  completedRepairs: number;
  averageTime: number;
  customerRating: number;
  revenue: number;
}

export interface AnalyticsState {
  metrics: AnalyticsMetrics | null;
  revenueData: RevenueData[];
  statusDistribution: RepairStatusDistribution[];
  topCustomers: TopCustomer[];
  popularDevices: PopularDevice[];
  technicianPerformance: TechnicianPerformance[];
  loading: boolean;
  error: Error | null;
}

export function useAnalytics(dateRange?: { from: Date; to: Date }) {
  const [state, setState] = useState<AnalyticsState>({
    metrics: null,
    revenueData: [],
    statusDistribution: [],
    topCustomers: [],
    popularDevices: [],
    technicianPerformance: [],
    loading: false,
    error: null
  });

  // Default date range (last 30 days)
  const defaultDateRange = {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  };

  const range = dateRange || defaultDateRange;

  // Calculate key metrics
  const calculateMetrics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Get repairs in date range
      const { data: repairs, error: repairsError } = await supabase
        .from("repairs")
        .select(`
          *,
          customer:customers(id, name),
          repair_parts(total_cost)
        `)
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());

      if (repairsError) throw repairsError;

      // Get previous period for comparison
      const previousPeriod = {
        from: new Date(range.from.getTime() - (range.to.getTime() - range.from.getTime())),
        to: range.from
      };

      const { data: previousRepairs } = await supabase
        .from("repairs")
        .select("final_cost")
        .gte("created_at", previousPeriod.from.toISOString())
        .lte("created_at", previousPeriod.to.toISOString());

      // Calculate revenue metrics
      const totalRevenue = repairs?.reduce((sum, repair) => sum + (repair.final_cost || 0), 0) || 0;
      const previousRevenue = previousRepairs?.reduce((sum, repair) => sum + (repair.final_cost || 0), 0) || 0;
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Calculate repair metrics
      const totalRepairs = repairs?.length || 0;
      const completedRepairs = repairs?.filter(r => r.status === "delivered").length || 0;
      const pendingRepairs = repairs?.filter(r => !["delivered", "cancelled"].includes(r.status)).length || 0;

      // Calculate average repair time (simplified)
      const completedWithTime = repairs?.filter(r => r.status === "delivered" && r.completed_at) || [];
      const averageRepairTime = completedWithTime.length > 0
        ? completedWithTime.reduce((sum, repair) => {
            const start = new Date(repair.created_at);
            const end = new Date(repair.completed_at!);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / completedWithTime.length
        : 0;

      // Get customer metrics
      const uniqueCustomerIds = new Set(repairs?.map(r => r.customer_id));
      const totalCustomers = uniqueCustomerIds.size;

      // Get all customers for new vs returning analysis
      const { data: allCustomers } = await supabase
        .from("customers")
        .select("id, created_at");

      const newCustomers = allCustomers?.filter(customer => {
        const createdAt = new Date(customer.created_at);
        return createdAt >= range.from && createdAt <= range.to;
      }).length || 0;

      // Get customer feedback for satisfaction
      const { data: feedback } = await supabase
        .from("customer_feedback")
        .select("rating")
        .gte("submitted_at", range.from.toISOString())
        .lte("submitted_at", range.to.toISOString());

      const customerSatisfaction = feedback && feedback.length > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0;

      // Get parts metrics
      const { data: parts } = await supabase
        .from("parts")
        .select("current_stock, min_stock_level, selling_price");

      const lowStockItems = parts?.filter(p => p.current_stock <= p.min_stock_level).length || 0;
      const totalInventoryValue = parts?.reduce((sum, p) => sum + (p.current_stock * p.selling_price), 0) || 0;

      // Calculate parts usage value
      const partsUsageValue = repairs?.reduce((sum, repair) => {
        return sum + (repair.repair_parts?.reduce((partSum: number, part: any) => partSum + (part.total_cost || 0), 0) || 0);
      }, 0) || 0;

      // Performance metrics (simplified calculations)
      const completionRate = totalRepairs > 0 ? (completedRepairs / totalRepairs) * 100 : 0;
      const onTimeDelivery = 85; // Mock value - would need delivery date tracking
      const technicianEfficiency = averageRepairTime > 0 ? Math.max(0, 100 - (averageRepairTime * 10)) : 80;

      const metrics: AnalyticsMetrics = {
        totalRevenue,
        monthlyRevenue: totalRevenue, // For the selected period
        averageRepairValue: totalRepairs > 0 ? totalRevenue / totalRepairs : 0,
        revenueGrowth,
        totalRepairs,
        completedRepairs,
        pendingRepairs,
        averageRepairTime,
        totalCustomers,
        newCustomers,
        returningCustomers: totalCustomers - newCustomers,
        customerSatisfaction,
        lowStockItems,
        totalInventoryValue,
        partsUsageValue,
        technicianEfficiency,
        completionRate,
        onTimeDelivery
      };

      setState(prev => ({
        ...prev,
        metrics,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
    }
  }, [range.from, range.to]);

  // Get revenue data for charts
  const getRevenueData = useCallback(async (period: "daily" | "weekly" | "monthly" = "daily") => {
    try {
      const { data: repairs } = await supabase
        .from("repairs")
        .select("created_at, final_cost")
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString())
        .order("created_at");

      if (!repairs) return;

      // Group by period
      const groupedData: Record<string, { revenue: number; repairs: number }> = {};

      repairs.forEach(repair => {
        const date = new Date(repair.created_at);
        let key: string;

        switch (period) {
          case "weekly":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          case "monthly":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          default: // daily
            key = date.toISOString().split("T")[0];
        }

        if (!groupedData[key]) {
          groupedData[key] = { revenue: 0, repairs: 0 };
        }

        groupedData[key].revenue += repair.final_cost || 0;
        groupedData[key].repairs += 1;
      });

      const revenueData: RevenueData[] = Object.entries(groupedData).map(([period, data]) => ({
        period,
        revenue: data.revenue,
        repairs: data.repairs,
        averageValue: data.repairs > 0 ? data.revenue / data.repairs : 0
      }));

      setState(prev => ({ ...prev, revenueData }));
    } catch (error) {
      console.error("Failed to get revenue data:", error);
    }
  }, [range.from, range.to]);

  // Get repair status distribution
  const getStatusDistribution = useCallback(async () => {
    try {
      const { data: repairs } = await supabase
        .from("repairs")
        .select("status")
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());

      if (!repairs) return;

      const statusCounts: Record<RepairStatus, number> = {
        device_received: 0,
        preliminary_inspection: 0,
        awaiting_repair_plan: 0,
        approved_for_repair: 0,
        in_diagnosis: 0,
        waiting_parts: 0,
        in_repair: 0,
        quality_testing: 0,
        ready_for_pickup: 0,
        completed: 0,
        cannot_repair: 0,
        cancelled_by_customer: 0,
        repair_failed: 0,
        customer_no_show: 0,
        ready_for_return: 0,
        abandoned: 0
      };

      repairs.forEach(repair => {
        statusCounts[repair.status as RepairStatus]++;
      });

      const total = repairs.length;
      const statusDistribution: RepairStatusDistribution[] = Object.entries(statusCounts).map(([status, count]) => ({
        status: status as RepairStatus,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        vietnameseName: getVietnameseStatus(status as RepairStatus)
      }));

      setState(prev => ({ ...prev, statusDistribution }));
    } catch (error) {
      console.error("Failed to get status distribution:", error);
    }
  }, [range.from, range.to]);

  // Get top customers
  const getTopCustomers = useCallback(async () => {
    try {
      const { data: repairs } = await supabase
        .from("repairs")
        .select(`
          customer_id,
          final_cost,
          created_at,
          customer:customers(id, name, phone)
        `)
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());

      if (!repairs) return;

      // Group by customer
      const customerData: Record<string, {
        name: string;
        phone: string;
        totalSpent: number;
        repairCount: number;
        lastVisit: string;
      }> = {};

      repairs.forEach(repair => {
        const customer = repair.customer as any;
        if (!customer) return;

        const customerId = customer.id;
        if (!customerData[customerId]) {
          customerData[customerId] = {
            name: customer.name,
            phone: customer.phone,
            totalSpent: 0,
            repairCount: 0,
            lastVisit: repair.created_at
          };
        }

        customerData[customerId].totalSpent += repair.final_cost || 0;
        customerData[customerId].repairCount += 1;
        if (repair.created_at > customerData[customerId].lastVisit) {
          customerData[customerId].lastVisit = repair.created_at;
        }
      });

      const topCustomers: TopCustomer[] = Object.entries(customerData)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      setState(prev => ({ ...prev, topCustomers }));
    } catch (error) {
      console.error("Failed to get top customers:", error);
    }
  }, [range.from, range.to]);

  // Get popular devices
  const getPopularDevices = useCallback(async () => {
    try {
      const { data: repairs } = await supabase
        .from("repairs")
        .select("device_type, device_model, final_cost, created_at, completed_at")
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());

      if (!repairs) return;

      // Group by device type and model
      const deviceData: Record<string, {
        count: number;
        totalCost: number;
        totalTime: number;
        completedCount: number;
      }> = {};

      repairs.forEach(repair => {
        const key = `${repair.device_type}-${repair.device_model}`;
        if (!deviceData[key]) {
          deviceData[key] = {
            count: 0,
            totalCost: 0,
            totalTime: 0,
            completedCount: 0
          };
        }

        deviceData[key].count += 1;
        deviceData[key].totalCost += repair.final_cost || 0;

        if (repair.completed_at) {
          const start = new Date(repair.created_at);
          const end = new Date(repair.completed_at);
          deviceData[key].totalTime += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          deviceData[key].completedCount += 1;
        }
      });

      const popularDevices: PopularDevice[] = Object.entries(deviceData)
        .map(([key, data]) => {
          const [deviceType, deviceModel] = key.split("-");
          return {
            deviceType,
            deviceModel,
            count: data.count,
            averageCost: data.count > 0 ? data.totalCost / data.count : 0,
            averageTime: data.completedCount > 0 ? data.totalTime / data.completedCount : 0
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setState(prev => ({ ...prev, popularDevices }));
    } catch (error) {
      console.error("Failed to get popular devices:", error);
    }
  }, [range.from, range.to]);

  // Vietnamese status mapping
  const getVietnameseStatus = (status: RepairStatus): string => {
    const statusMap: Record<RepairStatus, string> = {
      device_received: "Tiếp nhận thiết bị",
      preliminary_inspection: "Kiểm tra sơ bộ",
      awaiting_repair_plan: "Chờ phương án sửa chữa",
      approved_for_repair: "Đã phê duyệt sửa chữa",
      in_diagnosis: "Đang chẩn đoán",
      waiting_parts: "Chờ linh kiện",
      in_repair: "Đang sửa chữa",
      quality_testing: "Kiểm tra chất lượng",
      ready_for_pickup: "Sẵn sàng nhận",
      completed: "Hoàn thành",
      cannot_repair: "Không thể sửa",
      cancelled_by_customer: "Khách hàng hủy",
      repair_failed: "Sửa chữa thất bại",
      customer_no_show: "Khách không đến",
      ready_for_return: "Sẵn sàng trả",
      abandoned: "Bỏ qua"
    };
    return statusMap[status];
  };

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Format percentage
  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  // Load all analytics data
  const loadAnalytics = useCallback(async () => {
    await Promise.all([
      calculateMetrics(),
      getRevenueData(),
      getStatusDistribution(),
      getTopCustomers(),
      getPopularDevices()
    ]);
  }, [calculateMetrics, getRevenueData, getStatusDistribution, getTopCustomers, getPopularDevices]);

  // Load analytics on mount and when date range changes
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    ...state,
    loadAnalytics,
    getRevenueData,
    formatCurrency,
    formatPercentage,
    getVietnameseStatus
  };
}