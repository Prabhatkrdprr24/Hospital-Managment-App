import { getEmailTemplate } from '../EmailTemplate/email_template.js';
import { generateOTP } from './SendEmailOtp.js';

const generateOTPEmail = async (user, email) => {
    try{
        //generate new OTP, save in user model and send to user email
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        //read email template
        const html = getEmailTemplate({
            title: "Your OTP for Prescripto",
            email,
            message: "Your OTP for email verification is:",
            otp,
            footer: "Valid for 10 minutes"
        });
        
        return html;
    }
    catch(error){
        console.error("Error generating OTP:", error);
        throw new Error("Error generating OTP");
    }
}

export default generateOTPEmail;