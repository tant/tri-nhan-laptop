/**
 * Visual Workflow Status Display Component
 * Displays current state, progress, and next possible actions for repair workflow
 */

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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type WorkflowTicket,
	useRepairWorkflow,
} from "@/hooks/use-repair-workflow";
import { REPAIR_STATES, type RepairState } from "@/lib/workflow/repair-states";
import {
	AlertTriangle,
	ArrowRight,
	CheckCircle,
	Clock,
	History,
	Info,
} from "lucide-react";
import { useState } from "react";

interface WorkflowStatusProps {
	ticket: WorkflowTicket;
	userRole: string;
	userId: string;
	onStateChange?: (newState: RepairState) => void;
}

export function WorkflowStatus({
	ticket,
	userRole,
	userId,
	onStateChange,
}: WorkflowStatusProps) {
	const {
		getWorkflowProgress,
		getNextStates,
		changeTicketState,
		loadStateHistory,
		stateHistory,
		getStateLabel,
		getStateColor,
		getStateCategory,
		loading,
	} = useRepairWorkflow();

	const [showStateChange, setShowStateChange] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [selectedNewState, setSelectedNewState] = useState<RepairState | null>(
		null,
	);
	const [changeReason, setChangeReason] = useState("");
	const [changeNotes, setChangeNotes] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const progress = getWorkflowProgress(ticket);
	const nextStates = getNextStates(ticket, userRole);
	const currentState = REPAIR_STATES[ticket.current_state];
	const progressPercentage = (progress.currentStep / progress.totalSteps) * 100;

	const handleStateChange = async () => {
		if (!selectedNewState || !changeReason.trim()) return;

		setSubmitting(true);
		try {
			const result = await changeTicketState(ticket.id, selectedNewState, {
				reason: changeReason,
				notes: changeNotes,
				userId,
				userRole,
			});

			if (result.success) {
				setShowStateChange(false);
				setSelectedNewState(null);
				setChangeReason("");
				setChangeNotes("");
				onStateChange?.(selectedNewState);
			} else {
				alert(`Lỗi: ${result.error}`);
			}
		} catch (_error) {
			alert("Lỗi khi thay đổi trạng thái");
		} finally {
			setSubmitting(false);
		}
	};

	const handleShowHistory = async () => {
		setShowHistory(true);
		await loadStateHistory(ticket.id);
	};

	const getStatusIcon = (category: string) => {
		switch (category) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "cancelled":
				return <AlertTriangle className="h-4 w-4 text-red-600" />;
			case "special":
				return <Info className="h-4 w-4 text-blue-600" />;
			default:
				return <Clock className="h-4 w-4 text-orange-600" />;
		}
	};

	const getCategoryLabel = (category: string) => {
		const labels = {
			active: "Đang xử lý",
			completed: "Đã hoàn thành",
			cancelled: "Đã hủy",
			special: "Đặc biệt",
		};
		return labels[category as keyof typeof labels] || category;
	};

	return (
		<div className="space-y-6">
			{/* Current Status Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{getStatusIcon(currentState.category)}
							<CardTitle className="text-lg">{currentState.label}</CardTitle>
							<Badge
								variant="outline"
								style={{
									borderColor: currentState.color,
									color: currentState.color,
								}}
							>
								{getCategoryLabel(currentState.category)}
							</Badge>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={handleShowHistory}>
								<History className="h-4 w-4 mr-1" />
								Lịch sử
							</Button>
							{nextStates.length > 0 && (
								<Dialog
									open={showStateChange}
									onOpenChange={setShowStateChange}
								>
									<DialogTrigger asChild>
										<Button size="sm">
											<ArrowRight className="h-4 w-4 mr-1" />
											Chuyển trạng thái
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Chuyển trạng thái phiếu sửa chữa
											</DialogTitle>
											<DialogDescription>
												Chọn trạng thái mới và nhập lý do thay đổi
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4">
											<div>
												<Label htmlFor="newState">Trạng thái mới</Label>
												<Select
													value={selectedNewState || ""}
													onValueChange={(value) =>
														setSelectedNewState(value as RepairState)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Chọn trạng thái mới" />
													</SelectTrigger>
													<SelectContent>
														{nextStates.map(({ state, label, recommended }) => (
															<SelectItem key={state} value={state}>
																<div className="flex items-center gap-2">
																	{label}
																	{recommended && (
																		<Badge
																			variant="secondary"
																			className="text-xs"
																		>
																			Đề xuất
																		</Badge>
																	)}
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label htmlFor="reason">Lý do thay đổi *</Label>
												<Textarea
													id="reason"
													placeholder="Nhập lý do thay đổi trạng thái..."
													value={changeReason}
													onChange={(e) => setChangeReason(e.target.value)}
													required
												/>
											</div>

											<div>
												<Label htmlFor="notes">Ghi chú thêm</Label>
												<Textarea
													id="notes"
													placeholder="Ghi chú bổ sung (tùy chọn)..."
													value={changeNotes}
													onChange={(e) => setChangeNotes(e.target.value)}
												/>
											</div>

											<div className="flex gap-2 justify-end">
												<Button
													variant="outline"
													onClick={() => setShowStateChange(false)}
													disabled={submitting}
												>
													Hủy
												</Button>
												<Button
													onClick={handleStateChange}
													disabled={
														!selectedNewState ||
														!changeReason.trim() ||
														submitting
													}
												>
													{submitting ? "Đang xử lý..." : "Xác nhận"}
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							)}
						</div>
					</div>
					<CardDescription>{currentState.description}</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="space-y-4">
						{/* Progress Bar */}
						<div>
							<div className="flex justify-between text-sm text-gray-600 mb-2">
								<span>Tiến độ</span>
								<span>
									{progress.currentStep}/{progress.totalSteps} bước
								</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
						</div>

						{/* Workflow Steps */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h4 className="font-medium text-sm text-gray-700 mb-2">
									Các bước đã hoàn thành
								</h4>
								<div className="space-y-1">
									{progress.completedSteps.map((step, index) => (
										<div
											key={index}
											className="flex items-center gap-2 text-sm"
										>
											<CheckCircle className="h-3 w-3 text-green-600" />
											<span className="text-green-700">{step}</span>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="font-medium text-sm text-gray-700 mb-2">
									Các bước tiếp theo
								</h4>
								<div className="space-y-1">
									{progress.upcomingSteps.slice(0, 5).map((step, index) => (
										<div
											key={index}
											className="flex items-center gap-2 text-sm"
										>
											<Clock className="h-3 w-3 text-gray-400" />
											<span className="text-gray-600">{step}</span>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Estimated Completion */}
						{progress.estimatedCompletion && (
							<div className="bg-blue-50 p-3 rounded-lg">
								<div className="flex items-center gap-2">
									<Info className="h-4 w-4 text-blue-600" />
									<span className="font-medium text-blue-900">
										Dự kiến hoàn thành:
									</span>
									<span className="text-blue-700">
										{new Date(progress.estimatedCompletion).toLocaleDateString(
											"vi-VN",
										)}
									</span>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Next Possible Actions */}
			{nextStates.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Các hành động có thể thực hiện
						</CardTitle>
						<CardDescription>
							Dựa trên trạng thái hiện tại và quyền hạn của bạn
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{nextStates.map(({ state, label, recommended }) => {
								const stateInfo = REPAIR_STATES[state];
								return (
									<div
										key={state}
										className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
											recommended
												? "border-blue-300 bg-blue-50"
												: "border-gray-200"
										}`}
										onClick={() => {
											setSelectedNewState(state);
											setShowStateChange(true);
										}}
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="flex items-center gap-2">
													<div
														className="w-3 h-3 rounded-full"
														style={{ backgroundColor: stateInfo.color }}
													/>
													<span className="font-medium">{label}</span>
													{recommended && (
														<Badge variant="secondary" className="text-xs">
															Đề xuất
														</Badge>
													)}
												</div>
												<p className="text-sm text-gray-600 mt-1">
													{stateInfo.description}
												</p>
											</div>
											<ArrowRight className="h-4 w-4 text-gray-400" />
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* State History Dialog */}
			<Dialog open={showHistory} onOpenChange={setShowHistory}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Lịch sử thay đổi trạng thái</DialogTitle>
						<DialogDescription>
							Tất cả các thay đổi trạng thái của phiếu sửa chữa này
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{loading ? (
							<div className="text-center py-4">Đang tải...</div>
						) : stateHistory.length > 0 ? (
							<div className="space-y-4">
								{stateHistory.map((log, index) => (
									<div key={log.id} className="flex gap-4">
										<div className="flex flex-col items-center">
											<div
												className="w-3 h-3 rounded-full"
												style={{
													backgroundColor: REPAIR_STATES[log.to_state].color,
												}}
											/>
											{index < stateHistory.length - 1 && (
												<div className="w-px h-12 bg-gray-200 mt-2" />
											)}
										</div>
										<div className="flex-1 pb-4">
											<div className="flex items-center gap-2 mb-1">
												<span className="font-medium">
													{REPAIR_STATES[log.to_state].label}
												</span>
												<Badge variant="outline" className="text-xs">
													{new Date(log.changed_at).toLocaleDateString("vi-VN")}
												</Badge>
											</div>
											<p className="text-sm text-gray-600 mb-1">{log.reason}</p>
											{log.notes && (
												<p className="text-xs text-gray-500 italic">
													{log.notes}
												</p>
											)}
											<div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
												<span>
													Bởi: {(log as any).users?.full_name || log.changed_by}
												</span>
												{log.customer_notified && (
													<Badge variant="secondary" className="text-xs">
														Đã thông báo KH
													</Badge>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-4 text-gray-500">
								Chưa có lịch sử thay đổi trạng thái
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
