import mongoose, { Document, Types } from 'mongoose';

export interface IDepartment {
  name: string;
  description?: string;
  managerId?: Types.ObjectId;
}

export interface IDepartmentDocument extends IDepartment, Document<Types.ObjectId> {}

const departmentSchema = new mongoose.Schema<IDepartmentDocument>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Department = mongoose.model<IDepartmentDocument>('Department', departmentSchema);
