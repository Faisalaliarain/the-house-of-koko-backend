import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FirebaseService } from './firebase.service';
import { Notification, NotificationDocument } from '../../entities/notification.entity';
import { User, UserDocument } from '../../entities/user.entity';
import { 
  SendNotificationDto, 
  SendBulkNotificationDto, 
  RegisterDeviceTokenDto, 
  NotificationType 
} from './dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private firebaseService: FirebaseService,
  ) {}

  async sendNotification(sendNotificationDto: SendNotificationDto): Promise<void> {
    const { userId, title, body, type, data, imageUrl } = sendNotificationDto;

    try {
      // Create notification record in database
      const notification = new this.notificationModel({
        userId: new Types.ObjectId(userId),
        title,
        body,
        type,
        data,
        imageUrl,
      });

      // Get user's device tokens
      const user = await this.userModel.findById(userId).lean();
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        notification.errorMessage = 'User not found';
        await notification.save();
        return;
      }

      // Check user's notification preferences
      if (user.notificationPreferences?.pushEnabled === false) {
        this.logger.log(`Push notifications disabled for user: ${userId}`);
        notification.errorMessage = 'Push notifications disabled';
        await notification.save();
        return;
      }

      const deviceTokens = user.deviceTokens || [];
      if (deviceTokens.length === 0) {
        this.logger.warn(`No device tokens found for user: ${userId}`);
        notification.errorMessage = 'No device tokens found';
        await notification.save();
        return;
      }

      // Convert data to string record for Firebase
      const firebaseData: Record<string, string> = {};
      if (data) {
        Object.keys(data).forEach(key => {
          firebaseData[key] = String(data[key]);
        });
      }

      // Send push notification to all user's devices
      const results = await this.firebaseService.sendMulticastNotification(
        deviceTokens,
        title,
        body,
        firebaseData,
        imageUrl
      );

      // Update notification status
      if (results.successCount > 0) {
        notification.isSent = true;
        notification.sentAt = new Date();
      }

      if (results.failureCount > 0) {
        notification.errorMessage = `Failed to send to ${results.failureCount} devices`;
        
        // Remove invalid tokens from user
        if (results.failedTokens.length > 0) {
          await this.removeInvalidTokens(userId, results.failedTokens);
        }
      }

      await notification.save();
      this.logger.log(`Notification sent to user ${userId}. Success: ${results.successCount}, Failed: ${results.failureCount}`);

    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
      
      // Save error in database
      const notification = new this.notificationModel({
        userId: new Types.ObjectId(userId),
        title,
        body,
        type,
        data,
        imageUrl,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      await notification.save();
    }
  }

  async sendBulkNotification(sendBulkNotificationDto: SendBulkNotificationDto): Promise<void> {
    const { userIds, title, body, type, data, imageUrl } = sendBulkNotificationDto;

    this.logger.log(`Sending bulk notification to ${userIds.length} users`);

    // Send notifications in parallel
    const promises = userIds.map(userId =>
      this.sendNotification({
        userId,
        title,
        body,
        type,
        data,
        imageUrl,
      })
    );

    await Promise.allSettled(promises);
    this.logger.log(`Bulk notification sending completed for ${userIds.length} users`);
  }

  async registerDeviceToken(registerDeviceTokenDto: RegisterDeviceTokenDto, userId: string): Promise<void> {
    const { deviceToken, platform } = registerDeviceTokenDto;

    try {
      // Validate the token with Firebase
      const isValidToken = await this.firebaseService.validateToken(deviceToken);
      if (!isValidToken) {
        throw new Error('Invalid device token');
      }

      // Add token to user's device tokens (avoid duplicates)
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $addToSet: { deviceTokens: deviceToken },
          $set: {
            'notificationPreferences.pushEnabled': true,
          },
        },
        { upsert: false }
      );

      this.logger.log(`Device token registered for user ${userId} on platform ${platform || 'unknown'}`);

      // Subscribe to general notifications topic
      await this.firebaseService.subscribeToTopic(deviceToken, 'general-notifications');

    } catch (error) {
      this.logger.error(`Failed to register device token for user ${userId}:`, error);
      throw error;
    }
  }

  async removeDeviceToken(userId: string, deviceToken: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { deviceTokens: deviceToken } }
      );

      // Unsubscribe from topics
      await this.firebaseService.unsubscribeFromTopic(deviceToken, 'general-notifications');

      this.logger.log(`Device token removed for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove device token for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: NotificationDocument[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      notifications: notifications as NotificationDocument[],
      total,
      hasMore: skip + notifications.length < total,
    };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async getNotificationPreferences(userId: string): Promise<Record<string, boolean>> {
    const user = await this.userModel.findById(userId);
    return user?.notificationPreferences || {};
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      eventUpdates?: boolean;
      marketing?: boolean;
    }
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { notificationPreferences: preferences } }
    );
  }

  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
    imageUrl?: string
  ): Promise<void> {
    try {
      // Convert data to string record for Firebase
      const firebaseData: Record<string, string> = {};
      if (data) {
        Object.keys(data).forEach(key => {
          firebaseData[key] = String(data[key]);
        });
      }

      await this.firebaseService.sendTopicNotification(
        topic,
        title,
        body,
        firebaseData,
        imageUrl
      );

      this.logger.log(`Topic notification sent to: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send topic notification:`, error);
      throw error;
    }
  }

  // Helper method to remove invalid tokens
  private async removeInvalidTokens(userId: string, invalidTokens: string[]): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pullAll: { deviceTokens: invalidTokens } }
      );
      
      this.logger.log(`Removed ${invalidTokens.length} invalid tokens for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove invalid tokens for user ${userId}:`, error);
    }
  }

  // Event-specific notification methods
  async sendEventRegistrationNotification(
    userId: string,
    eventName: string,
    eventDate: string,
    eventData?: Record<string, unknown>
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Event Registration Confirmed',
      body: `Your registration for "${eventName}" has been received and is being reviewed.`,
      type: NotificationType.EVENT_REGISTRATION,
      data: {
        eventName,
        eventDate,
        ...eventData,
      },
    });
  }

  async sendEventShortlistedNotification(
    userId: string,
    eventName: string,
    eventDate: string,
    eventData?: Record<string, unknown>
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Congratulations! You\'re Shortlisted',
      body: `You've been shortlisted for "${eventName}". Check your email for your ticket!`,
      type: NotificationType.EVENT_SHORTLISTED,
      data: {
        eventName,
        eventDate,
        ...eventData,
      },
    });
  }

  async sendEventRejectedNotification(
    userId: string,
    eventName: string,
    eventData?: Record<string, unknown>
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Event Application Update',
      body: `Unfortunately, your application for "${eventName}" was not approved this time.`,
      type: NotificationType.EVENT_REJECTED,
      data: {
        eventName,
        ...eventData,
      },
    });
  }

  async sendEventRemovedFromShortlistNotification(
    userId: string,
    eventName: string,
    eventData?: Record<string, unknown>
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Guest List Update',
      body: `You have been removed from the guest list for "${eventName}".`,
      type: NotificationType.EVENT_REMOVED_FROM_SHORTLIST,
      data: {
        eventName,
        ...eventData,
      },
    });
  }

  async sendEventReminderNotification(
    userId: string,
    eventName: string,
    eventDate: string,
    eventData?: Record<string, unknown>
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Event Reminder',
      body: `Don't forget! "${eventName}" is coming up on ${eventDate}.`,
      type: NotificationType.EVENT_REMINDER,
      data: {
        eventName,
        eventDate,
        ...eventData,
      },
    });
  }
}
