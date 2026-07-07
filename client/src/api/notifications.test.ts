import { describe, it, expect } from 'vitest';
import { notificationsApi } from './notifications';

describe('notificationsApi', () => {
  it('getAll returns notifications', async () => {
    const result = await notificationsApi.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getUnreadCount returns count', async () => {
    const result = await notificationsApi.getUnreadCount();
    expect(result).toHaveProperty('count');
    expect(result.count).toBe(1);
  });

  it('markRead sends mark as read', async () => {
    const result = await notificationsApi.markRead('notif-1');
    expect(result.isRead).toBe(true);
  });

  it('markAllRead marks all as read', async () => {
    const result = await notificationsApi.markAllRead();
    expect(result).toBe('');
  });
});
