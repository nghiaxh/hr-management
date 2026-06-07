import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceReviewController } from './performance-review.controller';
import { PerformanceReviewService } from './performance-review.service';
import { PerformanceReview, PerformanceReviewSchema } from './schemas/performance-review.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PerformanceReview.name, schema: PerformanceReviewSchema }]),
    AuthModule,
  ],
  controllers: [PerformanceReviewController],
  providers: [PerformanceReviewService],
})
export class PerformanceReviewModule {}
