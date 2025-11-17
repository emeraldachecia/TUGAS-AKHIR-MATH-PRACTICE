const Identifier = require("../utils/identifier-handler");
const Connection = require("../configs/database.config");
const { DataTypes } = require("sequelize");

const UserModel = Connection.define(
    "user",
    {
        user_id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("admin", "student"),
            allowNull: false,
            defaultValue: "student",
        },
        timestamp: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
    },
    {
        tableName: "user",
        timestamps: false,
        underscored: true,
        hooks: {
            beforeCreate: (record) => {
                record.user_id = Identifier("usr");
                record.timestamp = Date.now();
            },
            beforeUpdate: (record) => {
                record.timestamp = Date.now();
            },
        },
    }
);

module.exports = UserModel;