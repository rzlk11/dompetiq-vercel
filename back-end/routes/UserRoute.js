import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/Users.js";
import { verifyUser, authorized } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/users", verifyUser, authorized, getUsers);
router.get("/users/:id", verifyUser, authorized, getUserById);
router.post("/users", createUser);
router.patch("/users/:id", verifyUser, authorized, updateUser);
router.delete("/users/:id", verifyUser, authorized, deleteUser);

export default router;
