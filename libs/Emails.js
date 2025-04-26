import transporter from "./nodemailer.js";

import {
  Verification_Email_Template,
  Welcome_Email_Template,
} from "./EmailTemplate.js";

export const sendVerificationEamil = async (email, verificationCode, name) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,

      to: email,
      subject: `Hey ${name},  Verify your Email`,
      text: "Verify your Email",
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ).replace("Hello ", `Hello ${name}`),
    });
    console.log("Email send Successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};
export const senWelcomeEmail = async (email, name) => {
  try {
    const response = await transporter.sendMail({
      from: '"Zahid" <zahidtime313@gmail.com>',

      to: email, // list of receivers
      subject: "Welcome Email", // Subject line
      text: "Welcome Email", // plain text body
      html: Welcome_Email_Template.replace("{name}", name),
    });
    console.log("Email send Successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};
