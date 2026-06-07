import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobPostingDocument = JobPosting & Document;

@Schema({ timestamps: true })
export class JobPosting {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop()
  description: string;

  @Prop()
  requirements: string;

  @Prop({ default: 'open', enum: ['open', 'closed', 'draft'] })
  status: string;

  @Prop({ default: 1 })
  openings: number;
}

export const JobPostingSchema = SchemaFactory.createForClass(JobPosting);
