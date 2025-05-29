import Cart from "../models/Cart.js";

// Add product to cart
export const handleAddToCart = async (req, res) => {
  console.log("body", req.body, req.params.userId);
  // console.log("🧪 Headers:", req.headers["content-type"]);

  const { productId, quantity } = req.body;
  const { userId } = req.params;
  try {
    // Check if the product already exists in the user's cart
    const existingCartItem = await Cart.findOne({
      user: userId,
      product: productId,
    });

    if (existingCartItem) {
      return res.status(200).json({
        message: "Cart item already added.",
        cartItem: existingCartItem,
      });
    } else {
      // If not, create a new cart item
      const newCartItem = new Cart({
        user: userId,
        product: productId,
        quantity: quantity,
      });

      await newCartItem.save();

      return res.status(201).json({
        message: "Cart item created successfully",
        cartItem: newCartItem,
      });
    }
  } catch (error) {
    console.error("Error while handling cart", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleGetCartItems = async (req, res) => {
  const { userId } = req.params;
  console.log("handleGetCartItems user id", userId);

  try {
    const cartItems = await Cart.find({ user: userId }).populate("product");

    return res.status(200).json({
      message: "Cart items fetched successfully",
      cartItems,
    });
  } catch (error) {
    console.error("Error while fetching cart items", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleUpdateCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  try {
    const updatedItem = await Cart.findByIdAndUpdate(
      cartItemId,
      { quantity },
      { new: true }
    ).populate("product");

    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({
      message: "Cart item updated successfully",
      cartItem: updatedItem,
    });
  } catch (error) {
    console.error("Error while updating cart item", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleDeleteCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  console.log("cart in delete", cartItemId);
  try {
    const deletedItem = await Cart.findByIdAndDelete(cartItemId);
    console.log("cart in deletedItem", deletedItem);

    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({
      message: "Cart item deleted successfully",
      deletedItem,
    });
  } catch (error) {
    console.error("Error while deleting cart item", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleDeleteMultipleCartItems = async (req, res) => {
  const { ids } = req.body; // Array of cartItem IDs

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid or missing 'ids' array" });
  }

  try {
    const result = await Cart.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: "Cart items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error while deleting multiple cart items", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

////increase quantity
export const handleIncreaseQuantity = async (req, res) => {
  const { cartItemId } = req.params;

  try {
    const updatedItem = await Cart.findByIdAndUpdate(
      cartItemId,
      { $inc: { quantity: 1 } },
      { new: true }
    ).populate("product");

    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({
      message: "Quantity increased successfully",
      cartItem: updatedItem,
    });
  } catch (error) {
    console.error("Error while increasing quantity", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

////decrease quantity
export const handleDecreaseQuantity = async (req, res) => {
  const { cartItemId } = req.params;

  try {
    const cartItem = await Cart.findById(cartItemId).populate("product");

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.quantity <= 1) {
      return res.status(400).json({ message: "Minimum quantity is 1" });
    }

    cartItem.quantity -= 1;
    await cartItem.save();

    return res.status(200).json({
      message: "Quantity decreased successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error while decreasing quantity", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/cart/:userId
export const deleteCartItemsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await Cart.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No cart items found for this user." });
    }

    res
      .status(200)
      .json({ message: `Deleted ${result.deletedCount} cart item(s).` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cart items", error: error.message });
  }
};
