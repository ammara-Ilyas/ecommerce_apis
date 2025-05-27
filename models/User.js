import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: {
      type: Number,
    },
    password: String,
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
