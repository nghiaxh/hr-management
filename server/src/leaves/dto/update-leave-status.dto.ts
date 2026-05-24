import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateLeaveStatusDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
