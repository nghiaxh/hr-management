import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'JobPosting', required: true })
  jobPostingId: Types.ObjectId;

  @Prop({ default: 'applied', enum: ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'] })
  status: string;

  @Prop()
  resumeUrl: string;

  @Prop()
  notes: string;

  @Prop()
  appliedDate: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
