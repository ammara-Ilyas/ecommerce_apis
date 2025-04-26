import mongoose from "mongoose";

const bannerModel = new mongoose.Schema(
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

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerModel);

export default Banner;
