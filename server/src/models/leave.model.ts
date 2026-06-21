import mongoose, { Document, Types } from 'mongoose';

export interface ILeave {
  employeeId: Types.ObjectId;
  type: 'sick' | 'annual' | 'personal';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: Types.ObjectId;
  reason?: string;
  rejectionReason?: string;
}

export interface ILeaveDocument extends ILeave, Document<Types.ObjectId> {}

const leaveSchema = new mongoose.Schema<ILeaveDocument>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, required: true, enum: ['sick', 'annual', 'personal'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });

export const Leave = mongoose.model<ILeaveDocument>('Leave', leaveSchema);
