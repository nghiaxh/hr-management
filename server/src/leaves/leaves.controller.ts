import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeavesService } from './leaves.service.js';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private leavesService: LeavesService) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.leavesService.findAll(query, user);
  }

  @Post()
  @Roles('employee')
  create(@Body() dto: CreateLeaveDto, @CurrentUser('id') userId: string) {
    return this.leavesService.create(dto, userId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'employee')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leavesService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto, @CurrentUser('id') userId: string) {
    return this.leavesService.updateStatus(id, dto, userId);
  }
}
