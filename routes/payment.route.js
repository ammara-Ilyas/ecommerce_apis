import express from "express";
import {
  createCheckoutSession,
  verifyPayment,
  // refundOrder,
  toggleRefund,
  markAsDelivered,
  getAllOrders,
  getOrderByUser,
  deleteOrder,
  // createPaymentIntent,
  handleRefund,
} from "../controllers/order.controllers.js";
const payment_router = express.Router();

payment_router.post("/create-checkout-session", createCheckoutSession);
payment_router.get("/verify-payment", verifyPayment);
payment_router.post("/refund", handleRefund);
payment_router.post("/toggle-refund", toggleRefund);
payment_router.post("/delivered", markAsDelivered);
payment_router.get("/orders", getAllOrders);
payment_router.get(`/order/:userId`, getOrderByUser);
payment_router.delete(`/orders/:orderId`, deleteOrder);

export default payment_router;
