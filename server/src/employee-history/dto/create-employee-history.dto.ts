import { IsString, IsDate, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeHistoryDto {
  @IsString()
  @IsIn(['raise', 'promotion', 'transfer', 'other'])
  type: string;

  @IsOptional()
  @IsString()
  previousValue?: string;

  @IsString()
  newValue: string;

  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
