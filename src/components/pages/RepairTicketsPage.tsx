import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { type ColumnDef } from '@tanstack/react-table'

type Ticket = {
  id: string
  customerName: string
  customerPhone: string
  device: string
  issue: string
  status: string
  priority: string
}

export function RepairTicketsPage() {
  const tickets: Ticket[] = [
    {
      id: 'PT001',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0912345678',
      device: 'Laptop Dell Inspiron 15',
      issue: 'Máy không bật được nguồn',
      status: 'Đang sửa chữa',
      priority: 'Cao'
    },
    {
      id: 'PT002',
      customerName: 'Lê Thị Bình',
      customerPhone: '0987654321',
      device: 'MacBook Pro 13',
      issue: 'Màn hình bị vỡ',
      status: 'Chờ linh kiện',
      priority: 'Trung bình'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đang sửa chữa':
        return <Badge variant="secondary">Đang sửa chữa</Badge>
      case 'Chờ linh kiện':
        return <Badge variant="outline">Chờ linh kiện</Badge>
      case 'Hoàn thành':
        return <Badge variant="default">Hoàn thành</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "id",
      header: "Mã phiếu",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("customerName")}</div>
          <div className="text-sm text-muted-foreground">{row.original.customerPhone}</div>
        </div>
      ),
    },
    {
      accessorKey: "device",
      header: "Thiết bị",
    },
    {
      accessorKey: "issue",
      header: "Sự cố",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue("issue")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "priority",
      header: "Ưu tiên",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        return (
          <Badge variant={priority === 'Cao' ? 'destructive' : 'secondary'}>
            {priority}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý phiếu sửa chữa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu sửa chữa</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tickets}
            searchKey="customerName"
            searchPlaceholder="Tìm kiếm theo tên khách hàng..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
