import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userEmail: String,
    userName: String,
    phone: String,
    address: String,
    cart: Array,
    stripeSessionId: String,
    amount: Number,
    isPaid: Boolean,
    isRefunded: { type: Boolean, default: false },

    // New status field
    status: {
      type: String,
      enum: ["pending", "paid", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model.Order || mongoose.model("Order", orderSchema);
export default Order;
