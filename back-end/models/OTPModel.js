import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const OTP = db.define(
    "otp",
    {
        uuid: {
            type: DataTypes.STRING,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                notEmpty: true,
                isEmail: true,
            },
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                notEmpty: true,
            },
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
    },
    {
        freezeTableName: true,
    },
);

export default OTP;