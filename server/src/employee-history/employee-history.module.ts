import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeHistoryController } from './employee-history.controller';
import { EmployeeHistoryService } from './employee-history.service';
import { EmployeeHistory, EmployeeHistorySchema } from './schemas/employee-history.schema';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';

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
