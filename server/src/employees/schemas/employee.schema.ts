import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true, min: 0 })
  salary: number;

  @Prop({ required: true })
  hireDate: Date;

  @Prop()
  phone: string;

  @Prop({ enum: ['permanent', 'contract', 'intern'] })
  contractType: string;

  @Prop()
  contractExpiry: Date;

  @Prop({ type: [{ name: String, url: String, type: String, uploadedAt: { type: Date, default: Date.now } }] })
  documents: { name: string; url: string; type: string; uploadedAt: Date }[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ departmentId: 1 });
