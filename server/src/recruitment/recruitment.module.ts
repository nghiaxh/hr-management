import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecruitmentController } from './recruitment.controller.js';
import { RecruitmentService } from './recruitment.service.js';
import { JobPosting, JobPostingSchema } from './schemas/job-posting.schema.js';
import { Candidate, CandidateSchema } from './schemas/candidate.schema.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobPosting.name, schema: JobPostingSchema },
      { name: Candidate.name, schema: CandidateSchema },
    ]),
    AuthModule,
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}
