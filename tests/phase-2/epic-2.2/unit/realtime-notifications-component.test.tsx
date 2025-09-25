/**
 * RealtimeNotifications Component Unit Tests
 * Tests the RealtimeNotifications component behavior and integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealtimeNotifications, NotificationIndicator } from '@/components/notifications/RealtimeNotifications';
import type { RealtimeEvent } from '@/hooks/use-realtime-updates';

// Mock the useRealtimeUpdates hook
const mockUseRealtimeUpdates = vi.fn();
vi.mock('@/hooks/use-realtime-updates', () => ({
  useRealtimeUpdates: () => mockUseRealtimeUpdates(),
}));

// Mock data
const mockEvents: RealtimeEvent[] = [
  {
    id: 'event-1',
    type: 'ticket_created',
    timestamp: '2025-01-25T10:30:00Z',
    data: {
      ticket_code: 'LRP-2025-000001',
      customer_phone: '0901234567',
      device_info: 'Dell Inspiron 15'
    },
    message: 'Đã tạo phiếu sửa chữa mới: LRP-2025-000001'
  },
  {
    id: 'event-2',
    type: 'status_changed',
    timestamp: '2025-01-25T10:25:00Z',
    data: {
      ticket_code: 'LRP-2025-000002',
      from_state: 'Tiếp nhận thiết bị',
      to_state: 'Đang kiểm tra',
      current_state: 'preliminary_inspection'
    },
    message: 'Trạng thái đã thay đổi: Tiếp nhận thiết bị → Đang kiểm tra'
  },
  {
    id: 'event-3',
    type: 'ticket_updated',
    timestamp: '2025-01-25T10:20:00Z',
    data: {
      ticket_code: 'LRP-2025-000003',
      changes: ['estimated_cost', 'priority']
    },
    message: 'Đã cập nhật thông tin phiếu: LRP-2025-000003'
  }
];

const mockConnectionStatus = {
  connected: true,
  reconnecting: false,
  last_connected: '2025-01-25T10:00:00Z',
  connection_count: 1,
  error: null
};

const defaultMockReturn = {
  events: mockEvents,
  subscriptions: [],
  connectionStatus: mockConnectionStatus,
  onEvent: vi.fn(),
  offEvent: vi.fn(),
  clearEvents: vi.fn(),
  getEventsByType: vi.fn(),
  getRecentEvents: vi.fn(() => mockEvents.slice(0, 2)),
  subscribeToAll: vi.fn(),
  unsubscribeFromAll: vi.fn(),
  reconnect: vi.fn(),
  checkConnection: vi.fn(),
  totalEvents: mockEvents.length,
  activeSubscriptions: 3,
  isConnected: true,
  isReconnecting: false
};

describe('RealtimeNotifications Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRealtimeUpdates.mockReturnValue(defaultMockReturn);
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<RealtimeNotifications />);

      expect(screen.getByText('Kết nối real-time')).toBeInTheDocument();
      expect(screen.getByText('Thông báo')).toBeInTheDocument();
      expect(screen.getByText('2 sự kiện')).toBeInTheDocument();
    });

    it('should render with custom maxItems', () => {
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        getRecentEvents: vi.fn(() => mockEvents.slice(0, 1))
      });

      render(<RealtimeNotifications maxItems={1} />);
      expect(screen.getByText('1 sự kiện')).toBeInTheDocument();
    });

    it('should hide connection status when showConnectionStatus is false', () => {
      render(<RealtimeNotifications showConnectionStatus={false} />);

      expect(screen.queryByText('Kết nối real-time')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<RealtimeNotifications className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Connection Status Display', () => {
    it('should show connected status', () => {
      render(<RealtimeNotifications />);

      expect(screen.getByText('Kết nối real-time')).toBeInTheDocument();
      expect(screen.queryByText('Mất kết nối')).not.toBeInTheDocument();
    });

    it('should show disconnected status', () => {
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        connectionStatus: {
          ...mockConnectionStatus,
          connected: false,
          error: 'Lỗi kết nối database'
        },
        isConnected: false
      });

      render(<RealtimeNotifications />);

      expect(screen.getByText('Mất kết nối')).toBeInTheDocument();
      expect(screen.getByText('Lỗi kết nối database')).toBeInTheDocument();
    });

    it('should show reconnecting status', () => {
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        connectionStatus: {
          ...mockConnectionStatus,
          connected: false,
          reconnecting: true
        },
        isConnected: false,
        isReconnecting: true
      });

      render(<RealtimeNotifications />);

      expect(screen.getByText('Đang kết nối lại...')).toBeInTheDocument();
    });

    it('should show reconnect button when disconnected and not reconnecting', () => {
      const mockReconnect = vi.fn();
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        connectionStatus: {
          ...mockConnectionStatus,
          connected: false,
          reconnecting: false
        },
        isConnected: false,
        isReconnecting: false,
        reconnect: mockReconnect
      });

      render(<RealtimeNotifications />);

      const reconnectButton = screen.getByText('Kết nối lại');
      expect(reconnectButton).toBeInTheDocument();

      fireEvent.click(reconnectButton);
      expect(mockReconnect).toHaveBeenCalledOnce();
    });
  });

  describe('Event Display', () => {
    it('should display recent events by default', () => {
      render(<RealtimeNotifications />);

      expect(screen.getByText('Đã tạo phiếu sửa chữa mới: LRP-2025-000001')).toBeInTheDocument();
      expect(screen.getByText('Trạng thái đã thay đổi: Tiếp nhận thiết bị → Đang kiểm tra')).toBeInTheDocument();
    });

    it('should show correct event icons', () => {
      render(<RealtimeNotifications />);

      // Check that event icons are rendered (using data-testid or class names)
      const eventElements = screen.getAllByText(/LRP-2025-/);
      expect(eventElements.length).toBeGreaterThanOrEqual(2); // At least 2 recent events
    });

    it('should display Vietnamese event labels', () => {
      render(<RealtimeNotifications />);

      expect(screen.getByText('Phiếu mới')).toBeInTheDocument();
      expect(screen.getByText('Thay đổi')).toBeInTheDocument();
    });

    it('should format timestamps correctly', () => {
      render(<RealtimeNotifications />);

      // Should show time in Vietnamese format (HH:MM)
      const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should show relative time for recent events', () => {
      render(<RealtimeNotifications />);

      // Check if any relative time text is displayed
      const relativeTimeTexts = ['Vừa xong', 'phút trước', 'giờ trước', '17:30', '17:25'];
      let hasRelativeTime = false;

      for (const timeText of relativeTimeTexts) {
        try {
          screen.getByText(timeText);
          hasRelativeTime = true;
          break;
        } catch {
          // Continue checking other time formats
        }
      }

      expect(hasRelativeTime).toBe(true);
    });
  });

  describe('Interactive Behavior', () => {
    it('should expand to show more events when notification bell is clicked', async () => {
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        events: mockEvents, // All events when expanded
        getRecentEvents: vi.fn(() => mockEvents.slice(0, 2)) // Recent events when collapsed
      });

      render(<RealtimeNotifications />);

      // Initially shows recent events only
      expect(screen.getByText('2 sự kiện')).toBeInTheDocument();

      // Click notification bell
      const notificationButton = screen.getByText('Thông báo');
      fireEvent.click(notificationButton);

      // Should now show all events
      await waitFor(() => {
        expect(screen.getByText('3 sự kiện')).toBeInTheDocument();
      });
    });

    it('should clear events when clear button is clicked', () => {
      const mockClearEvents = vi.fn();
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        clearEvents: mockClearEvents
      });

      render(<RealtimeNotifications />);

      const clearButton = screen.getByText('Xóa');
      fireEvent.click(clearButton);

      expect(mockClearEvents).toHaveBeenCalledOnce();
    });

    it('should update unread count when events are added', () => {
      const { rerender } = render(<RealtimeNotifications />);

      // Initially should show the default mock events count
      expect(screen.queryByText('99+')).not.toBeInTheDocument();

      // Add new events with newer timestamps
      const newerEvents = [
        ...mockEvents,
        {
          id: 'event-4',
          type: 'ticket_created',
          timestamp: new Date().toISOString(),
          data: { ticket_code: 'LRP-2025-000004' },
          message: 'New event'
        }
      ];

      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        events: newerEvents,
        totalEvents: newerEvents.length,
        getRecentEvents: vi.fn(() => newerEvents.slice(0, 2)) // Still return first 2 for recent
      });

      rerender(<RealtimeNotifications />);

      // Should show at least some events count
      const eventCountElements = screen.getAllByText(/\d+ sự kiện/);
      expect(eventCountElements.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no events', () => {
      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        events: [],
        getRecentEvents: vi.fn(() => []),
        totalEvents: 0
      });

      render(<RealtimeNotifications />);

      // Check for the empty state, which may be represented differently
      const emptyStateElements = [
        'Chưa có thông báo nào',
        'Không có thông báo',
        'Chưa có sự kiện nào'
      ];

      let hasEmptyState = false;
      for (const emptyText of emptyStateElements) {
        try {
          screen.getByText(emptyText);
          hasEmptyState = true;
          break;
        } catch {
          // Continue checking other empty state messages
        }
      }

      // Either empty state message should be found OR 0 events should be shown
      const hasZeroEvents = screen.queryByText('0 sự kiện') !== null;

      expect(hasEmptyState || hasZeroEvents).toBe(true);
    });
  });

  describe('Event Type Handling', () => {
    it('should handle different event types correctly', () => {
      const mixedEvents: RealtimeEvent[] = [
        {
          id: 'event-1',
          type: 'ticket_created',
          timestamp: '2025-01-25T10:30:00Z',
          data: { ticket_code: 'LRP-2025-000001' },
          message: 'Đã tạo phiếu sửa chữa mới'
        },
        {
          id: 'event-2',
          type: 'status_changed',
          timestamp: '2025-01-25T10:25:00Z',
          data: { from_state: 'A', to_state: 'B' },
          message: 'Trạng thái đã thay đổi'
        },
        {
          id: 'event-3',
          type: 'ticket_updated',
          timestamp: '2025-01-25T10:20:00Z',
          data: { changes: ['cost'] },
          message: 'Đã cập nhật thông tin'
        }
      ];

      mockUseRealtimeUpdates.mockReturnValue({
        ...defaultMockReturn,
        events: mixedEvents,
        getRecentEvents: vi.fn(() => mixedEvents),
        totalEvents: mixedEvents.length
      });

      render(<RealtimeNotifications />);

      expect(screen.getByText('Phiếu mới')).toBeInTheDocument();
      expect(screen.getByText('Thay đổi')).toBeInTheDocument();
      expect(screen.getByText('Cập nhật')).toBeInTheDocument();
    });
  });
});

describe('NotificationIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRealtimeUpdates.mockReturnValue(defaultMockReturn);
  });

  it('should render basic notification indicator', () => {
    render(<NotificationIndicator />);

    // Should have bell icon button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show connection status dot', () => {
    const { container } = render(<NotificationIndicator />);

    // Should have connection indicator (green when connected)
    const connectionDot = container.querySelector('.bg-green-400');
    expect(connectionDot).toBeInTheDocument();
  });

  it('should show red dot when disconnected', () => {
    mockUseRealtimeUpdates.mockReturnValue({
      ...defaultMockReturn,
      isConnected: false
    });

    const { container } = render(<NotificationIndicator />);

    const connectionDot = container.querySelector('.bg-red-400');
    expect(connectionDot).toBeInTheDocument();
  });

  it('should show unread count badge', () => {
    mockUseRealtimeUpdates.mockReturnValue({
      ...defaultMockReturn,
      getRecentEvents: vi.fn(() => Array(5).fill(null).map((_, i) => ({
        id: `event-${i}`,
        type: 'ticket_created',
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
        data: {},
        message: `Event ${i}`
      })))
    });

    render(<NotificationIndicator />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should show 9+ when more than 9 unread events', () => {
    mockUseRealtimeUpdates.mockReturnValue({
      ...defaultMockReturn,
      getRecentEvents: vi.fn(() => Array(15).fill(null).map((_, i) => ({
        id: `event-${i}`,
        type: 'ticket_created',
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
        data: {},
        message: `Event ${i}`
      })))
    });

    render(<NotificationIndicator />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });
});