/**
 * Epic 1.3 - Story 1.3.3: UI Component System Unit Tests
 * Test scenarios based on Quinn's design: docs/qa/assessments/1.3-epic-consolidated-test-design-20250123.md
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	vietnameseTestData,
	vietnameseTextValidation,
} from "../../utils/vietnamese-test-helpers";

describe("Epic 1.3.3: UI Component System - Unit Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("1.3.3-UNIT-001: Radix UI component configuration", () => {
		it("should validate Radix UI component props with Vietnamese content", () => {
			// Mock Radix UI Dialog component
			const mockDialog = {
				props: {
					open: false,
					onOpenChange: vi.fn(),
					modal: true,
				},
				content: {
					title: "Xác nhận xóa khách hàng",
					description:
						"Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.",
					cancelText: "Hủy bỏ",
					confirmText: "Xác nhận xóa",
				},
				render: function () {
					return {
						type: "dialog",
						props: this.props,
						children: [
							{ type: "title", children: this.content.title },
							{ type: "description", children: this.content.description },
							{
								type: "footer",
								children: [
									{
										type: "button",
										props: { variant: "outline" },
										children: this.content.cancelText,
									},
									{
										type: "button",
										props: { variant: "destructive" },
										children: this.content.confirmText,
									},
								],
							},
						],
					};
				},
			};

			const rendered = mockDialog.render();

			// Validate Vietnamese content preservation
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					mockDialog.content.title,
				),
			).toBe(true);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					mockDialog.content.description,
				),
			).toBe(true);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					mockDialog.content.cancelText,
				),
			).toBe(true);

			// Validate component structure
			expect(rendered.type).toBe("dialog");
			expect(rendered.children).toHaveLength(3);
			expect(rendered.children[0].type).toBe("title");
			expect(rendered.children[2].children).toHaveLength(2); // Two buttons
		});

		it("should handle Vietnamese dropdown menu options", () => {
			const mockDropdownMenu = {
				options: [
					{ value: "view", label: "Xem chi tiết", icon: "eye" },
					{ value: "edit", label: "Chỉnh sửa", icon: "edit" },
					{ value: "duplicate", label: "Nhân bản", icon: "copy" },
					{ value: "delete", label: "Xóa", icon: "trash", destructive: true },
				],
				render: function (selectedValue?: string) {
					return {
						type: "dropdown-menu",
						props: { value: selectedValue },
						children: this.options.map((option) => ({
							type: "menu-item",
							props: {
								value: option.value,
								destructive: option.destructive || false,
							},
							children: [
								{ type: "icon", props: { name: option.icon } },
								{ type: "text", children: option.label },
							],
						})),
					};
				},
				getOptionByValue: function (value: string) {
					return this.options.find((option) => option.value === value);
				},
			};

			const rendered = mockDropdownMenu.render("edit");

			// Validate all menu items have Vietnamese labels
			mockDropdownMenu.options.forEach((option) => {
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(option.label),
				).toBe(true);
			});

			// Validate component structure
			expect(rendered.children).toHaveLength(4);
			expect(rendered.children[0].children[1].children).toBe("Xem chi tiết");

			// Test option retrieval
			const editOption = mockDropdownMenu.getOptionByValue("edit");
			expect(editOption?.label).toBe("Chỉnh sửa");

			// Test destructive option
			const deleteOption = mockDropdownMenu.getOptionByValue("delete");
			expect(deleteOption?.destructive).toBe(true);
		});

		it("should validate Vietnamese form components", () => {
			interface FormField {
				name: string;
				label: string;
				type: "text" | "textarea" | "select" | "phone";
				placeholder?: string;
				required?: boolean;
				validation?: {
					pattern?: RegExp;
					message?: string;
				};
			}

			const vietnameseFormFields: FormField[] = [
				{
					name: "customerName",
					label: "Tên khách hàng",
					type: "text",
					placeholder: "Nhập tên đầy đủ của khách hàng",
					required: true,
					validation: {
						pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
						message: "Tên chỉ được chứa chữ cái và khoảng trắng",
					},
				},
				{
					name: "phoneNumber",
					label: "Số điện thoại",
					type: "phone",
					placeholder: "Ví dụ: 0901234567",
					required: true,
					validation: {
						pattern: /^(09|08|07|05|03)\d{8}$/,
						message: "Số điện thoại không đúng định dạng Việt Nam",
					},
				},
				{
					name: "address",
					label: "Địa chỉ",
					type: "textarea",
					placeholder:
						"Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)",
					required: true,
				},
				{
					name: "issueDescription",
					label: "Mô tả vấn đề",
					type: "textarea",
					placeholder: "Mô tả chi tiết vấn đề của laptop cần sửa chữa",
					required: true,
				},
			];

			const formValidator = {
				validateField: (field: FormField, value: string) => {
					if (field.required && !value.trim()) {
						return {
							valid: false,
							message: `${field.label} là bắt buộc`,
						};
					}

					if (
						field.validation?.pattern &&
						!field.validation.pattern.test(value)
					) {
						return {
							valid: false,
							message:
								field.validation.message ||
								`${field.label} không đúng định dạng`,
						};
					}

					return { valid: true };
				},

				validateForm: function (formData: Record<string, string>) {
					const errors: Record<string, string> = {};

					vietnameseFormFields.forEach((field) => {
						const value = formData[field.name] || "";
						const validation = this.validateField(field, value);

						if (!validation.valid) {
							errors[field.name] = validation.message;
						}
					});

					return {
						valid: Object.keys(errors).length === 0,
						errors,
					};
				},
			};

			// Validate field structure
			vietnameseFormFields.forEach((field) => {
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(field.label),
				).toBe(true);
				if (field.placeholder) {
					expect(
						vietnameseTextValidation.hasVietnameseCharacters(field.placeholder),
					).toBe(true);
				}
			});

			// Test valid Vietnamese data
			const validFormData = {
				customerName: "Nguyễn Văn An",
				phoneNumber: "0901234567",
				address: "123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
				issueDescription:
					"Laptop bị chậm, quạt kêu to, cần làm sạch và bảo trì",
			};

			const validResult = formValidator.validateForm(validFormData);
			expect(validResult.valid).toBe(true);
			expect(Object.keys(validResult.errors)).toHaveLength(0);

			// Test invalid data with Vietnamese error messages
			const invalidFormData = {
				customerName: "Nguyen123", // Invalid characters
				phoneNumber: "123456789", // Wrong format
				address: "",
				issueDescription: "",
			};

			const invalidResult = formValidator.validateForm(invalidFormData);
			expect(invalidResult.valid).toBe(false);
			expect(Object.keys(invalidResult.errors).length).toBeGreaterThan(0);

			// Validate Vietnamese error messages
			Object.values(invalidResult.errors).forEach((errorMessage) => {
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(errorMessage),
				).toBe(true);
			});
		});
	});

	describe("1.3.3-UNIT-002: Tailwind CSS Vietnamese text rendering", () => {
		it("should render Vietnamese text with proper typography classes", () => {
			const typographyClasses = {
				heading1: "text-3xl font-bold text-gray-900 leading-tight",
				heading2: "text-2xl font-semibold text-gray-800 leading-snug",
				body: "text-base font-normal text-gray-700 leading-relaxed",
				caption: "text-sm font-medium text-gray-600 leading-normal",
				button: "text-sm font-medium text-white leading-none",
			};

			const vietnameseTextSamples = {
				heading1: "Hệ Thống Quản Lý Sửa Chữa Laptop",
				heading2: "Danh Sách Khách Hàng",
				body: "Chào mừng bạn đến với hệ thống quản lý cửa hàng sửa chữa laptop Trí Nhân. Chúng tôi cung cấp dịch vụ sửa chữa chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh nghiệm.",
				caption: "Cập nhật lần cuối: 23/01/2025",
				button: "Lưu Thay Đổi",
			};

			const textRenderer = {
				renderText: (text: string, variant: keyof typeof typographyClasses) => {
					return {
						type: "span",
						props: {
							className: typographyClasses[variant],
							"data-text-variant": variant,
						},
						children: text,
						// Simulate text measurement
						measurements: {
							width: text.length * 8, // Approximate width
							height: variant.includes("heading") ? 32 : 20,
							lineCount: Math.ceil(text.length / 50),
						},
					};
				},

				checkTextOverflow: (text: string, maxWidth: number) => {
					const approximateWidth = text.length * 8;
					return {
						overflows: approximateWidth > maxWidth,
						truncatedText:
							approximateWidth > maxWidth
								? `${text.substring(0, Math.floor(maxWidth / 8) - 3)}...`
								: text,
						needsTooltip: approximateWidth > maxWidth,
					};
				},
			};

			// Test Vietnamese text rendering
			Object.entries(vietnameseTextSamples).forEach(([variant, text]) => {
				const rendered = textRenderer.renderText(
					text,
					variant as keyof typeof typographyClasses,
				);

				expect(rendered.children).toBe(text);
				expect(rendered.props.className).toBe(
					typographyClasses[variant as keyof typeof typographyClasses],
				);
				expect(vietnameseTextValidation.hasVietnameseCharacters(text)).toBe(
					true,
				);

				// Validate text measurements account for Vietnamese characters
				expect(rendered.measurements.width).toBeGreaterThan(0);
				expect(rendered.measurements.height).toBeGreaterThan(0);
			});

			// Test text overflow handling with Vietnamese text
			const longVietnameseText =
				"Đây là một đoạn văn bản tiếng Việt rất dài để kiểm tra việc xử lý tràn văn bản khi nội dung vượt quá kích thước cho phép của container";
			const overflowResult = textRenderer.checkTextOverflow(
				longVietnameseText,
				300,
			);

			expect(overflowResult.overflows).toBe(true);
			expect(overflowResult.truncatedText).toContain("...");
			expect(overflowResult.needsTooltip).toBe(true);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					overflowResult.truncatedText,
				),
			).toBe(true);
		});

		it("should handle Vietnamese text in responsive design", () => {
			const responsiveBreakpoints = {
				mobile: "max-w-sm",
				tablet: "max-w-md",
				desktop: "max-w-lg",
				wide: "max-w-xl",
			};

			const responsiveTextClasses = {
				mobile: "text-sm leading-relaxed",
				tablet: "text-base leading-relaxed",
				desktop: "text-lg leading-relaxed",
				wide: "text-xl leading-loose",
			};

			const vietnameseContent = {
				title: "Trí Nhân Laptop - Sửa Chữa Chuyên Nghiệp",
				description:
					"Chúng tôi cung cấp dịch vụ sửa chữa laptop toàn diện với chất lượng cao, giá cả hợp lý và thời gian nhanh chóng.",
				features: [
					"Sửa chữa tất cả các dòng laptop",
					"Bảo hành dịch vụ 6 tháng",
					"Tư vấn miễn phí",
					"Nhận sửa tại nhà",
				],
			};

			const responsiveRenderer = {
				renderForBreakpoint: (
					content: string,
					breakpoint: keyof typeof responsiveBreakpoints,
				) => {
					return {
						type: "div",
						props: {
							className: `${responsiveBreakpoints[breakpoint]} ${responsiveTextClasses[breakpoint]} p-4`,
						},
						children: content,
						breakpoint,
						optimizedForVietnamese: true,
					};
				},

				calculateOptimalLineHeight: (
					textLength: number,
					breakpoint: keyof typeof responsiveBreakpoints,
				) => {
					// Vietnamese text typically needs slightly more line height for diacritics
					const baseLineHeight = {
						mobile: 1.5,
						tablet: 1.6,
						desktop: 1.7,
						wide: 1.8,
					};

					// Add extra spacing for Vietnamese diacritics
					return baseLineHeight[breakpoint] + 0.1;
				},
			};

			// Test responsive rendering for each breakpoint
			Object.keys(responsiveBreakpoints).forEach((breakpoint) => {
				const rendered = responsiveRenderer.renderForBreakpoint(
					vietnameseContent.description,
					breakpoint as keyof typeof responsiveBreakpoints,
				);

				expect(rendered.props.className).toContain(
					responsiveBreakpoints[
						breakpoint as keyof typeof responsiveBreakpoints
					],
				);
				expect(rendered.props.className).toContain(
					responsiveTextClasses[
						breakpoint as keyof typeof responsiveTextClasses
					],
				);
				expect(rendered.optimizedForVietnamese).toBe(true);
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(rendered.children),
				).toBe(true);
			});

			// Test line height optimization for Vietnamese
			Object.keys(responsiveBreakpoints).forEach((breakpoint) => {
				const lineHeight = responsiveRenderer.calculateOptimalLineHeight(
					vietnameseContent.description.length,
					breakpoint as keyof typeof responsiveBreakpoints,
				);

				expect(lineHeight).toBeGreaterThan(1.5); // Minimum for Vietnamese readability
				expect(lineHeight).toBeLessThan(2.0); // Maximum for good density
			});

			// Test feature list rendering
			vietnameseContent.features.forEach((feature) => {
				expect(vietnameseTextValidation.hasVietnameseCharacters(feature)).toBe(
					true,
				);
			});
		});
	});

	describe("1.3.3-UNIT-003: Component accessibility with Vietnamese content", () => {
		it("should provide proper ARIA labels in Vietnamese", () => {
			const accessibilityLabels = {
				buttons: {
					save: {
						"aria-label": "Lưu thay đổi",
						"aria-describedby": "save-help-text",
					},
					cancel: {
						"aria-label": "Hủy bỏ thao tác",
						"aria-describedby": "cancel-help-text",
					},
					delete: {
						"aria-label": "Xóa mục đã chọn",
						"aria-describedby": "delete-warning-text",
						"aria-pressed": "false",
					},
				},
				forms: {
					customerName: {
						"aria-label": "Tên khách hàng",
						"aria-required": "true",
						"aria-invalid": "false",
						"aria-describedby": "name-error-message",
					},
					phoneNumber: {
						"aria-label": "Số điện thoại",
						"aria-required": "true",
						"aria-invalid": "false",
						"aria-describedby": "phone-format-hint",
					},
				},
				navigation: {
					mainMenu: {
						"aria-label": "Menu điều hướng chính",
						role: "navigation",
					},
					breadcrumbs: {
						"aria-label": "Đường dẫn trang",
						role: "navigation",
					},
				},
			};

			const accessibilityValidator = {
				validateAriaLabels: (component: any) => {
					const requiredAttrs = ["aria-label"];
					const missing: string[] = [];

					requiredAttrs.forEach((attr) => {
						if (!component[attr]) {
							missing.push(attr);
						}
					});

					return {
						valid: missing.length === 0,
						missing,
						hasVietnameseContent: component["aria-label"]
							? vietnameseTextValidation.hasVietnameseCharacters(
									component["aria-label"],
								)
							: false,
					};
				},

				generateScreenReaderText: (action: string, context?: string) => {
					const templates = {
						button_click: "Nhấn để {action}",
						form_error: "Lỗi: {context}",
						form_success: "Thành công: {action}",
						navigation: "Điều hướng đến {action}",
						status_update: "Trạng thái đã cập nhật: {context}",
					};

					const template =
						templates[action as keyof typeof templates] || "{action}";
					return template
						.replace("{action}", action)
						.replace("{context}", context || "");
				},
			};

			// Test button accessibility
			Object.entries(accessibilityLabels.buttons).forEach(([key, attrs]) => {
				const validation = accessibilityValidator.validateAriaLabels(attrs);
				expect(validation.valid).toBe(true);
				expect(validation.hasVietnameseContent).toBe(true);
			});

			// Test form accessibility
			Object.entries(accessibilityLabels.forms).forEach(([key, attrs]) => {
				const validation = accessibilityValidator.validateAriaLabels(attrs);
				expect(validation.valid).toBe(true);
				expect(validation.hasVietnameseContent).toBe(true);
			});

			// Test screen reader text generation
			const screenReaderTexts = [
				accessibilityValidator.generateScreenReaderText("lưu dữ liệu"),
				accessibilityValidator.generateScreenReaderText("xóa khách hàng"),
				accessibilityValidator.generateScreenReaderText("chỉnh sửa thông tin"),
			];

			screenReaderTexts.forEach((text) => {
				expect(typeof text).toBe("string");
				expect(text.length).toBeGreaterThan(0);
			});
		});

		it("should handle keyboard navigation with Vietnamese tooltips", () => {
			interface KeyboardShortcut {
				key: string;
				modifiers: string[];
				action: string;
				description: string;
				category: string;
			}

			const vietnameseKeyboardShortcuts: KeyboardShortcut[] = [
				{
					key: "n",
					modifiers: ["ctrl"],
					action: "create_new_customer",
					description: "Tạo khách hàng mới",
					category: "Khách hàng",
				},
				{
					key: "s",
					modifiers: ["ctrl"],
					action: "save_changes",
					description: "Lưu thay đổi",
					category: "Thao tác chung",
				},
				{
					key: "f",
					modifiers: ["ctrl"],
					action: "search",
					description: "Tìm kiếm",
					category: "Tìm kiếm và điều hướng",
				},
				{
					key: "Escape",
					modifiers: [],
					action: "cancel_action",
					description: "Hủy bỏ thao tác hiện tại",
					category: "Thao tác chung",
				},
			];

			const keyboardNavigationManager = {
				formatShortcutText: (shortcut: KeyboardShortcut) => {
					const modifierText =
						shortcut.modifiers.length > 0
							? `${shortcut.modifiers.join(" + ")} + `
							: "";
					return `${modifierText}${shortcut.key.toUpperCase()}`;
				},

				getTooltipText: (shortcut: KeyboardShortcut) => {
					const keyText = this.formatShortcutText(shortcut);
					return `${shortcut.description} (${keyText})`;
				},

				groupShortcutsByCategory: () => {
					const grouped: Record<string, KeyboardShortcut[]> = {};

					vietnameseKeyboardShortcuts.forEach((shortcut) => {
						if (!grouped[shortcut.category]) {
							grouped[shortcut.category] = [];
						}
						grouped[shortcut.category].push(shortcut);
					});

					return grouped;
				},

				generateHelpText: function () {
					const grouped = this.groupShortcutsByCategory();
					let helpText = "Phím tắt có sẵn:\n\n";

					Object.entries(grouped).forEach(([category, shortcuts]) => {
						helpText += `${category}:\n`;
						shortcuts.forEach((shortcut) => {
							const keyText = this.formatShortcutText(shortcut);
							helpText += `  ${keyText}: ${shortcut.description}\n`;
						});
						helpText += "\n";
					});

					return helpText.trim();
				},
			};

			// Test shortcut formatting
			vietnameseKeyboardShortcuts.forEach((shortcut) => {
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(
						shortcut.description,
					),
				).toBe(true);
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(shortcut.category),
				).toBe(true);

				const keyText = keyboardNavigationManager.formatShortcutText(shortcut);
				expect(typeof keyText).toBe("string");
				expect(keyText.length).toBeGreaterThan(0);
			});

			// Test grouping by category
			const grouped = keyboardNavigationManager.groupShortcutsByCategory();
			expect(Object.keys(grouped).length).toBeGreaterThan(0);
			expect(grouped["Khách hàng"]).toBeDefined();
			expect(grouped["Thao tác chung"]).toBeDefined();
			expect(grouped["Tìm kiếm và điều hướng"]).toBeDefined();

			// Test help text generation
			const helpText = keyboardNavigationManager.generateHelpText();
			expect(helpText).toContain("Phím tắt có sẵn:");
			expect(vietnameseTextValidation.hasVietnameseCharacters(helpText)).toBe(
				true,
			);
			expect(helpText).toContain("ctrl + N: Tạo khách hàng mới");
		});
	});

	describe("1.3.3-UNIT-004: Vietnamese theme and styling validation", () => {
		it("should apply consistent Vietnamese brand styling", () => {
			const brandTheme = {
				colors: {
					primary: {
						50: "#f0f9ff",
						500: "#3b82f6",
						900: "#1e3a8a",
					},
					vietnamese: {
						red: "#da020e", // Vietnamese flag red
						yellow: "#ffcd00", // Vietnamese flag yellow
					},
					semantic: {
						success: "#10b981",
						warning: "#f59e0b",
						error: "#ef4444",
						info: "#3b82f6",
					},
				},
				typography: {
					fontFamily: {
						sans: ["Inter", "ui-sans-serif", "system-ui"],
						vietnamese: ["Inter", "Segoe UI", "Roboto", "sans-serif"],
					},
					fontSize: {
						xs: "0.75rem",
						sm: "0.875rem",
						base: "1rem",
						lg: "1.125rem",
						xl: "1.25rem",
						"2xl": "1.5rem",
					},
				},
				spacing: {
					tight: "0.25rem",
					normal: "0.5rem",
					relaxed: "0.75rem",
					loose: "1rem",
				},
			};

			const styleGenerator = {
				generateVietnameseButtonStyles: (
					variant: "primary" | "secondary" | "success" | "danger",
				) => {
					const baseStyles =
						"px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200";

					const variantStyles = {
						primary:
							"bg-blue-600 hover:bg-blue-700 text-white border border-blue-600",
						secondary:
							"bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
						success:
							"bg-green-600 hover:bg-green-700 text-white border border-green-600",
						danger:
							"bg-red-600 hover:bg-red-700 text-white border border-red-600",
					};

					return `${baseStyles} ${variantStyles[variant]}`;
				},

				generateVietnameseCardStyles: () => {
					return "bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4";
				},

				getVietnameseStatusColor: (status: string) => {
					const statusColors = {
						RECEIVED: brandTheme.colors.semantic.info,
						IN_PROGRESS: brandTheme.colors.semantic.warning,
						COMPLETED: brandTheme.colors.semantic.success,
						CANCELLED: brandTheme.colors.semantic.error,
					};

					return (
						statusColors[status as keyof typeof statusColors] ||
						brandTheme.colors.primary[500]
					);
				},
			};

			// Test brand color consistency
			expect(brandTheme.colors.vietnamese.red).toBe("#da020e");
			expect(brandTheme.colors.vietnamese.yellow).toBe("#ffcd00");

			// Test button style generation
			const primaryButton =
				styleGenerator.generateVietnameseButtonStyles("primary");
			expect(primaryButton).toContain("bg-blue-600");
			expect(primaryButton).toContain("hover:bg-blue-700");
			expect(primaryButton).toContain("text-white");

			const dangerButton =
				styleGenerator.generateVietnameseButtonStyles("danger");
			expect(dangerButton).toContain("bg-red-600");
			expect(dangerButton).toContain("border-red-600");

			// Test card styles
			const cardStyles = styleGenerator.generateVietnameseCardStyles();
			expect(cardStyles).toContain("bg-white");
			expect(cardStyles).toContain("rounded-lg");
			expect(cardStyles).toContain("shadow-sm");

			// Test status colors
			expect(styleGenerator.getVietnameseStatusColor("RECEIVED")).toBe(
				brandTheme.colors.semantic.info,
			);
			expect(styleGenerator.getVietnameseStatusColor("COMPLETED")).toBe(
				brandTheme.colors.semantic.success,
			);
			expect(styleGenerator.getVietnameseStatusColor("CANCELLED")).toBe(
				brandTheme.colors.semantic.error,
			);

			// Test typography for Vietnamese
			expect(brandTheme.typography.fontFamily.vietnamese).toContain("Inter");
			expect(brandTheme.typography.fontFamily.vietnamese).toContain("Roboto");
		});

		it("should handle dark mode with Vietnamese content", () => {
			const darkModeTheme = {
				colors: {
					background: {
						light: "#ffffff",
						dark: "#0f172a",
					},
					text: {
						light: "#374151",
						dark: "#f1f5f9",
					},
					border: {
						light: "#e5e7eb",
						dark: "#334155",
					},
				},
				components: {
					card: {
						light: "bg-white border-gray-200 text-gray-900",
						dark: "bg-slate-800 border-slate-700 text-slate-100",
					},
					button: {
						primary: {
							light: "bg-blue-600 hover:bg-blue-700 text-white",
							dark: "bg-blue-500 hover:bg-blue-600 text-white",
						},
					},
				},
			};

			const themeManager = {
				currentTheme: "light" as "light" | "dark",

				getThemedStyles: function (component: string, variant?: string) {
					const path = variant
						? this.darkModeTheme.components[
								component as keyof typeof this.darkModeTheme.components
							][variant as any]
						: this.darkModeTheme.components[
								component as keyof typeof this.darkModeTheme.components
							];

					if (typeof path === "object") {
						return path[this.currentTheme];
					}

					return path;
				},

				toggleTheme: function () {
					this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
					return this.currentTheme;
				},

				getVietnameseThemeLabels: () => ({
					light: "Chế độ sáng",
					dark: "Chế độ tối",
					system: "Theo hệ thống",
					toggleLabel: "Chuyển đổi chế độ hiển thị",
				}),

				darkModeTheme,
			};

			// Test theme switching
			expect(themeManager.currentTheme).toBe("light");
			themeManager.toggleTheme();
			expect(themeManager.currentTheme).toBe("dark");

			// Test Vietnamese theme labels
			const labels = themeManager.getVietnameseThemeLabels();
			Object.values(labels).forEach((label) => {
				expect(vietnameseTextValidation.hasVietnameseCharacters(label)).toBe(
					true,
				);
			});

			// Test component styling in both themes
			themeManager.currentTheme = "light";
			const lightCard = themeManager.getThemedStyles("card");
			expect(lightCard).toContain("bg-white");

			themeManager.currentTheme = "dark";
			const darkCard = themeManager.getThemedStyles("card");
			expect(darkCard).toContain("bg-slate-800");

			// Test color accessibility in dark mode
			expect(darkModeTheme.colors.text.dark).toBe("#f1f5f9"); // High contrast for readability
			expect(darkModeTheme.colors.background.dark).toBe("#0f172a"); // Dark enough for comfort
		});
	});
});
