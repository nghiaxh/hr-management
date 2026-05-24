import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveDocument = Leave & Document;

@Schema({ timestamps: true })
export class Leave {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: ['sick', 'annual', 'personal'] })
  type: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  reason: string;

  @Prop()
  rejectionReason: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
LeaveSchema.index({ employeeId: 1, status: 1 });
LeaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });
