import {
	VietnameseAddress,
	type VietnameseAddressData,
} from "@/components/address/VietnameseAddress";
import {
	type ContactInfo,
	ContactManagement,
} from "@/components/customers/ContactManagement";
import { PhoneInput } from "@/components/customers/PhoneInput";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	type AddressValidationResult,
	type BusinessDataValidationResult,
	type CustomerCategory,
	type IDCardValidationResult,
	type NameValidationResult,
	getDefaultContactPreferences,
	validateBusinessData,
	validateDateOfBirth,
	validateVietnameseIDCard,
	validateVietnameseName,
} from "@/lib/validation/customer-data";
import type { PhoneValidationResult } from "@/lib/validation/phone-vietnamese";
import {
	AlertCircle,
	Building2,
	Calendar,
	Check,
	CreditCard,
	Save,
	Star,
	User,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface CustomerProfileData {
	// Basic info
	phone: string;
	fullName: string;
	category: CustomerCategory;

	// Personal info (for individuals)
	dateOfBirth?: string;
	idCardNumber?: string;

	// Business info (for businesses)
	businessName?: string;
	taxCode?: string;

	// Address
	address: VietnameseAddressData;

	// Contact
	contactInfo: ContactInfo;

	// Additional info
	notes?: string;
	customerTags: string[];
	isVip: boolean;
	privacyConsent: boolean;
}

interface CustomerProfileFormProps {
	value: CustomerProfileData;
	onChange: (profile: CustomerProfileData) => void;
	onSave?: (profile: CustomerProfileData) => Promise<void>;
	disabled?: boolean;
	mode?: "create" | "edit";
	showValidation?: boolean;
}

export function CustomerProfileForm({
	value,
	onChange,
	onSave,
	disabled = false,
	mode = "create",
	showValidation = true,
}: CustomerProfileFormProps) {
	// Validation states
	const [phoneValidation, setPhoneValidation] = useState<PhoneValidationResult>(
		{ isValid: false, formatted: "", type: "invalid" },
	);
	const [nameValidation, setNameValidation] = useState<NameValidationResult>({
		isValid: false,
		type: "invalid",
	});
	const [addressValidation, setAddressValidation] =
		useState<AddressValidationResult>({ isValid: false });
	const [idCardValidation, setIdCardValidation] =
		useState<IDCardValidationResult>({ isValid: true, type: "invalid" });
	const [dobValidation, setDobValidation] = useState<{
		isValid: boolean;
		error?: string;
		age?: number;
	}>({ isValid: true });
	const [businessValidation, setBusinessValidation] =
		useState<BusinessDataValidationResult>({
			isValid: true,
			errors: [],
			warnings: [],
		});

	const [saving, setSaving] = useState(false);
	const [newTag, setNewTag] = useState("");

	// Update field handler
	const updateField = useCallback(
		<K extends keyof CustomerProfileData>(
			field: K,
			newValue: CustomerProfileData[K],
		) => {
			const updated = { ...value, [field]: newValue };
			onChange(updated);
		},
		[value, onChange],
	);

	// Validation handlers
	const handlePhoneChange = useCallback(
		(phone: string, validation: PhoneValidationResult) => {
			updateField("phone", phone);
			setPhoneValidation(validation);
		},
		[updateField],
	);

	const handleNameChange = useCallback(
		(name: string) => {
			updateField("fullName", name);
			const validation = validateVietnameseName(name);
			setNameValidation(validation);
		},
		[updateField],
	);

	const handleAddressChange = useCallback(
		(address: VietnameseAddressData, validation: AddressValidationResult) => {
			updateField("address", address);
			setAddressValidation(validation);
		},
		[updateField],
	);

	const handleContactChange = useCallback(
		(contactInfo: ContactInfo) => {
			updateField("contactInfo", contactInfo);
		},
		[updateField],
	);

	const handleIDCardChange = useCallback(
		(idCard: string) => {
			updateField("idCardNumber", idCard);
			if (idCard.trim()) {
				const validation = validateVietnameseIDCard(idCard);
				setIdCardValidation(validation);
			} else {
				setIdCardValidation({ isValid: true, type: "invalid" });
			}
		},
		[updateField],
	);

	const handleDobChange = useCallback(
		(dob: string) => {
			updateField("dateOfBirth", dob);
			if (dob.trim()) {
				const validation = validateDateOfBirth(dob);
				setDobValidation(validation);
			} else {
				setDobValidation({ isValid: true });
			}
		},
		[updateField],
	);

	const handleCategoryChange = useCallback(
		(category: CustomerCategory) => {
			updateField("category", category);
			// Clear category-specific fields when switching
			if (category === "individual") {
				updateField("businessName", "");
				updateField("taxCode", "");
			} else {
				updateField("dateOfBirth", "");
				updateField("idCardNumber", "");
			}
		},
		[updateField],
	);

	// Validate business data when relevant fields change
	useEffect(() => {
		if (value.category === "business") {
			const validation = validateBusinessData({
				businessName: value.businessName,
				taxCode: value.taxCode,
				contactPerson: value.fullName,
			});
			setBusinessValidation(validation);
		}
	}, [value.category, value.businessName, value.taxCode, value.fullName]);

	// Tag management
	const handleAddTag = useCallback(() => {
		if (newTag.trim() && !value.customerTags.includes(newTag.trim())) {
			updateField("customerTags", [...value.customerTags, newTag.trim()]);
			setNewTag("");
		}
	}, [newTag, value.customerTags, updateField]);

	const handleRemoveTag = useCallback(
		(tag: string) => {
			updateField(
				"customerTags",
				value.customerTags.filter((t) => t !== tag),
			);
		},
		[value.customerTags, updateField],
	);

	// Save handler
	const handleSave = useCallback(async () => {
		if (!onSave) return;

		setSaving(true);
		try {
			await onSave(value);
		} finally {
			setSaving(false);
		}
	}, [onSave, value]);

	// Validation summary
	const isFormValid =
		phoneValidation.isValid &&
		nameValidation.isValid &&
		addressValidation.isValid &&
		(value.category === "individual" || businessValidation.isValid) &&
		idCardValidation.isValid &&
		dobValidation.isValid &&
		value.privacyConsent;

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{mode === "create"
							? "Tạo hồ sơ khách hàng mới"
							: "Chỉnh sửa hồ sơ khách hàng"}
					</CardTitle>
				</CardHeader>
			</Card>

			{/* Basic Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="h-5 w-5" />
						Thông tin cơ bản
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Phone Number */}
					<PhoneInput
						value={value.phone}
						onChange={handlePhoneChange}
						label="Số điện thoại chính"
						required
						disabled={disabled || mode === "edit"} // Phone can't be changed in edit mode
						showValidation={showValidation}
					/>

					{/* Full Name */}
					<div className="space-y-2">
						<Label htmlFor="full-name" className="text-sm">
							Họ và tên <span className="text-red-500">*</span>
						</Label>
						<div className="relative">
							<Input
								id="full-name"
								value={value.fullName}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder="Nhập họ và tên đầy đủ"
								disabled={disabled}
								className={`pr-10 ${
									value.fullName && !nameValidation.isValid
										? "border-red-500"
										: value.fullName && nameValidation.isValid
											? "border-green-500"
											: ""
								}`}
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3">
								{showValidation &&
									value.fullName &&
									(nameValidation.isValid ? (
										<Check className="h-4 w-4 text-green-600" />
									) : (
										<AlertCircle className="h-4 w-4 text-red-500" />
									))}
							</div>
						</div>
						{showValidation && nameValidation.error && (
							<div className="flex items-center gap-2 text-sm text-red-700">
								<AlertCircle className="h-3 w-3" />
								<span>{nameValidation.error}</span>
							</div>
						)}
						{showValidation && nameValidation.type === "suspicious" && (
							<div className="flex items-center gap-2 text-sm text-amber-700">
								<AlertCircle className="h-3 w-3" />
								<span>Tên có vẻ không đầy đủ, vui lòng kiểm tra lại</span>
							</div>
						)}
					</div>

					{/* Customer Category */}
					<div className="space-y-2">
						<Label className="text-sm">
							Loại khách hàng <span className="text-red-500">*</span>
						</Label>
						<Select
							value={value.category}
							onValueChange={handleCategoryChange}
							disabled={disabled}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="individual">
									<div className="flex items-center gap-2">
										<User className="h-4 w-4" />
										<span>Cá nhân</span>
									</div>
								</SelectItem>
								<SelectItem value="business">
									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4" />
										<span>Doanh nghiệp</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Category-specific Information */}
			{value.category === "individual" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<CreditCard className="h-5 w-5" />
							Thông tin cá nhân
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Date of Birth */}
							<div className="space-y-2">
								<Label htmlFor="dob" className="text-sm">
									Ngày sinh
								</Label>
								<div className="relative">
									<Input
										id="dob"
										type="date"
										value={value.dateOfBirth || ""}
										onChange={(e) => handleDobChange(e.target.value)}
										disabled={disabled}
										className={`pr-10 ${
											value.dateOfBirth && !dobValidation.isValid
												? "border-red-500"
												: value.dateOfBirth && dobValidation.isValid
													? "border-green-500"
													: ""
										}`}
									/>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3">
										<Calendar className="h-4 w-4 text-muted-foreground" />
									</div>
								</div>
								{showValidation && dobValidation.error && (
									<div className="flex items-center gap-2 text-sm text-red-700">
										<AlertCircle className="h-3 w-3" />
										<span>{dobValidation.error}</span>
									</div>
								)}
								{showValidation &&
									dobValidation.isValid &&
									dobValidation.age !== undefined && (
										<div className="text-sm text-muted-foreground">
											Tuổi: {dobValidation.age}
										</div>
									)}
							</div>

							{/* ID Card Number */}
							<div className="space-y-2">
								<Label htmlFor="id-card" className="text-sm">
									Số CMND/CCCD
								</Label>
								<div className="relative">
									<Input
										id="id-card"
										value={value.idCardNumber || ""}
										onChange={(e) => handleIDCardChange(e.target.value)}
										placeholder="123456789 hoặc 123456789012"
										disabled={disabled}
										className={`pr-10 ${
											value.idCardNumber && !idCardValidation.isValid
												? "border-red-500"
												: value.idCardNumber && idCardValidation.isValid
													? "border-green-500"
													: ""
										}`}
									/>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3">
										{showValidation &&
											value.idCardNumber &&
											(idCardValidation.isValid ? (
												<Check className="h-4 w-4 text-green-600" />
											) : (
												<AlertCircle className="h-4 w-4 text-red-500" />
											))}
									</div>
								</div>
								{showValidation && idCardValidation.error && (
									<div className="flex items-center gap-2 text-sm text-red-700">
										<AlertCircle className="h-3 w-3" />
										<span>{idCardValidation.error}</span>
									</div>
								)}
								{showValidation &&
									idCardValidation.isValid &&
									idCardValidation.type !== "invalid" && (
										<div className="text-sm text-muted-foreground">
											{idCardValidation.type === "old_format"
												? "Định dạng CMND cũ (9 số)"
												: "Định dạng CCCD mới (12 số)"}
										</div>
									)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{value.category === "business" && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Building2 className="h-5 w-5" />
							Thông tin doanh nghiệp
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Business Name */}
							<div className="space-y-2">
								<Label htmlFor="business-name" className="text-sm">
									Tên doanh nghiệp <span className="text-red-500">*</span>
								</Label>
								<Input
									id="business-name"
									value={value.businessName || ""}
									onChange={(e) => updateField("businessName", e.target.value)}
									placeholder="Nhập tên doanh nghiệp"
									disabled={disabled}
								/>
							</div>

							{/* Tax Code */}
							<div className="space-y-2">
								<Label htmlFor="tax-code" className="text-sm">
									Mã số thuế
								</Label>
								<Input
									id="tax-code"
									value={value.taxCode || ""}
									onChange={(e) => updateField("taxCode", e.target.value)}
									placeholder="1234567890 hoặc 1234567890123"
									disabled={disabled}
								/>
							</div>
						</div>

						{/* Business validation errors */}
						{showValidation && businessValidation.errors.length > 0 && (
							<div className="space-y-1">
								{businessValidation.errors.map((error) => (
									<div
										key={error}
										className="flex items-center gap-2 text-sm text-red-700"
									>
										<AlertCircle className="h-3 w-3" />
										<span>{error}</span>
									</div>
								))}
							</div>
						)}

						{/* Business validation warnings */}
						{showValidation && businessValidation.warnings.length > 0 && (
							<div className="space-y-1">
								{businessValidation.warnings.map((warning) => (
									<div
										key={warning}
										className="flex items-center gap-2 text-sm text-amber-700"
									>
										<AlertCircle className="h-3 w-3" />
										<span>{warning}</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Address Information */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Địa chỉ</CardTitle>
				</CardHeader>
				<CardContent>
					<VietnameseAddress
						value={value.address}
						onChange={handleAddressChange}
						disabled={disabled}
						required
						showValidation={showValidation}
					/>
				</CardContent>
			</Card>

			{/* Contact Information */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
				</CardHeader>
				<CardContent>
					<ContactManagement
						value={value.contactInfo}
						onChange={handleContactChange}
						disabled={disabled}
						showValidation={showValidation}
					/>
				</CardContent>
			</Card>

			{/* Additional Information */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* VIP Status */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label className="text-sm flex items-center gap-2">
								<Star className="h-4 w-4" />
								Khách hàng VIP
							</Label>
							<p className="text-xs text-muted-foreground">
								Khách hàng quan trọng, ưu tiên dịch vụ
							</p>
						</div>
						<Switch
							checked={value.isVip}
							onCheckedChange={(checked) => updateField("isVip", checked)}
							disabled={disabled}
						/>
					</div>

					{/* Customer Tags */}
					<div className="space-y-2">
						<Label className="text-sm">Nhãn khách hàng</Label>
						<div className="flex flex-wrap gap-2 mb-2">
							{value.customerTags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
								>
									{tag}
									{!disabled && (
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="hover:text-red-500"
										>
											×
										</button>
									)}
								</span>
							))}
						</div>
						{!disabled && (
							<div className="flex gap-2">
								<Input
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									placeholder="Thêm nhãn mới"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddTag();
										}
									}}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleAddTag}
									disabled={!newTag.trim()}
								>
									Thêm
								</Button>
							</div>
						)}
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes" className="text-sm">
							Ghi chú
						</Label>
						<Textarea
							id="notes"
							value={value.notes || ""}
							onChange={(e) => updateField("notes", e.target.value)}
							placeholder="Ghi chú thêm về khách hàng..."
							disabled={disabled}
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Privacy Consent */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<Switch
							checked={value.privacyConsent}
							onCheckedChange={(checked) =>
								updateField("privacyConsent", checked)
							}
							disabled={disabled}
						/>
						<div className="space-y-0.5">
							<Label className="text-sm">
								Đồng ý xử lý dữ liệu cá nhân{" "}
								<span className="text-red-500">*</span>
							</Label>
							<p className="text-xs text-muted-foreground">
								Khách hàng đồng ý cho phép cửa hàng lưu trữ và xử lý thông tin
								cá nhân để phục vụ việc sửa chữa và hỗ trợ khách hàng
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			{onSave && (
				<Card>
					<CardContent className="pt-6">
						<div className="flex justify-between items-center">
							<div className="text-sm text-muted-foreground">
								{isFormValid ? (
									<span className="text-green-600">
										✓ Thông tin hợp lệ, có thể lưu
									</span>
								) : (
									<span className="text-red-600">
										⚠ Vui lòng kiểm tra lại thông tin
									</span>
								)}
							</div>
							<Button
								onClick={handleSave}
								disabled={disabled || !isFormValid || saving}
								className="min-w-[120px]"
							>
								{saving ? (
									"Đang lưu..."
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										{mode === "create" ? "Tạo khách hàng" : "Cập nhật"}
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

/**
 * Helper function to create default customer profile data
 */
export function createDefaultCustomerProfile(): CustomerProfileData {
	return {
		phone: "",
		fullName: "",
		category: "individual",
		address: {
			details: "",
			ward: "",
			district: "",
			province: "",
		},
		contactInfo: {
			primaryPhone: "",
			preferences: getDefaultContactPreferences(),
		},
		customerTags: [],
		isVip: false,
		privacyConsent: false,
	};
}
