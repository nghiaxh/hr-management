import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesController } from './leaves.controller.js';
import { LeavesService } from './leaves.service.js';
import { Leave, LeaveSchema } from './schemas/leave.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { LeaveBalanceModule } from '../leave-balance/leave-balance.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leave.name, schema: LeaveSchema }]),
    AuthModule,
    EmployeesModule,
    LeaveBalanceModule,
    NotificationsModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
