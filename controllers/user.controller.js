const UserService = require("../services/user.service");
const responseHandler = require("../utils/response-handler");
const Validator = require("../utils/validators");

class UserController {
    async findSummary(req, res) {
        try {
            // memanggil service " find" dengan parameter dari query URL dan tipe "summary"
            const result = await UserService.find(req.query, "summary");

            // mengirim respons sukses ke client
            responseHandler(res, {
                code: 200,
                // hasil pencarian data dikirim sebagai payload
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
            // memanggil service " find" dengan parameter dari query URL dan tipe "detail"
			const result = await UserService.find(req.params, "detail");

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
            /**
			 * Karena create hanya untuk user dengan role admin,
			 * maka kita harus secara manual menambahkan attrubute
			 * 'role' di body dan memberi valuenya 'admin'
			 */
			req.body.role = "admin";

			const { error } = Validator.createUser(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await UserService.create(req.body, req.session.user);

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
            // validasi body request dan ambil hanya properti "error" dari hasil validasi
            const { error } = Validator.updateUser(req.body);

            // jika validasi gagal, lempar error 400
            if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await UserService.update(req.body, req.session.user);

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
			const result = await UserService.delete(req.params, req.session.user);

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
    
    // AUTENTIKASI
    async signup(req, res) {
		try {
			/**
			 * Karena signup hanya untuk user dengan role student,
			 * maka kita harus secara manual menambahkan attrubute
			 * 'role' di body dan memberi valuenya 'student'
			 */
			req.body.role = "student";

			const { error } = Validator.createUser(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await UserService.create(req.body);

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
    
    async signin(req, res) {
		try {
			const { error } = Validator.signin(req.body);

			if (error) {
				throw Object.assign(new Error(error.details[0].message), {
					code: 400,
				});
			}

			const result = await UserService.signin(req.body, req);

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

	async signout(req, res) {
		try {
			const result = await UserService.signout(req, res);

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

module.exports = new UserController();