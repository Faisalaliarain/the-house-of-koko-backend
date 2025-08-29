import {HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import {OtpService} from "./otp.service";
import {RegisterDto} from "./dto/register.dto";
import {VerifyOtpDto} from "./dto/verify-otp.dto";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../../entities/user.entity";
import {UserRole} from "../../utils/enums/roles.enum";
import {Model} from "mongoose";
import {AwsSesService} from "../aws-ses/aws-ses-service";
import { nanoid } from 'nanoid';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TEMPLATE_NAME } from '../../utils/enums/template_names.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../notification/dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly awsSes: AwsSesService,
    private readonly notificationService: NotificationService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first.');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Your account has been blocked.');
    }

    // Profile not setup yet
    if ((user.role !== "admin") && !user.profile) {
      throw new HttpException(
        'Please complete your profile first.',
        HttpStatus.FORBIDDEN,
      );
    }

    //admin not approved yet
    if (!user.isApproved) {
      throw new HttpException(
        'Your profile is submitted and awaiting admin approval.',
        HttpStatus.FORBIDDEN,
      );
    }

    return user;
  }

  async login(user: UserDocument) {
    const payload = { sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user?.email?.toLowerCase(),
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const userExists = await this.usersService.findByEmail(registerDto.email);
    if (userExists) throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes

    // Step 1: Generate a unique referral code for this new user
    
    const referralCode = nanoid(8); // You can customize length

    // Step 2: Default credits
    const credits = 0;
    const referralCodeUsed = registerDto.referralCode || ''
    const postObject = {
      ...registerDto,
      email: registerDto?.email?.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpiry,
      role: UserRole.GUEST, // Default role for new registrations
      isVerified: false,
      isApproved: false,
      referralCode,
      credits,
      referralCodeUsed
    }
    // Step 3: If referral code is provided, credit the inviter
    /*if (registerDto.referralCode) {
      const inviter = await this.usersService.findByReferralCode(registerDto.referralCode);
      postObject.referralCodeUsed = registerDto.referralCode
      if (inviter) {
        const inviteRecord = await this.referralInviteModel.findOne({
          inviteeEmail: registerDto.email,
          inviterId: inviter.id, // 👈 fix here
        });

        if (inviteRecord) {
          if (inviteRecord.expiresAt && inviteRecord.expiresAt < new Date()) {
            throw new Error('Invite expired');
          }

          if (inviteRecord.usageCount >= inviteRecord.maxUsage) {
            throw new Error('Invite usage limit reached');
          }

          inviteRecord.usageCount++;
          inviteRecord.isUsed = true;
          await inviteRecord.save();
        }

        // credit inviter
        inviter.credits += 50;
        await inviter.save(); // 👈 ensure inviter is a Mongoose document, not lean
        registerDto.invitedBy = inviter.id; // 👈 fix here
        registerDto.invitedAt = new Date();
      }
    }*/


    await this.usersService.createUser(postObject);
    this.awsSes.sendEmailWithTemplate(
      [registerDto.email],
      'Your OTP Code for Verification',
      'otp-verification',
      {
        name: registerDto.name || 'User',
        otp: otp,
      }
    ).then()

    return { message: 'OTP sent to email. Please verify to continue.' };
  }
  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('User already verified');
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes expiry

    // Update OTP and expiry in DB
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send email using AWS SES
    await this.awsSes.sendEmailWithTemplate(
      [user.email],
      'Your OTP Code for Verification',
      'otp-verification',
      {
        name: user.name || 'User',
        otp,
      }
    );

    return { message: 'OTP resent to your email.' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');
    console.log(user.otp, dto.otp)
    const isExpired = user.otpExpiry && user.otpExpiry.getTime() < Date.now();
    if (isExpired) throw new Error('OTP expired');
    if (user.otp != dto.otp) throw new Error('Invalid OTP');

    user.isVerified = true;
    // lp or gp
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return { message: 'Account verified. Please complete your profile and request admin approval to proceed.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // For security, do not reveal user existence
      return { message: 'If an account exists, a code has been sent.' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = expires as any;
    await user.save();

    await this.awsSes.sendEmailWithTemplate(
      [user.email],
      'Your Email Verification to Reset Password for The project-name',
      TEMPLATE_NAME.FORGOT_PASSWORD_OTP,
      { name: user.name || 'User', otp }
    );

    return { message: 'If an account exists, a code has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Invalid code');

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new HttpException('No reset requested', HttpStatus.BAD_REQUEST);
    }

    const isExpired = user.resetPasswordExpires.getTime() < Date.now();
    if (isExpired) throw new HttpException('Reset code expired', HttpStatus.BAD_REQUEST);

    if (user.resetPasswordToken !== dto.otp) {
      throw new HttpException('Invalid reset code', HttpStatus.BAD_REQUEST);
    }

    user.password = await bcrypt.hash(dto.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Password reset successful' };
  }

  async resendForgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Always return generic message to avoid user enumeration
    if (!user) {
      return { message: 'If an account exists, a code has been sent.' };
    }

    // If a token exists and not expired, reuse it; else generate a new one
    let otp = user.resetPasswordToken;
    let expires = user.resetPasswordExpires;
    const now = Date.now();
    if (!otp || !expires || expires.getTime() < now) {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      expires = new Date(now + 10 * 60 * 1000);
      user.resetPasswordToken = otp;
      user.resetPasswordExpires = expires as any;
      await user.save();
    }

    await this.awsSes.sendEmailWithTemplate(
      [user.email],
      'Your Password Reset Code',
      TEMPLATE_NAME.FORGOT_PASSWORD_OTP,
      { name: user.name || 'User', otp }
    );

    return { message: 'If an account exists, a code has been sent.' };
  }

  async verifyResetCode(dto: { email: string; otp: string }) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
    }
    const isExpired = user.resetPasswordExpires.getTime() < Date.now();
    if (isExpired) throw new HttpException('Reset code expired', HttpStatus.BAD_REQUEST);
    if (user.resetPasswordToken !== dto.otp) {
      throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
    }
    return { message: 'Code verified' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();

    return { message: 'Password updated successfully' };
  }
}
