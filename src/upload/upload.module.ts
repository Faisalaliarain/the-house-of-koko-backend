import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
    imports: [SharedModule],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService]
})
export class UploadModule {}
