import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ProcessPayrollDto } from './dto/process-payroll.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.payrollService.findAll(query, user);
  }

  @Post('process')
  @Roles('admin')
  process(@Body() dto: ProcessPayrollDto) {
    return this.payrollService.process(dto);
  }

  @Patch(':id/pay')
  @Roles('admin')
  pay(@Param('id') id: string) {
    return this.payrollService.pay(id);
  }
}
