import mongoose from "mongoose";

const productSizeModel = new mongoose.Schema(
  {
    size: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const Size = mongoose.model.Size || mongoose.model("Size", productSizeModel);

export default Size;
