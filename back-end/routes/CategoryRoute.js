import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/Categories.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/category", verifyUser, getCategories);
router.get("/category/:id", verifyUser, getCategoryById);
router.post("/category", verifyUser, createCategory);
router.patch("/category/:id", verifyUser, updateCategory);
router.delete("/category/:id", verifyUser, deleteCategory);

export default router;
