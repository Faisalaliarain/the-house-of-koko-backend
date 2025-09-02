import {Controller, Post, Body, HttpException, HttpStatus, Req, UseGuards} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, GenericResponseDto, LoginResponseDto } from './dto/login.dto';
import {RegisterDto} from "./dto/register.dto";
import {VerifyOtpDto} from "./dto/verify-otp.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Policy } from '../decorators/policy.decorator';
import { UserPermissions, RbacEntities, EntityPath } from '../../utils/enums/rbac.enum';
import {ResendOtpDto, ResendOtpResponseDto} from "./dto/resend.dto";
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new LP/GP user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered, OTP sent', type: GenericResponseDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  
  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend new OTP' })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'User registered, OTP sent', type: ResendOtpResponseDto })
  async resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP after registration' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully', type: GenericResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset code' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset code sent if account exists', type: GenericResponseDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('forgot-password/resend')
  @ApiOperation({ summary: 'Resend password reset code' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset code sent if account exists', type: GenericResponseDto })
  async resendForgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendForgotPassword(dto);
  }

  @Post('forgot-password/verify')
  @ApiOperation({ summary: 'Verify password reset code' })
  @ApiBody({ type: VerifyResetCodeDto })
  @ApiResponse({ status: 200, description: 'Code verified', type: GenericResponseDto })
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using email + code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful', type: GenericResponseDto })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password (requires authentication)' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully', type: GenericResponseDto })
  async changePassword(@UserDecorator('userId') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }
}
