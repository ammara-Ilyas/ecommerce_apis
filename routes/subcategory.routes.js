import express from "express";
import {
  handleCreateSubCategory,
  handleGetSubCategory,
  handleUpdateSubCategory,
  handledeleteSubCategory,
} from "../controllers/subCategory.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const sub_cate_router = express.Router();

sub_cate_router.post("/subcategory", upload.none(), handleCreateSubCategory);
sub_cate_router.put("/subcategory/:id", upload.none(), handleUpdateSubCategory);
sub_cate_router.delete("/subcategory/:id", handledeleteSubCategory);
sub_cate_router.get("/subcategory", handleGetSubCategory);

export default sub_cate_router;
