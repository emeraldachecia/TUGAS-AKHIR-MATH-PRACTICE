const Identifier = require("../utils/identifier-handler.util");
const Connection = require("../configs/database.config");
const { DataTypes } = require("sequelize");

const OptionModel = Connection.define(
	"option",
	{
		option_id: {
			type: DataTypes.STRING(50),
			primaryKey: true,
		},
		question_id: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		is_selected: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		is_correct: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		timestamp: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
	},
	{
		tableName: "option",
		timestamps: false,
		underscored: true,
		hooks: {
			beforeCreate: (record) => {
				record.option_id = Identifier("opt");
				record.timestamp = Date.now();
			},
			beforeUpdate: (record) => {
				record.timestamp = Date.now();
			},
		},
	}
);

module.exports = OptionModel;
