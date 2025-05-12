import express from "express";
import {
  handleAddToCart,
  handleGetCartItems,
  handleUpdateCartItem,
  handleDeleteCartItem,
  handleDeleteMultipleCartItems,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
} from "../controllers/cart.controllers.js";
const cart_router = express.Router();

// Add to cart
cart_router.post("/cart", handleAddToCart);

// Get all cart items for a specific user
cart_router.get("/cart/:userId", handleGetCartItems);

// Update cart item quantity
cart_router.put("/cart/:id", handleUpdateCartItem);

// Delete a specific cart item
cart_router.delete("/cart/:id", handleDeleteCartItem);

// Delete multiple cart items
cart_router.post("/cart/delete-multiple", handleDeleteMultipleCartItems);
cart_router.patch("/cart/increase/:cartItemId", handleIncreaseQuantity);
cart_router.patch("/cart/decrease/:cartItemId", handleDecreaseQuantity);

export default cart_router;
