import {
	CheckCircle,
	Copy,
	Edit,
	Plus,
	Search,
	Template,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useRepairTickets } from "../../hooks/use-repair-tickets";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface RepairTemplate {
	id: string;
	name: string;
	category: string;
	problem_category: string;
	problem_description: string;
	estimated_cost?: number;
	estimated_time: string;
	technician_notes: string;
	customer_notes: string;
	urgency_level: string;
	parts_needed: string[];
	diagnostic_steps: string[];
	solution_steps: string[];
	is_default: boolean;
	created_by: string;
	created_at: string;
	usage_count: number;
	tags: string[];
}

interface TemplateManagerProps {
	onTemplateSelect?: (template: RepairTemplate) => void;
	selectedCategory?: string;
	showSelectButton?: boolean;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
	onTemplateSelect,
	selectedCategory,
	showSelectButton = false,
}) => {
	const { _getRepairTemplates } = useRepairTickets();

	const [templates, setTemplates] = useState<RepairTemplate[]>([]);
	const [filteredTemplates, setFilteredTemplates] = useState<RepairTemplate[]>(
		[],
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState(
		selectedCategory || "all",
	);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<RepairTemplate | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	const [templateForm, setTemplateForm] = useState({
		name: "",
		category: "repair",
		problem_category: "hardware",
		problem_description: "",
		estimated_cost: "",
		estimated_time: "2-4 giờ",
		technician_notes: "",
		customer_notes: "",
		urgency_level: "medium",
		parts_needed: [] as string[],
		diagnostic_steps: [] as string[],
		solution_steps: [] as string[],
		tags: [] as string[],
	});

	const [newPart, setNewPart] = useState("");
	const [newDiagnosticStep, setNewDiagnosticStep] = useState("");
	const [newSolutionStep, setNewSolutionStep] = useState("");
	const [newTag, setNewTag] = useState("");

	const templateCategories = [
		{ value: "repair", label: "Sửa chữa thường" },
		{ value: "urgent", label: "Khẩn cấp" },
		{ value: "complex", label: "Phức tạp" },
		{ value: "warranty", label: "Bảo hành" },
		{ value: "maintenance", label: "Bảo trì" },
	];

	const problemCategories = [
		{ value: "hardware", label: "Phần cứng" },
		{ value: "software", label: "Phần mềm" },
		{ value: "screen", label: "Màn hình" },
		{ value: "keyboard", label: "Bàn phím" },
		{ value: "battery", label: "Pin" },
		{ value: "charging", label: "Sạc" },
		{ value: "performance", label: "Hiệu suất" },
		{ value: "virus", label: "Virus/Malware" },
		{ value: "data_recovery", label: "Khôi phục dữ liệu" },
		{ value: "other", label: "Khác" },
	];

	// Mock templates data
	const mockTemplates: RepairTemplate[] = [
		{
			id: "template1",
			name: "Thay màn hình laptop cơ bản",
			category: "repair",
			problem_category: "screen",
			problem_description: "Màn hình bị vỡ, cần thay thế màn hình mới",
			estimated_cost: 1500000,
			estimated_time: "2-3 giờ",
			technician_notes:
				"Kiểm tra cáp màn hình trước khi thay. Đảm bảo tương thích model.",
			customer_notes: "Màn hình mới sẽ được bảo hành 6 tháng.",
			urgency_level: "medium",
			parts_needed: ["Màn hình LCD", "Cáp màn hình"],
			diagnostic_steps: [
				"Kiểm tra tình trạng màn hình hiện tại",
				"Test với màn hình ngoài",
				"Kiểm tra cáp kết nối",
				"Xác định model màn hình cần thay",
			],
			solution_steps: [
				"Tháo màn hình cũ",
				"Kiểm tra cáp kết nối",
				"Lắp màn hình mới",
				"Test hoạt động",
				"Điều chỉnh độ sáng và màu sắc",
			],
			is_default: true,
			created_by: "admin",
			created_at: "2024-01-01T00:00:00Z",
			usage_count: 25,
			tags: ["screen", "hardware", "common"],
		},
		{
			id: "template2",
			name: "Cài đặt lại Windows và phần mềm",
			category: "repair",
			problem_category: "software",
			problem_description: "Hệ thống Windows bị lỗi, cần cài đặt lại",
			estimated_cost: 300000,
			estimated_time: "3-4 giờ",
			technician_notes: "Backup dữ liệu trước khi format. Cài driver đầy đủ.",
			customer_notes: "Dữ liệu sẽ được backup và khôi phục sau khi cài đặt.",
			urgency_level: "medium",
			parts_needed: [],
			diagnostic_steps: [
				"Backup dữ liệu quan trọng",
				"Kiểm tra tình trạng ổ cứng",
				"Chuẩn bị USB Windows",
				"Tải driver từ website chính thức",
			],
			solution_steps: [
				"Format ổ cứng",
				"Cài đặt Windows mới",
				"Cài đặt driver",
				"Khôi phục dữ liệu",
				"Cài đặt phần mềm cơ bản",
				"Kiểm tra hoạt động",
			],
			is_default: true,
			created_by: "admin",
			created_at: "2024-01-01T00:00:00Z",
			usage_count: 45,
			tags: ["software", "windows", "common"],
		},
		{
			id: "template3",
			name: "Thay pin laptop khẩn cấp",
			category: "urgent",
			problem_category: "battery",
			problem_description: "Pin laptop phồng/hỏng, cần thay ngay",
			estimated_cost: 800000,
			estimated_time: "1-2 giờ",
			technician_notes: "An toàn khi tháo pin phồng. Kiểm tra IC sạc.",
			customer_notes: "Pin mới bảo hành 12 tháng. Tránh để máy quá nóng.",
			urgency_level: "high",
			parts_needed: ["Pin laptop", "Keo cách điện"],
			diagnostic_steps: [
				"Kiểm tra tình trạng pin hiện tại",
				"Đo điện áp pin",
				"Kiểm tra IC sạc trên mainboard",
				"Xác định model pin phù hợp",
			],
			solution_steps: [
				"Tắt máy và rút adapter",
				"Tháo pin cũ cẩn thận",
				"Vệ sinh khu vực lắp pin",
				"Lắp pin mới",
				"Test sạc và hoạt động",
				"Calibrate pin",
			],
			is_default: true,
			created_by: "admin",
			created_at: "2024-01-01T00:00:00Z",
			usage_count: 18,
			tags: ["battery", "urgent", "hardware"],
		},
	];

	useEffect(() => {
		loadTemplates();
	}, []);

	useEffect(() => {
		filterTemplates();
	}, [templates, searchQuery, categoryFilter]);

	const loadTemplates = async () => {
		setIsLoading(true);
		try {
			// In real implementation, this would call the API
			// const templatesData = await getRepairTemplates();
			setTemplates(mockTemplates);
		} catch (error) {
			console.error("Error loading templates:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filterTemplates = useCallback(() => {
		let filtered = templates;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(template) =>
					template.name.toLowerCase().includes(query) ||
					template.problem_description.toLowerCase().includes(query) ||
					template.tags.some((tag) => tag.toLowerCase().includes(query)),
			);
		}

		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(template) => template.category === categoryFilter,
			);
		}

		setFilteredTemplates(filtered);
	}, [templates, searchQuery, categoryFilter]);

	const resetTemplateForm = () => {
		setTemplateForm({
			name: "",
			category: "repair",
			problem_category: "hardware",
			problem_description: "",
			estimated_cost: "",
			estimated_time: "2-4 giờ",
			technician_notes: "",
			customer_notes: "",
			urgency_level: "medium",
			parts_needed: [],
			diagnostic_steps: [],
			solution_steps: [],
			tags: [],
		});
	};

	const handleCreateTemplate = () => {
		// In real implementation, this would call the API to create the template
		const newTemplate: RepairTemplate = {
			id: `template_${Date.now()}`,
			...templateForm,
			estimated_cost: templateForm.estimated_cost
				? Number(templateForm.estimated_cost)
				: undefined,
			is_default: false,
			created_by: "current_user",
			created_at: new Date().toISOString(),
			usage_count: 0,
		};

		setTemplates((prev) => [...prev, newTemplate]);
		setIsCreateDialogOpen(false);
		resetTemplateForm();
	};

	const handleEditTemplate = (template: RepairTemplate) => {
		setEditingTemplate(template);
		setTemplateForm({
			name: template.name,
			category: template.category,
			problem_category: template.problem_category,
			problem_description: template.problem_description,
			estimated_cost: template.estimated_cost?.toString() || "",
			estimated_time: template.estimated_time,
			technician_notes: template.technician_notes,
			customer_notes: template.customer_notes,
			urgency_level: template.urgency_level,
			parts_needed: [...template.parts_needed],
			diagnostic_steps: [...template.diagnostic_steps],
			solution_steps: [...template.solution_steps],
			tags: [...template.tags],
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdateTemplate = () => {
		if (editingTemplate) {
			const updatedTemplate: RepairTemplate = {
				...editingTemplate,
				...templateForm,
				estimated_cost: templateForm.estimated_cost
					? Number(templateForm.estimated_cost)
					: undefined,
			};

			setTemplates((prev) =>
				prev.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t)),
			);
			setIsEditDialogOpen(false);
			setEditingTemplate(null);
			resetTemplateForm();
		}
	};

	const handleDeleteTemplate = (templateId: string) => {
		setTemplates((prev) => prev.filter((t) => t.id !== templateId));
	};

	const handleDuplicateTemplate = (template: RepairTemplate) => {
		const duplicatedTemplate: RepairTemplate = {
			...template,
			id: `template_${Date.now()}`,
			name: `${template.name} (Sao chép)`,
			is_default: false,
			created_by: "current_user",
			created_at: new Date().toISOString(),
			usage_count: 0,
		};

		setTemplates((prev) => [...prev, duplicatedTemplate]);
	};

	const addToList = (
		listName: "parts_needed" | "diagnostic_steps" | "solution_steps" | "tags",
		value: string,
	) => {
		if (value.trim()) {
			setTemplateForm((prev) => ({
				...prev,
				[listName]: [...prev[listName], value.trim()],
			}));

			// Reset the input
			if (listName === "parts_needed") setNewPart("");
			if (listName === "diagnostic_steps") setNewDiagnosticStep("");
			if (listName === "solution_steps") setNewSolutionStep("");
			if (listName === "tags") setNewTag("");
		}
	};

	const removeFromList = (
		listName: "parts_needed" | "diagnostic_steps" | "solution_steps" | "tags",
		index: number,
	) => {
		setTemplateForm((prev) => ({
			...prev,
			[listName]: prev[listName].filter((_, i) => i !== index),
		}));
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "urgent":
				return "bg-red-100 text-red-800";
			case "complex":
				return "bg-purple-100 text-purple-800";
			case "warranty":
				return "bg-blue-100 text-blue-800";
			case "maintenance":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const TemplateForm = () => (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label htmlFor="templateName">Tên mẫu *</Label>
					<Input
						id="templateName"
						value={templateForm.name}
						onChange={(e) =>
							setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
						}
						placeholder="VD: Thay màn hình laptop"
					/>
				</div>

				<div>
					<Label htmlFor="templateCategory">Loại mẫu</Label>
					<Select
						value={templateForm.category}
						onValueChange={(value) =>
							setTemplateForm((prev) => ({ ...prev, category: value }))
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{templateCategories.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="problemCategory">Loại vấn đề</Label>
					<Select
						value={templateForm.problem_category}
						onValueChange={(value) =>
							setTemplateForm((prev) => ({ ...prev, problem_category: value }))
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{problemCategories.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="urgencyLevel">Mức độ ưu tiên</Label>
					<Select
						value={templateForm.urgency_level}
						onValueChange={(value) =>
							setTemplateForm((prev) => ({ ...prev, urgency_level: value }))
						}
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
					<Label htmlFor="estimatedTime">Thời gian ước tính</Label>
					<Input
						id="estimatedTime"
						value={templateForm.estimated_time}
						onChange={(e) =>
							setTemplateForm((prev) => ({
								...prev,
								estimated_time: e.target.value,
							}))
						}
						placeholder="VD: 2-4 giờ"
					/>
				</div>

				<div>
					<Label htmlFor="estimatedCost">Chi phí ước tính (VNĐ)</Label>
					<Input
						id="estimatedCost"
						type="number"
						value={templateForm.estimated_cost}
						onChange={(e) =>
							setTemplateForm((prev) => ({
								...prev,
								estimated_cost: e.target.value,
							}))
						}
						placeholder="VD: 500000"
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="problemDescription">Mô tả vấn đề *</Label>
				<Textarea
					id="problemDescription"
					value={templateForm.problem_description}
					onChange={(e) =>
						setTemplateForm((prev) => ({
							...prev,
							problem_description: e.target.value,
						}))
					}
					placeholder="Mô tả chi tiết vấn đề..."
					rows={3}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label htmlFor="technicianNotes">Ghi chú kỹ thuật viên</Label>
					<Textarea
						id="technicianNotes"
						value={templateForm.technician_notes}
						onChange={(e) =>
							setTemplateForm((prev) => ({
								...prev,
								technician_notes: e.target.value,
							}))
						}
						placeholder="Lưu ý cho kỹ thuật viên..."
						rows={3}
					/>
				</div>

				<div>
					<Label htmlFor="customerNotes">Ghi chú khách hàng</Label>
					<Textarea
						id="customerNotes"
						value={templateForm.customer_notes}
						onChange={(e) =>
							setTemplateForm((prev) => ({
								...prev,
								customer_notes: e.target.value,
							}))
						}
						placeholder="Thông tin cho khách hàng..."
						rows={3}
					/>
				</div>
			</div>

			<Tabs defaultValue="parts" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="parts">Linh kiện</TabsTrigger>
					<TabsTrigger value="diagnostic">Chẩn đoán</TabsTrigger>
					<TabsTrigger value="solution">Giải pháp</TabsTrigger>
					<TabsTrigger value="tags">Thẻ</TabsTrigger>
				</TabsList>

				<TabsContent value="parts" className="space-y-2">
					<div className="flex gap-2">
						<Input
							placeholder="Thêm linh kiện cần thiết"
							value={newPart}
							onChange={(e) => setNewPart(e.target.value)}
							onKeyPress={(e) =>
								e.key === "Enter" && addToList("parts_needed", newPart)
							}
						/>
						<Button onClick={() => addToList("parts_needed", newPart)}>
							Thêm
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{templateForm.parts_needed.map((part, index) => (
							<Badge
								key={`template-part-${part}-${index}`}
								variant="outline"
								className="cursor-pointer"
							>
								{part}
								<button
									type="button"
									onClick={() => removeFromList("parts_needed", index)}
									className="ml-2 text-red-500"
								>
									×
								</button>
							</Badge>
						))}
					</div>
				</TabsContent>

				<TabsContent value="diagnostic" className="space-y-2">
					<div className="flex gap-2">
						<Input
							placeholder="Thêm bước chẩn đoán"
							value={newDiagnosticStep}
							onChange={(e) => setNewDiagnosticStep(e.target.value)}
							onKeyPress={(e) =>
								e.key === "Enter" &&
								addToList("diagnostic_steps", newDiagnosticStep)
							}
						/>
						<Button
							onClick={() => addToList("diagnostic_steps", newDiagnosticStep)}
						>
							Thêm
						</Button>
					</div>
					<div className="space-y-1">
						{templateForm.diagnostic_steps.map((step, index) => (
							<div
								key={index}
								className="flex items-center gap-2 bg-gray-50 p-2 rounded"
							>
								<span className="text-sm">
									{index + 1}. {step}
								</span>
								<button
									type="button"
									onClick={() => removeFromList("diagnostic_steps", index)}
									className="ml-auto text-red-500"
								>
									×
								</button>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="solution" className="space-y-2">
					<div className="flex gap-2">
						<Input
							placeholder="Thêm bước giải pháp"
							value={newSolutionStep}
							onChange={(e) => setNewSolutionStep(e.target.value)}
							onKeyPress={(e) =>
								e.key === "Enter" &&
								addToList("solution_steps", newSolutionStep)
							}
						/>
						<Button
							onClick={() => addToList("solution_steps", newSolutionStep)}
						>
							Thêm
						</Button>
					</div>
					<div className="space-y-1">
						{templateForm.solution_steps.map((step, index) => (
							<div
								key={index}
								className="flex items-center gap-2 bg-gray-50 p-2 rounded"
							>
								<span className="text-sm">
									{index + 1}. {step}
								</span>
								<button
									type="button"
									onClick={() => removeFromList("solution_steps", index)}
									className="ml-auto text-red-500"
								>
									×
								</button>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="tags" className="space-y-2">
					<div className="flex gap-2">
						<Input
							placeholder="Thêm thẻ"
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && addToList("tags", newTag)}
						/>
						<Button onClick={() => addToList("tags", newTag)}>Thêm</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{templateForm.tags.map((tag, index) => (
							<Badge key={index} variant="secondary" className="cursor-pointer">
								{tag}
								<button
									type="button"
									onClick={() => removeFromList("tags", index)}
									className="ml-2 text-red-500"
								>
									×
								</button>
							</Badge>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Filters and Actions */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div className="flex gap-4 flex-1">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Tìm kiếm mẫu..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Tất cả loại" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả loại</SelectItem>
							{templateCategories.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="flex items-center gap-2">
							<Plus className="h-4 w-4" />
							Tạo mẫu mới
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Tạo mẫu sửa chữa mới</DialogTitle>
						</DialogHeader>
						<TemplateForm />
						<div className="flex gap-2 pt-4">
							<Button onClick={handleCreateTemplate}>Tạo mẫu</Button>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Hủy
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Templates List */}
			<div className="grid gap-4">
				{filteredTemplates.map((template) => (
					<Card key={template.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-4 mb-3">
										<h3 className="text-lg font-semibold">{template.name}</h3>
										<Badge className={getCategoryColor(template.category)}>
											{
												templateCategories.find(
													(c) => c.value === template.category,
												)?.label
											}
										</Badge>
										{template.is_default && (
											<Badge variant="outline">Mặc định</Badge>
										)}
										<Badge variant="secondary">
											{template.usage_count} lần sử dụng
										</Badge>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
										<div>
											<Label className="font-medium text-sm text-gray-500">
												VẤNĐỀ
											</Label>
											<p className="font-medium">
												{
													problemCategories.find(
														(c) => c.value === template.problem_category,
													)?.label
												}
											</p>
											<p className="text-sm text-gray-600 line-clamp-2">
												{template.problem_description}
											</p>
										</div>

										<div>
											<Label className="font-medium text-sm text-gray-500">
												CHI PHÍ & THỜI GIAN
											</Label>
											<p className="font-medium">
												{template.estimated_cost
													? `${template.estimated_cost.toLocaleString("vi-VN")} VNĐ`
													: "Chưa xác định"}
											</p>
											<p className="text-sm text-gray-600">
												{template.estimated_time}
											</p>
										</div>

										<div>
											<Label className="font-medium text-sm text-gray-500">
												LINH KIỆN
											</Label>
											{template.parts_needed.length > 0 ? (
												<div className="flex flex-wrap gap-1">
													{template.parts_needed
														.slice(0, 3)
														.map((part, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs"
															>
																{part}
															</Badge>
														))}
													{template.parts_needed.length > 3 && (
														<Badge variant="outline" className="text-xs">
															+{template.parts_needed.length - 3}
														</Badge>
													)}
												</div>
											) : (
												<p className="text-sm text-gray-500">
													Không cần linh kiện
												</p>
											)}
										</div>
									</div>

									{template.tags.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{template.tags.map((tag, index) => (
												<Badge
													key={index}
													variant="secondary"
													className="text-xs"
												>
													{tag}
												</Badge>
											))}
										</div>
									)}
								</div>

								<div className="flex flex-col gap-2 ml-4">
									{showSelectButton && onTemplateSelect && (
										<Button
											size="sm"
											onClick={() => onTemplateSelect(template)}
											className="flex items-center gap-1"
										>
											<CheckCircle className="h-3 w-3" />
											Chọn
										</Button>
									)}

									<Button
										variant="outline"
										size="sm"
										onClick={() => handleEditTemplate(template)}
										className="flex items-center gap-1"
									>
										<Edit className="h-3 w-3" />
										Sửa
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDuplicateTemplate(template)}
										className="flex items-center gap-1"
									>
										<Copy className="h-3 w-3" />
										Sao chép
									</Button>

									{!template.is_default && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteTemplate(template.id)}
											className="flex items-center gap-1 text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-3 w-3" />
											Xóa
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredTemplates.length === 0 && !isLoading && (
				<Card>
					<CardContent className="text-center py-8">
						<Template className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchQuery || categoryFilter !== "all"
								? "Không tìm thấy mẫu"
								: "Chưa có mẫu nào"}
						</h3>
						<p className="text-gray-500 mb-4">
							{searchQuery || categoryFilter !== "all"
								? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
								: "Tạo mẫu đầu tiên để tiết kiệm thời gian tạo phiếu sửa chữa"}
						</p>
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							Tạo mẫu đầu tiên
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Chỉnh sửa mẫu: {editingTemplate?.name}</DialogTitle>
					</DialogHeader>
					<TemplateForm />
					<div className="flex gap-2 pt-4">
						<Button onClick={handleUpdateTemplate}>Cập nhật</Button>
						<Button
							variant="outline"
							onClick={() => {
								setIsEditDialogOpen(false);
								setEditingTemplate(null);
								resetTemplateForm();
							}}
						>
							Hủy
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
