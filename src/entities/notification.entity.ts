import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../shared/notification/dto/notification.dto';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: Object })
  data?: Record<string, unknown>;

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isSent: boolean;

  @Prop()
  sentAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop()
  errorMessage?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
