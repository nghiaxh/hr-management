import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('employees/:employeeId/history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeHistoryController {
  constructor(private historyService: EmployeeHistoryService) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  findAll(@Param('employeeId') employeeId: string) {
    return this.historyService.findByEmployee(employeeId);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@Param('employeeId') employeeId: string, @Body() dto: CreateEmployeeHistoryDto) {
    return this.historyService.create(employeeId, dto);
  }
}
