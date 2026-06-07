import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';

export class CreatePerformanceReviewDto {
  @IsString()
  employeeId: string;

  @IsString()
  period: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsIn(['draft', 'submitted', 'acknowledged'])
  status?: string;
}
