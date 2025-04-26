import mongoose from "mongoose";

const subCategory = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Reference to Category
  },
  { timestamps: true }
);

const SubCategory =
  mongoose.models.SubCategory || mongoose.model("SubCategory", subCategory);

export default SubCategory;
