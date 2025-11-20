const Joi = require("joi");

const userSchema = {
    signin(data) {
        // membuat schema validasi untuk signin
        const schema = Joi.object({
            // validasi field email
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.max(100)
				.required()
				.messages({
					"string.base": `'email' must be a string.`,
					"string.email": `please enter a valid 'email' address.`,
					"string.max": `'email' must not exceed 100 characters.`,
					"any.required": `'email' is required.`,
                }),
            // validasi field password
			password: Joi.string().min(8).max(50).required().messages({
				"string.base": `'password' must be a string.`,
				"string.min": `'password' must be at least 8 characters long.`,
				"string.max": `'password' must not exceed 50 characters.`,
				"any.required": `'password' is required.`,
			}),
		})
			.required()
			.messages({
				"object.base": `request body must be a valid JSON object.`,
				"any.required": `request body is required.`,
			});
        
        // menjalankan validasi
		return schema.validate(data, { abortEarly: false });
	},
    
    // skema untuk membuat user baru
    createUser(data) {
        // validasi skema untuk create account
		const schema = Joi.object({
			name: Joi.string().min(3).max(100).required().messages({
				"string.base": `'name' must be a string.`,
				"string.min": `'name' must be at least 3 characters long.`,
				"string.max": `'name' must not exceed 100 characters.`,
				"any.required": `'name' is required.`,
            }),
            
            // validasi email user
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.max(100)
				.required()
				.messages({
					"string.base": `'email' must be a string.`,
					"string.email": `please enter a valid 'email' address.`,
					"string.max": `'email' must not exceed 100 characters.`,
					"any.required": `'email' is required.`,
                }),
            
            // validasi password user
			password: Joi.string().min(8).max(50).required().messages({
				"string.base": `'password' must be a string.`,
				"string.min": `'password' must be at least 8 characters long.`,
				"string.max": `'password' must not exceed 50 characters.`,
				"any.required": `'password' is required.`,
            }),
            
            // validasi role user (admin atau student)
			role: Joi.string().valid("admin", "student").required().messages({
				"string.base": `'role' must be a string.`,
				"any.only": `'role' must be either 'admin' or 'student'.`,
				"any.required": `'role' is required.`,
			}),
		})
			.required()
			.messages({
				"object.base": `request body must be a valid JSON object.`,
				"any.required": `request body is required.`,
			});

		return schema.validate(data, { abortEarly: false });
	},

	updateUser(data) {
        const schema = Joi.object({
            // user_id tidak boleh kosong dan tidak lebih dari 50 karakter
			user_id: Joi.string().max(50).required().messages({
				"string.base": `'user_id' must be a string.`,
				"string.max": `'user_id' must not exceed 50 characters.`,
				"any.required": `'user_id' is required.`,
            }),
            
            // validasi update nama
			name: Joi.string().min(3).max(100).optional().messages({
				"string.base": `'name' must be a string.`,
				"string.min": `'name' must be at least 3 characters long.`,
				"string.max": `'name' must not exceed 100 characters.`,
            }),
            
            // validasi update email
			email: Joi.string()
				.email({ tlds: { allow: false } })
				.max(100)
				.optional()
				.messages({
					"string.base": `'email' must be a string.`,
					"string.email": `please enter a valid 'email' address.`,
					"string.max": `'email' must not exceed 100 characters.`,
                }),
            
            // validasi perubahan password
            password: Joi.object({
                
                // wajib mengisi password lama jika user mengganti password
				old: Joi.string().min(8).max(50).required().messages({
					"string.base": `'Old Password' must be a string.`,
					"string.min": `'Old Password' must be at least 8 characters long.`,
					"string.max": `'Old Password' must not exceed 50 characters.`,
					"any.required": `'Old Password' is required.`,
                }),
                
                // wajib mengisi password baru
				new: Joi.string().min(8).max(50).required().messages({
					"string.base": `'New Password' must be a string.`,
					"string.min": `'New Password' must be at least 8 characters long.`,
					"string.max": `'New Password' must not exceed 50 characters.`,
					"any.required": `'New Password' is required.`,
				}),
			})
				.optional()
				.messages({
					"object.base": `password must be a valid JSON object.`,
				}),
		})
            .required()
            // setidaknya salah satu harus ada
			.or("name", "email", "password")
			.messages({
				"object.base": `request body must be a valid JSON object.`,
				"any.required": `request body is required.`,
				"object.missing": `'user_id' and at least one of this fields ['name', 'email', 'password'] must be provided for updates.`,
			});

		return schema.validate(data, { abortEarly: false });
	},
};

module.exports = userSchema;
