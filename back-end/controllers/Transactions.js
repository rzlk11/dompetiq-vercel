import Transactions from "../models/TransactionModel.js";
import { Sequelize, Op } from "sequelize";
import Users from "../models/UserModel.js";
import Categories from "../models/CategoryModel.js";

export const getTransactions = async (req, res) => {
  try {
    // Dapatkan parameter query
    const { start_date, end_date, type, category_name } = req.query;

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
    ];

    // Filter berdasarkan category_name
    if (category_name) {
      include[1].where.name = {
        [Op.like]: `%${category_name}%`, // Mencari nama kategori yang mengandung string
      };
    }

    // Filter berdasarkan tipe (income/expense)
    if (type && ["income", "expense"].includes(type)) {
      include[1].where.type = type;
    }

    const response = await Transactions.findAll({
      where,
      attributes: [
        "uuid",
        "amount",
        "is_scheduled",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("transactions.createdAt"),
            "%Y-%m-%d %H:%i:%s"
          ),
          "createdAt", // Alias untuk kolom yang diformat
        ],
        [Sequelize.literal("user.username"), "user"],
        [Sequelize.literal("category.name"), "category"],
        [Sequelize.literal("category.type"), "category_type"],
      ],
      include,
      raw: true,
    });
    res.status(200).json(response);
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
        [Sequelize.literal("user.username"), "user"],
        [Sequelize.literal("category.name"), "category"],
        [Sequelize.literal("category.type"), "type"],
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const createTransaction = async (req, res) => {
  const { amount, type, is_scheduled, category_name } = req.body;
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
    await Transactions.create({
      amount: amount,
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
  const { amount, is_scheduled, type, category_name } = req.body;

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

    // Update data
    await Transactions.update(
      {
        amount: amount,
        is_scheduled: is_scheduled,
        type: type,
        categoryId: categoryId, // Akan undefined jika tidak diubah
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
