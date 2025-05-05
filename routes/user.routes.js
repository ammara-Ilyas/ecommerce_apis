import express from "express";
import {
  signup,
  verifyOTP,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
  resendOTP,
  getAllUsers,
} from "../controllers/user.controller.js";
const user_router = express.Router();

user_router.post("/signup", signup);
user_router.get("/users", getAllUsers);
user_router.post("/verify-otp", verifyOTP);
user_router.post("/login", login);
user_router.post("/request-reset", requestPasswordReset);
user_router.post("/resend-otp", resendOTP);
user_router.post("/reset-password", resetPassword);
user_router.post("/change-password", changePassword);

export default user_router;
