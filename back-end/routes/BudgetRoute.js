import express from 'express';
import {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    filterBudgetByCategory,
    filterBudgetByDate,
    filterBudgetByPeriod
} from '../controllers/Budgets.js';
import { verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/budgets', verifyUser, getBudgets);
router.get('/budgets/:id', verifyUser, getBudgetById);
router.post('/budgets', verifyUser, createBudget);
router.patch('/budgets/:id', verifyUser, updateBudget);
router.delete('/budgets/:id', verifyUser, deleteBudget);
router.get('/budget/:category_id', verifyUser, filterBudgetByCategory);
router.post('/budgets/filter-date', verifyUser, filterBudgetByDate);
router.get('/budgets/period/:period', verifyUser, filterBudgetByPeriod)

export default router;