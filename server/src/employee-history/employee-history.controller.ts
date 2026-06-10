import { Controller, Get, Post, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { EmployeesService } from '../employees/employees.service';

@Controller('employees/:employeeId/history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeHistoryController {
  constructor(
    private historyService: EmployeeHistoryService,
    private employeesService: EmployeesService,
  ) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  async findAll(@Param('employeeId') employeeId: string, @CurrentUser() user: any) {
    if (user.role === 'employee') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (!emp || emp._id.toString() !== employeeId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (user.role === 'manager') {
      const emp = await this.employeesService.findByUserId(user.id);
      const targetEmp = await this.employeesService.findOne(employeeId).catch(() => null);
      if (!emp || !targetEmp || !emp.departmentId || !targetEmp.departmentId ||
          targetEmp.departmentId.toString() !== emp.departmentId.toString()) {
        throw new ForbiddenException('Access denied');
      }
    }
    return this.historyService.findByEmployee(employeeId);
  }

  @Post()
  @Roles('admin', 'manager')
  async create(@Param('employeeId') employeeId: string, @Body() dto: CreateEmployeeHistoryDto, @CurrentUser() user: any) {
    if (user.role === 'manager') {
      const emp = await this.employeesService.findByUserId(user.id);
      const targetEmp = await this.employeesService.findOne(employeeId).catch(() => null);
      if (!emp || !targetEmp || !emp.departmentId || !targetEmp.departmentId ||
          targetEmp.departmentId.toString() !== emp.departmentId.toString()) {
        throw new ForbiddenException('Access denied');
      }
    }
    return this.historyService.create(employeeId, dto);
  }
}
