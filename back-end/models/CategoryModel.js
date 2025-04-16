import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import Budgets from "./BudgetModel.js";

const { DataTypes } = Sequelize;

const Categories = db.define(
  "categories",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
      defaultValue: "income",
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Categories);
Categories.belongsTo(Users);
Categories.hasMany(Budgets, { foreignKey: "categoryId" });
Budgets.belongsTo(Categories, { foreignKey: "categoryId" });

export default Categories;
