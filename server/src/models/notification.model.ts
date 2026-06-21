import mongoose, { Document, Types } from 'mongoose';

export interface INotification {
  userId: Types.ObjectId;
  title: string;
  message?: string;
  type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'payroll_ready' | 'system';
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
}

export interface INotificationDocument extends INotification, Document<Types.ObjectId> {}

const notificationSchema = new mongoose.Schema<INotificationDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String },
    type: { type: String, required: true, enum: ['leave_request', 'leave_approved', 'leave_rejected', 'payroll_ready', 'system'] },
    relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedModel' },
    relatedModel: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
