import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]),
    AuthModule,
    EmployeesModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
