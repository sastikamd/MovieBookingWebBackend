const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio client
const smsClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"CinemaBooking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

async function sendSMS(to, body) {
  await smsClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body
  });
}

module.exports = { sendEmail, sendSMS };
