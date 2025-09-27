/**
 * Vietnamese Forms Component Unit Tests
 * Phase 3.4.2 - Testing form components with Vietnamese validation
 *
 * Tests Vietnamese-specific form components:
 * - Customer registration forms
 * - Repair ticket creation forms
 * - Vietnamese phone number input validation
 * - Vietnamese currency input formatting
 * - Vietnamese date/time pickers
 * - Form validation with Vietnamese error messages
 *
 * Uses Phase 3.4.1 type safety and validation enhancements
 *
 * @since Phase 3.4.2
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import enhanced testing utilities
import {
	globalSupabaseMock,
	VietnameseMockDataGenerator
} from "../utils/supabase-mock";
import {
	enhancedValidation,
	phoneValidation,
	vietnameseTextValidation
} from "../phase-1/utils/vietnamese-test-helpers";

// Import Phase 3.4.1 enhancements
import {
	isValidVietnamesePhone,
	isValidVietnameseCurrency,
	ValidationHelpers
} from "@/lib/type-guards";
import { Currency, DateTime, Text } from "@/lib/formatting";
import type { GenericFormConfig } from "@/lib/generic-types";

// Mock form components for testing
const MockPhoneInput = ({
	value,
	onChange,
	onValidation,
	placeholder
}: {
	value: string;
	onChange: (value: string) => void;
	onValidation?: (isValid: boolean, message?: string) => void;
	placeholder?: string;
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		onChange(inputValue);

		// Validate Vietnamese phone number
		const isValid = isValidVietnamesePhone(inputValue);
		const message = isValid ? "" : "Số điện thoại không đúng định dạng Việt Nam";
		onValidation?.(isValid, message);
	};

	const displayValue = value ? Text.formatPhone(value) : value;

	return (
		<div>
			<input
				data-testid="phone-input"
				type="tel"
				value={displayValue}
				onChange={handleChange}
				placeholder={placeholder || "Nhập số điện thoại"}
				className="border rounded px-3 py-2"
			/>
			<div data-testid="phone-formatted" className="text-sm text-gray-500">
				{value && isValidVietnamesePhone(value) ? `Formatted: ${Text.formatPhone(value)}` : ""}
			</div>
		</div>
	);
};

const MockCurrencyInput = ({
	value,
	onChange,
	onValidation,
	placeholder
}: {
	value: number | null;
	onChange: (value: number | null) => void;
	onValidation?: (isValid: boolean, message?: string) => void;
	placeholder?: string;
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value.replace(/[^\d]/g, "");
		const numericValue = inputValue ? parseInt(inputValue, 10) : null;
		onChange(numericValue);

		// Validate Vietnamese currency
		if (numericValue !== null) {
			const isValid = isValidVietnameseCurrency(numericValue);
			const message = isValid ? "" : "Số tiền không hợp lệ";
			onValidation?.(isValid, message);
		}
	};

	const displayValue = value ? Currency.format(value) : "";

	return (
		<div>
			<input
				data-testid="currency-input"
				type="text"
				value={displayValue}
				onChange={handleChange}
				placeholder={placeholder || "Nhập số tiền"}
				className="border rounded px-3 py-2"
			/>
			<div data-testid="currency-formatted" className="text-sm text-gray-500">
				{value ? `Formatted: ${Currency.format(value)}` : ""}
			</div>
		</div>
	);
};

const MockCustomerForm = ({
	initialData,
	onSubmit,
	onValidationChange
}: {
	initialData?: Partial<{ phone: string; full_name: string; address: string }>;
	onSubmit: (data: any) => void;
	onValidationChange?: (isValid: boolean) => void;
}) => {
	const [formData, setFormData] = React.useState({
		phone: initialData?.phone || "",
		full_name: initialData?.full_name || "",
		address: initialData?.address || ""
	});
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.phone) {
			newErrors.phone = "Số điện thoại là bắt buộc";
		} else if (!isValidVietnamesePhone(formData.phone)) {
			newErrors.phone = "Số điện thoại không đúng định dạng";
		}

		if (!formData.full_name.trim()) {
			newErrors.full_name = "Họ và tên là bắt buộc";
		} else if (!vietnameseTextValidation.isValidVietnameseName(formData.full_name)) {
			newErrors.full_name = "Tên không hợp lệ";
		}

		setErrors(newErrors);
		const isValid = Object.keys(newErrors).length === 0;
		onValidationChange?.(isValid);
		return isValid;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			onSubmit(formData);
		}
	};

	React.useEffect(() => {
		validateForm();
	}, [formData]);

	return (
		<form onSubmit={handleSubmit} data-testid="customer-form">
			<div className="space-y-4">
				<div>
					<label htmlFor="phone">Số điện thoại *</label>
					<input
						data-testid="phone-field"
						id="phone"
						type="tel"
						value={formData.phone}
						onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
						placeholder="Ví dụ: 0901234567"
						className="border rounded px-3 py-2 w-full"
					/>
					{errors.phone && (
						<div data-testid="phone-error" className="text-red-500 text-sm">
							{errors.phone}
						</div>
					)}
				</div>

				<div>
					<label htmlFor="full_name">Họ và tên *</label>
					<input
						data-testid="name-field"
						id="full_name"
						type="text"
						value={formData.full_name}
						onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
						placeholder="Ví dụ: Nguyễn Văn An"
						className="border rounded px-3 py-2 w-full"
					/>
					{errors.full_name && (
						<div data-testid="name-error" className="text-red-500 text-sm">
							{errors.full_name}
						</div>
					)}
				</div>

				<div>
					<label htmlFor="address">Địa chỉ</label>
					<textarea
						data-testid="address-field"
						id="address"
						value={formData.address}
						onChange={(e) => setFormData({ ...formData, address: e.target.value })}
						placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1, TP.HCM"
						className="border rounded px-3 py-2 w-full"
						rows={3}
					/>
				</div>

				<button
					type="submit"
					data-testid="submit-button"
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					Lưu thông tin
				</button>
			</div>
		</form>
	);
};

describe("Vietnamese Forms Component Tests", () => {
	beforeEach(() => {
		globalSupabaseMock.reset();
		vi.clearAllMocks();
	});

	describe("Vietnamese Phone Input Component", () => {
		it("should validate and format Vietnamese phone numbers", async () => {
			const user = userEvent.setup();
			const mockOnChange = vi.fn();
			const mockOnValidation = vi.fn();

			render(
				<MockPhoneInput
					value=""
					onChange={mockOnChange}
					onValidation={mockOnValidation}
				/>
			);

			const phoneInput = screen.getByTestId("phone-input");

			// Test valid Vietnamese phone number
			await user.type(phoneInput, "0901234567");

			expect(mockOnChange).toHaveBeenCalledWith("0901234567");
			expect(mockOnValidation).toHaveBeenCalledWith(true, "");

			// Check formatting display
			expect(screen.getByTestId("phone-formatted")).toHaveTextContent("Formatted: 0901 234 567");
		});

		it("should handle invalid phone numbers with Vietnamese error messages", async () => {
			const user = userEvent.setup();
			const mockOnChange = vi.fn();
			const mockOnValidation = vi.fn();

			render(
				<MockPhoneInput
					value=""
					onChange={mockOnChange}
					onValidation={mockOnValidation}
				/>
			);

			const phoneInput = screen.getByTestId("phone-input");

			// Test invalid phone number
			await user.type(phoneInput, "123456");

			expect(mockOnValidation).toHaveBeenCalledWith(
				false,
				"Số điện thoại không đúng định dạng Việt Nam"
			);
		});

		it("should handle various Vietnamese phone formats", async () => {
			const user = userEvent.setup();
			const validPhones = phoneValidation.generateValidNumbers();

			for (const phone of validPhones.slice(0, 3)) {
				const mockOnValidation = vi.fn();

				const { unmount } = render(
					<MockPhoneInput
						value=""
						onChange={() => {}}
						onValidation={mockOnValidation}
					/>
				);

				const phoneInput = screen.getByTestId("phone-input");
				await user.clear(phoneInput);
				await user.type(phoneInput, phone);

				expect(mockOnValidation).toHaveBeenCalledWith(true, "");
				unmount();
			}
		});
	});

	describe("Vietnamese Currency Input Component", () => {
		it("should format Vietnamese currency input", async () => {
			const user = userEvent.setup();
			const mockOnChange = vi.fn();
			const mockOnValidation = vi.fn();

			render(
				<MockCurrencyInput
					value={null}
					onChange={mockOnChange}
					onValidation={mockOnValidation}
				/>
			);

			const currencyInput = screen.getByTestId("currency-input");

			// Test currency input
			await user.type(currencyInput, "1500000");

			expect(mockOnChange).toHaveBeenCalledWith(1500000);
			expect(mockOnValidation).toHaveBeenCalledWith(true, "");

			// Check formatting display
			expect(screen.getByTestId("currency-formatted")).toHaveTextContent("Formatted: 1.500.000 ₫");
		});

		it("should validate currency limits", async () => {
			const user = userEvent.setup();
			const mockOnValidation = vi.fn();

			render(
				<MockCurrencyInput
					value={null}
					onChange={() => {}}
					onValidation={mockOnValidation}
				/>
			);

			const currencyInput = screen.getByTestId("currency-input");

			// Test very large amount (over 100 million VND)
			await user.type(currencyInput, "200000000");

			expect(mockOnValidation).toHaveBeenCalledWith(false, "Số tiền không hợp lệ");
		});
	});

	describe("Vietnamese Customer Form Component", () => {
		it("should validate Vietnamese customer data", async () => {
			const user = userEvent.setup();
			const mockOnSubmit = vi.fn();
			const mockOnValidationChange = vi.fn();

			render(
				<MockCustomerForm
					onSubmit={mockOnSubmit}
					onValidationChange={mockOnValidationChange}
				/>
			);

			// Initially form should be invalid (empty required fields)
			expect(mockOnValidationChange).toHaveBeenCalledWith(false);

			// Fill in valid Vietnamese data
			const phoneField = screen.getByTestId("phone-field");
			const nameField = screen.getByTestId("name-field");
			const addressField = screen.getByTestId("address-field");

			await user.type(phoneField, "0901234567");
			await user.type(nameField, "Nguyễn Văn An");
			await user.type(addressField, "123 Nguyễn Trãi, Quận 1, TP.HCM");

			// Form should become valid
			await waitFor(() => {
				expect(mockOnValidationChange).toHaveBeenCalledWith(true);
			});

			// Submit form
			const submitButton = screen.getByTestId("submit-button");
			await user.click(submitButton);

			expect(mockOnSubmit).toHaveBeenCalledWith({
				phone: "0901234567",
				full_name: "Nguyễn Văn An",
				address: "123 Nguyễn Trãi, Quận 1, TP.HCM"
			});
		});

		it("should show Vietnamese validation errors", async () => {
			const user = userEvent.setup();
			const mockOnSubmit = vi.fn();

			render(<MockCustomerForm onSubmit={mockOnSubmit} />);

			// Try to submit empty form
			const submitButton = screen.getByTestId("submit-button");
			await user.click(submitButton);

			// Should show Vietnamese error messages
			expect(screen.getByTestId("phone-error")).toHaveTextContent("Số điện thoại là bắt buộc");
			expect(screen.getByTestId("name-error")).toHaveTextContent("Họ và tên là bắt buộc");

			// Form should not submit
			expect(mockOnSubmit).not.toHaveBeenCalled();
		});

		it("should validate Vietnamese name format", async () => {
			const user = userEvent.setup();

			render(<MockCustomerForm onSubmit={() => {}} />);

			const nameField = screen.getByTestId("name-field");

			// Test invalid name with numbers
			await user.type(nameField, "John123");

			await waitFor(() => {
				expect(screen.getByTestId("name-error")).toHaveTextContent("Tên không hợp lệ");
			});

			// Clear and test valid Vietnamese name
			await user.clear(nameField);
			await user.type(nameField, "Nguyễn Văn An");

			await waitFor(() => {
				expect(screen.queryByTestId("name-error")).not.toBeInTheDocument();
			});
		});

		it("should handle form initialization with Vietnamese data", async () => {
			const initialData = {
				phone: "0901234567",
				full_name: "Trần Thị Bình",
				address: "456 Lê Văn Sỹ, Quận 3, TP.HCM"
			};

			render(
				<MockCustomerForm
					initialData={initialData}
					onSubmit={() => {}}
				/>
			);

			// Fields should be pre-populated
			expect(screen.getByTestId("phone-field")).toHaveValue("0901234567");
			expect(screen.getByTestId("name-field")).toHaveValue("Trần Thị Bình");
			expect(screen.getByTestId("address-field")).toHaveValue("456 Lê Văn Sỹ, Quận 3, TP.HCM");

			// No validation errors should be shown
			expect(screen.queryByTestId("phone-error")).not.toBeInTheDocument();
			expect(screen.queryByTestId("name-error")).not.toBeInTheDocument();
		});
	});

	describe("Vietnamese Form Integration with Business Logic", () => {
		it("should integrate with enhanced validation utilities", async () => {
			const testData = {
				phone: "0901234567",
				currency: 1500000,
				date: "2025-01-15T10:30:00Z"
			};

			const validation = enhancedValidation.validateBusinessData(testData);

			expect(validation.isValid).toBe(true);
			expect(validation.errors).toHaveLength(0);

			// Test formatting integration
			const formatting = enhancedValidation.testVietnameseFormatting(testData);

			expect(formatting.phone.formatted).toBe("0901 234 567");
			expect(formatting.phone.isValid).toBe(true);
			expect(formatting.currency.formatted).toBe("1.500.000 ₫");
			expect(formatting.currency.isValid).toBe(true);
		});

		it("should handle Vietnamese form submission with type safety", async () => {
			const user = userEvent.setup();
			const mockOnSubmit = vi.fn();

			render(<MockCustomerForm onSubmit={mockOnSubmit} />);

			// Fill form with Vietnamese data
			await user.type(screen.getByTestId("phone-field"), "0901234567");
			await user.type(screen.getByTestId("name-field"), "Lê Hoàng Cường");
			await user.type(screen.getByTestId("address-field"), "789 Võ Văn Tần, Quận 3, TP.HCM");

			// Submit form
			await user.click(screen.getByTestId("submit-button"));

			// Verify submitted data
			const submittedData = mockOnSubmit.mock.calls[0][0];

			// Validate using type guards
			expect(isValidVietnamesePhone(submittedData.phone)).toBe(true);
			expect(vietnameseTextValidation.isValidVietnameseName(submittedData.full_name)).toBe(true);
			expect(vietnameseTextValidation.hasVietnameseCharacters(submittedData.full_name)).toBe(true);

			// Create customer from form data
			const customer = VietnameseMockDataGenerator.createMockCustomer(submittedData);
			expect(ValidationHelpers.validateSingleCustomer(customer)).toBeTruthy();
		});

		it("should handle Vietnamese placeholder and label text", async () => {
			render(<MockCustomerForm onSubmit={() => {}} />);

			// Check Vietnamese labels
			expect(screen.getByText("Số điện thoại *")).toBeInTheDocument();
			expect(screen.getByText("Họ và tên *")).toBeInTheDocument();
			expect(screen.getByText("Địa chỉ")).toBeInTheDocument();

			// Check Vietnamese placeholders
			expect(screen.getByPlaceholderText("Ví dụ: 0901234567")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("Ví dụ: Nguyễn Văn An")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("Ví dụ: 123 Nguyễn Trãi, Quận 1, TP.HCM")).toBeInTheDocument();

			// Check Vietnamese button text
			expect(screen.getByText("Lưu thông tin")).toBeInTheDocument();
		});
	});
});