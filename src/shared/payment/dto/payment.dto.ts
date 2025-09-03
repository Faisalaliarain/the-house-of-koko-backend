import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../../entities/payment.entity';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Plan ID to purchase' })
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Payment ID to confirm' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

export class CancelPaymentDto {
  @ApiProperty({ description: 'Payment ID to cancel' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  planId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  stripePaymentIntentId: string;

  @ApiProperty()
  clientSecret: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  failureReason?: string;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  failedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaymentHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
  };

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  failedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class StripeWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payload: string;
}
