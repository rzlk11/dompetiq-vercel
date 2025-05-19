import express from "express";
import { exportReport } from "../controllers/exportController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/pdf", verifyUser, exportReport); // Endpoint untuk menangani permintaan POST

export default router;