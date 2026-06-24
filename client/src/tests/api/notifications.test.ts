import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { notificationsApi } from '@/api/notifications';

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches notifications', async () => {
    const mockResponse = {
      data: [
        { _id: 'n1', title: 'Leave approved', isRead: false },
        { _id: 'n2', title: 'Payroll ready', isRead: true },
      ],
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await notificationsApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/notifications');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Leave approved');
  });

  it('getUnreadCount returns count', async () => {
    const mockResponse = { data: { count: 5 } };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await notificationsApi.getUnreadCount();
    expect(api.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result.count).toBe(5);
  });

  it('markRead patches notification as read', async () => {
    const mockResponse = { data: { _id: 'n1', isRead: true } };
    (api.patch as any).mockResolvedValue(mockResponse);
    const result = await notificationsApi.markRead('n1');
    expect(api.patch).toHaveBeenCalledWith('/notifications/n1/read');
    expect(result.isRead).toBe(true);
  });

  it('markAllRead patches all notifications as read', async () => {
    const mockResponse = { data: { message: 'All notifications marked as read' } };
    (api.patch as any).mockResolvedValue(mockResponse);
    const result = await notificationsApi.markAllRead();
    expect(api.patch).toHaveBeenCalledWith('/notifications/read-all');
    expect(result.message).toBe('All notifications marked as read');
  });
});
