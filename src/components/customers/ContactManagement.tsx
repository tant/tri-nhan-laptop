import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { validatePhone } from "@/lib/phone-utils";
import {
	type ContactPreferences,
	type EmailValidationResult,
	validateEmail,
} from "@/lib/validation/customer-data";
import {
	AlertCircle,
	Check,
	Mail,
	MessageSquare,
	Phone,
	Plus,
	UserPlus,
} from "lucide-react";
import { useCallback, useState } from "react";

export interface ContactInfo {
	primaryPhone: string;
	email?: string;
	alternativePhone?: string;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	preferences: ContactPreferences;
	notes?: string;
}

interface ContactManagementProps {
	value: ContactInfo;
	onChange: (contactInfo: ContactInfo) => void;
	disabled?: boolean;
	required?: boolean;
	showValidation?: boolean;
}

export function ContactManagement({
	value,
	onChange,
	disabled = false,
	required = false,
	showValidation = true,
}: ContactManagementProps) {
	const [emailValidation, setEmailValidation] = useState<EmailValidationResult>(
		{ isValid: true, type: "valid" },
	);
	const [alternativePhoneValidation, setAlternativePhoneValidation] = useState({
		isValid: true,
	});
	const [emergencyPhoneValidation, setEmergencyPhoneValidation] = useState({
		isValid: true,
	});

	const updateField = useCallback(
		<K extends keyof ContactInfo>(field: K, newValue: ContactInfo[K]) => {
			const updated = { ...value, [field]: newValue };
			onChange(updated);
		},
		[value, onChange],
	);

	const updatePreference = useCallback(
		<K extends keyof ContactPreferences>(
			field: K,
			newValue: ContactPreferences[K],
		) => {
			const updatedPreferences = { ...value.preferences, [field]: newValue };
			updateField("preferences", updatedPreferences);
		},
		[value.preferences, updateField],
	);

	const validateEmailField = useCallback((email: string) => {
		if (!email.trim()) {
			setEmailValidation({ isValid: true, type: "valid" });
			return;
		}
		const validation = validateEmail(email);
		setEmailValidation(validation);
	}, []);

	const validateAlternativePhone = useCallback((phone: string) => {
		if (!phone.trim()) {
			setAlternativePhoneValidation({ isValid: true });
			return;
		}
		const validation = validatePhone(phone);
		setAlternativePhoneValidation(validation);
	}, []);

	const validateEmergencyPhone = useCallback((phone: string) => {
		if (!phone.trim()) {
			setEmergencyPhoneValidation({ isValid: true });
			return;
		}
		const validation = validatePhone(phone);
		setEmergencyPhoneValidation(validation);
	}, []);

	const handleEmailChange = useCallback(
		(email: string) => {
			updateField("email", email);
			validateEmailField(email);
		},
		[updateField, validateEmailField],
	);

	const handleAlternativePhoneChange = useCallback(
		(phone: string) => {
			updateField("alternativePhone", phone);
			validateAlternativePhone(phone);
		},
		[updateField, validateAlternativePhone],
	);

	const handleEmergencyPhoneChange = useCallback(
		(phone: string) => {
			updateField("emergencyContactPhone", phone);
			validateEmergencyPhone(phone);
		},
		[updateField, validateEmergencyPhone],
	);

	const getValidationIcon = (isValid: boolean, hasValue: boolean) => {
		if (!showValidation || !hasValue) return null;
		return isValid ? (
			<Check className="h-4 w-4 text-green-600" />
		) : (
			<AlertCircle className="h-4 w-4 text-red-500" />
		);
	};

	return (
		<div className="space-y-6">
			{/* Contact Information Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Phone className="h-4 w-4 text-muted-foreground" />
					<Label className="text-sm font-medium">
						Thông tin liên hệ{" "}
						{required && <span className="text-red-500 ml-1">*</span>}
					</Label>
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="email" className="text-sm">
						Email
					</Label>
					<div className="relative">
						<Input
							id="email"
							type="email"
							value={value.email || ""}
							onChange={(e) => handleEmailChange(e.target.value)}
							placeholder="email@example.com"
							disabled={disabled}
							className={`pr-10 ${
								value.email && !emailValidation.isValid
									? "border-red-500"
									: value.email && emailValidation.isValid
										? "border-green-500"
										: ""
							}`}
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							{getValidationIcon(emailValidation.isValid, !!value.email)}
						</div>
					</div>
					{showValidation &&
						value.email &&
						emailValidation.error &&
						!emailValidation.isValid && (
							<div className="flex items-center gap-2 text-sm text-red-700">
								<AlertCircle className="h-3 w-3" />
								<span>{emailValidation.error}</span>
							</div>
						)}
					{showValidation &&
						value.email &&
						emailValidation.type === "suspicious" && (
							<div className="flex items-center gap-2 text-sm text-amber-700">
								<AlertCircle className="h-3 w-3" />
								<span>Email có vẻ không thật, vui lòng kiểm tra lại</span>
							</div>
						)}
				</div>

				{/* Alternative Phone */}
				<div className="space-y-2">
					<Label htmlFor="alternative-phone" className="text-sm">
						Số điện thoại phụ
					</Label>
					<div className="relative">
						<Input
							id="alternative-phone"
							type="tel"
							value={value.alternativePhone || ""}
							onChange={(e) => handleAlternativePhoneChange(e.target.value)}
							placeholder="0901 234 567"
							disabled={disabled}
							className={`pr-10 ${
								value.alternativePhone && !alternativePhoneValidation.isValid
									? "border-red-500"
									: value.alternativePhone && alternativePhoneValidation.isValid
										? "border-green-500"
										: ""
							}`}
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							{getValidationIcon(
								alternativePhoneValidation.isValid,
								!!value.alternativePhone,
							)}
						</div>
					</div>
					{showValidation &&
						value.alternativePhone &&
						!alternativePhoneValidation.isValid && (
							<div className="flex items-center gap-2 text-sm text-red-700">
								<AlertCircle className="h-3 w-3" />
								<span>Số điện thoại phụ không hợp lệ</span>
							</div>
						)}
				</div>
			</div>

			{/* Emergency Contact Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<UserPlus className="h-4 w-4 text-muted-foreground" />
					<Label className="text-sm font-medium">Liên hệ khẩn cấp</Label>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="emergency-name" className="text-sm">
							Tên người liên hệ
						</Label>
						<Input
							id="emergency-name"
							value={value.emergencyContactName || ""}
							onChange={(e) =>
								updateField("emergencyContactName", e.target.value)
							}
							placeholder="Tên người thân"
							disabled={disabled}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="emergency-phone" className="text-sm">
							Số điện thoại khẩn cấp
						</Label>
						<div className="relative">
							<Input
								id="emergency-phone"
								type="tel"
								value={value.emergencyContactPhone || ""}
								onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
								placeholder="0901 234 567"
								disabled={disabled}
								className={`pr-10 ${
									value.emergencyContactPhone &&
									!emergencyPhoneValidation.isValid
										? "border-red-500"
										: value.emergencyContactPhone &&
												emergencyPhoneValidation.isValid
											? "border-green-500"
											: ""
								}`}
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3">
								{getValidationIcon(
									emergencyPhoneValidation.isValid,
									!!value.emergencyContactPhone,
								)}
							</div>
						</div>
						{showValidation &&
							value.emergencyContactPhone &&
							!emergencyPhoneValidation.isValid && (
								<div className="flex items-center gap-2 text-sm text-red-700">
									<AlertCircle className="h-3 w-3" />
									<span>Số điện thoại khẩn cấp không hợp lệ</span>
								</div>
							)}
					</div>
				</div>
			</div>

			{/* Contact Preferences Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-muted-foreground" />
					<Label className="text-sm font-medium">Tùy chọn liên hệ</Label>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label className="text-sm">Phương thức liên hệ ưa thích</Label>
						<Select
							value={value.preferences.preferredMethod}
							onValueChange={(newValue: "phone" | "email" | "sms") =>
								updatePreference("preferredMethod", newValue)
							}
							disabled={disabled}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="phone">
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4" />
										<span>Điện thoại</span>
									</div>
								</SelectItem>
								<SelectItem value="email">
									<div className="flex items-center gap-2">
										<Mail className="h-4 w-4" />
										<span>Email</span>
									</div>
								</SelectItem>
								<SelectItem value="sms">
									<div className="flex items-center gap-2">
										<MessageSquare className="h-4 w-4" />
										<span>Tin nhắn SMS</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label className="text-sm">Thời gian liên hệ ưa thích</Label>
						<Select
							value={value.preferences.preferredTime}
							onValueChange={(
								newValue: "morning" | "afternoon" | "evening" | "any",
							) => updatePreference("preferredTime", newValue)}
							disabled={disabled}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="morning">
									Buổi sáng (8:00 - 12:00)
								</SelectItem>
								<SelectItem value="afternoon">
									Buổi chiều (12:00 - 18:00)
								</SelectItem>
								<SelectItem value="evening">
									Buổi tối (18:00 - 20:00)
								</SelectItem>
								<SelectItem value="any">Bất kỳ lúc nào</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label className="text-sm">Cho phép nhận thông tin marketing</Label>
						<p className="text-xs text-muted-foreground">
							Nhận thông báo về khuyến mãi và dịch vụ mới
						</p>
					</div>
					<Switch
						checked={value.preferences.allowMarketing}
						onCheckedChange={(checked) =>
							updatePreference("allowMarketing", checked)
						}
						disabled={disabled}
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-sm">Ngôn ngữ liên hệ</Label>
					<Select
						value={value.preferences.language}
						onValueChange={(newValue: "vi" | "en") =>
							updatePreference("language", newValue)
						}
						disabled={disabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="vi">Tiếng Việt</SelectItem>
							<SelectItem value="en">English</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Contact Notes */}
			<div className="space-y-2">
				<Label htmlFor="contact-notes" className="text-sm">
					Ghi chú liên hệ
				</Label>
				<Textarea
					id="contact-notes"
					value={value.notes || ""}
					onChange={(e) => updateField("notes", e.target.value)}
					placeholder="Ghi chú thêm về tùy chọn liên hệ của khách hàng..."
					disabled={disabled}
					rows={3}
				/>
			</div>
		</div>
	);
}

/**
 * Contact preference summary component
 */
interface ContactPreferenceSummaryProps {
	preferences: ContactPreferences;
	className?: string;
}

export function ContactPreferenceSummary({
	preferences,
	className = "",
}: ContactPreferenceSummaryProps) {
	const getMethodIcon = () => {
		switch (preferences.preferredMethod) {
			case "phone":
				return <Phone className="h-3 w-3" />;
			case "email":
				return <Mail className="h-3 w-3" />;
			case "sms":
				return <MessageSquare className="h-3 w-3" />;
			default:
				return <Phone className="h-3 w-3" />;
		}
	};

	const getMethodText = () => {
		switch (preferences.preferredMethod) {
			case "phone":
				return "Điện thoại";
			case "email":
				return "Email";
			case "sms":
				return "SMS";
			default:
				return "Điện thoại";
		}
	};

	const getTimeText = () => {
		switch (preferences.preferredTime) {
			case "morning":
				return "Buổi sáng";
			case "afternoon":
				return "Buổi chiều";
			case "evening":
				return "Buổi tối";
			default:
				return "Bất kỳ";
		}
	};

	return (
		<div className={`flex flex-wrap gap-2 ${className}`}>
			<Badge variant="secondary" className="flex items-center gap-1">
				{getMethodIcon()}
				<span>{getMethodText()}</span>
			</Badge>
			<Badge variant="outline">
				<span>{getTimeText()}</span>
			</Badge>
			{preferences.allowMarketing && (
				<Badge variant="outline" className="text-green-700">
					Marketing OK
				</Badge>
			)}
			<Badge variant="outline">
				{preferences.language === "vi" ? "Tiếng Việt" : "English"}
			</Badge>
		</div>
	);
}

/**
 * Contact history item component
 */
export interface ContactHistoryItem {
	id: string;
	type: "call" | "email" | "sms" | "visit";
	direction: "inbound" | "outbound";
	date: string;
	subject?: string;
	notes?: string;
	contactedBy?: string;
}

interface ContactHistoryProps {
	items: ContactHistoryItem[];
	onAddContact?: () => void;
	className?: string;
}

export function ContactHistory({
	items,
	onAddContact,
	className = "",
}: ContactHistoryProps) {
	const getTypeIcon = (type: ContactHistoryItem["type"]) => {
		switch (type) {
			case "call":
				return <Phone className="h-4 w-4" />;
			case "email":
				return <Mail className="h-4 w-4" />;
			case "sms":
				return <MessageSquare className="h-4 w-4" />;
			case "visit":
				return <UserPlus className="h-4 w-4" />;
			default:
				return <Phone className="h-4 w-4" />;
		}
	};

	const getTypeText = (type: ContactHistoryItem["type"]) => {
		switch (type) {
			case "call":
				return "Cuộc gọi";
			case "email":
				return "Email";
			case "sms":
				return "Tin nhắn";
			case "visit":
				return "Ghé thăm";
			default:
				return "Liên hệ";
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">Lịch sử liên hệ</Label>
				{onAddContact && (
					<Button size="sm" variant="outline" onClick={onAddContact}>
						<Plus className="h-4 w-4 mr-1" />
						Thêm liên hệ
					</Button>
				)}
			</div>

			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground italic">
					Chưa có lịch sử liên hệ
				</p>
			) : (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="border rounded p-3 space-y-2 hover:bg-muted/50"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{getTypeIcon(item.type)}
									<span className="text-sm font-medium">
										{getTypeText(item.type)}
									</span>
									<Badge
										variant={
											item.direction === "inbound" ? "default" : "secondary"
										}
									>
										{item.direction === "inbound" ? "Gọi đến" : "Gọi đi"}
									</Badge>
								</div>
								<span className="text-xs text-muted-foreground">
									{formatDate(item.date)}
								</span>
							</div>

							{item.subject && (
								<p className="text-sm font-medium">{item.subject}</p>
							)}

							{item.notes && (
								<p className="text-xs text-muted-foreground">{item.notes}</p>
							)}

							{item.contactedBy && (
								<p className="text-xs text-muted-foreground">
									Bởi: {item.contactedBy}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
