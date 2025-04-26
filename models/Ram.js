import mongoose from "mongoose";

const productRamModel = new mongoose.Schema(
  {
    ram: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const Ram = mongoose.model.Ram || mongoose.model("Ram", productRamModel);

export default Ram;
