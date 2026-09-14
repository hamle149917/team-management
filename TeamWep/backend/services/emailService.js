const nodemailer = require('nodemailer');

const getEmailPassword = () => process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: getEmailPassword(),
    },
  });
};

const isEmailConfigured = () => {
  const hasUser = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'PASTE_YOUR_EMAIL_HERE';
  const hasPassword = getEmailPassword() && getEmailPassword() !== 'PASTE_YOUR_EMAIL_APP_PASSWORD_HERE';

  return hasUser && hasPassword;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.log('Email not sent. SMTP configuration missing or stale.');
    console.log('EMAIL_USER configured:', !!process.env.EMAIL_USER, process.env.EMAIL_USER || 'missing');
    console.log('EMAIL_APP_PASSWORD configured:', !!(process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS), 'value present');
    console.log(`To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return { success: true, info };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (user, code) => {
  return sendEmail({
    to: user.email,
    subject: 'Team Management Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc;">
        <h2 style="color: #111827; margin-bottom: 12px;">Welcome to Team Management</h2>
        <p style="color: #374151;">Hi ${user.name},</p>
        <p style="color: #374151;">Use the code below to verify your account:</p>
        <div style="background: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; border: 1px solid #dbeafe;">
          <div style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #1d4ed8;">${code}</div>
        </div>
        <p style="color: #4b5563;">This verification code expires in 10 minutes.</p>
      </div>
    `,
  });
};

const sendResetEmail = async (user, code) => {
  return sendEmail({
    to: user.email,
    subject: 'Team Management Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc;">
        <h2 style="color: #111827; margin-bottom: 12px;">Password Reset Request</h2>
        <p style="color: #374151;">Hi ${user.name},</p>
        <p style="color: #374151;">Use the code below to reset your password:</p>
        <div style="background: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; border: 1px solid #fde68a;">
          <div style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #b45309;">${code}</div>
        </div>
        <p style="color: #4b5563;">This reset code expires in 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetEmail,
};
