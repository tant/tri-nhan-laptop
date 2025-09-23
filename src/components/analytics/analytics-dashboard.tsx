import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import {
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	Award,
	Calendar,
	Clock,
	DollarSign,
	Package,
	Star,
	Target,
	TrendingUp,
	Users,
	Wrench,
} from "lucide-react";
import { useState } from "react";

interface MetricCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: React.ElementType;
	trend?: {
		value: number;
		direction: "up" | "down";
		label: string;
	};
	className?: string;
}

function MetricCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
	className,
}: MetricCardProps) {
	return (
		<Card className={cn("", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
				{trend && (
					<div
						className={cn(
							"flex items-center pt-1",
							trend.direction === "up" ? "text-green-600" : "text-red-600",
						)}
					>
						{trend.direction === "up" ? (
							<ArrowUp className="h-3 w-3 mr-1" />
						) : (
							<ArrowDown className="h-3 w-3 mr-1" />
						)}
						<span className="text-xs font-medium">
							{Math.abs(trend.value).toFixed(1)}% {trend.label}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface StatusDistributionProps {
	data: Array<{
		status: string;
		count: number;
		percentage: number;
		vietnameseName: string;
	}>;
}

function StatusDistribution({ data }: StatusDistributionProps) {
	const getStatusColor = (status: string) => {
		const colorMap: Record<string, string> = {
			received: "bg-blue-500",
			diagnosed: "bg-yellow-500",
			waiting_parts: "bg-orange-500",
			in_progress: "bg-purple-500",
			completed: "bg-green-500",
			ready_for_pickup: "bg-emerald-500",
			delivered: "bg-green-600",
			cancelled: "bg-red-500",
		};
		return colorMap[status] || "bg-gray-500";
	};

	const total = data.reduce((sum, item) => sum + item.count, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="h-5 w-5" />
					Phân bổ trạng thái
				</CardTitle>
				<CardDescription>Tổng cộng {total} phiếu sửa chữa</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{data
						.filter((item) => item.count > 0)
						.map((item) => (
							<div
								key={item.status}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"w-3 h-3 rounded-full",
											getStatusColor(item.status),
										)}
									/>
									<span className="text-sm font-medium">
										{item.vietnameseName}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{item.count}
									</span>
									<Badge variant="outline" className="text-xs">
										{item.percentage.toFixed(1)}%
									</Badge>
								</div>
							</div>
						))}
				</div>
			</CardContent>
		</Card>
	);
}

interface TopCustomersProps {
	data: Array<{
		id: string;
		name: string;
		phone: string;
		totalSpent: number;
		repairCount: number;
		lastVisit: string;
	}>;
	formatCurrency: (amount: number) => string;
}

function TopCustomers({ data, formatCurrency }: TopCustomersProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Award className="h-5 w-5" />
					Khách hàng hàng đầu
				</CardTitle>
				<CardDescription>
					Top {data.length} khách hàng theo doanh thu
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{data.map((customer, index) => (
						<div
							key={customer.id}
							className="flex items-center justify-between p-3 border rounded-lg"
						>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-8 h-8 bg-[#299fce]/10 rounded-full">
									<span className="text-sm font-bold text-[#299fce]">
										#{index + 1}
									</span>
								</div>
								<div>
									<p className="font-medium">{customer.name}</p>
									<p className="text-sm text-muted-foreground">
										{customer.phone}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="font-bold text-[#299fce]">
									{formatCurrency(customer.totalSpent)}
								</p>
								<p className="text-sm text-muted-foreground">
									{customer.repairCount} lần sửa chữa
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface PopularDevicesProps {
	data: Array<{
		deviceType: string;
		deviceModel: string;
		count: number;
		averageCost: number;
		averageTime: number;
	}>;
	formatCurrency: (amount: number) => string;
}

function PopularDevices({ data, formatCurrency }: PopularDevicesProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wrench className="h-5 w-5" />
					Thiết bị phổ biến
				</CardTitle>
				<CardDescription>
					Các loại thiết bị được sửa chữa nhiều nhất
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{data.map((device, index) => (
						<div
							key={`${device.deviceType}-${device.deviceModel}`}
							className="flex items-center justify-between p-3 border rounded-lg"
						>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
									<span className="text-sm font-bold text-purple-600">
										#{index + 1}
									</span>
								</div>
								<div>
									<p className="font-medium">{device.deviceType}</p>
									<p className="text-sm text-muted-foreground">
										{device.deviceModel}
									</p>
								</div>
							</div>
							<div className="text-right">
								<div className="flex items-center gap-4">
									<div>
										<p className="text-sm font-medium">{device.count} lần</p>
										<p className="text-xs text-muted-foreground">Số lượng</p>
									</div>
									<div>
										<p className="text-sm font-medium">
											{formatCurrency(device.averageCost)}
										</p>
										<p className="text-xs text-muted-foreground">Chi phí TB</p>
									</div>
									<div>
										<p className="text-sm font-medium">
											{device.averageTime.toFixed(1)} ngày
										</p>
										<p className="text-xs text-muted-foreground">
											Thời gian TB
										</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function AnalyticsDashboard() {
	const [dateRange] = useState({
		from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
		to: new Date(),
	});

	const {
		metrics,
		statusDistribution,
		topCustomers,
		popularDevices,
		loading,
		error,
		formatCurrency,
		formatPercentage,
	} = useAnalytics(dateRange);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i}>
							<CardHeader className="space-y-0 pb-2">
								<div className="h-4 bg-gray-200 rounded animate-pulse" />
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
								<div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
					<p className="text-red-600">Không thể tải dữ liệu phân tích</p>
					<p className="text-sm text-muted-foreground">{error.message}</p>
				</CardContent>
			</Card>
		);
	}

	if (!metrics) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Phân tích & Báo cáo</h1>
					<p className="text-muted-foreground">
						Dữ liệu từ {dateRange.from.toLocaleDateString("vi-VN")} đến{" "}
						{dateRange.to.toLocaleDateString("vi-VN")}
					</p>
				</div>
				<Button variant="outline">
					<Calendar className="h-4 w-4 mr-2" />
					Chọn khoảng thời gian
				</Button>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Tổng doanh thu"
					value={formatCurrency(metrics.totalRevenue)}
					description="30 ngày gần nhất"
					icon={DollarSign}
					trend={{
						value: metrics.revenueGrowth,
						direction: metrics.revenueGrowth >= 0 ? "up" : "down",
						label: "so với kỳ trước",
					}}
					className="border-[#299fce]/20"
				/>

				<MetricCard
					title="Tổng số sửa chữa"
					value={metrics.totalRepairs}
					description={`${metrics.completedRepairs} hoàn thành`}
					icon={Wrench}
				/>

				<MetricCard
					title="Khách hàng"
					value={metrics.totalCustomers}
					description={`${metrics.newCustomers} khách hàng mới`}
					icon={Users}
				/>

				<MetricCard
					title="Đánh giá trung bình"
					value={`${metrics.customerSatisfaction.toFixed(1)}/5`}
					description="Hài lòng của khách hàng"
					icon={Star}
				/>
			</div>

			{/* Secondary Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Giá trị trung bình"
					value={formatCurrency(metrics.averageRepairValue)}
					description="Mỗi lần sửa chữa"
					icon={TrendingUp}
				/>

				<MetricCard
					title="Thời gian trung bình"
					value={`${metrics.averageRepairTime.toFixed(1)} ngày`}
					description="Hoàn thành sửa chữa"
					icon={Clock}
				/>

				<MetricCard
					title="Tỷ lệ hoàn thành"
					value={formatPercentage(metrics.completionRate)}
					description="Phiếu đã hoàn thành"
					icon={Target}
				/>

				<MetricCard
					title="Cảnh báo tồn kho"
					value={metrics.lowStockItems}
					description="Linh kiện sắp hết"
					icon={Package}
					className={
						metrics.lowStockItems > 0 ? "border-orange-200 bg-orange-50" : ""
					}
				/>
			</div>

			{/* Detailed Analytics Tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Tổng quan</TabsTrigger>
					<TabsTrigger value="customers">Khách hàng</TabsTrigger>
					<TabsTrigger value="devices">Thiết bị</TabsTrigger>
					<TabsTrigger value="performance">Hiệu suất</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<StatusDistribution data={statusDistribution} />

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									Tình trạng kho hàng
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Tổng giá trị tồn kho</p>
										<p className="text-sm text-muted-foreground">
											Toàn bộ linh kiện
										</p>
									</div>
									<p className="text-lg font-bold text-[#299fce]">
										{formatCurrency(metrics.totalInventoryValue)}
									</p>
								</div>

								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Linh kiện đã sử dụng</p>
										<p className="text-sm text-muted-foreground">Trong kỳ</p>
									</div>
									<p className="text-lg font-bold">
										{formatCurrency(metrics.partsUsageValue)}
									</p>
								</div>

								{metrics.lowStockItems > 0 && (
									<div className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
										<div className="flex items-center gap-2">
											<AlertTriangle className="h-4 w-4 text-orange-600" />
											<div>
												<p className="font-medium text-orange-800">
													Cảnh báo tồn kho
												</p>
												<p className="text-sm text-orange-600">
													Cần đặt hàng bổ sung
												</p>
											</div>
										</div>
										<Badge
											variant="outline"
											className="border-orange-300 text-orange-800"
										>
											{metrics.lowStockItems} mặt hàng
										</Badge>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="customers" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<TopCustomers data={topCustomers} formatCurrency={formatCurrency} />

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Thống kê khách hàng
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="text-center p-4 border rounded-lg">
										<p className="text-2xl font-bold text-[#299fce]">
											{metrics.newCustomers}
										</p>
										<p className="text-sm text-muted-foreground">
											Khách hàng mới
										</p>
									</div>
									<div className="text-center p-4 border rounded-lg">
										<p className="text-2xl font-bold text-green-600">
											{metrics.returningCustomers}
										</p>
										<p className="text-sm text-muted-foreground">
											Khách hàng quay lại
										</p>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm">Tỷ lệ khách hàng mới</span>
										<span className="text-sm font-medium">
											{formatPercentage(
												metrics.totalCustomers > 0
													? (metrics.newCustomers / metrics.totalCustomers) *
															100
													: 0,
											)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm">Tỷ lệ khách hàng quay lại</span>
										<span className="text-sm font-medium">
											{formatPercentage(
												metrics.totalCustomers > 0
													? (metrics.returningCustomers /
															metrics.totalCustomers) *
															100
													: 0,
											)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm">Điểm hài lòng trung bình</span>
										<span className="text-sm font-medium flex items-center gap-1">
											<Star className="h-3 w-3 text-yellow-500" />
											{metrics.customerSatisfaction.toFixed(1)}/5
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="devices" className="space-y-4">
					<PopularDevices
						data={popularDevices}
						formatCurrency={formatCurrency}
					/>
				</TabsContent>

				<TabsContent value="performance" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<MetricCard
							title="Hiệu suất kỹ thuật viên"
							value={formatPercentage(metrics.technicianEfficiency)}
							description="Dựa trên thời gian hoàn thành"
							icon={Award}
						/>

						<MetricCard
							title="Tỷ lệ hoàn thành"
							value={formatPercentage(metrics.completionRate)}
							description="Phiếu hoàn thành / tổng phiếu"
							icon={Target}
						/>

						<MetricCard
							title="Giao hàng đúng hẹn"
							value={formatPercentage(metrics.onTimeDelivery)}
							description="Theo cam kết với khách hàng"
							icon={Clock}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
