import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipStatus } from '../../../entities/membership.entity';

export class MembershipStatusResponseDto {
  @ApiProperty()
  hasActiveMembership: boolean;

  @ApiPropertyOptional()
  currentMembership?: {
    id: string;
    plan: {
      id: string;
      name: string;
      price: number;
      currency: string;
      features: string[];
    };
    startDate: Date;
    endDate: Date;
    status: MembershipStatus;
  };

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  daysRemaining?: number;
}

export class MembershipResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
  };

  @ApiProperty()
  payment: {
    id: string;
    amount: number;
    currency: string;
    paidAt: Date;
  };

  @ApiProperty({ enum: MembershipStatus })
  status: MembershipStatus;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancellationReason?: string;

  @ApiPropertyOptional()
  suspendedAt?: Date;

  @ApiPropertyOptional()
  suspensionReason?: string;

  @ApiPropertyOptional()
  reactivatedAt?: Date;

  @ApiProperty()
  autoRenew: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CancelMembershipDto {
  @ApiProperty({ description: 'Membership ID to cancel' })
  @IsString()
  @IsNotEmpty()
  membershipId: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SuspendMembershipDto {
  @ApiProperty({ description: 'Membership ID to suspend' })
  @IsString()
  @IsNotEmpty()
  membershipId: string;

  @ApiPropertyOptional({ description: 'Reason for suspension' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ExtendMembershipDto {
  @ApiProperty({ description: 'Membership ID to extend' })
  @IsString()
  @IsNotEmpty()
  membershipId: string;

  @ApiProperty({ description: 'Number of days to extend' })
  @IsNumber()
  @IsNotEmpty()
  days: number;
}
