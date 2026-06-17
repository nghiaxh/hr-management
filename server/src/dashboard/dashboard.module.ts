import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema.js';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema.js';
import { Leave, LeaveSchema } from '../leaves/schemas/leave.schema.js';
import { Attendance, AttendanceSchema } from '../attendance/schemas/attendance.schema.js';
import { Payroll, PayrollSchema } from '../payroll/schemas/payroll.schema.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Leave.name, schema: LeaveSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Payroll.name, schema: PayrollSchema },
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
