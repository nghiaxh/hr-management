import mongoose, { Document, Types } from 'mongoose';

export interface IPerformanceReview {
  employeeId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  period: string;
  rating?: number;
  comments?: string;
  goals?: string;
  status: 'draft' | 'submitted' | 'acknowledged';
}

export interface IPerformanceReviewDocument extends IPerformanceReview, Document<Types.ObjectId> {}

const performanceReviewSchema = new mongoose.Schema<IPerformanceReviewDocument>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
    goals: { type: String },
    status: { type: String, default: 'draft', enum: ['draft', 'submitted', 'acknowledged'] },
  },
  { timestamps: true },
);

export const PerformanceReview = mongoose.model<IPerformanceReviewDocument>('PerformanceReview', performanceReviewSchema);
