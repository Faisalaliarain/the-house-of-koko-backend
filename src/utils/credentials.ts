import { TEMPLATE_NAME } from "./enums/template_names.enum";
import { sendEmail } from "./mailer/ses.mailer";

const sendAccountCredentials = async (username: string, email: string, password: string, link: string, userType: string) => {
    const template = TEMPLATE_NAME.ACCOUNT_CREDENTIALS; 
    await sendEmail([email], template, { username, email, password,link, usertype: userType });

    return { email, password };
};

export { sendAccountCredentials };
