import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: `config/${process.env.NODE_ENV}.env` });

@Injectable()
export class AwsSesService {
  private ses: AWS.SES;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.SES_REGION,
    });

    this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
  }

  private compileTemplate(templateName: string, data: any): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = Handlebars.compile(source);
    return compiled(data);
  }

  async sendEmailWithTemplate(
    to: string[],
    subject: string,
    templateName: string,
    data: Record<string, any>,
  ) {
    try {
      const htmlBody = this.compileTemplate(templateName, data);
      const params: AWS.SES.SendEmailRequest = {
        Source: process.env.SES_MAIL,
        Destination: {
          ToAddresses: to,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: 'This email requires an HTML-capable email client.',
              Charset: 'UTF-8',
            },
          },
        },
      };

      return await this.ses.sendEmail(params).promise();
    } catch (error) {
      console.error('SES Email Send Error:', error);
      throw error;
    }
  }
}
