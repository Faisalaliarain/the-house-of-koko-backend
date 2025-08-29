import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { S3Service } from '../shared/services/s3.service';
import { UploadResponseDto } from './dto';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);
    
    // Supported image formats
    private readonly imageFormats = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];

    // Supported file formats (you can extend this)
    private readonly allowedFormats = [
        ...this.imageFormats,
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // Max file size (10MB)
    private readonly maxFileSize = 10 * 1024 * 1024;

    constructor(private readonly s3Service: S3Service) {}

    async uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadResponseDto> {
        this.validateImageFile(file);
        return this.processUpload(file, folder || 'images');
    }

    async uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResponseDto> {
        this.validateFile(file);
        return this.processUpload(file, folder || 'files');
    }

    private validateImageFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!this.imageFormats.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid image format. Supported formats: ${this.imageFormats.join(', ')}`
            );
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`
            );
        }

        // Additional image-specific validations
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (!fileExtension || !validImageExtensions.includes(fileExtension)) {
            throw new BadRequestException('Invalid image file extension');
        }
    }

    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!this.allowedFormats.includes(file.mimetype)) {
            throw new BadRequestException(
                `Unsupported file format: ${file.mimetype}`
            );
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`
            );
        }
    }

    private async processUpload(file: Express.Multer.File, folder: string): Promise<UploadResponseDto> {
        try {
            const timestamp = Date.now();
            const uniqueId = uuidv4().split('-')[0]; // Use first part of UUID for shorter names
            const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            
            // Create a clean, organized file path
            const fileName = `${folder}/${timestamp}/${uniqueId}-${sanitizedOriginalName}`;
            const bucketName = process.env.AWS_S3_BUCKET_NAME || 'project-name-events-bucket';

            // Upload to S3
            await this.s3Service.uploadFile(bucketName, fileName, file.buffer);

            // Generate public URL
            const url = `https://${bucketName}.s3.${process.env.SES_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

            const response: UploadResponseDto = {
                url,
                key: fileName,
                filename: sanitizedOriginalName,
                size: file.size,
                mimeType: file.mimetype
            };

            this.logger.log(`File uploaded successfully: ${fileName}`);
            return response;

        } catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`);
            throw new BadRequestException(`Upload failed: ${error.message}`);
        }
    }
}
