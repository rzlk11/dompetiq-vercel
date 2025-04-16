import Users from "../models/UserModel.js";
import Categories from "../models/CategoryModel.js";
import argon2 from "argon2";

export const createUser = async (req, res) => {
  const { username, email, password, confPassword } = req.body;
  if (password !== confPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  const user = await Users.findOne({
    where: {
      username: req.body.username,
    },
  });
  if (user) return res.status(403).json({ error: "Username is already used!" });
  const hashedPassword = await argon2.hash(password);
  try {
    // 1. Buat user
    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
    });

    // 2. Default kategori
    const defaultCategories = [
      { name: "Gaji Utama", type: "income" },
      { name: "Gaji Paruh Waktu", type: "income" },
      { name: "Bonus Pekerjaan", type: "income" },
      { name: "Penjualan Online", type: "income" },
      { name: "Hadiah", type: "income" },
      { name: "Makanan dan Minuman", type: "expense" },
      { name: "Listrik", type: "expense" },
      { name: "PDAM", type: "expense" },
      { name: "Liburan", type: "expense" },
      { name: "Transportasi", type: "expense" },
      { name: "Pakaian", type: "expense" },
      { name: "Iuran BPJS", type: "expense" },
      { name: "Asuransi", type: "expense" },
      { name: "Internet", type: "expense" },
    ];

    // 3. Tambahkan userId (atau user.uuid tergantung relasi kamu)
    const categoriesWithUser = defaultCategories.map((cat) => ({
      ...cat,
      userId: newUser.id, // gunakan newUser.uuid kalau relasinya pakai UUID
    }));

    // 4. Simpan ke DB
    await Categories.bulkCreate(categoriesWithUser);

    res.status(201).json("Registration successful with default categories");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["uuid", "username", "email"],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        uuid: req.params.id,
      },
      attributes: ["uuid", "username", "email"],
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: `User with id: ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const user = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) {
    return res
      .status(404)
      .json({ error: `User with id: ${req.params.id} not found` });
  }
  const { username, email, password, confPassword } = req.body;
  let hashedPassword;
  if (password === undefined || password === "" || password === null) {
    hashedPassword = user.password;
  } else {
    if (password !== confPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    hashedPassword = await argon2.hash(password);
  }
  try {
    await Users.update(
      {
        username,
        email,
        password: hashedPassword,
      },
      {
        where: { uuid: req.params.id },
      }
    );
    res.status(200).json("User updated");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const user = await Users.findOne({
    where: { uuid: req.params.id },
  });
  if (!user) {
    return res
      .status(404)
      .json({ error: `User with id: ${req.params.id} not found` });
  }
  try {
    await Users.destroy({
      where: { uuid: req.params.id },
    });
    res.status(200).json("User deleted");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
