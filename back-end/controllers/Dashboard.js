import Transactions from "../models/TransactionModel.js";
import Categories from "../models/CategoryModel.js";
import Budgets from "../models/BudgetModel.js";
import { Op, Sequelize } from "sequelize";

export const getIncomeTotal = async (req, res) => {
  try {
    const incomeTotal = await Transactions.sum("amount", {
      where: { userId: req.userId },
      include: [
        { model: Categories, where: { type: "income" }, attributes: [] },
      ],
    });
    res.json({ incomeTotal: incomeTotal || 0 });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getExpenseTotal = async (req, res) => {
  try {
    const expenseTotal = await Transactions.sum("amount", {
      where: { userId: req.userId },
      include: [
        { model: Categories, where: { type: "expense" }, attributes: [] },
      ],
    });
    res.json({ expenseTotal: expenseTotal || 0 });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBalance = async (req, res) => {
  try {
    const [income, expense] = await Promise.all([
      Transactions.sum("amount", {
        where: { userId: req.userId },
        include: [
          { model: Categories, where: { type: "income" }, attributes: [] },
        ],
      }),
      Transactions.sum("amount", {
        where: { userId: req.userId },
        include: [
          { model: Categories, where: { type: "expense" }, attributes: [] },
        ],
      }),
    ]);
    const balance = (income || 0) - (expense || 0);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Transactions.findAll({
      where: { userId: req.userId },
      include: [{ model: Categories }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlySummary = async (req, res) => {
  try {
    // Ambil jumlah transaksi per bulan untuk user yang sedang login
    const summary = await Transactions.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: {
        userId: req.userId,
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
      raw: true,
    });

    // Daftar nama bulan
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Inisialisasi semua bulan dengan 0
    const formatted = {};
    monthNames.forEach((name) => {
      formatted[name] = 0;
    });

    // Isi bulan-bulan yang ada datanya dari query
    summary.forEach((item) => {
      const monthIndex = item.month - 1;
      formatted[monthNames[monthIndex]] = parseInt(item.count);
    });

    res.json(formatted);
  } catch (error) {
    console.error("Monthly Summary Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transactions.findAll({
      where: { userId: req.userId },
      include: [{ model: Categories }],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlyComparison = async (req, res) => {
  console.log(req.userId);
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    console.log(
      "Current Month Range:",
      currentMonthStart,
      "to",
      nextMonthStart
    );
    console.log("Last Month Range:", lastMonthStart, "to", currentMonthStart);

    const [currentCount, lastCount] = await Promise.all([
      Transactions.count({
        where: {
          userId: req.userId,
          createdAt: {
            [Op.gte]: currentMonthStart,
            [Op.lt]: nextMonthStart,
          },
        },
      }),

      Transactions.count({
        where: {
          userId: req.userId,
          createdAt: {
            [Op.gte]: lastMonthStart,
            [Op.lt]: currentMonthStart,
          },
        },
      }),
    ]);

    res.json({
      currentMonthCount: currentCount || 0,
      lastMonthCount: lastCount || 0,
    });
  } catch (error) {
    console.error("Error in getMonthlyComparison:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budgets.findAll({
      where: { userId: req.userId },
      include: [{ model: Categories, attributes: ["name"] }],
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
