const Identifier = require("../utils/identifier-handler");
const Connection = require("../configs/database.config");
const { DataTypes } = require("sequelize");

const QuestionModel = Connection.define(
	"question",
	{
		question_id: {
			type: DataTypes.STRING(50),
			primaryKey: true,
		},
		exercise_id: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		template_id: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		timestamp: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
	},
	{
		tableName: "question",
		timestamps: false,
		underscored: true,
		hooks: {
			beforeCreate: (record) => {
				record.question_id = Identifier("qst");
				record.timestamp = Date.now();
			},
			beforeUpdate: (record) => {
				record.timestamp = Date.now();
			},
		},
	}
);

module.exports = QuestionModel;
