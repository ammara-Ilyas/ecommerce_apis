import express from "express";
import {
  handleCreateCategory,
  handleDeleteCategory,
  handleGetCategories,
  handleUpdateCategory,
  handleDeleteMultipleCategorys,
} from "../controllers/category.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const cate_router = express.Router();

cate_router.post("/category", upload.single("image"), handleCreateCategory);
cate_router.put("/category/:id", upload.single("image"), handleUpdateCategory);
cate_router.delete("/category/:id", handleDeleteCategory);
cate_router.get("/category", handleGetCategories);
cate_router.post("/category/delete-multiple", handleDeleteMultipleCategorys);

export default cate_router;
