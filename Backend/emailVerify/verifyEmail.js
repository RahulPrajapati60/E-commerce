import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyEmail = async (token, email) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "https://e-commerce-xi-seven-84.vercel.app";
  
  const verificationLink = `${FRONTEND_URL}/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: "Utsav.in <onboarding@resend.dev>",   // testing ke liye yeh use karo, baad mein apna domain add kar lena
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
            Verify Email Now
          </a>
          <p style="margin-top: 24px; color: #78716c; font-size: 13px;">
            This link expires in <strong>10 minutes</strong>. If you didn't register, ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
    console.log(`🔗 Link: ${verificationLink}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
};
