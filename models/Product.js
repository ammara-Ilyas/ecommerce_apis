import mongoose from "mongoose";

const productModel = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: String,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    weight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Weight",
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
    },
    ram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ram",
    },
    brand: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isNewArrival: {
      type: String,
      default: false,
    },
    isFeatured: {
      type: String,
      default: false,
    },
    istopSeller: {
      type: String,
      default: false,
    },
    images: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productModel);

export default Product;
