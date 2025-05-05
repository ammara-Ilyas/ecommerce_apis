import mongoose from "mongoose";
import { type } from "os";

const categoryModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    subCategory: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", categoryModel);

export default Category;
