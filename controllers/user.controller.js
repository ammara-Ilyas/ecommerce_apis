import User from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../libs/nodemailer.js";
dotenv.config();
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

  const { name, email, phone, password } = req.body;

  let userExists = await User.findOne({ email });

  if (userExists) {
    if (userExists.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      // User exists but not verified — update OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.otp = otp;
      userExists.otpExpiry = Date.now() + 600000; // 10 minutes from now
      await userExists.save();

      console.log("otp (resend)", otp);
      await sendOTPEmail(
        userExists.name,
        userExists.email,
        `<h3>OTP: ${otp}</h3>`
      );

      return res
        .status(200)
        .json({ message: "OTP re-sent to email", user: userExists });
    }
  }

  // If user does not exist, create new
  const hashed = await bcrypt.hash(password, 12);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      otp,
      otpExpiry: Date.now() + 600000,
    });

    console.log("otp (new)", otp);
    await sendOTPEmail(user.name, user.email, `<h3>OTP: ${otp}</h3>`);

    res.status(200).json({ message: "OTP sent to email", user: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
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
  console.log("process.env.jwt_SECRET_KEY", process.env.jwt_SECRET_KEY);

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
  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ✅ THIS is the correct payload
    },
    process.env.jwt_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );

  res.status(200).json({
    token,
    message: "Login successfully",
    user: {
      name: user.name,
      email: user.email,
      id: user._id,
      role: user.role,
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
  const { id } = jwt.verify(token, process.env.jwt_SECRET_KEY);
  const user = await User.findById(id);
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match)
    return res.status(400).json({ message: "Wrong current password" });
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.status(200).json({ message: "Password changed" });
};

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = "ammarailyas361@gmail.com";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = new User({
      name: "Ammara Ilyas",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    await adminUser.save();
    console.log("Default admin created");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};
