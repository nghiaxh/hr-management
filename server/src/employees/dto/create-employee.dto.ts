import { IsString, IsNumber, IsDate, IsOptional, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  departmentId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  position: string;

  @IsNumber()
  @Min(0)
  salary: number;

  @Type(() => Date)
  @IsDate()
  hireDate: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  contractExpiry?: Date;
}
