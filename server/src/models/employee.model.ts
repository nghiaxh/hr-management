import mongoose, { Document, Types } from 'mongoose';

export interface IEmployeeDocument {
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface IEmployee {
  userId: Types.ObjectId;
  departmentId: Types.ObjectId;
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  hireDate: Date;
  phone?: string;
  contractType?: 'permanent' | 'contract' | 'intern';
  contractExpiry?: Date;
  documents: IEmployeeDocument[];
}

export interface IEmployeeDocumentType extends IEmployee, Document<Types.ObjectId> {}

const employeeSchema = new mongoose.Schema<IEmployeeDocumentType>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    position: { type: String, required: true },
    salary: { type: Number, required: true, min: 0 },
    hireDate: { type: Date, required: true },
    phone: { type: String },
    contractType: { type: String, enum: ['permanent', 'contract', 'intern'] },
    contractExpiry: { type: Date },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

employeeSchema.index({ departmentId: 1 });

export const Employee = mongoose.model<IEmployeeDocumentType>('Employee', employeeSchema);
