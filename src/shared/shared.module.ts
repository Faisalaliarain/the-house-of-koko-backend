import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExceptionService } from './services/exception.service';
import { SharedService } from './services/shared.service';
import { ApiService } from './services/http.service';
import { S3Service } from './services/s3.service';
import { JwtService } from './services/jwt.service';
import { User, UserSchema } from '../entities/user.entity';
import { UserModule } from './user/user.module';
import { RbacModule } from './rbac/rbac.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    RbacModule,
  ],
  providers: [
    ExceptionService,
    SharedService,
    ApiService,
    S3Service,
    JwtService
  ],
  controllers: [],
  exports: [
    ExceptionService,
    SharedService,
    ApiService,
    S3Service,
    JwtService,
    MongooseModule,
    UserModule,
    RbacModule
  ],
})
export class SharedModule {}
