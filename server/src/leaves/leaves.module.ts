import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { Leave, LeaveSchema } from './schemas/leave.schema';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { LeaveBalanceModule } from '../leave-balance/leave-balance.module';
import { NotificationsModule } from '../notifications/notifications.module';

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
