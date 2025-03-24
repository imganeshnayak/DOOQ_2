import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use app-specific password
  }
});

export const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'DOOQ - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering with DOOQ. Your verification code is:</p>
          <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};