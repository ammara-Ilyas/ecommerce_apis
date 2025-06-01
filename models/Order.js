import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: String,
    userName: String,
    phone: String,
    address: Object,
    cart: Array,
    stripeSessionId: String,
    amount: Number,
    isPaid: { type: Boolean, default: false },
    isRefunded: { type: Boolean, default: false },
    isDisputed: { type: Boolean, default: false },
    isRefunded: { type: Boolean, default: false },

    // New status field
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.model.Order || mongoose.model("Order", orderSchema);
export default Order;
