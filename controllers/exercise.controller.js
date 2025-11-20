const ExerciseService = require("../services/exercise.service.js");
const responseHandler = require("../utils/response-handler");
const Validator = require("../utils/validators");

class ExerciseController {
	async findSummary(req, res) {
		try {
			const result = await ExerciseService.find(
				req.query,
				"summary",
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

	async findDetail(req, res) {
		try {
			const result = await ExerciseService.find(
				req.params,
				"detail",
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

	async findActive(req, res) {
		try {
			const result = await ExerciseService.find(
				{ status: "active" },
				"active",
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

	async create(req, res) {
		try {
			const { error } = Validator.createExercise(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await ExerciseService.create(req.body, req.session.user);

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
			const { error } = Validator.updateExercise(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await ExerciseService.update(req.body, req.session.user);

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
			const result = await ExerciseService.delete(req.params, req.session.user);

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

module.exports = new ExerciseController();
