import express from "express";
import {
  getScheduled,
  getScheduledById,
  createScheduled,
  updateScheduled,
  deleteScheduled,
} from "../controllers/Scheduled.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/scheduled", verifyUser, getScheduled);
router.get("/scheduled/:id", verifyUser, getScheduledById);
router.post("/scheduled", verifyUser, createScheduled);
router.patch("/scheduled/:id", verifyUser, updateScheduled);
router.delete("/scheduled/:id", verifyUser, deleteScheduled);

export default router;
