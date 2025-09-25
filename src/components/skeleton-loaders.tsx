import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// Table skeleton for data tables
export function TableSkeleton({
	rows = 5,
	columns = 6,
}: { rows?: number; columns?: number }) {
	const uniqueId = Math.random().toString(36).substr(2, 9);
	const headerKeys = Array.from(
		{ length: columns },
		(_, i) => `th-${uniqueId}-col-${i}`,
	);
	const rowKeys = Array.from({ length: rows }, (_, r) =>
		Array.from({ length: columns }, (_, c) => `cell-${uniqueId}-${r}-${c}`),
	);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headerKeys.map((key, _i) => (
						<TableHead key={key}>
							<Skeleton className="h-4 w-24" />
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: rows }, (_, r) => `row-${uniqueId}-${r}`).map(
					(rowKey, r) => (
						<TableRow key={rowKey}>
							{rowKeys[r].map((cellKey) => (
								<TableCell key={cellKey}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							))}
						</TableRow>
					),
				)}
			</TableBody>
		</Table>
	);
}

// Statistics card skeleton
export function StatCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-3 w-20 mt-1" />
			</CardContent>
		</Card>
	);
}

// Customer list skeleton
export function CustomerListSkeleton() {
	const uniqueId = Math.random().toString(36).substr(2, 9);
	const statKeys = Array.from(
		{ length: 4 },
		(_, i) => `customer-stat-${uniqueId}-${i}`,
	);

	return (
		<div className="space-y-6">
			{/* Statistics cards */}
			<div className="grid gap-4 md:grid-cols-4">
				{statKeys.map((key) => (
					<StatCardSkeleton key={key} />
				))}
			</div>

			{/* Search card */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="relative">
						<Skeleton className="h-10 w-full" />
					</div>
				</CardContent>
			</Card>

			{/* Table card */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-24" />
				</CardHeader>
				<CardContent>
					<TableSkeleton rows={8} columns={7} />
				</CardContent>
			</Card>
		</div>
	);
}

// Repair tickets skeleton
export function RepairTicketsSkeleton() {
	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<Skeleton className="h-8 w-64" />
				<div className="flex gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>

			{/* Statistics cards */}
			<div className="grid gap-4 mb-6">
				<div className="grid gap-4 md:grid-cols-4">
					{Array.from({ length: 4 }, (_, i) => `repair-stat-${i}`).map(
						(key) => (
							<StatCardSkeleton key={key} />
						),
					)}
				</div>
			</div>

			{/* Main table */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
				</CardHeader>
				<CardContent>
					<TableSkeleton rows={10} columns={8} />
				</CardContent>
			</Card>
		</div>
	);
}

// Parts inventory skeleton
export function PartsInventorySkeleton() {
	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-4 w-64 mt-2" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-36" />
				</div>
			</div>

			{/* Statistics cards */}
			<div className="grid gap-4 md:grid-cols-4">
				{Array.from({ length: 4 }, (_, i) => `parts-stat-${i}`).map((key) => (
					<StatCardSkeleton key={key} />
				))}
			</div>

			{/* Alert card skeleton */}
			<Card className="border-orange-200 bg-orange-50">
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-4 w-full mb-2" />
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 3 }, (_, i) => `alert-badge-${i}`).map(
							(key) => (
								<Skeleton key={key} className="h-6 w-24" />
							),
						)}
					</div>
				</CardContent>
			</Card>

			{/* Search and filter */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1">
							<Skeleton className="h-4 w-20 mb-2" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="w-48">
							<Skeleton className="h-4 w-16 mb-2" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Parts list */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-24" />
				</CardHeader>
				<CardContent>
					<TableSkeleton rows={8} columns={8} />
				</CardContent>
			</Card>
		</div>
	);
}

// Dashboard skeleton
export function DashboardSkeleton() {
	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-10 w-32" />
			</div>

			{/* Quick stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
				{Array.from({ length: 4 }, (_, i) => `dashboard-stat-${i}`).map(
					(key) => (
						<StatCardSkeleton key={key} />
					),
				)}
			</div>

			{/* Charts and recent activity */}
			<div className="grid gap-6 md:grid-cols-2 mb-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-64 w-full" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-36" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{Array.from({ length: 5 }, (_, i) => `activity-${i}`).map(
								(key) => (
									<div key={key} className="flex items-center space-x-4">
										<Skeleton className="h-12 w-12 rounded-full" />
										<div className="space-y-2 flex-1">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-3 w-3/4" />
										</div>
									</div>
								),
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent repairs */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-20" />
				</CardHeader>
				<CardContent>
					<TableSkeleton rows={5} columns={6} />
				</CardContent>
			</Card>
		</div>
	);
}

// Generic page skeleton
export function PageSkeleton() {
	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-24" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{Array.from({ length: 6 }, (_, i) => `page-item-${i}`).map(
								(key) => (
									<Skeleton key={key} className="h-12 w-full" />
								),
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
