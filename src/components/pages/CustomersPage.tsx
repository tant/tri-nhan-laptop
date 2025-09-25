import { SupabaseErrorAlert } from "@/components/error-boundary";
import { CustomerListSkeleton } from "@/components/skeleton-loaders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
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
import { useOptimisticList } from "@/hooks/use-optimistic-mutation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import type { ColumnDef } from "@tanstack/react-table";
import {
	ArrowUpDown,
	Edit,
	Eye,
	Loader2,
	MapPin,
	Phone,
	Plus,
	RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Database types
type Customer = Database["public"]["Tables"]["customers"]["Row"];

// Customer with repair count
type CustomerWithStats = Customer & {
	totalRepairs: number;
	lastRepairDate: string | null;
	activeRepairs: number;
	id: string; // For optimistic list compatibility
};

export function CustomersPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Optimistic list management
	const {
		items: customers,
		setData: setCustomers,
		addOptimisticItem,
		confirmOptimisticItem,
		rollbackOptimisticItem,
		isOptimistic,
	} = useOptimisticList<CustomerWithStats>([]);

	// Fetch customers with repair statistics
	const fetchCustomers = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// First, get all customers
			const { data: customersData, error: customersError } = await supabase
				.from("customers")
				.select("*")
				.order("created_at", { ascending: false });

			if (customersError) {
				throw customersError;
			}

			// Then, get repair statistics for each customer
			const customersWithStats: CustomerWithStats[] = await Promise.all(
				customersData.map(async (customer) => {
					// Get repair counts and last repair date
					const { data: repairStats, error: repairError } = await supabase
						.from("repair_tickets")
						.select("created_at, status")
						.eq("customer_phone", customer.phone);

					if (repairError) {
						console.error("Error fetching repair stats:", repairError);
						return {
							...customer,
							id: customer.phone, // Use phone as ID for optimistic list compatibility
							totalRepairs: 0,
							lastRepairDate: null,
							activeRepairs: 0,
						};
					}

					const totalRepairs = repairStats.length;
					const activeRepairs = repairStats.filter(
						(r) =>
							!["completed", "cancelled_by_customer", "abandoned"].includes(
								r.status,
							),
					).length;
					const lastRepairDate =
						repairStats.length > 0
							? repairStats.sort(
									(a, b) =>
										new Date(b.created_at).getTime() -
										new Date(a.created_at).getTime(),
								)[0].created_at
							: null;

					return {
						...customer,
						id: customer.phone, // Use phone as ID for optimistic list compatibility
						totalRepairs,
						lastRepairDate,
						activeRepairs,
					};
				}),
			);

			setCustomers(customersWithStats);
		} catch (err) {
			console.error("Error fetching customers:", err);
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [setCustomers]);

	// Load customers on component mount
	useEffect(() => {
		fetchCustomers();
	}, [fetchCustomers]);

	// Real-time subscription to customer changes
	useEffect(() => {
		const channel = supabase
			.channel("customers-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "customers",
				},
				(payload) => {
					console.log("Customer change detected:", payload);
					// Refetch data when changes occur
					fetchCustomers();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [fetchCustomers]);

	// Table columns definition
	const columns: ColumnDef<CustomerWithStats>[] = [
		{
			accessorKey: "full_name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="ml-4"
				>
					Khách hàng
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const customer = row.original;
				const isOptimisticCustomer = isOptimistic(customer.id);
				return (
					<div className="flex items-center gap-2 ml-4">
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
							<div className="text-sm text-muted-foreground truncate max-w-xs">
								{customer.notes || "Không có ghi chú"}
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
						<div className="flex items-center text-sm">
							<Phone className="mr-1 h-3 w-3" />
							{customer.phone}
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
			cell: ({ row }) => getStatusBadge(row.original),
		},
		{
			accessorKey: "totalRepairs",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Lượt sửa chữa
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="text-center">{row.getValue("totalRepairs")}</div>
			),
		},
		{
			accessorKey: "lastRepairDate",
			header: "Lần cuối",
			cell: ({ row }) => formatDate(row.getValue("lastRepairDate")),
		},
		{
			id: "actions",
			header: "Thao tác",
			cell: ({ row }) => {
				const customer = row.original;
				const isOptimisticCustomer = isOptimistic(customer.id);
				return (
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							disabled={isOptimisticCustomer}
							title="Xem chi tiết khách hàng"
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							disabled={isOptimisticCustomer}
							title="Chỉnh sửa khách hàng"
						>
							<Edit className="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	];

	// Get customer status badge
	const getStatusBadge = (customer: CustomerWithStats) => {
		if (customer.activeRepairs > 0) {
			return (
				<Badge variant="default">
					Đang sửa chữa ({customer.activeRepairs})
				</Badge>
			);
		}
		if (customer.totalRepairs > 0) {
			return <Badge variant="secondary">Khách hàng cũ</Badge>;
		}
		return <Badge variant="outline">Khách hàng mới</Badge>;
	};

	// Format date
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Chưa có";
		return new Date(dateString).toLocaleDateString("vi-VN");
	};

	// Handle optimistic customer creation
	const handleCreateCustomer = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsSubmitting(true);

		const formData = new FormData(event.target as HTMLFormElement);
		const customerData = {
			full_name: formData.get("customerName") as string,
			phone: formData.get("customerPhone") as string,
			address: (formData.get("customerAddress") as string) || null,
			notes: (formData.get("customerNotes") as string) || null,
		};

		// Validate required fields
		if (!customerData.full_name || !customerData.phone) {
			setError(new Error("Tên và số điện thoại là bắt buộc"));
			setIsSubmitting(false);
			return;
		}

		// Generate optimistic customer
		const optimisticId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const optimisticCustomer: CustomerWithStats = {
			id: optimisticId,
			phone: customerData.phone,
			full_name: customerData.full_name,
			address: customerData.address,
			notes: customerData.notes,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			totalRepairs: 0,
			lastRepairDate: null,
			activeRepairs: 0,
		};

		// Add optimistic customer immediately
		addOptimisticItem(optimisticCustomer);

		try {
			// Create customer in database
			const { data: newCustomer, error: createError } = await supabase
				.from("customers")
				.insert(customerData)
				.select()
				.single();

			if (createError) throw createError;

			// Replace optimistic customer with real data
			const realCustomerWithStats: CustomerWithStats = {
				...newCustomer,
				id: newCustomer.phone, // Use phone as ID for optimistic list compatibility
				totalRepairs: 0,
				lastRepairDate: null,
				activeRepairs: 0,
			};

			confirmOptimisticItem(optimisticId, realCustomerWithStats);

			// Close dialog and reset form
			setIsDialogOpen(false);
			(event.target as HTMLFormElement).reset();
		} catch (err) {
			console.error("Error creating customer:", err);
			rollbackOptimisticItem(optimisticId);
			setError(err as Error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
					<div className="flex gap-2">
						<RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#299fce]" />
						<span className="text-sm text-muted-foreground">Đang tải...</span>
					</div>
				</div>
				<CustomerListSkeleton />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={fetchCustomers} disabled={loading}>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Làm mới
					</Button>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Thêm khách hàng
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Thêm khách hàng mới</DialogTitle>
								<DialogDescription>
									Nhập thông tin khách hàng để tạo hồ sơ mới trong hệ thống.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleCreateCustomer} className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="customerName">Họ và tên *</Label>
									<Input
										id="customerName"
										name="customerName"
										placeholder="Nhập họ tên khách hàng"
										required
										disabled={isSubmitting}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="customerPhone">Số điện thoại *</Label>
									<Input
										id="customerPhone"
										name="customerPhone"
										placeholder="Nhập số điện thoại"
										required
										disabled={isSubmitting}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="customerAddress">Địa chỉ</Label>
									<Input
										id="customerAddress"
										name="customerAddress"
										placeholder="Nhập địa chỉ"
										disabled={isSubmitting}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="customerNotes">Ghi chú</Label>
									<Input
										id="customerNotes"
										name="customerNotes"
										placeholder="Ghi chú về khách hàng"
										disabled={isSubmitting}
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Đang thêm...
										</>
									) : (
										<>
											<Plus className="h-4 w-4 mr-2" />
											Thêm khách hàng
										</>
									)}
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{error && (
				<SupabaseErrorAlert
					error={error}
					onRetry={fetchCustomers}
					onDismiss={() => setError(null)}
				/>
			)}

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng khách hàng
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{customers.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Khách hàng mới
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{customers.filter((c) => c.totalRepairs === 0).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đang sửa chữa</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{customers.filter((c) => c.activeRepairs > 0).length}
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
						<div className="text-2xl font-bold">
							{customers.filter((c) => c.totalRepairs >= 5).length}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Customer List */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách khách hàng</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={columns}
						data={customers}
						globalFilterFn={(row, columnId, filterValue) => {
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
		</div>
	);
}
