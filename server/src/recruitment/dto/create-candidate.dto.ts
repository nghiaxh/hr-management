import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCandidateDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  jobPostingId: string;

  @IsOptional()
  @IsIn(['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'])
  status?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @Type(() => Date)
  appliedDate?: Date;
}
