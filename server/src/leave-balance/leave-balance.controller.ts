import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('leave-balance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveBalanceController {
  constructor(private balanceService: LeaveBalanceService) {}

  @Get('my')
  @Roles('employee')
  async getMyBalance(@CurrentUser() user: any) {
    const { EmployeesService } = require('../employees/employees.service');
    return { message: 'Use /employees/:id/leave-balance with employee ID' };
  }

  @Get(':employeeId')
  @Roles('admin', 'manager', 'employee')
  getByEmployee(@Param('employeeId') employeeId: string) {
    return this.balanceService.findByEmployee(employeeId);
  }
}
