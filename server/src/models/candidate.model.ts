import mongoose, { Document, Types } from 'mongoose';

export interface ICandidate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobPostingId: Types.ObjectId;
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
  resumeUrl?: string;
  notes?: string;
  appliedDate?: Date;
}

export interface ICandidateDocument extends ICandidate, Document<Types.ObjectId> {}

const candidateSchema = new mongoose.Schema<ICandidateDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    jobPostingId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
    status: { type: String, default: 'applied', enum: ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'] },
    resumeUrl: { type: String },
    notes: { type: String },
    appliedDate: { type: Date },
  },
  { timestamps: true },
);

export const Candidate = mongoose.model<ICandidateDocument>('Candidate', candidateSchema);
