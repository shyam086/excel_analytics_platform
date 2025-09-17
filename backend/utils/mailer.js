
const nodemailer = require('nodemailer');

const sendMail = async (to, subject, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <p><strong>Your OTP is:</strong> <span style="font-size: 20px; color: #1e40af;">${otp}</span></p>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = sendMail;
