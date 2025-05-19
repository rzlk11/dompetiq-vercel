import Rekening from "../models/RekeningModel.js";
import { Sequelize, Op } from "sequelize";
import Users from "../models/UserModel.js";

export const getRekening = async (req, res) => {
  try {
    const where = {
      userId: req.userId,
    };

    const response = await Rekening.findAll({
      where,
      attributes: [
        "uuid",
        "balance",
        "name",
        [
          Sequelize.fn(
            "TO_CHAR",
            Sequelize.col("rekening.createdAt"),
            "YYYY-MM"
          ),
          "createdAt",
        ],
        [Sequelize.literal('"user"."username"'), "user"],
      ],
      include: [
        {
          model: Users,
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

export const getRekeningById = async (req, res) => {
  try {
    const response = await Rekening.findOne({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
      attributes: [
        "uuid",
        "balance",
        "name",
        [Sequelize.literal('"user"."username"'), "user"],
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const createRekening = async (req, res) => {
  const { balance, name } = req.body;
  try {
    await Rekening.create({
      balance: balance,
      name: name,
      userId: req.userId,
    });
    res.status(201).json({ msg: "Rekening berhasil dibuat" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateRekening = async (req, res) => {
  const { balance, name } = req.body;

  const rekening = await Rekening.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!rekening) {
    return res.status(404).json({ msg: "Rekening tidak ditemukan" });
  }

  try {
    await Rekening.update(
      {
        balance: balance,
        name: name,
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

export const deleteRekening = async (req, res) => {
  const rekening = await Rekening.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!rekening)
    return res.status(404).json({ msg: "Rekening tidak ditemukan" });
  try {
    await Rekening.destroy({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Rekening berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
