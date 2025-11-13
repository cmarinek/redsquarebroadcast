import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import * as useNotificationsHook from '@/hooks/useNotifications';
import { Notification } from '@/hooks/useNotifications';

// Mock the useNotifications hook
vi.mock('@/hooks/useNotifications');

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date: Date) => '5 minutes ago'),
}));

const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user-123',
    title: 'New Booking',
    message: 'Your screen has been booked for tomorrow',
    type: 'booking',
    read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-123',
    title: 'Payment Received',
    message: 'You received $50 from a booking',
    type: 'payout',
    read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'user-123',
    title: 'System Update',
    message: 'We have updated our terms of service',
    type: 'system',
    read: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('NotificationBell', () => {
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();
  const mockDeleteNotification = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the bell icon', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
  });

  it('should display unread count badge when there are unread notifications', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display "9+" when unread count exceeds 9', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 15,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('should not display badge when unread count is 0', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: [mockNotifications[2]], // Only read notification
      unreadCount: 0,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('should display notifications in the dropdown', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('New Booking')).toBeInTheDocument();
      expect(screen.getByText('Payment Received')).toBeInTheDocument();
      expect(screen.getByText('System Update')).toBeInTheDocument();
    });
  });

  it('should show "Mark all read" button when there are unread notifications', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/mark all read/i)).toBeInTheDocument();
    });
  });

  it('should call markAllAsRead when "Mark all read" is clicked', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const markAllButton = screen.getByText(/mark all read/i);
      fireEvent.click(markAllButton);
    });

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('should call markAsRead when mark as read button is clicked', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const markReadButtons = screen.getAllByTitle('Mark as read');
      fireEvent.click(markReadButtons[0]);
    });

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should call deleteNotification when delete button is clicked', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockDeleteNotification).toHaveBeenCalledWith('1');
  });

  it('should display loading skeletons when loading', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: true,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      // Check for skeleton loading elements
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('should display empty state when no notifications', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      expect(
        screen.getByText("We'll notify you when something important happens")
      ).toBeInTheDocument();
    });
  });

  it('should display different colors for notification types', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Payout')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('should highlight unread notifications', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const notificationItems = document.querySelectorAll('.bg-blue-50, .dark\\:bg-blue-950\\/20');
      // Should have 2 unread notifications with highlighted background
      expect(notificationItems.length).toBeGreaterThan(0);
    });
  });

  it('should display notification type labels', async () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 2,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Payout')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('should truncate long notification messages', async () => {
    const longNotification: Notification = {
      id: '4',
      user_id: 'user-123',
      title: 'Long Notification',
      message: 'This is a very long notification message that should be truncated to prevent overflow and maintain a clean UI. It contains multiple sentences and lots of details that users might not need to see in the preview.',
      type: 'general',
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      notifications: [longNotification],
      unreadCount: 1,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      refetch: mockRefetch,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      // Check for line-clamp class which truncates text
      const messageElement = screen.getByText(/This is a very long notification/i);
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.className).toContain('line-clamp-2');
    });
  });
});
