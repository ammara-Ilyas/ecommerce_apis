import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../libs/nodemailer.js";
import { sendVerificationEamil } from "../libs/Emails.js";
dotenv.config();
export const handleRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    let newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    sendVerificationEamil(email, code, name);
    return res
      .status(201)
      .json({ message: "User successfully created", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const userExist = await User.findOne({ email });

  try {
    if (!userExist) {
      return res.status(400).json({ message: "User does not existS" });
    }

    const isMatch = await bcrypt.compare(password, userExist.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credetials" });
    }
    console.log("token secret key", process.env.SECRET_KEY);

    const token = jwt.sign({ userId: userExist._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    // res.status(200).json({ token });
    return res
      .status(200)
      .json({ message: "User login successful", token: token });
  } catch (error) {
    console.error("Error logging in user", error);
  }
};
