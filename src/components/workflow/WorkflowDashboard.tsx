/**
 * Workflow Dashboard Component
 * Overview of all tickets by state with bulk operations and analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { useRepairWorkflow, WorkflowTicket } from '@/hooks/use-repair-workflow';
import { RepairState, REPAIR_STATES, getStatesByCategory } from '@/lib/workflow/repair-states';
import { WorkflowStatus } from './WorkflowStatus';
import { Search, Filter, BarChart3, Users, Clock, AlertTriangle } from 'lucide-react';

interface WorkflowDashboardProps {
  userRole: string;
  userId: string;
}

export function WorkflowDashboard({ userRole, userId }: WorkflowDashboardProps) {
  const {
    tickets,
    workflowStats,
    loading,
    error,
    loadTickets,
    bulkChangeState,
    getStateLabel,
    getStateColor,
    getStateCategory
  } = useRepairWorkflow();

  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'completed' | 'cancelled' | 'special'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<WorkflowTicket | null>(null);

  // Filter tickets based on selected tab and search criteria
  const filteredTickets = tickets.filter(ticket => {
    // Filter by category
    if (selectedTab !== 'all') {
      const stateCategory = getStateCategory(ticket.current_state);
      if (stateCategory !== selectedTab) return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !ticket.device_info.toLowerCase().includes(searchLower) &&
        !ticket.customer_phone.includes(searchTerm) &&
        !getStateLabel(ticket.current_state).toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filter by technician
    if (selectedTechnician && ticket.assigned_technician !== selectedTechnician) {
      return false;
    }

    return true;
  });

  // Get unique technicians for filter
  const technicians = Array.from(new Set(tickets.map(t => t.assigned_technician).filter(Boolean)));

  // Calculate state statistics
  const stateStats = React.useMemo(() => {
    const stats: Record<RepairState, number> = {} as any;
    Object.keys(REPAIR_STATES).forEach(state => {
      stats[state as RepairState] = 0;
    });

    tickets.forEach(ticket => {
      stats[ticket.current_state]++;
    });

    return stats;
  }, [tickets]);

  // Get bottleneck states (states with many tickets)
  const bottlenecks = React.useMemo(() => {
    return Object.entries(stateStats)
      .filter(([_, count]) => count > 5)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([state, count]) => ({
        state: state as RepairState,
        count,
        label: getStateLabel(state as RepairState),
        color: getStateColor(state as RepairState)
      }));
  }, [stateStats, getStateLabel, getStateColor]);

  const handleBulkStateChange = async (newState: RepairState) => {
    if (selectedTickets.length === 0) return;

    const result = await bulkChangeState(selectedTickets, newState, {
      reason: `Thay đổi hàng loạt sang ${getStateLabel(newState)}`,
      userId,
      userRole
    });

    if (result.success.length > 0) {
      setSelectedTickets([]);
      await loadTickets();
    }

    if (result.failed.length > 0) {
      alert(`Có ${result.failed.length} phiếu không thể thay đổi trạng thái`);
    }
  };

  const columns = [
    {
      id: 'select',
      header: '',
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={selectedTickets.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTickets(prev => [...prev, row.original.id]);
            } else {
              setSelectedTickets(prev => prev.filter(id => id !== row.original.id));
            }
          }}
        />
      ),
    },
    {
      accessorKey: 'device_info',
      header: 'Thiết bị',
      cell: ({ row }: any) => (
        <div className="cursor-pointer hover:text-blue-600" onClick={() => setSelectedTicket(row.original)}>
          <div className="font-medium">{row.original.device_info}</div>
          <div className="text-sm text-gray-500">{row.original.customer_phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'current_state',
      header: 'Trạng thái',
      cell: ({ row }: any) => {
        const state = REPAIR_STATES[row.original.current_state];
        return (
          <Badge
            variant="outline"
            style={{ borderColor: state.color, color: state.color }}
          >
            {state.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assigned_technician',
      header: 'Kỹ thuật viên',
      cell: ({ row }: any) => row.original.assigned_technician || 'Chưa phân công',
    },
    {
      accessorKey: 'created_at',
      header: 'Ngày tạo',
      cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString('vi-VN'),
    },
    {
      accessorKey: 'updated_at',
      header: 'Cập nhật cuối',
      cell: ({ row }: any) => new Date(row.original.updated_at).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bảng điều khiển quy trình</h1>
          <p className="text-gray-600">Quản lý 16 trạng thái sửa chữa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadTickets()}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phiếu</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">Tất cả phiếu sửa chữa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => getStateCategory(t.current_state) === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Phiếu đang được xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => getStateCategory(t.current_state) === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Phiếu đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nghẽn cổ chai</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bottlenecks.length}</div>
            <p className="text-xs text-muted-foreground">Trạng thái cần chú ý</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottlenecks Alert */}
      {bottlenecks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">Trạng thái cần chú ý</CardTitle>
            <CardDescription className="text-orange-700">
              Các trạng thái có nhiều phiếu đang chờ xử lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {bottlenecks.map(({ state, count, label, color }) => (
                <div key={state} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium">{label}</span>
                  <Badge variant="secondary">{count} phiếu</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm thiết bị, số điện thoại, trạng thái..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo kỹ thuật viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả kỹ thuật viên</SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTickets.length > 0 && (
              <Select onValueChange={(value) => handleBulkStateChange(value as RepairState)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chuyển trạng thái hàng loạt" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPAIR_STATES).map(([state, info]) => (
                    <SelectItem key={state} value={state}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets by Category */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Tất cả ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Đang xử lý ({tickets.filter(t => getStateCategory(t.current_state) === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Hoàn thành ({tickets.filter(t => getStateCategory(t.current_state) === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Đã hủy ({tickets.filter(t => getStateCategory(t.current_state) === 'cancelled').length})
          </TabsTrigger>
          <TabsTrigger value="special">
            Đặc biệt ({tickets.filter(t => getStateCategory(t.current_state) === 'special').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Danh sách phiếu sửa chữa
                  {selectedTickets.length > 0 && (
                    <span className="text-sm font-normal text-blue-600 ml-2">
                      ({selectedTickets.length} đã chọn)
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTickets(filteredTickets.map(t => t.id))}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTickets([])}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">Lỗi: {error}</div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredTickets}
                  searchable={false}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chi tiết phiếu sửa chữa</h2>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Đóng
                </Button>
              </div>
              <WorkflowStatus
                ticket={selectedTicket}
                userRole={userRole}
                userId={userId}
                onStateChange={() => {
                  loadTickets();
                  setSelectedTicket(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}