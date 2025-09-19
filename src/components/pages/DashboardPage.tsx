import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Wrench, Package, DollarSign, TrendingUp } from "lucide-react"

export function DashboardPage() {
  const stats = [
    { title: "Phiếu hôm nay", value: "12", icon: Wrench, color: "text-blue-600" },
    { title: "Đang sửa chữa", value: "8", icon: BarChart3, color: "text-orange-600" },
    { title: "Hoàn thành", value: "24", icon: TrendingUp, color: "text-green-600" },
    { title: "Doanh thu tháng", value: "85M", icon: DollarSign, color: "text-purple-600" },
  ]

  const recentTickets = [
    { id: "LRS001", customer: "Nguyễn Văn A", device: "MacBook Pro", status: "Đang sửa", priority: "high" },
    { id: "LRS002", customer: "Trần Thị B", device: "Dell Inspiron", status: "Chờ linh kiện", priority: "medium" },
    { id: "LRS003", customer: "Lê Văn C", device: "HP Pavilion", status: "Hoàn thành", priority: "low" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">🔧 Laptop Repair Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/phieu">Phiếu sửa chữa</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/khach-hang">Khách hàng</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/linh-kien">Linh kiện</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin">Quản lý</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Phiếu gần đây</CardTitle>
              <CardDescription>Các phiếu sửa chữa mới nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{ticket.id}</p>
                      <p className="text-sm text-gray-600">{ticket.customer} - {ticket.device}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={ticket.status === "Hoàn thành" ? "default" : "secondary"}
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Các chức năng thường dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <a href="/phieu?new=true">
                  <Wrench className="h-4 w-4 mr-2" />
                  Tạo phiếu sửa chữa mới
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/khach-hang?new=true">
                  <Users className="h-4 w-4 mr-2" />
                  Thêm khách hàng mới
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/linh-kien">
                  <Package className="h-4 w-4 mr-2" />
                  Quản lý kho linh kiện
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
