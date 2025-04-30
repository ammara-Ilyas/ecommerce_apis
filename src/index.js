import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import cate_router from "../routes/category.routes.js";
import sub_cate_router from "../routes/subcategory.routes.js";
import banner_router from "../routes/banner.routes.js";
import weight_router from "../routes/weight.routes.js";
import ram_router from "../routes/ram.routes.js";
import size_router from "../routes/size.routes.js";
import product_router from "../routes/product.routes.js";
import user_router from "../routes/user.routes.js";
import connectCloudinary from "../config/cloudinary.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
dotenv.config();

const PORT = process.env.PORT || 8000;
const url = process.env.MONGODB_URI;

connectDB(url);

connectCloudinary();

app.use("/api/auth", user_router);
app.use("/api/", cate_router);
app.use("/api/", sub_cate_router);
app.use("/api/", banner_router);
app.use("/api/", weight_router);
app.use("/api/", ram_router);
app.use("/api/", size_router);
app.use("/api/", product_router);

app.get("/", (req, res) => {
  console.log("hello world backend");

  res.json({ message: "Welcome to backend" });
});

app.listen(PORT, () => {
  console.log("Server is runnig on port", PORT);
});
