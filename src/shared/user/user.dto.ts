import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsMongoId, IsBoolean, IsOptional, IsIn, IsString } from "class-validator";
import {UserRole} from "../../utils/enums/roles.enum";

export class getUserbyIdDTO {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsMongoId({ message: 'Invalid Mongo ObjectId format' })
    id: string;
  }


export class UserResponseDto {
  @ApiProperty({ example: '64a7e7d5e67d8e3c7f2f3142' })
  _id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'ACME Capital' })
  companyName: string;

  @ApiProperty({ example: UserRole.USER, enum: UserRole })
  role: UserRole;

  @ApiProperty({ example: true })
  isApproved: boolean;

  @ApiProperty({ example: new Date().toISOString() })
  createdAt: string;

  @ApiProperty({ example: new Date().toISOString() })
  updatedAt: string;

  @ApiProperty({
    example: {
      'knowledgebase.view': true,
      'documents.upload': false,
    },
    description: 'User permissions object where keys are permission names and values are booleans',
    type: 'object',
    additionalProperties: { type: 'boolean' },
  })
  permissions: { [key: string]: boolean };
}


export class UpdateProgressDto {
  @ApiProperty({
    enum: [
      'registered',
      'otp_verified',
      'plan_selected',
      'payment_confirmed',
      'onboarding_completed',
    ],
    required: false,
  })
  @IsOptional()
  @IsIn(['registered','otp_verified','plan_selected','payment_confirmed','onboarding_completed'])
  onboardingStep?: 'registered' | 'otp_verified' | 'plan_selected' | 'payment_confirmed' | 'onboarding_completed';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasPurchasedPlan?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCompletedOnboarding?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCompletedPayment?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasSelectedInterests?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  selectedPlanId?: string;
}


