const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send email verification link to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  // DEV: Log the URL to console so it can be used even if email fails
  console.log('---------------------------------------------------');
  console.log(`📧 VERIFICATION LINK FOR ${email}:`);
  console.log(verificationUrl);
  console.log('---------------------------------------------------');
  
  const mailOptions = {
    from: '"Parfum D\'Elite" <noreply@parfumdelite.com>',
    to: email,
    subject: 'Verify Your Email - Parfum D\'Elite',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333; }
          .logo { font-family: 'Playfair Display', serif; color: #C5A059; font-size: 24px; margin-bottom: 20px; }
          .button { display: inline-block; background: #C5A059; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Parfum D'Elite</div>
          <h2 style="color: #C5A059;">Welcome to the Elite Circle</h2>
          <p>Thank you for joining Parfum D'Elite. To complete your registration, please verify your email address.</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #C5A059; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
          <div class="footer">
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Email sending error:', error);
    // We don't throw here so the registration flow continues, 
    // but in dev we rely on the console log above.
    // However, the original code threw an error which was caught in index.js.
    // Let's keep the throw to maintain original logic flow, but the log above helps.
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 */
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  // DEV: Log the URL to console
  console.log('---------------------------------------------------');
  console.log(`🔐 PASSWORD RESET LINK FOR ${email}:`);
  console.log(resetUrl);
  console.log('---------------------------------------------------');
  
  const mailOptions = {
    from: '"Parfum D\'Elite" <noreply@parfumdelite.com>',
    to: email,
    subject: 'Password Reset Request - Parfum D\'Elite',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333; }
          .logo { font-family: 'Playfair Display', serif; color: #C5A059; font-size: 24px; margin-bottom: 20px; }
          .button { display: inline-block; background: #C5A059; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Parfum D'Elite</div>
          <h2 style="color: #C5A059;">Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #C5A059; word-break: break-all; font-size: 12px;">${resetUrl}</p>
          <div class="footer">
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Email sending error (suppressed for dev):', error);
    // Don't throw, so the flow continues. The link is logged above.
    // throw new Error('Failed to send password reset email');
  }
}

/**
 * Send AI-generated personalized email
 * @param {Object} user - User object
 * @param {string} messageType - TIER_UPGRADE, PURCHASE_ANNIVERSARY, or PERSONALIZED_RECOMMENDATION
 * @param {Object} context - Additional context for AI generation
 */
async function sendAIPersonalizedEmail(user, messageType, context) {
  const { generatePersonalizedMessage } = require('./aiHelpers');
  
  let subject = '';
  let heading = '';
  
  switch (messageType) {
    case 'TIER_UPGRADE':
      subject = `Welcome to ${user.tier} Tier - Parfum D'Elite`;
      heading = `You've Reached ${user.tier} Status`;
      break;
    case 'PURCHASE_ANNIVERSARY':
      subject = 'A Special Anniversary - Parfum D\'Elite';
      heading = 'Celebrating Your Fragrance Journey';
      break;
    case 'PERSONALIZED_RECOMMENDATION':
      subject = 'Curated Just For You - Parfum D\'Elite';
      heading = 'Your Personal Fragrance Selection';
      break;
    default:
      subject = 'A Message From Parfum D\'Elite';
      heading = 'Exclusive Update';
  }
  
  try {
    // Generate AI personalized content
    const aiMessage = await generatePersonalizedMessage(user, context, messageType);
    
    const mailOptions = {
      from: '"Parfum D\'Elite" <noreply@parfumdelite.com>',
      to: user.email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333; }
            .logo { font-family: 'Playfair Display', serif; color: #C5A059; font-size: 24px; margin-bottom: 20px; }
            .heading { color: #C5A059; font-size: 20px; margin-bottom: 20px; }
            .message { color: #e0e0e0; line-height: 1.6; white-space: pre-line; }
            .footer { color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #333; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Parfum D'Elite</div>
            <div class="heading">${heading}</div>
            <div class="message">${aiMessage}</div>
            <div class="footer">
              <p>This is an exclusive message for ${user.username}.</p>
              <p>Current Tier: ${user.tier} | Total Lifetime Value: $${user.spending}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`AI personalized email sent to ${user.email} (Type: ${messageType})`);
  } catch (error) {
    console.error('AI Email sending error:', error);
    throw new Error('Failed to send personalized email');
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAIPersonalizedEmail
};
