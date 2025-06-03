import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Send OTP to user (you already had this)
export const sendOTPEmail = async (name, email, html) => {
  // console.log("send otp email", email);

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Hey ${name},  Verify your Email`,
      text: "Verify your Email",
      html,
    });
    // console.log("Email send Successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

// ✅ New: Send Stripe event notification to Admin
export const sendAdminNotificationEmail = async (subject, htmlContent) => {
  console.log("subjext", subject);
  console.log("admin", process.env.ADMIN_EMAIL);

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.log("Email error (Admin Notification):", error);
  }
};
