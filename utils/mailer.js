const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendMail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  console.log('Email sent to', to);
}
