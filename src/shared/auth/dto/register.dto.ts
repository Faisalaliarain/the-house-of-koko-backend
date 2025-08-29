// src/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  companyProfile: Types.ObjectId;

  @ApiProperty({ example: '+1-555-123-4567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'REF1234' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ example: '2025-07-29T15:30:00.000Z', description: 'Timestamp when invite was sent' })
  @IsOptional()
  @IsString()
  invitedAt?: Date;

  @ApiPropertyOptional({ example: 'bfgjjsoeoeolsldassajdashkds', description: 'User ID or referral code of the inviter' })
  @IsOptional()
  @IsString()
  invitedBy?: string;

  @ApiPropertyOptional({ example: 'Google Ads' })
  @IsOptional()
  @IsString()
  howDidYouHearAboutUs?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  agreedToTerms: boolean;
}
