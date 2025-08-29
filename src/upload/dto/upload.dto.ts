import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UploadResponseDto {
    @ApiProperty({ 
        example: 'https://project-name-events-bucket.s3.us-east-1.amazonaws.com/events/1706123456789/image-1706123456789.jpg',
        description: 'The public URL of the uploaded file'
    })
    @IsString()
    url: string;

    @ApiProperty({ 
        example: 'events/1706123456789/image-1706123456789.jpg',
        description: 'The key/path of the file in the storage bucket'
    })
    @IsString()
    key: string;

    @ApiProperty({ 
        example: 'image-1706123456789.jpg',
        description: 'The original filename'
    })
    @IsString()
    filename: string;

    @ApiProperty({ 
        example: 1024567,
        description: 'File size in bytes'
    })
    @IsNumber()
    size: number;

    @ApiProperty({ 
        example: 'image/jpeg',
        description: 'MIME type of the uploaded file'
    })
    @IsString()
    mimeType: string;
}
