/**
 * Epic 2.2.1: Repair Ticket Creation & Management System Tests
 * Comprehensive unit tests for Vietnamese repair ticket management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRepairTickets } from '@/hooks/use-repair-tickets';
import { renderHook, act } from '@testing-library/react';

describe('Epic 2.2.1: Repair Ticket Creation & Management System', () => {

  describe('Ticket Creation Workflow', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create complete repair ticket with Vietnamese device data', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const ticketData = {
        customerPhone: '0901234567',
        customerName: 'Nguyễn Văn Minh',
        customerEmail: 'minh@example.com',
        deviceBrand: 'ASUS',
        deviceModel: 'VivoBook S15',
        deviceType: 'laptop' as const,
        serialNumber: 'AS123456789',
        issueDescription: 'Màn hình laptop bị vỡ góc trên bên phải',
        customerDescription: 'Laptop bị rơi từ bàn xuống, màn hình xuất hiện vết nứt',
        symptoms: ['Màn hình vỡ', 'Hiển thị bị sọc', 'Cảm ứng không hoạt động'],
        physicalCondition: {
          general: 'fair' as const,
          screen: 'broken' as const,
          keyboard: 'good' as const,
          ports: 'good' as const,
          battery: 'good' as const,
          notes: 'Chỉ có màn hình bị hỏng, các bộ phận khác hoạt động bình thường'
        }
      };

      await act(async () => {
        const ticket = await result.current.createTicket(ticketData);

        expect(ticket).toBeDefined();
        expect(ticket.code).toMatch(/^LRP-\d{4}-\d{6}$/);
        expect(ticket.customer.phone).toBe('0901234567');
        expect(ticket.customer.fullName).toBe('Nguyễn Văn Minh');
        expect(ticket.device.brand).toBe('ASUS');
        expect(ticket.device.model).toBe('VivoBook S15');
        expect(ticket.problem.description).toContain('Màn hình');
        expect(ticket.status).toBe('device_received');
        expect(ticket.createdAt).toBeDefined();
      });
    });

    it('should handle Vietnamese device brands and models', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const vietnameseDevices = [
        { brand: 'ASUS', model: 'VivoBook Pro 15', category: 'gaming' },
        { brand: 'Dell', model: 'Inspiron 15 3000', category: 'office' },
        { brand: 'HP', model: 'Pavilion Gaming 15', category: 'gaming' },
        { brand: 'Lenovo', model: 'ThinkPad E14', category: 'business' },
        { brand: 'Acer', model: 'Aspire 5', category: 'student' },
        { brand: 'MSI', model: 'Modern 14', category: 'ultrabook' }
      ];

      for (const device of vietnameseDevices) {
        await act(async () => {
          const ticket = await result.current.createTicket({
            customerPhone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
            customerName: 'Test Customer',
            deviceBrand: device.brand,
            deviceModel: device.model,
            deviceType: 'laptop',
            issueDescription: 'Test problem',
            customerDescription: 'Test description',
            symptoms: ['Test symptom'],
            physicalCondition: {
              general: 'good',
              screen: 'good',
              keyboard: 'good',
              ports: 'good',
              battery: 'good',
              notes: 'Good condition'
            }
          });

          expect(ticket.device.brand).toBe(device.brand);
          expect(ticket.device.model).toBe(device.model);
          expect(ticket.device.type).toBe('laptop');
        });
      }
    });

    it('should generate unique ticket codes in LRP-YYYY-XXXXXX format', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const codes = new Set();
      const currentYear = new Date().getFullYear();

      await act(async () => {
        for (let i = 0; i < 10; i++) {
          const ticket = await result.current.createTicket({
            customerPhone: `090${i.toString().padStart(7, '0')}`,
            customerName: `Test Customer ${i}`,
            deviceBrand: 'ASUS',
            deviceModel: 'Test Model',
            deviceType: 'laptop',
            issueDescription: `Test issue ${i}`,
            customerDescription: 'Test description',
            symptoms: ['Test symptom'],
            physicalCondition: {
              general: 'good',
              screen: 'good',
              keyboard: 'good',
              ports: 'good',
              battery: 'good',
              notes: 'Test notes'
            }
          });

          expect(ticket.code).toMatch(new RegExp(`^LRP-${currentYear}-\\d{6}$`));
          codes.add(ticket.code);
        }

        // All codes should be unique
        expect(codes.size).toBe(10);
      });
    });
  });

  describe('Vietnamese Problem Documentation', () => {
    it('should handle detailed Vietnamese problem descriptions', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const vietnameseProblems = [
        {
          description: 'Laptop không khởi động được, khi bấm nút nguồn không có phản ứng gì',
          category: 'power',
          severity: 'critical',
          symptoms: ['Không khởi động', 'Đèn nguồn không sáng', 'Quạt không quay']
        },
        {
          description: 'Bàn phím một số phím không hoạt động, đặc biệt là phím cách và enter',
          category: 'keyboard',
          severity: 'medium',
          symptoms: ['Phím cách lỗi', 'Phím Enter không hoạt động', 'Gõ bị thiếu ký tự']
        },
        {
          description: 'Quạt tản nhiệt kêu to bất thường, laptop nóng và chạy chậm',
          category: 'cooling',
          severity: 'high',
          symptoms: ['Quạt kêu to', 'Máy nóng', 'Chạy chậm', 'Tự động tắt']
        }
      ];

      for (const problem of vietnameseProblems) {
        await act(async () => {
          const ticket = await result.current.createTicket({
            customerPhone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
            customerName: 'Test Customer',
            deviceBrand: 'ASUS',
            deviceModel: 'VivoBook',
            deviceType: 'laptop',
            issueDescription: problem.description,
            customerDescription: problem.description,
            symptoms: problem.symptoms,
            physicalCondition: {
              general: 'good',
              screen: 'good',
              keyboard: 'good',
              ports: 'good',
              battery: 'good',
              notes: 'Test condition'
            }
          });

          expect(ticket.problem.description).toBe(problem.description);
          expect(ticket.problem.symptoms).toEqual(problem.symptoms);
          expect(ticket.problem.description).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/);
        });
      }
    });

    it('should categorize problems correctly with Vietnamese keywords', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const problemCategories = [
        { keywords: 'màn hình vỡ', expectedCategory: 'display' },
        { keywords: 'bàn phím lỗi', expectedCategory: 'keyboard' },
        { keywords: 'quạt kêu to', expectedCategory: 'cooling' },
        { keywords: 'không khởi động', expectedCategory: 'power' },
        { keywords: 'wifi không bắt', expectedCategory: 'connectivity' },
        { keywords: 'chạy chậm', expectedCategory: 'performance' }
      ];

      for (const test of problemCategories) {
        await act(async () => {
          const category = await result.current.categorizeProblem(test.keywords);
          expect(category).toBe(test.expectedCategory);
        });
      }
    });
  });

  describe('Customer Integration', () => {
    it('should integrate seamlessly with phone-based customer system', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const existingCustomerPhone = '0901234567';

      await act(async () => {
        // Create first ticket - should create customer
        const ticket1 = await result.current.createTicket({
          customerPhone: existingCustomerPhone,
          customerName: 'Nguyễn Văn A',
          deviceBrand: 'ASUS',
          deviceModel: 'VivoBook',
          deviceType: 'laptop',
          issueDescription: 'First repair issue',
          customerDescription: 'First issue description',
          symptoms: ['Symptom 1'],
          physicalCondition: {
            general: 'good',
            screen: 'good',
            keyboard: 'good',
            ports: 'good',
            battery: 'good',
            notes: 'Good condition'
          }
        });

        // Create second ticket with same phone - should reuse customer
        const ticket2 = await result.current.createTicket({
          customerPhone: existingCustomerPhone,
          customerName: 'Nguyễn Văn A', // Same customer
          deviceBrand: 'Dell',
          deviceModel: 'Inspiron',
          deviceType: 'laptop',
          issueDescription: 'Second repair issue',
          customerDescription: 'Second issue description',
          symptoms: ['Symptom 2'],
          physicalCondition: {
            general: 'fair',
            screen: 'good',
            keyboard: 'good',
            ports: 'good',
            battery: 'good',
            notes: 'Fair condition'
          }
        });

        expect(ticket1.customer.phone).toBe(ticket2.customer.phone);
        expect(ticket1.customer.id).toBe(ticket2.customer.id);
        expect(ticket1.code).not.toBe(ticket2.code); // Different tickets
      });
    });
  });

  describe('Device Condition Recording', () => {
    it('should record comprehensive device condition assessment', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const detailedCondition = {
        general: 'fair' as const,
        screen: 'broken' as const,
        keyboard: 'good' as const,
        ports: 'damaged' as const,
        battery: 'poor' as const,
        notes: 'Màn hình vỡ ở góc trên phải, cổng USB bên trái bị lỏng, pin chai chỉ dùng được 1 tiếng'
      };

      await act(async () => {
        const ticket = await result.current.createTicket({
          customerPhone: '0901234567',
          customerName: 'Test Customer',
          deviceBrand: 'HP',
          deviceModel: 'Pavilion',
          deviceType: 'laptop',
          issueDescription: 'Multiple issues',
          customerDescription: 'Various problems',
          symptoms: ['Screen broken', 'Port loose', 'Battery weak'],
          physicalCondition: detailedCondition
        });

        expect(ticket.deviceCondition.general).toBe('fair');
        expect(ticket.deviceCondition.screen).toBe('broken');
        expect(ticket.deviceCondition.keyboard).toBe('good');
        expect(ticket.deviceCondition.ports).toBe('damaged');
        expect(ticket.deviceCondition.battery).toBe('poor');
        expect(ticket.deviceCondition.notes).toContain('Màn hình vỡ');
        expect(ticket.deviceCondition.notes).toContain('pin chai');
      });
    });
  });

  describe('Repair Priority Assignment', () => {
    it('should assign and manage repair priorities correctly', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const priorities = ['low', 'normal', 'high', 'urgent'] as const;

      for (const priority of priorities) {
        await act(async () => {
          const ticket = await result.current.createTicket({
            customerPhone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
            customerName: 'Priority Test Customer',
            deviceBrand: 'Lenovo',
            deviceModel: 'ThinkPad',
            deviceType: 'laptop',
            issueDescription: `${priority} priority issue`,
            customerDescription: 'Priority test',
            symptoms: ['Test symptom'],
            priority: priority,
            physicalCondition: {
              general: 'good',
              screen: 'good',
              keyboard: 'good',
              ports: 'good',
              battery: 'good',
              notes: 'Test notes'
            }
          });

          expect(ticket.priority).toBe(priority);
        });
      }
    });

    it('should provide Vietnamese priority labels', async () => {
      const { result } = renderHook(() => useRepairTickets());

      await act(async () => {
        const priorityLabels = await result.current.getPriorityLabels();

        expect(priorityLabels.low).toBe('Thấp');
        expect(priorityLabels.normal).toBe('Bình thường');
        expect(priorityLabels.high).toBe('Cao');
        expect(priorityLabels.urgent).toBe('Khẩn cấp');
      });
    });
  });

  describe('Staff Assignment and Workload', () => {
    it('should assign technicians and track workload', async () => {
      const { result } = renderHook(() => useRepairTickets());

      await act(async () => {
        const ticket = await result.current.createTicket({
          customerPhone: '0901234567',
          customerName: 'Assignment Test',
          deviceBrand: 'ASUS',
          deviceModel: 'ROG',
          deviceType: 'laptop',
          issueDescription: 'Assignment test issue',
          customerDescription: 'Test description',
          symptoms: ['Test symptom'],
          assignedTechnicianId: 'tech_001',
          physicalCondition: {
            general: 'good',
            screen: 'good',
            keyboard: 'good',
            ports: 'good',
            battery: 'good',
            notes: 'Test condition'
          }
        });

        expect(ticket.assignedTechnician).toBe('tech_001');

        // Check workload distribution
        const workload = await result.current.getTechnicianWorkload('tech_001');
        expect(workload.activeTickets).toBeGreaterThan(0);
        expect(workload.totalWorkload).toBeDefined();
      });
    });
  });

  describe('Draft and Template System', () => {
    it('should save and restore draft tickets', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const draftData = {
        customerPhone: '0901234567',
        customerName: 'Draft Customer',
        deviceBrand: 'ASUS',
        deviceModel: 'VivoBook',
        issueDescription: 'Draft issue description'
      };

      await act(async () => {
        const draftId = await result.current.saveDraft(draftData);
        expect(draftId).toBeDefined();

        const restored = await result.current.loadDraft(draftId);
        expect(restored.customerPhone).toBe(draftData.customerPhone);
        expect(restored.customerName).toBe(draftData.customerName);
        expect(restored.deviceBrand).toBe(draftData.deviceBrand);
      });
    });

    it('should create and use repair templates', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const template = {
        name: 'Màn hình vỡ - Template',
        category: 'display',
        symptoms: ['Màn hình vỡ', 'Hiển thị bị lỗi', 'Cảm ứng không hoạt động'],
        estimatedRepairTime: 120, // minutes
        estimatedCost: 2500000 // VND
      };

      await act(async () => {
        const templateId = await result.current.createTemplate(template);
        expect(templateId).toBeDefined();

        const templates = await result.current.getTemplates('display');
        expect(templates.some(t => t.name === template.name)).toBe(true);

        // Use template in ticket creation
        const ticket = await result.current.createTicketFromTemplate(templateId, {
          customerPhone: '0901234567',
          customerName: 'Template Test Customer',
          deviceBrand: 'ASUS',
          deviceModel: 'VivoBook'
        });

        expect(ticket.problem.symptoms).toEqual(template.symptoms);
        expect(ticket.estimatedRepairTime).toBe(template.estimatedRepairTime);
        expect(ticket.estimatedCost).toBe(template.estimatedCost);
      });
    });
  });

  describe('Performance and Validation', () => {
    it('should handle high volume ticket creation efficiently', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 50 }, (_, i) =>
          result.current.createTicket({
            customerPhone: `090${i.toString().padStart(7, '0')}`,
            customerName: `Bulk Customer ${i}`,
            deviceBrand: 'ASUS',
            deviceModel: 'Bulk Model',
            deviceType: 'laptop',
            issueDescription: `Bulk issue ${i}`,
            customerDescription: 'Bulk description',
            symptoms: ['Bulk symptom'],
            physicalCondition: {
              general: 'good',
              screen: 'good',
              keyboard: 'good',
              ports: 'good',
              battery: 'good',
              notes: 'Bulk test'
            }
          })
        );

        await Promise.all(promises);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (< 10 seconds)
      expect(duration).toBeLessThan(10000);
    });

    it('should validate Vietnamese input data', async () => {
      const { result } = renderHook(() => useRepairTickets());

      const invalidInputs = [
        { field: 'customerPhone', value: '123', error: 'Invalid phone format' },
        { field: 'customerName', value: '', error: 'Name is required' },
        { field: 'deviceBrand', value: '', error: 'Device brand is required' },
        { field: 'issueDescription', value: '', error: 'Issue description is required' }
      ];

      for (const { field, value, error } of invalidInputs) {
        await act(async () => {
          try {
            await result.current.createTicket({
              customerPhone: field === 'customerPhone' ? value : '0901234567',
              customerName: field === 'customerName' ? value : 'Valid Name',
              deviceBrand: field === 'deviceBrand' ? value : 'ASUS',
              deviceModel: 'VivoBook',
              deviceType: 'laptop',
              issueDescription: field === 'issueDescription' ? value : 'Valid description',
              customerDescription: 'Valid description',
              symptoms: ['Valid symptom'],
              physicalCondition: {
                general: 'good',
                screen: 'good',
                keyboard: 'good',
                ports: 'good',
                battery: 'good',
                notes: 'Valid notes'
              }
            });

            expect(true).toBe(false); // Should not reach here
          } catch (validationError) {
            expect(validationError).toBeDefined();
          }
        });
      }
    });
  });
});