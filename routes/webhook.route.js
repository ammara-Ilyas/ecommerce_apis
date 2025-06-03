import express from "express";
import { stripeWebhook } from "../controllers/Stripewebhook.controller.js";
import { stripeRawBody } from "../middleware/webhook.middleware.js";
const webhook_router = express.Router();

webhook_router.post("/stripe/webhook", stripeRawBody, stripeWebhook);

export default webhook_router;
