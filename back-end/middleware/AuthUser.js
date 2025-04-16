import Users from "../models/UserModel.js";

// verifikasi apakah user sudah login
export const verifyUser = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Login to your account first!" });
  }
  const user = await Users.findOne({
    where: {
      uuid: req.session.userId,
    },
  });
  if (!user) return res.status(404).json({ error: "User not found!" });
  req.userId = user.id;
  next();
};

// verifikasi apakah user memiliki otorisasi untuk akses data
export const authorized = async (req, res, next) => {
  const user = await Users.findOne({
    where: {
      uuid: req.session.userId,
    },
  });
  if (!user) return res.status(404).json({ error: "User not found!" });
  if (user.uuid !== req.params.id)
    return res.status(403).json({ error: "Access Forbidden" });
  next();
};
