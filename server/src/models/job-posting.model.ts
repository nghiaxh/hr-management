import mongoose, { Document, Types } from 'mongoose';

export interface IJobPosting {
  title: string;
  departmentId: Types.ObjectId;
  description?: string;
  requirements?: string;
  status: 'open' | 'closed' | 'draft';
  openings: number;
}

export interface IJobPostingDocument extends IJobPosting, Document<Types.ObjectId> {}

const jobPostingSchema = new mongoose.Schema<IJobPostingDocument>(
  {
    title: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    description: { type: String },
    requirements: { type: String },
    status: { type: String, default: 'open', enum: ['open', 'closed', 'draft'] },
    openings: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const JobPosting = mongoose.model<IJobPostingDocument>('JobPosting', jobPostingSchema);
