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
    paymentIntentId: String, // Add this to link paymentIntent

    refundPolicyAccepted: { type: Boolean, default: false }, // Track if user accepted refund policy

    threeDSecureStatus: { type: String, default: null }, // Store 3D Secure status, e.g. "authenticated"

    disputeDetails: { type: Object, default: null }, // Store dispute info from webhook

    shippingProof: { type: String, default: null }, // URL or details of shipping proof

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
