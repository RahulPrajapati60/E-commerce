import nodemailer from "nodemailer";
import "dotenv/config";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const sendOTPMail = async (otp, email) => {
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
    subject: "Password Reset OTP — Utsav.in",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffbeb; border-radius: 16px;">
        <h2 style="color: #92400e; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #44403c; line-height: 1.6; margin-bottom: 24px;">
          You have requested to reset your password. Use the OTP below to proceed.
        </p>
        
        <div style="background: white; border: 2px dashed #fcd34d; border-radius: 12px;
                    padding: 24px; text-align: center; letter-spacing: 0.5em;
                    font-size: 36px; font-weight: 900; color: #92400e; margin: 20px 0;">
          ${otp}
        </div>

        <p style="color: #78716c; font-size: 13px; text-align: center;">
          This OTP is valid for <strong>10 minutes</strong> only.
        </p>

        <p style="margin-top: 24px; color: #78716c; font-size: 13px;">
          If you didn't request a password reset, please ignore this email or contact support immediately.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fcd34d; text-align: center;">
          <p style="color: #92400e; font-size: 12px;">
            Need help? Contact us at <strong>support@utsav.in</strong>
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailConfigurations);
    console.log("OTP email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("OTP Email sending failed:", error);
    throw new Error("Failed to send OTP email");
  }
};
