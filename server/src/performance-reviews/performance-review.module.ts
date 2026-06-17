import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceReviewController } from './performance-review.controller.js';
import { PerformanceReviewService } from './performance-review.service.js';
import { PerformanceReview, PerformanceReviewSchema } from './schemas/performance-review.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PerformanceReview.name, schema: PerformanceReviewSchema }]),
    AuthModule,
    EmployeesModule,
  ],
  controllers: [PerformanceReviewController],
  providers: [PerformanceReviewService],
})
export class PerformanceReviewModule {}
