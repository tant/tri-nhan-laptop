/**
 * @fileoverview Example tests demonstrating Vietnamese locale testing utilities
 * Shows best practices for testing Vietnamese business logic, formatting, and validation
 *
 * @version 1.0.0
 * @since Phase 3.4.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import VietnameseLocaleUtils, {
  VietnameseCurrencyTester,
  VietnameseDateTimeTester,
  VietnamesePhoneTester,
  VietnameseTestDataGenerator,
  VietnameseBusinessValidator,
  VietnameseTestSetup,
  VietnameseTestAssertions,
  VIETNAMESE_TEXT_SAMPLES,
  VIETNAMESE_BUSINESS_CONSTANTS,
} from '../utils/vietnamese-locale-testing';

describe('Vietnamese Locale Testing Examples', () => {
  beforeEach(() => {
    // Setup Vietnamese test environment for each test
    VietnameseTestSetup.createVietnameseTestEnvironment();
  });

  describe('Currency Formatting Examples', () => {
    it('should format VND amounts correctly', () => {
      const amounts = VietnameseCurrencyTester.generateValidAmounts();

      amounts.forEach(amount => {
        const formatted = VietnameseCurrencyTester.testVNDFormatting(amount);

        // Use the assertion helper
        VietnameseTestAssertions.assertVietnameseCurrencyFormat(formatted, amount);

        // Additional specific checks
        if (amount === 0) {
          expect(formatted).toMatch(/0.*₫/);
        } else if (amount >= 1000000) {
          expect(formatted).toMatch(/\d{1,3}\.\d{3}\.\d{3}.*₫/);
        }
      });
    });

    it('should validate repair cost ranges for Vietnamese market', () => {
      const validAmounts = [50000, 150000, 500000, 1000000];
      const invalidAmounts = [-100000, 0.5, 15000000];

      validAmounts.forEach(amount => {
        const validation = VietnameseCurrencyTester.validateRepairAmount(amount);
        expect(validation.isValid).toBe(true);
        expect(validation.error).toBeUndefined();
      });

      invalidAmounts.forEach(amount => {
        const validation = VietnameseCurrencyTester.validateRepairAmount(amount);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBeTruthy();
      });
    });
  });

  describe('Date/Time Formatting Examples', () => {
    it('should format dates in Vietnamese format', () => {
      const testDate = new Date('2025-01-15T10:30:00Z');

      const vietnameseDate = VietnameseDateTimeTester.formatVietnameseDate(testDate);
      const vietnameseTime = VietnameseDateTimeTester.formatVietnameseTime(testDate);
      const vietnameseDateTime = VietnameseDateTimeTester.formatVietnameseDateTime(testDate);

      // Use assertion helpers
      VietnameseTestAssertions.assertVietnameseDateFormat(vietnameseDate);

      // Verify specific format expectations
      expect(vietnameseDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(vietnameseTime).toMatch(/^\d{2}:\d{2}$/);
      expect(vietnameseDateTime).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/);
    });

    it('should calculate repair durations based on Vietnamese business rules', () => {
      const testCases = [
        { category: 'diagnosis', priority: 'urgent', expectedDays: 1 },
        { category: 'hardware', priority: 'normal', expectedDays: 3 },
        { category: 'screen', priority: 'high', expectedDays: 2 },
        { category: 'data_recovery', priority: 'low', expectedDays: 8 },
      ];

      testCases.forEach(({ category, priority, expectedDays }) => {
        const duration = VietnameseDateTimeTester.calculateRepairDuration(category, priority);

        expect(duration.estimatedDays).toBeCloseTo(expectedDays, 0);
        expect(duration.businessDaysOnly).toBe(true);
      });
    });

    it('should validate Vietnamese business hours', () => {
      const businessHours = VietnameseDateTimeTester.generateBusinessHours();

      // Test during business hours
      const morningTime = new Date('2025-01-15T10:00:00');
      VietnameseTestAssertions.assertBusinessHours(morningTime, true);
      expect(businessHours.isOpen(morningTime)).toBe(true);

      // Test outside business hours
      const eveningTime = new Date('2025-01-15T20:00:00');
      VietnameseTestAssertions.assertBusinessHours(eveningTime, false);
      expect(businessHours.isOpen(eveningTime)).toBe(false);
    });
  });

  describe('Phone Number Validation Examples', () => {
    it('should generate and validate Vietnamese phone numbers', () => {
      const validPhones = VietnamesePhoneTester.generateValidPhones(10);

      validPhones.forEach(phone => {
        // Use assertion helper
        VietnameseTestAssertions.assertValidVietnamesePhone(phone);

        // Test normalization and formatting
        const normalized = VietnamesePhoneTester.normalizeForStorage(phone);
        const formatted = VietnamesePhoneTester.formatForDisplay(normalized);

        expect(normalized).toMatch(/^\d{10}$/);
        expect(formatted).toMatch(/^\d{4} \d{3} \d{3}$/);
      });
    });

    it('should reject invalid Vietnamese phone numbers', () => {
      const invalidPhones = VietnamesePhoneTester.generateInvalidPhones();

      invalidPhones.forEach(phone => {
        expect(() => {
          VietnameseTestAssertions.assertValidVietnamesePhone(phone);
        }).toThrow();
      });
    });

    it('should handle phone number edge cases', () => {
      const edgeCases = [
        { input: '090 123 4567', expected: '0901234567' },
        { input: '090-123-4567', expected: '0901234567' },
        { input: '090.123.4567', expected: '0901234567' },
        { input: '+84901234567', expected: '84901234567' },
      ];

      edgeCases.forEach(({ input, expected }) => {
        const normalized = VietnamesePhoneTester.normalizeForStorage(input);
        expect(normalized).toBe(expected);
      });
    });
  });

  describe('Business Data Generation Examples', () => {
    it('should generate realistic Vietnamese customer data', () => {
      const customers = Array.from({ length: 5 }, () =>
        VietnameseTestDataGenerator.generateCustomer()
      );

      customers.forEach(customer => {
        // Validate generated data
        const validation = VietnameseBusinessValidator.validateCustomer(customer);
        expect(validation.isValid).toBe(true);

        // Check Vietnamese-specific patterns
        expect(VIETNAMESE_TEXT_SAMPLES.customerNames).toContain(customer.full_name);
        VietnameseTestAssertions.assertValidVietnamesePhone(customer.phone);
      });
    });

    it('should generate complete repair tickets with Vietnamese context', () => {
      const tickets = Array.from({ length: 5 }, () =>
        VietnameseTestDataGenerator.generateRepairTicket()
      );

      tickets.forEach(ticket => {
        // Validate ticket data
        const validation = VietnameseBusinessValidator.validateRepairTicket(ticket);
        expect(validation.isValid).toBe(true);

        // Check Vietnamese business constants
        expect(VIETNAMESE_BUSINESS_CONSTANTS.repairStatuses).toContain(ticket.status);
        expect(VIETNAMESE_BUSINESS_CONSTANTS.priorities).toContain(ticket.priority);
        expect(VIETNAMESE_BUSINESS_CONSTANTS.repairCategories).toContain(ticket.repair_category);

        // Check Vietnamese text content
        expect(VIETNAMESE_TEXT_SAMPLES.issueDescriptions).toContain(ticket.issue_description);
        expect(VIETNAMESE_TEXT_SAMPLES.customerDescriptions).toContain(ticket.customer_description);

        // Validate currency amount
        const costValidation = VietnameseCurrencyTester.validateRepairAmount(ticket.estimated_cost);
        expect(costValidation.isValid).toBe(true);
      });
    });

    it('should generate business scenario with consistent data relationships', () => {
      const scenario = VietnameseTestDataGenerator.generateBusinessScenario();

      expect(scenario.customers.length).toBeGreaterThan(0);
      expect(scenario.tickets.length).toBeGreaterThan(0);
      expect(scenario.summary.totalCustomers).toBe(scenario.customers.length);
      expect(scenario.summary.totalTickets).toBe(scenario.tickets.length);

      // Verify data consistency
      scenario.tickets.forEach(ticket => {
        const customerExists = scenario.customers.some(
          customer => customer.phone === ticket.customer_phone
        );
        expect(customerExists).toBe(true);
      });

      // Check status distribution
      const expectedStatuses = Object.keys(scenario.summary.statusDistribution);
      expectedStatuses.forEach(status => {
        expect(VIETNAMESE_BUSINESS_CONSTANTS.repairStatuses).toContain(status);
      });
    });
  });

  describe('Business Validation Examples', () => {
    it('should validate repair tickets according to Vietnamese business rules', () => {
      // Valid ticket
      const validTicket = {
        customer_phone: '0901234567',
        customer_description: 'Máy tính không khởi động được',
        issue_description: 'Kiểm tra nguồn và bo mạch chủ',
        priority: 'normal',
        estimated_cost: 500000,
      };

      const validValidation = VietnameseBusinessValidator.validateRepairTicket(validTicket);
      expect(validValidation.isValid).toBe(true);
      expect(validValidation.errors).toHaveLength(0);

      // Invalid ticket
      const invalidTicket = {
        customer_phone: '123456789', // Invalid phone
        customer_description: '', // Missing description
        issue_description: '', // Missing technical description
        priority: '', // Missing priority
        estimated_cost: -100000, // Negative cost
      };

      const invalidValidation = VietnameseBusinessValidator.validateRepairTicket(invalidTicket);
      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.errors.length).toBeGreaterThan(0);

      // Check specific Vietnamese error messages
      expect(invalidValidation.errors).toContain('Số điện thoại không đúng định dạng Việt Nam');
      expect(invalidValidation.errors).toContain('Mô tả vấn đề từ khách hàng là bắt buộc');
      expect(invalidValidation.errors).toContain('Chi phí ước tính không thể âm');
    });

    it('should validate customer data with Vietnamese requirements', () => {
      // Valid customer
      const validCustomer = {
        phone: '0901234567',
        full_name: 'Nguyễn Văn An',
        address: 'Số 123, Đường ABC, Quận 1, TP.HCM',
      };

      const validValidation = VietnameseBusinessValidator.validateCustomer(validCustomer);
      expect(validValidation.isValid).toBe(true);

      // Invalid customer
      const invalidCustomer = {
        phone: '123456789', // Invalid phone
        full_name: 'A', // Too short name
      };

      const invalidValidation = VietnameseBusinessValidator.validateCustomer(invalidCustomer);
      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.errors).toContain('Số điện thoại không đúng định dạng Việt Nam');
      expect(invalidValidation.errors).toContain('Tên khách hàng phải có ít nhất 2 ký tự');
    });
  });

  describe('Integration Testing Examples', () => {
    it('should test complete Vietnamese business workflow', () => {
      // Generate customer
      const customer = VietnameseTestDataGenerator.generateCustomer({
        full_name: 'Nguyễn Văn An',
        phone: '0901234567',
      });

      // Validate customer
      const customerValidation = VietnameseBusinessValidator.validateCustomer(customer);
      expect(customerValidation.isValid).toBe(true);

      // Generate repair ticket for customer
      const ticket = VietnameseTestDataGenerator.generateRepairTicket({
        customer_phone: customer.phone,
        customer_description: 'Laptop không khởi động được sau khi rơi',
        issue_description: 'Kiểm tra bo mạch chủ và ổ cứng',
        priority: 'high',
        repair_category: 'hardware',
      });

      // Validate ticket
      const ticketValidation = VietnameseBusinessValidator.validateRepairTicket(ticket);
      expect(ticketValidation.isValid).toBe(true);

      // Calculate repair duration
      const duration = VietnameseDateTimeTester.calculateRepairDuration(
        ticket.repair_category,
        ticket.priority
      );
      expect(duration.estimatedDays).toBeGreaterThan(0);

      // Format cost in Vietnamese currency
      const formattedCost = VietnameseCurrencyTester.testVNDFormatting(ticket.estimated_cost);
      VietnameseTestAssertions.assertVietnameseCurrencyFormat(formattedCost, ticket.estimated_cost);

      // Format phone for display
      const formattedPhone = VietnamesePhoneTester.formatForDisplay(customer.phone);
      expect(formattedPhone).toMatch(/^\d{4} \d{3} \d{3}$/);
    });

    it('should test Vietnamese locale formatting consistency', () => {
      const testDate = new Date('2025-01-15T14:30:00');
      const testAmount = 1500000;
      const testPhone = '0901234567';

      // Format all Vietnamese locale data
      const formattedDate = VietnameseDateTimeTester.formatVietnameseDate(testDate);
      const formattedTime = VietnameseDateTimeTester.formatVietnameseTime(testDate);
      const formattedCurrency = VietnameseCurrencyTester.testVNDFormatting(testAmount);
      const formattedPhone = VietnamesePhoneTester.formatForDisplay(testPhone);

      // Validate all formatting
      VietnameseTestAssertions.assertVietnameseDateFormat(formattedDate);
      VietnameseTestAssertions.assertVietnameseCurrencyFormat(formattedCurrency, testAmount);
      VietnameseTestAssertions.assertValidVietnamesePhone(testPhone);

      // Check consistency
      expect(formattedDate).toMatch(/15\/01\/2025/);
      expect(formattedTime).toMatch(/14:30/);
      expect(formattedCurrency).toContain('1.500.000');
      expect(formattedPhone).toBe('0901 234 567');
    });
  });
});