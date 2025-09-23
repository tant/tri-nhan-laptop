import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	FileText,
	Save,
	Search,
	Trash2,
	User,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useRepairTickets } from "../../hooks/use-repair-tickets";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface TicketDraft {
	id: string;
	title: string;
	customer_name: string;
	customer_phone: string;
	customer_email?: string;
	device_brand: string;
	device_model: string;
	problem_description: string;
	problem_category: string;
	urgency_level: string;
	estimated_cost?: number;
	draft_data: any; // Complete form data
	created_at: string;
	updated_at: string;
	created_by: string;
	completion_percentage: number;
}

interface DraftManagerProps {
	onDraftSelect?: (draft: TicketDraft) => void;
	onDraftLoad?: (draftData: any) => void;
	currentDraft?: any; // Current form data to save as draft
	showLoadButton?: boolean;
}

export const DraftManager: React.FC<DraftManagerProps> = ({
	onDraftSelect,
	onDraftLoad,
	currentDraft,
	showLoadButton = false,
}) => {
	const { saveDraft, getDrafts, deleteDraft } = useRepairTickets();

	const [drafts, setDrafts] = useState<TicketDraft[]>([]);
	const [filteredDrafts, setFilteredDrafts] = useState<TicketDraft[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [draftTitle, setDraftTitle] = useState("");

	// Mock drafts data
	const mockDrafts: TicketDraft[] = [
		{
			id: "draft1",
			title: "Laptop ASUS - Màn hình vỡ",
			customer_name: "Nguyễn Văn A",
			customer_phone: "0901234567",
			customer_email: "vana@email.com",
			device_brand: "ASUS",
			device_model: "VivoBook 15",
			problem_description: "Màn hình bị vỡ góc phải, cần thay màn hình mới",
			problem_category: "screen",
			urgency_level: "medium",
			estimated_cost: 1500000,
			draft_data: {
				customer_name: "Nguyễn Văn A",
				customer_phone: "0901234567",
				customer_email: "vana@email.com",
				device_brand: "ASUS",
				device_model: "VivoBook 15",
				problem_description: "Màn hình bị vỡ góc phải, cần thay màn hình mới",
				problem_category: "screen",
				urgency_level: "medium",
				estimated_cost: "1500000",
				technician_notes: "Kiểm tra cáp màn hình trước khi thay",
			},
			created_at: "2024-01-20T10:30:00Z",
			updated_at: "2024-01-20T14:15:00Z",
			created_by: "current_user",
			completion_percentage: 75,
		},
		{
			id: "draft2",
			title: "HP Pavilion - Chậm, cần cài lại Windows",
			customer_name: "Trần Thị B",
			customer_phone: "0907654321",
			device_brand: "HP",
			device_model: "Pavilion 14",
			problem_description: "Máy chạy chậm, thường xuyên bị đơ",
			problem_category: "performance",
			urgency_level: "low",
			draft_data: {
				customer_name: "Trần Thị B",
				customer_phone: "0907654321",
				device_brand: "HP",
				device_model: "Pavilion 14",
				problem_description: "Máy chạy chậm, thường xuyên bị đơ",
				problem_category: "performance",
				urgency_level: "low",
			},
			created_at: "2024-01-19T15:45:00Z",
			updated_at: "2024-01-19T16:20:00Z",
			created_by: "current_user",
			completion_percentage: 45,
		},
		{
			id: "draft3",
			title: "MacBook Pro - Pin phồng",
			customer_name: "Lê Minh C",
			customer_phone: "0912345678",
			device_brand: "Apple",
			device_model: 'MacBook Pro 13" 2020',
			problem_description: "Pin bị phồng, cần thay ngay",
			problem_category: "battery",
			urgency_level: "urgent",
			estimated_cost: 2500000,
			draft_data: {
				customer_name: "Lê Minh C",
				customer_phone: "0912345678",
				device_brand: "Apple",
				device_model: 'MacBook Pro 13" 2020',
				problem_description: "Pin bị phồng, cần thay ngay",
				problem_category: "battery",
				urgency_level: "urgent",
				estimated_cost: "2500000",
				warranty_status: false,
				accessories_included: ["Sạc laptop", "Túi đựng laptop"],
			},
			created_at: "2024-01-18T09:15:00Z",
			updated_at: "2024-01-18T11:30:00Z",
			created_by: "current_user",
			completion_percentage: 85,
		},
	];

	useEffect(() => {
		loadDrafts();
	}, []);

	useEffect(() => {
		filterDrafts();
	}, [drafts, searchQuery]);

	const loadDrafts = async () => {
		setIsLoading(true);
		try {
			// In real implementation, this would call the API
			// const draftsData = await getDrafts();
			setDrafts(mockDrafts);
		} catch (error) {
			console.error("Error loading drafts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filterDrafts = () => {
		let filtered = drafts;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(draft) =>
					draft.title.toLowerCase().includes(query) ||
					draft.customer_name.toLowerCase().includes(query) ||
					draft.customer_phone.includes(query) ||
					draft.device_brand.toLowerCase().includes(query) ||
					draft.device_model.toLowerCase().includes(query) ||
					draft.problem_description.toLowerCase().includes(query),
			);
		}

		// Sort by updated_at desc
		filtered.sort(
			(a, b) =>
				new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
		);

		setFilteredDrafts(filtered);
	};

	const handleSaveDraft = async () => {
		if (!currentDraft || !draftTitle.trim()) return;

		const completionPercentage = calculateCompletionPercentage(currentDraft);

		try {
			const draftData = {
				...currentDraft,
				title: draftTitle.trim(),
				completion_percentage: completionPercentage,
			};

			const result = await saveDraft(draftData);

			if (result.success) {
				// Add to local state
				const newDraft: TicketDraft = {
					id: result.draft_id!,
					title: draftTitle.trim(),
					customer_name: currentDraft.customer_name || "",
					customer_phone: currentDraft.customer_phone || "",
					customer_email: currentDraft.customer_email,
					device_brand: currentDraft.device_brand || "",
					device_model: currentDraft.device_model || "",
					problem_description: currentDraft.problem_description || "",
					problem_category: currentDraft.problem_category || "other",
					urgency_level: currentDraft.urgency_level || "medium",
					estimated_cost: currentDraft.estimated_cost
						? Number(currentDraft.estimated_cost)
						: undefined,
					draft_data: currentDraft,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					created_by: "current_user",
					completion_percentage: completionPercentage,
				};

				setDrafts((prev) => [newDraft, ...prev]);
				setSaveDialogOpen(false);
				setDraftTitle("");
			}
		} catch (error) {
			console.error("Error saving draft:", error);
		}
	};

	const handleDeleteDraft = async (draftId: string) => {
		try {
			await deleteDraft(draftId);
			setDrafts((prev) => prev.filter((d) => d.id !== draftId));
		} catch (error) {
			console.error("Error deleting draft:", error);
		}
	};

	const handleLoadDraft = (draft: TicketDraft) => {
		if (onDraftLoad) {
			onDraftLoad(draft.draft_data);
		}
		if (onDraftSelect) {
			onDraftSelect(draft);
		}
	};

	const calculateCompletionPercentage = (formData: any): number => {
		const requiredFields = [
			"customer_name",
			"customer_phone",
			"device_brand",
			"device_model",
			"problem_description",
		];

		const optionalFields = [
			"customer_email",
			"device_serial",
			"device_year",
			"estimated_cost",
			"technician_notes",
			"customer_notes",
		];

		let completed = 0;
		let total = requiredFields.length + optionalFields.length;

		// Check required fields (weight: 2)
		requiredFields.forEach((field) => {
			if (formData[field]?.toString().trim()) {
				completed += 2;
			}
			total += 1; // Additional weight for required fields
		});

		// Check optional fields (weight: 1)
		optionalFields.forEach((field) => {
			if (formData[field]?.toString().trim()) {
				completed += 1;
			}
		});

		return Math.round((completed / total) * 100);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case "urgent":
				return "bg-red-100 text-red-800";
			case "high":
				return "bg-orange-100 text-orange-800";
			case "medium":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-green-100 text-green-800";
		}
	};

	const getCompletionColor = (percentage: number) => {
		if (percentage >= 80) return "bg-green-100 text-green-800";
		if (percentage >= 50) return "bg-yellow-100 text-yellow-800";
		return "bg-red-100 text-red-800";
	};

	const generateDraftTitle = () => {
		if (currentDraft) {
			const brand = currentDraft.device_brand || "Laptop";
			const model = currentDraft.device_model || "";
			const problem = currentDraft.problem_description || "Cần sửa chữa";

			let title = `${brand} ${model}`.trim();
			if (problem.length > 0) {
				const shortProblem =
					problem.length > 30 ? `${problem.substring(0, 30)}...` : problem;
				title += ` - ${shortProblem}`;
			}

			setDraftTitle(title);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header and Actions */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div className="flex gap-4 flex-1">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Tìm kiếm nháp..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				{currentDraft && (
					<Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
						<DialogTrigger asChild>
							<Button
								className="flex items-center gap-2"
								onClick={generateDraftTitle}
							>
								<Save className="h-4 w-4" />
								Lưu nháp
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Lưu phiếu nháp</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label htmlFor="draftTitle">Tiêu đề nháp *</Label>
									<Input
										id="draftTitle"
										value={draftTitle}
										onChange={(e) => setDraftTitle(e.target.value)}
										placeholder="Nhập tiêu đề mô tả cho nháp..."
									/>
								</div>

								{currentDraft && (
									<div className="text-sm text-gray-600">
										<p>
											<strong>Khách hàng:</strong>{" "}
											{currentDraft.customer_name || "Chưa nhập"}
										</p>
										<p>
											<strong>Thiết bị:</strong>{" "}
											{currentDraft.device_brand || "Chưa chọn"}{" "}
											{currentDraft.device_model || ""}
										</p>
										<p>
											<strong>Độ hoàn thành:</strong>{" "}
											{calculateCompletionPercentage(currentDraft)}%
										</p>
									</div>
								)}
							</div>
							<div className="flex gap-2 pt-4">
								<Button onClick={handleSaveDraft} disabled={!draftTitle.trim()}>
									Lưu nháp
								</Button>
								<Button
									variant="outline"
									onClick={() => setSaveDialogOpen(false)}
								>
									Hủy
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>

			{/* Drafts List */}
			<div className="grid gap-4">
				{filteredDrafts.map((draft) => (
					<Card key={draft.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-4 mb-3">
										<h3 className="text-lg font-semibold">{draft.title}</h3>
										<Badge className={getUrgencyColor(draft.urgency_level)}>
											{draft.urgency_level === "urgent"
												? "Khẩn cấp"
												: draft.urgency_level === "high"
													? "Cao"
													: draft.urgency_level === "medium"
														? "Trung bình"
														: "Thấp"}
										</Badge>
										<Badge
											className={getCompletionColor(
												draft.completion_percentage,
											)}
										>
											{draft.completion_percentage}% hoàn thành
										</Badge>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
										<div>
											<Label className="font-medium text-sm text-gray-500">
												KHÁCH HÀNG
											</Label>
											<p className="font-medium">{draft.customer_name}</p>
											<p className="text-sm text-gray-600">
												{draft.customer_phone}
											</p>
											{draft.customer_email && (
												<p className="text-sm text-gray-600">
													{draft.customer_email}
												</p>
											)}
										</div>

										<div>
											<Label className="font-medium text-sm text-gray-500">
												THIẾT BỊ
											</Label>
											<p className="font-medium">
												{draft.device_brand} {draft.device_model}
											</p>
											<p className="text-sm text-gray-600">
												{draft.problem_category === "hardware"
													? "Phần cứng"
													: draft.problem_category === "software"
														? "Phần mềm"
														: draft.problem_category === "screen"
															? "Màn hình"
															: draft.problem_category === "keyboard"
																? "Bàn phím"
																: draft.problem_category === "battery"
																	? "Pin"
																	: draft.problem_category === "charging"
																		? "Sạc"
																		: draft.problem_category === "performance"
																			? "Hiệu suất"
																			: draft.problem_category === "virus"
																				? "Virus/Malware"
																				: draft.problem_category ===
																						"data_recovery"
																					? "Khôi phục dữ liệu"
																					: "Khác"}
											</p>
										</div>

										<div>
											<Label className="font-medium text-sm text-gray-500">
												THỜI GIAN
											</Label>
											<div className="flex items-center gap-1 text-sm">
												<Calendar className="h-3 w-3" />
												Tạo: {formatDate(draft.created_at)}
											</div>
											<div className="flex items-center gap-1 text-sm text-gray-600">
												<Clock className="h-3 w-3" />
												Cập nhật: {formatDate(draft.updated_at)}
											</div>
										</div>
									</div>

									<div className="mb-4">
										<Label className="font-medium text-sm text-gray-500">
											VẤN ĐỀ
										</Label>
										<p className="text-sm text-gray-700 line-clamp-2">
											{draft.problem_description}
										</p>
									</div>

									{draft.estimated_cost && (
										<div className="text-sm">
											<span className="text-gray-600">Ước tính: </span>
											<span className="font-medium text-blue-600">
												{draft.estimated_cost.toLocaleString("vi-VN")} VNĐ
											</span>
										</div>
									)}
								</div>

								<div className="flex flex-col gap-2 ml-4">
									{showLoadButton && (
										<Button
											size="sm"
											onClick={() => handleLoadDraft(draft)}
											className="flex items-center gap-1"
										>
											<Edit className="h-3 w-3" />
											Tải nháp
										</Button>
									)}

									<Button
										size="sm"
										onClick={() => handleLoadDraft(draft)}
										className="flex items-center gap-1"
									>
										<CheckCircle className="h-3 w-3" />
										Tiếp tục
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteDraft(draft.id)}
										className="flex items-center gap-1 text-red-600 hover:text-red-700"
									>
										<Trash2 className="h-3 w-3" />
										Xóa
									</Button>
								</div>
							</div>

							{/* Progress Bar */}
							<div className="mt-4">
								<div className="flex items-center justify-between text-sm mb-1">
									<span className="text-gray-500">Tiến độ hoàn thành</span>
									<span className="font-medium">
										{draft.completion_percentage}%
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-500 h-2 rounded-full transition-all duration-300"
										style={{ width: `${draft.completion_percentage}%` }}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredDrafts.length === 0 && !isLoading && (
				<Card>
					<CardContent className="text-center py-8">
						<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchQuery ? "Không tìm thấy nháp" : "Chưa có nháp nào"}
						</h3>
						<p className="text-gray-500 mb-4">
							{searchQuery
								? "Thử thay đổi từ khóa tìm kiếm"
								: "Các phiếu chưa hoàn thành sẽ được lưu tại đây"}
						</p>
						{currentDraft && (
							<Button onClick={() => setSaveDialogOpen(true)}>
								Lưu nháp hiện tại
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{isLoading && (
				<div className="text-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
					<p className="text-gray-500 mt-2">Đang tải nháp...</p>
				</div>
			)}
		</div>
	);
};
