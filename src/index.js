import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import logger from "./utils/logger.js";
import { 
  globalErrorHandler, 
  notFoundHandler 
} from "./utils/errorHandler.js";
import {
  helmetConfig,
  compressionConfig,
  corsConfig,
  requestLogger,
  securityHeaders,
  requestSizeLimit,
  ipBlocklist,
  generalRateLimit,
  apiRateLimit
} from "./middleware/security.js";

// Import routes
import cate_router from "../routes/category.routes.js";
import sub_cate_router from "../routes/subcategory.routes.js";
import banner_router from "../routes/banner.routes.js";
import weight_router from "../routes/weight.routes.js";
import ram_router from "../routes/ram.routes.js";
import size_router from "../routes/size.routes.js";
import product_router from "../routes/product.routes.js";
import user_router from "../routes/user.routes.js";
import review_router from "../routes/review.routes.js";
import deal_router from "../routes/deals.routes.js";
import cart_router from "../routes/cart.routes.js";
import wish_router from "../routes/wishlist.routes.js";
import payment_router from "../routes/order.route.js";
import contact_router from "../routes/contact.route.js";
import webhook_router from "../routes/webhook.route.js";

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(compressionConfig);
app.use(cors(corsConfig));
app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(ipBlocklist);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/auth', generalRateLimit);
app.use('/api', apiRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/public', express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use("/api/auth", user_router);
app.use("/api/categories", cate_router);
app.use("/api/subcategories", sub_cate_router);
app.use("/api/banners", banner_router);
app.use("/api/weights", weight_router);
app.use("/api/rams", ram_router);
app.use("/api/sizes", size_router);
app.use("/api/products", product_router);
app.use("/api/reviews", review_router);
app.use("/api/deals", deal_router);
app.use("/api/cart", cart_router);
app.use("/api/wishlist", wish_router);
app.use("/api/orders", payment_router);
app.use("/api/contact", contact_router);
app.use("/api/webhooks", webhook_router);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Ecommerce API",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health"
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Database connection
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to database
connectDB(MONGODB_URI);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;
