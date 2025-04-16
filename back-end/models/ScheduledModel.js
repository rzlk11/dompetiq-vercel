import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import Categories from "./CategoryModel.js";

const { DataTypes } = Sequelize;

const Scheduled = db.define(
  "scheduled",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    period: {
      type: DataTypes.ENUM("monthly", "weekly", "daily"),
      allowNull: false,
      defaultValue: "monthly",
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
      defaultValue: "expense",
      validate: {
        notEmpty: true,
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
    },
    end_date: {
      type: DataTypes.DATEONLY,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Scheduled);
Scheduled.belongsTo(Users);
Categories.hasMany(Scheduled);
Scheduled.belongsTo(Categories);

export default Scheduled;
