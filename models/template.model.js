const Identifier = require("../utils/identifier-handler");
const Connection = require("../configs/database.config");
const { DataTypes } = require("sequelize");

const TemplateModel = Connection.define(
	"template",
	{
		template_id: {
			type: DataTypes.STRING(50),
			primaryKey: true,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		formula: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		placeholders: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		image: {
			type: DataTypes.STRING(200),
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
		timestamp: {
			type: DataTypes.BIGINT,
			allowNull: true,
		},
	},
	{
		tableName: "template",
		timestamps: false,
		underscored: true,
		hooks: {
			beforeCreate: (record) => {
				record.template_id = Identifier("tpl");
				record.timestamp = Date.now();
			},
			beforeUpdate: (record) => {
				record.timestamp = Date.now();
			},
		},
	}
);

module.exports = TemplateModel;