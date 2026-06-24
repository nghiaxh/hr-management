import { describe, it, expect } from 'vitest';
import { NotificationsService } from '../../services/notifications.service.js';
import { createUser, createNotification } from '../helpers/factories.js';

const notificationsService = new NotificationsService();

describe('NotificationsService', () => {
  describe('create', () => {
    it('should create a notification', async () => {
      const user = await createUser();
      const notif = await notificationsService.create({
        userId: user._id.toString(),
        title: 'Test notification',
        message: 'This is a test',
        type: 'system',
      });

      expect(notif.title).toBe('Test notification');
      expect(notif.isRead).toBe(false);
    });
  });

  describe('findByUser', () => {
    it('should return notifications for a user', async () => {
      const user = await createUser();
      await createNotification(user._id);
      await createNotification(user._id, { title: 'Second' });

      const notifications = await notificationsService.findByUser(user._id.toString());
      expect(notifications).toHaveLength(2);
    });

    it('should return empty array for user with no notifications', async () => {
      const user = await createUser();
      const notifications = await notificationsService.findByUser(user._id.toString());
      expect(notifications).toHaveLength(0);
    });
  });

  describe('unreadCount', () => {
    it('should return correct unread count', async () => {
      const user = await createUser();
      await createNotification(user._id);
      await createNotification(user._id, { isRead: true });

      const count = await notificationsService.unreadCount(user._id.toString());
      expect(count).toBe(1);
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      const user = await createUser();
      const notif = await createNotification(user._id);

      const updated = await notificationsService.markRead(notif._id.toString(), user._id.toString());
      expect(updated!.isRead).toBe(true);
    });

    it('should not mark another user notification as read', async () => {
      const user1 = await createUser({ email: 'u1@test.com' });
      const user2 = await createUser({ email: 'u2@test.com' });
      const notif = await createNotification(user1._id);

      const updated = await notificationsService.markRead(notif._id.toString(), user2._id.toString());
      expect(updated).toBeNull();
    });
  });

  describe('markAllRead', () => {
    it('should mark all user notifications as read', async () => {
      const user = await createUser();
      await createNotification(user._id);
      await createNotification(user._id);

      await notificationsService.markAllRead(user._id.toString());
      const count = await notificationsService.unreadCount(user._id.toString());
      expect(count).toBe(0);
    });
  });
});
