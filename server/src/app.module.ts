import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { LeavesModule } from './leaves/leaves.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeeHistoryModule } from './employee-history/employee-history.module';
import { LeaveBalanceModule } from './leave-balance/leave-balance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { PerformanceReviewModule } from './performance-reviews/performance-review.module';
import { StartupSeedService } from './startup-seed.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management'),
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    LeavesModule,
    AttendanceModule,
    PayrollModule,
    DashboardModule,
    EmployeeHistoryModule,
    LeaveBalanceModule,
    NotificationsModule,
    RecruitmentModule,
    PerformanceReviewModule,
  ],
  providers: [StartupSeedService],
})
export class AppModule {}
