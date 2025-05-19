import Transactions from "../models/TransactionModel.js";
import { Sequelize, Op } from "sequelize";
import Users from "../models/UserModel.js";
import Categories from "../models/CategoryModel.js";
import Rekening from "../models/RekeningModel.js";

export const getTransactions = async (req, res) => {
  try {
    // Dapatkan parameter query
    const { start_date, end_date, type, category, rekening, grouped } =
      req.query;

    // Buat kondisi where
    const where = {
      userId: req.userId,
    };

    // Filter berdasarkan createdAt
    if (start_date && end_date) {
      where.createdAt = {
        [Op.between]: [
          new Date(start_date + " 00:00:00"), // Mulai dari awal hari
          new Date(end_date + " 23:59:59"), // Sampai akhir hari
        ],
      };
    } else if (start_date) {
      where.createdAt = {
        [Op.gte]: new Date(start_date + " 00:00:00"),
      };
    } else if (end_date) {
      where.createdAt = {
        [Op.lte]: new Date(end_date + " 23:59:59"),
      };
    }

    // Buat kondisi include untuk kategori
    const include = [
      {
        model: Users,
        attributes: [],
      },
      {
        model: Categories,
        attributes: [],
        where: {},
      },
      {
        model: Rekening,
        attributes: [],
        where: {},
      },
    ];

    // Filter berdasarkan category_name
    if (category) {
      include[1].where.name = {
        [Op.like]: `%${category}%`, // Mencari nama kategori yang mengandung string
      };
    }

    if (rekening) {
      include[2].where.name = {
        [Op.like]: `%${rekening}%`, // Mencari nama rekening yang mengandung string
      };
    }

    // Filter berdasarkan tipe (income/expense)
    if (type && ["income", "expense"].includes(type)) {
      include[1].where.type = type;
    }

    if (grouped) {
      const response = await Transactions.findAll({
        where,
        attributes: [
          "amount",
          "is_scheduled",
          "rekeningId",
          [
            Sequelize.fn(
              "DATE_FORMAT",
              Sequelize.col("transactions.createdAt"),
              "%Y-%m-%d %H:%i:%s"
            ),
            "createdAt",
          ],
          [Sequelize.literal("category.type"), "category_type"],
          [Sequelize.literal("rekening.name"), "rekening"],
          [Sequelize.literal("rekening.balance"), "rekening_balance"],
          [Sequelize.literal("rekening.uuid"), "rekening_uuid"],
        ],
        include,
        raw: true,
      });

      // Step 1: Group by rekeningId
      const grouped = {};
      response.forEach((tx) => {
        const id = tx.rekeningId;
        if (!grouped[id]) {
          grouped[id] = {
            rekening_uuid: tx.rekening_uuid,
            rekeningId: id,
            rekening: tx.rekening,
            initialBalance: Number(tx.rekening_balance),
            transactions: [],
          };
        }
        grouped[id].transactions.push(tx);
      });

      // Step 2: Sort & calculate running balance
      for (const group of Object.values(grouped)) {
        let balance = group.initialBalance;
        group.transactions.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        group.transactions = group.transactions.map((tx) => {
          const amount =
            tx.category_type === "expense"
              ? -Number(tx.amount)
              : Number(tx.amount);
          balance += amount;
          return {
            ...tx,
            amount,
            balance,
          };
        });

        group.finalBalance = balance;
      }

      const result = Object.values(grouped);

      res.status(200).json(result);
    } else {
      const response = await Transactions.findAll({
        where,
        attributes: [
          "uuid",
          "amount",
          "is_scheduled",
          [
            Sequelize.fn(
              "TO_CHAR",
              Sequelize.col("transactions.createdAt"),
              "YYYY-MM-DD HH24:MI:SS"
            ),
            "createdAt", // Alias untuk kolom yang diformat
          ],
          [Sequelize.literal('"user"."username"'), "user"],
          [Sequelize.literal('"category"."name"'), "category"],
          [Sequelize.literal('"category"."type"'), "category_type"],
          [Sequelize.literal('"rekening"."name"'), "rekening"],
          [Sequelize.literal('"rekening"."balance"'), "rekening_balance"],
        ],
        include,
        raw: true,
      });
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const getTransactionById = async (req, res) => {
  try {
    const response = await Transactions.findOne({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
      attributes: [
        "uuid",
        "amount",
        "is_scheduled",
        [Sequelize.literal('"user"."username"'), "user"],
        [Sequelize.literal('"category"."name"'), "category"],
        [Sequelize.literal('"category"."type"'), "category_type"],
      ],
      include: [
        {
          model: Users,
          attributes: [],
        },
        {
          model: Categories,
          attributes: [],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const createTransaction = async (req, res) => {
  const { amount, type, is_scheduled, category_name, rekening_name } = req.body;
  try {
    // 1. Cari kategori berdasarkan nama
    const category = await Categories.findOne({
      where: {
        userId: req.userId,
        name: category_name, // Cari berdasarkan nama kategori
      },
    });

    // 2. Jika kategori tidak ditemukan
    if (!category) {
      return res.status(404).json({
        msg: "Kategori tidak ditemukan",
      });
    }

    // 3. Validasi type kategori sesuai dengan transaksi
    if (type !== category.type) {
      return res.status(400).json({
        msg: `Type transaksi tidak sesuai dengan kategori. Kategori ${category.name} hanya untuk ${category.type}`,
      });
    }

    const rekening = await Rekening.findOne({
      where: {
        userId: req.userId,
        name: rekening_name,
      },
    });
    if (!rekening) {
      return res.status(404).json({ msg: "Rekening tidak ditemukan" });
    }

    await Transactions.create({
      amount: amount,
      rekeningId: rekening.id,
      type: type,
      is_scheduled: is_scheduled,
      userId: req.userId,
      categoryId: category.id,
    });
    res.status(201).json({ msg: "Transaction berhasil dibuat" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const updateTransaction = async (req, res) => {
  const { amount, is_scheduled, type, category_name, rekening_name } = req.body;

  // Cari transaksi
  const transaction = await Transactions.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!transaction) {
    return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
  }

  try {
    // Jika ada category_name, cari kategori
    let categoryId;
    if (category_name) {
      const category = await Categories.findOne({
        where: {
          userId: req.userId,
          name: category_name,
        },
      });
      if (!category) {
        return res.status(404).json({ msg: "Kategori tidak ditemukan" });
      }
      categoryId = category.id;

      if (type !== category.type) {
        return res.status(400).json({
          msg: `Type transaksi tidak sesuai dengan kategori. Kategori ${category.name} hanya untuk ${category.type}`,
        });
      }
    }

    let rekeningId;
    if (rekening_name) {
      const rekening = await Rekening.findOne({
        where: {
          userId: req.userId,
          name: rekening_name,
        },
      });
      if (!rekening) {
        return res.status(404).json({ msg: "Rekening tidak ditemukan" });
      }
      rekeningId = rekening.id;
    }

    // Update data
    await Transactions.update(
      {
        amount: amount,
        is_scheduled: is_scheduled,
        type: type,
        categoryId: categoryId, // Akan undefined jika tidak diubah
        rekeningId: rekeningId, // Akan undefined jika tidak diubah
      },
      {
        where: {
          userId: req.userId,
          uuid: req.params.id,
        },
      }
    );

    res.status(200).json({ msg: "Data berhasil diupdate" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const deleteTransaction = async (req, res) => {
  const transaction = await Transactions.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!transaction)
    return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
  try {
    await Transactions.destroy({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Transaksi berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const getIncomeData = async (req) => {
  try {
    const incomeData = await Transactions.findAll({
      where: {
        userId: req.userId,
        category_type: "income", // Filter for income transactions
      },
      attributes: [
        "uuid",
        "amount",
        "createdAt",
        [Sequelize.literal('"category"."type"'), "category_type"],
        [Sequelize.literal('"rekening"."name"'), "rekening"],
      ],
      include: [
        {
          model: Categories,
          attributes: [],
        },
        {
          model: Rekening,
          attributes: [],
        },
      ],
      raw: true,
    });
    return incomeData;
  } catch (error) {
    console.error("Error fetching income data:", error);
    throw new Error("Failed to fetch income data");
  }
};

export const getExpenseData = async (req) => {
  try {
    const expenseData = await Transactions.findAll({
      where: {
        userId: req.userId,
        category_type: "expense", // Filter for expense transactions
      },
      attributes: [
        "uuid",
        "amount",
        "createdAt",
        [Sequelize.literal('"category"."name"'), "category"],
        [Sequelize.literal('"rekening"."name"'), "rekening"],
      ],
      include: [
        {
          model: Categories,
          attributes: [],
        },
        {
          model: Rekening,
          attributes: [],
        },
      ],
      raw: true,
    });
    return expenseData;
  } catch (error) {
    console.error("Error fetching expense data:", error);
    throw new Error("Failed to fetch expense data");
  }
};