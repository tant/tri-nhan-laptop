import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Edit, Eye, Phone, Mail, MapPin } from 'lucide-react'

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const customers = [
    {
      id: 'KH001',
      name: 'Nguyễn Văn An',
      phone: '0912345678',
      email: 'nguyenvanan@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      totalRepairs: 5,
      lastRepair: '2024-01-15',
      status: 'VIP',
      notes: 'Khách hàng thân thiết, thường sửa laptop Dell'
    },
    {
      id: 'KH002',
      name: 'Lê Thị Bình',
      phone: '0987654321',
      email: 'lethibinh@email.com',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      totalRepairs: 2,
      lastRepair: '2024-01-16',
      status: 'Thường',
      notes: 'Sử dụng MacBook, cần tư vấn kỹ thuật'
    },
    {
      id: 'KH003',
      name: 'Hoàng Văn Dũng',
      phone: '0909123456',
      email: 'hoangvandung@email.com',
      address: '789 Đường DEF, Quận 7, TP.HCM',
      totalRepairs: 1,
      lastRepair: '2024-01-10',
      status: 'Mới',
      notes: 'Lần đầu sử dụng dịch vụ'
    },
    {
      id: 'KH004',
      name: 'Trần Thị Em',
      phone: '0901234567',
      email: 'tranthiem@email.com',
      address: '321 Đường GHI, Quận 5, TP.HCM',
      totalRepairs: 8,
      lastRepair: '2024-01-12',
      status: 'VIP',
      notes: 'Khách hàng doanh nghiệp, có nhiều thiết bị'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VIP':
        return <Badge variant="default">VIP</Badge>
      case 'Thường':
        return <Badge variant="secondary">Thường</Badge>
      case 'Mới':
        return <Badge variant="outline">Mới</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">Theo dõi thông tin và lịch sử khách hàng</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm khách hàng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm khách hàng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết cho khách hàng mới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Tên khách hàng</Label>
                  <Input id="customerName" placeholder="Nhập tên khách hàng" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Số điện thoại</Label>
                  <Input id="customerPhone" placeholder="Nhập số điện thoại" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input id="customerEmail" type="email" placeholder="Nhập email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Địa chỉ</Label>
                <Input id="customerAddress" placeholder="Nhập địa chỉ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Input id="notes" placeholder="Ghi chú về khách hàng" />
              </div>
              <Button className="w-full">Thêm khách hàng</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'VIP').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'Mới').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt sửa chữa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((total, customer) => total + customer.totalRepairs, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tìm kiếm khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã, tên, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>
            Tổng số {filteredCustomers.length} khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã KH</TableHead>
                <TableHead>Thông tin khách hàng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Lượt sửa chữa</TableHead>
                <TableHead>Lần cuối</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {customer.notes}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm max-w-xs">
                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell className="text-center">{customer.totalRepairs}</TableCell>
                  <TableCell>{customer.lastRepair}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
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
