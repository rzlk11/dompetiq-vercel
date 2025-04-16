import Categories from "../models/CategoryModel.js";
import Users from "../models/UserModel.js";

export const getCategories = async (req, res) => {
  try {
    const where = { userId: req.userId };

    if (req.query.type) {
      const validTypes = ["income", "expense"];
      if (validTypes.includes(req.query.type)) {
        where.type = req.query.type;
      } else {
        return res.status(400).json({
          msg: 'Type salah. Gunakan "income" atau "expense"',
        });
      }
    }
    const response = await Categories.findAll({
      where,
      attributes: ["id", "uuid", "name", "type"],
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
export const getCategoryById = async (req, res) => {
  try {
    const response = await Categories.findOne({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
      attributes: ["uuid", "name", "type"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const createCategory = async (req, res) => {
  const { name, type } = req.body;
  try {
    await Categories.create({
      name: name,
      type: type,
      userId: req.userId,
    });
    res.status(201).json({ msg: "Category Berhasil Dibuat" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
export const updateCategory = async (req, res) => {
  const { name, type } = req.body;
  const category = await Categories.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!category)
    return res.status(404).json({ msg: "Kategori tidak ditemukan" });
  try {
    await Categories.update(
      {
        name: name,
        type: type,
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
export const deleteCategory = async (req, res) => {
  const category = await Categories.findOne({
    where: {
      userId: req.userId,
      uuid: req.params.id,
    },
  });
  if (!category)
    return res.status(404).json({ msg: "Kategori tidak ditemukan" });
  try {
    await Categories.destroy({
      where: {
        userId: req.userId,
        uuid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
