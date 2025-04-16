import Budgets from "../models/BudgetModel.js";
import Users from "../models/UserModel.js";
import Categories from "../models/CategoryModel.js";
import { Op } from "sequelize";

export const createBudget = async (req, res) => {
  try {
    const { categoryId, period, amount, start_date, end_date } = req.body;
    await Budgets.create({
      categoryId: categoryId,
      period: period,
      amount: amount,
      start_date: start_date,
      end_date: end_date,
      userId: req.userId,
    });
    res.status(201).json("Budget created");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budgets.findAll({
      where: {
        userId: req.userId,
      },
      attributes: [
        "uuid",
        "amount",
        "period",
        "start_date",
        "end_date",
      ],
      include: [
        {
          model: Users,
          attributes: ["username", "email"],
        },
        {
          model: Categories,
          attributes: ["id","name"],
        }
      ],
    });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budgets.findOne({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
      attributes: [
        "uuid",
        "category_id",
        "amount",
        "period",
        "start_date",
        "end_date",
      ],
      include: [
        {
          model: Users,
          attributes: ["username", "email"],
        },
        {
          model: Categories,
          attributes: ["id","name"],
        }
      ],
    });
    if (!budget)
      return res
        .status(404)
        .json({ error: `Budget ${req.params.id} not found` });
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBudget = async (req, res) => {
  const { category_id, period, amount, start_date, end_date } = req.body;
  const categoryId = category_id;
  const budget = await Budgets.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!budget)
    return res.status(404).json({ error: `Budget ${req.params.id} not found` });
  try {
    await Budgets.update(
      {
        categoryId,
        period,
        amount,
        start_date,
        end_date
      },
      {
        where: {
          uuid: req.params.id,
          userId: req.userId,
        },
      }
    );
    res.status(200).json("Budget updated");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  const budget = await Budgets.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!budget)
    return res.status(404).json({ error: `Budget ${req.params.id} not found` });
  try {
    await Budgets.destroy({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
    });
    res.status(200).json("Budget deleted");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const filterBudgetByCategory = async (req, res) => {
  const category_id = req.params.category_id;
  try {
    const budgets = await Budgets.findAll({
      where: {
        userId: req.userId,
        categoryId: category_id,
      },
      include: [
        {
          model: Users,
          attributes: ["username", "email"],
        },
        {
          model: Categories,
          attributes: ["name"],
        }
      ]
    });
    if (!budgets)
      return res
        .status(404)
        .json({ error: "Budget with this category not found" });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const filterBudgetByDate = async (req, res) => {
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  try {
    const budgets = await Budgets.findAll({
      where: {
        userId: req.userId,
        createdAt: {[Op.between]: [start_date, end_date]},
      },
      include: [
        {
          model: Users,
          attributes: ["username", "email"],
        },
        {
          model: Categories,
          attributes: ["name"],
        }
      ]
    });
    if (!budgets)
      return res
        .status(404)
        .json({ error: "Budget with this range of date not found" });
        res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const filterBudgetByPeriod = async (req, res) => {
  try {
    const period = req.params.period;
    const budgets = await Budgets.findAll({
      where: {
        userId: req.userId,
        period: period
      },
      include: [
        {
          model: Users,
          attributes: ["username", "email"],
        },
        {
          model: Categories,
          attributes: ["name"],
        }
      ]
    });
    if(!budgets)
      return res.status(404).json({ error: "Weekly budget not found" });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

