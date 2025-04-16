import Settings from "../models/SettingModel.js";
import Users from "../models/UserModel.js";

export const getUserSettings = async (req, res) => {
  try {
    const response = await Settings.findOne({
      where: {
        userId: req.userId,
      },
      attributes: ["uuid", "first_day_of_month", "first_day_of_week"],
      include: [
        {
          model: Users,
          attributes: [],
        },
      ],
      raw: true,
    });

    // Jika belum ada settings, return default
    if (!response) {
      return res.status(200).json({
        first_day_of_month: 1,
        first_day_of_week: "Monday",
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateUserSettings = async (req, res) => {
  const { first_day_of_month, first_day_of_week } = req.body;

  try {
    // Validasi input
    if (
      first_day_of_month &&
      (first_day_of_month < 1 || first_day_of_month > 31)
    ) {
      return res
        .status(400)
        .json({ msg: "Hari pertama bulan harus antara 1-31" });
    }

    if (
      first_day_of_week &&
      !["Monday", "Sunday"].includes(first_day_of_week)
    ) {
      return res
        .status(400)
        .json({ msg: "Hari pertama minggu harus Monday atau Sunday" });
    }

    // Cek apakah settings sudah ada
    const existingSettings = await Settings.findOne({
      where: { userId: req.userId },
    });

    if (existingSettings) {
      // Update settings yang ada
      await Settings.update(
        {
          first_day_of_month,
          first_day_of_week,
        },
        {
          where: { userId: req.userId },
        }
      );
    } else {
      // Buat settings baru jika belum ada
      await Settings.create({
        userId: req.userId,
        first_day_of_month,
        first_day_of_week,
      });
    }

    res.status(200).json({ msg: "Pengaturan berhasil diperbarui" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const resetUserSettings = async (req, res) => {
  try {
    await Settings.destroy({
      where: { userId: req.userId },
    });

    res.status(200).json({
      msg: "Pengaturan berhasil direset",
      default_settings: {
        first_day_of_month: 1,
        first_day_of_week: "Monday",
      },
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
