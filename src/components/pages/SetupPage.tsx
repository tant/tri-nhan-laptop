import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SetupPage() {
  const [adminPassword, setAdminPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)

  const handleSetup = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSetupComplete(true)
    }, 2000)
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Setup hoàn tất!</CardTitle>
            <CardDescription>
              Database đã được khởi tạo và tài khoản admin đã được tạo
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/login">Đăng nhập ngay</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Khởi tạo hệ thống</CardTitle>
            <CardDescription>
              Nhập mật khẩu admin để setup database ban đầu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu Admin</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSetup}
              className="w-full"
              disabled={!adminPassword || isLoading}
            >
              {isLoading ? "Đang khởi tạo..." : "Khởi tạo hệ thống"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
