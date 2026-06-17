import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { LeavesModule } from './leaves/leaves.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { PayrollModule } from './payroll/payroll.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { EmployeeHistoryModule } from './employee-history/employee-history.module.js';
import { LeaveBalanceModule } from './leave-balance/leave-balance.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { RecruitmentModule } from './recruitment/recruitment.module.js';
import { PerformanceReviewModule } from './performance-reviews/performance-review.module.js';
import { StartupSeedService } from './startup-seed.service.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
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
  providers: [
    StartupSeedService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
