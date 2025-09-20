import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Laptop } from "lucide-react"

function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/dashboard"
    }, 1000)
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleLogin}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="p-3 bg-[#299fce]/10 rounded-full mb-2">
          <Laptop className="h-8 w-8 text-[#299fce]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E282A]">Đăng nhập hệ thống</h1>
        <p className="text-muted-foreground text-sm text-balance text-[#6c757d]">
          Nhập thông tin đăng nhập để truy cập hệ thống quản lý tiệm sửa laptop
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@trinhanlaptop.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]"
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Mật khẩu</Label>
            <a
              href="#"
              className="ml-auto text-sm text-[#299fce] underline-offset-4 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-[#299fce] hover:bg-[#299fce]/90"
          disabled={!email || !password || isLoading}
        >
          {isLoading ? (
            <>
              <LogIn className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Đăng nhập
            </>
          )}
        </Button>
      </div>
      <div className="text-center text-sm text-[#6c757d]">
        Bạn là khách hàng?{" "}
        <a href="/" className="text-[#299fce] underline underline-offset-4">
          Tra cứu phiếu sửa chữa
        </a>
      </div>
    </form>
  )
}

export function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Computer repair technician workspace - Professional laptop and computer repair"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
