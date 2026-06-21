import mongoose, { Document, Types } from 'mongoose';

export interface ILeaveBalance {
  employeeId: Types.ObjectId;
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  personalTotal: number;
  personalUsed: number;
}

export interface ILeaveBalanceDocument extends ILeaveBalance, Document<Types.ObjectId> {}

const leaveBalanceSchema = new mongoose.Schema<ILeaveBalanceDocument>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
    annualTotal: { type: Number, required: true, default: 12, min: 0 },
    annualUsed: { type: Number, default: 0, min: 0 },
    sickTotal: { type: Number, required: true, default: 30, min: 0 },
    sickUsed: { type: Number, default: 0, min: 0 },
    personalTotal: { type: Number, required: true, default: 3, min: 0 },
    personalUsed: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const LeaveBalance = mongoose.model<ILeaveBalanceDocument>('LeaveBalance', leaveBalanceSchema);
