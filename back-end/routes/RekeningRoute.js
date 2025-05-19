import express from "express";
import {
  getRekening,
  getRekeningById,
  createRekening,
  updateRekening,
  deleteRekening,
} from "../controllers/RekeningController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/rekening", verifyUser, getRekening); // Get all rekenings
router.get("/rekening/:id", verifyUser, getRekeningById); // Get a single rekening by ID
router.post("/rekening", verifyUser, createRekening); // Create a new rekening
router.put("/rekening/:id", verifyUser, updateRekening); // Update an existing rekening
router.delete("/rekening/:id", verifyUser, deleteRekening); // Delete a rekening

export default router;