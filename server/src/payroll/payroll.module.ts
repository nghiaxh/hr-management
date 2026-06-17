import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollController } from './payroll.controller.js';
import { PayrollService } from './payroll.service.js';
import { Payroll, PayrollSchema } from './schemas/payroll.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payroll.name, schema: PayrollSchema }]),
    AuthModule,
    EmployeesModule,
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
