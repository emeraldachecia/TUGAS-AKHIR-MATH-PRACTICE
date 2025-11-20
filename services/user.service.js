const UserRepository = require("../repositories/user.repository");
const passwordHandler = require("../utils/password-handler");
const Connection = require("../configs/database.config");
const { filterHandler } = require("../utils/filter-handler");

class UserService {
    async find(data, type) {
		try {
			// variabel untuk menampung hasil query
            let result = {};

			// mengolah input data menjadi filter pencarian db
            const filters = filterHandler(data);
            
			switch (type) {
				// jika type "summary", maka ambil banyak data
				case "summary":
					result = await UserRepository.findMany(filters);
					break;
				
				// jika type "detail", ambil satu data
				case "detail":
					result = await UserRepository.findOne(filters);
					break;
				
				// jika type tidak dikenali, kembalikan error
				default:
					throw new Error(`Unsupported type: ${type}`);
			}

			return result;
		} catch (error) {
			throw error;
		}
    }

	async create(data, session) {
		let dbTrx;

		try {
			// memulai transaksi database baru
			dbTrx = await Connection.transaction();

			// mencari user yang sudah ada di db berdasarkan email
			const existing = await UserRepository.findOne(
				// membuat filter pencarian berdasarkan email
				filterHandler({ email: data.email })
			);

			// jika user sudah pernah menggunakan email
			if (existing) {
				// lempar error
				throw Object.assign(new Error("User with this email already exists."), {
					code: 409,
				});
			}

			// enkripsi password user sebelum disimpan ke db
			data.password = passwordHandler.encrypt(data.password);

			// simpan data user baru dalam transaksi
			const createdRow = await UserRepository.create(data, dbTrx);

			// commit transaksi karena semua proses berhasil
			await dbTrx.commit();

			// mengembalikan data user yang sudah berhasil dibuat
			return createdRow;
		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
	}

	async update(data, session) {
		let dbTrx;
		try {
			dbTrx = await Connection.transaction();

			// mencari user berdasarkan user_id yang dikirim 
			const existing = await UserRepository.findOne(
				// membuat filter pencarian berdasarkan user_id
				filterHandler({ user_id: data.user_id })
			);

			// jika user tidak ditemukan , kirim error 404
			if (!existing) {
				throw Object.assign(new Error("User not found."), { code: 404 });
			}

			// jika user adalah student dan mencoba update user lain, kirim error 403
			if (session.role === "student" && data.user_id !== session.user_id) {
				throw Object.assign(
					new Error("You are not authorized to update other users."),
					{ code: 403 }
				);
			}

			// jika ada permintaan update password
			if (data.password) {
				// jika yang update adalah student, perlu cek password lama
				if (session.role === "student") {
					// jika password lama tidak diberikan, kirim error 400
					if (!data.password.old) {
						throw Object.assign(
							new Error("Both old and new password are required."),
							{ code: 400 }
						);
					}

					// memverifikasi kecocokan password lama
					const isValid = passwordHandler.verify(
						existing.password,
						data.password.old
					);

					// jika password lama tidak cocok, kirim error 400
					if (!isValid) {
						throw Object.assign(new Error("Invalid old password."), {
							code: 400,
						});
					}
				}

				// enkripsi password baru sebelum disimpan
				data.password = passwordHandler.encrypt(data.password.new);
			}

			const updatedRow = await UserRepository.update(data, dbTrx);

			await dbTrx.commit();

			return updatedRow;

		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
	}

	async delete(data, session, req, res){
		let dbTrx;
		try {
			dbTrx = await Connection.transaction();

			// mencari user berdasarkan id yang dikirim
			const existing = await UserRepository.findOne(
				// membuat filter pencarian berdasarkan user_id
				filterHandler({ user_id: data.user_id })
			);

			// jika user tidak ditemukan, lempar error 404
			if (!existing) {
				throw Object.assign(new Error("User not found."), {
					code: 404,
				});
			}

			// melakukan penghapusan user dan mendapatkan jumlah row yang terhapus
			const deletedCount = await UserRepository.delete(data.user_id, dbTrx);

			// jika user menghapus dirinya sendiri
			if (data.id === session.user_id) {
				// commit transaksi setelah berhasil dihapus
				await dbTrx.commit();
				
				// panggil fungsi signout agar langsung keluar
				await this.signout(req, res);

				// mengembalikan true jika berhasil, dan false jika tidak berhasil
				return deletedCount > 0 ? true : false;
			}

			// jika bukan delet diri sendiri, commit transaksi biasa
			await dbTrx.commit();

			// kembalikan true jika berhasil delete
			return deletedCount > 0 ? true : false;
		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
	}

	// AUTENTIKASI
	async signin(data, req) {
		try {
			// mencari user berdasarkan email
			const existing = await UserRepository.findOne(
				filterHandler({ email: data.email })
			);

			// jika user tidak ditemukan, lempar error 404
			if (!existing) {
				throw Object.assign(new Error("User not found."), {
					code: 404,
				});
			}

			// memverifikasi password yang diinput dengan password yang ada di db
			const isValid = passwordHandler.verify(existing.password, data.password);

			// jika password tidak cocok, lempar error 401
			if (!isValid) {
				throw Object.assign(new Error("Invalid password."), { code: 401 });
			}

			// menyimpan data user ke session agar tetap login
			req.session.user = {
				user_id: existing.user_id,
				name: existing.name,
				email: existing.email,
				role: existing.role,
			};

			// mengembalikan pesan sukses beserta session user
			return { message: "Signin successful", session: req.session };
		} catch (error) {
			throw error;
		}
	}

	async signout(req, res) {
		try {
			// mengembalikan promise, karena proses destroy bersifat callback
			return new Promise((resolve, reject) => {
				// menghapus session yang sedang aktif
				req.session.destroy(async (err) => {
					// jika terjadi error saat destroy session, kirim error 500
					if (err) {
						return reject(
							Object.assign(new Error("Signout failed."), { code: 500 })
						);
					}

					// menghapus cookie session dari browser
					res.clearCookie(process.env.SESSION_NAME || "connect.sid");

					// kirim pesan suskses jika berhasil
					resolve({ message: "Signout successful." });
				});
			});
		} catch (error) {
			throw error;
		}
	}
}

module.exports = new UserService();