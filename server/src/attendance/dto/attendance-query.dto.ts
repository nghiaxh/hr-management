import { IsOptional, IsString, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceQueryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
