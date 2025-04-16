import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const db = new Sequelize(process.env.DB_URI, {
    dialect: 'postgres',
  });

export default db;