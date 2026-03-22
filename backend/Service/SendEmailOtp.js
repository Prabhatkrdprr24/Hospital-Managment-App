import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmailOtp = async (email, html) => {

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for Prescripto',
        html
    };
    await transporter.sendMail(mailOptions);
}