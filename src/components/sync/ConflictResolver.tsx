/**
 * Conflict Resolver Component
 * Handles UI for resolving synchronization conflicts between multiple sessions
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSyncManager } from "@/hooks/use-sync-manager";
import type { ConflictInfo } from "@/hooks/use-sync-manager";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface ConflictResolverProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	conflict?: ConflictInfo;
}

type ConflictValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Record<string, unknown>;

interface ConflictDiff {
	field: string;
	local_value: ConflictValue;
	remote_value: ConflictValue;
	type: "added" | "modified" | "removed" | "same";
}

export function ConflictResolver({
	open,
	onOpenChange,
	conflict,
}: ConflictResolverProps) {
	const { applyConflictResolution } = useSyncManager();
	const [selectedStrategy, setSelectedStrategy] =
		useState<ConflictInfo["resolution_strategy"]>("remote_wins");
	const [mergedData, setMergedData] = useState<Record<string, ConflictValue>>(
		{},
	);
	const [resolving, setResolving] = useState(false);

	if (!conflict) return null;

	// Calculate differences between local and remote data
	const calculateDifferences = (): ConflictDiff[] => {
		const diffs: ConflictDiff[] = [];
		const allKeys = new Set([
			...Object.keys(conflict.local_data || {}),
			...Object.keys(conflict.remote_data || {}),
		]);

		for (const key of allKeys) {
			const localValue = conflict.local_data?.[key];
			const remoteValue = conflict.remote_data?.[key];

			if (localValue === undefined && remoteValue !== undefined) {
				diffs.push({
					field: key,
					local_value: localValue,
					remote_value: remoteValue,
					type: "added",
				});
			} else if (localValue !== undefined && remoteValue === undefined) {
				diffs.push({
					field: key,
					local_value: localValue,
					remote_value: remoteValue,
					type: "removed",
				});
			} else if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
				diffs.push({
					field: key,
					local_value: localValue,
					remote_value: remoteValue,
					type: "modified",
				});
			} else {
				diffs.push({
					field: key,
					local_value: localValue,
					remote_value: remoteValue,
					type: "same",
				});
			}
		}

		return diffs.sort((a, b) => {
			const typeOrder = { modified: 0, added: 1, removed: 2, same: 3 };
			return typeOrder[a.type] - typeOrder[b.type];
		});
	};

	const differences = calculateDifferences();

	// Initialize merged data
	React.useEffect(() => {
		if (conflict) {
			setMergedData({
				...(conflict.local_data || {}),
				...(conflict.remote_data || {}),
			});
		}
	}, [conflict]);

	// Format Vietnamese field names
	const getVietnameseFieldName = (field: string): string => {
		const fieldNames: Record<string, string> = {
			ticket_code: "Mã phiếu",
			current_state: "Trạng thái hiện tại",
			device_info: "Thông tin thiết bị",
			customer_phone: "Số điện thoại khách hàng",
			problem_description: "Mô tả vấn đề",
			estimated_cost: "Chi phí ước tính",
			final_cost: "Chi phí cuối cùng",
			assigned_technician: "Kỹ thuật viên phụ trách",
			priority: "Độ ưu tiên",
			notes: "Ghi chú",
			is_paid: "Đã thanh toán",
			warranty_until: "Bảo hành đến",
			updated_at: "Cập nhật lần cuối",
			version: "Phiên bản",
		};
		return fieldNames[field] || field;
	};

	// Format value display
	const formatValue = (value: ConflictValue): string => {
		if (value === null || value === undefined) return "Không có";
		if (typeof value === "boolean") return value ? "Có" : "Không";
		if (
			typeof value === "string" &&
			value.includes("T") &&
			value.includes("Z")
		) {
			// Timestamp
			return new Date(value).toLocaleString("vi-VN");
		}
		if (typeof value === "number") {
			if (value > 1000000) return `${value.toLocaleString("vi-VN")}đ`;
			return value.toString();
		}
		return String(value);
	};

	// Get diff type color
	const getDiffTypeColor = (type: ConflictDiff["type"]): string => {
		switch (type) {
			case "added":
				return "text-green-600 bg-green-50";
			case "removed":
				return "text-red-600 bg-red-50";
			case "modified":
				return "text-amber-600 bg-amber-50";
			case "same":
				return "text-gray-600 bg-gray-50";
		}
	};

	// Get diff type icon
	const getDiffTypeIcon = (type: ConflictDiff["type"]): string => {
		switch (type) {
			case "added":
				return "➕";
			case "removed":
				return "➖";
			case "modified":
				return "📝";
			case "same":
				return "✅";
		}
	};

	// Handle field merge selection
	const handleFieldMerge = (
		field: string,
		value: ConflictValue,
		source: "local" | "remote",
	) => {
		setMergedData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Handle resolution
	const handleResolve = async () => {
		setResolving(true);
		try {
			let resolvedData: Record<string, ConflictValue>;

			switch (selectedStrategy) {
				case "local_wins":
					resolvedData = conflict.local_data;
					break;
				case "remote_wins":
					resolvedData = conflict.remote_data;
					break;
				case "merge":
					resolvedData = mergedData;
					break;
				case "user_choice":
					resolvedData = mergedData;
					break;
			}

			await applyConflictResolution(
				conflict.id,
				resolvedData,
				selectedStrategy,
			);
			onOpenChange(false);
		} catch (error) {
			console.error("Error resolving conflict:", error);
		} finally {
			setResolving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						⚠️ Giải quyết xung đột dữ liệu
						<Badge variant="outline">
							Phiên bản {conflict.local_version} vs {conflict.remote_version}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 gap-4">
					{/* Conflict Info */}
					<div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
						<div className="flex items-center gap-2 mb-2">
							<span className="font-medium text-amber-800">
								Thông tin xung đột:
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Entity ID:</span>{" "}
								{conflict.entity_id}
							</div>
							<div>
								<span className="font-medium">Loại:</span>{" "}
								{conflict.entity_id.split("-")[0]}
							</div>
							<div>
								<span className="font-medium">Thời gian:</span>{" "}
								{new Date(conflict.timestamp).toLocaleString("vi-VN")}
							</div>
							<div>
								<span className="font-medium">Trạng thái:</span>{" "}
								{conflict.resolved ? "Đã giải quyết" : "Đang chờ giải quyết"}
							</div>
						</div>
					</div>

					{/* Resolution Strategy Selection */}
					<div className="space-y-2">
						<label className="font-medium text-sm">Chọn cách giải quyết:</label>
						<div className="grid grid-cols-2 gap-2">
							<Button
								variant={
									selectedStrategy === "local_wins" ? "default" : "outline"
								}
								size="sm"
								onClick={() => setSelectedStrategy("local_wins")}
							>
								📍 Giữ dữ liệu cục bộ
							</Button>
							<Button
								variant={
									selectedStrategy === "remote_wins" ? "default" : "outline"
								}
								size="sm"
								onClick={() => setSelectedStrategy("remote_wins")}
							>
								🌐 Sử dụng dữ liệu từ xa
							</Button>
							<Button
								variant={selectedStrategy === "merge" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedStrategy("merge")}
								className="col-span-2"
							>
								🔀 Hợp nhất tự động
							</Button>
						</div>
					</div>

					{/* Data Comparison */}
					<Tabs defaultValue="differences" className="flex-1">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="differences">
								So sánh ({differences.filter((d) => d.type !== "same").length})
							</TabsTrigger>
							<TabsTrigger value="local">Dữ liệu cục bộ</TabsTrigger>
							<TabsTrigger value="remote">Dữ liệu từ xa</TabsTrigger>
						</TabsList>

						<TabsContent value="differences">
							<ScrollArea className="h-64">
								<div className="space-y-2">
									{differences.map((diff) => (
										<div
											key={diff.field}
											className={cn(
												"p-3 rounded-lg border",
												getDiffTypeColor(diff.type),
											)}
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<span>{getDiffTypeIcon(diff.type)}</span>
													<span className="font-medium">
														{getVietnameseFieldName(diff.field)}
													</span>
													<Badge variant="outline" className="text-xs">
														{diff.type === "added"
															? "Thêm mới"
															: diff.type === "removed"
																? "Đã xóa"
																: diff.type === "modified"
																	? "Đã sửa"
																	: "Giống nhau"}
													</Badge>
												</div>

												{diff.type !== "same" &&
													selectedStrategy === "merge" && (
														<div className="flex gap-1">
															{diff.local_value !== undefined && (
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() =>
																		handleFieldMerge(
																			diff.field,
																			diff.local_value,
																			"local",
																		)
																	}
																	className="text-xs"
																>
																	Chọn cục bộ
																</Button>
															)}
															{diff.remote_value !== undefined && (
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() =>
																		handleFieldMerge(
																			diff.field,
																			diff.remote_value,
																			"remote",
																		)
																	}
																	className="text-xs"
																>
																	Chọn từ xa
																</Button>
															)}
														</div>
													)}
											</div>

											{diff.type !== "same" && (
												<div className="grid grid-cols-2 gap-4 text-sm">
													<div>
														<div className="font-medium text-blue-700">
															Cục bộ (v{conflict.local_version}):
														</div>
														<div className="bg-blue-50 p-2 rounded mt-1 min-h-8">
															{formatValue(diff.local_value)}
														</div>
													</div>
													<div>
														<div className="font-medium text-green-700">
															Từ xa (v{conflict.remote_version}):
														</div>
														<div className="bg-green-50 p-2 rounded mt-1 min-h-8">
															{formatValue(diff.remote_value)}
														</div>
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							</ScrollArea>
						</TabsContent>

						<TabsContent value="local">
							<ScrollArea className="h-64">
								<pre className="text-sm bg-blue-50 p-4 rounded overflow-auto">
									{JSON.stringify(conflict.local_data, null, 2)}
								</pre>
							</ScrollArea>
						</TabsContent>

						<TabsContent value="remote">
							<ScrollArea className="h-64">
								<pre className="text-sm bg-green-50 p-4 rounded overflow-auto">
									{JSON.stringify(conflict.remote_data, null, 2)}
								</pre>
							</ScrollArea>
						</TabsContent>
					</Tabs>

					{/* Action Buttons */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={resolving}
						>
							Hủy bỏ
						</Button>
						<Button
							onClick={handleResolve}
							disabled={resolving}
							className="min-w-32"
						>
							{resolving ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin">🔄</div>
									Đang giải quyết...
								</div>
							) : (
								"Giải quyết xung đột"
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Conflict list component for dashboard
export function ConflictList({ className }: { className?: string }) {
	const { conflicts, applyConflictResolution } = useSyncManager();
	const [selectedConflict, setSelectedConflict] = useState<ConflictInfo | null>(
		null,
	);
	const [resolverOpen, setResolverOpen] = useState(false);

	const unresolvedConflicts = conflicts.filter((c) => !c.resolved);

	const handleAutoResolve = async (conflict: ConflictInfo) => {
		try {
			// Auto-resolve using remote_wins strategy
			await applyConflictResolution(
				conflict.id,
				conflict.remote_data,
				"remote_wins",
			);
		} catch (error) {
			console.error("Error auto-resolving conflict:", error);
		}
	};

	const handleManualResolve = (conflict: ConflictInfo) => {
		setSelectedConflict(conflict);
		setResolverOpen(true);
	};

	if (unresolvedConflicts.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center gap-2">
				<h3 className="font-medium">⚠️ Xung đột cần giải quyết</h3>
				<Badge variant="destructive">{unresolvedConflicts.length}</Badge>
			</div>

			<div className="space-y-2">
				{unresolvedConflicts.slice(0, 5).map((conflict) => (
					<div
						key={conflict.id}
						className="bg-amber-50 border border-amber-200 rounded-lg p-3"
					>
						<div className="flex items-center justify-between">
							<div>
								<div className="font-medium text-amber-800">
									Xung đột: {conflict.entity_id}
								</div>
								<div className="text-sm text-amber-600">
									Phiên bản {conflict.local_version} vs{" "}
									{conflict.remote_version}
								</div>
								<div className="text-xs text-amber-500">
									{new Date(conflict.timestamp).toLocaleString("vi-VN")}
								</div>
							</div>

							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleAutoResolve(conflict)}
								>
									Tự động giải quyết
								</Button>
								<Button size="sm" onClick={() => handleManualResolve(conflict)}>
									Giải quyết thủ công
								</Button>
							</div>
						</div>
					</div>
				))}

				{unresolvedConflicts.length > 5 && (
					<div className="text-center text-sm text-gray-500">
						và {unresolvedConflicts.length - 5} xung đột khác...
					</div>
				)}
			</div>

			<ConflictResolver
				open={resolverOpen}
				onOpenChange={setResolverOpen}
				conflict={selectedConflict}
			/>
		</div>
	);
}
