import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @Roles('admin', 'manager', 'employee')
  findAll(@CurrentUser('id') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Get('unread-count')
  @Roles('admin', 'manager', 'employee')
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.unreadCount(userId);
  }

  @Patch(':id/read')
  @Roles('admin', 'manager', 'employee')
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markRead(id, userId);
  }

  @Patch('read-all')
  @Roles('admin', 'manager', 'employee')
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }
}
