const Connection = require("../configs/database.config");
const Sequelize = require("sequelize");
const { TemplateModel } = require("../models");

class TemplateRepository {
    async findMany(filters) {
        try {
            // mengambil semua template yang cocok berdasarkan filter yang dikirim
            return await TemplateModel.findAll({
                // kondisi pencarian
                where: filters,
                // list kolom yang diambil
                attributes: ["template_id", "content", "formula", "topic", "level"],
                // hasil berupa object js
                raw: true,
            });
        } catch (error) {
            // jika ada error, langsung lempar ke function yang panggil
            throw error;
        }
    }

    async findOne(filters) {
        try {
            return await TemplateModel.findOne({
                where: filters,
                raw: true,
            });
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
				throw Object.assign(new Error(error.errors[0].message), { code: 400 });
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