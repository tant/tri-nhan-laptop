import {
	AlertCircle,
	Battery,
	Camera,
	CheckCircle,
	Cpu,
	FileText,
	HardDrive,
	Info,
	Keyboard,
	MemoryStick,
	Monitor,
	Mouse,
	Upload,
	Volume2,
	Wifi,
	Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	estimateRepairDifficulty,
	getDeviceBrand,
} from "../../lib/devices/vietnamese-brands";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface DeviceSpec {
	component: string;
	specification: string;
	status: "working" | "faulty" | "unknown";
	notes?: string;
}

interface ProblemDocumentation {
	symptom: string;
	frequency: "always" | "often" | "sometimes" | "rarely";
	severity: "minor" | "moderate" | "major" | "critical";
	whenOccurs: string;
	errorMessages: string[];
	userActions: string;
	previousRepairs: string;
}

interface DeviceDocumentationProps {
	deviceBrand: string;
	deviceModel: string;
	deviceSerial?: string;
	deviceYear?: string;
	onDocumentationChange?: (documentation: any) => void;
	initialData?: any;
}

export const DeviceDocumentation: React.FC<DeviceDocumentationProps> = ({
	deviceBrand,
	deviceModel,
	deviceSerial,
	deviceYear,
	onDocumentationChange,
	initialData,
}) => {
	const [deviceSpecs, setDeviceSpecs] = useState<DeviceSpec[]>([]);
	const [problemDoc, setProblemDoc] = useState<ProblemDocumentation>({
		symptom: "",
		frequency: "sometimes",
		severity: "moderate",
		whenOccurs: "",
		errorMessages: [],
		userActions: "",
		previousRepairs: "",
	});
	const [photos, setPhotos] = useState<File[]>([]);
	const [documents, setDocuments] = useState<File[]>([]);
	const [diagnosticNotes, setDiagnosticNotes] = useState("");
	const [repairEstimate, setRepairEstimate] = useState<any>(null);
	const [currentErrorMessage, setCurrentErrorMessage] = useState("");

	const componentIcons: Record<string, any> = {
		"Màn hình": Monitor,
		"Bàn phím": Keyboard,
		"Touchpad/Chuột": Mouse,
		Pin: Battery,
		"Adapter sạc": Zap,
		"Ổ cứng/SSD": HardDrive,
		RAM: MemoryStick,
		"CPU/GPU": Cpu,
		"Wi-Fi/Bluetooth": Wifi,
		"Loa/Microphone": Volume2,
		"Cổng kết nối": Info,
		"Vỏ máy": Monitor,
	};

	const commonComponents = [
		"Màn hình",
		"Bàn phím",
		"Touchpad/Chuột",
		"Pin",
		"Adapter sạc",
		"Ổ cứng/SSD",
		"RAM",
		"CPU/GPU",
		"Wi-Fi/Bluetooth",
		"Loa/Microphone",
		"Cổng kết nối",
		"Vỏ máy",
	];

	const frequencyOptions = [
		{ value: "always", label: "Luôn luôn", color: "bg-red-100 text-red-800" },
		{
			value: "often",
			label: "Thường xuyên",
			color: "bg-orange-100 text-orange-800",
		},
		{
			value: "sometimes",
			label: "Thỉnh thoảng",
			color: "bg-yellow-100 text-yellow-800",
		},
		{
			value: "rarely",
			label: "Hiếm khi",
			color: "bg-green-100 text-green-800",
		},
	];

	const severityOptions = [
		{ value: "minor", label: "Nhỏ", color: "bg-green-100 text-green-800" },
		{ value: "moderate", label: "Vừa", color: "bg-yellow-100 text-yellow-800" },
		{
			value: "major",
			label: "Nghiêm trọng",
			color: "bg-orange-100 text-orange-800",
		},
		{
			value: "critical",
			label: "Rất nghiêm trọng",
			color: "bg-red-100 text-red-800",
		},
	];

	useEffect(() => {
		if (deviceBrand && deviceModel) {
			initializeDeviceSpecs();
			generateRepairEstimate();
		}
	}, [deviceBrand, deviceModel]);

	useEffect(() => {
		if (initialData) {
			setProblemDoc(initialData.problemDoc || problemDoc);
			setPhotos(initialData.photos || []);
			setDocuments(initialData.documents || []);
			setDiagnosticNotes(initialData.diagnosticNotes || "");
			setDeviceSpecs(initialData.deviceSpecs || []);
		}
	}, [initialData]);

	useEffect(() => {
		notifyDocumentationChange();
	}, [deviceSpecs, problemDoc, photos, documents, diagnosticNotes]);

	const initializeDeviceSpecs = () => {
		const brandData = getDeviceBrand(deviceBrand);
		let specs: DeviceSpec[] = [];

		if (brandData) {
			const modelData = brandData.models?.find((m) => m.name === deviceModel);
			if (modelData?.specs) {
				specs = Object.entries(modelData.specs).map(([component, spec]) => ({
					component,
					specification: typeof spec === "string" ? spec : JSON.stringify(spec),
					status: "unknown" as const,
				}));
			}
		}

		// Add common components if not already present
		commonComponents.forEach((component) => {
			if (!specs.find((spec) => spec.component === component)) {
				specs.push({
					component,
					specification: "Chưa xác định",
					status: "unknown",
				});
			}
		});

		setDeviceSpecs(specs);
	};

	const generateRepairEstimate = () => {
		const estimate = estimateRepairDifficulty(
			deviceBrand,
			deviceModel,
			problemDoc.symptom,
		);
		setRepairEstimate(estimate);
	};

	const notifyDocumentationChange = () => {
		if (onDocumentationChange) {
			onDocumentationChange({
				deviceSpecs,
				problemDoc,
				photos,
				documents,
				diagnosticNotes,
				repairEstimate,
			});
		}
	};

	const updateDeviceSpec = (
		index: number,
		field: keyof DeviceSpec,
		value: string,
	) => {
		setDeviceSpecs((prev) =>
			prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
		);
	};

	const updateProblemDoc = (field: keyof ProblemDocumentation, value: any) => {
		setProblemDoc((prev) => ({ ...prev, [field]: value }));
	};

	const addErrorMessage = () => {
		if (currentErrorMessage.trim()) {
			setProblemDoc((prev) => ({
				...prev,
				errorMessages: [...prev.errorMessages, currentErrorMessage.trim()],
			}));
			setCurrentErrorMessage("");
		}
	};

	const removeErrorMessage = (index: number) => {
		setProblemDoc((prev) => ({
			...prev,
			errorMessages: prev.errorMessages.filter((_, i) => i !== index),
		}));
	};

	const handleFileUpload = (
		files: FileList | null,
		type: "photos" | "documents",
	) => {
		if (files) {
			const fileArray = Array.from(files);
			if (type === "photos") {
				setPhotos((prev) => [...prev, ...fileArray]);
			} else {
				setDocuments((prev) => [...prev, ...fileArray]);
			}
		}
	};

	const removeFile = (index: number, type: "photos" | "documents") => {
		if (type === "photos") {
			setPhotos((prev) => prev.filter((_, i) => i !== index));
		} else {
			setDocuments((prev) => prev.filter((_, i) => i !== index));
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "working":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "faulty":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Info className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "working":
				return "bg-green-100 text-green-800";
			case "faulty":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			{/* Device Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Monitor className="h-5 w-5" />
						Thông tin thiết bị: {deviceBrand} {deviceModel}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{deviceSerial && (
							<div>
								<Label className="text-sm font-medium">Số Serial</Label>
								<p className="text-sm">{deviceSerial}</p>
							</div>
						)}
						{deviceYear && (
							<div>
								<Label className="text-sm font-medium">Năm sản xuất</Label>
								<p className="text-sm">{deviceYear}</p>
							</div>
						)}
						{repairEstimate && (
							<>
								<div>
									<Label className="text-sm font-medium">Độ khó sửa chữa</Label>
									<Badge
										className={
											repairEstimate.difficulty === "easy"
												? "bg-green-100 text-green-800"
												: repairEstimate.difficulty === "medium"
													? "bg-yellow-100 text-yellow-800"
													: "bg-red-100 text-red-800"
										}
									>
										{repairEstimate.difficulty === "easy"
											? "Dễ"
											: repairEstimate.difficulty === "medium"
												? "Trung bình"
												: "Khó"}
									</Badge>
								</div>
								<div>
									<Label className="text-sm font-medium">
										Thời gian ước tính
									</Label>
									<p className="text-sm">{repairEstimate.estimatedTime}</p>
								</div>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="specs" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="specs">Cấu hình</TabsTrigger>
					<TabsTrigger value="problem">Vấn đề</TabsTrigger>
					<TabsTrigger value="media">Hình ảnh</TabsTrigger>
					<TabsTrigger value="diagnosis">Chẩn đoán</TabsTrigger>
				</TabsList>

				<TabsContent value="specs" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Tình trạng linh kiện</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{deviceSpecs.map((spec, index) => {
									const IconComponent = componentIcons[spec.component] || Info;
									return (
										<div
											key={index}
											className="grid grid-cols-12 gap-4 items-center"
										>
											<div className="col-span-3 flex items-center gap-2">
												<IconComponent className="h-4 w-4 text-gray-500" />
												<span className="font-medium text-sm">
													{spec.component}
												</span>
											</div>

											<div className="col-span-4">
												<Input
													value={spec.specification}
													onChange={(e) =>
														updateDeviceSpec(
															index,
															"specification",
															e.target.value,
														)
													}
													placeholder="Thông số kỹ thuật"
													className="text-sm"
												/>
											</div>

											<div className="col-span-2">
												<select
													value={spec.status}
													onChange={(e) =>
														updateDeviceSpec(index, "status", e.target.value)
													}
													className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md"
												>
													<option value="unknown">Chưa kiểm tra</option>
													<option value="working">Hoạt động tốt</option>
													<option value="faulty">Có lỗi</option>
												</select>
											</div>

											<div className="col-span-1 flex justify-center">
												{getStatusIcon(spec.status)}
											</div>

											<div className="col-span-2">
												<Input
													value={spec.notes || ""}
													onChange={(e) =>
														updateDeviceSpec(index, "notes", e.target.value)
													}
													placeholder="Ghi chú"
													className="text-xs"
												/>
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="problem" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Mô tả chi tiết vấn đề</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="symptom">Triệu chứng chính *</Label>
								<Textarea
									id="symptom"
									value={problemDoc.symptom}
									onChange={(e) => updateProblemDoc("symptom", e.target.value)}
									placeholder="Mô tả chi tiết triệu chứng mà thiết bị đang gặp phải..."
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Tần suất xảy ra</Label>
									<select
										value={problemDoc.frequency}
										onChange={(e) =>
											updateProblemDoc("frequency", e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
									>
										{frequencyOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>

								<div>
									<Label>Mức độ nghiêm trọng</Label>
									<select
										value={problemDoc.severity}
										onChange={(e) =>
											updateProblemDoc("severity", e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
									>
										{severityOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<Label htmlFor="whenOccurs">Khi nào xảy ra</Label>
								<Input
									id="whenOccurs"
									value={problemDoc.whenOccurs}
									onChange={(e) =>
										updateProblemDoc("whenOccurs", e.target.value)
									}
									placeholder="VD: Khi khởi động, khi sử dụng phần mềm nặng, khi sạc..."
								/>
							</div>

							<div>
								<Label>Thông báo lỗi</Label>
								<div className="flex gap-2 mb-2">
									<Input
										value={currentErrorMessage}
										onChange={(e) => setCurrentErrorMessage(e.target.value)}
										placeholder="Nhập thông báo lỗi..."
										onKeyPress={(e) => e.key === "Enter" && addErrorMessage()}
									/>
									<Button onClick={addErrorMessage} type="button" size="sm">
										Thêm
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									{problemDoc.errorMessages.map((message, index) => (
										<Badge
											key={index}
											variant="outline"
											className="cursor-pointer"
											onClick={() => removeErrorMessage(index)}
										>
											{message} ×
										</Badge>
									))}
								</div>
							</div>

							<div>
								<Label htmlFor="userActions">
									Hành động người dùng đã thực hiện
								</Label>
								<Textarea
									id="userActions"
									value={problemDoc.userActions}
									onChange={(e) =>
										updateProblemDoc("userActions", e.target.value)
									}
									placeholder="Những gì khách hàng đã thử để khắc phục..."
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="previousRepairs">
									Lịch sử sửa chữa trước đó
								</Label>
								<Textarea
									id="previousRepairs"
									value={problemDoc.previousRepairs}
									onChange={(e) =>
										updateProblemDoc("previousRepairs", e.target.value)
									}
									placeholder="Thiết bị đã từng được sửa chữa gì trước đây..."
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{repairEstimate?.commonIssues && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<Info className="h-4 w-4" />
									Vấn đề phổ biến với {deviceBrand} {deviceModel}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{repairEstimate.commonIssues.map(
										(issue: string, index: number) => (
											<div key={index} className="flex items-start gap-2">
												<AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
												<p className="text-sm">{issue}</p>
											</div>
										),
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="media" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Hình ảnh thiết bị</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={(e) => handleFileUpload(e.target.files, "photos")}
									className="hidden"
									id="photo-upload"
								/>
								<label htmlFor="photo-upload" className="cursor-pointer">
									<div className="text-center">
										<Camera className="mx-auto h-12 w-12 text-gray-400" />
										<p className="mt-2 text-sm text-gray-600">
											Chụp hoặc chọn hình ảnh thiết bị
										</p>
										<p className="text-xs text-gray-500">
											PNG, JPG, GIF lên tới 10MB
										</p>
									</div>
								</label>
							</div>

							{photos.length > 0 && (
								<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
									{photos.map((photo, index) => (
										<div key={index} className="relative">
											<img
												src={URL.createObjectURL(photo)}
												alt={`Device photo ${index + 1}`}
												className="w-full h-24 object-cover rounded-lg"
											/>
											<button
												onClick={() => removeFile(index, "photos")}
												className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
											>
												×
											</button>
											<p className="text-xs text-center mt-1">{photo.name}</p>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Tài liệu kỹ thuật</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
								<input
									type="file"
									multiple
									accept=".pdf,.doc,.docx,.txt"
									onChange={(e) =>
										handleFileUpload(e.target.files, "documents")
									}
									className="hidden"
									id="document-upload"
								/>
								<label htmlFor="document-upload" className="cursor-pointer">
									<div className="text-center">
										<Upload className="mx-auto h-12 w-12 text-gray-400" />
										<p className="mt-2 text-sm text-gray-600">
											Tải tài liệu kỹ thuật
										</p>
										<p className="text-xs text-gray-500">
											PDF, DOC, DOCX, TXT lên tới 5MB
										</p>
									</div>
								</label>
							</div>

							{documents.length > 0 && (
								<div className="mt-4 space-y-2">
									{documents.map((doc, index) => (
										<div
											key={index}
											className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
										>
											<div className="flex items-center gap-2">
												<FileText className="h-4 w-4 text-gray-500" />
												<span className="text-sm">{doc.name}</span>
												<span className="text-xs text-gray-500">
													({Math.round(doc.size / 1024)} KB)
												</span>
											</div>
											<button
												onClick={() => removeFile(index, "documents")}
												className="text-red-500 hover:text-red-700"
											>
												×
											</button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="diagnosis" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Ghi chú chẩn đoán</CardTitle>
						</CardHeader>
						<CardContent>
							<Textarea
								value={diagnosticNotes}
								onChange={(e) => setDiagnosticNotes(e.target.value)}
								placeholder="Ghi chú sơ bộ về tình trạng thiết bị, phương án sửa chữa dự kiến..."
								rows={6}
							/>
						</CardContent>
					</Card>

					{repairEstimate && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Đánh giá sửa chữa</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="font-medium">Độ khó</Label>
										<Badge
											className={
												repairEstimate.difficulty === "easy"
													? "bg-green-100 text-green-800"
													: repairEstimate.difficulty === "medium"
														? "bg-yellow-100 text-yellow-800"
														: "bg-red-100 text-red-800"
											}
										>
											{repairEstimate.difficulty === "easy"
												? "Dễ"
												: repairEstimate.difficulty === "medium"
													? "Trung bình"
													: "Khó"}
										</Badge>
									</div>
									<div>
										<Label className="font-medium">Thời gian ước tính</Label>
										<p className="text-sm">{repairEstimate.estimatedTime}</p>
									</div>
									{repairEstimate.estimatedCost && (
										<div className="col-span-2">
											<Label className="font-medium">Chi phí ước tính</Label>
											<p className="text-sm">
												{repairEstimate.estimatedCost.toLocaleString("vi-VN")}{" "}
												VNĐ
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			{repairEstimate?.recommendations && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>
						<strong>Khuyến nghị:</strong> {repairEstimate.recommendations}
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};
