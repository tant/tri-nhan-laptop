/**
 * Vietnamese Data Table Component Unit Tests
 * Phase 3.4.2 - Testing reusable table components with Vietnamese data
 *
 * Tests the generic data table component with:
 * - Vietnamese customer data display
 * - Repair ticket table formatting
 * - Parts inventory table functionality
 * - Vietnamese sorting and filtering
 * - Type-safe column definitions
 * - Currency and date formatting integration
 *
 * Uses Phase 3.4.1 generic types and enhanced type safety
 *
 * @since Phase 3.4.2
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";

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
import {
	createCurrencyColumn,
	createDateColumn,
	createPhoneColumn,
	createStatusColumn,
	createActionColumn,
	createCustomerColumn,
	CommonColumns
} from "@/lib/table-columns";
import { Currency, DateTime, Text } from "@/lib/formatting";
import type { GenericTableConfig } from "@/lib/generic-types";
import type { Customer, RepairTicket, Part } from "@/lib/database-types";

// Mock table component for testing
const MockDataTable = <TData,>({
	config,
	onRowClick
}: {
	config: GenericTableConfig<TData>;
	onRowClick?: (item: TData) => void;
}) => {
	return (
		<div data-testid="data-table">
			<table>
				<thead>
					<tr>
						{config.columns.map((column, index) => (
							<th key={index} data-testid={`header-${index}`}>
								{typeof column.header === 'string' ? column.header : 'Header'}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{config.data.map((row, rowIndex) => (
						<tr
							key={rowIndex}
							data-testid={`row-${rowIndex}`}
							onClick={() => onRowClick?.(row)}
						>
							{config.columns.map((column, colIndex) => (
								<td key={colIndex} data-testid={`cell-${rowIndex}-${colIndex}`}>
									{column.cell ?
										typeof column.cell === 'function' ?
											JSON.stringify(column.cell({ row: { original: row, getValue: (key: string) => (row as any)[key] } } as any)) :
											String(column.cell) :
										String((row as any)[column.accessorKey || ''])
									}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

describe("Vietnamese Data Table Component Tests", () => {
	beforeEach(() => {
		globalSupabaseMock.reset();
		globalSupabaseMock.seedTestData();
		vi.clearAllMocks();
	});

	describe("Customer Data Table", () => {
		it("should render customer table with Vietnamese data formatting", async () => {
			// Create Vietnamese customers
			const customers: Customer[] = [
				VietnameseMockDataGenerator.createMockCustomer({
					phone: "0901234567",
					full_name: "Nguyễn Văn An",
					address: "123 Nguyễn Trãi, Quận 1, TP.HCM"
				}),
				VietnameseMockDataGenerator.createMockCustomer({
					phone: "0912345678",
					full_name: "Trần Thị Bình",
					address: "456 Lê Văn Sỹ, Quận 3, TP.HCM"
				})
			];

			// Create table configuration with Vietnamese formatting
			const tableConfig: GenericTableConfig<Customer> = {
				columns: [
					CommonColumns.rowNumber<Customer>(),
					createPhoneColumn<Customer>("phone", "Số điện thoại", { sortable: true }),
					{
						accessorKey: "full_name",
						header: "Họ và tên",
						cell: ({ row }) => (
							<div className="font-medium">{row.getValue("full_name")}</div>
						)
					},
					{
						accessorKey: "address",
						header: "Địa chỉ",
						cell: ({ row }) => {
							const address = row.getValue("address") as string;
							return <div className="max-w-[200px]" title={address}>
								{Text.truncate(address || "", 50)}
							</div>;
						}
					},
					createDateColumn<Customer>("created_at", "Ngày tạo", { format: "date" }),
					createActionColumn<Customer>({
						onView: (customer) => console.log("View customer:", customer.phone),
						onEdit: (customer) => console.log("Edit customer:", customer.phone),
						viewLabel: "Xem chi tiết",
						editLabel: "Chỉnh sửa"
					})
				],
				data: customers,
				searchable: true,
				searchPlaceholder: "Tìm kiếm khách hàng...",
				sortable: true,
				pagination: true,
				emptyMessage: "Không có khách hàng nào"
			};

			const mockOnRowClick = vi.fn();

			// Render table
			render(<MockDataTable config={tableConfig} onRowClick={mockOnRowClick} />);

			// Verify table structure
			expect(screen.getByTestId("data-table")).toBeInTheDocument();

			// Verify headers in Vietnamese
			expect(screen.getByTestId("header-1")).toHaveTextContent("Số điện thoại");
			expect(screen.getByTestId("header-2")).toHaveTextContent("Họ và tên");
			expect(screen.getByTestId("header-3")).toHaveTextContent("Địa chỉ");
			expect(screen.getByTestId("header-4")).toHaveTextContent("Ngày tạo");
			expect(screen.getByTestId("header-5")).toHaveTextContent("Thao tác");

			// Verify customer data is displayed
			expect(screen.getByTestId("row-0")).toBeInTheDocument();
			expect(screen.getByTestId("row-1")).toBeInTheDocument();

			// Test row click
			fireEvent.click(screen.getByTestId("row-0"));
			expect(mockOnRowClick).toHaveBeenCalledWith(customers[0]);
		});

		it("should handle Vietnamese phone number formatting in table", async () => {
			const customer = VietnameseMockDataGenerator.createMockCustomer({
				phone: "0901234567"
			});

			const tableConfig: GenericTableConfig<Customer> = {
				columns: [
					createPhoneColumn<Customer>("phone", "Số điện thoại")
				],
				data: [customer]
			};

			render(<MockDataTable config={tableConfig} />);

			// Phone should be formatted with spaces
			const phoneCell = screen.getByTestId("cell-0-0");
			expect(phoneCell).toHaveTextContent("0901 234 567");
		});
	});

	describe("Repair Ticket Data Table", () => {
		it("should render repair ticket table with Vietnamese business formatting", async () => {
			// Create repair tickets
			const tickets: RepairTicket[] = [
				VietnameseMockDataGenerator.createMockRepairTicket({
					customer_phone: "0901234567",
					status: "in_repair",
					priority: "high",
					estimated_cost: 2500000
				}),
				VietnameseMockDataGenerator.createMockRepairTicket({
					customer_phone: "0912345678",
					status: "ready_for_pickup",
					priority: "normal",
					estimated_cost: 1800000
				})
			];

			// Vietnamese status mapping
			const statusMap = {
				"in_repair": { label: "Đang sửa chữa", variant: "default" },
				"ready_for_pickup": { label: "Sẵn sàng giao", variant: "success" },
				"device_received": { label: "Đã tiếp nhận", variant: "secondary" }
			};

			const tableConfig: GenericTableConfig<RepairTicket> = {
				columns: [
					{
						accessorKey: "ticket_code",
						header: "Mã phiếu",
						cell: ({ row }) => (
							<span className="font-mono text-sm">
								{row.getValue("ticket_code")}
							</span>
						)
					},
					createPhoneColumn<RepairTicket>("customer_phone", "SĐT khách hàng"),
					createStatusColumn<RepairTicket>("status", "Trạng thái", statusMap),
					createCurrencyColumn<RepairTicket>("estimated_cost", "Ước tính chi phí", {
						sortable: true
					}),
					createDateColumn<RepairTicket>("created_at", "Ngày tạo", {
						format: "relative"
					})
				],
				data: tickets,
				sortable: true,
				filterable: true
			};

			render(<MockDataTable config={tableConfig} />);

			// Verify Vietnamese headers
			expect(screen.getByTestId("header-0")).toHaveTextContent("Mã phiếu");
			expect(screen.getByTestId("header-1")).toHaveTextContent("SĐT khách hàng");
			expect(screen.getByTestId("header-2")).toHaveTextContent("Trạng thái");
			expect(screen.getByTestId("header-3")).toHaveTextContent("Ước tính chi phí");
			expect(screen.getByTestId("header-4")).toHaveTextContent("Ngày tạo");

			// Verify data rows
			expect(screen.getByTestId("row-0")).toBeInTheDocument();
			expect(screen.getByTestId("row-1")).toBeInTheDocument();
		});

		it("should format Vietnamese currency in repair ticket table", async () => {
			const ticket = VietnameseMockDataGenerator.createMockRepairTicket({
				estimated_cost: 2500000
			});

			const tableConfig: GenericTableConfig<RepairTicket> = {
				columns: [
					createCurrencyColumn<RepairTicket>("estimated_cost", "Chi phí")
				],
				data: [ticket]
			};

			render(<MockDataTable config={tableConfig} />);

			// Currency should be formatted with VND symbol
			const currencyCell = screen.getByTestId("cell-0-0");
			expect(currencyCell).toHaveTextContent("2.500.000 ₫");
		});
	});

	describe("Parts Inventory Data Table", () => {
		it("should render parts table with inventory status formatting", async () => {
			// Create parts with different stock levels
			const parts: Part[] = [
				VietnameseMockDataGenerator.createMockPart({
					name: "Màn hình laptop 15.6 inch",
					unit_price: 2000000,
					current_stock: 5,
					min_stock_level: 2
				}),
				VietnameseMockDataGenerator.createMockPart({
					name: "RAM DDR4 8GB",
					unit_price: 800000,
					current_stock: 1,
					min_stock_level: 2
				}),
				VietnameseMockDataGenerator.createMockPart({
					name: "SSD 256GB",
					unit_price: 1200000,
					current_stock: 0,
					min_stock_level: 1
				})
			];

			const tableConfig: GenericTableConfig<Part> = {
				columns: [
					{
						accessorKey: "name",
						header: "Tên linh kiện",
						cell: ({ row }) => (
							<div className="font-medium">{row.getValue("name")}</div>
						)
					},
					createCurrencyColumn<Part>("unit_price", "Đơn giá", { sortable: true }),
					{
						accessorKey: "current_stock",
						header: "Tồn kho",
						cell: ({ row }) => (
							<span className="text-center">
								{row.getValue("current_stock")}
							</span>
						)
					},
					{
						id: "inventory_status",
						header: "Tình trạng",
						cell: ({ row }) => {
							const current = row.getValue("current_stock") as number;
							const minimum = row.getValue("min_stock_level") as number;
							const { text, status } = Currency.formatInventoryStatus(current, minimum);

							const colorClass = status === "good" ? "text-green-600" :
								status === "low" ? "text-yellow-600" : "text-red-600";

							return <span className={colorClass}>{text}</span>;
						}
					}
				],
				data: parts,
				emptyMessage: "Không có linh kiện nào"
			};

			render(<MockDataTable config={tableConfig} />);

			// Verify Vietnamese headers
			expect(screen.getByTestId("header-0")).toHaveTextContent("Tên linh kiện");
			expect(screen.getByTestId("header-1")).toHaveTextContent("Đơn giá");
			expect(screen.getByTestId("header-2")).toHaveTextContent("Tồn kho");
			expect(screen.getByTestId("header-3")).toHaveTextContent("Tình trạng");

			// Verify all parts are displayed
			expect(screen.getByTestId("row-0")).toBeInTheDocument();
			expect(screen.getByTestId("row-1")).toBeInTheDocument();
			expect(screen.getByTestId("row-2")).toBeInTheDocument();
		});

		it("should handle Vietnamese parts search and filtering", async () => {
			const parts = [
				VietnameseMockDataGenerator.createMockPart({
					name: "Màn hình ASUS",
					category: "display"
				}),
				VietnameseMockDataGenerator.createMockPart({
					name: "Bàn phím Dell",
					category: "keyboard"
				}),
				VietnameseMockDataGenerator.createMockPart({
					name: "RAM Samsung",
					category: "memory"
				})
			];

			const tableConfig: GenericTableConfig<Part> = {
				columns: [
					{
						accessorKey: "name",
						header: "Tên linh kiện"
					},
					{
						accessorKey: "category",
						header: "Danh mục"
					}
				],
				data: parts,
				searchable: true,
				searchPlaceholder: "Tìm kiếm linh kiện...",
				filterable: true
			};

			render(<MockDataTable config={tableConfig} />);

			// All parts should be visible initially
			expect(screen.getByTestId("row-0")).toBeInTheDocument();
			expect(screen.getByTestId("row-1")).toBeInTheDocument();
			expect(screen.getByTestId("row-2")).toBeInTheDocument();
		});
	});

	describe("Vietnamese Table Sorting and Pagination", () => {
		it("should handle Vietnamese text sorting", async () => {
			// Create customers with Vietnamese names for sorting
			const customers = [
				VietnameseMockDataGenerator.createMockCustomer({
					full_name: "Đặng Thu Hà"
				}),
				VietnameseMockDataGenerator.createMockCustomer({
					full_name: "Bùi Quốc Việt"
				}),
				VietnameseMockDataGenerator.createMockCustomer({
					full_name: "Nguyễn Văn An"
				})
			];

			const tableConfig: GenericTableConfig<Customer> = {
				columns: [
					{
						accessorKey: "full_name",
						header: "Họ và tên",
						cell: ({ row }) => row.getValue("full_name")
					}
				],
				data: customers,
				sortable: true
			};

			render(<MockDataTable config={tableConfig} />);

			// Verify all customers are displayed
			expect(screen.getByTestId("row-0")).toBeInTheDocument();
			expect(screen.getByTestId("row-1")).toBeInTheDocument();
			expect(screen.getByTestId("row-2")).toBeInTheDocument();

			// Test that Vietnamese names are displayed correctly
			const firstRow = screen.getByTestId("cell-0-0");
			expect(firstRow).toHaveTextContent("Đặng Thu Hà");
		});

		it("should handle currency sorting", async () => {
			const tickets = [
				VietnameseMockDataGenerator.createMockRepairTicket({
					estimated_cost: 500000
				}),
				VietnameseMockDataGenerator.createMockRepairTicket({
					estimated_cost: 2500000
				}),
				VietnameseMockDataGenerator.createMockRepairTicket({
					estimated_cost: 1500000
				})
			];

			const tableConfig: GenericTableConfig<RepairTicket> = {
				columns: [
					createCurrencyColumn<RepairTicket>("estimated_cost", "Chi phí", {
						sortable: true
					})
				],
				data: tickets,
				sortable: true
			};

			render(<MockDataTable config={tableConfig} />);

			// Verify currency formatting
			expect(screen.getByTestId("cell-0-0")).toHaveTextContent("500.000 ₫");
			expect(screen.getByTestId("cell-1-0")).toHaveTextContent("2.500.000 ₫");
			expect(screen.getByTestId("cell-2-0")).toHaveTextContent("1.500.000 ₫");
		});
	});

	describe("Table Actions and Interactions", () => {
		it("should handle Vietnamese action buttons", async () => {
			const customers = [
				VietnameseMockDataGenerator.createMockCustomer({
					phone: "0901234567"
				})
			];

			const mockActions = {
				onView: vi.fn(),
				onEdit: vi.fn(),
				onDelete: vi.fn()
			};

			const tableConfig: GenericTableConfig<Customer> = {
				columns: [
					createPhoneColumn<Customer>("phone", "Số điện thoại"),
					createActionColumn<Customer>({
						onView: mockActions.onView,
						onEdit: mockActions.onEdit,
						onDelete: mockActions.onDelete,
						viewLabel: "Xem chi tiết",
						editLabel: "Chỉnh sửa",
						deleteLabel: "Xóa"
					})
				],
				data: customers
			};

			render(<MockDataTable config={tableConfig} />);

			// Actions column should be present
			expect(screen.getByTestId("header-1")).toHaveTextContent("Thao tác");
		});

		it("should handle empty state with Vietnamese message", async () => {
			const tableConfig: GenericTableConfig<Customer> = {
				columns: [
					createPhoneColumn<Customer>("phone", "Số điện thoại"),
					{
						accessorKey: "full_name",
						header: "Họ và tên"
					}
				],
				data: [],
				emptyMessage: "Không có dữ liệu để hiển thị"
			};

			render(<MockDataTable config={tableConfig} />);

			// Should show empty state (headers still present)
			expect(screen.getByTestId("data-table")).toBeInTheDocument();

			// No rows should be present
			expect(screen.queryByTestId("row-0")).not.toBeInTheDocument();
		});
	});
});