// src/auth/otp.service.ts
import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class OtpService {
  private sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async sendOtpEmail(email: string, otp: string) {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Data: `Your OTP Code is: ${otp}`,
          },
        },
        Subject: {
          Data: 'Verify your account',
        },
      },
      Source: 'your_verified_email@example.com',
    };

    try {
      await this.sesClient.send(new SendEmailCommand(params));
    } catch (err) {
      console.error('❌ Failed to send OTP email:', err);
      throw err;
    }
  }
}
