// Email Verification Service using Titan Email
// This service generates OTP codes and sends them via email

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with 10-minute expiration
export const storeOTP = (email: string, otp: string): void => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email.toLowerCase(), { code: otp, expiresAt });
};

// Verify OTP
export const verifyOTP = (email: string, otp: string): boolean => {
  const stored = otpStore.get(email.toLowerCase());

  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }

  const isValid = stored.code === otp;

  if (isValid) {
    otpStore.delete(email.toLowerCase());
  }

  return isValid;
};

// Send OTP email using Titan Email
// Note: This needs to be called from a backend API in production
// For now, we'll create a mock function that would be replaced with actual API call
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    // In production, this should call your backend API
    // which will use nodemailer with Titan SMTP to send the email

    // Example backend code (to be implemented in a Node.js server):
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });

    await transporter.sendMail({
      from: emailConfig.auth.user,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1DB954;">Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #1DB954; font-size: 48px; letter-spacing: 8px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    */

    // For development, we'll simulate email sending
    console.log(`📧 OTP Email would be sent to: ${email}`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log(
      "⚠️  In production, implement backend API to send actual emails via Titan SMTP"
    );

    // Store OTP for verification
    storeOTP(email, otp);

    // Simulate successful email sending
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
};

// Request OTP (generates and sends)
export const requestOTP = async (email: string): Promise<boolean> => {
  const otp = generateOTP();
  return await sendOTPEmail(email, otp);
};

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
