import express from "express";
import {
  handleCreateBanner,
  handleDeleteBanner,
  handleGetBanners,
  handleUpdateBanner,
  handleDeleteMultipleBanners,
} from "../controllers/banner.controller.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const banner_router = express.Router();

banner_router.post(
  "/banner",
  verifyAdmin,
  upload.single("image"),
  handleCreateBanner
);
banner_router.put(
  "/banner/:id",
  verifyAdmin,
  upload.single("image"),
  handleUpdateBanner
);
banner_router.delete("/banner/:id", verifyAdmin, handleDeleteBanner);
banner_router.get("/banners", handleGetBanners);
banner_router.post(
  "/banners/delete-multiple",
  verifyAdmin,
  handleDeleteMultipleBanners
);

export default banner_router;
