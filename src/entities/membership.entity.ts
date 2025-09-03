import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MembershipDocument = Membership & Document;

export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true, collection: 'memberships' })
export class Membership {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Plan' })
  planId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId;

  @Prop({ enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Date })
  suspendedAt?: Date;

  @Prop()
  suspensionReason?: string;

  @Prop({ type: Date })
  reactivatedAt?: Date;

  @Prop({ default: false })
  autoRenew: boolean;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
