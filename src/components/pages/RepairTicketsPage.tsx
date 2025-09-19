import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Eye } from 'lucide-react'

export function RepairTicketsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const tickets = [
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý phiếu sửa chữa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu sửa chữa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Sự cố</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ưu tiên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.customerName}</div>
                      <div className="text-sm text-muted-foreground">{ticket.customerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.device}</TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.issue}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.priority === 'Cao' ? 'destructive' : 'secondary'}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
