import { Injectable, Logger } from '@nestjs/common';
import { S3Client, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.SES_REGION,
    });
  }

  async uploadFile(bucketName: string, key: string, body: Buffer): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
      });
      
      await this.s3.send(command);
      this.logger.log(`File uploaded successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async getFile(bucketName: string, key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      
      return await this.s3.send(command);
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`);
      throw error;
    }
  }
  async uploadPkpassBuffer(bucketName: string, key: string, buffer: Buffer): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'application/vnd.apple.pkpass',
        ContentDisposition: 'attachment; filename="ticket.pkpass"',
        ContentLength: buffer.length,
        ACL: 'private', // optional: remove if using signed URLs
      });

      await this.s3.send(command);

      // Return public URL (adjust if using CloudFront)
      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
    } catch (error) {
      this.logger.error(`Failed to upload pkpass: ${error.message}`);
      throw error;
    }
  }

  async listFiles(bucketName: string, prefix?: string) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });
      
      return await this.s3.send(command);
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(bucketName: string, key: string): Promise<void> {
    try {
      // Extract the S3 key from the URL if a full URL is provided
      const extractedKey = this.extractKeyFromUrl(key);
      
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: extractedKey,
      });
      
      await this.s3.send(command);
      this.logger.log(`File deleted successfully: ${extractedKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  async getPresignedUrl(bucketName: string, key: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Extract the S3 key from the URL if a full URL is provided
      const extractedKey = this.extractKeyFromUrl(key);
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: extractedKey,
      });
      
      const presignedUrl = await getSignedUrl(this.s3, command, { expiresIn });
      this.logger.log(`Presigned URL generated for: ${extractedKey}`);
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract S3 key from either a full S3 URL or return the key as-is
   * @param keyOrUrl - Either an S3 key or full S3 URL
   * @returns S3 key
   */
  extractKeyFromUrl(keyOrUrl: string): string {
    if (!keyOrUrl) {
      return keyOrUrl;
    }

    // If it's a full URL, extract the key
    if (keyOrUrl.startsWith('https://')) {
      try {
        const url = new URL(keyOrUrl);
        // Extract the path without leading slash
        return url.pathname.substring(1);
      } catch {
        this.logger.warn(`Failed to parse URL, using as key: ${keyOrUrl}`);
        return keyOrUrl;
      }
    }

    // If it's already a key, return as-is
    return keyOrUrl;
  }
}
