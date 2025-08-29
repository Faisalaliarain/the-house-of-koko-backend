import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  SendNotificationDto,
  SendBulkNotificationDto,
  RegisterDeviceTokenDto,
} from './dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../utils/enums/roles.enum';
import { User } from '../decorators/user.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('device-token')
  async registerDeviceToken(
    @Body() registerDeviceTokenDto: RegisterDeviceTokenDto,
    @User('userId') userId: string,
  ) {
    await this.notificationService.registerDeviceToken(registerDeviceTokenDto, userId);
    return { message: 'Device token registered successfully' };
  }

  @Post('device-token/remove')
  async removeDeviceToken(
    @Body() body: { deviceToken: string },
    @User('userId') userId: string,
  ) {
    await this.notificationService.removeDeviceToken(userId, body.deviceToken);
    return { message: 'Device token removed successfully' };
  }

  @Get()
  async getUserNotifications(
    @Request() req: AuthenticatedRequest,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const result = await this.notificationService.getUserNotifications(
      req.user.userId,
      parseInt(page),
      parseInt(limit)
    );
    return result;
  }

  @Get('unread-count')
  async getUnreadNotificationCount(@Request() req: AuthenticatedRequest) {
    const count = await this.notificationService.getUnreadNotificationCount(req.user.userId);
    return { count };
  }

  @Put(':id/read')
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @Request() req: AuthenticatedRequest
  ) {
    await this.notificationService.markNotificationAsRead(notificationId, req.user.userId);
    return { message: 'Notification marked as read' };
  }

  @Put('mark-all-read')
  async markAllNotificationsAsRead(@Request() req: AuthenticatedRequest) {
    await this.notificationService.markAllNotificationsAsRead(req.user.userId);
    return { message: 'All notifications marked as read' };
  }

  @Get('preferences')
  async getNotificationPreferences(@Request() req: AuthenticatedRequest) {
    const preferences = await this.notificationService.getNotificationPreferences(req.user.userId);
    return preferences;
  }

  @Put('preferences')
  async updateNotificationPreferences(
    @Body() preferences: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      eventUpdates?: boolean;
      marketing?: boolean;
    },
    @Request() req: AuthenticatedRequest
  ) {
    await this.notificationService.updateNotificationPreferences(req.user.userId, preferences);
    return { message: 'Notification preferences updated' };
  }

  @Post('send')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    await this.notificationService.sendNotification(sendNotificationDto);
    return { message: 'Notification sent successfully' };
  }

  @Post('send-bulk')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async sendBulkNotification(@Body() sendBulkNotificationDto: SendBulkNotificationDto) {
    await this.notificationService.sendBulkNotification(sendBulkNotificationDto);
    return { message: 'Bulk notification sent successfully' };
  }

  @Post('topic')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async sendTopicNotification(
    @Body() body: {
      topic: string;
      title: string;
      body: string;
      data?: Record<string, unknown>;
      imageUrl?: string;
    }
  ) {
    await this.notificationService.sendTopicNotification(
      body.topic,
      body.title,
      body.body,
      body.data,
      body.imageUrl
    );
    return { message: 'Topic notification sent successfully' };
  }
}
