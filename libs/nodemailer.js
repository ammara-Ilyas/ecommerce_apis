import dotnenv from "dotenv";
import nodemailer from "nodemailer";
dotnenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  //   secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (name, email, html) => {
  // console.log("send otp email", email);

  try {
    const response = await transporter.sendMail({
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
