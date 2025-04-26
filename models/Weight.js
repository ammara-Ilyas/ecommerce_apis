import mongoose from "mongoose";

const productWeightModel = new mongoose.Schema(
  {
    weight: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const Weight =
  mongoose.model.Weight || mongoose.model("Weight", productWeightModel);

export default Weight;
