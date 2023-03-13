import express from "express";
const router = express.Router();
import {
  getAdvertisementsHandler,
  scrapePageHandler,
  deleteDataHandler,
} from "./advertisement.controller.js";

router.get("/", getAdvertisementsHandler);
router.post("/scrapePage", scrapePageHandler);
router.post("/deleteData", deleteDataHandler);

export default router;
