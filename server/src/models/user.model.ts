import mongoose, { Document, Types } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'employee';
  name?: string;
  isActive: boolean;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'manager', 'employee'] },
    name: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
