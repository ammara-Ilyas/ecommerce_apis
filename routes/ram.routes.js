import express from "express";
import {
  handleCreatRam,
  handleGetRams,
  handleUpdateRam,
  handledeleteRam,
} from "../controllers/products/ram.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const ram_router = express.Router();

ram_router.post("/ram", upload.none(), handleCreatRam);
ram_router.put("/ram/:id", upload.none(), handleUpdateRam);
ram_router.delete("/ram/:id", handledeleteRam);
ram_router.get("/ram", handleGetRams);

export default ram_router;
