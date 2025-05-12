import express from "express";
import {
  handleAddToWishlist,
  handleGetWishlist,
  handleRemoveFromWishlist,
  handleDeleteMultipleWishlistItems,
} from "../controllers/wishlist.controller.js";
const wish_router = express.Router();

// Add to wishlist
wish_router.post("/wish", handleAddToWishlist);

// Get wishlist items for a user
wish_router.get("/wish/:userId", handleGetWishlist);

// Remove a single item from wishlist
wish_router.delete("/wish/:itemId", handleRemoveFromWishlist);

// Delete multiple items from wishlist
wish_router.post("/wish/delete-multiple", handleDeleteMultipleWishlistItems);

export default wish_router;
