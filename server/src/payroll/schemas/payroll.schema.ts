import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollDocument = Payroll & Document;

@Schema({ timestamps: true })
export class Payroll {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, min: 0 })
  basicSalary: number;

  @Prop({ default: 0 })
  bonus: number;

  @Prop({ default: 0 })
  deductions: number;

  @Prop({ required: true, min: 0 })
  netPay: number;

  @Prop({ default: 'draft', enum: ['draft', 'paid'] })
  status: string;

  @Prop()
  paidAt: Date;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
