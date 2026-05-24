import { IsString, IsDate, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeaveDto {
  @IsString()
  @IsIn(['sick', 'annual', 'personal'])
  type: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsString()
  reason?: string;
}
