const Joi = require("joi");

const exerciseSchema = {
	createExercise(data) {
		const schema = Joi.object({
			topic: Joi.string().valid("arithmetic", "geometry").required().messages({
				"string.base": `'topic' must be a string.`,
				"any.only": `'topic' must be either 'arithmetic' or 'geometry'.`,
				"any.required": `'topic' is required.`,
			}),
			level: Joi.string().valid("easy", "medium", "hard").required().messages({
				"string.base": `'level' must be a string.`,
				"any.only": `'level' must be either 'easy', 'medium' or 'hard'.`,
				"any.required": `'level' is required.`,
			}),
		})
			.required()
			.messages({
				"object.base": `request body must be a valid JSON object.`,
				"any.required": `request body is required.`,
			});

		return schema.validate(data, { abortEarly: false });
	},
	updateExercise(data) {
		const schema = Joi.object({
			exercise_id: Joi.string().max(50).required().messages({
				"string.base": `'exercise_id' must be a string.`,
				"string.max": `'exercise_id' must not exceed 50 characters.`,
				"any.required": `'exercise_id' is required.`,
			}),
			answers: Joi.array()
				.items(
					Joi.object({
						question_id: Joi.string().max(50).required().messages({
							"string.base": `'exercise_id' must be a string.`,
							"string.max": `'exercise_id' must not exceed 50 characters.`,
							"any.required": `'exercise_id' is required.`,
						}),
						option_id: Joi.string().max(50).required().messages({
							"string.base": `'option_id' must be a string.`,
							"string.max": `'option_id' must not exceed 50 characters.`,
							"any.required": `'option_id' is required.`,
						}),
					})
				)
				.required()
				.messages({
					"array.base": `'answers' must be an array.`,
					"any.required": `'answers' is required.`,
				}),
		})
			.required()
			.messages({
				"object.base": `request body must be a valid JSON object.`,
				"any.required": `request body is required.`,
			});

		return schema.validate(data, { abortEarly: false });
	},
};

module.exports = exerciseSchema;
