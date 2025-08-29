import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('image')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload an image file' })
    @ApiQuery({ 
        name: 'folder', 
        required: false, 
        description: 'Folder path to organize uploads (e.g., events, profiles, etc.)',
        example: 'events'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'File uploaded successfully', 
        type: UploadResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Invalid file or upload failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Query('folder') folder?: string
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return this.uploadService.uploadImage(file, folder);
    }

    @Post('file')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload any file' })
    @ApiQuery({ 
        name: 'folder', 
        required: false, 
        description: 'Folder path to organize uploads',
        example: 'documents'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'File uploaded successfully', 
        type: UploadResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Invalid file or upload failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('folder') folder?: string
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return this.uploadService.uploadFile(file, folder);
    }
}
