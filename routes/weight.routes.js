import express from "express";
import {
  handleGetWeights,
  handleCreateWeight,
  handleUpdateWeight,
  handledeleteWeight,
  handleDeleteMultipleWeights,
} from "../controllers/products/weight.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const weight_router = express.Router();

weight_router.post("/weight", upload.none(), handleCreateWeight);
weight_router.put("/weight/:id", upload.none(), handleUpdateWeight);
weight_router.delete("/weight/:id", handledeleteWeight);
weight_router.get("/weight", handleGetWeights);
weight_router.post("/weight/delete-multiple", handleDeleteMultipleWeights);

export default weight_router;
