import nodemailer from "nodemailer";
import "dotenv/config";

export const verifyEmail = (token, email) => {
  const BACKEND_URL = process.env.SERVER_URL || "http://localhost:8000";
  const verificationLink = `${BACKEND_URL}/api/v1/users/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Verify Your Email — Utsav.in",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffbeb; border-radius: 16px;">
        <h2 style="color: #92400e; margin-bottom: 16px;">Welcome to Utsav.in 🎉</h2>
        <p style="color: #44403c; line-height: 1.6;">
          Please click the button below to verify your email address and activate your account.
        </p>
        <a href="${verificationLink}"
           style="display: inline-block; margin-top: 24px; padding: 12px 28px;
                  background: linear-gradient(135deg, #d97706, #ea580c);
                  color: white; border-radius: 10px; text-decoration: none;
                  font-weight: 600; font-size: 14px;">
          Verify Email
        </a>
        <p style="margin-top: 24px; color: #78716c; font-size: 13px;">
          This link expires in <strong>10 minutes</strong>. If you didn't register, ignore this email.
        </p>
      </div>
    `,
  };

  transporter.sendMail(mailConfigurations, (error, info) => {
    if (error) {
      console.error("❌ Email send error:", error);
      throw new Error(error);
    }
    console.log("✅ Verification email sent:", info.messageId);
  });
};
