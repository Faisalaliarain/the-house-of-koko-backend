// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../utils/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  // Personal Info

  @Prop({ required: true})
  name: string;
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  profileImage?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  referralCode?: string;
  // Used Referral code
  @Prop()
  referralCodeUsed?: string;

  @Prop()
  howDidYouHearAboutUs?: string;
  @Prop()
  invitedBy?: string;

  @Prop({ required: false })
  agreedToTerms: boolean;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Prop({ type: Date })
  approvedAt?: Date;
  @Prop({ type: Date })
  invitedAt?: Date;
  // Access Control
  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: true })
  isActive: boolean;

  // OTP / Email Verification
  @Prop()
  otp?: string;

  @Prop()
  otpExpiry?: Date;

  @Prop({ type: Date })
  emailVerifiedAt?: Date;
  @Prop({ type: Date })
  rejectedAt?: Date;

  // Password Reset
  @Prop()
  resetPasswordToken?: string;

  // User credits
  @Prop()
  credits?: number;


  // Generic profile object (no separate schema)
  @Prop({ type: Object })
  profile?: Record<string, any>;

  @Prop({ type: Date })
  resetPasswordExpires?: Date;

  // Google OAuth Integration
  @Prop()
  googleAccessToken?: string;

  @Prop()
  googleRefreshToken?: string;

  @Prop({ type: Date })
  googleTokenExpiry?: Date;

  @Prop()
  zoomAccessToken?: string;

  @Prop()
  zoomRefreshToken?: string;

  @Prop({ type: Date })
  zoomTokenExpiry?: Date;

  // Firebase Device Tokens for Push Notifications
  @Prop({ type: [String], default: [] })
  deviceTokens?: string[];

  @Prop({
    type: {
      pushEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      eventUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    default: {
      pushEnabled: true,
      emailEnabled: true,
      eventUpdates: true,
      marketing: false,
    }
  })
  notificationPreferences?: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    eventUpdates?: boolean;
    marketing?: boolean;
  };

  // Company Profile
  @Prop({ type: Types.ObjectId, ref: 'CompanyProfiles' })
  companyProfile?: Types.ObjectId;

  // Onboarding / Progress Tracking
  @Prop({
    enum: [
      'registered',
      'otp_verified',
      'plan_selected',
      'payment_confirmed',
      'onboarding_completed',
    ],
    default: 'registered',
  })
  onboardingStep?:
    | 'registered'
    | 'otp_verified'
    | 'plan_selected'
    | 'payment_confirmed'
    | 'onboarding_completed';

  @Prop({ default: false })
  hasPurchasedPlan?: boolean;

  @Prop({ default: false })
  hasCompletedOnboarding?: boolean;

  @Prop()
  selectedPlanId?: string;

  // Stripe Integration
  @Prop()
  stripeCustomerId?: string;

  // Timestamps (Handled by timestamps: true)
  // createdAt and updatedAt are auto-generated
}

export const UserSchema = SchemaFactory.createForClass(User);
