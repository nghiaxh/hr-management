import mongoose, { Document, Types } from 'mongoose';

export interface IEmployeeHistory {
  employeeId: Types.ObjectId;
  type: 'raise' | 'promotion' | 'transfer' | 'other';
  previousValue?: string;
  newValue: string;
  effectiveDate: Date;
  note?: string;
}

export interface IEmployeeHistoryDocument extends IEmployeeHistory, Document<Types.ObjectId> {}

const employeeHistorySchema = new mongoose.Schema<IEmployeeHistoryDocument>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, required: true, enum: ['raise', 'promotion', 'transfer', 'other'] },
    previousValue: { type: String },
    newValue: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

employeeHistorySchema.index({ employeeId: 1, effectiveDate: -1 });

export const EmployeeHistory = mongoose.model<IEmployeeHistoryDocument>('EmployeeHistory', employeeHistorySchema);
