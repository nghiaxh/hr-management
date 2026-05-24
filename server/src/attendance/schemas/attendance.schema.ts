import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop()
  checkIn: Date;

  @Prop()
  checkOut: Date;

  @Prop({ required: true, enum: ['present', 'late', 'absent', 'half-day'] })
  status: string;

  @Prop()
  note: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
