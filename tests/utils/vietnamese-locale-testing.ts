/**
 * @fileoverview Vietnamese Locale Testing Utilities
 * Comprehensive utilities for testing Vietnamese language features, formatting, and business logic
 *
 * @version 1.0.0
 * @since Phase 3.4.2
 */

import { vi } from 'vitest';

/**
 * Vietnamese locale testing configuration
 */
export const VIETNAMESE_LOCALE_CONFIG = {
  locale: 'vi-VN',
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VND',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24-hour',
  numberFormat: {
    decimal: ',',
    thousands: '.',
  },
} as const;

/**
 * Vietnamese business constants for testing
 */
export const VIETNAMESE_BUSINESS_CONSTANTS = {
  phoneFormats: {
    valid: [
      '0901234567',
      '0912345678',
      '0987654321',
      '0356789012',
      '0778901234',
      '0865432109',
    ],
    invalid: [
      '123456789',      // Too short
      '09012345678',    // Too long
      '1901234567',     // Invalid prefix
      '0201234567',     // Invalid mobile prefix
      '+84901234567',   // International format (should be normalized)
      '090 123 4567',   // With spaces
    ],
  },
  repairStatuses: [
    'draft',
    'device_received',
    'initial_diagnosis',
    'diagnosis_complete',
    'waiting_for_approval',
    'approved',
    'parts_ordered',
    'parts_received',
    'in_progress',
    'repair_complete',
    'quality_check',
    'ready_for_pickup',
    'completed',
    'cancelled_by_customer',
    'cancelled_by_shop',
    'abandoned'
  ],
  priorities: ['low', 'normal', 'high', 'urgent'],
  repairCategories: [
    'diagnosis',
    'hardware',
    'software',
    'screen',
    'keyboard',
    'battery',
    'cooling',
    'data_recovery',
    'upgrade',
    'maintenance'
  ],
} as const;

/**
 * Vietnamese text samples for testing
 */
export const VIETNAMESE_TEXT_SAMPLES = {
  customerNames: [
    'Nguyễn Văn An',
    'Trần Thị Bình',
    'Lê Hoàng Cường',
    'Phạm Thị Dung',
    'Hoàng Văn Em',
    'Vũ Thị Phượng',
    'Đặng Minh Quân',
    'Bùi Thị Hoa',
    'Đinh Văn Tuấn',
    'Lý Thị Nga',
  ],
  addresses: [
    'Số 123, Đường Nguyễn Trãi, Quận 1, TP.HCM',
    'Tầng 5, Tòa nhà ABC, Phố Láng Hạ, Ba Đình, Hà Nội',
    'Lô B2-09, Khu đô thị Ciputra, Nam Từ Liêm, Hà Nội',
    'Căn hộ 15A, Chung cư Vinhomes, Quận 9, TP.HCM',
    'Số 456, Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
    'Villa 12, Khu dân cư Phú Mỹ Hưng, Quận 7, TP.HCM',
  ],
  deviceBrands: [
    'Dell', 'HP', 'Lenovo', 'Asus', 'Acer',
    'MSI', 'Apple', 'Samsung', 'LG', 'Toshiba'
  ],
  issueDescriptions: [
    'Laptop không khởi động được, đèn nguồn không sáng',
    'Màn hình bị vỡ, hiển thị không rõ nét',
    'Bàn phím một số phím không hoạt động',
    'Máy tính chạy rất chậm, thường xuyên bị treo',
    'Pin không sạc được, máy chỉ chạy khi cắm điện',
    'Quạt tản nhiệt kêu to, máy nóng quá mức',
    'Ổ cứng bị lỗi, không thể truy cập dữ liệu',
    'Cổng USB không nhận thiết bị ngoài',
    'Wifi không kết nối được, card mạng có vấn đề',
    'Loa không có tiếng, jack tai nghe bị lỗi',
  ],
  customerDescriptions: [
    'Máy tắt đột ngột khi đang làm việc',
    'Màn hình bị tối đen sau khi rơi',
    'Không gõ được một số phím quan trọng',
    'Máy khởi động mất 10 phút, chạy ứng dụng rất chậm',
    'Pin hiển thị 0%, không sạc được dù cắm đúng sạc',
    'Quạt kêu ồn ào, máy nóng không thể chạm vào',
    'Máy báo lỗi ổ cứng, không vào được Windows',
    'Cắm USB không nhận, chuột không hoạt động',
    'Không kết nối được mạng Wifi nhà',
    'Không có âm thanh, tai nghe cũng không có tiếng',
  ],
  technicalNotes: [
    'Kiểm tra nguồn và bo mạch chủ',
    'Thay thế màn hình LCD mới',
    'Vệ sinh và thay thế bàn phím',
    'Cài đặt lại hệ điều hành, nâng cấp RAM',
    'Thay pin mới, kiểm tra mạch sạc',
    'Vệ sinh quạt tản nhiệt, thay keo tản nhiệt',
    'Khôi phục dữ liệu và thay ổ cứng mới',
    'Thay thế cổng USB, hàn lại bo mạch',
    'Cài đặt lại driver card mạng',
    'Kiểm tra và sửa chữa mạch âm thanh',
  ],
} as const;

/**
 * Vietnamese currency testing utilities
 */
export class VietnameseCurrencyTester {
  /**
   * Generate valid VND amounts for testing
   */
  static generateValidAmounts(): number[] {
    return [
      0,           // Free service
      50000,       // Small repair
      150000,      // Standard service
      500000,      // Major repair
      1000000,     // Expensive repair
      2500000,     // High-end service
      5000000,     // Premium repair
    ];
  }

  /**
   * Generate invalid amounts that should be rejected
   */
  static generateInvalidAmounts(): number[] {
    return [
      -100000,     // Negative amount
      0.5,         // Decimal (VND doesn't use decimals)
      999.99,      // Decimal
      100000000,   // Unreasonably high
    ];
  }

  /**
   * Test VND formatting
   */
  static testVNDFormatting(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Validate VND amount range for laptop repair business
   */
  static validateRepairAmount(amount: number): {
    isValid: boolean;
    error?: string;
  } {
    if (amount < 0) {
      return { isValid: false, error: 'Số tiền không thể âm' };
    }
    if (amount > 10000000) {
      return { isValid: false, error: 'Số tiền quá cao cho dịch vụ sửa chữa' };
    }
    if (amount % 1000 !== 0) {
      return { isValid: false, error: 'Số tiền phải là bội số của 1.000 VND' };
    }
    return { isValid: true };
  }
}

/**
 * Vietnamese date/time testing utilities
 */
export class VietnameseDateTimeTester {
  /**
   * Format date in Vietnamese format
   */
  static formatVietnameseDate(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }

  /**
   * Format time in Vietnamese format
   */
  static formatVietnameseTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
    });
  }

  /**
   * Format complete datetime in Vietnamese
   */
  static formatVietnameseDateTime(date: Date): string {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
    });
  }

  /**
   * Generate business hours for testing
   */
  static generateBusinessHours(): {
    open: string;
    close: string;
    isOpen: (time: Date) => boolean;
  } {
    return {
      open: '08:00',
      close: '18:00',
      isOpen: (time: Date) => {
        const hour = time.getHours();
        return hour >= 8 && hour < 18;
      },
    };
  }

  /**
   * Calculate repair time estimates (Vietnamese business days)
   */
  static calculateRepairDuration(
    category: string,
    priority: string
  ): {
    estimatedDays: number;
    businessDaysOnly: boolean;
  } {
    const baseDays = {
      diagnosis: 1,
      software: 2,
      hardware: 3,
      screen: 2,
      keyboard: 1,
      battery: 1,
      cooling: 2,
      data_recovery: 5,
      upgrade: 2,
      maintenance: 1,
    }[category] || 3;

    const priorityMultiplier = {
      urgent: 0.5,
      high: 0.7,
      normal: 1,
      low: 1.5,
    }[priority] || 1;

    return {
      estimatedDays: Math.ceil(baseDays * priorityMultiplier),
      businessDaysOnly: true,
    };
  }
}

/**
 * Vietnamese phone number testing utilities
 */
export class VietnamesePhoneTester {
  /**
   * Generate valid Vietnamese phone numbers for testing
   */
  static generateValidPhones(count: number = 5): string[] {
    const prefixes = ['090', '091', '094', '088', '035', '077', '086'];
    const phones: string[] = [];

    for (let i = 0; i < count; i++) {
      const prefix = prefixes[i % prefixes.length];
      const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      phones.push(`${prefix}${suffix}`);
    }

    return phones;
  }

  /**
   * Generate invalid phone numbers for testing
   */
  static generateInvalidPhones(): string[] {
    return [
      '123456789',      // Wrong length
      '0201234567',     // Invalid prefix
      '84901234567',    // Missing leading zero
      '090-123-4567',   // With dashes
      '090 123 4567',   // With spaces
      '090.123.4567',   // With dots
      'abc1234567',     // With letters
      '',               // Empty
      '090123456',      // Too short
      '09012345678',    // Too long
    ];
  }

  /**
   * Normalize phone number for storage
   */
  static normalizeForStorage(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Format phone number for display
   */
  static formatForDisplay(phone: string): string {
    const normalized = this.normalizeForStorage(phone);
    if (normalized.length === 10) {
      return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
    }
    return phone;
  }
}

/**
 * Mock Vietnamese data generator for testing
 */
export class VietnameseTestDataGenerator {
  private static customerCounter = 1;
  private static ticketCounter = 1;

  /**
   * Generate a random Vietnamese customer
   */
  static generateCustomer(overrides: Record<string, any> = {}) {
    const customer = {
      phone: VietnamesePhoneTester.generateValidPhones(1)[0],
      full_name: VIETNAMESE_TEXT_SAMPLES.customerNames[
        Math.floor(Math.random() * VIETNAMESE_TEXT_SAMPLES.customerNames.length)
      ],
      address: VIETNAMESE_TEXT_SAMPLES.addresses[
        Math.floor(Math.random() * VIETNAMESE_TEXT_SAMPLES.addresses.length)
      ],
      created_at: new Date().toISOString(),
      notes: null,
      ...overrides,
    };

    this.customerCounter++;
    return customer;
  }

  /**
   * Generate a random Vietnamese repair ticket
   */
  static generateRepairTicket(overrides: Record<string, any> = {}) {
    const statusIndex = Math.floor(Math.random() * VIETNAMESE_BUSINESS_CONSTANTS.repairStatuses.length);
    const categoryIndex = Math.floor(Math.random() * VIETNAMESE_BUSINESS_CONSTANTS.repairCategories.length);
    const priorityIndex = Math.floor(Math.random() * VIETNAMESE_BUSINESS_CONSTANTS.priorities.length);
    const issueIndex = Math.floor(Math.random() * VIETNAMESE_TEXT_SAMPLES.issueDescriptions.length);

    const ticket = {
      id: `ticket-${this.ticketCounter}`,
      ticket_code: `LRP-2025-${this.ticketCounter.toString().padStart(6, '0')}`,
      customer_phone: VietnamesePhoneTester.generateValidPhones(1)[0],
      status: VIETNAMESE_BUSINESS_CONSTANTS.repairStatuses[statusIndex],
      priority: VIETNAMESE_BUSINESS_CONSTANTS.priorities[priorityIndex],
      repair_category: VIETNAMESE_BUSINESS_CONSTANTS.repairCategories[categoryIndex],
      issue_description: VIETNAMESE_TEXT_SAMPLES.issueDescriptions[issueIndex],
      customer_description: VIETNAMESE_TEXT_SAMPLES.customerDescriptions[issueIndex],
      estimated_cost: VietnameseCurrencyTester.generateValidAmounts()[
        Math.floor(Math.random() * VietnameseCurrencyTester.generateValidAmounts().length)
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };

    this.ticketCounter++;
    return ticket;
  }

  /**
   * Generate test data set for Vietnamese business scenarios
   */
  static generateBusinessScenario() {
    const customers = Array.from({ length: 5 }, () => this.generateCustomer());
    const tickets = customers.flatMap(customer =>
      Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
        this.generateRepairTicket({ customer_phone: customer.phone })
      )
    );

    return {
      customers,
      tickets,
      summary: {
        totalCustomers: customers.length,
        totalTickets: tickets.length,
        statusDistribution: tickets.reduce((acc, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}

/**
 * Vietnamese business validation utilities for testing
 */
export class VietnameseBusinessValidator {
  /**
   * Validate repair ticket data according to Vietnamese business rules
   */
  static validateRepairTicket(ticket: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields validation
    if (!ticket.customer_phone) {
      errors.push('Số điện thoại khách hàng là bắt buộc');
    }
    if (!ticket.customer_description) {
      errors.push('Mô tả vấn đề từ khách hàng là bắt buộc');
    }
    if (!ticket.issue_description) {
      errors.push('Mô tả kỹ thuật từ nhân viên là bắt buộc');
    }
    if (!ticket.priority) {
      errors.push('Mức độ ưu tiên là bắt buộc');
    }

    // Business rule validations
    if (ticket.estimated_cost && ticket.estimated_cost < 0) {
      errors.push('Chi phí ước tính không thể âm');
    }
    if (ticket.estimated_cost && ticket.estimated_cost > 10000000) {
      errors.push('Chi phí ước tính quá cao');
    }

    // Phone validation
    if (ticket.customer_phone && !this.isValidVietnamesePhone(ticket.customer_phone)) {
      errors.push('Số điện thoại không đúng định dạng Việt Nam');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Vietnamese phone number
   */
  private static isValidVietnamesePhone(phone: string): boolean {
    const normalized = phone.replace(/\D/g, '');
    return /^(03|05|07|08|09)[0-9]{8}$/.test(normalized);
  }

  /**
   * Validate Vietnamese customer data
   */
  static validateCustomer(customer: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!customer.phone) {
      errors.push('Số điện thoại là bắt buộc');
    } else if (!this.isValidVietnamesePhone(customer.phone)) {
      errors.push('Số điện thoại không đúng định dạng Việt Nam');
    }

    if (!customer.full_name || customer.full_name.trim().length < 2) {
      errors.push('Tên khách hàng phải có ít nhất 2 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Setup helpers for Vietnamese locale testing
 */
export class VietnameseTestSetup {
  /**
   * Mock Vietnamese browser environment
   */
  static mockVietnameseBrowserEnvironment() {
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        language: 'vi-VN',
        languages: ['vi-VN', 'vi', 'en-US', 'en'],
        userAgent: 'Vietnamese Locale Test Environment',
      },
    });

    // Mock Intl for consistent formatting
    vi.stubGlobal('Intl', {
      NumberFormat: vi.fn((locale, options) => ({
        format: (number: number) => {
          if (options?.style === 'currency' && options?.currency === 'VND') {
            return `${number.toLocaleString('vi-VN')} ₫`;
          }
          return number.toLocaleString('vi-VN');
        },
      })),
      DateTimeFormat: vi.fn((locale, options) => ({
        format: (date: Date) => {
          return date.toLocaleDateString('vi-VN', options);
        },
      })),
    });
  }

  /**
   * Setup Vietnamese timezone for testing
   */
  static setupVietnameseTimezone() {
    const originalDate = Date;

    // Mock Date to use Vietnamese timezone
    vi.stubGlobal('Date', class extends originalDate {
      constructor(...args: any[]) {
        super(...args);
        // Adjust for Vietnamese timezone offset if needed
      }

      static now() {
        return originalDate.now();
      }
    });
  }

  /**
   * Create Vietnamese test environment
   */
  static createVietnameseTestEnvironment() {
    this.mockVietnameseBrowserEnvironment();
    this.setupVietnameseTimezone();

    return {
      locale: VIETNAMESE_LOCALE_CONFIG.locale,
      timezone: VIETNAMESE_LOCALE_CONFIG.timezone,
      currency: VIETNAMESE_LOCALE_CONFIG.currency,
      testData: VietnameseTestDataGenerator.generateBusinessScenario(),
    };
  }
}

/**
 * Assertions for Vietnamese locale testing
 */
export class VietnameseTestAssertions {
  /**
   * Assert Vietnamese phone number format
   */
  static assertValidVietnamesePhone(phone: string) {
    const normalized = phone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09)[0-9]{8}$/.test(normalized)) {
      throw new Error(`Expected valid Vietnamese phone number, got: ${phone}`);
    }
  }

  /**
   * Assert Vietnamese currency format
   */
  static assertVietnameseCurrencyFormat(formatted: string, amount: number) {
    const expectedPattern = /^\d{1,3}(\.\d{3})*\s₫$/;
    if (!expectedPattern.test(formatted)) {
      throw new Error(`Expected Vietnamese currency format, got: ${formatted} for amount ${amount}`);
    }
  }

  /**
   * Assert Vietnamese date format
   */
  static assertVietnameseDateFormat(formatted: string) {
    const expectedPattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!expectedPattern.test(formatted)) {
      throw new Error(`Expected Vietnamese date format (dd/MM/yyyy), got: ${formatted}`);
    }
  }

  /**
   * Assert Vietnamese business hours
   */
  static assertBusinessHours(time: Date, shouldBeOpen: boolean) {
    const hour = time.getHours();
    const isOpen = hour >= 8 && hour < 18;

    if (isOpen !== shouldBeOpen) {
      throw new Error(
        `Expected business to be ${shouldBeOpen ? 'open' : 'closed'} at ${hour}:00, but it was ${isOpen ? 'open' : 'closed'}`
      );
    }
  }
}

/**
 * Export all utilities for easy import
 */
export default {
  config: VIETNAMESE_LOCALE_CONFIG,
  constants: VIETNAMESE_BUSINESS_CONSTANTS,
  textSamples: VIETNAMESE_TEXT_SAMPLES,
  currency: VietnameseCurrencyTester,
  dateTime: VietnameseDateTimeTester,
  phone: VietnamesePhoneTester,
  dataGenerator: VietnameseTestDataGenerator,
  validator: VietnameseBusinessValidator,
  setup: VietnameseTestSetup,
  assertions: VietnameseTestAssertions,
};