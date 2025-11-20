const responseHandler = require("../utils/response-handler");

const authorization = (allowedRoles = []) => {
	return async (req, res, next) => {
        try {
            // mengambil data user dari session (jika sudah login)
			const { user } = req.session;

			// Jika belum login
			if (!user) {
				// Kalau dia akses halaman biasa (bukan API), redirect ke /auth
				if (!req.originalUrl.startsWith("/api")) {
					return res.redirect("/auth");
				}

				// Kalau dia akses API, tetap balikin JSON error
				return responseHandler(res, {
					code: 401,
					errors: "Unauthorized. Please signin first.",
				});
			}

            // jika sudah login tapi role tidak sesuai dengan yang diizinkan
            if (
                // pastikan allowedRoles array
                Array.isArray(allowedRoles) &&
                // hanya cek kalau array tidak kosong
                allowedRoles.length > 0 &&
                // role user tidak ada dalam allowedRoles
				!allowedRoles.includes(user.role)
            ) { 
                // kirim respon 403 Forbidden
				return responseHandler(res, {
					code: 403,
					errors:
						"Forbidden. You don't have permission to access this resource.",
				});
			}

			next();
		} catch (error) {
			return responseHandler(res, {
				code: 500,
				errors: "Internal Server Error.",
			});
		}
	};
};

module.exports = authorization;
