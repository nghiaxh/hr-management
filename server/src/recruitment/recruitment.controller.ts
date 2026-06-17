import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service.js';
import { CreateJobPostingDto } from './dto/create-job-posting.dto.js';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { UpdateCandidateDto } from './dto/update-candidate.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private recruitmentService: RecruitmentService) {}

  @Get('job-postings')
  @Roles('admin', 'manager')
  findAllJobPostings(@Query() query: any) {
    return this.recruitmentService.findAllJobPostings(query);
  }

  @Get('job-postings/:id')
  @Roles('admin', 'manager')
  findOneJobPosting(@Param('id') id: string) {
    return this.recruitmentService.findOneJobPosting(id);
  }

  @Post('job-postings')
  @Roles('admin')
  createJobPosting(@Body() dto: CreateJobPostingDto) {
    return this.recruitmentService.createJobPosting(dto);
  }

  @Put('job-postings/:id')
  @Roles('admin')
  updateJobPosting(@Param('id') id: string, @Body() dto: UpdateJobPostingDto) {
    return this.recruitmentService.updateJobPosting(id, dto);
  }

  @Delete('job-postings/:id')
  @Roles('admin')
  removeJobPosting(@Param('id') id: string) {
    return this.recruitmentService.removeJobPosting(id);
  }

  @Get('candidates')
  @Roles('admin', 'manager')
  findAllCandidates(@Query() query: any) {
    return this.recruitmentService.findAllCandidates(query);
  }

  @Get('candidates/:id')
  @Roles('admin', 'manager')
  findOneCandidate(@Param('id') id: string) {
    return this.recruitmentService.findOneCandidate(id);
  }

  @Post('candidates')
  @Roles('admin', 'manager')
  createCandidate(@Body() dto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(dto);
  }

  @Put('candidates/:id')
  @Roles('admin', 'manager')
  updateCandidate(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.recruitmentService.updateCandidate(id, dto);
  }

  @Delete('candidates/:id')
  @Roles('admin')
  removeCandidate(@Param('id') id: string) {
    return this.recruitmentService.removeCandidate(id);
  }
}
