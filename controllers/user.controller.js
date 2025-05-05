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
    console.log(name, email);

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
  const { email, password } = req.body;
  console.log("body", req.body);

  const user = await User.findOne({ email });
  if (!user || !user.isVerified)
    return res.status(400).json({ message: "User not verified" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });
  const token = jwt.sign({ id: user._id }, "jwt_secret", { expiresIn: "7d" });
  res.status(200).json({ token: token, message: "Login successfully" });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });
  const token = jwt.sign({ id: user._id }, "reset_secret", {
    expiresIn: "15m",
  });
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 900000;
  await user.save();
  await sendOTPEmail(
    user.name,
    email,
    `<a href='http://localhost:3000/reset-password?token=${token}'>Reset Password</a>`
  );
  res.status(200).json({ message: "Reset email sent", user: user });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, "reset_secret");
    const user = await User.findById(decoded.id);
    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpiry < Date.now()
    )
      return res.status(400).json({ message: "Invalid or expired token" });
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    await user.save();
    res.status(200).json({ message: "Password reset" });
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

export const changePassword = async (req, res) => {
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
