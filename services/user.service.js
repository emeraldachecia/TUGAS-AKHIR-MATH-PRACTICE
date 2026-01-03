const UserRepository = require("../repositories/user.repository");
const ExerciseRepository = require("../repositories/exercise.repository");
const passwordHandler = require("../utils/password-handler");
const Connection = require("../configs/database.config");
const { filterHandler } = require("../utils/filter-handler");
const {
    ExerciseModel,
    QuestionModel,
    OptionModel,
    UserModel,
    TemplateModel,
} = require("../models");
 
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
		try {
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
			const createdRow = await UserRepository.create(data);

			// mengembalikan data user yang sudah berhasil dibuat
			return createdRow;
		} catch (error) {
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
				// panggil fungsi signout agar langsung keluar
				await this.signout(req, res);
			}

			// jika bukan delete diri sendiri, commit transaksi biasa
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

					// kirim pesan sukses jika berhasil
					resolve({ message: "Signout successful." });
				});
			});
		} catch (error) {
			throw error;
		}
	}

	async adminDashboard() {
		try {
			const totalTemplates = await TemplateModel.count();
			const users = await UserModel.findAll({ raw: true });
			const exercises = await ExerciseModel.findAll({
				include: [
					{
						model: QuestionModel,
						as: "questions",
						include: [
							{
								model: OptionModel,
								as: "options",
							},
						],
					},
				],
			});

			// hitung score tiap exercise
			const exerciseScoreList = exercises.map((ex) => {
				let correct = 0;
				const totalQ = ex.questions.length;

				for (const q of ex.questions) {
					const ok = q.options.some((o) => o.is_selected && o.is_correct);
					if (ok) correct++;
				}

				return {
					user_id: ex.user_id,
					score: totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0,
				};
			});

			// hitung total score per user
			const totalScoreMap = new Map(); // user_id → total_score

			for (const row of exerciseScoreList) {
				if (!totalScoreMap.has(row.user_id)) totalScoreMap.set(row.user_id, 0);
				totalScoreMap.set(
					row.user_id,
					totalScoreMap.get(row.user_id) + row.score
				);
			}

			// konvert Map → array
			const totalScoresList = [...totalScoreMap.values()];

			// rata-rata semua score user
			const avgScoreAll =
				totalScoresList.length > 0
					? Math.round(
							totalScoresList.reduce((a, b) => a + b, 0) /
								totalScoresList.length
					  )
					: 0;

			// top 10 berdasarkan total score
			const rawTop = [...totalScoreMap.entries()]
				.map(([user_id, total_score]) => ({ user_id, total_score }))
				.sort((a, b) => b.total_score - a.total_score)
				.slice(0, 10);

			const topUserIds = rawTop.map((t) => t.user_id);

			const topUsersDb = await UserModel.findAll({
				where: { user_id: topUserIds },
				raw: true,
			});

			const top10 = rawTop.map((entry) => {
				const u = topUsersDb.find((x) => x.user_id === entry.user_id);
				return {
					student_id: entry.user_id,
					name: u ? u.name : "(unknown)",
					total_score: entry.total_score,
				};
			});

			return {
				total_users: users.length,
				total_templates: totalTemplates,
				total_exercises: exercises.length,
				avg_score_all: avgScoreAll, // ✔ avg total score antar user
				top10,
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async studentDashboard(session) {
		try {
			const formatResult = (rows) => {
				// menghitung skor setiap exercise
				const scores = rows.map((ex) => {
					let correct = 0;
					const totalQ = ex.questions.length;

					for (const q of ex.questions) {
						const ok = q.options.some((o) => o.is_selected && o.is_correct);
						if (ok) correct++;
					}

					return totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
				});

				// total exercise yang dikerjakan
				const calculateTotal = (topic, level) => {
					return rows.filter((ex) => {
						if (topic && ex.topic !== topic) return false;
						if (level && ex.level !== level) return false;
						return true;
					}).length;
				};

				// total score yang diperoleh
				const calculateSumScore = (topic, level) => {
					let sum = 0;

					rows.forEach((ex, i) => {
						if (topic && ex.topic !== topic) return;
						if (level && ex.level !== level) return;
						sum += scores[i];
					});

					return sum;
				};

				// rata-rata score yang didapat
				const calculateAvg = (topic, level) => {
					const total = calculateTotal(topic, level);
					if (total === 0) return 0;

					const sum = calculateSumScore(topic, level);
					return Math.round(sum / total);
				};

				return {
					overall: {
						total_exercise: calculateTotal(),
						total_score: calculateSumScore(),
						average_score: calculateAvg(),
					},
					arithmetic: {
						total_exercise: calculateTotal("arithmetic"),
						total_score: calculateSumScore("arithmetic"),
						average_score: calculateAvg("arithmetic"),

						easy: {
							total_exercise: calculateTotal("arithmetic", "easy"),
							total_score: calculateSumScore("arithmetic", "easy"),
							average_score: calculateAvg("arithmetic", "easy"),
						},
						medium: {
							total_exercise: calculateTotal("arithmetic", "medium"),
							total_score: calculateSumScore("arithmetic", "medium"),
							average_score: calculateAvg("arithmetic", "medium"),
						},
						hard: {
							total_exercise: calculateTotal("arithmetic", "hard"),
							total_score: calculateSumScore("arithmetic", "hard"),
							average_score: calculateAvg("arithmetic", "hard"),
						},
					},
					geometry: {
						total_exercise: calculateTotal("geometry"),
						total_score: calculateSumScore("geometry"),
						average_score: calculateAvg("geometry"),

						easy: {
							total_exercise: calculateTotal("geometry", "easy"),
							total_score: calculateSumScore("geometry", "easy"),
							average_score: calculateAvg("geometry", "easy"),
						},
						medium: {
							total_exercise: calculateTotal("geometry", "medium"),
							total_score: calculateSumScore("geometry", "medium"),
							average_score: calculateAvg("geometry", "medium"),
						},
						hard: {
							total_exercise: calculateTotal("geometry", "hard"),
							total_score: calculateSumScore("geometry", "hard"),
							average_score: calculateAvg("geometry", "hard"),
						},
					},
				};
			};

			const exercises = await ExerciseRepository.getDashboard(session.user_id);

			return formatResult(exercises);
		} catch (error) {
			throw error;
		}
	}
}

module.exports = new UserService();