const ExerciseRepository = require("../repositories/exercise.repository");
const Connection = require("../configs/database.config");
const { filterHandler } = require("../utils/filter-handler");
const TemplateRepository = require("../repositories/template.repository");
const { generateQuestions } = require("../utils/generator");

class ExerciseService {
    async find(data, type, session) {
        try {
            // variabel penampung hasil query
			let result = {};

            // jika yang sedang akses adalah student,
            // maka data otomatis hanya untuk dirinya sendiri
            if (session.role === "student") {
                
                // menambahkan user_id ke filter,
                // agar hanya data miliknya yang muncul
				data.user_id = session.user_id;
			}
            
            // memproses input data menjadi format filter sequelize
			const filters = filterHandler(data);

            // menentukan jenis pencarian berdasarkan parameter 'type'
            switch (type) {
                
                // jika request untuk rekap/daftar exercise
                case "summary":
                    // panggil repository untuk mendapatkan banyak data
					result = await ExerciseRepository.findMany(filters);
                    break;
                
                // jika request detail exercise tertentu
                case "detail":
                    // panggil repository untuk mendapatkan 1 exercise
					result = await ExerciseRepository.findOne(filters);

                    // jika data tidak ditemukan, lempar error 404
					if (!result) {
						throw Object.assign(new Error("Exercise not found."), {
							code: 404,
						});
					}
                    break;
                
                // jika request untuk exercise yang sedang aktif
                case "active":
                    // panggil repository untuk data aktif
					result = await ExerciseRepository.findActive(filters);

                    // jika tidak ada exercise aktif
					if (!result) {
						throw Object.assign(new Error("Active exercise not found."), {
							code: 404,
						});
					}
                    break;
                
                // jika tipe tidak dikenali
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
			dbTrx = await Connection.transaction();

			const existing = await ExerciseRepository.findActive(
				filterHandler({
					user_id: session.user_id,
					status: "active",
				})
			);

			if (existing) {
				throw Object.assign(new Error("You already have an active exercise."), {
					code: 409,
				});
			}

			const templates = await TemplateRepository.findMany(
				filterHandler({ topic: data.topic, level: data.level })
			);

			if (!templates || templates.length === 0) {
				throw Object.assign(
					new Error("No templates found for the selected topic and level."),
					{ code: 404 }
				);
			}
			
			console.time("generate");
			const questions = generateQuestions(templates);
			console.timeEnd("generate");

			const exercise = {
				user_id: session.user_id,
				start_time: Date.now(),
				end_time: null,
				status: "active",
				topic: data.topic,
				level: data.level,
				questions: questions,
			};

			console.time("query");
			const createdRow = await ExerciseRepository.create(exercise, dbTrx);
			console.timeEnd("query");

			await dbTrx.commit();

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

            // mencari exercise aktif berdasarkan user_id, exercise_id, dan status
			const exercise = await ExerciseRepository.findActive(
				filterHandler({
					user_id: session.user_id,
					exercise_id: data.exercise_id,
					status: "active",
				})
			);

            // jika exercise tidak ditemukan, lempar error dengan kode 404
			if (!exercise) {
				throw Object.assign(new Error("Active exercise not found."), {
					code: 404,
				});
			}

            // ambil semua question_id dari exercise yang aktif
			const validQuestions = exercise.questions.map((q) => q.question_id);

            // looping setiap jawaban yang dikirim dari data
            for (const ans of data.answers) {
                // jika question_id jawaban tidak ada di exercise, lempar error 400
				if (!validQuestions.includes(ans.question_id)) {
					throw Object.assign(
						new Error(
							`Question ['${ans.question_id}'] does not belong to this exercise.`
						),
						{ code: 400 }
					);
				}

                // mencari question yang sesuai dengan question_id dari jawaban
				const question = exercise.questions.find(
					(q) => q.question_id === ans.question_id
				);

                // ambil semua option_id dari question yang ditemukan
				const validOptions = question.options.map((o) => o.option_id);

                // jika option_id jawaban tidak valid untuk question ini, lembpar 400
				if (!validOptions.includes(ans.option_id)) {
					throw Object.assign(
						new Error(
							`Option ['${ans.option_id}'] does not belong to question ['${ans.question_id}'].`
						),
						{ code: 400 }
					);
				}
			}

            // update data exercise di repository menggunakan transaksi yang sudah dibuat
			const updatedRow = await ExerciseRepository.update(data, dbTrx);

            // commit transaksi jika semua proses berhasil
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

			const existing = await ExerciseRepository.findOne(
				filterHandler({
					user_id: session.user_id,
					exercise_id: data.id,
				})
			);

			if (!existing) {
				throw Object.assign(new Error("Exercise not found."), {
					code: 404,
				});
			}

            // menghapus exercise menggunakan repository dan transaksi yang sudah dibuat
			const deletedCount = await ExerciseRepository.delete(data.id, dbTrx);

			await dbTrx.commit();

            // mengembalikan trus jika ada data yang terhapus, dan false jika tidak ada
			return deletedCount > 0 ? true : false;
		} catch (error) {
			if (dbTrx) await dbTrx.rollback();
			throw error;
		}
	}
}

module.exports = new ExerciseService();