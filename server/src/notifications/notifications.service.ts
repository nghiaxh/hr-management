import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private gateway: NotificationsGateway,
  ) {}

  async findByUser(userId: string, limit = 20) {
    return this.notificationModel
      .find({ userId: userId as any })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async unreadCount(userId: string) {
    return this.notificationModel.countDocuments({ userId: userId as any, isRead: false });
  }

  async markRead(id: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: id, userId: userId as any },
      { isRead: true },
      { new: true },
    );
  }

  async markAllRead(userId: string) {
    return this.notificationModel.updateMany(
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
    const notification = await this.notificationModel.create(data);
    const plain = notification.toObject();
    this.gateway?.sendNotification(data.userId, plain);
    return notification;
  }
}
