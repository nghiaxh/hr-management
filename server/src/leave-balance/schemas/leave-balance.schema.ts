import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveBalanceDocument = LeaveBalance & Document;

@Schema({ timestamps: true })
export class LeaveBalance {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, default: 12, min: 0 })
  annualTotal: number;

  @Prop({ default: 0, min: 0 })
  annualUsed: number;

  @Prop({ required: true, default: 30, min: 0 })
  sickTotal: number;

  @Prop({ default: 0, min: 0 })
  sickUsed: number;

  @Prop({ required: true, default: 3, min: 0 })
  personalTotal: number;

  @Prop({ default: 0, min: 0 })
  personalUsed: number;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
