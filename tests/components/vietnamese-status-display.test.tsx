/**
 * Vietnamese Status Display Component Unit Tests
 * Phase 3.4.2 - Testing status display and notification components
 *
 * Tests Vietnamese-specific status components:
 * - Repair ticket status badges
 * - Vietnamese priority indicators
 * - Real-time status updates
 * - Vietnamese notification messages
 * - Progress indicators with Vietnamese text
 * - Inventory status displays
 *
 * Uses Phase 3.4.1 formatting and type safety enhancements
 *
 * @since Phase 3.4.2
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Import enhanced testing utilities
import {
	globalSupabaseMock,
	VietnameseMockDataGenerator
} from "../utils/supabase-mock";
import {
	enhancedValidation,
	vietnameseTestData
} from "../phase-1/utils/vietnamese-test-helpers";

// Import Phase 3.4.1 enhancements
import { Currency, DateTime, Text, Business } from "@/lib/formatting";
import type { RepairTicket } from "@/lib/database-types";

// Mock status badge component
const MockStatusBadge = ({
	status,
	variant = "default"
}: {
	status: string;
	variant?: "default" | "success" | "warning" | "error" | "info";
}) => {
	const vietnameseStatusMap: Record<string, string> = {
		"device_received": "Đã tiếp nhận",
		"preliminary_inspection": "Kiểm tra sơ bộ",
		"awaiting_repair_plan": "Chờ kế hoạch sửa chữa",
		"approved_for_repair": "Đã duyệt sửa chữa",
		"in_diagnosis": "Đang chẩn đoán",
		"waiting_parts": "Chờ linh kiện",
		"in_repair": "Đang sửa chữa",
		"quality_testing": "Kiểm tra chất lượng",
		"ready_for_pickup": "Sẵn sàng giao",
		"completed": "Hoàn thành",
		"cannot_repair": "Không thể sửa",
		"cancelled_by_customer": "Khách hàng hủy",
		"repair_failed": "Sửa chữa thất bại"
	};

	const variantClasses = {
		default: "bg-gray-100 text-gray-800",
		success: "bg-green-100 text-green-800",
		warning: "bg-yellow-100 text-yellow-800",
		error: "bg-red-100 text-red-800",
		info: "bg-blue-100 text-blue-800"
	};

	const displayText = vietnameseStatusMap[status] || Text.formatStatus(status);

	return (
		<span
			data-testid="status-badge"
			data-status={status}
			data-variant={variant}
			className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]}`}
		>
			{displayText}
		</span>
	);
};

// Mock priority indicator component
const MockPriorityIndicator = ({
	priority
}: {
	priority: "low" | "normal" | "high" | "urgent";
}) => {
	const vietnamesePriorityMap = {
		low: { label: "Thấp", color: "text-green-600", icon: "🟢" },
		normal: { label: "Bình thường", color: "text-blue-600", icon: "🔵" },
		high: { label: "Cao", color: "text-orange-600", icon: "🟠" },
		urgent: { label: "Khẩn cấp", color: "text-red-600", icon: "🔴" }
	};

	const config = vietnamesePriorityMap[priority];

	return (
		<div
			data-testid="priority-indicator"
			data-priority={priority}
			className={`flex items-center space-x-1 ${config.color}`}
		>
			<span>{config.icon}</span>
			<span className="text-sm font-medium">{config.label}</span>
		</div>
	);
};

// Mock progress indicator component
const MockProgressIndicator = ({
	current,
	total,
	label,
	showPercentage = true
}: {
	current: number;
	total: number;
	label: string;
	showPercentage?: boolean;
}) => {
	const percentage = Math.round((current / total) * 100);

	return (
		<div data-testid="progress-indicator" className="w-full">
			<div className="flex justify-between items-center mb-1">
				<span className="text-sm font-medium text-gray-700">{label}</span>
				{showPercentage && (
					<span data-testid="progress-percentage" className="text-sm text-gray-500">
						{percentage}%
					</span>
				)}
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					data-testid="progress-bar"
					className="bg-blue-600 h-2 rounded-full transition-all duration-300"
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<div data-testid="progress-text" className="text-xs text-gray-500 mt-1">
				{current} trên {total} hoàn thành
			</div>
		</div>
	);
};

// Mock notification component
const MockNotification = ({
	type,
	title,
	message,
	timestamp,
	onDismiss
}: {
	type: "success" | "warning" | "error" | "info";
	title: string;
	message: string;
	timestamp?: Date;
	onDismiss?: () => void;
}) => {
	const typeConfig = {
		success: { icon: "✅", bgColor: "bg-green-50", textColor: "text-green-800", borderColor: "border-green-200" },
		warning: { icon: "⚠️", bgColor: "bg-yellow-50", textColor: "text-yellow-800", borderColor: "border-yellow-200" },
		error: { icon: "❌", bgColor: "bg-red-50", textColor: "text-red-800", borderColor: "border-red-200" },
		info: { icon: "ℹ️", bgColor: "bg-blue-50", textColor: "text-blue-800", borderColor: "border-blue-200" }
	};

	const config = typeConfig[type];

	return (
		<div
			data-testid="notification"
			data-type={type}
			className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
		>
			<div className="flex justify-between items-start">
				<div className="flex space-x-3">
					<span className="text-lg">{config.icon}</span>
					<div>
						<h4 className="font-medium">{title}</h4>
						<p className="mt-1 text-sm">{message}</p>
						{timestamp && (
							<p data-testid="notification-time" className="mt-1 text-xs opacity-75">
								{DateTime.formatRelative(timestamp)}
							</p>
						)}
					</div>
				</div>
				{onDismiss && (
					<button
						data-testid="dismiss-button"
						onClick={onDismiss}
						className="text-gray-400 hover:text-gray-600"
					>
						✕
					</button>
				)}
			</div>
		</div>
	);
};

// Mock inventory status component
const MockInventoryStatus = ({
	current,
	minimum,
	partName
}: {
	current: number;
	minimum: number;
	partName: string;
}) => {
	const { text, status } = Business.formatInventoryStatus(current, minimum);

	const statusConfig = {
		good: { color: "text-green-600", bgColor: "bg-green-50", icon: "✅" },
		low: { color: "text-yellow-600", bgColor: "bg-yellow-50", icon: "⚠️" },
		out: { color: "text-red-600", bgColor: "bg-red-50", icon: "❌" }
	};

	const config = statusConfig[status];

	return (
		<div
			data-testid="inventory-status"
			data-status={status}
			className={`p-3 rounded-lg ${config.bgColor}`}
		>
			<div className="flex items-center space-x-2">
				<span>{config.icon}</span>
				<div>
					<h4 className="font-medium text-gray-900">{partName}</h4>
					<p className={`text-sm ${config.color}`}>{text}</p>
					<p className="text-xs text-gray-500">
						Tồn kho: {current} | Tối thiểu: {minimum}
					</p>
				</div>
			</div>
		</div>
	);
};

describe("Vietnamese Status Display Component Tests", () => {
	beforeEach(() => {
		globalSupabaseMock.reset();
		vi.clearAllMocks();
	});

	describe("Status Badge Component", () => {
		it("should display Vietnamese repair status labels", async () => {
			const repairStatuses: RepairTicket["status"][] = [
				"device_received",
				"in_repair",
				"ready_for_pickup",
				"completed",
				"cannot_repair"
			];

			repairStatuses.forEach(status => {
				const { unmount } = render(<MockStatusBadge status={status} />);

				const badge = screen.getByTestId("status-badge");
				expect(badge).toHaveAttribute("data-status", status);

				// Check Vietnamese labels
				const expectedLabels: Record<string, string> = {
					"device_received": "Đã tiếp nhận",
					"in_repair": "Đang sửa chữa",
					"ready_for_pickup": "Sẵn sàng giao",
					"completed": "Hoàn thành",
					"cannot_repair": "Không thể sửa"
				};

				expect(badge).toHaveTextContent(expectedLabels[status]);
				unmount();
			});
		});

		it("should apply correct variant styles", async () => {
			const variants = [
				{ variant: "success" as const, status: "completed" },
				{ variant: "warning" as const, status: "waiting_parts" },
				{ variant: "error" as const, status: "repair_failed" },
				{ variant: "info" as const, status: "in_diagnosis" }
			];

			variants.forEach(({ variant, status }) => {
				const { unmount } = render(
					<MockStatusBadge status={status} variant={variant} />
				);

				const badge = screen.getByTestId("status-badge");
				expect(badge).toHaveAttribute("data-variant", variant);
				unmount();
			});
		});

		it("should handle unknown status with fallback formatting", async () => {
			render(<MockStatusBadge status="unknown_status" />);

			const badge = screen.getByTestId("status-badge");
			expect(badge).toHaveTextContent("Unknown Status"); // Text.formatStatus fallback
		});
	});

	describe("Priority Indicator Component", () => {
		it("should display Vietnamese priority labels with correct styling", async () => {
			const priorities: Array<"low" | "normal" | "high" | "urgent"> = [
				"low", "normal", "high", "urgent"
			];

			const expectedLabels = {
				low: "Thấp",
				normal: "Bình thường",
				high: "Cao",
				urgent: "Khẩn cấp"
			};

			priorities.forEach(priority => {
				const { unmount } = render(<MockPriorityIndicator priority={priority} />);

				const indicator = screen.getByTestId("priority-indicator");
				expect(indicator).toHaveAttribute("data-priority", priority);
				expect(indicator).toHaveTextContent(expectedLabels[priority]);

				// Check color coding
				const colorClasses = {
					low: "text-green-600",
					normal: "text-blue-600",
					high: "text-orange-600",
					urgent: "text-red-600"
				};

				expect(indicator).toHaveClass(colorClasses[priority]);
				unmount();
			});
		});

		it("should include visual priority icons", async () => {
			render(<MockPriorityIndicator priority="urgent" />);

			const indicator = screen.getByTestId("priority-indicator");
			expect(indicator).toHaveTextContent("🔴"); // Urgent icon
			expect(indicator).toHaveTextContent("Khẩn cấp");
		});
	});

	describe("Progress Indicator Component", () => {
		it("should display Vietnamese progress information", async () => {
			render(
				<MockProgressIndicator
					current={3}
					total={5}
					label="Tiến độ sửa chữa"
					showPercentage={true}
				/>
			);

			// Check Vietnamese label
			expect(screen.getByText("Tiến độ sửa chữa")).toBeInTheDocument();

			// Check percentage calculation
			expect(screen.getByTestId("progress-percentage")).toHaveTextContent("60%");

			// Check Vietnamese progress text
			expect(screen.getByTestId("progress-text")).toHaveTextContent("3 trên 5 hoàn thành");

			// Check progress bar width
			const progressBar = screen.getByTestId("progress-bar");
			expect(progressBar).toHaveStyle({ width: "60%" });
		});

		it("should handle edge cases in progress calculation", async () => {
			// Test 0% progress
			const { rerender } = render(
				<MockProgressIndicator
					current={0}
					total={10}
					label="Chưa bắt đầu"
				/>
			);

			expect(screen.getByTestId("progress-percentage")).toHaveTextContent("0%");
			expect(screen.getByTestId("progress-bar")).toHaveStyle({ width: "0%" });

			// Test 100% progress
			rerender(
				<MockProgressIndicator
					current={10}
					total={10}
					label="Hoàn thành"
				/>
			);

			expect(screen.getByTestId("progress-percentage")).toHaveTextContent("100%");
			expect(screen.getByTestId("progress-bar")).toHaveStyle({ width: "100%" });
		});

		it("should optionally hide percentage display", async () => {
			render(
				<MockProgressIndicator
					current={2}
					total={4}
					label="Tiến độ"
					showPercentage={false}
				/>
			);

			expect(screen.queryByTestId("progress-percentage")).not.toBeInTheDocument();
			expect(screen.getByTestId("progress-text")).toHaveTextContent("2 trên 4 hoàn thành");
		});
	});

	describe("Notification Component", () => {
		it("should display Vietnamese notification messages", async () => {
			const notifications = [
				{
					type: "success" as const,
					title: "Thành công",
					message: "Phiếu sửa chữa đã được tạo thành công"
				},
				{
					type: "warning" as const,
					title: "Cảnh báo",
					message: "Linh kiện sắp hết hàng"
				},
				{
					type: "error" as const,
					title: "Lỗi",
					message: "Không thể kết nối với máy chủ"
				},
				{
					type: "info" as const,
					title: "Thông tin",
					message: "Khách hàng đã được thông báo về tình trạng sửa chữa"
				}
			];

			notifications.forEach(({ type, title, message }) => {
				const { unmount } = render(
					<MockNotification type={type} title={title} message={message} />
				);

				const notification = screen.getByTestId("notification");
				expect(notification).toHaveAttribute("data-type", type);
				expect(notification).toHaveTextContent(title);
				expect(notification).toHaveTextContent(message);

				unmount();
			});
		});

		it("should display Vietnamese relative timestamps", async () => {
			const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

			render(
				<MockNotification
					type="info"
					title="Thông báo"
					message="Cập nhật trạng thái"
					timestamp={fiveMinutesAgo}
				/>
			);

			const timeElement = screen.getByTestId("notification-time");
			expect(timeElement).toHaveTextContent("5 phút trước");
		});

		it("should handle notification dismissal", async () => {
			const mockOnDismiss = vi.fn();

			render(
				<MockNotification
					type="success"
					title="Thông báo"
					message="Test message"
					onDismiss={mockOnDismiss}
				/>
			);

			const dismissButton = screen.getByTestId("dismiss-button");
			fireEvent.click(dismissButton);

			expect(mockOnDismiss).toHaveBeenCalledTimes(1);
		});
	});

	describe("Inventory Status Component", () => {
		it("should display Vietnamese inventory status messages", async () => {
			const inventoryItems = [
				{ current: 10, minimum: 5, partName: "Màn hình laptop", expectedStatus: "good" },
				{ current: 2, minimum: 5, partName: "RAM DDR4", expectedStatus: "low" },
				{ current: 0, minimum: 3, partName: "SSD 256GB", expectedStatus: "out" }
			];

			inventoryItems.forEach(({ current, minimum, partName, expectedStatus }) => {
				const { unmount } = render(
					<MockInventoryStatus
						current={current}
						minimum={minimum}
						partName={partName}
					/>
				);

				const status = screen.getByTestId("inventory-status");
				expect(status).toHaveAttribute("data-status", expectedStatus);
				expect(status).toHaveTextContent(partName);

				// Check Vietnamese status messages
				const expectedMessages = {
					good: `Còn ${current}`,
					low: `Sắp hết (${current} còn lại)`,
					out: "Hết hàng"
				};

				expect(status).toHaveTextContent(expectedMessages[expectedStatus as keyof typeof expectedMessages]);
				expect(status).toHaveTextContent(`Tồn kho: ${current}`);
				expect(status).toHaveTextContent(`Tối thiểu: ${minimum}`);

				unmount();
			});
		});

		it("should use correct visual indicators for inventory status", async () => {
			// Test good status
			const { rerender } = render(
				<MockInventoryStatus
					current={10}
					minimum={5}
					partName="Test Part"
				/>
			);

			let status = screen.getByTestId("inventory-status");
			expect(status).toHaveTextContent("✅");
			expect(status).toHaveClass("bg-green-50");

			// Test low status
			rerender(
				<MockInventoryStatus
					current={2}
					minimum={5}
					partName="Test Part"
				/>
			);

			status = screen.getByTestId("inventory-status");
			expect(status).toHaveTextContent("⚠️");
			expect(status).toHaveClass("bg-yellow-50");

			// Test out of stock status
			rerender(
				<MockInventoryStatus
					current={0}
					minimum={3}
					partName="Test Part"
				/>
			);

			status = screen.getByTestId("inventory-status");
			expect(status).toHaveTextContent("❌");
			expect(status).toHaveClass("bg-red-50");
		});
	});

	describe("Status Component Integration", () => {
		it("should integrate with Vietnamese business formatting", async () => {
			const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
				status: "in_repair",
				priority: "high",
				estimated_cost: 2500000
			});

			// Test status formatting integration
			const { rerender } = render(<MockStatusBadge status={ticket.status} />);
			expect(screen.getByTestId("status-badge")).toHaveTextContent("Đang sửa chữa");

			// Test priority formatting integration
			rerender(<MockPriorityIndicator priority={ticket.priority} />);
			expect(screen.getByTestId("priority-indicator")).toHaveTextContent("Cao");

			// Test notification with formatted cost
			const costMessage = `Ước tính chi phí: ${Currency.format(ticket.estimated_cost!)}`;
			rerender(
				<MockNotification
					type="info"
					title="Thông tin chi phí"
					message={costMessage}
				/>
			);

			expect(screen.getByTestId("notification")).toHaveTextContent("2.500.000 ₫");
		});

		it("should handle real-time status updates", async () => {
			const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
				status: "device_received"
			});

			// Initial status
			const { rerender } = render(<MockStatusBadge status={ticket.status} />);
			expect(screen.getByTestId("status-badge")).toHaveTextContent("Đã tiếp nhận");

			// Simulate status update
			const updatedTicket = { ...ticket, status: "in_repair" as const };
			rerender(<MockStatusBadge status={updatedTicket.status} />);
			expect(screen.getByTestId("status-badge")).toHaveTextContent("Đang sửa chữa");

			// Final status
			const completedTicket = { ...ticket, status: "completed" as const };
			rerender(<MockStatusBadge status={completedTicket.status} variant="success" />);
			expect(screen.getByTestId("status-badge")).toHaveTextContent("Hoàn thành");
			expect(screen.getByTestId("status-badge")).toHaveAttribute("data-variant", "success");
		});
	});
});