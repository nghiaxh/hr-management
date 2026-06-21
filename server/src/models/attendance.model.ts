import mongoose, { Document, Types } from 'mongoose';

export interface IAttendance {
  employeeId: Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'late' | 'absent' | 'half-day';
  note?: string;
}

export interface IAttendanceDocument extends IAttendance, Document<Types.ObjectId> {}

const attendanceSchema = new mongoose.Schema<IAttendanceDocument>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, required: true, enum: ['present', 'late', 'absent', 'half-day'] },
    note: { type: String },
  },
  { timestamps: true },
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', attendanceSchema);
