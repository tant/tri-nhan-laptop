/**
 * Customer Table Component
 * Reusable table component for displaying customers with stats and actions
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { Customer } from "@/lib/database-types";
import { DateTime, Text } from "@/lib/formatting";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, Loader2, MapPin, Phone } from "lucide-react";
import { useMemo } from "react";

// Customer with repair statistics
export type CustomerWithStats = Customer & {
	totalRepairs: number;
	lastRepairDate: string | null;
	activeRepairs: number;
	id: string; // For optimistic list compatibility
};

export interface CustomerTableProps {
	customers: CustomerWithStats[];
	onViewCustomer?: (customer: CustomerWithStats) => void;
	onEditCustomer?: (customer: CustomerWithStats) => void;
	isOptimistic?: (id: string) => boolean;
	loading?: boolean;
}

/**
 * Get customer status badge based on repair history
 */
export function getCustomerStatusBadge(customer: CustomerWithStats) {
	if (customer.activeRepairs > 0) {
		return (
			<Badge variant="default">Đang sửa chữa ({customer.activeRepairs})</Badge>
		);
	}
	if (customer.totalRepairs > 0) {
		return <Badge variant="secondary">Khách hàng cũ</Badge>;
	}
	return <Badge variant="outline">Khách hàng mới</Badge>;
}

/**
 * Create customer table columns
 */
export function createCustomerColumns({
	onViewCustomer,
	onEditCustomer,
	isOptimistic = () => false,
}: {
	onViewCustomer?: (customer: CustomerWithStats) => void;
	onEditCustomer?: (customer: CustomerWithStats) => void;
	isOptimistic?: (id: string) => boolean;
}): ColumnDef<CustomerWithStats>[] {
	return [
		{
			accessorKey: "full_name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Khách hàng
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const customer = row.original;
				const isOptimisticCustomer = isOptimistic(customer.id);
				return (
					<div className="flex items-center gap-2">
						<div>
							<div className="font-medium flex items-center gap-2">
								{customer.full_name}
								{isOptimisticCustomer && (
									<Badge
										variant="outline"
										className="text-blue-600 border-blue-300"
									>
										<Loader2 className="h-3 w-3 mr-1 animate-spin" />
										Đang lưu
									</Badge>
								)}
							</div>
							<div className="text-sm text-muted-foreground">
								Khách hàng {customer.totalRepairs > 0 ? "cũ" : "mới"}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "phone",
			header: "Liên hệ",
			cell: ({ row }) => {
				const customer = row.original;
				return (
					<div className="space-y-1">
						<div className="flex items-center text-sm font-mono">
							<Phone className="mr-1 h-3 w-3" />
							{Text.formatPhone(customer.phone)}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "address",
			header: "Địa chỉ",
			cell: ({ row }) => {
				const customer = row.original;
				return (
					<div>
						{customer.address ? (
							<div className="flex items-center text-sm max-w-xs">
								<MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
								<span className="truncate">{customer.address}</span>
							</div>
						) : (
							<span className="text-muted-foreground text-sm">
								Chưa có địa chỉ
							</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Tình trạng",
			cell: ({ row }) => getCustomerStatusBadge(row.original),
		},
		{
			accessorKey: "totalRepairs",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2 lg:px-3"
				>
					Lượt sửa chữa
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="text-center font-medium">
					{row.getValue("totalRepairs")}
				</div>
			),
		},
		{
			accessorKey: "lastRepairDate",
			header: "Lần cuối",
			cell: ({ row }) => {
				const date = row.getValue("lastRepairDate") as string | null;
				return (
					<div className="text-sm">
						{date ? DateTime.formatDate(date) : "Chưa có"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Thao tác",
			cell: ({ row }) => {
				const customer = row.original;
				const isOptimisticCustomer = isOptimistic(customer.id);
				return (
					<div className="flex gap-2">
						{onViewCustomer && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onViewCustomer(customer)}
								disabled={isOptimisticCustomer}
								title="Xem chi tiết khách hàng"
							>
								<Eye className="h-4 w-4" />
							</Button>
						)}
						{onEditCustomer && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEditCustomer(customer)}
								disabled={isOptimisticCustomer}
								title="Chỉnh sửa khách hàng"
							>
								<Edit className="h-4 w-4" />
							</Button>
						)}
					</div>
				);
			},
		},
	];
}

/**
 * Customer statistics cards
 */
export function CustomerStatisticsCards({
	customers,
}: { customers: CustomerWithStats[] }) {
	const stats = useMemo(() => {
		const newCustomers = customers.filter((c) => c.totalRepairs === 0).length;
		const activeRepairsCustomers = customers.filter(
			(c) => c.activeRepairs > 0,
		).length;
		const loyalCustomers = customers.filter((c) => c.totalRepairs >= 5).length;

		return {
			total: customers.length,
			newCustomers,
			activeRepairsCustomers,
			loyalCustomers,
		};
	}, [customers]);

	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.total}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.newCustomers}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Đang sửa chữa</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{stats.activeRepairsCustomers}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Khách hàng thân thiết
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.loyalCustomers}</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Main customer table component
 */
export function CustomerTable({
	customers,
	onViewCustomer,
	onEditCustomer,
	isOptimistic = () => false,
}: CustomerTableProps) {
	const columns = useMemo(
		() =>
			createCustomerColumns({ onViewCustomer, onEditCustomer, isOptimistic }),
		[onViewCustomer, onEditCustomer, isOptimistic],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Danh sách khách hàng</CardTitle>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={customers}
					globalFilterFn={(row, _columnId, filterValue) => {
						if (!filterValue) return true;

						const searchValue = filterValue.toLowerCase();
						const customer = row.original;

						// Search across customer name, phone, and address
						return (
							customer.full_name?.toLowerCase().includes(searchValue) ||
							customer.phone?.toLowerCase().includes(searchValue) ||
							customer.address?.toLowerCase().includes(searchValue)
						);
					}}
					searchPlaceholder="Tìm kiếm theo tên, SĐT hoặc địa chỉ..."
				/>
			</CardContent>
		</Card>
	);
}

/**
 * Compact customer info display
 */
export function CustomerInfo({
	customer,
	showStats = true,
	showActions = true,
	onView,
	onEdit,
}: {
	customer: CustomerWithStats;
	showStats?: boolean;
	showActions?: boolean;
	onView?: () => void;
	onEdit?: () => void;
}) {
	return (
		<div className="flex items-center justify-between p-4 border rounded-lg">
			<div className="flex-1">
				<div className="font-medium">{customer.full_name}</div>
				<div className="text-sm text-muted-foreground flex items-center gap-4">
					<span className="flex items-center gap-1">
						<Phone className="h-3 w-3" />
						{Text.formatPhone(customer.phone)}
					</span>
					{customer.address && (
						<span className="flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							{customer.address}
						</span>
					)}
				</div>
				{showStats && (
					<div className="flex items-center gap-2 mt-2">
						{getCustomerStatusBadge(customer)}
						<span className="text-xs text-muted-foreground">
							{customer.totalRepairs} lần sửa chữa
						</span>
					</div>
				)}
			</div>
			{showActions && (
				<div className="flex gap-2">
					{onView && (
						<Button variant="ghost" size="sm" onClick={onView}>
							<Eye className="h-4 w-4" />
						</Button>
					)}
					{onEdit && (
						<Button variant="ghost" size="sm" onClick={onEdit}>
							<Edit className="h-4 w-4" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
