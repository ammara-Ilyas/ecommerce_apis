import User from "../models/User.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../libs/nodemailer.js";

export const getAllUsers = async (req, res) => {
  console.log("get all users");

  try {
    const users = await User.find({});
    return res.status(200).json({
      message: "users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.log("Error getting users", error);
    return res.json({ message: "Internal Server Error" });
  }
};
export const signup = async (req, res) => {
  console.log("body", req.body);

  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });
  const hashed = await bcrypt.hash(password, 12);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const user = await User.create({
      name,
      email,
      password: hashed,
      otp,
      otpExpiry: Date.now() + 600000,
    });
    console.log("otp", otp);
    // console.log(name, email);

    await sendOTPEmail(user.name, user.email, `<h3>OTP: ${otp}</h3>`);
    res.status(200).json({ message: "OTP sent to email", user: user });
  } catch (error) {
    console.log("error", error);

    res.json({ message: "internal sever error", error: error });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });
  user.isVerified = true;
  user.otp = null;
  await user.save();
  res.status(200).json({ message: "Verified" });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Regenerate OTP and update expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 600000; // Reset OTP expiry to 10 minutes

  await user.save();

  // Send the new OTP
  await sendOTPEmail(user.name, email, otp);
  res.status(200).json({ message: "OTP resent to email" });
};

export const login = async (req, res) => {
  console.log("body", req.body);
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (user && !user.isVerified) {
    console.log(`Deleting unverified user with email: ${email}`);

    await User.findOneAndDelete({ email });
    user = null;
  }

  if (!user) {
    return res.status(400).json({ message: "User not exist" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  // ✅ User verified and password matches
  const token = jwt.sign({ id: user._id }, "jwt_secret", { expiresIn: "7d" });

  res.status(200).json({
    token,
    message: "Login successfully",
    user: {
      name: user.name,
      email: user.email,
      id: user._id,
    },
  });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

  user.resetOTP = otp;
  user.resetOTPExpiry = otpExpiry;
  await user.save();

  await sendOTPEmail(user.name, email, `Your OTP is: ${otp}`);

  res.status(200).json({ message: "OTP sent to email" });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isOTPVerified) {
    return res.status(400).json({ message: "OTP not verified" });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.isOTPVerified = false;
  await user.save();

  res.status(200).json({ message: "Password successfully reset" });
};

export const changePassword = async (req, res) => {
  console.log("body", req.body);
  const { currentPassword, newPassword } = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  const { id } = jwt.verify(token, "jwt_secret");
  const user = await User.findById(id);
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match)
    return res.status(400).json({ message: "Wrong current password" });
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.status(200).json({ message: "Password changed" });
};
