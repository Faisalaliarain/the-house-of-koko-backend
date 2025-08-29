import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ResendOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResendOtpResponseDto {
  @ApiProperty({ example: 'OTP resent to your email.' })
  message: string;
}
