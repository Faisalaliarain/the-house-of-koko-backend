import * as aws from 'aws-sdk';
import * as dotenv from 'dotenv'
dotenv.config()
dotenv.config({ path: `config/${process.env.NODE_ENV}.env` })

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.SES_REGION,
});

const ses = new aws.SES({ apiVersion: '2010-12-01' });

export const sendEmail = async (to, templateName, data?) => {
  try {
    const params = {
      Source: process.env.SES_MAIL,
      Template: templateName,
      Destination: {
        ToAddresses: to,
      },
      TemplateData: JSON.stringify(data),
    };
    const emailSent = await ses.sendTemplatedEmail(params).promise();
    return emailSent;
  } catch (error) {
    console.log(error);
    return '';
  }
};
