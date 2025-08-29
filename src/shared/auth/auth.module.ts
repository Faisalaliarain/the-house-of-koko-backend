import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import {SharedModule} from "../shared.module";
import {OtpService} from "./otp.service";
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SharedModule,
    PassportModule,
    NotificationModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'default_secret',
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
      }),
    }),

  ],
  providers: [AuthService, JwtStrategy, OtpService],
  controllers: [AuthController],
})
export class AuthModule {}
