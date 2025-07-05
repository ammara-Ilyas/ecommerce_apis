import User from "../models/User.js";
import { sendOTPEmail } from "../libs/nodemailer.js";
import { 
  asyncHandler, 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  NotFoundError 
} from "../src/utils/errorHandler.js";
import { generateToken } from "../src/middleware/auth.js";
import logger from "../src/utils/logger.js";

// Get all users (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;
  
  const query = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by role
  if (role) {
    query.role = role;
  }
  
  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .select('-password -otp -otpExpiry -resetToken -resetTokenExpiry')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await User.countDocuments(query);
  
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// User signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ConflictError("User already exists with this email");
    } else {
      // User exists but not verified — update OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.otp = otp;
      existingUser.otpExpiry = Date.now() + 600000; // 10 minutes
      await existingUser.save();

      logger.info({
        message: "OTP resent for existing unverified user",
        email: existingUser.email
      });

      await sendOTPEmail(
        existingUser.name,
        existingUser.email,
        `<h3>Your OTP: ${otp}</h3>`
      );

      return res.status(200).json({
        success: true,
        message: "OTP re-sent to email",
        data: {
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone
          }
        }
      });
    }
  }

  // Create new user
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    phone,
    password,
    otp,
    otpExpiry: Date.now() + 600000,
  });

  logger.info({
    message: "New user registered",
    email: user.email,
    userId: user._id
  });

  await sendOTPEmail(user.name, user.email, `<h3>Your OTP: ${otp}</h3>`);

  res.status(201).json({
    success: true,
    message: "OTP sent to email",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    }
  });
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  const user = await User.findByEmail(email);
  
  if (!user) {
    throw new NotFoundError("User not found");
  }
  
  if (user.otp !== otp) {
    throw new ValidationError("Invalid OTP");
  }
  
  if (user.otpExpiry < Date.now()) {
    throw new ValidationError("OTP has expired");
  }
  
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  logger.info({
    message: "User email verified",
    email: user.email,
    userId: user._id
  });

  res.status(200).json({
    success: true,
    message: "Email verified successfully"
  });
});

// Resend OTP
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findByEmail(email);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isVerified) {
    throw new ValidationError("User is already verified");
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 600000; // 10 minutes
  await user.save();

  logger.info({
    message: "OTP resent",
    email: user.email,
    userId: user._id
  });

  await sendOTPEmail(user.name, email, `<h3>Your OTP: ${otp}</h3>`);
  
  res.status(200).json({
    success: true,
    message: "OTP resent to email"
  });
});

// User login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findByEmail(email);

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if user is verified
  if (!user.isVerified) {
    // Delete unverified user
    await User.findByIdAndDelete(user._id);
    logger.info({
      message: "Deleted unverified user during login attempt",
      email: email
    });
    throw new AuthenticationError("Please verify your email first");
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new AuthenticationError("Account is temporarily locked. Please try again later");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new AuthenticationError("Invalid email or password");
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Generate token
  const token = generateToken(user);

  logger.info({
    message: "User logged in successfully",
    email: user.email,
    userId: user._id
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences
      }
    }
  });
});

// Request password reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findByEmailForReset(email);
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent"
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.resetToken = otp;
  user.resetTokenExpiry = otpExpiry;
  await user.save();

  logger.info({
    message: "Password reset requested",
    email: user.email,
    userId: user._id
  });

  await sendOTPEmail(user.name, email, `Your password reset OTP is: ${otp}`);

  res.status(200).json({
    success: true,
    message: "If an account with that email exists, a reset link has been sent"
  });
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  const user = await User.findByEmailForReset(email);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.resetToken !== otp) {
    throw new ValidationError("Invalid reset token");
  }

  if (user.resetTokenExpiry < Date.now()) {
    throw new ValidationError("Reset token has expired");
  }

  // Update password
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  logger.info({
    message: "Password reset successfully",
    email: user.email,
    userId: user._id
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully"
  });
});

// Change password (authenticated user)
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    throw new ValidationError("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info({
    message: "Password changed successfully",
    userId: user._id
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId)
    .select('-password -otp -otpExpiry -resetToken -resetTokenExpiry');

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: { user }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { name, phone, avatar, preferences, addresses } = req.body;

  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Update allowed fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  if (addresses) user.addresses = addresses;

  await user.save();

  logger.info({
    message: "User profile updated",
    userId: user._id
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user }
  });
});

// Get user statistics (Admin only)
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getStats();

  res.status(200).json({
    success: true,
    message: "User statistics fetched successfully",
    data: { stats }
  });
});

// Create default admin (for development)
export const createDefaultAdmin = async () => {
  try {
    const adminEmail = "ammarailyas361@gmail.com";

    const existingAdmin = await User.findByEmail(adminEmail);
    if (existingAdmin) {
      logger.info("Default admin already exists");
      return;
    }

    const adminUser = new User({
      name: "Ammara Ilyas",
      email: adminEmail,
      password: "Admin@123",
      role: "admin",
      isVerified: true,
      phone: "+1234567890"
    });

    await adminUser.save();
    logger.info("Default admin created successfully");
  } catch (error) {
    logger.error("Error creating default admin:", error);
  }
};
