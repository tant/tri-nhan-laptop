import { StaffManagementTable } from "@/components/staff/StaffManagementTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Database,
	Download,
	Settings,
	Shield,
	Upload,
	Users,
} from "lucide-react";
import { useState } from "react";

export function AdminPage() {
	const [systemSettings] = useState({
		shopName: "Trung tâm sửa chữa Laptop ABC",
		address: "123 Đường ABC, Quận 1, TP.HCM",
		phone: "028-12345678",
		email: "info@trinhanlaptop.vn",
		autoBackup: true,
		emailNotifications: true,
		smsNotifications: false,
		maintenanceMode: false,
	});

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
					<p className="text-muted-foreground">Cấu hình và quản lý hệ thống</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Sao lưu
					</Button>
					<Button variant="outline">
						<Upload className="mr-2 h-4 w-4" />
						Khôi phục
					</Button>
				</div>
			</div>

			<Tabs defaultValue="users" className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="users" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Người dùng
					</TabsTrigger>
					<TabsTrigger value="settings" className="flex items-center gap-2">
						<Settings className="h-4 w-4" />
						Cài đặt
					</TabsTrigger>
					<TabsTrigger value="database" className="flex items-center gap-2">
						<Database className="h-4 w-4" />
						Cơ sở dữ liệu
					</TabsTrigger>
					<TabsTrigger value="security" className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Bảo mật
					</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-6">
					<StaffManagementTable />
				</TabsContent>

				<TabsContent value="settings" className="space-y-6">
					<h2 className="text-2xl font-semibold">Cài đặt hệ thống</h2>

					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Thông tin cửa hàng</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="shopName">Tên cửa hàng</Label>
										<Input
											id="shopName"
											defaultValue={systemSettings.shopName}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="shopPhone">Số điện thoại</Label>
										<Input id="shopPhone" defaultValue={systemSettings.phone} />
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="shopAddress">Địa chỉ</Label>
									<Input
										id="shopAddress"
										defaultValue={systemSettings.address}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="shopEmail">Email</Label>
									<Input id="shopEmail" defaultValue={systemSettings.email} />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Cài đặt thông báo</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<Label htmlFor="emailNotif">Thông báo email</Label>
									<Switch
										id="emailNotif"
										defaultChecked={systemSettings.emailNotifications}
									/>
								</div>
								<div className="flex items-center justify-between">
									<Label htmlFor="smsNotif">Thông báo SMS</Label>
									<Switch
										id="smsNotif"
										defaultChecked={systemSettings.smsNotifications}
									/>
								</div>
								<div className="flex items-center justify-between">
									<Label htmlFor="autoBackup">Sao lưu tự động</Label>
									<Switch
										id="autoBackup"
										defaultChecked={systemSettings.autoBackup}
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="database" className="space-y-6">
					<h2 className="text-2xl font-semibold">Quản lý cơ sở dữ liệu</h2>

					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Sao lưu và khôi phục</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-4">
									<Button>
										<Download className="mr-2 h-4 w-4" />
										Tạo bản sao lưu
									</Button>
									<Button variant="outline">
										<Upload className="mr-2 h-4 w-4" />
										Khôi phục từ file
									</Button>
								</div>
								<p className="text-sm text-muted-foreground">
									Sao lưu cuối: 19/01/2024 06:00
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Thống kê cơ sở dữ liệu</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="text-center">
										<div className="text-2xl font-bold">1,234</div>
										<div className="text-sm text-muted-foreground">
											Phiếu sửa chữa
										</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold">567</div>
										<div className="text-sm text-muted-foreground">
											Khách hàng
										</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold">89</div>
										<div className="text-sm text-muted-foreground">
											Linh kiện
										</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold">5</div>
										<div className="text-sm text-muted-foreground">
											Người dùng
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="security" className="space-y-6">
					<h2 className="text-2xl font-semibold">Cài đặt bảo mật</h2>

					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Chế độ bảo trì</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="maintenance">Bật chế độ bảo trì</Label>
										<p className="text-sm text-muted-foreground">
											Ngăn người dùng truy cập hệ thống để bảo trì
										</p>
									</div>
									<Switch
										id="maintenance"
										defaultChecked={systemSettings.maintenanceMode}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Nhật ký hoạt động</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<p className="text-sm">
										• Admin đăng nhập - 19/01/2024 10:30
									</p>
									<p className="text-sm">
										• Tạo phiếu sửa chữa PT001 - 19/01/2024 10:25
									</p>
									<p className="text-sm">
										• Kỹ thuật viên B đăng nhập - 19/01/2024 09:15
									</p>
									<p className="text-sm">
										• Cập nhật linh kiện LK001 - 19/01/2024 09:00
									</p>
								</div>
								<Button variant="outline" className="mt-4">
									Xem tất cả nhật ký
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
