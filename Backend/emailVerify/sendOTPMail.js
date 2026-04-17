import nodemailer from "nodemailer";
import "dotenv/config";

export const sendOTPMail = async (otp, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from:    process.env.MAIL_USER,   
    to:      email,                   
    subject: "Password Reset OTP — Utsav.in",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffbeb; border-radius: 16px;">
        <h2 style="color: #92400e; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #44403c; line-height: 1.6; margin-bottom: 24px;">
          Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background: white; border: 2px dashed #fcd34d; border-radius: 12px;
                    padding: 20px; text-align: center; letter-spacing: 0.5em;
                    font-size: 32px; font-weight: 900; color: #92400e;">
          ${otp}
        </div>
        <p style="margin-top: 20px; color: #78716c; font-size: 13px;">
          If you didn't request this, please ignore the email or contact support.
        </p>
      </div>
    `,
  };

  transporter.sendMail(mailConfigurations, (error, info) => {
    if (error) throw new Error(error);
    console.log("OTP email sent:", info.messageId);
  });
};
