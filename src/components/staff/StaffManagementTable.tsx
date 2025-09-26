import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useStaffManagement } from "@/hooks/use-staff-management";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase";
import {
	Edit,
	Key,
	Plus,
	Shield,
	ShieldOff,
	UserCheck,
	UserX,
} from "lucide-react";
import { useState } from "react";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface StaffFormData {
	email: string;
	full_name: string;
	role: "shop_owner" | "staff";
	phone: string;
	password: string;
}

interface EditStaffData {
	full_name: string;
	phone: string;
	role: "shop_owner" | "staff";
}

interface PasswordResetData {
	email: string;
	newPassword: string;
}

export function StaffManagementTable() {
	const {
		staffList,
		loading,
		error,
		createStaff,
		updateStaff,
		resetStaffPassword,
		deactivateStaff,
		reactivateStaff,
		clearError,
	} = useStaffManagement();

	const { toast } = useToast();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
	const [selectedStaff, setSelectedStaff] = useState<UserProfile | null>(null);

	// Form states
	const [createForm, setCreateForm] = useState<StaffFormData>({
		email: "",
		full_name: "",
		role: "staff",
		phone: "",
		password: "",
	});

	const [editForm, setEditForm] = useState<EditStaffData>({
		full_name: "",
		phone: "",
		role: "staff",
	});

	const [passwordResetForm, setPasswordResetForm] = useState<PasswordResetData>(
		{
			email: "",
			newPassword: "",
		},
	);

	// Clear error on component actions
	const handleClearError = () => {
		clearError();
	};

	// Handle create staff
	const handleCreateStaff = async () => {
		if (!createForm.email || !createForm.full_name || !createForm.password) {
			toast({
				title: "Thông tin không đầy đủ",
				description: "Vui lòng điền đầy đủ thông tin bắt buộc",
				variant: "destructive",
			});
			return;
		}

		const result = await createStaff(createForm);
		if (result.success) {
			toast({
				title: "Tạo tài khoản thành công",
				description: `Đã tạo tài khoản cho ${createForm.full_name}`,
			});
			setCreateForm({
				email: "",
				full_name: "",
				role: "staff",
				phone: "",
				password: "",
			});
			setCreateDialogOpen(false);
		} else {
			toast({
				title: "Không thể tạo tài khoản",
				description: result.error,
				variant: "destructive",
			});
		}
	};

	// Handle edit staff
	const handleEditStaff = async () => {
		if (!selectedStaff) return;

		const result = await updateStaff(selectedStaff.id, editForm);
		if (result.success) {
			toast({
				title: "Cập nhật thành công",
				description: `Đã cập nhật thông tin ${editForm.full_name}`,
			});
			setEditDialogOpen(false);
			setSelectedStaff(null);
		} else {
			toast({
				title: "Không thể cập nhật",
				description: result.error,
				variant: "destructive",
			});
		}
	};

	// Handle password reset
	const handleResetPassword = async () => {
		if (!passwordResetForm.email || !passwordResetForm.newPassword) {
			toast({
				title: "Thông tin không đầy đủ",
				description: "Vui lòng nhập email và mật khẩu mới",
				variant: "destructive",
			});
			return;
		}

		const result = await resetStaffPassword(
			passwordResetForm.email,
			passwordResetForm.newPassword,
		);
		if (result.success) {
			toast({
				title: "Đặt lại mật khẩu thành công",
				description: "Mật khẩu đã được cập nhật",
			});
			setPasswordResetForm({ email: "", newPassword: "" });
			setResetPasswordDialogOpen(false);
		} else {
			toast({
				title: "Không thể đặt lại mật khẩu",
				description: result.error,
				variant: "destructive",
			});
		}
	};

	// Handle deactivate/reactivate
	const handleToggleActive = async (staff: UserProfile) => {
		const action = staff.is_active ? deactivateStaff : reactivateStaff;
		const actionText = staff.is_active ? "vô hiệu hóa" : "kích hoạt";

		const result = await action(staff.id);
		if (result.success) {
			toast({
				title: `Đã ${actionText} tài khoản`,
				description: `Tài khoản ${staff.full_name} đã được ${actionText}`,
			});
		} else {
			toast({
				title: `Không thể ${actionText}`,
				description: result.error,
				variant: "destructive",
			});
		}
	};

	// Open edit dialog
	const openEditDialog = (staff: UserProfile) => {
		setSelectedStaff(staff);
		setEditForm({
			full_name: staff.full_name,
			phone: staff.phone || "",
			role: staff.role,
		});
		setEditDialogOpen(true);
	};

	// Get role badge
	const getRoleBadge = (role: "shop_owner" | "staff") => {
		return role === "shop_owner" ? (
			<Badge variant="destructive">
				<Shield className="w-3 h-3 mr-1" />
				Chủ cửa hàng
			</Badge>
		) : (
			<Badge variant="secondary">
				<ShieldOff className="w-3 h-3 mr-1" />
				Nhân viên
			</Badge>
		);
	};

	// Get status badge
	const getStatusBadge = (isActive: boolean) => {
		return isActive ? (
			<Badge variant="default">
				<UserCheck className="w-3 h-3 mr-1" />
				Hoạt động
			</Badge>
		) : (
			<Badge variant="destructive">
				<UserX className="w-3 h-3 mr-1" />
				Tạm khóa
			</Badge>
		);
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("vi-VN");
	};

	if (loading && !staffList.length) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#299fce]" />
						<span className="ml-2">Đang tải danh sách nhân viên...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="text-red-800 font-medium">Đã xảy ra lỗi</h4>
								<p className="text-red-600 text-sm">{error.message}</p>
							</div>
							<Button variant="outline" size="sm" onClick={handleClearError}>
								Đóng
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-semibold">
						Quản lý tài khoản nhân viên
					</h2>
					<p className="text-muted-foreground">
						Tạo và quản lý tài khoản cho nhân viên cửa hàng
					</p>
				</div>
				<div className="flex gap-2">
					<Dialog
						open={resetPasswordDialogOpen}
						onOpenChange={setResetPasswordDialogOpen}
					>
						<DialogTrigger asChild>
							<Button variant="outline">
								<Key className="mr-2 h-4 w-4" />
								Đặt lại mật khẩu
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Đặt lại mật khẩu nhân viên</DialogTitle>
								<DialogDescription>
									Nhập email và mật khẩu mới cho tài khoản nhân viên
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="resetEmail">Email tài khoản</Label>
									<Input
										id="resetEmail"
										type="email"
										placeholder="Nhập email tài khoản"
										value={passwordResetForm.email}
										onChange={(e) =>
											setPasswordResetForm((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="newPassword">Mật khẩu mới</Label>
									<Input
										id="newPassword"
										type="password"
										placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
										value={passwordResetForm.newPassword}
										onChange={(e) =>
											setPasswordResetForm((prev) => ({
												...prev,
												newPassword: e.target.value,
											}))
										}
									/>
								</div>
								<Button onClick={handleResetPassword} disabled={loading}>
									{loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Thêm nhân viên
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Thêm tài khoản nhân viên</DialogTitle>
								<DialogDescription>
									Tạo tài khoản mới cho nhân viên cửa hàng
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="createFullName">Tên đầy đủ *</Label>
									<Input
										id="createFullName"
										placeholder="Nhập tên đầy đủ"
										value={createForm.full_name}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												full_name: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="createEmail">Email *</Label>
									<Input
										id="createEmail"
										type="email"
										placeholder="Nhập email"
										value={createForm.email}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="createRole">Vai trò</Label>
									<Select
										value={createForm.role}
										onValueChange={(value) =>
											setCreateForm((prev) => ({
												...prev,
												role: value as "shop_owner" | "staff",
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn vai trò" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="staff">Nhân viên</SelectItem>
											<SelectItem value="shop_owner">Chủ cửa hàng</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="createPhone">Số điện thoại</Label>
									<Input
										id="createPhone"
										placeholder="Nhập số điện thoại"
										value={createForm.phone}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												phone: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="createPassword">Mật khẩu *</Label>
									<Input
										id="createPassword"
										type="password"
										placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
										value={createForm.password}
										onChange={(e) =>
											setCreateForm((prev) => ({
												...prev,
												password: e.target.value,
											}))
										}
									/>
								</div>
								<Button onClick={handleCreateStaff} disabled={loading}>
									{loading ? "Đang tạo..." : "Tạo tài khoản"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Danh sách tài khoản ({staffList.length})</CardTitle>
					<CardDescription>
						Quản lý thông tin và trạng thái tài khoản nhân viên
					</CardDescription>
				</CardHeader>
				<CardContent>
					{staffList.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Chưa có tài khoản nào</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tên</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Điện thoại</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Tạo lúc</TableHead>
									<TableHead>Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{staffList.map((staff) => (
									<TableRow key={staff.id}>
										<TableCell className="font-medium">
											{staff.full_name}
										</TableCell>
										<TableCell>{staff.email}</TableCell>
										<TableCell>{staff.phone || "—"}</TableCell>
										<TableCell>{getRoleBadge(staff.role)}</TableCell>
										<TableCell>{getStatusBadge(staff.is_active)}</TableCell>
										<TableCell>{formatDate(staff.created_at)}</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditDialog(staff)}
													disabled={loading}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleToggleActive(staff)}
													disabled={loading}
												>
													{staff.is_active ? (
														<UserX className="h-4 w-4" />
													) : (
														<UserCheck className="h-4 w-4" />
													)}
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Edit Staff Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
						<DialogDescription>
							Cập nhật thông tin cho {selectedStaff?.full_name}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="editFullName">Tên đầy đủ</Label>
							<Input
								id="editFullName"
								value={editForm.full_name}
								onChange={(e) =>
									setEditForm((prev) => ({
										...prev,
										full_name: e.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editPhone">Số điện thoại</Label>
							<Input
								id="editPhone"
								value={editForm.phone}
								onChange={(e) =>
									setEditForm((prev) => ({
										...prev,
										phone: e.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editRole">Vai trò</Label>
							<Select
								value={editForm.role}
								onValueChange={(value) =>
									setEditForm((prev) => ({
										...prev,
										role: value as "shop_owner" | "staff",
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="staff">Nhân viên</SelectItem>
									<SelectItem value="shop_owner">Chủ cửa hàng</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button onClick={handleEditStaff} disabled={loading}>
							{loading ? "Đang cập nhật..." : "Cập nhật"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
