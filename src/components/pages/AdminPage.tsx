import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Users, Settings, Database, Shield, Plus, Edit, Trash2, Download, Upload } from 'lucide-react'

export function AdminPage() {
  const [users] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn Admin',
      email: 'admin@laptop-repair.com',
      role: 'Admin',
      status: 'Hoạt động',
      lastLogin: '2024-01-19 10:30'
    },
    {
      id: 2,
      name: 'Trần Văn B',
      email: 'technician1@laptop-repair.com',
      role: 'Kỹ thuật viên',
      status: 'Hoạt động',
      lastLogin: '2024-01-19 09:15'
    },
    {
      id: 3,
      name: 'Phạm Văn C',
      email: 'technician2@laptop-repair.com',
      role: 'Kỹ thuật viên',
      status: 'Tạm khóa',
      lastLogin: '2024-01-18 16:45'
    }
  ])

  const [systemSettings] = useState({
    shopName: 'Trung tâm sửa chữa Laptop ABC',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '028-12345678',
    email: 'info@laptop-repair.com',
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hoạt động':
        return <Badge variant="default">Hoạt động</Badge>
      case 'Tạm khóa':
        return <Badge variant="destructive">Tạm khóa</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="destructive">Admin</Badge>
      case 'Kỹ thuật viên':
        return <Badge variant="secondary">Kỹ thuật viên</Badge>
      case 'Nhân viên':
        return <Badge variant="outline">Nhân viên</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
          <p className="text-muted-foreground">Cấu hình và quản lý hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Sao lưu
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Khôi phục
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cài đặt
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cơ sở dữ liệu
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Quản lý người dùng</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm người dùng
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
                  <DialogDescription>
                    Tạo tài khoản mới cho nhân viên
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Tên người dùng</Label>
                    <Input id="userName" placeholder="Nhập tên người dùng" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input id="userEmail" type="email" placeholder="Nhập email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userRole">Vai trò</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                        <SelectItem value="staff">Nhân viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Mật khẩu tạm thời</Label>
                    <Input id="userPassword" type="password" placeholder="Nhập mật khẩu" />
                  </div>
                  <Button className="w-full">Tạo tài khoản</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>Quản lý tài khoản và quyền hạn</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Đăng nhập cuối</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-semibold">Cài đặt hệ thống</h2>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cửa hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Tên cửa hàng</Label>
                    <Input id="shopName" defaultValue={systemSettings.shopName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Số điện thoại</Label>
                    <Input id="shopPhone" defaultValue={systemSettings.phone} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Địa chỉ</Label>
                  <Input id="shopAddress" defaultValue={systemSettings.address} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopEmail">Email</Label>
                  <Input id="shopEmail" defaultValue={systemSettings.email} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotif">Thông báo email</Label>
                  <Switch id="emailNotif" defaultChecked={systemSettings.emailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotif">Thông báo SMS</Label>
                  <Switch id="smsNotif" defaultChecked={systemSettings.smsNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoBackup">Sao lưu tự động</Label>
                  <Switch id="autoBackup" defaultChecked={systemSettings.autoBackup} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <h2 className="text-2xl font-semibold">Quản lý cơ sở dữ liệu</h2>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sao lưu và khôi phục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Tạo bản sao lưu
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Khôi phục từ file
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sao lưu cuối: 19/01/2024 06:00
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê cơ sở dữ liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1,234</div>
                    <div className="text-sm text-muted-foreground">Phiếu sửa chữa</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">567</div>
                    <div className="text-sm text-muted-foreground">Khách hàng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">89</div>
                    <div className="text-sm text-muted-foreground">Linh kiện</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-sm text-muted-foreground">Người dùng</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <h2 className="text-2xl font-semibold">Cài đặt bảo mật</h2>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chế độ bảo trì</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance">Bật chế độ bảo trì</Label>
                    <p className="text-sm text-muted-foreground">
                      Ngăn người dùng truy cập hệ thống để bảo trì
                    </p>
                  </div>
                  <Switch id="maintenance" defaultChecked={systemSettings.maintenanceMode} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nhật ký hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Admin đăng nhập - 19/01/2024 10:30</p>
                  <p className="text-sm">• Tạo phiếu sửa chữa PT001 - 19/01/2024 10:25</p>
                  <p className="text-sm">• Kỹ thuật viên B đăng nhập - 19/01/2024 09:15</p>
                  <p className="text-sm">• Cập nhật linh kiện LK001 - 19/01/2024 09:00</p>
                </div>
                <Button variant="outline" className="mt-4">
                  Xem tất cả nhật ký
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
