import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatus } from "@/components/network-status";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getSuccessMessage } from "@/lib/auth-errors";
import { TanstackDevtools } from "@tanstack/react-devtools";
import {
	Link,
	Outlet,
	createRootRoute,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
	LayoutDashboardIcon,
	LogOut,
	PackageIcon,
	SettingsIcon,
	Store,
	User,
	UsersIcon,
	WrenchIcon,
} from "lucide-react";

function UserMenu() {
	const { profile, signOut } = useAuth();
	const { toast } = useToast();

	const handleSignOut = async () => {
		await signOut();
		toast({
			variant: "success",
			title: "Đăng xuất thành công!",
			description: getSuccessMessage("logoutSuccess"),
		});
		setTimeout(() => {
			window.location.href = "/login";
		}, 1000);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="gap-2">
					<User className="h-4 w-4" />
					<span className="hidden md:inline">
						{profile?.full_name || "User"}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div>
						<div className="font-medium">{profile?.full_name || "User"}</div>
						<div className="text-sm text-muted-foreground">
							{profile?.role === "shop_owner" ? "Chủ tiệm" : "Nhân viên"}
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
	);
}

const RootComponent = () => {
	const location = useLocation();
	const { profile } = useAuth();

	// Define which routes should have sidebar
	const authenticatedRoutes = [
		"/dashboard",
		"/phieu-sua-chua",
		"/ton-kho",
		"/khach-hang",
		"/cua-hang",
		"/admin",
	];
	const shouldShowSidebar = authenticatedRoutes.some((route) =>
		location.pathname.startsWith(route),
	);

	const navigationGroups = [
		{
			label: "Hoạt động hàng ngày",
			items: [
				{
					title: "Dashboard",
					url: "/dashboard",
					icon: LayoutDashboardIcon,
				},
				{
					title: "Phiếu sửa chữa",
					url: "/phieu-sua-chua",
					icon: WrenchIcon,
				},
			],
		},
		{
			label: "Quản lý chung",
			items: [
				{
					title: "Khách hàng",
					url: "/khach-hang",
					icon: UsersIcon,
				},
				{
					title: "Tồn kho",
					url: "/ton-kho",
					icon: PackageIcon,
				},
				{
					title: "Cửa hàng",
					url: "/cua-hang",
					icon: Store,
				},
			],
		},
		{
			label: "Hệ thống",
			items: [
				{
					title: "Quản trị",
					url: "/admin",
					icon: SettingsIcon,
				},
			],
			requiresRole: "shop_owner", // Only show to shop owners
		},
	];

	if (shouldShowSidebar) {
		return (
			<ErrorBoundary>
				<SidebarProvider>
					<div className="flex h-screen w-full">
						<Sidebar className="border-r border-[#299fce]/20">
							<SidebarHeader className="border-b border-[#299fce]/10">
								<div className="flex items-center justify-center px-4 py-4 bg-gradient-to-r from-[#299fce]/5 to-transparent">
									<img
										src="/trinhan_logo.svg"
										alt="Trí Nhân Laptop"
										className="h-8 w-auto"
									/>
								</div>
							</SidebarHeader>
							<SidebarContent className="p-2">
								{navigationGroups.map((group, groupIndex) => {
									// Filter groups based on role requirements
									if (group.requiresRole && profile?.role !== group.requiresRole) {
										return null;
									}

									return (
										<div key={group.label}>
											<SidebarGroup>
												<SidebarGroupLabel className="text-[#299fce]/70 font-medium text-xs uppercase tracking-wider mb-2">
													{group.label}
												</SidebarGroupLabel>
												<SidebarGroupContent>
													<SidebarMenu>
														{group.items.map((item) => {
															const isActive = location.pathname === item.url ||
																(item.url !== "/dashboard" && location.pathname.startsWith(item.url));
															return (
																<SidebarMenuItem key={item.url}>
																	<SidebarMenuButton
																		asChild
																		isActive={isActive}
																		className={`
																			hover:bg-[#299fce]/10 hover:text-[#299fce] hover:border-l-2 hover:border-[#299fce]/20
																			data-[active=true]:bg-[#299fce]/10 data-[active=true]:text-[#299fce]
																			data-[active=true]:border-l-2 data-[active=true]:border-[#299fce]
																			transition-all duration-200
																		`}
																	>
																		<Link to={item.url} className="flex items-center gap-2 w-full">
																			<item.icon className="size-4" />
																			<span>{item.title}</span>
																		</Link>
																	</SidebarMenuButton>
																</SidebarMenuItem>
															);
														})}
													</SidebarMenu>
												</SidebarGroupContent>
											</SidebarGroup>
											{/* Add separator between groups, but not after the last one */}
											{groupIndex < navigationGroups.filter(g => !g.requiresRole || profile?.role === g.requiresRole).length - 1 && (
												<div className="px-2 py-2">
													<Separator className="bg-[#299fce]/10" />
												</div>
											)}
										</div>
									);
								})}
							</SidebarContent>
						</Sidebar>
						<div className="flex-1 flex flex-col overflow-hidden">
							<header className="border-b bg-[#1E282A] text-white p-4 shadow-lg">
								<div className="flex items-center gap-4 justify-between">
									<div className="flex items-center gap-4">
										<SidebarTrigger />
										<h1 className="font-semibold text-white">
											Hệ thống quản lý sửa chữa laptop
										</h1>
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
							position: "bottom-left",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
					<NetworkStatus />
					<Toaster />
				</SidebarProvider>
			</ErrorBoundary>
		);
	}

	return (
		<ErrorBoundary>
			<Outlet />
			<TanstackDevtools
				config={{
					position: "bottom-left",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
			<NetworkStatus />
			<Toaster />
		</ErrorBoundary>
	);
};

export const Route = createRootRoute({
	component: RootComponent,
});
