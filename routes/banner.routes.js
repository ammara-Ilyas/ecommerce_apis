import express from "express";
import {
  handleCreateBanner,
  handleDeleteBanner,
  handleGetBanners,
  handleUpdateBanner,
} from "../controllers/banner.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const banner_router = express.Router();

banner_router.post("/banner", upload.single("image"), handleCreateBanner);
banner_router.put("/banner/:id", upload.single("image"), handleUpdateBanner);
banner_router.delete("/banner/:id", handleDeleteBanner);
banner_router.get("/banner", handleGetBanners);

export default banner_router;
