// src/shared/user/user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {AwsSesService} from "../aws-ses/aws-ses-service";
import { S3Service } from '../services/s3.service';
import { RbacModule } from '../rbac/rbac.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    RbacModule,
  ],
  providers: [UserService, AwsSesService, S3Service],
  controllers: [UserController],
  exports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), UserService, AwsSesService]
})
export class UserModule {}
