import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/hooks/use-customers";
import { useRepairTickets } from "@/hooks/use-repair-tickets";
import {
	getDeviceModel,
	getPopularBrands,
} from "@/lib/devices/vietnamese-brands";
import type { Database } from "@/lib/supabase";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	FileText,
	Laptop,
	Save,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface CreateTicketFormProps {
	customerId?: string;
	onTicketCreated?: (ticketId: string) => void;
	onSaveDraft?: (draftId: string) => void;
}

interface FormData {
	// Customer info
	customer_phone: string;
	customer_name: string;
	customer_email?: string;

	// Device info
	device_brand: string;
	device_model: string;
	device_serial?: string;
	device_year?: string;

	// Problem info
	problem_description: string;
	problem_category: string;
	urgency_level: string;
	estimated_cost?: string;

	// Additional info
	warranty_status: boolean;
	customer_notes?: string;
	technician_notes?: string;
}

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export function CreateTicketForm({
	customerId,
	onTicketCreated,
	onSaveDraft,
}: CreateTicketFormProps) {
	const { createRepairTicket, previewNextTicketCode } = useRepairTickets();
	const { getCustomerById, searchCustomers } = useCustomers();
	const [currentTab, setCurrentTab] = useState("customer");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>(
		[],
	);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null,
	);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [nextTicketCode, setNextTicketCode] = useState<string>("");

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		reset,
	} = useForm<FormData>({
		defaultValues: {
			customer_phone: "",
			customer_name: "",
			customer_email: "",
			device_brand: "",
			device_model: "",
			device_serial: "",
			device_year: "",
			problem_description: "",
			problem_category: "hardware",
			urgency_level: "normal",
			estimated_cost: "",
			warranty_status: false,
			customer_notes: "",
			technician_notes: "",
		},
	});

	const watchedPhone = watch("customer_phone");
	const watchedBrand = watch("device_brand");
	const brands = getPopularBrands();

	// Load preview ticket code on component mount
	useEffect(() => {
		const loadPreviewCode = async () => {
			try {
				const code = await previewNextTicketCode();
				setNextTicketCode(code);
			} catch (error) {
				console.error("Error loading preview ticket code:", error);
			}
		};
		loadPreviewCode();
	}, [previewNextTicketCode]);

	// Search for existing customers when phone changes
	useEffect(() => {
		const searchCustomer = async () => {
			if (watchedPhone && watchedPhone.length >= 10) {
				try {
					const customers = await searchCustomers(watchedPhone);
					setCustomerSuggestions(customers);

					if (customers.length === 1) {
						const customer = customers[0];
						setSelectedCustomer(customer);
						setValue("customer_name", customer.full_name || "");
						setValue("customer_email", customer.email || "");
					}
				} catch (error) {
					console.error("Error searching customers:", error);
					setCustomerSuggestions([]);
				}
			} else {
				setCustomerSuggestions([]);
				setSelectedCustomer(null);
			}
		};

		searchCustomer();
	}, [watchedPhone, searchCustomers, setValue]);

	// Load customer if customerId is provided
	useEffect(() => {
		if (customerId) {
			const loadCustomer = async () => {
				try {
					const customer = await getCustomerById(customerId);
					setSelectedCustomer(customer);
					setValue("customer_phone", customer.phone);
					setValue("customer_name", customer.full_name || "");
					setValue("customer_email", customer.email || "");
				} catch (error) {
					console.error("Error loading customer:", error);
				}
			};
			loadCustomer();
		}
	}, [customerId, getCustomerById, setValue]);

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		setSubmitError(null);
		setFieldErrors({});

		try {
			// Client-side validation
			const validationErrors: Record<string, string> = {};

			// Validate phone number format
			if (!/^[0-9]{10,11}$/.test(data.customer_phone)) {
				validationErrors.customer_phone = "Số điện thoại phải có 10-11 chữ số";
			}

			// Validate required fields
			if (!data.customer_name.trim()) {
				validationErrors.customer_name = "Tên khách hàng không được để trống";
			}

			if (!data.device_brand.trim()) {
				validationErrors.device_brand = "Vui lòng chọn hãng thiết bị";
			}

			if (!data.device_model.trim()) {
				validationErrors.device_model = "Model thiết bị không được để trống";
			}

			if (!data.problem_description.trim()) {
				validationErrors.problem_description =
					"Mô tả vấn đề không được để trống";
			}

			// Validate estimated cost if provided
			if (data.estimated_cost && Number.isNaN(Number(data.estimated_cost))) {
				validationErrors.estimated_cost = "Chi phí ước tính phải là số hợp lệ";
			}

			// If there are validation errors, show them and stop
			if (Object.keys(validationErrors).length > 0) {
				setFieldErrors(validationErrors);
				setSubmitError("Vui lòng kiểm tra và sửa lỗi các trường bên dưới");

				// Navigate to the first tab with errors
				const errorTabs = {
					customer_phone: "customer",
					customer_name: "customer",
					device_brand: "device",
					device_model: "device",
					problem_description: "problem",
					estimated_cost: "review",
				};

				const firstErrorField = Object.keys(validationErrors)[0];
				const errorTab = errorTabs[firstErrorField];
				if (errorTab && errorTab !== currentTab) {
					setCurrentTab(errorTab);
				}

				setIsSubmitting(false);
				return;
			}

			// Create or get customer
			const customerData = selectedCustomer;
			if (!customerData) {
				// Customer creation would go here
				console.log("Would create new customer:", {
					phone: data.customer_phone,
					full_name: data.customer_name,
					email: data.customer_email,
				});
			}

			// Create repair ticket - transform to NewRepairTicket interface
			const ticketData = {
				// Customer information
				customerPhone: data.customer_phone,
				customerName: data.customer_name,
				customerEmail: data.customer_email,

				// Device information
				deviceBrand: data.device_brand,
				deviceModel: data.device_model,
				deviceType: "laptop" as const, // Default to laptop for Vietnamese repair shop
				serialNumber: data.device_serial,
				warrantyStatus: data.warranty_status,

				// Problem description
				issueDescription: data.problem_description,
				customerDescription: data.customer_notes || data.problem_description,
				symptoms: [], // Default empty array

				// Initial assessment
				estimatedCost: data.estimated_cost
					? Number(data.estimated_cost)
					: undefined,

				// Device condition - default values for required fields
				physicalCondition: {
					general: "good" as const,
					screen: "good" as const,
					keyboard: "good" as const,
					ports: "good" as const,
					battery: "good" as const,
					notes:
						data.technician_notes ||
						"Tình trạng thiết bị sẽ được kiểm tra chi tiết khi tiếp nhận",
				},

				// Priority and assignment
				priority: data.urgency_level as "low" | "normal" | "high" | "urgent",
				repairCategory: data.problem_category,

				// Workflow
				isDraft: false,
			};

			const result = await createRepairTicket(ticketData);
			if (result.success && result.ticketId) {
				onTicketCreated?.(result.ticketId);
				reset();
				setSubmitError(null);
				setFieldErrors({});
			} else {
				setSubmitError(
					result.error || "Không thể tạo phiếu sửa chữa. Vui lòng thử lại.",
				);
			}
		} catch (error) {
			console.error("Error creating ticket:", error);

			// Parse different types of errors
			let errorMessage = "Đã xảy ra lỗi khi tạo phiếu sửa chữa.";

			if (error instanceof Error) {
				if (
					error.message.includes("network") ||
					error.message.includes("fetch")
				) {
					errorMessage =
						"Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
				} else if (
					error.message.includes("duplicate") ||
					error.message.includes("unique")
				) {
					errorMessage =
						"Dữ liệu đã tồn tại trong hệ thống. Vui lòng kiểm tra lại thông tin.";
				} else if (
					error.message.includes("required") ||
					error.message.includes("null")
				) {
					errorMessage =
						"Thiếu thông tin bắt buộc. Vui lòng kiểm tra lại tất cả các trường.";
				} else if (error.message.includes("unauthorized")) {
					errorMessage =
						"Không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.";
				} else {
					errorMessage = `Lỗi: ${error.message}`;
				}
			}

			setSubmitError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveDraft = () => {
		console.log("Save draft functionality");
		onSaveDraft?.("draft-id");
	};

	const canProceedToNext = () => {
		switch (currentTab) {
			case "customer":
				return watchedPhone && watch("customer_name");
			case "device":
				return watchedBrand && watch("device_model");
			case "problem":
				return watch("problem_description");
			default:
				return true;
		}
	};

	const nextTab = () => {
		const tabs = ["customer", "device", "problem", "review"];
		const currentIndex = tabs.indexOf(currentTab);
		if (currentIndex < tabs.length - 1) {
			setCurrentTab(tabs[currentIndex + 1]);
		}
	};

	const prevTab = () => {
		const tabs = ["customer", "device", "problem", "review"];
		const currentIndex = tabs.indexOf(currentTab);
		if (currentIndex > 0) {
			setCurrentTab(tabs[currentIndex - 1]);
		}
	};

	return (
		<div className="container mx-auto py-8 max-w-5xl">
			{/* Header Section */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center">
						<FileText className="h-8 w-8 mr-3 text-blue-600" />
						<h1 className="text-3xl font-bold text-gray-900">
							Tạo phiếu sửa chữa mới
						</h1>
					</div>
					{nextTicketCode && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
							<div className="text-sm text-blue-600 font-medium">
								Mã phiếu tiếp theo
							</div>
							<div className="text-lg font-bold text-blue-800 font-mono">
								{nextTicketCode}
							</div>
						</div>
					)}
				</div>
				<p className="text-gray-600">
					Điền thông tin chi tiết để tạo phiếu sửa chữa cho khách hàng
				</p>
			</div>

			{/* Global Error Message */}
			{submitError && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-center">
						<AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
						<div>
							<h3 className="text-sm font-medium text-red-800 mb-1">
								Không thể gửi form
							</h3>
							<p className="text-sm text-red-700">{submitError}</p>
						</div>
					</div>
				</div>
			)}

			<Card className="shadow-lg border-0">
				<CardContent className="p-8">
					<form onSubmit={handleSubmit(onSubmit)}>
						<Tabs value={currentTab} onValueChange={setCurrentTab}>
							<TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-gray-100">
								<TabsTrigger
									value="customer"
									className="flex items-center data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm h-10 text-sm font-medium transition-all duration-200"
								>
									<User className="h-4 w-4 mr-2" />
									Khách hàng
								</TabsTrigger>
								<TabsTrigger
									value="device"
									className="flex items-center data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm h-10 text-sm font-medium transition-all duration-200"
								>
									<Laptop className="h-4 w-4 mr-2" />
									Thiết bị
								</TabsTrigger>
								<TabsTrigger
									value="problem"
									className="flex items-center data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm h-10 text-sm font-medium transition-all duration-200"
								>
									<AlertTriangle className="h-4 w-4 mr-2" />
									Vấn đề
								</TabsTrigger>
								<TabsTrigger
									value="review"
									className="flex items-center data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm h-10 text-sm font-medium transition-all duration-200"
								>
									<FileText className="h-4 w-4 mr-2" />
									Xem lại
								</TabsTrigger>
							</TabsList>

							{/* Customer Tab */}
							<TabsContent value="customer" className="space-y-6">
								<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
									<div className="flex items-center mb-4">
										<User className="h-6 w-6 mr-3 text-blue-600" />
										<h3 className="text-xl font-semibold text-gray-900">
											Thông tin khách hàng
										</h3>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="customer_phone"
												className="text-sm font-medium text-gray-700"
											>
												Số điện thoại <span className="text-red-500">*</span>
											</Label>
											<Input
												id="customer_phone"
												{...register("customer_phone", {
													required: "Vui lòng nhập số điện thoại",
													pattern: {
														value: /^[0-9]{10,11}$/,
														message: "Số điện thoại không hợp lệ",
													},
												})}
												placeholder="0912345678"
												className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
											/>
											{(errors.customer_phone ||
												fieldErrors.customer_phone) && (
												<p className="text-sm text-red-500 flex items-center mt-1">
													<AlertTriangle className="h-4 w-4 mr-1" />
													{errors.customer_phone?.message ||
														fieldErrors.customer_phone}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="customer_name"
												className="text-sm font-medium text-gray-700"
											>
												Tên khách hàng <span className="text-red-500">*</span>
											</Label>
											<Input
												id="customer_name"
												{...register("customer_name", {
													required: "Vui lòng nhập tên khách hàng",
												})}
												placeholder="Nguyễn Văn A"
												className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
											/>
											{(errors.customer_name || fieldErrors.customer_name) && (
												<p className="text-sm text-red-500 flex items-center mt-1">
													<AlertTriangle className="h-4 w-4 mr-1" />
													{errors.customer_name?.message ||
														fieldErrors.customer_name}
												</p>
											)}
										</div>
									</div>

									<div className="mt-6">
										<Label
											htmlFor="customer_email"
											className="text-sm font-medium text-gray-700"
										>
											Email (không bắt buộc)
										</Label>
										<Input
											id="customer_email"
											type="email"
											{...register("customer_email")}
											placeholder="email@example.com"
											className="mt-2 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
										/>
									</div>

									{customerSuggestions.length > 0 && (
										<div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
											<div className="flex items-center mb-3">
												<User className="h-5 w-5 mr-2 text-green-600" />
												<p className="text-sm font-medium text-green-800">
													Khách hàng đã tồn tại:
												</p>
											</div>
											{customerSuggestions.map((customer) => (
												<div
													key={customer.phone}
													className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-400"
												>
													<div className="font-medium text-gray-900">
														{customer.full_name}
													</div>
													<div className="text-gray-600">{customer.phone}</div>
													{customer.email && (
														<div className="text-gray-600">
															{customer.email}
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							</TabsContent>

							{/* Device Tab */}
							<TabsContent value="device" className="space-y-6">
								<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
									<div className="flex items-center mb-6">
										<Laptop className="h-6 w-6 mr-3 text-green-600" />
										<h3 className="text-xl font-semibold text-gray-900">
											Thông tin thiết bị
										</h3>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="device_brand"
												className="text-sm font-medium text-gray-700"
											>
												Thương hiệu <span className="text-red-500">*</span>
											</Label>
											<Select
												onValueChange={(value) =>
													setValue("device_brand", value)
												}
											>
												<SelectTrigger className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500">
													<SelectValue placeholder="Chọn thương hiệu" />
												</SelectTrigger>
												<SelectContent>
													{brands.map((brand) => (
														<SelectItem key={brand.name} value={brand.name}>
															{brand.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{(errors.device_brand || fieldErrors.device_brand) && (
												<p className="text-sm text-red-500 flex items-center mt-1">
													<AlertTriangle className="h-4 w-4 mr-1" />
													{errors.device_brand?.message ||
														fieldErrors.device_brand}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="device_model"
												className="text-sm font-medium text-gray-700"
											>
												Model <span className="text-red-500">*</span>
											</Label>
											<Input
												id="device_model"
												{...register("device_model", {
													required: "Vui lòng nhập model thiết bị",
												})}
												placeholder="Inspiron 15, ThinkPad X1..."
												className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
											/>
											{(errors.device_model || fieldErrors.device_model) && (
												<p className="text-sm text-red-500 flex items-center mt-1">
													<AlertTriangle className="h-4 w-4 mr-1" />
													{errors.device_model?.message ||
														fieldErrors.device_model}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
										<div className="space-y-2">
											<Label
												htmlFor="device_serial"
												className="text-sm font-medium text-gray-700"
											>
												Số serial
											</Label>
											<Input
												id="device_serial"
												{...register("device_serial")}
												placeholder="ABC123456"
												className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="device_year"
												className="text-sm font-medium text-gray-700"
											>
												Năm sản xuất
											</Label>
											<Input
												id="device_year"
												{...register("device_year")}
												placeholder="2023"
												type="number"
												min="2000"
												max={new Date().getFullYear()}
												className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
											/>
										</div>
									</div>
								</div>
							</TabsContent>

							{/* Problem Tab */}
							<TabsContent value="problem" className="space-y-6">
								<div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100">
									<div className="flex items-center mb-6">
										<AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
										<h3 className="text-xl font-semibold text-gray-900">
											Mô tả vấn đề
										</h3>
									</div>

									<div className="space-y-6">
										<div className="space-y-2">
											<Label
												htmlFor="problem_description"
												className="text-sm font-medium text-gray-700"
											>
												Mô tả chi tiết vấn đề{" "}
												<span className="text-red-500">*</span>
											</Label>
											<Textarea
												id="problem_description"
												{...register("problem_description", {
													required: "Vui lòng mô tả vấn đề",
												})}
												placeholder="Máy tính không khởi động được, màn hình đen, có tiếng kêu lạ..."
												rows={4}
												className="border-gray-200 focus:border-red-500 focus:ring-red-500 resize-none"
											/>
											{(errors.problem_description ||
												fieldErrors.problem_description) && (
												<p className="text-sm text-red-500 flex items-center mt-1">
													<AlertTriangle className="h-4 w-4 mr-1" />
													{errors.problem_description?.message ||
														fieldErrors.problem_description}
												</p>
											)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label
													htmlFor="problem_category"
													className="text-sm font-medium text-gray-700"
												>
													Phân loại vấn đề
												</Label>
												<Select
													onValueChange={(value) =>
														setValue("problem_category", value)
													}
												>
													<SelectTrigger className="h-11 border-gray-200 focus:border-red-500 focus:ring-red-500">
														<SelectValue placeholder="Chọn loại vấn đề" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="hardware">Phần cứng</SelectItem>
														<SelectItem value="software">Phần mềm</SelectItem>
														<SelectItem value="screen">Màn hình</SelectItem>
														<SelectItem value="battery">Pin</SelectItem>
														<SelectItem value="keyboard">Bàn phím</SelectItem>
														<SelectItem value="other">Khác</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<Label
													htmlFor="urgency_level"
													className="text-sm font-medium text-gray-700"
												>
													Mức độ ưu tiên
												</Label>
												<Select
													onValueChange={(value) =>
														setValue("urgency_level", value)
													}
												>
													<SelectTrigger className="h-11 border-gray-200 focus:border-red-500 focus:ring-red-500">
														<SelectValue placeholder="Chọn độ ưu tiên" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="low">Thấp</SelectItem>
														<SelectItem value="normal">Bình thường</SelectItem>
														<SelectItem value="high">Cao</SelectItem>
														<SelectItem value="urgent">Khẩn cấp</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="estimated_cost"
												className="text-sm font-medium text-gray-700"
											>
												Chi phí ước tính (VND)
											</Label>
											<Input
												id="estimated_cost"
												type="number"
												{...register("estimated_cost")}
												placeholder="500000"
												className="h-11 border-gray-200 focus:border-red-500 focus:ring-red-500"
											/>
											{fieldErrors.estimated_cost && (
												<p className="text-sm text-red-500 flex items-center mt-1">
													<AlertTriangle className="h-4 w-4 mr-1" />
													{fieldErrors.estimated_cost}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="customer_notes"
												className="text-sm font-medium text-gray-700"
											>
												Ghi chú của khách hàng
											</Label>
											<Textarea
												id="customer_notes"
												{...register("customer_notes")}
												placeholder="Thêm ghi chú từ khách hàng (yêu cầu đặc biệt, đồ cá nhân trong máy...)"
												rows={2}
												className="border-gray-200 focus:border-red-500 focus:ring-red-500 resize-none"
											/>
										</div>
									</div>
								</div>
							</TabsContent>

							{/* Review Tab */}
							<TabsContent value="review" className="space-y-6">
								<div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-100">
									<div className="flex items-center mb-6">
										<FileText className="h-6 w-6 mr-3 text-emerald-600" />
										<h3 className="text-xl font-semibold text-gray-900">
											Xem lại thông tin
										</h3>
									</div>

									<div className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{/* Customer Info Summary */}
											<div className="p-4 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm">
												<div className="flex items-center mb-3">
													<User className="h-5 w-5 mr-2 text-blue-600" />
													<h4 className="font-semibold text-gray-900">
														Thông tin khách hàng
													</h4>
												</div>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-gray-600">Tên:</span>
														<span className="font-medium text-gray-900">
															{watch("customer_name") || "Chưa có"}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600">Điện thoại:</span>
														<span className="font-medium text-gray-900">
															{watch("customer_phone") || "Chưa có"}
														</span>
													</div>
													{watch("customer_email") && (
														<div className="flex justify-between">
															<span className="text-gray-600">Email:</span>
															<span className="font-medium text-gray-900">
																{watch("customer_email")}
															</span>
														</div>
													)}
												</div>
											</div>

											{/* Device Info Summary */}
											<div className="p-4 bg-white rounded-lg border-l-4 border-green-500 shadow-sm">
												<div className="flex items-center mb-3">
													<Laptop className="h-5 w-5 mr-2 text-green-600" />
													<h4 className="font-semibold text-gray-900">
														Thông tin thiết bị
													</h4>
												</div>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-gray-600">Thương hiệu:</span>
														<span className="font-medium text-gray-900">
															{watch("device_brand") || "Chưa có"}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600">Model:</span>
														<span className="font-medium text-gray-900">
															{watch("device_model") || "Chưa có"}
														</span>
													</div>
													{watch("device_serial") && (
														<div className="flex justify-between">
															<span className="text-gray-600">Serial:</span>
															<span className="font-medium text-gray-900">
																{watch("device_serial")}
															</span>
														</div>
													)}
													{watch("device_year") && (
														<div className="flex justify-between">
															<span className="text-gray-600">Năm SX:</span>
															<span className="font-medium text-gray-900">
																{watch("device_year")}
															</span>
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Problem Summary */}
										<div className="p-4 bg-white rounded-lg border-l-4 border-red-500 shadow-sm">
											<div className="flex items-center mb-3">
												<AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
												<h4 className="font-semibold text-gray-900">
													Mô tả vấn đề
												</h4>
											</div>
											<div className="text-sm text-gray-800 bg-gray-50 p-3 rounded border">
												{watch("problem_description") ? (
													<p className="whitespace-pre-wrap leading-relaxed">
														{watch("problem_description")}
													</p>
												) : (
													<p className="italic text-gray-500">Chưa có mô tả</p>
												)}
											</div>

											{/* Additional Info */}
											<div className="mt-3 flex flex-wrap gap-2">
												{watch("problem_category") && (
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														Loại: {watch("problem_category")}
													</span>
												)}
												{watch("urgency_level") && (
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
														Ưu tiên: {watch("urgency_level")}
													</span>
												)}
												{watch("estimated_cost") && (
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
														Dự kiến:{" "}
														{Number(watch("estimated_cost")).toLocaleString(
															"vi-VN",
														)}{" "}
														VNĐ
													</span>
												)}
											</div>

											{/* Customer Notes */}
											{watch("customer_notes") && (
												<div className="mt-3">
													<p className="text-xs text-gray-500 mb-1">
														Ghi chú khách hàng:
													</p>
													<p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
														{watch("customer_notes")}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>

						{/* Navigation Buttons */}
						<div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
							<div>
								{currentTab !== "customer" && (
									<Button
										type="button"
										variant="outline"
										onClick={prevTab}
										className="px-6 py-3 text-base border-gray-300 hover:bg-gray-50"
									>
										<ArrowLeft className="h-4 w-4 mr-2" />
										Quay lại
									</Button>
								)}
							</div>

							<div className="flex gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={handleSaveDraft}
									disabled={isSubmitting}
									className="px-6 py-3 text-base border-gray-300 hover:bg-gray-50"
								>
									<Save className="h-4 w-4 mr-2" />
									Lưu nháp
								</Button>

								{currentTab !== "review" ? (
									<Button
										type="button"
										onClick={nextTab}
										disabled={!canProceedToNext()}
										className="px-8 py-3 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Tiếp tục
										<ArrowRight className="h-5 w-5 ml-2" />
									</Button>
								) : (
									<Button
										type="submit"
										disabled={isSubmitting}
										className="px-10 py-3 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg disabled:opacity-50"
									>
										{isSubmitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white" />
												Đang tạo...
											</>
										) : (
											<>
												<FileText className="h-5 w-5 mr-2" />
												Tạo phiếu sửa chữa
											</>
										)}
									</Button>
								)}
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
