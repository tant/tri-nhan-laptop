import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePhone, type SimplePhoneValidation } from "@/lib/phone-utils";
import { AlertCircle, Check } from "lucide-react";
import { useCallback, useState } from "react";

interface PhoneInputProps {
	value: string;
	onChange: (value: string, validation: SimplePhoneValidation) => void;
	placeholder?: string;
	label?: string;
	disabled?: boolean;
	required?: boolean;
	showValidation?: boolean;
}

export function PhoneInput({
	value,
	onChange,
	placeholder = "Số điện thoại",
	label = "Số điện thoại",
	disabled = false,
	required = false,
	showValidation = true,
}: PhoneInputProps) {
	const [validation, setValidation] = useState<SimplePhoneValidation>({
		isValid: false,
	});

	const handleChange = useCallback(
		(inputValue: string) => {
			const validationResult = validatePhone(inputValue);
			setValidation(validationResult);
			onChange(inputValue, validationResult);
		},
		[onChange],
	);

	const getValidationColor = () => {
		if (!value) return "border-input";
		if (validation.isValid) return "border-green-500";
		return "border-red-500";
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

			{showValidation && value && !validation.isValid && validation.error && (
				<div id="phone-validation" className="flex items-center gap-2 text-sm text-red-700">
					<AlertCircle className="h-3 w-3" />
					<span>{validation.error}</span>
				</div>
			)}
		</div>
	);
}
