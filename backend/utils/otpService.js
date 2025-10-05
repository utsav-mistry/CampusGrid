import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import OTPVerification from '../models/OTPVerification.js';

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create email transporter (supports multiple providers)
 * Supports: Brevo (Sendinblue), Gmail, SendGrid, or custom SMTP
 */
const createTransporter = () => {
  // Option 1: Brevo (Sendinblue) SMTP
  if (process.env.BREVO_SMTP_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_SMTP_KEY
      }
    });
  }
  
  // Option 2: Gmail
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  
  // Option 3: SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Option 4: Custom SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  
  throw new Error('No email service configured. Please set BREVO_SMTP_KEY, GMAIL credentials, SENDGRID_API_KEY, or SMTP settings in .env');
};

/**
 * Send OTP via email using Nodemailer
 * @param {string} email - Recipient email
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTP = async (email, purpose) => {
  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Delete any existing OTPs for this email and purpose
    await OTPVerification.deleteMany({ email, purpose });
    
    // Store in database
    await OTPVerification.create({
      email,
      otp: hashedOTP,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      isVerified: false
    });
    
    // Create transporter
    const transporter = createTransporter();
    
    // Email options
    const mailOptions = {
      from: {
        name: process.env.EMAIL_SENDER_NAME || 'CampusGrid',
        address: process.env.EMAIL_SENDER_ADDRESS || process.env.BREVO_SENDER_EMAIL || 'noreply@campusgrid.com'
      },
      to: email,
      subject: `Your CampusGrid OTP: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .otp { font-size: 32px; font-weight: bold; color: #3B82F6; text-align: center; letter-spacing: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CampusGrid</h1>
            </div>
            <div class="content">
              <h2>Email Verification</h2>
              <p>Your OTP for ${purpose} is:</p>
              <div class="otp">${otp}</div>
              <p><strong>Valid for 5 minutes.</strong></p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 CampusGrid. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email} for ${purpose}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<boolean>} - Verification result
 */
export const verifyOTP = async (email, otp, purpose) => {
  try {
    // Find the latest OTP for this email and purpose
    const otpRecord = await OTPVerification.findOne({
      email,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      throw new Error('OTP expired or not found');
    }
    
    // Check attempts
    if (otpRecord.attempts >= 3) {
      throw new Error('Maximum attempts exceeded');
    }
    
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();
    
    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    
    if (!isValid) {
      throw new Error('Invalid OTP');
    }
    
    // Mark as verified
    otpRecord.isVerified = true;
    await otpRecord.save();
    
    console.log(`✅ OTP verified for ${email}`);
    return true;
    
  } catch (error) {
    console.error('❌ OTP verification failed:', error.message);
    throw error;
  }
};
