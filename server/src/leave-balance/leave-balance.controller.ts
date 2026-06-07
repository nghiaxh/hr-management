import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { EmployeesService } from '../employees/employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('leave-balance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveBalanceController {
  constructor(
    private balanceService: LeaveBalanceService,
    private employeesService: EmployeesService,
  ) {}

  @Get('my')
  @Roles('employee')
  async getMyBalance(@CurrentUser() user: any) {
    const employee = await this.employeesService.findByUserId(user.id);
    if (!employee) {
      return { totalAnnual: 0, usedAnnual: 0, totalSick: 0, usedSick: 0, totalPersonal: 0, usedPersonal: 0 };
    }
    return this.balanceService.findByEmployee(employee._id.toString());
  }

  @Get(':employeeId')
  @Roles('admin', 'manager', 'employee')
  getByEmployee(@Param('employeeId') employeeId: string) {
    return this.balanceService.findByEmployee(employeeId);
  }
}
