import { IsString, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';

export enum NotificationType {
  EVENT_REGISTRATION = 'EVENT_REGISTRATION',
  EVENT_SHORTLISTED = 'EVENT_SHORTLISTED',
  EVENT_REJECTED = 'EVENT_REJECTED',
  EVENT_REMOVED_FROM_SHORTLIST = 'EVENT_REMOVED_FROM_SHORTLIST',
  EVENT_REMINDER = 'EVENT_REMINDER',
  GENERAL = 'GENERAL'
}

export class SendNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class SendBulkNotificationDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class RegisterDeviceTokenDto {
  @IsString()
  deviceToken: string;

  @IsOptional()
  @IsString()
  platform?: 'ios' | 'android' | 'web';
}
