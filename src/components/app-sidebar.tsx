"use client"

import {
  Monitor,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  Wrench,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Nguyễn Văn An",
    email: "admin@trinhanlaptop.vn",
    avatar: "/avatars/shadcn.jpg",
  },
  shops: [
    {
      name: "Trí Nhân Laptop",
      logo: Monitor,
      plan: "Cửa hàng chính",
    },
  ],
  navMain: [
    {
      title: "Quản lý",
      url: "#",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Tổng quan",
          url: "/dashboard",
        },
        {
          title: "Thống kê",
          url: "/dashboard/stats",
        },
      ],
    },
    {
      title: "Phiếu sửa chữa",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Danh sách phiếu",
          url: "/phieu",
        },
        {
          title: "Tạo phiếu mới",
          url: "/phieu/tao-moi",
        },
        {
          title: "Lịch hẹn",
          url: "/phieu/lich-hen",
        },
      ],
    },
    {
      title: "Khách hàng",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Danh sách khách hàng",
          url: "/khach-hang",
        },
        {
          title: "Thêm khách hàng",
          url: "/khach-hang/them-moi",
        },
      ],
    },
    {
      title: "Linh kiện",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Kho linh kiện",
          url: "/linh-kien",
        },
        {
          title: "Nhập kho",
          url: "/linh-kien/nhap-kho",
        },
        {
          title: "Xuất kho",
          url: "/linh-kien/xuat-kho",
        },
      ],
    },
    {
      title: "Hệ thống",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Cài đặt",
          url: "/admin",
        },
        {
          title: "Quản lý người dùng",
          url: "/admin/users",
        },
        {
          title: "Sao lưu dữ liệu",
          url: "/admin/backup",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Báo cáo doanh thu",
      url: "/reports/revenue",
      icon: BarChart3,
    },
    {
      name: "Báo cáo sửa chữa",
      url: "/reports/repairs",
      icon: Wrench,
    },
    {
      name: "Báo cáo tồn kho",
      url: "/reports/inventory",
      icon: Package,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher shops={data.shops} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}