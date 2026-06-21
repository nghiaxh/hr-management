import mongoose, { Document, Types } from 'mongoose';

export interface IPayroll {
  employeeId: Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'paid';
  paidAt?: Date;
}

export interface IPayrollDocument extends IPayroll, Document<Types.ObjectId> {}

const payrollSchema = new mongoose.Schema<IPayrollDocument>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'draft', enum: ['draft', 'paid'] },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayrollDocument>('Payroll', payrollSchema);
