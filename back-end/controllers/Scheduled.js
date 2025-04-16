import Scheduled from "../models/ScheduledModel.js";
import { Sequelize, Op } from "sequelize";
import Users from "../models/UserModel.js";
import Categories from "../models/CategoryModel.js";

export const getScheduled = async (req, res) => {
  try {
    // Dapatkan parameter query
    const { start_date, end_date, type, period, category_name } = req.query;

    // Buat kondisi where
    const where = {
      userId: req.userId,
    };

    // Filter berdasarkan createdAt
    if (start_date && end_date) {
      where.start_date = {
        [Op.between]: [
          new Date(start_date + " 00:00:00"), // Mulai dari awal hari
          new Date(end_date + " 23:59:59"), // Sampai akhir hari
        ],
      };
    } else if (start_date) {
      where.start_date = {
        [Op.gte]: new Date(start_date + " 00:00:00"),
      };
    } else if (end_date) {
      where.end_date = {
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

    // Filter berdasarkan period [daily, weekly, monthly]
    if (period && ["daily", "weekly", "monthly"].includes(period)) {
      where.period = period;
    }
    const response = await Scheduled.findAll({
      where,
      attributes: [
        "uuid",
        "amount",
        "period",
        "type",
        "start_date",
        "end_date",
        "description",
        [Sequelize.literal("user.username"), "user"],
        [Sequelize.literal("category.name"), "category"],
      ],
      include,
      raw: true,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const getScheduledById = async (req, res) => {
  try {
    const response = await Scheduled.findOne({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
      attributes: [
        "uuid",
        "amount",
        "period",
        "type",
        "start_date",
        "end_date",
        "description",
        [Sequelize.literal("user.username"), "user"],
        [Sequelize.literal("category.name"), "category"],
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
      raw: true,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const createScheduled = async (req, res) => {
  const {
    amount,
    type,
    period,
    start_date,
    end_date,
    description,
    category_name,
  } = req.body;
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
    await Scheduled.create({
      amount: amount,
      period: period,
      type: type,
      start_date: start_date,
      end_date: end_date,
      description: description,
      userId: req.userId,
      categoryId: category.id,
    });
    res.status(201).json({ msg: "Schedule berhasil dibuat" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const updateScheduled = async (req, res) => {
  const {
    category_name,
    amount,
    period,
    type,
    description,
    start_date,
    end_date,
  } = req.body;
  const scheduled = await Scheduled.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!scheduled)
    return res.status(404).json({ msg: "Jadwal tidak ditemukan" });

  try {
    // 1. Cari kategori berdasarkan nama
    let categoryId;
    if (category_name) {
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
      categoryId = category.id;

      // 3. Validasi type kategori sesuai dengan transaksi
      if (type !== category.type) {
        return res.status(400).json({
          msg: `Type transaksi tidak sesuai dengan kategori. Kategori ${category.name} hanya untuk ${category.type}`,
        });
      }
    }
    await Scheduled.update(
      {
        categoryId: categoryId,
        amount: amount,
        period: period,
        type: type,
        start_date: start_date,
        end_date: end_date,
        description: description,
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
export const deleteScheduled = async (req, res) => {
  const scheduled = await Scheduled.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!scheduled)
    return res.status(404).json({ msg: "Jadwal tidak ditemukan" });
  try {
    await Scheduled.destroy({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Jadwal berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
