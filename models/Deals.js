import mongoose from "mongoose";

const DealModel = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Deal = mongoose.models.Deal || mongoose.model("Deal", DealModel);

export default Deal;
