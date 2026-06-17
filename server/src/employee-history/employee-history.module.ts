import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeHistoryController } from './employee-history.controller.js';
import { EmployeeHistoryService } from './employee-history.service.js';
import { EmployeeHistory, EmployeeHistorySchema } from './schemas/employee-history.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EmployeeHistory.name, schema: EmployeeHistorySchema }]),
    AuthModule,
    EmployeesModule,
  ],
  controllers: [EmployeeHistoryController],
  providers: [EmployeeHistoryService],
  exports: [EmployeeHistoryService],
})
export class EmployeeHistoryModule {}
