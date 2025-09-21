import { Outlet, createRootRoute, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar'
import { LayoutDashboardIcon, WrenchIcon, PackageIcon, UsersIcon, SettingsIcon } from 'lucide-react'

const RootComponent = () => {
  const location = useLocation()

  // Define which routes should have sidebar
  const authenticatedRoutes = ['/dashboard', '/phieu', '/linh-kien', '/khach-hang', '/admin']
  const shouldShowSidebar = authenticatedRoutes.some(route => location.pathname.startsWith(route))

  const sidebarItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Phiếu sửa chữa',
      url: '/phieu',
      icon: WrenchIcon,
    },
    {
      title: 'Linh kiện',
      url: '/linh-kien',
      icon: PackageIcon,
    },
    {
      title: 'Khách hàng',
      url: '/khach-hang',
      icon: UsersIcon,
    },
    {
      title: 'Quản trị',
      url: '/admin',
      icon: SettingsIcon,
    },
  ]

  if (shouldShowSidebar) {
    return (
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
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="font-semibold">Hệ thống quản lý sửa chữa laptop</h1>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Outlet />
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
      </SidebarProvider>
    )
  }

  return (
    <>
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
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
