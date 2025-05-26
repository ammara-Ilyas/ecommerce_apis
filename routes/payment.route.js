import express from "express";
import {
  createCheckoutSession,
  verifyPayment,
  refundOrder,
  toggleRefund,
  markAsDelivered,
} from "../controllers/order.controllers.js";
const payment_router = express.Router();

payment_router.post("/create-checkout-session", createCheckoutSession);
payment_router.get("/verify-payment", verifyPayment);
payment_router.post("/refund", refundOrder);
payment_router.post("/toggle-refund", toggleRefund);
payment_router.post("/delivered", markAsDelivered);

export default payment_router;
