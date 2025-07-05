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
  getProfile,
  updateProfile,
  getUserStats,
  createDefaultAdmin,
} from "../controllers/user.controller.js";
import { 
  validateSignup, 
  validateLogin, 
  validateOTP, 
  validatePasswordReset, 
  validatePasswordChange,
  validatePagination 
} from "../src/middleware/validation.js";
import { 
  authenticateToken, 
  requireAdmin, 
  strictRateLimit 
} from "../src/middleware/auth.js";

const user_router = express.Router();

// Public routes
user_router.post("/signup", validateSignup, signup);
user_router.post("/verify-otp", validateOTP, verifyOTP);
user_router.post("/login", validateLogin, strictRateLimit, login);
user_router.post("/request-reset", validatePasswordReset, requestPasswordReset);
user_router.post("/resend-otp", validatePasswordReset, resendOTP);
user_router.post("/reset-password", validatePasswordChange, resetPassword);

// Protected routes
user_router.post("/change-password", authenticateToken, validatePasswordChange, changePassword);
user_router.get("/profile", authenticateToken, getProfile);
user_router.put("/profile", authenticateToken, updateProfile);

// Admin routes
user_router.get("/users", authenticateToken, requireAdmin, validatePagination, getAllUsers);
user_router.get("/stats", authenticateToken, requireAdmin, getUserStats);

export default user_router;
