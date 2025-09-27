import { PhoneInput } from "@/components/customers/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SimplePhoneValidation } from "@/lib/phone-utils";
import {
	type NameValidationResult,
	validateVietnameseName,
} from "@/lib/validation/customer-data";
import { AlertCircle, Check, Save, User } from "lucide-react";
import { useCallback, useState } from "react";

export interface CustomerProfileData {
	phone: string; // Required, no spaces
	fullName: string; // Required
	address: string; // Optional
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
	const [phoneValidation, setPhoneValidation] = useState<SimplePhoneValidation>(
		{ isValid: false },
	);
	const [nameValidation, setNameValidation] = useState<NameValidationResult>({
		isValid: false,
		type: "invalid",
	});
	const [saving, setSaving] = useState(false);

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
		(phone: string, validation: SimplePhoneValidation) => {
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
		(address: string) => {
			updateField("address", address);
		},
		[updateField],
	);

	// Save handler
	const handleSave = useCallback(async () => {
		if (!onSave || !phoneValidation.isValid || !nameValidation.isValid) return;

		setSaving(true);
		try {
			await onSave(value);
		} catch (error) {
			console.error("Failed to save customer profile:", error);
		} finally {
			setSaving(false);
		}
	}, [onSave, phoneValidation.isValid, nameValidation.isValid, value]);

	// Validation check
	const isFormValid = phoneValidation.isValid && nameValidation.isValid;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{mode === "create"
							? "Thông tin khách hàng mới"
							: "Chỉnh sửa thông tin khách hàng"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Phone Number */}
					<div className="space-y-2">
						<Label htmlFor="phone" className="text-sm font-medium">
							Số điện thoại *
						</Label>
						<PhoneInput
							value={value.phone}
							onChange={handlePhoneChange}
							disabled={disabled || mode === "edit"} // Don't allow phone editing
							placeholder="0901234567"
						/>
						{showValidation && !phoneValidation.isValid && value.phone && (
							<div className="flex items-center gap-1 text-sm text-red-600">
								<AlertCircle className="h-4 w-4" />
								<span>Số điện thoại không hợp lệ</span>
							</div>
						)}
					</div>

					{/* Full Name */}
					<div className="space-y-2">
						<Label htmlFor="fullName" className="text-sm font-medium">
							Họ và tên *
						</Label>
						<Input
							id="fullName"
							value={value.fullName}
							onChange={(e) => handleNameChange(e.target.value)}
							disabled={disabled}
							placeholder="Nguyễn Văn An"
							className={
								showValidation && !nameValidation.isValid && value.fullName
									? "border-red-500"
									: ""
							}
						/>
						{showValidation && !nameValidation.isValid && value.fullName && (
							<div className="flex items-center gap-1 text-sm text-red-600">
								<AlertCircle className="h-4 w-4" />
								<span>Tên không hợp lệ</span>
							</div>
						)}
						{showValidation && nameValidation.isValid && value.fullName && (
							<div className="flex items-center gap-1 text-sm text-green-600">
								<Check className="h-4 w-4" />
								<span>Tên hợp lệ</span>
							</div>
						)}
					</div>

					{/* Address */}
					<div className="space-y-2">
						<Label htmlFor="address" className="text-sm font-medium">
							Địa chỉ
						</Label>
						<Textarea
							id="address"
							value={value.address}
							onChange={(e) => handleAddressChange(e.target.value)}
							disabled={disabled}
							placeholder="123 Đường ABC, Quận 1, TP.HCM"
							rows={3}
						/>
						<p className="text-xs text-gray-500">
							Địa chỉ liên hệ (không bắt buộc)
						</p>
					</div>

					{/* Save Button */}
					{onSave && (
						<div className="flex justify-end pt-4">
							<Button
								onClick={handleSave}
								disabled={disabled || !isFormValid || saving}
								className="flex items-center gap-2"
							>
								<Save className="h-4 w-4" />
								{saving
									? "Đang lưu..."
									: mode === "create"
										? "Tạo khách hàng"
										: "Cập nhật"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Export helper function for creating new customer data
export function createEmptyCustomerProfile(): CustomerProfileData {
	return {
		phone: "",
		fullName: "",
		address: "",
	};
}

// Export helper function for validating customer data
export function validateCustomerProfile(profile: CustomerProfileData): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!profile.phone.trim()) {
		errors.push("Số điện thoại là bắt buộc");
	}

	if (!profile.fullName.trim()) {
		errors.push("Họ và tên là bắt buộc");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}
