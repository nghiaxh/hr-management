import { IsArray, IsNumber, IsOptional, Min, Max, IsMongoId, MinLength } from 'class-validator';

export class ProcessPayrollDto {
  @IsArray()
  @IsMongoId({ each: true })
  employeeIds: string[];

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2020)
  year: number;

  @IsOptional()
  bonuses?: Record<string, number>;

  @IsOptional()
  deductions?: Record<string, number>;
}
