import express from "express";
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleGetProducts,
  handleGetSingleProduct,
  handleUpdateProduct,
} from "../controllers/products/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const product_router = express.Router();

// 🛠️ Set upload for multiple images:
product_router.post("/product", upload.array("images"), handleCreateProduct);
product_router.put("/product/:id", upload.array("images"), handleUpdateProduct);
product_router.delete("/product/:id", handleDeleteProduct);
product_router.get("/product/:id", handleGetSingleProduct);
product_router.get("/product", handleGetProducts);

export default product_router;
