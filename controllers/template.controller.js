const TemplateService = require("../services/template.service");
const responseHandler = require("../utils/response-handler");
const Validator = require("../utils/validators");

class TemplateController {
	async findSummary(req, res) {
		try {
			const result = await TemplateService.find(req.query, "summary");

			responseHandler(res, {
				code: 200,
				data: result,
			});
		} catch (error) {
			console.error(error);
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async findDetail(req, res) {
		try {
			const result = await TemplateService.find(req.params, "detail");

			responseHandler(res, {
				code: 200,
				data: result,
			});
		} catch (error) {
			console.error(error);
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async create(req, res) {
		try {
			const { error } = Validator.createTemplate(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await TemplateService.create(
				req.body,
				req.file,
				req.session.user
			);

			responseHandler(res, {
				code: 201,
				data: result,
			});
		} catch (error) {
			console.error(error);
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async update(req, res) {
		try {
			const { error } = Validator.updateTemplate(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await TemplateService.update(
				req.body,
				req.file,
				req.session.user
			);

			responseHandler(res, {
				code: 200,
				data: result,
			});
		} catch (error) {
			console.error(error);
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}

	async delete(req, res) {
		try {
			const result = await TemplateService.delete(req.params, req.session.user);

			responseHandler(res, {
				code: 200,
				data: result,
			});
		} catch (error) {
			console.error(error);
			responseHandler(res, {
				code: error.code || 500,
				errors: error.message,
			});
		}
	}
}

module.exports = new TemplateController();
