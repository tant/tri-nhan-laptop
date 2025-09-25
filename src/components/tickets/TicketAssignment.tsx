import {
	AlertCircle,
	Award,
	Calculator,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	FileText,
	Settings,
	User,
	Users,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface Technician {
	id: string;
	name: string;
	email: string;
	phone: string;
	specialties: string[];
	currentWorkload: number;
	maxCapacity: number;
	experienceLevel: "junior" | "senior" | "expert";
	averageRepairTime: number;
	successRate: number;
	isAvailable: boolean;
}

interface CostAssessment {
	laborCost: number;
	partsCosts: Array<{
		partName: string;
		quantity: number;
		unitPrice: number;
		supplier: string;
	}>;
	additionalCosts: Array<{
		description: string;
		amount: number;
	}>;
	totalEstimatedCost: number;
	profitMargin: number;
	finalQuote: number;
	warranty: {
		laborWarranty: number; // months
		partsWarranty: number; // months
		warrantyTerms: string;
	};
}

interface TicketAssignmentProps {
	ticketId?: string;
	problemCategory: string;
	deviceBrand: string;
	deviceModel: string;
	urgencyLevel: string;
	problemClassification?: Record<string, unknown>;
	onAssignmentChange?: (assignment: Record<string, unknown>) => void;
	initialData?: Record<string, unknown>;
}

export const TicketAssignment: React.FC<TicketAssignmentProps> = ({
	ticketId,
	problemCategory,
	deviceBrand,
	deviceModel,
	urgencyLevel,
	problemClassification,
	onAssignmentChange,
	initialData,
}) => {
	const [availableTechnicians, setAvailableTechnicians] = useState<
		Technician[]
	>([]);
	const [selectedTechnician, setSelectedTechnician] = useState<string>("");
	const [assignmentPriority, setAssignmentPriority] = useState<string>(
		urgencyLevel || "medium",
	);
	const [estimatedStartDate, setEstimatedStartDate] = useState<string>("");
	const [estimatedCompletionDate, setEstimatedCompletionDate] =
		useState<string>("");
	const [assignmentNotes, setAssignmentNotes] = useState<string>("");

	const [costAssessment, setCostAssessment] = useState<CostAssessment>({
		laborCost: 0,
		partsCosts: [],
		additionalCosts: [],
		totalEstimatedCost: 0,
		profitMargin: 20,
		finalQuote: 0,
		warranty: {
			laborWarranty: 3,
			partsWarranty: 6,
			warrantyTerms:
				"Bảo hành lỗi kỹ thuật, không bao gồm va đập và ngấm nước.",
		},
	});

	const [newPartName, setNewPartName] = useState("");
	const [newPartQuantity, setNewPartQuantity] = useState(1);
	const [newPartPrice, setNewPartPrice] = useState(0);
	const [newPartSupplier, setNewPartSupplier] = useState("");

	const [newAdditionalDesc, setNewAdditionalDesc] = useState("");
	const [newAdditionalAmount, setNewAdditionalAmount] = useState(0);

	// Mock technicians data
	const mockTechnicians: Technician[] = [
		{
			id: "tech1",
			name: "Nguyễn Văn Tùng",
			email: "tung@repair.com",
			phone: "0901234567",
			specialties: ["screen", "hardware", "motherboard"],
			currentWorkload: 3,
			maxCapacity: 5,
			experienceLevel: "expert",
			averageRepairTime: 120, // minutes
			successRate: 95,
			isAvailable: true,
		},
		{
			id: "tech2",
			name: "Trần Thị Hoa",
			email: "hoa@repair.com",
			phone: "0907654321",
			specialties: ["software", "virus", "performance"],
			currentWorkload: 2,
			maxCapacity: 4,
			experienceLevel: "senior",
			averageRepairTime: 90,
			successRate: 92,
			isAvailable: true,
		},
		{
			id: "tech3",
			name: "Lê Minh Đức",
			email: "duc@repair.com",
			phone: "0912345678",
			specialties: ["battery", "charging", "keyboard"],
			currentWorkload: 1,
			maxCapacity: 3,
			experienceLevel: "junior",
			averageRepairTime: 150,
			successRate: 88,
			isAvailable: true,
		},
		{
			id: "tech4",
			name: "Phạm Thành Long",
			email: "long@repair.com",
			phone: "0909876543",
			specialties: ["data_recovery", "hardware", "diagnostics"],
			currentWorkload: 4,
			maxCapacity: 4,
			experienceLevel: "expert",
			averageRepairTime: 200,
			successRate: 97,
			isAvailable: false,
		},
	];

	useEffect(() => {
		// Filter technicians based on problem category
		const filteredTechnicians = mockTechnicians.filter(
			(tech) =>
				tech.specialties.includes(problemCategory) ||
				tech.experienceLevel === "expert",
		);

		// Sort by availability, workload, and success rate
		const sortedTechnicians = filteredTechnicians.sort((a, b) => {
			if (a.isAvailable !== b.isAvailable) return b.isAvailable ? 1 : -1;
			if (a.currentWorkload !== b.currentWorkload)
				return a.currentWorkload - b.currentWorkload;
			return b.successRate - a.successRate;
		});

		setAvailableTechnicians(sortedTechnicians);
	}, [problemCategory]);

	useEffect(() => {
		if (initialData) {
			setSelectedTechnician(initialData.selectedTechnician || "");
			setAssignmentPriority(initialData.assignmentPriority || urgencyLevel);
			setEstimatedStartDate(initialData.estimatedStartDate || "");
			setEstimatedCompletionDate(initialData.estimatedCompletionDate || "");
			setAssignmentNotes(initialData.assignmentNotes || "");
			setCostAssessment(initialData.costAssessment || costAssessment);
		}
	}, [initialData, urgencyLevel, costAssessment]);

	useEffect(() => {
		const partsTotal = costAssessment.partsCosts.reduce(
			(sum, part) => sum + part.quantity * part.unitPrice,
			0,
		);

		const additionalTotal = costAssessment.additionalCosts.reduce(
			(sum, cost) => sum + cost.amount,
			0,
		);

		const subtotal = costAssessment.laborCost + partsTotal + additionalTotal;
		const finalQuote = subtotal * (1 + costAssessment.profitMargin / 100);

		setCostAssessment((prev) => ({
			...prev,
			totalEstimatedCost: subtotal,
			finalQuote: Math.round(finalQuote),
		}));
	}, [costAssessment]);

	useEffect(() => {
		if (onAssignmentChange) {
			onAssignmentChange({
				selectedTechnician,
				assignmentPriority,
				estimatedStartDate,
				estimatedCompletionDate,
				assignmentNotes,
				costAssessment,
			});
		}
	}, [onAssignmentChange, selectedTechnician, assignmentPriority, estimatedStartDate, estimatedCompletionDate, assignmentNotes, costAssessment]);


	const addPart = () => {
		if (newPartName && newPartPrice > 0) {
			setCostAssessment((prev) => ({
				...prev,
				partsCosts: [
					...prev.partsCosts,
					{
						partName: newPartName,
						quantity: newPartQuantity,
						unitPrice: newPartPrice,
						supplier: newPartSupplier,
					},
				],
			}));

			setNewPartName("");
			setNewPartQuantity(1);
			setNewPartPrice(0);
			setNewPartSupplier("");
		}
	};

	const removePart = (index: number) => {
		setCostAssessment((prev) => ({
			...prev,
			partsCosts: prev.partsCosts.filter((_, i) => i !== index),
		}));
	};

	const addAdditionalCost = () => {
		if (newAdditionalDesc && newAdditionalAmount > 0) {
			setCostAssessment((prev) => ({
				...prev,
				additionalCosts: [
					...prev.additionalCosts,
					{
						description: newAdditionalDesc,
						amount: newAdditionalAmount,
					},
				],
			}));

			setNewAdditionalDesc("");
			setNewAdditionalAmount(0);
		}
	};

	const removeAdditionalCost = (index: number) => {
		setCostAssessment((prev) => ({
			...prev,
			additionalCosts: prev.additionalCosts.filter((_, i) => i !== index),
		}));
	};

	const handleTechnicianSelect = (technicianId: string) => {
		setSelectedTechnician(technicianId);

		const technician = availableTechnicians.find((t) => t.id === technicianId);
		if (technician && problemClassification) {
			// Auto-calculate estimated dates based on technician's average time
			const startDate = new Date();
			startDate.setDate(
				startDate.getDate() + Math.ceil(technician.currentWorkload / 2),
			);
			setEstimatedStartDate(startDate.toISOString().split("T")[0]);

			const completionDate = new Date(startDate);
			completionDate.setMinutes(
				completionDate.getMinutes() + technician.averageRepairTime,
			);
			setEstimatedCompletionDate(completionDate.toISOString().split("T")[0]);

			// Auto-set labor cost based on complexity and technician level
			const baseLaborRate =
				technician.experienceLevel === "expert"
					? 200000
					: technician.experienceLevel === "senior"
						? 150000
						: 100000;
			const complexityMultiplier =
				problemClassification.urgencyLevel === "urgent"
					? 1.5
					: problemClassification.urgencyLevel === "high"
						? 1.3
						: 1.0;

			setCostAssessment((prev) => ({
				...prev,
				laborCost: Math.round(baseLaborRate * complexityMultiplier),
			}));
		}
	};

	const getTechnicianWorkloadColor = (
		workload: number,
		maxCapacity: number,
	) => {
		const percentage = (workload / maxCapacity) * 100;
		if (percentage >= 90) return "bg-red-100 text-red-800";
		if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
		return "bg-green-100 text-green-800";
	};

	const getExperienceColor = (level: string) => {
		switch (level) {
			case "expert":
				return "bg-purple-100 text-purple-800";
			case "senior":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			<Tabs defaultValue="assignment" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="assignment" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Phân công
					</TabsTrigger>
					<TabsTrigger value="cost" className="flex items-center gap-2">
						<Calculator className="h-4 w-4" />
						Báo giá
					</TabsTrigger>
				</TabsList>

				<TabsContent value="assignment" className="space-y-6">
					{/* Technician Selection */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Chọn kỹ thuật viên
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4">
								{availableTechnicians.map((technician) => (
									<div
										key={technician.id}
										className={`p-4 border rounded-lg cursor-pointer transition-colors ${
											selectedTechnician === technician.id
												? "border-blue-500 bg-blue-50"
												: technician.isAvailable
													? "border-gray-200 hover:border-gray-300"
													: "border-gray-100 bg-gray-50 opacity-50"
										}`}
										onClick={() =>
											technician.isAvailable &&
											handleTechnicianSelect(technician.id)
										}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<h4 className="font-medium">{technician.name}</h4>
													<Badge
														className={getExperienceColor(
															technician.experienceLevel,
														)}
													>
														{technician.experienceLevel === "expert"
															? "Chuyên gia"
															: technician.experienceLevel === "senior"
																? "Có kinh nghiệm"
																: "Mới"}
													</Badge>
													<Badge
														className={getTechnicianWorkloadColor(
															technician.currentWorkload,
															technician.maxCapacity,
														)}
													>
														{technician.currentWorkload}/
														{technician.maxCapacity} công việc
													</Badge>
													{!technician.isAvailable && (
														<Badge className="bg-red-100 text-red-800">
															Bận
														</Badge>
													)}
												</div>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
													<div>
														<Label className="font-medium">Liên hệ</Label>
														<p>{technician.phone}</p>
													</div>
													<div>
														<Label className="font-medium">Chuyên môn</Label>
														<div className="flex flex-wrap gap-1 mt-1">
															{technician.specialties.map((specialty) => (
																<Badge
																	key={specialty}
																	variant="outline"
																	className="text-xs"
																>
																	{specialty}
																</Badge>
															))}
														</div>
													</div>
													<div>
														<Label className="font-medium">Thời gian TB</Label>
														<p>{technician.averageRepairTime} phút</p>
													</div>
													<div>
														<Label className="font-medium">
															Tỷ lệ thành công
														</Label>
														<p className="text-green-600">
															{technician.successRate}%
														</p>
													</div>
												</div>
											</div>

											{selectedTechnician === technician.id && (
												<CheckCircle className="h-5 w-5 text-blue-500" />
											)}
										</div>
									</div>
								))}
							</div>

							{availableTechnicians.length === 0 && (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										Không có kỹ thuật viên phù hợp cho loại vấn đề này hiện tại.
									</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>

					{/* Assignment Details */}
					{selectedTechnician && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5" />
									Chi tiết phân công
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="priority">Mức độ ưu tiên</Label>
										<Select
											value={assignmentPriority}
											onValueChange={setAssignmentPriority}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Thấp</SelectItem>
												<SelectItem value="medium">Trung bình</SelectItem>
												<SelectItem value="high">Cao</SelectItem>
												<SelectItem value="urgent">Khẩn cấp</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="startDate">Ngày bắt đầu dự kiến</Label>
										<Input
											id="startDate"
											type="date"
											value={estimatedStartDate}
											onChange={(e) => setEstimatedStartDate(e.target.value)}
										/>
									</div>

									<div className="md:col-span-2">
										<Label htmlFor="completionDate">
											Ngày hoàn thành dự kiến
										</Label>
										<Input
											id="completionDate"
											type="date"
											value={estimatedCompletionDate}
											onChange={(e) =>
												setEstimatedCompletionDate(e.target.value)
											}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="assignmentNotes">Ghi chú phân công</Label>
									<Textarea
										id="assignmentNotes"
										value={assignmentNotes}
										onChange={(e) => setAssignmentNotes(e.target.value)}
										placeholder="Ghi chú đặc biệt cho kỹ thuật viên..."
										rows={3}
									/>
								</div>

								{problemClassification && (
									<Alert>
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											<strong>Khuyến nghị từ phân tích:</strong>{" "}
											{problemClassification.estimatedTime} -
											{problemClassification.requiresSpecialist
												? " Cần chuyên gia xử lý"
												: " Có thể xử lý thường"}
										</AlertDescription>
									</Alert>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="cost" className="space-y-6">
					{/* Labor Cost */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Chi phí nhân công
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="laborCost">Tiền công (VNĐ)</Label>
									<Input
										id="laborCost"
										type="number"
										value={costAssessment.laborCost}
										onChange={(e) =>
											setCostAssessment((prev) => ({
												...prev,
												laborCost: Number(e.target.value),
											}))
										}
									/>
								</div>
								<div className="flex items-end">
									<div className="text-sm text-gray-600">
										{selectedTechnician && (
											<p>
												Kỹ thuật viên:{" "}
												{
													availableTechnicians.find(
														(t) => t.id === selectedTechnician,
													)?.name
												}
											</p>
										)}
										{problemClassification && (
											<p>
												Thời gian ước tính:{" "}
												{problemClassification.estimatedTime}
											</p>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Parts Cost */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Chi phí linh kiện
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-5 gap-2">
								<Input
									placeholder="Tên linh kiện"
									value={newPartName}
									onChange={(e) => setNewPartName(e.target.value)}
								/>
								<Input
									type="number"
									placeholder="Số lượng"
									value={newPartQuantity}
									onChange={(e) => setNewPartQuantity(Number(e.target.value))}
								/>
								<Input
									type="number"
									placeholder="Đơn giá (VNĐ)"
									value={newPartPrice}
									onChange={(e) => setNewPartPrice(Number(e.target.value))}
								/>
								<Input
									placeholder="Nhà cung cấp"
									value={newPartSupplier}
									onChange={(e) => setNewPartSupplier(e.target.value)}
								/>
								<Button onClick={addPart}>Thêm</Button>
							</div>

							{costAssessment.partsCosts.length > 0 && (
								<div className="space-y-2">
									{costAssessment.partsCosts.map((part, index) => (
										<div
											key={`part-${part.partName}-${index}`}
											className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
										>
											<div className="flex-1 grid grid-cols-4 gap-4 text-sm">
												<span className="font-medium">{part.partName}</span>
												<span>
													{part.quantity} x{" "}
													{part.unitPrice.toLocaleString("vi-VN")} VNĐ
												</span>
												<span className="text-gray-600">{part.supplier}</span>
												<span className="font-medium text-blue-600">
													{(part.quantity * part.unitPrice).toLocaleString(
														"vi-VN",
													)}{" "}
													VNĐ
												</span>
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => removePart(index)}
												className="ml-2"
											>
												Xóa
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Additional Costs */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="h-5 w-5" />
								Chi phí khác
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
								<Input
									placeholder="Mô tả chi phí"
									value={newAdditionalDesc}
									onChange={(e) => setNewAdditionalDesc(e.target.value)}
								/>
								<Input
									type="number"
									placeholder="Số tiền (VNĐ)"
									value={newAdditionalAmount}
									onChange={(e) =>
										setNewAdditionalAmount(Number(e.target.value))
									}
								/>
								<Button onClick={addAdditionalCost}>Thêm</Button>
							</div>

							{costAssessment.additionalCosts.length > 0 && (
								<div className="space-y-2">
									{costAssessment.additionalCosts.map((cost, index) => (
										<div
											key={`cost-${cost.description}-${index}`}
											className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
										>
											<div className="flex-1 grid grid-cols-2 gap-4 text-sm">
												<span className="font-medium">{cost.description}</span>
												<span className="font-medium text-blue-600">
													{cost.amount.toLocaleString("vi-VN")} VNĐ
												</span>
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => removeAdditionalCost(index)}
												className="ml-2"
											>
												Xóa
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Cost Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Tổng kết chi phí
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="profitMargin">Lợi nhuận (%)</Label>
									<Input
										id="profitMargin"
										type="number"
										value={costAssessment.profitMargin}
										onChange={(e) =>
											setCostAssessment((prev) => ({
												...prev,
												profitMargin: Number(e.target.value),
											}))
										}
									/>
								</div>
							</div>

							<Separator />

							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Tiền công:</span>
									<span>
										{costAssessment.laborCost.toLocaleString("vi-VN")} VNĐ
									</span>
								</div>
								<div className="flex justify-between">
									<span>Linh kiện:</span>
									<span>
										{costAssessment.partsCosts
											.reduce(
												(sum, part) => sum + part.quantity * part.unitPrice,
												0,
											)
											.toLocaleString("vi-VN")}{" "}
										VNĐ
									</span>
								</div>
								<div className="flex justify-between">
									<span>Chi phí khác:</span>
									<span>
										{costAssessment.additionalCosts
											.reduce((sum, cost) => sum + cost.amount, 0)
											.toLocaleString("vi-VN")}{" "}
										VNĐ
									</span>
								</div>
								<Separator />
								<div className="flex justify-between text-lg font-medium">
									<span>Tổng báo giá:</span>
									<span className="text-blue-600">
										{costAssessment.finalQuote.toLocaleString("vi-VN")} VNĐ
									</span>
								</div>
							</div>

							<div className="mt-4 p-4 bg-blue-50 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
									<div>
										<Label className="font-medium">Bảo hành công:</Label>
										<p>{costAssessment.warranty.laborWarranty} tháng</p>
									</div>
									<div>
										<Label className="font-medium">Bảo hành linh kiện:</Label>
										<p>{costAssessment.warranty.partsWarranty} tháng</p>
									</div>
									<div className="md:col-span-2">
										<Label className="font-medium">Điều khoản bảo hành:</Label>
										<Textarea
											value={costAssessment.warranty.warrantyTerms}
											onChange={(e) =>
												setCostAssessment((prev) => ({
													...prev,
													warranty: {
														...prev.warranty,
														warrantyTerms: e.target.value,
													},
												}))
											}
											rows={2}
											className="mt-1"
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};
