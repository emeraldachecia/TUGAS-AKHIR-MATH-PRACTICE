const TemplateRepository = require("../repositories/template.repository");
const Connection = require("../configs/database.config");

const fs = require("fs");
const path = require("path");
const { filterHandler } = require("../utils/filter-handler");

class TemplateService {
    async find(data, type) {
		try {
			let result = {};

			const filters = filterHandler(data);

            // mengecek jenis pencarian berdasarkan 'type'
			switch (type) {
				case "summary":
					result = await TemplateRepository.findMany(filters);
					break;
				case "detail":
					result = await TemplateRepository.findOne(filters);
					break;
				default:
					throw new Error(`Unsupported type: ${type}`);
			}

			return result;
		} catch (error) {
			throw error;
		}
    }
    
    async create(data, file, session) {
		let dbTrx;
		try {
			dbTrx = await Connection.transaction();

			const createdRow = await TemplateRepository.create(data, dbTrx);

			if (file) {
				const newFileName = `${data.topic}-${data.level}-${
					createdRow.template_id
				}${path.extname(file.originalname)}`;
				const targetPath = path.join("public/images/templates", newFileName);

				// hapus jika sudah ada file dengan nama sama
				if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);

				// simpan gambar ke folder
				fs.renameSync(file.path, targetPath);

				// update kolom image di DB
				createdRow.image = newFileName;
				createdRow.save();
			}

			await dbTrx.commit();

			return createdRow;
		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
    }
    
    async update(data, file, session) {
		let dbTrx;
		try {
			dbTrx = await Connection.transaction();

			const existing = await TemplateRepository.findOne(
				filterHandler({ template_id: data.template_id })
			);

			if (!existing) {
				throw Object.assign(new Error("Template not found."), { code: 404 });
			}

			if (file) {
				const newFileName = `${data.topic || existing.topic}-${
					data.level || existing.level
				}-${data.template_id}${path.extname(file.originalname)}`;
				const targetPath = path.join("public/images/templates", newFileName);

				// hapus jika sudah ada file dengan nama sama
				if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);

				// simpan gambar ke folder
				fs.renameSync(file.path, targetPath);

				data.image = newFileName;
			} else if (data.remove_image && existing.image) {
				const targetPath = path.join("public/images/templates", existing.image);

				// hapus file fisik jika ada
				if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);

				// hapus attribute remove_image dari request body
				delete data.remove_image;

				// set image menjadi null untuk repository
				data.image = null;
			}

			const updatedRow = await TemplateRepository.update(data, dbTrx);

			await dbTrx.commit();

			return updatedRow;
		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
    }
    
    async delete(data, session) {
		let dbTrx;
		try {
			dbTrx = await Connection.transaction();

			const existing = await TemplateRepository.findOne(
				filterHandler({ template_id: data.template_id })
			);

			if (!existing) {
				throw Object.assign(new Error("Template not found."), {
					code: 404,
				});
			}

			const deletedCount = await TemplateRepository.delete(data.template_id, dbTrx);

			// hapus gambar kalau ada
			if (existing.image) {
				const targetPath = path.join("public/images/templates", existing.image);

				if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
			}

			await dbTrx.commit();

			return deletedCount > 0 ? true : false;
		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
	}
}

module.exports = new TemplateService();