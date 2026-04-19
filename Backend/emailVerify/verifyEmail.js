// import nodemailer from "nodemailer";
// import "dotenv/config";

// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// export const verifyEmail = (token, email) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//   });

//     const SERVER_URL = process.env.SERVER_URL;   
//     if (!SERVER_URL) {
//       console.error(" SERVER_URL env variable missing in Render!");
//       return;
//     }

//   const verifyLink = `${FRONTEND_URL}/?page=verify&token=${token}`;
//   const verifyLink = `${SERVER_URL}/verify?token=${token}`;

//   const mailConfigurations = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: "Verify Your Email — Utsav.in",
//     html: `
//       <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffbeb; border-radius: 16px;">
//         <h2 style="color: #92400e; margin-bottom: 16px;">Welcome to Utsav.in 🎉</h2>
//         <p style="color: #44403c; line-height: 1.6;">
//           Please click the button below to verify your email address and activate your account.
//         </p>
//         <a href="${verifyLink}"
//            style="display: inline-block; margin-top: 24px; padding: 12px 28px;
//                   background: linear-gradient(135deg, #d97706, #ea580c);
//                   color: white; border-radius: 10px; text-decoration: none;
//                   font-weight: 600; font-size: 14px;">
//           Verify Email
//         </a>
//         <p style="margin-top: 24px; color: #78716c; font-size: 13px;">
//           This link expires in <strong>10 minutes</strong>. If you didn't register, ignore this email.
//         </p>
//       </div>
//     `,
//   };

//   transporter.sendMail(mailConfigurations, (error, info) => {
//     if (error) {
//       console.error("Email sending error:", error);
//       throw new Error(error);
//     }
//     console.log("Verification email sent:", info.messageId);
//   });
// };

// emailVerify/verifyEmail.js
import nodemailer from 'nodemailer';

export const verifyEmail = async (token, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifyLink = `${process.env.SERVER_URL}/verify?token=${token}`;

    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - E-Commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #22c55e;">Welcome to Our Store! 🎉</h2>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          
          <a href="${verifyLink}" 
             style="display: inline-block; background-color: #22c55e; color: white; padding: 16px 32px; 
                    text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 20px 0;">
            ✅ VERIFY MY EMAIL NOW
          </a>
          
          <p><small>Link 10 minutes tak valid rahega.</small></p>
          <p style="font-size: 12px; color: #666;">
            Agar button kaam na kare toh is link ko copy-paste karo:<br>
            <a href="${verifyLink}" style="color: #22c55e;">${verifyLink}</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
  }
};
