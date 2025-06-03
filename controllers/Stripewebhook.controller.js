import Order from "../models/Order.js";
import stripe from "../libs/stripe.js";
import { sendAdminNotificationEmail } from "../libs/nodemailer.js";
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  const no = Math.random() * 100 + 1;
  // console.log("req.body raw in webhook", req.rawBody);
  console.log("stripe signature", no);

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Incoming event type:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 📦 Handle event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Order update karo
      const order = await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { isPaid: true, status: "paid" },
        { new: true }
      );
      if (!order) {
        console.warn("⚠️ Order not found for session.id:", session.id);
      } else {
        console.log("working fine");
      }
      // Email ke liye HTML content banao
      const html = `
    <h2>✅ Payment Successful</h2>
    <p><strong>Order ID:</strong> ${order?._id || "N/A"}</p>
    <p><strong>User Email:</strong> ${
      order?.userEmail || session.customer_email || "N/A"
    }</p>
    <p><strong>Amount:</strong> ${(session.amount_total / 100).toFixed(
      2
    )} ${session.currency.toUpperCase()}</p>
    <p><strong>Stripe Session ID:</strong> ${session.id}</p>
  `;
      console.log("html", html);

      // Admin ko notify karo
      await sendAdminNotificationEmail(
        "Stripe Alert: Payment Successful",
        html
      );

      break;
    }

    case "checkout.session.async_payment_failed": {
      const paymentIntent = event.data.object;

      // Step 1: Update order status (assuming you store paymentIntent.id in Order)
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id }, // make sure you save this field at checkout
        { status: "failed" },
        { new: true }
      );

      // Step 2: Prepare email for admin
      const html = `
    <h2>❌ Payment Failed</h2>
    <p><strong>Amount:</strong> ${paymentIntent.amount / 100} ${
        paymentIntent.currency
      }</p>
    <p><strong>Email:</strong> ${paymentIntent.receipt_email || "N/A"}</p>
    <p><strong>Status:</strong> ${paymentIntent.status}</p>
    <p><strong>Error:</strong> ${
      paymentIntent.last_payment_error?.message || "Unknown"
    }</p>
    <p><strong>PaymentIntent:</strong> ${paymentIntent.id}</p>
    ${
      order
        ? `<p><strong>Order ID:</strong> ${order._id}</p><p><strong>User:</strong> ${order.userEmail}</p>`
        : "<p><strong>Order:</strong> Not Found</p>"
    }
  `;

      await sendAdminNotificationEmail("Stripe Alert: Payment Failed", html);

      console.error("❌ Payment failed for PaymentIntent:", paymentIntent.id);
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object;
      const order = await Order.findOneAndUpdate(
        { stripeSessionId: dispute.payment_intent },
        {
          isDisputed: true,
          disputeInfo: {
            id: dispute.id,
            reason: dispute.reason,
            amount: dispute.amount,
            status: dispute.status,
            created: dispute.created,
            evidence_due_by: dispute.evidence_due_by,
          },
        },
        { new: true }
      );
      const html = `
    <h2>⚠️ New Dispute Created</h2>
    <p><strong>Order ID:</strong> ${order?._id}</p>
    <p><strong>User Email:</strong> ${order?.userEmail}</p>
    <p><strong>Dispute Reason:</strong> ${dispute.reason}</p>
    <p><strong>Dispute ID:</strong> ${dispute.id}</p>
    <p><strong>Status:</strong> ${dispute.status}</p>
    <p><strong>Due By:</strong> ${new Date(
      dispute.evidence_details?.due_by * 1000
    ).toLocaleString()}</p>
  `;
      console.log("html", html);

      await sendAdminNotificationEmail("Stripe Alert: Dispute Created", html);
      console.warn("⚠️ Dispute created:", dispute.id);
      break;
    }

    case "charge.dispute.closed": {
      const dispute = event.data.object;
      const order = await Order.findOneAndUpdate(
        { stripeSessionId: dispute.payment_intent },
        { isDisputed: false }
      );
      const html = `
    <h2>✅ Dispute Resolved</h2>
    <p><strong>Order ID:</strong> ${order?._id || "N/A"}</p>
    <p><strong>User Email:</strong> ${order?.userEmail || "N/A"}</p>
    <p><strong>Dispute ID:</strong> ${dispute.id}</p>
    <p><strong>Final Status:</strong> ${dispute.status}</p>
    <p><strong>Resolved At:</strong> ${new Date(
      dispute.closed * 1000
    ).toLocaleString()}</p>
  `;

      await sendAdminNotificationEmail("Stripe Alert: Dispute Closed", html);
      console.log("✅ Dispute resolved:", dispute.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
