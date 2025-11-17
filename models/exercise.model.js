const Identifier = require("../utils/identifier-handler.util");
const Connection = require("../configs/database.config");
const { DataTypes } = require("sequelize");

const ExerciseModel = Connection.define(
	"exercise",
	{
		exercise_id: {
			type: DataTypes.STRING(50),
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		start_time: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		end_time: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
		topic: {
			type: DataTypes.ENUM("arithmetic", "geometry"),
			allowNull: false,
		},
		level: {
			type: DataTypes.ENUM("easy", "medium", "hard"),
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("active", "submitted"),
			allowNull: false,
			defaultValue: "active",
		},
		timestamp: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
	},
	{
		tableName: "exercise",
		timestamps: false,
		underscored: true,
		hooks: {
			beforeCreate: (record) => {
				record.exercise_id = Identifier("xrc");
				record.timestamp = Date.now();
			},
			beforeUpdate: (record) => {
				record.timestamp = Date.now();
			},
		},
	}
);

module.exports = ExerciseModel;
