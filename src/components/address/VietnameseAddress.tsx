import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type AddressValidationResult,
	VIETNAMESE_PROVINCES,
	validateVietnameseAddress,
} from "@/lib/validation/customer-data";
import { AlertCircle, Check, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface VietnameseAddressData {
	details: string;
	ward: string;
	district: string;
	province: string;
}

interface VietnameseAddressProps {
	value: VietnameseAddressData;
	onChange: (
		address: VietnameseAddressData,
		validation: AddressValidationResult,
	) => void;
	disabled?: boolean;
	required?: boolean;
	showValidation?: boolean;
}

export function VietnameseAddress({
	value,
	onChange,
	disabled = false,
	required = false,
	showValidation = true,
}: VietnameseAddressProps) {
	const [validation, setValidation] = useState<AddressValidationResult>({
		isValid: false,
	});

	const validateAndUpdate = useCallback(
		(newAddress: VietnameseAddressData) => {
			const validationResult = validateVietnameseAddress(newAddress);
			setValidation(validationResult);
			onChange(newAddress, validationResult);
		},
		[onChange],
	);

	// Initial validation
	useEffect(() => {
		validateAndUpdate(value);
	}, [value, validateAndUpdate]);

	const updateField = useCallback(
		(field: keyof VietnameseAddressData, newValue: string) => {
			const updatedAddress = {
				...value,
				[field]: newValue,
			};
			validateAndUpdate(updatedAddress);
		},
		[value, validateAndUpdate],
	);

	const getValidationIcon = () => {
		if (!showValidation) return null;

		const hasAnyValue = Object.values(value).some((v) => v.trim());
		if (!hasAnyValue) return null;

		return validation.isValid ? (
			<Check className="h-4 w-4 text-green-600" />
		) : (
			<AlertCircle className="h-4 w-4 text-red-500" />
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<MapPin className="h-4 w-4 text-muted-foreground" />
				<Label className="text-sm font-medium">
					Địa chỉ {required && <span className="text-red-500 ml-1">*</span>}
				</Label>
				{getValidationIcon()}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Province Selection */}
				<div className="space-y-2">
					<Label htmlFor="province" className="text-sm">
						Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
					</Label>
					<Select
						value={value.province}
						onValueChange={(newValue) => updateField("province", newValue)}
						disabled={disabled}
					>
						<SelectTrigger>
							<SelectValue placeholder="Chọn tỉnh/thành phố" />
						</SelectTrigger>
						<SelectContent>
							{VIETNAMESE_PROVINCES.map((province) => (
								<SelectItem key={province} value={province}>
									{province}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* District Input */}
				<div className="space-y-2">
					<Label htmlFor="district" className="text-sm">
						Quận/Huyện {required && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id="district"
						value={value.district}
						onChange={(e) => updateField("district", e.target.value)}
						placeholder="Nhập quận/huyện"
						disabled={disabled}
					/>
				</div>

				{/* Ward Input */}
				<div className="space-y-2">
					<Label htmlFor="ward" className="text-sm">
						Phường/Xã {required && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id="ward"
						value={value.ward}
						onChange={(e) => updateField("ward", e.target.value)}
						placeholder="Nhập phường/xã"
						disabled={disabled}
					/>
				</div>

				{/* Address Details */}
				<div className="space-y-2">
					<Label htmlFor="details" className="text-sm">
						Địa chỉ chi tiết {required && <span className="text-red-500">*</span>}
					</Label>
					<Input
						id="details"
						value={value.details}
						onChange={(e) => updateField("details", e.target.value)}
						placeholder="Số nhà, tên đường..."
						disabled={disabled}
					/>
				</div>
			</div>

			{/* Validation Messages */}
			{showValidation && validation.error && (
				<div className="flex items-center gap-2 text-sm text-red-700">
					<AlertCircle className="h-3 w-3" />
					<span>{validation.error}</span>
				</div>
			)}

			{/* Formatted Address Preview */}
			{showValidation && validation.isValid && validation.formatted && (
				<div className="space-y-2">
					<Label className="text-xs text-muted-foreground">
						Địa chỉ đầy đủ:
					</Label>
					<div className="text-sm p-2 bg-muted rounded border">
						{validation.formatted.full}
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Compact address display component
 */
interface AddressDisplayProps {
	address: VietnameseAddressData;
	maxLength?: number;
	className?: string;
}

export function AddressDisplay({
	address,
	maxLength = 100,
	className = "",
}: AddressDisplayProps) {
	const fullAddress = [
		address.details?.trim(),
		address.ward?.trim(),
		address.district?.trim(),
		address.province?.trim(),
	]
		.filter(Boolean)
		.join(", ");

	const displayAddress =
		fullAddress.length > maxLength
			? `${fullAddress.substring(0, maxLength - 3)}...`
			: fullAddress;

	if (!fullAddress) {
		return (
			<span className={`text-muted-foreground italic ${className}`}>
				Chưa có địa chỉ
			</span>
		);
	}

	return (
		<span className={className} title={fullAddress}>
			{displayAddress}
		</span>
	);
}

/**
 * Address search/autocomplete component (for future enhancement)
 */
interface AddressSearchProps {
	onSelect: (address: VietnameseAddressData) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function AddressSearch({
	onSelect,
	placeholder = "Tìm kiếm địa chỉ...",
	disabled = false,
}: AddressSearchProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState<VietnameseAddressData[]>([]);

	// Placeholder for future integration with address APIs
	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term);
		// TODO: Integrate with Vietnamese address API service
		// For now, just clear suggestions
		setSuggestions([]);
	}, []);

	return (
		<div className="space-y-2">
			<Input
				value={searchTerm}
				onChange={(e) => handleSearch(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
			/>
			{suggestions.length > 0 && (
				<div className="border rounded bg-background shadow-lg">
					{suggestions.map((suggestion) => (
						<button
							type="button"
							key={`${suggestion.province}-${suggestion.district}-${suggestion.ward}-${suggestion.details}`}
							className="w-full p-2 text-left hover:bg-muted"
							onClick={() => {
								onSelect(suggestion);
								setSearchTerm("");
								setSuggestions([]);
							}}
						>
							<AddressDisplay address={suggestion} />
						</button>
					))}
				</div>
			)}
		</div>
	);
}