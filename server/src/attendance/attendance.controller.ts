import { Controller, Get, Post, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

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
