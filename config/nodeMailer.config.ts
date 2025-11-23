import { createTransport } from 'nodemailer';

export function getEmailTransporter(user: string, pass: string) {
  return createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
}