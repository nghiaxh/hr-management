import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

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
