import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!config.smtp.user || !config.smtp.pass) {
    console.log('Email not configured, skipping:', options.subject);
    return;
  }
  
  await transporter.sendMail({
    from: config.smtp.from,
    ...options,
  });
};

export const sendBookingConfirmation = async (
  email: string,
  name: string,
  booking: {
    confirmationCode: string;
    scheduledDate: Date;
    scheduledTime: string;
    consultationType: string;
  }
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #f8f6f6; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: #913e27; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .detail { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3e0d5; }
        .label { color: #8d6458; }
        .value { font-weight: bold; color: #2b1810; }
        .code { background: #f3e0d5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .code span { font-size: 24px; font-weight: bold; color: #913e27; letter-spacing: 2px; }
        .footer { background: #f3e0d5; padding: 20px; text-align: center; color: #8d6458; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for choosing Henna Harmony Studio. Your consultation has been confirmed!</p>
          
          <div class="code">
            <p style="margin: 0 0 5px 0; color: #8d6458;">Confirmation Code</p>
            <span>${booking.confirmationCode}</span>
          </div>
          
          <div class="detail">
            <span class="label">Date</span>
            <span class="value">${new Date(booking.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="detail">
            <span class="label">Time</span>
            <span class="value">${booking.scheduledTime}</span>
          </div>
          <div class="detail">
            <span class="label">Type</span>
            <span class="value">${booking.consultationType}</span>
          </div>
          
          <p style="margin-top: 20px;">We look forward to bringing your henna vision to life!</p>
        </div>
        <div class="footer">
          <p>© 2024 Henna Harmony Studio. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Booking Confirmed - ${booking.confirmationCode}`,
    html,
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #f8f6f6; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #913e27, #d8a85b); color: white; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 30px; text-align: center; }
        .btn { display: inline-block; background: #913e27; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { background: #f3e0d5; padding: 20px; text-align: center; color: #8d6458; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Henna Harmony</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Welcome to Henna Harmony Studio! We're thrilled to have you join our community of brides seeking the perfect mehndi design.</p>
          <p>With our AI-powered design studio, you can:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>Upload your hand for personalized analysis</li>
            <li>Match designs to your outfit</li>
            <li>Generate unique henna designs</li>
            <li>Book consultations with expert artists</li>
          </ul>
          <a href="${config.frontendUrl}" class="btn">Start Designing</a>
        </div>
        <div class="footer">
          <p>© 2024 Henna Harmony Studio. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Henna Harmony Studio! ✨',
    html,
  });
};
