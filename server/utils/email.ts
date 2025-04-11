import nodemailer from 'nodemailer';
import { User } from '@shared/schema';

// Check if environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
  console.error('Current values:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
  });
}

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Enable debug logs
  logger: true  // Enable logger
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error("Email configuration error:", error);
    console.error("Current email configuration:", {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER ? 'Set' : 'Not set',
        pass: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
      }
    });
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or a database)
const otpStore = new Map<string, { otp: string; timestamp: number }>();

// Send OTP email
export async function sendOTPEmail(user: User, otp: string): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration is missing');
  }

  try {
    console.log('Attempting to send email to:', user.email);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification - FileVault',
      html: `
        <h1>Welcome to FileVault!</h1>
        <p>Thank you for registering. Please use the following OTP to verify your email:</p>
        <h2 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      `,
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Store OTP with timestamp
export function storeOTP(email: string, otp: string): void {
  otpStore.set(email, {
    otp,
    timestamp: Date.now(),
  });
}

// Verify OTP
export function verifyOTP(email: string, otp: string): boolean {
  const storedData = otpStore.get(email);
  if (!storedData) return false;

  // Check if OTP is expired (10 minutes)
  if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
    otpStore.delete(email);
    return false;
  }

  // Check if OTP matches
  if (storedData.otp !== otp) return false;

  // Clear OTP after successful verification
  otpStore.delete(email);
  return true;
} 