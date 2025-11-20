const Joi = require("joi");

const templateSchema = {
	createTemplate(data) {
		const schema = Joi.object({
			content: Joi.string().min(3).max(1000).required().messages({
				"string.base": `'content' must be a string.`,
				"string.min": `'content' must be at least 3 characters long.`,
				"string.max": `'content' must not exceed 1000 characters.`,
				"any.required": `'content' is required.`,
			}),
			formula: Joi.string().min(3).max(200).required().messages({
				"string.base": `'formula' must be a string.`,
				"string.min": `'formula' must be at least 3 characters long.`,
				"string.max": `'formula' must not exceed 200 characters.`,
				"any.required": `'formula' is required.`,
			}),
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
			image: Joi.any().optional().messages({
				"any.required": `'image' is optional and should be a valid file.`,
			}),
		})
			.required()
			.messages({
				"object.base": `request body must be a valid JSON object.`,
				"any.required": `request body is required.`,
			});

		return schema.validate(data, { abortEarly: false });
	},
	updateTemplate(data) {
		const schema = Joi.object({
			template_id: Joi.string().max(50).required().messages({
				"string.base": `'template_id' must be a string.`,
				"string.max": `'template_id' must not exceed 50 characters.`,
				"any.required": `'template_id' is required.`,
			}),
			content: Joi.string().min(3).max(1000).optional().messages({
				"string.base": `'content' must be a string.`,
				"string.min": `'content' must be at least 3 characters long.`,
				"string.max": `'content' must not exceed 1000 characters.`,
			}),
			formula: Joi.string().min(3).max(200).optional().messages({
				"string.base": `'formula' must be a string.`,
				"string.min": `'formula' must be at least 3 characters long.`,
				"string.max": `'formula' must not exceed 200 characters.`,
			}),
			topic: Joi.string().valid("arithmetic", "geometry").optional().messages({
				"string.base": `'topic' must be a string.`,
				"any.only": `'topic' must be either 'arithmetic' or 'geometry'.`,
			}),
			level: Joi.string().valid("easy", "medium", "hard").optional().messages({
				"string.base": `'level' must be a string.`,
				"any.only": `'level' must be either 'easy', 'medium' or 'hard'.`,
			}),
			image: Joi.any().optional().messages({
				"any.required": `'image' is optional and should be a valid file.`,
			}),
			remove_image: Joi.boolean().optional().messages({
				"boolean.base": `'remove_image' must be a boolean.`,
			}),
		})
			.required()
			.or("content", "formula", "topic", "level", "image")
			.messages({
				"object.base": `Request body must be a valid JSON object.`,
				"any.required": `Request body is required.`,
				"object.missing": `At least one of the following fields must be provided for update: 'content', 'formula', 'topic', 'level', or 'image'.`,
			});

		return schema.validate(data, { abortEarly: false });
	},
};

module.exports = templateSchema;
