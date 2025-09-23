import { Outlet, createRootRoute, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar'
import { LayoutDashboardIcon, WrenchIcon, PackageIcon, UsersIcon, SettingsIcon, LogOut, User, Store } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { NetworkStatus } from '@/components/network-status'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function UserMenu() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{profile?.full_name || 'User'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <div className="font-medium">{profile?.full_name || 'User'}</div>
            <div className="text-sm text-muted-foreground">
              {profile?.role === 'shop_owner' ? 'Chủ tiệm' : 'Nhân viên'}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const RootComponent = () => {
  const location = useLocation()

  // Define which routes should have sidebar
  const authenticatedRoutes = ['/dashboard', '/phieu-sua-chua', '/ton-kho', '/khach-hang', '/cua-hang', '/admin']
  const shouldShowSidebar = authenticatedRoutes.some(route => location.pathname.startsWith(route))

  const sidebarItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Phiếu sửa chữa',
      url: '/phieu-sua-chua',
      icon: WrenchIcon,
    },
    {
      title: 'Khách hàng',
      url: '/khach-hang',
      icon: UsersIcon,
    },
    {
      title: 'Cửa hàng',
      url: '/cua-hang',
      icon: Store,
    },
    {
      title: 'Tồn kho',
      url: '/ton-kho',
      icon: PackageIcon,
    },
    {
      title: 'Quản trị',
      url: '/admin',
      icon: SettingsIcon,
    },
  ]

  if (shouldShowSidebar) {
    return (
      <ErrorBoundary>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                  <WrenchIcon className="size-6" />
                  <span className="font-semibold">Laptop Repair</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="border-b bg-background p-4">
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="font-semibold">Hệ thống quản lý sửa chữa laptop</h1>
                  </div>
                  <UserMenu />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </main>
            </div>
          </div>
          <TanstackDevtools
            config={{
              position: 'bottom-left',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <NetworkStatus />
        </SidebarProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Outlet />
      <TanstackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
      <NetworkStatus />
    </ErrorBoundary>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
