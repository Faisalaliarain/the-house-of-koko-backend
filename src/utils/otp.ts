import { TEMPLATE_NAME } from "./enums/template_names.enum";
import { sendEmail } from "./mailer/ses.mailer";


const sendOtp = async (email: string, username, template = TEMPLATE_NAME.FORGOT_PASSWORD_OTP) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    if (email) await sendEmail([email], template, { username: username, otp: otp })
    return otp
}

export  {
    sendOtp
}