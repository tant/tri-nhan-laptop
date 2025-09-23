import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { BarChart3, Users, Wrench, Package, DollarSign, TrendingUp } from "lucide-react"

export function DashboardPage() {
  const stats = [
    { id: "today", title: "Phiếu hôm nay", value: "12", icon: Wrench, color: "text-blue-600" },
    { id: "in-progress", title: "Đang sửa chữa", value: "8", icon: BarChart3, color: "text-orange-600" },
    { id: "completed", title: "Hoàn thành", value: "24", icon: TrendingUp, color: "text-green-600" },
    { id: "revenue", title: "Doanh thu tháng", value: "85M", icon: DollarSign, color: "text-purple-600" },
  ]

  const recentTickets = [
    { id: "LRS001", customer: "Nguyễn Văn A", device: "MacBook Pro", status: "Đang sửa", priority: "high" },
    { id: "LRS002", customer: "Trần Thị B", device: "Dell Inspiron", status: "Chờ linh kiện", priority: "medium" },
    { id: "LRS003", customer: "Lê Văn C", device: "HP Pavilion", status: "Hoàn thành", priority: "low" },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống quản lý sửa chữa laptop</p>
        </div>
        <Button asChild>
          <Link to="/phieu-sua-chua" search={{ new: "true" }}>
            <Wrench className="h-4 w-4 mr-2" />
            Tạo phiếu
          </Link>
        </Button>
      </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.id}>
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
                <CardTitle>Thao tác khác</CardTitle>
                <CardDescription>Các chức năng hỗ trợ khác</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/khach-hang" search={{ new: "true" }}>
                    <Users className="h-4 w-4 mr-2" />
                    Thêm khách hàng mới
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/ton-kho">
                    <Package className="h-4 w-4 mr-2" />
                    Quản lý tồn kho
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Báo cáo & thống kê
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
    </div>
  )
}
