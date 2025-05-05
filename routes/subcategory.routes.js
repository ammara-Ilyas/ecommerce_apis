import express from "express";
import {
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getCategoryWithSubCategories,
} from "../controllers/subCategory.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const sub_cate_router = express.Router();

sub_cate_router.post("/subcategory/", upload.none(), addSubCategory);
sub_cate_router.put(
  "/subcategory/:category_id/sub-category",
  upload.none(),
  updateSubCategory
);
sub_cate_router.delete(
  "/subcategory/:subCategory_id/category/:category_name",
  deleteSubCategory
);
sub_cate_router.get("/subcategory/:category_id", getCategoryWithSubCategories);

export default sub_cate_router;
