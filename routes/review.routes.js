import express from "express";
import {
  handlerCreateReview,
  handlerGetAllReviews,
  handlerGetReviewById,
  handlerUpdateReview,
  handlerDeleteReview,
  handleGetReviewsByUserId,
  handleGetReviewsByProductId,
  handleGetReviewsByProductAndUser,
} from "../controllers/review.controller.js";
const review_router = express.Router();

// Create a review
review_router.post("/review/:productId", handlerCreateReview);

// Get all reviews
review_router.get("/reviews/", handlerGetAllReviews);

// Get a review by ID
review_router.get("/review/:id", handlerGetReviewById);

// Update a review by ID
review_router.put("/review/:id", handlerUpdateReview);

// Delete a review by ID
review_router.delete("/review/:id", handlerDeleteReview);

// Get reviews by user ID
review_router.get("/review/user/:userId", handleGetReviewsByUserId);

// Get reviews by product ID
review_router.get("/review/product/:productId", handleGetReviewsByProductId);
review_router.get(
  "/reviews/:productId/user/:userId",
  handleGetReviewsByProductAndUser
);

export default review_router;
