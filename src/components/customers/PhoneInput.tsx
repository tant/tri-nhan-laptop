import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type PhoneValidationResult,
	validateVietnamesePhone,
} from "@/lib/validation/phone-vietnamese";
import { AlertCircle, Check, Phone } from "lucide-react";
import { useCallback, useState } from "react";

interface PhoneInputProps {
	value: string;
	onChange: (value: string, validation: PhoneValidationResult) => void;
	placeholder?: string;
	label?: string;
	disabled?: boolean;
	required?: boolean;
	showValidation?: boolean;
	showCarrier?: boolean;
}

export function PhoneInput({
	value,
	onChange,
	placeholder = "0901 234 567",
	label = "Số điện thoại",
	disabled = false,
	required = false,
	showValidation = true,
	showCarrier = true,
}: PhoneInputProps) {
	const [, setFocused] = useState(false);
	const [validation, setValidation] = useState<PhoneValidationResult>({
		isValid: false,
		formatted: "",
		type: "invalid",
	});

	const handleChange = useCallback(
		(inputValue: string) => {
			const validationResult = validateVietnamesePhone(inputValue);
			setValidation(validationResult);
			onChange(inputValue, validationResult);
		},
		[onChange],
	);

	const handleBlur = useCallback(() => {
		setFocused(false);
		// Auto-format on blur if valid
		if (validation.isValid && validation.formatted !== value) {
			onChange(validation.formatted, validation);
		}
	}, [validation, value, onChange]);

	const getValidationColor = () => {
		if (!value) return "border-input";
		if (validation.isValid) return "border-green-500";
		return "border-red-500";
	};

	const getCarrierBadge = () => {
		if (!showCarrier || !validation.isValid || !validation.carrier) return null;

		const carrierNames: Record<string, string> = {
			viettel: "Viettel",
			vinaphone: "VinaPhone",
			mobifone: "MobiFone",
			vietnamobile: "Vietnamobile",
			gmobile: "GMobile",
		};

		return (
			<Badge variant="outline" className="text-xs">
				{carrierNames[validation.carrier] || validation.carrier}
			</Badge>
		);
	};

	const getTypeIcon = () => {
		if (!validation.isValid) return null;

		switch (validation.type) {
			case "mobile":
				return <Phone className="h-3 w-3 text-green-600" />;
			case "landline":
				return <Phone className="h-3 w-3 text-blue-600" />;
			case "international":
				return <Phone className="h-3 w-3 text-purple-600" />;
			default:
				return null;
		}
	};

	return (
		<div className="space-y-2">
			{label && (
				<Label htmlFor="phone-input" className="text-sm font-medium">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</Label>
			)}

			<div className="relative">
				<Input
					id="phone-input"
					type="tel"
					value={value}
					onChange={(e) => handleChange(e.target.value)}
					onFocus={() => setFocused(true)}
					onBlur={handleBlur}
					placeholder={placeholder}
					disabled={disabled}
					className={`pr-10 ${getValidationColor()}`}
					aria-describedby={showValidation ? "phone-validation" : undefined}
				/>

				<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
					{value &&
						(validation.isValid ? (
							<Check className="h-4 w-4 text-green-600" />
						) : (
							<AlertCircle className="h-4 w-4 text-red-500" />
						))}
				</div>
			</div>

			{showValidation && value && (
				<div id="phone-validation" className="space-y-1">
					{validation.isValid ? (
						<div className="flex items-center gap-2 text-sm text-green-700">
							{getTypeIcon()}
							<span>
								{validation.type === "mobile" && "Số di động hợp lệ"}
								{validation.type === "landline" && "Số điện thoại bàn hợp lệ"}
								{validation.type === "international" && "Số quốc tế hợp lệ"}
							</span>
							{getCarrierBadge()}
						</div>
					) : (
						validation.error && (
							<div className="flex items-center gap-2 text-sm text-red-700">
								<AlertCircle className="h-3 w-3" />
								<span>{validation.error}</span>
							</div>
						)
					)}

					{validation.isValid && validation.formatted !== value && (
						<div className="text-xs text-muted-foreground">
							Định dạng chuẩn: {validation.formatted}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
