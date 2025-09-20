const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,        // smtp.gmail.com
  port: process.env.MAIL_PORT || 587,
  secure: false,                      // true với port 465, false với 587
  auth: {
    user: process.env.MAIL_USER,      // email của bạn
    pass: process.env.MAIL_PASS       // 16 ký tự App Password liền
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"SupplierProduct App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log('Email sent to', to);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

module.exports = sendMail;
