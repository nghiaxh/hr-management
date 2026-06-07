import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PerformanceReviewService } from './performance-review.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

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
  findOne(@Param('id') id: string) {
    return this.performanceReviewService.findOne(id);
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
