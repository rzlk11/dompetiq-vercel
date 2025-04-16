import { Sequelize } from "sequelize";

const db = new Sequelize('budget_app','root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

export default db;