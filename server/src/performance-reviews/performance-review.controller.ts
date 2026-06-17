import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PerformanceReviewService } from './performance-review.service.js';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto.js';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('performance-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceReviewController {
  constructor(private performanceReviewService: PerformanceReviewService) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.performanceReviewService.findAll(query, user);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'employee')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.performanceReviewService.findOne(id, user);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@Body() dto: CreatePerformanceReviewDto, @CurrentUser('id') reviewerId: string) {
    return this.performanceReviewService.create(dto, reviewerId);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() dto: UpdatePerformanceReviewDto) {
    return this.performanceReviewService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.performanceReviewService.remove(id);
  }
}
