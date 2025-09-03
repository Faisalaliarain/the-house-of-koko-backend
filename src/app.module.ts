import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UploadModule } from './upload/upload.module';
import {AuthModule} from "./shared/auth/auth.module";
import { NotificationModule } from './shared/notification/notification.module';
import { PlanModule } from './shared/plan/plan.module';
import { PaymentModule } from './shared/payment/payment.module';
import { MembershipModule } from './shared/membership/membership.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/koko'),
    ScheduleModule.forRoot(),
    SharedModule,
    UploadModule,
    AuthModule,
    NotificationModule,
    PlanModule,
    PaymentModule,
    MembershipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
