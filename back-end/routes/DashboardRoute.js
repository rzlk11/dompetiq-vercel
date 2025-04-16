import express from "express";
import {
  getIncomeTotal,
  getExpenseTotal,
  getBalance,
  getRecentActivities,
  getMonthlySummary,
  getTransactionHistory,
  getMonthlyComparison,
  getBudgets,
} from "../controllers/Dashboard.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/dashboard/income-total", verifyUser, getIncomeTotal);
router.get("/dashboard/expense-total", verifyUser, getExpenseTotal);
router.get("/dashboard/balance", verifyUser, getBalance);
router.get("/dashboard/recent-activity", verifyUser, getRecentActivities);
router.get("/dashboard/monthly-summary", verifyUser, getMonthlySummary);
router.get("/dashboard/transaction-history", verifyUser, getTransactionHistory);
router.get("/dashboard/monthly-comparison", verifyUser, getMonthlyComparison);
router.get("/dashboard/budgets", verifyUser, getBudgets);

export default router;
