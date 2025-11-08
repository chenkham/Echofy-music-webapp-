// Titan Email Configuration
// TODO: Add your Titan Email SMTP credentials

export const emailConfig = {
  host: "smtp.titan.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "YOUR_EMAIL@yourdomain.com", // Your Titan email address
    pass: "YOUR_EMAIL_PASSWORD", // Your Titan email password
  },
};

// Instructions:
// 1. Login to your Titan Email account
// 2. Go to Settings > Email Accounts
// 3. Find your SMTP credentials
// 4. Replace the values above with your credentials
//
// Note: For production, use environment variables instead of hardcoding credentials
