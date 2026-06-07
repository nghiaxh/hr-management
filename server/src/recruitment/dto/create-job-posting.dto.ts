import { IsString, IsOptional, IsNumber, IsIn, Min } from 'class-validator';

export class CreateJobPostingDto {
  @IsString()
  title: string;

  @IsString()
  departmentId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsIn(['open', 'closed', 'draft'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  openings?: number;
}
