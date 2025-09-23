"use client";

import {
	BarChart3,
	FileText,
	Home,
	Monitor,
	Package,
	Settings,
	Users,
	Wrench,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

// Navigation configuration with role-based visibility
function getNavigationData(profile: any, hasPermission: any, isRole: any) {
	const shops = [
		{
			name: "Trí Nhân Laptop",
			logo: Monitor,
			plan: "Cửa hàng chính",
		},
	];

	const navMain = [
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
			],
		},
	];

	// Add inventory management for authorized users
	if (
		hasPermission("can_manage_inventory") ||
		isRole("shop_owner") ||
		isRole("manager")
	) {
		navMain.push({
			title: "Linh kiện",
			url: "#",
			icon: Package,
			items: [
				{
					title: "Kho linh kiện",
					url: "/linh-kien",
				},
			],
		});
	}

	// Add admin section for shop owners and managers
	if (
		isRole("shop_owner") ||
		isRole("manager") ||
		hasPermission("can_create_users")
	) {
		navMain.push({
			title: "Hệ thống",
			url: "#",
			icon: Settings,
			items: [
				{
					title: "Cài đặt",
					url: "/admin",
				},
			],
		});
	}

	const projects = [];

	// Add analytics dashboard for authorized users
	if (
		hasPermission("can_view_financials") ||
		isRole("shop_owner") ||
		isRole("manager")
	) {
		projects.push({
			name: "Phân tích & Báo cáo",
			url: "/analytics",
			icon: BarChart3,
		});
	}

	// Add financial reports for authorized users
	if (
		hasPermission("can_view_financials") ||
		isRole("shop_owner") ||
		isRole("manager")
	) {
		projects.push(
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
		);
	}

	// Add inventory reports for inventory managers
	if (
		hasPermission("can_manage_inventory") ||
		isRole("shop_owner") ||
		isRole("manager")
	) {
		projects.push({
			name: "Báo cáo tồn kho",
			url: "/reports/inventory",
			icon: Package,
		});
	}

	return {
		user: {
			name: profile?.full_name || "Người dùng",
			email: profile?.id || "user@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		shops,
		navMain,
		projects,
	};
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { profile, isRole } = useAuth();

	// Generate navigation data based on user role and permissions
	const data = getNavigationData(profile, () => true, isRole);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="flex items-center justify-between">
					<TeamSwitcher shops={data.shops} />
					<NotificationCenter userId={profile?.id} className="mr-2" />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{data.projects.length > 0 && <NavProjects projects={data.projects} />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
