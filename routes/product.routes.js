import express from "express";
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleGetProducts,
  handleUpdateProduct,
  handleDeleteMultipleProducts,
  handleGetProductById,
} from "../controllers/products/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
const product_router = express.Router();

// 🛠️ Set upload for multiple images:
product_router.post(
  "/product",
  verifyAdmin,
  upload.array("images"),
  handleCreateProduct
);
product_router.put(
  "/product/:id",
  verifyAdmin,
  upload.array("images"),
  handleUpdateProduct
);
product_router.delete("/product/:id", verifyAdmin, handleDeleteProduct);
product_router.get("/product/:id", verifyAdmin, handleGetProductById);
product_router.get("/products", handleGetProducts);
product_router.post(
  "/products/delete-multiple",
  verifyAdmin,
  handleDeleteMultipleProducts
);

export default product_router;
