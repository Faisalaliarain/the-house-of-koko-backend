import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseService } from './firebase.service';
import { Notification, NotificationSchema } from '../../entities/notification.entity';
import { User, UserSchema } from '../../entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseService],
  exports: [NotificationService, FirebaseService],
})
export class NotificationModule {}
