import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    console.log("Connecting to mongo db");
    mongoose.connect(url);
    console.log("Mongodb connected successfully");
  } catch (error) {
    console.log("Error connecting to Mongodb", error);
    console.log("Error connecting to Mongodb mesage", error.message);
  }
};
export default connectDB;
