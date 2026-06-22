import { Notification } from '../models/notification.model.js';

export class NotificationsService {
  async findByUser(userId: string, limit = 20) {
    return Notification.find({ userId: userId as any })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async unreadCount(userId: string) {
    return Notification.countDocuments({ userId: userId as any, isRead: false });
  }

  async markRead(id: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: id, userId: userId as any },
      { isRead: true },
      { new: true },
    );
  }

  async markAllRead(userId: string) {
    return Notification.updateMany(
      { userId: userId as any, isRead: false },
      { isRead: true },
    );
  }

  async create(data: {
    userId: string;
    title: string;
    message?: string;
    type: string;
    relatedId?: string;
    relatedModel?: string;
  }) {
    return Notification.create(data);
  }
}
