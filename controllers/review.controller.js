import Review from "../models/Reviews.js";

export const handlerCreateReview = async (req, res) => {
  const { userId, productId, comment, rating } = req.body;
  console.log("body", req.body);

  try {
    const newReview = await new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });
    await newReview.save();
    return res
      .status(200)
      .json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handlerGetAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email") // full user details
      .populate("product", "product images");

    console.log("review length", reviews.length);
    res
      .status(200)
      .json({ message: "All reviews fetched successfully", reviews: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handlerGetReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "name")
      .populate("product", "name");

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handlerUpdateReview = async (req, res) => {
  const { comment, rating } = req.body;
  console.log("body", req.body);

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { comment, rating },
      { new: true }
    );

    if (!updatedReview)
      return res.status(404).json({ message: "Review not found" });

    res
      .status(200)
      .json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handlerDeleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview)
      return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

///// by user id

export const handleGetReviewsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const reviews = await Review.find({ user: userId })
      .populate("product", "name") // shows product name
      .populate("user", "name"); // optional if you want user info too

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/// fetch by product id

export const handleGetReviewsByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId })
      .populate("user", "name") // shows user name
      .populate("product", "name"); // optional

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetReviewsByProductAndUser = async (req, res) => {
  const { productId, userId } = req.params;

  if (!productId || !userId) {
    return res
      .status(400)
      .json({ message: "Both productId and userId are required" });
  }

  try {
    const reviews = await Review.find({ product: productId, user: userId })
      .populate("user", "name email")
      .populate("product", "name images");

    res.status(200).json({
      message: "Reviews fetched successfully",
      reviews: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
