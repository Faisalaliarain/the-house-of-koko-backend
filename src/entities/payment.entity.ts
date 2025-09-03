import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Plan' })
  planId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'GBP' })
  currency: string;

  @Prop({ required: true })
  stripePaymentIntentId: string;

  @Prop({ required: true })
  stripeClientSecret: string;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ enum: PaymentMethod, default: PaymentMethod.CARD })
  paymentMethod: PaymentMethod;

  @Prop()
  stripeChargeId?: string;

  @Prop()
  failureReason?: string;

  @Prop()
  refundId?: string;

  @Prop()
  refundAmount?: number;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;
  

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Object })
  stripeMetadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
