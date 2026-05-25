import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  message: string;

  @Prop({ required: true, enum: ['leave_request', 'leave_approved', 'leave_rejected', 'payroll_ready', 'system'] })
  type: string;

  @Prop({ type: Types.ObjectId, refPath: 'relatedModel' })
  relatedId: Types.ObjectId;

  @Prop()
  relatedModel: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
