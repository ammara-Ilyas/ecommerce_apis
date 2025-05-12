import express from "express";
import {
  handleGetDeals,
  handleCreateDeal,
  handleDeleteDeal,
  handleDeleteMultipleDeals,
  handleUpdateDeal,
} from "../controllers/products/deal.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const deal_router = express.Router();

deal_router.post("/deal", upload.single("image"), handleCreateDeal);
deal_router.put("/deal/:id", upload.single("image"), handleUpdateDeal);
deal_router.delete("/deal/:id", handleDeleteDeal);
deal_router.get("/deals", handleGetDeals);
deal_router.post("/deals/delete-multiple", handleDeleteMultipleDeals);

export default deal_router;
