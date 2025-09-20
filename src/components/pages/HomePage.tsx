import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Phone, Laptop, Wrench, Zap, Shield, MapPin, Clock, Mail, MessageCircle, CheckCircle, AlertCircle } from "lucide-react"

interface RepairStatus {
  ticketNumber: string
  customerName: string
  deviceModel: string
  issueDescription: string
  currentStatus: 'received' | 'diagnosing' | 'repairing' | 'completed' | 'ready_pickup'
  estimatedCompletion: Date
  totalCost?: number
  completedServices: string[]
  nextSteps: string
}

export function HomePage() {
  const [ticketNumber, setTicketNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<RepairStatus | null>(null)
  const [error, setError] = useState("")

  const validateTicketNumber = (ticket: string) => {
    const pattern = /^MS\d+$/
    return pattern.test(ticket)
  }

  const validatePhoneNumber = (phone: string) => {
    const pattern = /^(09|03|07|08|05)\d{8}$/
    return pattern.test(phone)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError("")

    if (!validateTicketNumber(ticketNumber)) {
      setError("Số phiếu không đúng định dạng (MS + số)")
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Số điện thoại không đúng định dạng")
      return
    }

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
      // Mock search result
      if (ticketNumber === "MS001" && phoneNumber.includes("123")) {
        setSearchResult({
          ticketNumber: "MS001",
          customerName: "Nguyễn Văn A",
          deviceModel: "MacBook Pro 13\" 2021",
          issueDescription: "Màn hình bị nứt, bàn phím không hoạt động",
          currentStatus: 'repairing',
          estimatedCompletion: new Date('2024-12-25'),
          totalCost: 1500000,
          completedServices: ["Chẩn đoán lỗi", "Đặt hàng linh kiện"],
          nextSteps: "Thay màn hình mới, kiểm tra bàn phím"
        })
      } else {
        setError("Không tìm thấy phiếu sửa chữa với thông tin này")
        setSearchResult(null)
      }
    }, 1000)
  }

  const getStatusBadge = (status: RepairStatus['currentStatus']) => {
    const statusMap = {
      received: { text: "Đã tiếp nhận", variant: "secondary" as const, icon: Search },
      diagnosing: { text: "Đang chẩn đoán", variant: "outline" as const, icon: Wrench },
      repairing: { text: "Đang sửa chữa", variant: "default" as const, icon: Wrench },
      completed: { text: "Hoàn thành", variant: "default" as const, icon: CheckCircle },
      ready_pickup: { text: "Sẵn sàng giao", variant: "default" as const, icon: Phone }
    }
    return statusMap[status]
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#299fce] rounded-lg">
              <Laptop className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1E282A]">Trí Nhân Laptop</h1>
          </div>
          <div className="flex items-center gap-2 text-[#299fce] font-medium">
            <Phone className="h-4 w-4" />
            <span>0988 661 875</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-[#299fce]/5 to-[#1E282A]/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Side - Company Introduction */}
            <div className="lg:col-span-3 space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#1E282A] leading-tight">
                Chuyên Sửa Chữa Laptop Chuyên Nghiệp
              </h1>

              <p className="text-xl text-[#6c757d] font-medium">
                <strong className="text-[#299fce]">Trí Nhân Laptop</strong> - Đồng hành cùng công nghệ của bạn
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#299fce]" />
                  <span className="text-lg"><strong>7+ năm kinh nghiệm</strong> sửa chữa laptop, macbook</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#299fce]" />
                  <span className="text-lg"><strong>Chẩn đoán chính xác</strong> bằng sơ đồ kỹ thuật</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#299fce]" />
                  <span className="text-lg"><strong>Thay thế linh kiện</strong> chính hãng, bảo hành</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#299fce]" />
                  <span className="text-lg"><strong>Tư vấn miễn phí</strong> qua điện thoại</span>
                </div>
              </div>

              <blockquote className="text-lg italic text-[#6c757d] border-l-4 border-[#299fce] pl-4">
                "Theo đuổi đam mê, thành công sẽ theo bạn"
              </blockquote>

              <Button className="bg-[#299fce] hover:bg-[#299fce]/90 text-white px-8 py-3 text-lg">
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Right Side - Lookup Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-[#299fce]/20">
                <CardHeader className="bg-[#299fce]/10">
                  <CardTitle className="flex items-center gap-2 text-[#1E282A]">
                    <Search className="h-6 w-6 text-[#299fce]" />
                    Tra Cứu Tình Trạng Sửa Chữa
                  </CardTitle>
                  <CardDescription className="text-[#6c757d]">
                    Nhập thông tin để kiểm tra máy của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticket" className="text-[#1E282A] font-medium">Số phiếu sửa chữa</Label>
                      <Input
                        id="ticket"
                        type="text"
                        placeholder="MS001, MS002..."
                        value={ticketNumber}
                        onChange={(e) => setTicketNumber(e.target.value)}
                        className="border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#1E282A] font-medium">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="09xxxxxxxx"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={!ticketNumber || !phoneNumber || isSearching}
                      className="w-full bg-[#299fce] hover:bg-[#299fce]/90 text-white py-3"
                    >
                      {isSearching ? "Đang tra cứu..." : "TRA CỨU"}
                    </Button>

                    <p className="text-sm text-[#6c757d] flex items-center gap-2">
                      💡 Số phiếu được cung cấp khi gửi máy
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Search Result */}
      {searchResult && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card className="shadow-xl border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Thông Tin Phiếu Sửa Chữa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Số Phiếu</Label>
                    <p className="font-mono text-lg font-bold">{searchResult.ticketNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Khách Hàng</Label>
                    <p className="text-lg">{searchResult.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Thiết Bị</Label>
                    <p className="text-lg">{searchResult.deviceModel}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Vấn Đề</Label>
                    <p className="text-lg">{searchResult.issueDescription}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tình Trạng</Label>
                    <div className="mt-1">
                      {(() => {
                        const statusInfo = getStatusBadge(searchResult.currentStatus)
                        const IconComponent = statusInfo.icon
                        return (
                          <Badge variant={statusInfo.variant} className="text-sm">
                            <IconComponent className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dự Kiến Hoàn Thành</Label>
                    <p className="text-lg">{searchResult.estimatedCompletion.toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {searchResult.totalCost && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-gray-600">Chi Phí Dự Kiến</Label>
                    <p className="text-2xl font-bold text-[#299fce]">
                      {searchResult.totalCost.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-600">Tiến Độ Hoàn Thành</Label>
                  <ul className="mt-2 space-y-1">
                    {searchResult.completedServices.map((service) => (
                      <li key={service} className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        {service}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[#6c757d]">
                    <strong>Bước tiếp theo:</strong> {searchResult.nextSteps}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E282A] mb-4">Dịch Vụ Chuyên Nghiệp</h2>
            <p className="text-lg text-[#6c757d]">Chúng tôi cung cấp dịch vụ sửa chữa laptop toàn diện</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-[#299fce]/10 rounded-full">
                    <Laptop className="h-8 w-8 text-[#299fce]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1E282A] mb-2">Sửa Chữa Laptop</h3>
                <p className="text-[#6c757d]">Chẩn đoán và sửa chữa các lỗi phần cứng, phần mềm</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-[#299fce]/10 rounded-full">
                    <Wrench className="h-8 w-8 text-[#299fce]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1E282A] mb-2">Thay Thế Linh Kiện</h3>
                <p className="text-[#6c757d]">Ram, ổ cứng, bàn phím, màn hình, mainboard</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-[#299fce]/10 rounded-full">
                    <Zap className="h-8 w-8 text-[#299fce]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1E282A] mb-2">Nâng Cấp Hiệu Năng</h3>
                <p className="text-[#6c757d]">Nâng cấp SSD, RAM tối ưu hiệu suất máy</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-[#299fce]/10 rounded-full">
                    <Shield className="h-8 w-8 text-[#299fce]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1E282A] mb-2">Bảo Hành Uy Tín</h3>
                <p className="text-[#6c757d]">Bảo hành chính hãng hỗ trợ sau bán hàng</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E282A] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold mb-6">Thông Tin Liên Hệ</h3>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[#299fce]">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Địa Chỉ</span>
                </div>
                <p className="text-gray-300">
                  251 Vườn Lài, Phường Phú Thọ Hoà<br />
                  Quận Tân Phú, TP Hồ Chí Minh
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[#299fce]">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Giờ Làm Việc</span>
                </div>
                <div className="text-gray-300">
                  <p>Sáng: 8:30 - 12:30</p>
                  <p>Chiều: 14:30 - 18:00</p>
                  <p>Thứ 2 - Thứ 7</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[#299fce]">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">Liên Hệ</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>0988 661 875</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>nhan@trinhanlaptop.vn</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>trinhanlaptop</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6 mt-8">
              <p className="text-gray-400">
                Bạn là nhân viên?{" "}
                <a href="/login" className="text-[#299fce] hover:underline font-medium">
                  Đăng nhập tại đây
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}