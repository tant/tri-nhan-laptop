import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Edit, Package, AlertTriangle } from 'lucide-react'

export function PartsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const parts = [
    {
      id: 'LK001',
      name: 'Màn hình Laptop Dell 15.6"',
      category: 'Màn hình',
      brand: 'Dell',
      model: 'Inspiron 15',
      price: 2500000,
      stock: 5,
      minStock: 2,
      supplier: 'Công ty TNHH ABC',
      location: 'Kệ A1'
    },
    {
      id: 'LK002',
      name: 'Pin MacBook Pro 13"',
      category: 'Pin',
      brand: 'Apple',
      model: 'MacBook Pro 13"',
      price: 3200000,
      stock: 1,
      minStock: 2,
      supplier: 'Công ty TNHH XYZ',
      location: 'Kệ B2'
    },
    {
      id: 'LK003',
      name: 'RAM DDR4 8GB',
      category: 'RAM',
      brand: 'Kingston',
      model: 'DDR4-3200',
      price: 1500000,
      stock: 10,
      minStock: 5,
      supplier: 'Công ty TNHH DEF',
      location: 'Kệ C1'
    },
    {
      id: 'LK004',
      name: 'Quạt tản nhiệt Asus',
      category: 'Tản nhiệt',
      brand: 'Asus',
      model: 'ROG Strix',
      price: 800000,
      stock: 0,
      minStock: 3,
      supplier: 'Công ty TNHH GHI',
      location: 'Kệ D3'
    }
  ]

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>
    } else if (stock <= minStock) {
      return <Badge variant="outline">Sắp hết</Badge>
    } else {
      return <Badge variant="secondary">Còn hàng</Badge>
    }
  }

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const lowStockParts = parts.filter(part => part.stock <= part.minStock)

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý linh kiện</h1>
          <p className="text-muted-foreground">Theo dõi kho linh kiện và phụ kiện laptop</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm linh kiện
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm linh kiện mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết cho linh kiện mới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partName">Tên linh kiện</Label>
                  <Input id="partName" placeholder="Nhập tên linh kiện" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screen">Màn hình</SelectItem>
                      <SelectItem value="battery">Pin</SelectItem>
                      <SelectItem value="ram">RAM</SelectItem>
                      <SelectItem value="cooling">Tản nhiệt</SelectItem>
                      <SelectItem value="keyboard">Bàn phím</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Thương hiệu</Label>
                  <Input id="brand" placeholder="Nhập thương hiệu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Nhập model" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá</Label>
                  <Input id="price" type="number" placeholder="Nhập giá" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng</Label>
                  <Input id="stock" type="number" placeholder="Số lượng" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Tồn kho tối thiểu</Label>
                  <Input id="minStock" type="number" placeholder="Tối thiểu" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Nhà cung cấp</Label>
                  <Input id="supplier" placeholder="Nhập nhà cung cấp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Vị trí</Label>
                  <Input id="location" placeholder="Vị trí trong kho" />
                </div>
              </div>
              <Button className="w-full">Thêm linh kiện</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockParts.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Cảnh báo tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-2">
              Có {lowStockParts.length} linh kiện sắp hết hoặc đã hết hàng:
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockParts.map(part => (
                <Badge key={part.id} variant="outline" className="text-orange-700 border-orange-300">
                  {part.name} ({part.stock}/{part.minStock})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tìm theo tên, mã, thương hiệu, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="category">Danh mục</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Màn hình">Màn hình</SelectItem>
                  <SelectItem value="Pin">Pin</SelectItem>
                  <SelectItem value="RAM">RAM</SelectItem>
                  <SelectItem value="Tản nhiệt">Tản nhiệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách linh kiện</CardTitle>
          <CardDescription>
            Tổng số {filteredParts.length} linh kiện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên linh kiện</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-muted-foreground">{part.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>{part.category}</TableCell>
                  <TableCell>{part.brand}</TableCell>
                  <TableCell>{formatPrice(part.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {part.stock}
                    </div>
                  </TableCell>
                  <TableCell>{getStockBadge(part.stock, part.minStock)}</TableCell>
                  <TableCell>{part.location}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
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
