import { Resend } from 'resend';

// Initialize Resend with key from .env
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const sendEmail = async (options) => {
  // If no API key is set, simulate sending
  if (!process.env.RESEND_API_KEY) {
    console.warn(`⚠️ Simulate sending email to ${options.to}: ${options.subject}`);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'KaamatKaam <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
