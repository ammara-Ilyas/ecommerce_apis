import express from "express";
import {
  handleDeleteSize,
  handleCreateSize,
  handleGetSizes,
  handleUpdateSize,
  handleDeleteMultipleSizes,
} from "../controllers/products/size.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const size_router = express.Router();

size_router.post("/size", upload.none(), handleCreateSize);
size_router.put("/size/:id", upload.none(), handleUpdateSize);
size_router.delete("/size/:id", handleDeleteSize);
size_router.get("/size", handleGetSizes);
size_router.post("/size/delete-multiple", handleDeleteMultipleSizes);

export default size_router;
