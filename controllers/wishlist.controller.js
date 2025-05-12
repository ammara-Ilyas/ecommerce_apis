import Wishlist from "../models/Wish.js";
// Add to Wishlist
export const handleAddToWishlist = async (req, res) => {
  console.log("body in wish", req.body);

  const { userId, productId } = req.body;

  try {
    const existingItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (existingItem) {
      return res
        .status(200)
        .json({ message: "Item already in wishlist", item: existingItem });
    }

    const newItem = new Wishlist({ user: userId, product: productId });
    await newItem.save();

    return res
      .status(201)
      .json({ message: "Item added to wishlist", item: newItem });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all wishlist items for a user
export const handleGetWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.find({ user: userId }).populate("product");
    res
      .status(200)
      .json({ message: "Wishlist fetched successfully", wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove one item from wishlist
export const handleRemoveFromWishlist = async (req, res) => {
  const { itemId } = req.params;

  try {
    const deleted = await Wishlist.findByIdAndDelete(itemId);
    if (!deleted) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.status(200).json({ message: "Item removed from wishlist", deleted });
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete multiple wishlist items
export const handleDeleteMultipleWishlistItems = async (req, res) => {
  const { ids } = req.body;

  try {
    const result = await Wishlist.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: "Multiple wishlist items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting wishlist items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
