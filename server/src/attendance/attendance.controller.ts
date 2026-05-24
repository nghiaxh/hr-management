import { Controller, Get, Post, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  findAll(@Query() query: AttendanceQueryDto, @CurrentUser() user: any) {
    return this.attendanceService.findAll(query, user);
  }

  @Post('check-in')
  @Roles('employee')
  checkIn(@CurrentUser('id') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @Patch(':id/check-out')
  @Roles('employee')
  checkOut(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.attendanceService.checkOut(id, userId);
  }
}
