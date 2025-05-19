// controllers/exportController.js
import { Op } from "sequelize";
import Transactions from "../models/TransactionModel.js";
import Rekening from "../models/RekeningModel.js";
import Budgets from "../models/BudgetModel.js";
import Categories from "../models/CategoryModel.js";

const getStartAndEndDates = (periodStr) => {
  const [monthStr, yearStr] = periodStr.split(" ");
  const monthMap = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11,
  };
  const month = monthMap[monthStr];
  const year = parseInt(yearStr);

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
};

export const exportReport = async (req, res) => {
  try {
    const { type, period, account, includes } = req.body;
    const { start, end } = getStartAndEndDates(period);
    const userId = req.userId;
    const response = {};

    // Reusable where clause
    const rekeningFilter =
      account !== "Semua Rekening" ? { name: account } : {};

    // Income
    if (includes.income) {
      const incomeTx = await Transactions.findAll({
        where: {
          userId,
          createdAt: { [Op.between]: [start, end] },
        },
        include: [
          {
            model: Categories,
            where: { type: "income" },
            attributes: ["name"],
          },
          {
            model: Rekening,
            where: rekeningFilter,
            attributes: ["name"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      response.income = incomeTx.map((tx) => ({
        date: new Date(tx.createdAt).toLocaleDateString("id-ID"),
        category: tx.category.name,
        amount: Number(tx.amount),
        notes: tx.notes || "",
      }));
    }

    // Expense
    if (includes.expense) {
      const expenseTx = await Transactions.findAll({
        where: {
          userId,
          createdAt: { [Op.between]: [start, end] },
        },
        include: [
          {
            model: Categories,
            where: { type: "expense" },
            attributes: ["name"],
          },
          {
            model: Rekening,
            where: rekeningFilter,
            attributes: ["name"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      response.expense = expenseTx.map((tx) => ({
        date: new Date(tx.createdAt).toLocaleDateString("id-ID"),
        category: tx.category.name,
        amount: Number(tx.amount),
        notes: tx.notes || "",
      }));
    }

    // Accounts
    if (includes.accounts) {
      const accounts = await Rekening.findAll({
        where: {
          userId,
          ...rekeningFilter,
        },
        attributes: ["id", "name", "balance"],
      });

      // Get all income and expense transactions grouped by account
      const txs = await Transactions.findAll({
        where: {
          userId,
          createdAt: { [Op.between]: [start, end] },
        },
        include: [
          {
            model: Categories,
            attributes: ["type"],
          },
          {
            model: Rekening,
            attributes: ["id", "name"],
          },
        ],
      });

      // Prepare a map to store calculated adjustments
      const balanceMap = {};

      txs.forEach((tx) => {
        const accId = tx.rekening.id;
        const type = tx.category.type;
        const amount = Number(tx.amount);

        if (!balanceMap[accId]) {
          balanceMap[accId] = 0;
        }

        if (type === "income") {
          balanceMap[accId] += amount;
        } else if (type === "expense") {
          balanceMap[accId] -= amount;
        }
      });

      // Merge base balance + transaction adjustments
      response.accounts = accounts.map((acc) => {
        const adjustedBalance = acc.balance + (balanceMap[acc.id] || 0);
        return {
          name: acc.name,
          type: acc.type || "", // If you want to add type
          balance: adjustedBalance,
        };
      });
    }

    // Budget
    if (includes.budget) {
      const budgetData = await Budgets.findAll({
        where: {
          userId,
          start_date: { [Op.lte]: end },
          end_date: { [Op.gte]: start },
        },
        include: [
          {
            model: Categories,
            attributes: ["name"],
          },
        ],
      });

      response.budget = budgetData.map((b) => ({
        category: b.category.name,
        budgeted: Number(b.amount),
        spent: 0, // You could calculate this using filtered expenses
        remaining: Number(b.amount), // Subtract actuals if needed
      }));
    }
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};
