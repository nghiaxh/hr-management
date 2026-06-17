import { Controller, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('leave-balance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveBalanceController {
  constructor(
    private balanceService: LeaveBalanceService,
    private employeesService: EmployeesService,
  ) {}

  @Get('my')
  @Roles('admin', 'manager', 'employee')
  async getMyBalance(@CurrentUser() user: any) {
    const employee = await this.employeesService.findByUserId(user.id);
    if (!employee) {
      return { totalAnnual: 0, usedAnnual: 0, totalSick: 0, usedSick: 0, totalPersonal: 0, usedPersonal: 0 };
    }
    return this.balanceService.findByEmployee(employee._id.toString());
  }

  @Get(':employeeId')
  @Roles('admin', 'manager')
  getByEmployee(@Param('employeeId') employeeId: string, @CurrentUser() user: any) {
    return this.balanceService.findByEmployee(employeeId);
  }
}
