import Order from "../models/Order.js";
import AdminSettings from "../models/AdminSetting.js";
import stripe from "../libs/stripe.js";
import dotenv from "dotenv";
dotenv.config();

export const createCheckoutSession = async (req, res) => {
  try {
    const { name, email, phone, address, cartItems, amount, userId } = req.body;
    console.log("req body", req.body);

    if (!email || cartItems.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount received" });
    }

    const amountInCents = Math.round(amount * 100);
    // Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        ...cartItems.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product.product,
            },
            unit_amount: Number(item.product.newPrice),
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });
    // console.log("session", session);

    // Save order in DB
    await Order.create({
      userId: userId,
      userEmail: email,
      userName: name,
      phone,
      address,
      cart: cartItems,
      amount,
      stripeSessionId: session.id,
      isPaid: false,
      status: "pending", // default status
    });

    // Send checkout URL to frontend
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// export const createPaymentIntent = async (req, res) => {
//   try {
//     const { amount, email, name, cartItems, userId } = req.body;

//     if (!amount || isNaN(amount)) {
//       return res.status(400).json({ error: "Invalid amount received" });
//     }

//     const amountInCents = Math.round(amount * 100);

//     // Optionally: create an order in DB and get orderId
//     const order = await Order.create({
//       userId,
//       userEmail: email,
//       userName: name,
//       cart: cartItems,
//       amount,
//       isPaid: false,
//       status: "pending",
//     });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: "usd",
//       metadata: {
//         email,
//         name,
//         userId,
//         orderId: order._id.toString(), // ✅ Only small value
//       },
//     });

//     return res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     console.error("Error creating PaymentIntent:", error.message);
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// };

export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      await Order.findOneAndUpdate(
        { stripeSessionId: session_id },
        { isPaid: true }
      );
      res.json({
        success: true,
        message: "Payment verified and order updated",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,

      error: error.message,
    });
  }
};
export const handleRefund = (req, res) => {
  return res.status(403).json({ error: "Refunds are not allowed." });
};
// export const refundOrder = async (req, res) => {
//   try {
//     const { session_id } = req.body;

//     const settings = await AdminSettings.findOne();
//     if (!settings?.refundEnabled) {
//       return res
//         .status(403)
//         .json({ message: "Refunds are currently disabled by admin." });
//     }

//     const order = await Order.findOne({ stripeSessionId: session_id });

//     if (!order || !order.isPaid || order.isRefunded) {
//       return res.status(400).json({ message: "Invalid refund request." });
//     }

//     const refund = await stripe.refunds.create({
//       payment_intent: (
//         await stripe.checkout.sessions.retrieve(session_id)
//       ).payment_intent,
//     });

//     order.isRefunded = true;
//     await order.save();

//     res.json({ message: "Refund successful", refund });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const markAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, {
      status: "delivered",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({ message: "Order marked as delivered." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleRefund = async (req, res) => {
  try {
    const { enable } = req.body;
    const settings = await AdminSettings.findOneAndUpdate(
      {},
      { refundEnabled: enable },
      { upsert: true, new: true }
    );
    res.json({
      message: `Refunds are now ${enable ? "enabled" : "disabled"}`,
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin or for dashboard)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ message: "Orders fetched successfully", orders: orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders for a specific user by userId
export const getOrderByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({ message: "Order deleted successfully.", order: deletedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: "usd",
//       payment_method_types: ["card"],
//       confirmation_method: "automatic",
//       confirm: true,
//       metadata: {
//         email,
//         name,
//         userId,
//         items: JSON.stringify(cartItems),
//       },
//       payment_method_options: {
//         card: {
//           request_three_d_secure: "any",
//         },
//       },
//     });
