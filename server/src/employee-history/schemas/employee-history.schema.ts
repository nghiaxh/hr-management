import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeHistoryDocument = EmployeeHistory & Document;

@Schema({ timestamps: true })
export class EmployeeHistory {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: ['raise', 'promotion', 'transfer', 'other'] })
  type: string;

  @Prop()
  previousValue: string;

  @Prop({ required: true })
  newValue: string;

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop()
  note: string;
}

export const EmployeeHistorySchema = SchemaFactory.createForClass(EmployeeHistory);
EmployeeHistorySchema.index({ employeeId: 1, effectiveDate: -1 });
