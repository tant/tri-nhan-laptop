import {
	AlertCircle,
	Brain,
	Camera,
	CheckCircle,
	FileText,
	HelpCircle,
	Save,
	Search,
	Upload,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useRepairTickets } from "../../hooks/use-repair-tickets";
import {
	getDeviceBrand,
	getDeviceModel,
	getPopularBrands,
	searchDevices,
} from "../../lib/devices/vietnamese-brands";
import {
	classifyProblem,
	generateDiagnosticReport,
	suggestQuestions,
} from "../../lib/problem-analysis/problem-classifier";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
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
import { DeviceDocumentation } from "./DeviceDocumentation";
import { TicketAssignment } from "./TicketAssignment";

interface CreateTicketFormProps {
	customerId?: string;
	onTicketCreated?: (ticketId: string) => void;
	onSaveDraft?: (draftId: string) => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
	customerId,
	onTicketCreated,
	onSaveDraft,
}) => {
	const {
		createRepairTicket,
		saveDraft,
		getRepairTemplates,
		isLoading,
		error,
	} = useRepairTickets();

	const [currentTab, setCurrentTab] = useState("customer");
	const [formData, setFormData] = useState({
		customer_name: "",
		customer_phone: "",
		customer_email: "",
		device_brand: "",
		device_model: "",
		device_serial: "",
		device_year: "",
		problem_description: "",
		problem_category: "hardware",
		urgency_level: "medium",
		estimated_cost: "",
		warranty_status: false,
		accessories_included: [] as string[],
		customer_notes: "",
		technician_notes: "",
		photos: [] as File[],
		documents: [] as File[],
	});

	const [deviceSuggestions, setDeviceSuggestions] = useState<any[]>([]);
	const [modelSuggestions, setModelSuggestions] = useState<any[]>([]);
	const [templates, setTemplates] = useState<any[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deviceDocumentation, setDeviceDocumentation] = useState<any>(null);
	const [problemClassification, setProblemClassification] = useState<any>(null);
	const [diagnosticReport, setDiagnosticReport] = useState<string>("");
	const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
	const [assignmentData, setAssignmentData] = useState<any>(null);

	const popularBrands = getPopularBrands();
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

	const urgencyLevels = [
		{ value: "low", label: "Thấp", color: "bg-green-100 text-green-800" },
		{
			value: "medium",
			label: "Trung bình",
			color: "bg-yellow-100 text-yellow-800",
		},
		{ value: "high", label: "Cao", color: "bg-orange-100 text-orange-800" },
		{ value: "urgent", label: "Khẩn cấp", color: "bg-red-100 text-red-800" },
	];

	const commonAccessories = [
		"Sạc laptop",
		"Túi đựng laptop",
		"Chuột",
		"Đĩa cài đặt",
		"Tài liệu hướng dẫn",
		"Hộp nguyên bản",
		"Thẻ bảo hành",
	];

	useEffect(() => {
		loadTemplates();
	}, []);

	useEffect(() => {
		if (formData.device_brand) {
			const brandData = getDeviceBrand(formData.device_brand);
			if (brandData) {
				setModelSuggestions(brandData.models || []);
			}
		}
	}, [formData.device_brand]);

	useEffect(() => {
		if (
			formData.problem_description &&
			formData.device_brand &&
			formData.device_model
		) {
			const classification = classifyProblem(
				formData.problem_description,
				formData.device_brand,
				formData.device_model,
			);
			setProblemClassification(classification);

			const report = generateDiagnosticReport(classification, {
				brand: formData.device_brand,
				model: formData.device_model,
			});
			setDiagnosticReport(report);

			const questions = suggestQuestions(classification);
			setSuggestedQuestions(questions);

			// Auto-update urgency and category based on classification
			if (classification.urgencyLevel !== formData.urgency_level) {
				setFormData((prev) => ({
					...prev,
					urgency_level: classification.urgencyLevel,
				}));
			}
			if (classification.estimatedCost && !formData.estimated_cost) {
				setFormData((prev) => ({
					...prev,
					estimated_cost: classification.estimatedCost.toString(),
				}));
			}
		}
	}, [
		formData.problem_description,
		formData.device_brand,
		formData.device_model,
	]);

	const loadTemplates = async () => {
		try {
			const templatesData = await getRepairTemplates();
			setTemplates(templatesData);
		} catch (error) {
			console.error("Error loading templates:", error);
		}
	};

	const handleDeviceSearch = (query: string) => {
		if (query.length > 1) {
			const suggestions = searchDevices(query);
			setDeviceSuggestions(suggestions.slice(0, 10));
		} else {
			setDeviceSuggestions([]);
		}
	};

	const handleTemplateSelect = (templateId: string) => {
		const template = templates.find((t) => t.id === templateId);
		if (template) {
			setFormData((prev) => ({
				...prev,
				problem_category: template.problem_category || prev.problem_category,
				problem_description:
					template.problem_description || prev.problem_description,
				estimated_cost:
					template.estimated_cost?.toString() || prev.estimated_cost,
				technician_notes: template.technician_notes || prev.technician_notes,
			}));
			setSelectedTemplate(templateId);
		}
	};

	const handleFileUpload = (
		files: FileList | null,
		type: "photos" | "documents",
	) => {
		if (files) {
			const fileArray = Array.from(files);
			setFormData((prev) => ({
				...prev,
				[type]: [...prev[type], ...fileArray],
			}));
		}
	};

	const removeFile = (index: number, type: "photos" | "documents") => {
		setFormData((prev) => ({
			...prev,
			[type]: prev[type].filter((_, i) => i !== index),
		}));
	};

	const validateForm = () => {
		const errors: Record<string, string> = {};

		if (!formData.customer_name.trim()) {
			errors.customer_name = "Tên khách hàng là bắt buộc";
		}

		if (!formData.customer_phone.trim()) {
			errors.customer_phone = "Số điện thoại là bắt buộc";
		} else if (!/^[0-9+\-\s()]+$/.test(formData.customer_phone)) {
			errors.customer_phone = "Số điện thoại không hợp lệ";
		}

		if (
			formData.customer_email &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)
		) {
			errors.customer_email = "Email không hợp lệ";
		}

		if (!formData.device_brand.trim()) {
			errors.device_brand = "Thương hiệu thiết bị là bắt buộc";
		}

		if (!formData.device_model.trim()) {
			errors.device_model = "Model thiết bị là bắt buộc";
		}

		if (!formData.problem_description.trim()) {
			errors.problem_description = "Mô tả vấn đề là bắt buộc";
		}

		if (
			formData.estimated_cost &&
			Number.isNaN(Number(formData.estimated_cost))
		) {
			errors.estimated_cost = "Chi phí ước tính phải là số";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		try {
			const ticketData = {
				...formData,
				estimated_cost: formData.estimated_cost
					? Number(formData.estimated_cost)
					: null,
				customer_id: customerId || null,
			};

			const result = await createRepairTicket(ticketData);

			if (result.success) {
				onTicketCreated?.(result.ticket_id!);
				setFormData({
					customer_name: "",
					customer_phone: "",
					customer_email: "",
					device_brand: "",
					device_model: "",
					device_serial: "",
					device_year: "",
					problem_description: "",
					problem_category: "hardware",
					urgency_level: "medium",
					estimated_cost: "",
					warranty_status: false,
					accessories_included: [],
					customer_notes: "",
					technician_notes: "",
					photos: [],
					documents: [],
				});
				setCurrentTab("customer");
			}
		} catch (error) {
			console.error("Error creating ticket:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveDraft = async () => {
		setIsSubmitting(true);
		try {
			const draftData = {
				...formData,
				estimated_cost: formData.estimated_cost
					? Number(formData.estimated_cost)
					: null,
				customer_id: customerId || null,
			};

			const result = await saveDraft(draftData);

			if (result.success) {
				onSaveDraft?.(result.draft_id!);
			}
		} catch (error) {
			console.error("Error saving draft:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const canProceedToNext = (tab: string) => {
		switch (tab) {
			case "customer":
				return formData.customer_name && formData.customer_phone;
			case "device":
				return formData.device_brand && formData.device_model;
			case "problem":
				return formData.problem_description;
			default:
				return true;
		}
	};

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Tạo phiếu sửa chữa mới
				</CardTitle>
			</CardHeader>
			<CardContent>
				{error && (
					<Alert className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<Tabs value={currentTab} onValueChange={setCurrentTab}>
					<TabsList className="grid w-full grid-cols-7">
						<TabsTrigger value="customer" className="flex items-center gap-2">
							{canProceedToNext("customer") && (
								<CheckCircle className="h-4 w-4 text-green-500" />
							)}
							Khách hàng
						</TabsTrigger>
						<TabsTrigger value="device" className="flex items-center gap-2">
							{canProceedToNext("device") && (
								<CheckCircle className="h-4 w-4 text-green-500" />
							)}
							Thiết bị
						</TabsTrigger>
						<TabsTrigger value="problem" className="flex items-center gap-2">
							{canProceedToNext("problem") && (
								<CheckCircle className="h-4 w-4 text-green-500" />
							)}
							Vấn đề
						</TabsTrigger>
						<TabsTrigger
							value="documentation"
							className="flex items-center gap-2"
						>
							<FileText className="h-4 w-4" />
							Tài liệu
						</TabsTrigger>
						<TabsTrigger value="analysis" className="flex items-center gap-2">
							<Brain className="h-4 w-4" />
							Phân tích
						</TabsTrigger>
						<TabsTrigger value="assignment" className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							Phân công
						</TabsTrigger>
						<TabsTrigger value="review">Xem lại</TabsTrigger>
					</TabsList>

					<TabsContent value="customer" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="customer_name">Tên khách hàng *</Label>
								<Input
									id="customer_name"
									value={formData.customer_name}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											customer_name: e.target.value,
										}))
									}
									className={
										validationErrors.customer_name ? "border-red-500" : ""
									}
								/>
								{validationErrors.customer_name && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.customer_name}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="customer_phone">Số điện thoại *</Label>
								<Input
									id="customer_phone"
									value={formData.customer_phone}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											customer_phone: e.target.value,
										}))
									}
									className={
										validationErrors.customer_phone ? "border-red-500" : ""
									}
								/>
								{validationErrors.customer_phone && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.customer_phone}
									</p>
								)}
							</div>

							<div className="md:col-span-2">
								<Label htmlFor="customer_email">Email (tùy chọn)</Label>
								<Input
									id="customer_email"
									type="email"
									value={formData.customer_email}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											customer_email: e.target.value,
										}))
									}
									className={
										validationErrors.customer_email ? "border-red-500" : ""
									}
								/>
								{validationErrors.customer_email && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.customer_email}
									</p>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="device" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="device_brand">Thương hiệu *</Label>
								<Select
									value={formData.device_brand}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											device_brand: value,
											device_model: "",
										}))
									}
								>
									<SelectTrigger
										className={
											validationErrors.device_brand ? "border-red-500" : ""
										}
									>
										<SelectValue placeholder="Chọn thương hiệu" />
									</SelectTrigger>
									<SelectContent>
										{popularBrands.map((brand) => (
											<SelectItem key={brand.name} value={brand.name}>
												{brand.name} ({brand.popularity}% phổ biến)
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{validationErrors.device_brand && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.device_brand}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="device_model">Model *</Label>
								<Select
									value={formData.device_model}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, device_model: value }))
									}
									disabled={!formData.device_brand}
								>
									<SelectTrigger
										className={
											validationErrors.device_model ? "border-red-500" : ""
										}
									>
										<SelectValue placeholder="Chọn model" />
									</SelectTrigger>
									<SelectContent>
										{modelSuggestions.map((model) => (
											<SelectItem key={model.name} value={model.name}>
												{model.name}
												{model.year && ` (${model.year})`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{validationErrors.device_model && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.device_model}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="device_serial">Số serial</Label>
								<Input
									id="device_serial"
									value={formData.device_serial}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											device_serial: e.target.value,
										}))
									}
								/>
							</div>

							<div>
								<Label htmlFor="device_year">Năm sản xuất</Label>
								<Input
									id="device_year"
									value={formData.device_year}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											device_year: e.target.value,
										}))
									}
									placeholder="VD: 2023"
								/>
							</div>

							<div className="md:col-span-2">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="warranty_status"
										checked={formData.warranty_status}
										onCheckedChange={(checked) =>
											setFormData((prev) => ({
												...prev,
												warranty_status: Boolean(checked),
											}))
										}
									/>
									<Label htmlFor="warranty_status">Thiết bị còn bảo hành</Label>
								</div>
							</div>

							<div className="md:col-span-2">
								<Label>Phụ kiện đi kèm</Label>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
									{commonAccessories.map((accessory) => (
										<div
											key={accessory}
											className="flex items-center space-x-2"
										>
											<Checkbox
												id={accessory}
												checked={formData.accessories_included.includes(
													accessory,
												)}
												onCheckedChange={(checked) => {
													if (checked) {
														setFormData((prev) => ({
															...prev,
															accessories_included: [
																...prev.accessories_included,
																accessory,
															],
														}));
													} else {
														setFormData((prev) => ({
															...prev,
															accessories_included:
																prev.accessories_included.filter(
																	(a) => a !== accessory,
																),
														}));
													}
												}}
											/>
											<Label htmlFor={accessory} className="text-sm">
												{accessory}
											</Label>
										</div>
									))}
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="problem" className="mt-6">
						<div className="space-y-4">
							{templates.length > 0 && (
								<div>
									<Label>Sử dụng mẫu có sẵn (tùy chọn)</Label>
									<Select
										value={selectedTemplate}
										onValueChange={handleTemplateSelect}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn mẫu sửa chữa" />
										</SelectTrigger>
										<SelectContent>
											{templates.map((template) => (
												<SelectItem key={template.id} value={template.id}>
													{template.name} - {template.problem_category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="problem_category">Loại vấn đề</Label>
									<Select
										value={formData.problem_category}
										onValueChange={(value) =>
											setFormData((prev) => ({
												...prev,
												problem_category: value,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{problemCategories.map((category) => (
												<SelectItem key={category.value} value={category.value}>
													{category.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="urgency_level">Mức độ ưu tiên</Label>
									<Select
										value={formData.urgency_level}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, urgency_level: value }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{urgencyLevels.map((level) => (
												<SelectItem key={level.value} value={level.value}>
													<Badge className={level.color}>{level.label}</Badge>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label htmlFor="problem_description">Mô tả vấn đề *</Label>
								<Textarea
									id="problem_description"
									value={formData.problem_description}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											problem_description: e.target.value,
										}))
									}
									className={
										validationErrors.problem_description ? "border-red-500" : ""
									}
									placeholder="Mô tả chi tiết vấn đề máy gặp phải..."
									rows={4}
								/>
								{validationErrors.problem_description && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.problem_description}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="estimated_cost">Chi phí ước tính (VNĐ)</Label>
								<Input
									id="estimated_cost"
									type="number"
									value={formData.estimated_cost}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											estimated_cost: e.target.value,
										}))
									}
									className={
										validationErrors.estimated_cost ? "border-red-500" : ""
									}
									placeholder="VD: 500000"
								/>
								{validationErrors.estimated_cost && (
									<p className="text-red-500 text-sm mt-1">
										{validationErrors.estimated_cost}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="customer_notes">Ghi chú khách hàng</Label>
								<Textarea
									id="customer_notes"
									value={formData.customer_notes}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											customer_notes: e.target.value,
										}))
									}
									placeholder="Ghi chú từ khách hàng..."
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="technician_notes">Ghi chú kỹ thuật viên</Label>
								<Textarea
									id="technician_notes"
									value={formData.technician_notes}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											technician_notes: e.target.value,
										}))
									}
									placeholder="Ghi chú ban đầu của kỹ thuật viên..."
									rows={3}
								/>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="documentation" className="mt-6">
						{formData.device_brand && formData.device_model ? (
							<DeviceDocumentation
								deviceBrand={formData.device_brand}
								deviceModel={formData.device_model}
								deviceSerial={formData.device_serial}
								deviceYear={formData.device_year}
								onDocumentationChange={setDeviceDocumentation}
								initialData={deviceDocumentation}
							/>
						) : (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Vui lòng chọn thương hiệu và model thiết bị trước để sử dụng
									tính năng tài liệu thiết bị.
								</AlertDescription>
							</Alert>
						)}
					</TabsContent>

					<TabsContent value="analysis" className="mt-6">
						<div className="space-y-6">
							{problemClassification && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Brain className="h-5 w-5" />
											Phân tích vấn đề tự động
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
											<div>
												<Label className="font-medium">Loại vấn đề</Label>
												<p className="text-sm">
													{problemClassification.category} -{" "}
													{problemClassification.subcategory}
												</p>
											</div>
											<div>
												<Label className="font-medium">Mức độ ưu tiên</Label>
												<Badge
													className={
														problemClassification.urgencyLevel === "urgent"
															? "bg-red-100 text-red-800"
															: problemClassification.urgencyLevel === "high"
																? "bg-orange-100 text-orange-800"
																: problemClassification.urgencyLevel ===
																		"medium"
																	? "bg-yellow-100 text-yellow-800"
																	: "bg-green-100 text-green-800"
													}
												>
													{problemClassification.urgencyLevel}
												</Badge>
											</div>
											<div>
												<Label className="font-medium">
													Thời gian ước tính
												</Label>
												<p className="text-sm">
													{problemClassification.estimatedTime}
												</p>
											</div>
											<div>
												<Label className="font-medium">Chi phí ước tính</Label>
												<p className="text-sm">
													{problemClassification.estimatedCost
														? `${problemClassification.estimatedCost.toLocaleString(
																"vi-VN",
															)} VNĐ`
														: "Chưa xác định"}
												</p>
											</div>
										</div>

										{problemClassification.requiresSpecialist && (
											<Alert className="mb-4">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>
													Vấn đề này có thể cần chuyên gia xử lý. Cân nhắc
													chuyển cho kỹ thuật viên có kinh nghiệm.
												</AlertDescription>
											</Alert>
										)}

										<div className="space-y-4">
											<div>
												<Label className="font-medium">
													Nguyên nhân thường gặp
												</Label>
												<ul className="text-sm list-disc list-inside mt-1 space-y-1">
													{problemClassification.commonCauses.map(
														(cause: string, index: number) => (
															<li key={index}>{cause}</li>
														),
													)}
												</ul>
											</div>

											<div>
												<Label className="font-medium">Bước chẩn đoán</Label>
												<ol className="text-sm list-decimal list-inside mt-1 space-y-1">
													{problemClassification.diagnosticSteps.map(
														(step: string, index: number) => (
															<li key={index}>{step}</li>
														),
													)}
												</ol>
											</div>

											<div>
												<Label className="font-medium">Giải pháp khả thi</Label>
												<ul className="text-sm list-disc list-inside mt-1 space-y-1">
													{problemClassification.potentialSolutions.map(
														(solution: string, index: number) => (
															<li key={index}>{solution}</li>
														),
													)}
												</ul>
											</div>

											{problemClassification.partsNeeded.length > 0 && (
												<div>
													<Label className="font-medium">
														Linh kiện cần thiết
													</Label>
													<div className="flex flex-wrap gap-2 mt-1">
														{problemClassification.partsNeeded.map(
															(part: string, index: number) => (
																<Badge key={index} variant="outline">
																	{part}
																</Badge>
															),
														)}
													</div>
												</div>
											)}

											{problemClassification.riskFactors.length > 0 && (
												<div>
													<Label className="font-medium">Yếu tố rủi ro</Label>
													<ul className="text-sm list-disc list-inside mt-1 space-y-1 text-orange-600">
														{problemClassification.riskFactors.map(
															(risk: string, index: number) => (
																<li key={index}>{risk}</li>
															),
														)}
													</ul>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{suggestedQuestions.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<HelpCircle className="h-5 w-5" />
											Câu hỏi gợi ý cho khách hàng
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{suggestedQuestions.map((question, index) => (
												<li key={index} className="flex items-start gap-2">
													<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
														{index + 1}
													</span>
													<span className="text-sm">{question}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							)}

							{diagnosticReport && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<FileText className="h-5 w-5" />
											Báo cáo chẩn đoán tự động
										</CardTitle>
									</CardHeader>
									<CardContent>
										<pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
											{diagnosticReport}
										</pre>
									</CardContent>
								</Card>
							)}

							{!problemClassification && !formData.problem_description && (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										Vui lòng nhập mô tả vấn đề ở tab "Vấn đề" để xem phân tích
										tự động.
									</AlertDescription>
								</Alert>
							)}
						</div>
					</TabsContent>

					<TabsContent value="assignment" className="mt-6">
						{formData.device_brand &&
						formData.device_model &&
						formData.problem_description ? (
							<TicketAssignment
								problemCategory={formData.problem_category}
								deviceBrand={formData.device_brand}
								deviceModel={formData.device_model}
								urgencyLevel={formData.urgency_level}
								problemClassification={problemClassification}
								onAssignmentChange={setAssignmentData}
								initialData={assignmentData}
							/>
						) : (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Vui lòng hoàn thành thông tin thiết bị và mô tả vấn đề trước
									khi phân công sửa chữa.
								</AlertDescription>
							</Alert>
						)}
					</TabsContent>

					<TabsContent value="review" className="mt-6">
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium mb-4">
									Xem lại thông tin phiếu sửa chữa
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Thông tin khách hàng
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												<p>
													<strong>Tên:</strong> {formData.customer_name}
												</p>
												<p>
													<strong>Điện thoại:</strong> {formData.customer_phone}
												</p>
												{formData.customer_email && (
													<p>
														<strong>Email:</strong> {formData.customer_email}
													</p>
												)}
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Thông tin thiết bị
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												<p>
													<strong>Thương hiệu:</strong> {formData.device_brand}
												</p>
												<p>
													<strong>Model:</strong> {formData.device_model}
												</p>
												{formData.device_serial && (
													<p>
														<strong>Serial:</strong> {formData.device_serial}
													</p>
												)}
												{formData.device_year && (
													<p>
														<strong>Năm:</strong> {formData.device_year}
													</p>
												)}
												<p>
													<strong>Bảo hành:</strong>{" "}
													{formData.warranty_status
														? "Còn bảo hành"
														: "Hết bảo hành"}
												</p>
											</div>
										</CardContent>
									</Card>

									<Card className="md:col-span-2">
										<CardHeader>
											<CardTitle className="text-base">
												Vấn đề và chi phí
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												<p>
													<strong>Loại vấn đề:</strong>{" "}
													{
														problemCategories.find(
															(c) => c.value === formData.problem_category,
														)?.label
													}
												</p>
												<p>
													<strong>Mức độ ưu tiên:</strong>
													<Badge
														className={`ml-2 ${urgencyLevels.find((l) => l.value === formData.urgency_level)?.color}`}
													>
														{
															urgencyLevels.find(
																(l) => l.value === formData.urgency_level,
															)?.label
														}
													</Badge>
												</p>
												<p>
													<strong>Mô tả:</strong> {formData.problem_description}
												</p>
												{formData.estimated_cost && (
													<p>
														<strong>Chi phí ước tính:</strong>{" "}
														{Number(formData.estimated_cost).toLocaleString(
															"vi-VN",
														)}{" "}
														VNĐ
													</p>
												)}
											</div>
										</CardContent>
									</Card>

									{formData.accessories_included.length > 0 && (
										<Card className="md:col-span-2">
											<CardHeader>
												<CardTitle className="text-base">
													Phụ kiện đi kèm
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="flex flex-wrap gap-2">
													{formData.accessories_included.map((accessory) => (
														<Badge key={accessory} variant="outline">
															{accessory}
														</Badge>
													))}
												</div>
											</CardContent>
										</Card>
									)}

									{(formData.photos.length > 0 ||
										formData.documents.length > 0) && (
										<Card className="md:col-span-2">
											<CardHeader>
												<CardTitle className="text-base">
													Tài liệu đính kèm
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-2">
													{formData.photos.length > 0 && (
														<p>
															<strong>Hình ảnh:</strong>{" "}
															{formData.photos.length} tệp
														</p>
													)}
													{formData.documents.length > 0 && (
														<p>
															<strong>Tài liệu:</strong>{" "}
															{formData.documents.length} tệp
														</p>
													)}
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							</div>

							<div className="flex gap-4">
								<Button
									onClick={handleSaveDraft}
									variant="outline"
									disabled={isSubmitting}
									className="flex items-center gap-2"
								>
									<Save className="h-4 w-4" />
									Lưu nháp
								</Button>
								<Button
									onClick={handleSubmit}
									disabled={isSubmitting || !validateForm()}
									className="flex items-center gap-2"
								>
									{isSubmitting ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
											Đang tạo...
										</>
									) : (
										<>
											<CheckCircle className="h-4 w-4" />
											Tạo phiếu sửa chữa
										</>
									)}
								</Button>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};
