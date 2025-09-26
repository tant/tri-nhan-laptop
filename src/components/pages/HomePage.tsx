import { FeedbackDialog } from "@/components/customer-portal/feedback-dialog";
import { ServiceHistoryDisplay } from "@/components/customer-portal/service-history-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerPortal } from "@/hooks/use-customer-portal";
import {
	AlertCircle,
	CheckCircle,
	Clock,
	History,
	Laptop,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	Search,
	Shield,
	Star,
	Wrench,
	Zap,
} from "lucide-react";
import { useState } from "react";

// Interface for repair status - now using real data types

export function HomePage() {
	const [ticketNumber, setTicketNumber] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [searchMethod, setSearchMethod] = useState<"ticket" | "email">(
		"ticket",
	);
	const [showServiceHistory, setShowServiceHistory] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);

	const {
		loading: isSearching,
		error: searchError,
		repairInfo,
		lookupRepair,
		lookupRepairByEmail,
		// getServiceHistory - imported but used in modal
		getVietnameseStatus,
		formatCurrency,
		isValidTicketNumber,
		isValidPhoneNumber,
		isValidEmail,
	} = useCustomerPortal();

	const [localError, setLocalError] = useState("");

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setLocalError("");

		// Validate based on search method
		if (searchMethod === "ticket") {
			if (!isValidTicketNumber(ticketNumber)) {
				setLocalError(
					"Số phiếu không đúng định dạng (MS + số hoặc TNL-YYMMDD-XXX)",
				);
				return;
			}
			if (!isValidPhoneNumber(phoneNumber)) {
				setLocalError("Số điện thoại không đúng định dạng");
				return;
			}

			try {
				await lookupRepair(ticketNumber, phoneNumber);
			} catch (error) {
				setLocalError((error as Error).message);
			}
		} else {
			if (!isValidEmail(email)) {
				setLocalError("Email không đúng định dạng");
				return;
			}
			if (!isValidPhoneNumber(phoneNumber)) {
				setLocalError("Số điện thoại không đúng định dạng");
				return;
			}

			try {
				await lookupRepairByEmail(email, phoneNumber);
			} catch (error) {
				setLocalError((error as Error).message);
			}
		}
	};

	const getStatusBadge = (status: string) => {
		const statusMap: Record<
			string,
			{
				text: string;
				variant: "secondary" | "outline" | "default";
				icon: React.ComponentType;
			}
		> = {
			received: {
				text: "Đã tiếp nhận",
				variant: "secondary" as const,
				icon: Search,
			},
			diagnosed: {
				text: "Đã chẩn đoán",
				variant: "outline" as const,
				icon: Wrench,
			},
			waiting_parts: {
				text: "Chờ linh kiện",
				variant: "outline" as const,
				icon: Clock,
			},
			in_progress: {
				text: "Đang sửa chữa",
				variant: "default" as const,
				icon: Wrench,
			},
			completed: {
				text: "Hoàn thành",
				variant: "default" as const,
				icon: CheckCircle,
			},
			ready_for_pickup: {
				text: "Sẵn sàng giao",
				variant: "default" as const,
				icon: Phone,
			},
			delivered: {
				text: "Đã giao",
				variant: "default" as const,
				icon: CheckCircle,
			},
			cancelled: {
				text: "Đã hủy",
				variant: "outline" as const,
				icon: AlertCircle,
			},
		};
		return (
			statusMap[status] || {
				text: status,
				variant: "outline" as const,
				icon: AlertCircle,
			}
		);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="sticky top-0 z-50 bg-[#1E282A] shadow-lg border-b border-gray-700">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center">
						<img
							src="/trinhan_logo.svg"
							alt="Trí Nhân Laptop"
							className="h-10 w-auto"
						/>
					</div>
					<div className="flex items-center gap-2 text-white font-medium">
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
								<strong className="text-[#299fce]">Trí Nhân Laptop</strong> -
								Đồng hành cùng công nghệ của bạn
							</p>

							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-[#299fce]" />
									<span className="text-lg">
										<strong>7+ năm kinh nghiệm</strong> sửa chữa laptop, macbook
									</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-[#299fce]" />
									<span className="text-lg">
										<strong>Chẩn đoán chính xác</strong> bằng sơ đồ kỹ thuật
									</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-[#299fce]" />
									<span className="text-lg">
										<strong>Thay thế linh kiện</strong> chính hãng, bảo hành
									</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-[#299fce]" />
									<span className="text-lg">
										<strong>Tư vấn miễn phí</strong> qua điện thoại
									</span>
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
								<CardHeader className="bg-[#299fce]/10 my-4">
									<CardTitle className="flex items-center gap-2 text-[#1E282A]">
										<Search className="h-6 w-6 text-[#299fce]" />
										Tra Cứu Tình Trạng Sửa Chữa
									</CardTitle>
									<CardDescription className="text-[#6c757d]">
										Nhập thông tin để kiểm tra máy của bạn
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4 p-6">
									{/* Search Method Toggle */}
									<div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
										<button
											type="button"
											onClick={() => setSearchMethod("ticket")}
											className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
												searchMethod === "ticket"
													? "bg-white text-[#299fce] shadow-sm"
													: "text-gray-600 hover:text-gray-900"
											}`}
										>
											Tra cứu bằng số phiếu
										</button>
										<button
											type="button"
											onClick={() => setSearchMethod("email")}
											className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
												searchMethod === "email"
													? "bg-white text-[#299fce] shadow-sm"
													: "text-gray-600 hover:text-gray-900"
											}`}
										>
											Tra cứu bằng email
										</button>
									</div>

									<form onSubmit={handleSearch} className="space-y-4">
										{searchMethod === "ticket" ? (
											<div className="space-y-2">
												<Label
													htmlFor="ticket"
													className="text-[#1E282A] font-medium"
												>
													Số phiếu sửa chữa
												</Label>
												<Input
													id="ticket"
													type="text"
													placeholder="MS001 hoặc TNL-241221-001..."
													value={ticketNumber}
													onChange={(e) => setTicketNumber(e.target.value)}
													className="border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]"
													required
												/>
											</div>
										) : (
											<div className="space-y-2">
												<Label
													htmlFor="email"
													className="text-[#1E282A] font-medium"
												>
													Email khách hàng
												</Label>
												<div className="relative">
													<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
													<Input
														id="email"
														type="email"
														placeholder="example@email.com"
														value={email}
														onChange={(e) => setEmail(e.target.value)}
														className="pl-10 border-gray-300 focus:border-[#299fce] focus:ring-[#299fce]"
														required
													/>
												</div>
											</div>
										)}

										<div className="space-y-2">
											<Label
												htmlFor="phone"
												className="text-[#1E282A] font-medium"
											>
												Số điện thoại
											</Label>
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

										{(localError || searchError) && (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>
													{localError || searchError?.message}
												</AlertDescription>
											</Alert>
										)}

										<Button
											type="submit"
											disabled={
												(searchMethod === "ticket" &&
													(!ticketNumber || !phoneNumber)) ||
												(searchMethod === "email" &&
													(!email || !phoneNumber)) ||
												isSearching
											}
											className="w-full bg-[#299fce] hover:bg-[#299fce]/90 text-white py-3"
										>
											{isSearching ? "Đang tra cứu..." : "TRA CỨU"}
										</Button>

										<p className="text-sm text-[#6c757d] flex items-center gap-2">
											💡{" "}
											{searchMethod === "ticket"
												? "Số phiếu được cung cấp khi gửi máy"
												: "Sử dụng email và số điện thoại đã đăng ký"}
										</p>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Search Result */}
			{repairInfo && (
				<section className="py-8">
					<div className="container mx-auto px-4 space-y-6">
						{/* Main Repair Info */}
						<Card className="shadow-xl border-green-200 bg-green-50">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-green-800 flex items-center gap-2">
										<CheckCircle className="h-6 w-6" />
										Thông Tin Phiếu Sửa Chữa
									</CardTitle>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setShowServiceHistory(true)}
										>
											<History className="h-4 w-4 mr-2" />
											Lịch sử
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setShowFeedback(true)}
										>
											<Star className="h-4 w-4 mr-2" />
											Đánh giá
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Số Phiếu
										</Label>
										<p className="font-mono text-lg font-bold">
											{repairInfo.ticket_code}
										</p>
									</div>
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Khách Hàng
										</Label>
										<p className="text-lg">{repairInfo.customer.full_name}</p>
									</div>
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Thiết Bị
										</Label>
										<p className="text-lg">
											{repairInfo.device_info.brand}{" "}
											{repairInfo.device_info.model}
										</p>
									</div>
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Vấn Đề
										</Label>
										<p className="text-lg">{repairInfo.issue_description}</p>
									</div>
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Tình Trạng
										</Label>
										<div className="mt-1">
											{(() => {
												const statusInfo = getStatusBadge(repairInfo.status);
												const IconComponent = statusInfo.icon;
												return (
													<Badge
														variant={statusInfo.variant}
														className="text-sm"
													>
														<IconComponent className="w-3 h-3 mr-1" />
														{getVietnameseStatus(repairInfo.status)}
													</Badge>
												);
											})()}
										</div>
									</div>
									<div>
										<Label className="text-sm font-medium text-gray-600">
											Ngày Tiếp Nhận
										</Label>
										<p className="text-lg">
											{new Date(repairInfo.created_at).toLocaleDateString(
												"vi-VN",
											)}
										</p>
									</div>
								</div>

								{repairInfo.total_cost && (
									<div className="border-t pt-4">
										<Label className="text-sm font-medium text-gray-600">
											Chi Phí Thực Tế
										</Label>
										<p className="text-2xl font-bold text-[#299fce]">
											{formatCurrency(repairInfo.total_cost)}
										</p>
									</div>
								)}

								{/* Status History */}
								{repairInfo.status_history &&
									repairInfo.status_history.length > 0 && (
										<div className="border-t pt-4">
											<Label className="text-sm font-medium text-gray-600">
												Lịch Sử Trạng Thái
											</Label>
											<div className="mt-2 space-y-2">
												{repairInfo.status_history
													.slice(-3)
													.map((log, index) => (
														<div
															key={`status-log-${log.id || log.timestamp || index}`}
															className="flex items-center gap-2 text-sm"
														>
															<CheckCircle className="h-4 w-4 text-green-600" />
															<span className="font-medium">
																{getVietnameseStatus(log.new_status)}
															</span>
															<span className="text-gray-500">-</span>
															<span className="text-gray-600">
																{new Date(log.created_at).toLocaleDateString(
																	"vi-VN",
																)}
															</span>
															{log.notes && (
																<span className="text-gray-500">
																	• {log.notes}
																</span>
															)}
														</div>
													))}
											</div>
										</div>
									)}

								{/* Parts Used */}
								{repairInfo.parts_used && repairInfo.parts_used.length > 0 && (
									<div className="border-t pt-4">
										<Label className="text-sm font-medium text-gray-600">
											Linh Kiện Đã Sử Dụng
										</Label>
										<div className="mt-2 space-y-2">
											{repairInfo.parts_used.map((part, index) => (
												<div
													key={`part-${part.id || part.name || part.part_number || index}`}
													className="flex justify-between items-center text-sm"
												>
													<span>
														{part.name} (x{part.quantity})
													</span>
													<span className="font-medium">
														{formatCurrency(part.unit_price * part.quantity)}
													</span>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</section>
			)}

			{/* Service History Modal */}
			{showServiceHistory && (
				<ServiceHistoryDisplay
					customerPhone={phoneNumber}
					onClose={() => setShowServiceHistory(false)}
				/>
			)}

			{/* Feedback Modal */}
			{showFeedback && repairInfo && (
				<FeedbackDialog
					repairId={repairInfo.id}
					customerPhone={phoneNumber}
					onClose={() => setShowFeedback(false)}
					onSubmitSuccess={() => {
						setShowFeedback(false);
						// Could show a success message here
					}}
				/>
			)}

			{/* Services Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-[#1E282A] mb-4">
							Dịch Vụ Chuyên Nghiệp
						</h2>
						<p className="text-lg text-[#6c757d]">
							Chúng tôi cung cấp dịch vụ sửa chữa laptop toàn diện
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
							<CardContent className="p-6">
								<div className="mb-4 flex justify-center">
									<div className="p-3 bg-[#299fce]/10 rounded-full">
										<Laptop className="h-8 w-8 text-[#299fce]" />
									</div>
								</div>
								<h3 className="text-xl font-bold text-[#1E282A] mb-2">
									Sửa Chữa Laptop
								</h3>
								<p className="text-[#6c757d]">
									Chẩn đoán và sửa chữa các lỗi phần cứng, phần mềm
								</p>
							</CardContent>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
							<CardContent className="p-6">
								<div className="mb-4 flex justify-center">
									<div className="p-3 bg-[#299fce]/10 rounded-full">
										<Wrench className="h-8 w-8 text-[#299fce]" />
									</div>
								</div>
								<h3 className="text-xl font-bold text-[#1E282A] mb-2">
									Thay Thế Linh Kiện
								</h3>
								<p className="text-[#6c757d]">
									Ram, ổ cứng, bàn phím, màn hình, mainboard
								</p>
							</CardContent>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
							<CardContent className="p-6">
								<div className="mb-4 flex justify-center">
									<div className="p-3 bg-[#299fce]/10 rounded-full">
										<Zap className="h-8 w-8 text-[#299fce]" />
									</div>
								</div>
								<h3 className="text-xl font-bold text-[#1E282A] mb-2">
									Nâng Cấp Hiệu Năng
								</h3>
								<p className="text-[#6c757d]">
									Nâng cấp SSD, RAM tối ưu hiệu suất máy
								</p>
							</CardContent>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow duration-300 border-[#299fce]/20 hover:border-[#299fce]/40">
							<CardContent className="p-6">
								<div className="mb-4 flex justify-center">
									<div className="p-3 bg-[#299fce]/10 rounded-full">
										<Shield className="h-8 w-8 text-[#299fce]" />
									</div>
								</div>
								<h3 className="text-xl font-bold text-[#1E282A] mb-2">
									Bảo Hành Uy Tín
								</h3>
								<p className="text-[#6c757d]">
									Bảo hành chính hãng hỗ trợ sau bán hàng
								</p>
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
									251 Vườn Lài, Phường Phú Thọ Hoà
									<br />
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
								<a
									href="/login"
									className="text-[#299fce] hover:underline font-medium"
								>
									Đăng nhập tại đây
								</a>
							</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
