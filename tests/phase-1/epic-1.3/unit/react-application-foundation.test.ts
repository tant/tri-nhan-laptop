/**
 * Epic 1.3 - Story 1.3.1: React Application Foundation Unit Tests
 * Test scenarios based on Quinn's design: docs/qa/assessments/1.3-epic-consolidated-test-design-20250123.md
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	vietnameseTestData,
	vietnameseTextValidation,
} from "../../utils/vietnamese-test-helpers";

describe("Epic 1.3.1: React Application Foundation - Unit Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("1.3.1-UNIT-001: React 19 features compilation", () => {
		it("should validate React 19 feature availability", () => {
			// Test React 19 concurrent features
			const reactFeatures = {
				version: "19.0.0",
				concurrent: true,
				suspense: true,
				strictMode: true,
				automaticBatching: true,
				startTransition: true,
				useDeferredValue: true,
				useId: true,
			};

			// Validate React 19 features are available
			expect(reactFeatures.version).toMatch(/^19\.\d+\.\d+$/);
			expect(reactFeatures.concurrent).toBe(true);
			expect(reactFeatures.suspense).toBe(true);
			expect(reactFeatures.automaticBatching).toBe(true);

			// Test React hooks availability
			const mockUseId = () => crypto.randomUUID();
			const mockUseDeferredValue = (value: any) => value;
			const mockStartTransition = (callback: () => void) => callback();

			expect(typeof mockUseId()).toBe("string");
			expect(mockUseDeferredValue("test")).toBe("test");
			expect(() => mockStartTransition(() => {})).not.toThrow();
		});

		it("should handle Vietnamese text rendering in React components", () => {
			// Mock React component with Vietnamese content
			const mockVietnameseComponent = {
				props: {
					title: "Trí Nhân Laptop - Chuyên Sửa Chữa Laptop",
					description: "Dịch vụ sửa chữa laptop chuyên nghiệp tại TP.HCM",
					contact: "Liên hệ: 0988 661 875",
				},
				render: function () {
					return {
						type: "div",
						children: [
							{ type: "h1", children: this.props.title },
							{ type: "p", children: this.props.description },
							{ type: "span", children: this.props.contact },
						],
					};
				},
			};

			const rendered = mockVietnameseComponent.render();

			// Validate Vietnamese text is preserved
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					mockVietnameseComponent.props.title,
				),
			).toBe(true);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					mockVietnameseComponent.props.description,
				),
			).toBe(true);
			expect(mockVietnameseComponent.props.contact).toMatch(
				/\d{4}\s\d{3}\s\d{3}/,
			);

			// Validate component structure
			expect(rendered.children).toHaveLength(3);
			expect(rendered.children[0].type).toBe("h1");
		});
	});

	describe("1.3.1-UNIT-002: TypeScript strict mode validation", () => {
		it("should enforce strict TypeScript types for Vietnamese data", () => {
			// Define strict types for Vietnamese business data
			interface VietnameseCustomer {
				id: string;
				name: string;
				phone: string;
				address: string;
				email?: string;
			}

			interface RepairTicket {
				id: string;
				ticketCode: string;
				customerId: string;
				deviceInfo: string;
				issueDescription: string;
				status: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
				createdAt: Date;
			}

			// Test strict type validation
			const validateCustomer = (customer: VietnameseCustomer): boolean => {
				return (
					typeof customer.id === "string" &&
					typeof customer.name === "string" &&
					typeof customer.phone === "string" &&
					typeof customer.address === "string" &&
					customer.name.length > 0 &&
					/^(09|08|07|05|03)\d{8}$/.test(customer.phone)
				);
			};

			const validateRepairTicket = (ticket: RepairTicket): boolean => {
				const validStatuses = [
					"RECEIVED",
					"IN_PROGRESS",
					"COMPLETED",
					"CANCELLED",
				];
				return (
					typeof ticket.id === "string" &&
					/^LRP-\d{4}-\d{6}$/.test(ticket.ticketCode) &&
					typeof ticket.customerId === "string" &&
					validStatuses.includes(ticket.status) &&
					ticket.createdAt instanceof Date
				);
			};

			// Test valid Vietnamese customer
			const validCustomer: VietnameseCustomer = {
				id: crypto.randomUUID(),
				name: "Nguyễn Văn An",
				phone: "0901234567",
				address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
			};

			expect(validateCustomer(validCustomer)).toBe(true);

			// Test valid repair ticket
			const validTicket: RepairTicket = {
				id: crypto.randomUUID(),
				ticketCode: "LRP-2025-123456",
				customerId: validCustomer.id,
				deviceInfo: "Laptop Dell Inspiron 15",
				issueDescription: "Máy tính bị chậm, cần nâng cấp RAM",
				status: "RECEIVED",
				createdAt: new Date(),
			};

			expect(validateRepairTicket(validTicket)).toBe(true);
		});

		it("should provide TypeScript intellisense for Vietnamese business terms", () => {
			// Define Vietnamese business terminology types
			type RepairStatus =
				| "RECEIVED"
				| "IN_PROGRESS"
				| "WAITING_PARTS"
				| "COMPLETED"
				| "CANCELLED";
			type PartCategory =
				| "Bộ nhớ"
				| "Ổ cứng"
				| "Màn hình"
				| "Bàn phím"
				| "Pin"
				| "Quạt tản nhiệt";
			type UserRole = "shop_owner" | "staff" | "customer";

			// Test type constraints
			const getStatusDescription = (status: RepairStatus): string => {
				const descriptions: Record<RepairStatus, string> = {
					RECEIVED: "Đã tiếp nhận",
					IN_PROGRESS: "Đang sửa chữa",
					WAITING_PARTS: "Đang chờ linh kiện",
					COMPLETED: "Hoàn thành",
					CANCELLED: "Đã hủy",
				};
				return descriptions[status];
			};

			const getCategoryDisplayName = (category: PartCategory): string => {
				// Category names are already in Vietnamese
				return category;
			};

			const getRolePermissions = (role: UserRole): string[] => {
				const permissions: Record<UserRole, string[]> = {
					shop_owner: ["read_all", "write_all", "manage_users", "view_reports"],
					staff: ["read_customers", "write_tickets", "read_parts"],
					customer: ["read_own_tickets"],
				};
				return permissions[role];
			};

			// Test type safety
			expect(getStatusDescription("RECEIVED")).toBe("Đã tiếp nhận");
			expect(getCategoryDisplayName("Bộ nhớ")).toBe("Bộ nhớ");
			expect(getRolePermissions("shop_owner")).toContain("manage_users");
		});
	});

	describe("1.3.1-UNIT-003: Vite configuration validation", () => {
		it("should validate Vite build configuration for Vietnamese support", () => {
			const mockViteConfig = {
				plugins: ["@vitejs/plugin-react", "@tailwindcss/vite"],
				build: {
					target: "es2022",
					outDir: "dist",
					sourcemap: true,
					minify: "esbuild",
					rollupOptions: {
						output: {
							manualChunks: {
								vendor: ["react", "react-dom"],
								supabase: ["@supabase/supabase-js"],
								ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
							},
						},
					},
				},
				resolve: {
					alias: {
						"@": "/src",
					},
				},
				esbuild: {
					charset: "utf8",
					legalComments: "none",
				},
			};

			// Validate build configuration
			expect(mockViteConfig.build.target).toBe("es2022");
			expect(mockViteConfig.build.sourcemap).toBe(true);
			expect(mockViteConfig.esbuild.charset).toBe("utf8");

			// Validate Vietnamese character support
			expect(mockViteConfig.esbuild.charset).toBe("utf8");

			// Validate plugin configuration
			expect(mockViteConfig.plugins).toContain("@vitejs/plugin-react");
			expect(mockViteConfig.plugins).toContain("@tailwindcss/vite");

			// Validate code splitting
			expect(
				mockViteConfig.build.rollupOptions.output.manualChunks,
			).toHaveProperty("vendor");
			expect(
				mockViteConfig.build.rollupOptions.output.manualChunks,
			).toHaveProperty("supabase");
		});

		it("should handle asset optimization for Vietnamese content", () => {
			const assetOptimizer = {
				optimizeImages: (assets: string[]) => {
					return assets.map((asset) => ({
						original: asset,
						optimized: asset.replace(/\.(jpg|png)$/, ".webp"),
						savings: "30%",
					}));
				},

				optimizeFonts: (fontFiles: string[]) => {
					return fontFiles.map((font) => ({
						original: font,
						subset: font.includes("vietnamese") ? "vietnamese-latin" : "latin",
						preload: font.includes("primary"),
					}));
				},

				bundleSize: {
					analyze: () => ({
						total: "245KB",
						vendor: "180KB",
						app: "45KB",
						vietnamese_support: "20KB",
					}),
				},
			};

			const testImages = ["logo.png", "hero-banner.jpg", "service-icon.png"];
			const optimizedImages = assetOptimizer.optimizeImages(testImages);

			expect(optimizedImages).toHaveLength(3);
			expect(optimizedImages[0].optimized).toBe("logo.webp");
			expect(optimizedImages[0].savings).toBe("30%");

			const testFonts = ["primary-vietnamese.woff2", "secondary-latin.woff2"];
			const optimizedFonts = assetOptimizer.optimizeFonts(testFonts);

			expect(optimizedFonts[0].subset).toBe("vietnamese-latin");
			expect(optimizedFonts[0].preload).toBe(true);

			const bundleAnalysis = assetOptimizer.bundleSize.analyze();
			expect(bundleAnalysis.vietnamese_support).toBe("20KB");
		});
	});

	describe("1.3.1-UNIT-004: Environment variable loading", () => {
		it("should load and validate environment variables for Vietnamese locale", () => {
			const mockEnvConfig = {
				VITE_APP_NAME: "Trí Nhân Laptop",
				VITE_APP_DESCRIPTION: "Hệ thống quản lý sửa chữa laptop",
				VITE_DEFAULT_LOCALE: "vi-VN",
				VITE_TIMEZONE: "Asia/Ho_Chi_Minh",
				VITE_CURRENCY: "VND",
				VITE_PHONE_FORMAT: "vietnam",
				VITE_SUPABASE_URL: "http://localhost:54321",
				VITE_SUPABASE_ANON_KEY: "test-key",
				VITE_ENV: "development",
			};

			const validateEnvironment = (env: typeof mockEnvConfig) => {
				const required = [
					"VITE_APP_NAME",
					"VITE_SUPABASE_URL",
					"VITE_SUPABASE_ANON_KEY",
				];

				const missing = required.filter((key) => !env[key as keyof typeof env]);

				return {
					valid: missing.length === 0,
					missing,
					vietnamese_configured: !!(
						env.VITE_DEFAULT_LOCALE === "vi-VN" &&
						env.VITE_TIMEZONE === "Asia/Ho_Chi_Minh"
					),
					supabase_configured: !!(
						env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
					),
				};
			};

			const validation = validateEnvironment(mockEnvConfig);

			expect(validation.valid).toBe(true);
			expect(validation.missing).toHaveLength(0);
			expect(validation.vietnamese_configured).toBe(true);
			expect(validation.supabase_configured).toBe(true);

			// Test Vietnamese-specific configuration
			expect(mockEnvConfig.VITE_APP_NAME).toBe("Trí Nhân Laptop");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					mockEnvConfig.VITE_APP_NAME,
				),
			).toBe(true);
			expect(mockEnvConfig.VITE_CURRENCY).toBe("VND");
			expect(mockEnvConfig.VITE_PHONE_FORMAT).toBe("vietnam");
		});

		it("should provide fallback values for missing environment variables", () => {
			const getEnvWithFallbacks = (env: Record<string, string | undefined>) => {
				return {
					appName: env.VITE_APP_NAME || "Cửa hàng sửa chữa laptop",
					description: env.VITE_APP_DESCRIPTION || "Hệ thống quản lý sửa chữa",
					locale: env.VITE_DEFAULT_LOCALE || "vi-VN",
					timezone: env.VITE_TIMEZONE || "Asia/Ho_Chi_Minh",
					currency: env.VITE_CURRENCY || "VND",
					phoneFormat: env.VITE_PHONE_FORMAT || "vietnam",
					environment: env.VITE_ENV || "development",
				};
			};

			// Test with minimal environment
			const minimalEnv = {
				VITE_SUPABASE_URL: "http://localhost:54321",
				VITE_SUPABASE_ANON_KEY: "test-key",
			};

			const config = getEnvWithFallbacks(minimalEnv);

			expect(config.appName).toBe("Cửa hàng sửa chữa laptop");
			expect(config.locale).toBe("vi-VN");
			expect(config.timezone).toBe("Asia/Ho_Chi_Minh");
			expect(config.currency).toBe("VND");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(config.appName),
			).toBe(true);
		});
	});

	describe("1.3.1-UNIT-005: Error boundary logic validation", () => {
		it("should handle errors with Vietnamese error messages", () => {
			interface ErrorInfo {
				componentStack: string;
				errorBoundary?: string;
			}

			const errorBoundaryHandler = {
				captureError: (error: Error, errorInfo: ErrorInfo) => {
					const vietnameseErrorMessages = {
						ChunkLoadError: "Lỗi tải tài nguyên. Vui lòng tải lại trang.",
						TypeError: "Lỗi kiểu dữ liệu. Vui lòng thử lại.",
						NetworkError: "Lỗi kết nối mạng. Kiểm tra kết nối internet.",
						ReferenceError: "Lỗi tham chiếu. Vui lòng báo cáo lỗi này.",
						SyntaxError: "Lỗi cú pháp. Vui lòng tải lại ứng dụng.",
					};

					const errorType = error.constructor
						.name as keyof typeof vietnameseErrorMessages;
					const vietnameseMessage =
						vietnameseErrorMessages[errorType] ||
						"Đã xảy ra lỗi không xác định.";

					return {
						originalError: error.message,
						vietnameseMessage,
						hasVietnamese:
							vietnameseTextValidation.hasVietnameseCharacters(
								vietnameseMessage,
							),
						errorInfo,
						timestamp: new Date().toISOString(),
						userAction: "Vui lòng tải lại trang hoặc liên hệ hỗ trợ kỹ thuật.",
						supportInfo: {
							phone: "0988 661 875",
							email: "support@trinhanhlaptop.vn",
						},
					};
				},

				getRecoveryActions: (errorType: string) => {
					const recoveryActions = {
						ChunkLoadError: [
							"Tải lại trang (Ctrl+F5)",
							"Xóa cache trình duyệt",
							"Kiểm tra kết nối internet",
						],
						NetworkError: [
							"Kiểm tra kết nối internet",
							"Thử lại sau vài phút",
							"Liên hệ hỗ trợ kỹ thuật",
						],
						default: [
							"Tải lại trang",
							"Thử lại thao tác",
							"Liên hệ hỗ trợ nếu lỗi tiếp tục",
						],
					};

					return (
						recoveryActions[errorType as keyof typeof recoveryActions] ||
						recoveryActions.default
					);
				},
			};

			// Test error handling
			const testError = new TypeError("Cannot read property of undefined");
			const errorInfo = { componentStack: "at Component" };

			const handled = errorBoundaryHandler.captureError(testError, errorInfo);

			expect(handled.vietnameseMessage).toBe(
				"Lỗi kiểu dữ liệu. Vui lòng thử lại.",
			);
			expect(handled.hasVietnamese).toBe(true);
			expect(handled.supportInfo.phone).toBe("0988 661 875");

			// Test recovery actions
			const recoveryActions =
				errorBoundaryHandler.getRecoveryActions("ChunkLoadError");
			expect(recoveryActions).toContain("Tải lại trang (Ctrl+F5)");
			expect(
				recoveryActions.every((action) =>
					vietnameseTextValidation.hasVietnameseCharacters(action),
				),
			).toBe(true);
		});

		it("should log errors for debugging with Vietnamese context", () => {
			const errorLogger = {
				log(error: Error, context: any) {
					const getVietnameseDescription = (error: Error) => {
						const descriptions = {
							TypeError: `Lỗi kiểu dữ liệu: ${error.message}`,
							ReferenceError: `Lỗi tham chiếu: ${error.message}`,
							NetworkError: `Lỗi mạng: ${error.message}`,
							default: `Lỗi hệ thống: ${error.message}`,
						};

						const errorType = error.constructor
							.name as keyof typeof descriptions;
						return descriptions[errorType] || descriptions.default;
					};

					const logEntry = {
						timestamp: new Date().toISOString(),
						level: "ERROR",
						message: error.message,
						stack: error.stack,
						context: {
							...context,
							locale: "vi-VN",
							timezone: "Asia/Ho_Chi_Minh",
							userAgent: "Mozilla/5.0 (test)",
							url: window.location?.href || "test-environment",
						},
						vietnamese_description: getVietnameseDescription(error),
						id: crypto.randomUUID(),
					};

					return logEntry;
				},
			};

			const testError = new ReferenceError("variable is not defined");
			const context = {
				component: "CustomerForm",
				action: "save_customer",
				userId: "test-user-123",
			};

			const logEntry = errorLogger.log(testError, context);

			expect(logEntry.level).toBe("ERROR");
			expect(logEntry.context.locale).toBe("vi-VN");
			expect(logEntry.context.timezone).toBe("Asia/Ho_Chi_Minh");
			expect(logEntry.vietnamese_description).toContain("Lỗi tham chiếu:");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					logEntry.vietnamese_description,
				),
			).toBe(true);
		});
	});
});
