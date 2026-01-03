const Connection = require("../configs/database.config");
const { Sequelize, Op } = require("sequelize");
const { TemplateModel } = require("../models");

class TemplateRepository {
	async findMany(filters) {
		try {
			const rows = await TemplateModel.findAll({
				where: filters,
				attributes: [
					"template_id",
					"content",
					"formula",
					"placeholders",
					"topic",
					"level",
				],
				raw: true,
			});

			const formatResult = (rows) => {
				for (const row of rows) {
					if (row.placeholders) {
						row.placeholders = JSON.parse(row.placeholders);
					}

					// row.placeholders = JSON.parse(row.placeholders);
				}
				return rows;
			};

			return formatResult(rows);
		} catch (error) {
			throw error;
		}
	}

	async findOne(filters) {
		try {
			const row = await TemplateModel.findOne({
				where: filters,
				raw: true,
			});

			if (row && row?.placeholders) {
				row.placeholders = JSON.parse(row.placeholders);
			}

			// if (row) {
			// 	row.placeholders = JSON.parse(row.placeholders);
			// }

			return row;
		} catch (error) {
			throw error;
		}
	}

	async create(data, dbTrxGlobal) {
		let dbTrx;
		try {
			dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

			const row = await TemplateModel.create(data, { transaction: dbTrx });

			if (!dbTrxGlobal) await dbTrx.commit();

			return row;
		} catch (error) {
			if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();

			if (error instanceof Sequelize.UniqueConstraintError) {
				// throw Object.assign(new Error(error.errors[0].message), { code: 400 });

				const err = new Error(error.errors[0].message)
				err.code = 400
				throw err
			}

			throw error;
		}
	}

	async update(data, dbTrxGlobal) {
		let dbTrx;
		try {
			dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

			const { template_id, ...template } = data;

			const row = await TemplateModel.update(template, {
				where: { template_id: template_id },
				transaction: dbTrx,
			});

			if (!dbTrxGlobal) await dbTrx.commit();

			return row;
		} catch (error) {
			if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();

			if (error instanceof Sequelize.UniqueConstraintError) {
				throw Object.assign(new Error(error.errors[0].message), { code: 400 });
			}

			throw error;
		}
	}

	async delete(templateId, dbTrxGlobal) {
		let dbTrx;
		try {
			dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

			const count = await TemplateModel.destroy({
				where: { template_id: templateId },
				transaction: dbTrx,
			});

			if (!dbTrxGlobal) await dbTrx.commit();

			return count;
		} catch (error) {
			if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();
			throw error;
		}
	}
}

module.exports = new TemplateRepository();
