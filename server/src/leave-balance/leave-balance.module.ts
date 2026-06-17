import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveBalanceController } from './leave-balance.controller.js';
import { LeaveBalanceService } from './leave-balance.service.js';
import { LeaveBalance, LeaveBalanceSchema } from './schemas/leave-balance.schema.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LeaveBalance.name, schema: LeaveBalanceSchema }]),
    EmployeesModule,
    AuthModule,
  ],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
