import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PerformanceReviewDocument = PerformanceReview & Document;

@Schema({ timestamps: true })
export class PerformanceReview {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ required: true })
  period: string;

  @Prop({ min: 1, max: 5 })
  rating: number;

  @Prop()
  comments: string;

  @Prop()
  goals: string;

  @Prop({ default: 'draft', enum: ['draft', 'submitted', 'acknowledged'] })
  status: string;
}

export const PerformanceReviewSchema = SchemaFactory.createForClass(PerformanceReview);
