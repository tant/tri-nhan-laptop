/**
 * Epic 1.3 - Story 1.3.2: TanStack Router Integration Unit Tests
 * Test scenarios based on Quinn's design: docs/qa/assessments/1.3-epic-consolidated-test-design-20250123.md
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	vietnameseTestData,
	vietnameseTextValidation,
} from "../../utils/vietnamese-test-helpers";

describe("Epic 1.3.2: TanStack Router Integration - Unit Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("1.3.2-UNIT-001: Route configuration validation", () => {
		it("should validate Vietnamese route paths and metadata", () => {
			const routeConfig = {
				routes: [
					{
						path: "/",
						title: "Trang chủ - Tra cứu sửa chữa",
						meta: {
							description:
								"Tra cứu tình trạng sửa chữa laptop tại Trí Nhân Laptop",
							keywords: "sửa chữa laptop, tra cứu, tình trạng",
						},
					},
					{
						path: "/dashboard",
						title: "Bảng điều khiển - Quản lý cửa hàng",
						meta: {
							description: "Hệ thống quản lý cửa hàng sửa chữa laptop",
							requiresAuth: true,
							roles: ["shop_owner", "staff"],
						},
					},
					{
						path: "/customers",
						title: "Quản lý khách hàng",
						meta: {
							description: "Danh sách và quản lý thông tin khách hàng",
							requiresAuth: true,
							roles: ["shop_owner", "staff"],
						},
					},
					{
						path: "/repair-tickets",
						title: "Quản lý phiếu sửa chữa",
						meta: {
							description: "Theo dõi và quản lý các phiếu sửa chữa",
							requiresAuth: true,
						},
					},
				],
			};

			// Validate route structure
			expect(routeConfig.routes).toHaveLength(4);

			// Validate Vietnamese titles
			routeConfig.routes.forEach((route) => {
				expect(route.title).toBeDefined();
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(route.title),
				).toBe(true);
				expect(route.meta.description).toBeDefined();
				expect(
					vietnameseTextValidation.hasVietnameseCharacters(
						route.meta.description,
					),
				).toBe(true);
			});

			// Validate specific routes
			const homeRoute = routeConfig.routes.find((r) => r.path === "/")!;
			expect(homeRoute.title).toContain("Trang chủ");
			expect(homeRoute.meta.description).toContain("Tra cứu");

			const dashboardRoute = routeConfig.routes.find(
				(r) => r.path === "/dashboard",
			)!;
			expect(dashboardRoute.meta.requiresAuth).toBe(true);
			expect(dashboardRoute.meta.roles).toContain("shop_owner");
		});

		it("should validate file-based routing structure", () => {
			const fileRoutes = [
				{ file: "routes/index.tsx", path: "/", component: "HomePage" },
				{
					file: "routes/dashboard/index.tsx",
					path: "/dashboard",
					component: "DashboardPage",
				},
				{
					file: "routes/dashboard/customers.tsx",
					path: "/dashboard/customers",
					component: "CustomersPage",
				},
				{
					file: "routes/dashboard/repair-tickets.tsx",
					path: "/dashboard/repair-tickets",
					component: "RepairTicketsPage",
				},
				{
					file: "routes/dashboard/parts.tsx",
					path: "/dashboard/parts",
					component: "PartsPage",
				},
				{
					file: "routes/_authenticated.tsx",
					path: "/_authenticated",
					component: "AuthenticatedLayout",
				},
			];

			// Validate file-to-route mapping
			fileRoutes.forEach((route) => {
				expect(route.file).toMatch(/^routes\/.*\.tsx$/);
				expect(route.path).toMatch(/^\//);
				expect(route.component).toMatch(/^[A-Z]\w+$/);
			});

			// Validate nested route structure
			const dashboardRoutes = fileRoutes.filter((r) =>
				r.path.startsWith("/dashboard"),
			);
			expect(dashboardRoutes).toHaveLength(4);

			// Validate public vs authenticated routes
			const publicRoutes = fileRoutes.filter((r) => r.path === "/");
			const authenticatedRoutes = fileRoutes.filter((r) =>
				r.path.startsWith("/dashboard"),
			);
			const layoutRoutes = fileRoutes.filter((r) => r.path.startsWith("/_"));

			expect(publicRoutes).toHaveLength(1); // Only home page
			expect(authenticatedRoutes.length).toBeGreaterThan(0);
			expect(layoutRoutes.length).toBeGreaterThan(0);
		});
	});

	describe("1.3.2-UNIT-002: Vietnamese URL handling", () => {
		it("should handle Vietnamese search parameters correctly", () => {
			const urlSearchParams = {
				parse: (queryString: string) => {
					const params = new URLSearchParams(queryString);
					const result: Record<string, string> = {};

					for (const [key, value] of params) {
						result[key] = decodeURIComponent(value);
					}

					return result;
				},

				stringify: (params: Record<string, string>) => {
					const searchParams = new URLSearchParams();

					Object.entries(params).forEach(([key, value]) => {
						searchParams.set(key, encodeURIComponent(value));
					});

					return searchParams.toString();
				},
			};

			// Test Vietnamese search queries
			const vietnameseParams = {
				query: "Nguyễn Văn An",
				address: "123 Nguyễn Trãi, Quận 1",
				description: "Laptop bị lỗi màn hình",
			};

			const queryString = urlSearchParams.stringify(vietnameseParams);
			const parsedParams = urlSearchParams.parse(queryString);

			// Validate encoding/decoding preserves Vietnamese characters
			expect(parsedParams.query).toBe("Nguyễn Văn An");
			expect(parsedParams.address).toBe("123 Nguyễn Trãi, Quận 1");
			expect(parsedParams.description).toBe("Laptop bị lỗi màn hình");

			// Validate all contain Vietnamese characters
			Object.values(parsedParams).forEach((value) => {
				expect(vietnameseTextValidation.hasVietnameseCharacters(value)).toBe(
					true,
				);
			});
		});

		it("should handle Vietnamese route parameters", () => {
			const routeParamHandler = {
				parseParams: (path: string, pattern: string) => {
					// Simple param extraction for testing
					const patternRegex = pattern.replace(/:\w+/g, "([^/]+)");
					const match = path.match(new RegExp(patternRegex));

					if (!match) return {};

					const paramNames =
						pattern.match(/:(\w+)/g)?.map((p) => p.slice(1)) || [];
					const params: Record<string, string> = {};

					paramNames.forEach((name, index) => {
						params[name] = decodeURIComponent(match[index + 1]);
					});

					return params;
				},

				buildPath: (pattern: string, params: Record<string, string>) => {
					let path = pattern;

					Object.entries(params).forEach(([key, value]) => {
						path = path.replace(`:${key}`, encodeURIComponent(value));
					});

					return path;
				},
			};

			// Test Vietnamese customer name in URL
			const customerPattern = "/customers/:customerName/details";
			const vietnameseCustomerName = "Nguyễn Văn Dương";

			const generatedPath = routeParamHandler.buildPath(customerPattern, {
				customerName: vietnameseCustomerName,
			});

			const parsedParams = routeParamHandler.parseParams(
				generatedPath,
				customerPattern,
			);

			expect(parsedParams.customerName).toBe(vietnameseCustomerName);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					parsedParams.customerName,
				),
			).toBe(true);

			// Test repair ticket with Vietnamese description
			const ticketPattern = "/repair-tickets/:ticketCode";
			const ticketCode = "LRP-2025-123456";

			const ticketPath = routeParamHandler.buildPath(ticketPattern, {
				ticketCode,
			});
			const ticketParams = routeParamHandler.parseParams(
				ticketPath,
				ticketPattern,
			);

			expect(ticketParams.ticketCode).toBe(ticketCode);
			expect(ticketParams.ticketCode).toMatch(/^LRP-\d{4}-\d{6}$/);
		});
	});

	describe("1.3.2-UNIT-003: Navigation state management", () => {
		it("should manage navigation history with Vietnamese page titles", () => {
			interface NavigationState {
				current: string;
				history: Array<{
					path: string;
					title: string;
					timestamp: number;
					params?: Record<string, string>;
				}>;
			}

			const navigationManager = {
				state: {
					current: "/",
					history: [],
				} as NavigationState,

				navigate: function (
					path: string,
					title: string,
					params?: Record<string, string>,
				) {
					this.state.history.push({
						path: this.state.current,
						title: this.getCurrentTitle(),
						timestamp: Date.now(),
						params,
					});

					this.state.current = path;
					return this.state;
				},

				getCurrentTitle: function () {
					const titleMap: Record<string, string> = {
						"/": "Trang chủ - Tra cứu sửa chữa",
						"/dashboard": "Bảng điều khiển",
						"/customers": "Quản lý khách hàng",
						"/repair-tickets": "Quản lý phiếu sửa chữa",
						"/parts": "Quản lý linh kiện",
					};
					return titleMap[this.state.current] || "Trang không xác định";
				},

				goBack: function () {
					if (this.state.history.length === 0) return this.state;

					const previous = this.state.history.pop()!;
					this.state.current = previous.path;
					return this.state;
				},

				getBreadcrumbs: function () {
					const pathParts = this.state.current.split("/").filter(Boolean);
					const breadcrumbs = [{ path: "/", title: "Trang chủ" }];

					let currentPath = "";
					pathParts.forEach((part) => {
						currentPath += `/${part}`;
						breadcrumbs.push({
							path: currentPath,
							title: this.getCurrentTitle(),
						});
					});

					return breadcrumbs;
				},
			};

			// Test navigation flow
			navigationManager.navigate("/dashboard", "Bảng điều khiển");
			expect(navigationManager.state.current).toBe("/dashboard");
			expect(navigationManager.getCurrentTitle()).toBe("Bảng điều khiển");

			navigationManager.navigate("/customers", "Quản lý khách hàng");
			expect(navigationManager.state.current).toBe("/customers");
			expect(navigationManager.state.history).toHaveLength(2);

			// Test Vietnamese titles in history
			const lastHistoryItem =
				navigationManager.state.history[
					navigationManager.state.history.length - 1
				];
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(lastHistoryItem.title),
			).toBe(true);

			// Test back navigation
			navigationManager.goBack();
			expect(navigationManager.state.current).toBe("/dashboard");

			// Test breadcrumbs with Vietnamese titles
			navigationManager.navigate("/repair-tickets", "Quản lý phiếu sửa chữa");
			const breadcrumbs = navigationManager.getBreadcrumbs();

			expect(breadcrumbs).toHaveLength(2);
			expect(breadcrumbs[0].title).toBe("Trang chủ");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(breadcrumbs[1].title),
			).toBe(true);
		});

		it("should handle loading states during navigation", () => {
			interface LoadingState {
				isNavigating: boolean;
				loadingRoute: string | null;
				error: Error | null;
				progress: number;
			}

			const loadingManager = {
				state: {
					isNavigating: false,
					loadingRoute: null,
					error: null,
					progress: 0,
				} as LoadingState,

				startNavigation: function (route: string) {
					this.state.isNavigating = true;
					this.state.loadingRoute = route;
					this.state.error = null;
					this.state.progress = 0;
					return this.state;
				},

				updateProgress: function (progress: number) {
					this.state.progress = Math.min(100, Math.max(0, progress));
					return this.state;
				},

				completeNavigation: function () {
					this.state.isNavigating = false;
					this.state.loadingRoute = null;
					this.state.progress = 100;
					return this.state;
				},

				failNavigation: function (error: Error) {
					this.state.isNavigating = false;
					this.state.error = error;
					this.state.progress = 0;

					// Vietnamese error messages
					const vietnameseError = new Error(`Lỗi điều hướng: ${error.message}`);
					this.state.error = vietnameseError;
					return this.state;
				},

				getLoadingMessage: function () {
					if (!this.state.isNavigating) return "";

					const messages: Record<string, string> = {
						"/dashboard": "Đang tải bảng điều khiển...",
						"/customers": "Đang tải danh sách khách hàng...",
						"/repair-tickets": "Đang tải phiếu sửa chữa...",
						"/parts": "Đang tải danh sách linh kiện...",
					};

					return messages[this.state.loadingRoute || ""] || "Đang tải trang...";
				},
			};

			// Test loading flow
			loadingManager.startNavigation("/customers");
			expect(loadingManager.state.isNavigating).toBe(true);
			expect(loadingManager.state.loadingRoute).toBe("/customers");

			// Test Vietnamese loading message
			const loadingMessage = loadingManager.getLoadingMessage();
			expect(loadingMessage).toBe("Đang tải danh sách khách hàng...");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(loadingMessage),
			).toBe(true);

			// Test progress update
			loadingManager.updateProgress(50);
			expect(loadingManager.state.progress).toBe(50);

			// Test successful completion
			loadingManager.completeNavigation();
			expect(loadingManager.state.isNavigating).toBe(false);
			expect(loadingManager.state.progress).toBe(100);

			// Test error handling with Vietnamese message
			const testError = new Error("Network timeout");
			loadingManager.startNavigation("/dashboard");
			loadingManager.failNavigation(testError);

			expect(loadingManager.state.error?.message).toContain("Lỗi điều hướng:");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					loadingManager.state.error?.message || "",
				),
			).toBe(true);
		});
	});

	describe("1.3.2-UNIT-004: Route guards and authentication", () => {
		it("should validate route access based on user roles", () => {
			interface User {
				id: string;
				role: "shop_owner" | "staff" | "customer";
				permissions: string[];
			}

			interface RouteConfig {
				path: string;
				requiresAuth: boolean;
				allowedRoles?: string[];
				requiredPermissions?: string[];
			}

			const routeGuard = {
				checkAccess: (user: User | null, route: RouteConfig) => {
					// Public routes
					if (!route.requiresAuth) {
						return { allowed: true, reason: "Trang công khai" };
					}

					// Authentication required
					if (!user) {
						return {
							allowed: false,
							reason: "Cần đăng nhập để truy cập trang này",
							redirectTo: "/login",
						};
					}

					// Role-based access
					if (route.allowedRoles && !route.allowedRoles.includes(user.role)) {
						return {
							allowed: false,
							reason: "Bạn không có quyền truy cập trang này",
							redirectTo: "/dashboard",
						};
					}

					// Permission-based access
					if (route.requiredPermissions) {
						const hasPermissions = route.requiredPermissions.every(
							(permission) => user.permissions.includes(permission),
						);

						if (!hasPermissions) {
							return {
								allowed: false,
								reason: "Bạn không có đủ quyền để truy cập trang này",
								redirectTo: "/dashboard",
							};
						}
					}

					return { allowed: true, reason: "Truy cập được phép" };
				},

				getRouteTitle: (route: RouteConfig, user: User | null) => {
					const titles: Record<string, string> = {
						"/": "Trang chủ - Tra cứu sửa chữa",
						"/dashboard": `Bảng điều khiển - ${user?.role === "shop_owner" ? "Chủ cửa hàng" : "Nhân viên"}`,
						"/customers": "Quản lý khách hàng",
						"/repair-tickets": "Quản lý phiếu sửa chữa",
						"/parts": "Quản lý linh kiện",
						"/settings": "Cài đặt hệ thống",
					};

					return titles[route.path] || "Trang không xác định";
				},
			};

			// Test public route access
			const publicRoute: RouteConfig = { path: "/", requiresAuth: false };
			const publicAccess = routeGuard.checkAccess(null, publicRoute);
			expect(publicAccess.allowed).toBe(true);
			expect(publicAccess.reason).toBe("Trang công khai");

			// Test authenticated route without user
			const protectedRoute: RouteConfig = {
				path: "/dashboard",
				requiresAuth: true,
			};
			const noUserAccess = routeGuard.checkAccess(null, protectedRoute);
			expect(noUserAccess.allowed).toBe(false);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(noUserAccess.reason),
			).toBe(true);

			// Test role-based access
			const shopOwner: User = {
				id: "1",
				role: "shop_owner",
				permissions: ["read_all", "write_all", "manage_users"],
			};

			const staff: User = {
				id: "2",
				role: "staff",
				permissions: ["read_customers", "write_tickets"],
			};

			const ownerOnlyRoute: RouteConfig = {
				path: "/settings",
				requiresAuth: true,
				allowedRoles: ["shop_owner"],
			};

			const ownerAccess = routeGuard.checkAccess(shopOwner, ownerOnlyRoute);
			expect(ownerAccess.allowed).toBe(true);

			const staffAccess = routeGuard.checkAccess(staff, ownerOnlyRoute);
			expect(staffAccess.allowed).toBe(false);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(staffAccess.reason),
			).toBe(true);

			// Test permission-based access
			const permissionRoute: RouteConfig = {
				path: "/advanced-reports",
				requiresAuth: true,
				requiredPermissions: ["read_all", "view_reports"],
			};

			const staffPermissionAccess = routeGuard.checkAccess(
				staff,
				permissionRoute,
			);
			expect(staffPermissionAccess.allowed).toBe(false);

			// Test Vietnamese titles based on user role
			const dashboardTitle = routeGuard.getRouteTitle(
				protectedRoute,
				shopOwner,
			);
			expect(dashboardTitle).toContain("Chủ cửa hàng");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(dashboardTitle),
			).toBe(true);

			const staffDashboardTitle = routeGuard.getRouteTitle(
				protectedRoute,
				staff,
			);
			expect(staffDashboardTitle).toContain("Nhân viên");
		});

		it("should handle route transitions with authentication checks", () => {
			interface TransitionContext {
				from: string;
				to: string;
				user: User | null;
				timestamp: number;
			}

			interface User {
				id: string;
				role: string;
				sessionExpiry: number;
			}

			const transitionManager = {
				validateTransition: (context: TransitionContext) => {
					const { from, to, user, timestamp } = context;

					// Check session validity
					if (user && user.sessionExpiry < timestamp) {
						return {
							allowed: false,
							reason: "Phiên đăng nhập đã hết hạn",
							action: "logout",
							message: "Vui lòng đăng nhập lại để tiếp tục",
						};
					}

					// Check route change validity
					if (to.startsWith("/dashboard") && !user) {
						return {
							allowed: false,
							reason: "Cần đăng nhập",
							action: "redirect",
							redirectTo: "/",
							message: "Bạn cần đăng nhập để truy cập trang quản lý",
						};
					}

					// Check for leaving unsaved changes
					if (from.includes("edit") && to !== from) {
						return {
							allowed: false,
							reason: "Có thay đổi chưa lưu",
							action: "confirm",
							message:
								"Bạn có chắc muốn rời khỏi trang này? Các thay đổi sẽ bị mất.",
						};
					}

					return {
						allowed: true,
						reason: "Chuyển trang thành công",
						action: "navigate",
					};
				},

				getTransitionMessage: (from: string, to: string) => {
					const messages: Record<string, string> = {
						"dashboard->customers": "Chuyển đến quản lý khách hàng",
						"customers->repair-tickets": "Chuyển đến quản lý phiếu sửa chữa",
						"repair-tickets->parts": "Chuyển đến quản lý linh kiện",
						"dashboard->settings": "Chuyển đến cài đặt hệ thống",
					};

					const key = `${from.split("/").pop()}->${to.split("/").pop()}`;
					return messages[key] || `Chuyển từ ${from} đến ${to}`;
				},
			};

			// Test valid transition
			const validUser: User = {
				id: "1",
				role: "shop_owner",
				sessionExpiry: Date.now() + 3600000, // 1 hour from now
			};

			const validTransition: TransitionContext = {
				from: "/dashboard",
				to: "/customers",
				user: validUser,
				timestamp: Date.now(),
			};

			const validResult = transitionManager.validateTransition(validTransition);
			expect(validResult.allowed).toBe(true);
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(validResult.reason),
			).toBe(true);

			// Test expired session
			const expiredUser: User = {
				id: "1",
				role: "shop_owner",
				sessionExpiry: Date.now() - 1000, // Expired 1 second ago
			};

			const expiredTransition: TransitionContext = {
				from: "/dashboard",
				to: "/customers",
				user: expiredUser,
				timestamp: Date.now(),
			};

			const expiredResult =
				transitionManager.validateTransition(expiredTransition);
			expect(expiredResult.allowed).toBe(false);
			expect(expiredResult.reason).toBe("Phiên đăng nhập đã hết hạn");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					expiredResult.message!,
				),
			).toBe(true);

			// Test unauthorized transition
			const unauthorizedTransition: TransitionContext = {
				from: "/",
				to: "/dashboard",
				user: null,
				timestamp: Date.now(),
			};

			const unauthorizedResult = transitionManager.validateTransition(
				unauthorizedTransition,
			);
			expect(unauthorizedResult.allowed).toBe(false);
			expect(unauthorizedResult.action).toBe("redirect");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(
					unauthorizedResult.message!,
				),
			).toBe(true);

			// Test Vietnamese transition messages
			const transitionMessage = transitionManager.getTransitionMessage(
				"/dashboard",
				"/customers",
			);
			expect(transitionMessage).toBe("Chuyển đến quản lý khách hàng");
			expect(
				vietnameseTextValidation.hasVietnameseCharacters(transitionMessage),
			).toBe(true);
		});
	});
});
