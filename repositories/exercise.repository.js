const Connection = require("../configs/database.config");
const Sequelize = require("sequelize");
const {
    ExerciseModel,
    QuestionModel,
    OptionModel,
    UserModel,
    TemplateModel,
} = require("../models");

class ExerciseRepository {
    async findMany(filters) {
        try {
            // mengambil semua exercise dari db sesuai dengan filter yang dikirim
            const rows = await ExerciseModel.findAll({
                // kondisi pencarian
                where: filters,
                // mengambil kolom-kolom yang ada di bawah
				attributes: ["exercise_id", "start_time", "topic", "level", "status"],
				include: [
                    {   
                        // join ke tabel question
                        model: QuestionModel,
                        // jika exercise tidak punya question, maka tidak dimunculkan
						required: true,
						include: [
                            {   
                                // join ke tabel option
                                model: OptionModel,
                                // question tanpa option tidak dimunculkan
								required: true,
							},
						],
					},
				],
			});

            // fungsi untuk merapikan format hasil query
			const formatResult = (rows) => {
                return rows.map((exercise) => {
                    // nilai default jika belum submitted
					let score = null;

                    // jika latihan sudah di submit, maka hitung nilai
                    if (exercise.status === "submitted") {
                        // total jumlah soal
						const totalQuestions = exercise.questions.length;

                        // hitung jawaban yang benar
						let correctCount = 0;
                        for (const question of exercise.questions) {
                            
                            // mengecek apakah ada option yang dipilih DAN benar
							const hasCorrect = question.options.some(
                                (option) =>
                                    // jawaban pilihan user
                                    option.is_selected === true &&
                                    // jawaban benar
                                    option.is_correct === true
                            );
                            // tambahkan nilai, jika user memilih jawaban yang benar
							if (hasCorrect) correctCount++;
						}

                        // membulatkan perhitungan nilai
						score =
							totalQuestions > 0
								? Math.round((correctCount / totalQuestions) * 100)
								: 0;
					}

                    // format yang dikembalikan ke controller
					return {
						exercise_id: exercise.exercise_id,
						date: exercise.start_time,
						topic: exercise.topic,
						level: exercise.level,
						score: score,
					};
				});
			};

            // kembalikan hasil akhir
			return formatResult(rows);
		} catch (error) {
			throw error;
		}
    }
    
    async findOne(filters) {
        try {
            // mencari satu exercise berdasarkan filter
			const row = await ExerciseModel.findOne({
				where: filters,
				include: [
                    {
                        // join tabel question
						model: QuestionModel,
						required: true,
						separate: true,
						include: [
                            {
                                // join tabel template
								model: TemplateModel,
								attributes: ["template_id", "image"],
								required: true,
							},
                            {
                                // join tabel option
								model: OptionModel,
								required: true,
							},
						],
					},
				],
			});

            const formatResult = (exercise) => {
                // jika exercise tidak ditemukan kembalikan null
				if (!exercise) return null;

				// hitung jumlah total soal
				const totalQuestions = exercise.questions.length;
				let correctCount = 0;

                // loop semua soal untuk menghitung jawaban benar
				for (const question of exercise.questions) {
					const hasCorrect = question.options.some(
						(option) =>
                            option.is_selected === true &&
                            option.is_correct === true
					);
					if (hasCorrect) correctCount++;
				}

				const score =
					totalQuestions > 0
						? Math.round((correctCount / totalQuestions) * 100)
						: 0;

                // format response
				return {
					exercise_id: exercise.exercise_id,
					start_time: exercise.start_time,
					end_time: exercise.end_time,
					score: score,
					topic: exercise.topic,
					level: exercise.level,
                    status: exercise.status,
                    
                    // format semua soal
					questions: exercise.questions.map((question) => ({
						question_id: question.question_id,
						image: question.template.image,
                        content: question.content,
                        
                        // format semua option
						options: question.options.map((option) => ({
							option_id: option.option_id,
							content: option.content,
							is_selected: option.is_selected,
							is_correct: option.is_correct,
						})),
					})),
				};
			};

            // return hasil akhir
			return formatResult(row);
		} catch (error) {
			throw error;
		}
    }
    
    async findActive(filters) {
        try {
            // mencari satu data exercise sesuai filter
			const row = await ExerciseModel.findOne({
                where: filters,
                // kolom yang ingin ditampilkan dari tabel exercise
				attributes: [
					"exercise_id",
					"start_time",
					"end_time",
					"topic",
					"level",
					"status",
				],
				include: [
                    {
                        // join ke tabel question
                        model: QuestionModel,
                        // kolom yang ingin diambil dari question
						attributes: ["question_id", "template_id", "content"],
                        required: true,
                        // query untuk question dibuat terpisah
						separate: true,
						include: [
                            {
                                // join dengan tabel template
                                model: TemplateModel,
                                // kolom yang ingin diambil dari template
								attributes: ["template_id", "image"],
								required: true,
							},
                            {
                                // join dengan tabel option
                                model: OptionModel,
                                // kolom yang ingin diambil dari option
								attributes: ["option_id", "content"],
								required: true,
							},
						],
					},
				],
			});

            const formatResult = (exercise) => {
                // jika tidak ada exercise, kembalikan null
				if (!exercise) return null;

				return {
					exercise_id: exercise.exercise_id,
					start_time: exercise.start_time,
					topic: exercise.topic,
					level: exercise.level,
					status: exercise.status,
					questions: exercise.questions.map((question) => ({
						question_id: question.question_id,
						content: question.content,
						image: question.template.image,
						options: question.options.map((option) => ({
							option_id: option.option_id,
							content: option.content,
						})),
					})),
				};
			};

			return formatResult(row);
		} catch (error) {
			throw error;
		}
    }
    
    async create(data, dbTrxGlobal) {
		let dbTrx;
        try {
            // jika ada transaksi global, maka gunakan itu
            // jika tidak ada maka buat transaksi baru
			dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

            // insert ke tabel exercise untuk membuat latihan baru
			const newXrc = await ExerciseModel.create(
				{
					user_id: data.user_id,
					start_time: data.start_time,
					end_time: data.end_time,
					topic: data.topic,
					level: data.level,
					status: data.status,
                },
                // semua operasi wajib dalam transaksi
				{ transaction: dbTrx }
			);

            // loop setiap soal yang dikirim
            for (const question of data.questions) {
                // insert ke tabel question
				const newQst = await QuestionModel.create(
					{
						exercise_id: newXrc.exercise_id,
						template_id: question.template_id,
						content: question.content,
					},
					{ transaction: dbTrx }
				);

                // loop setiap opsi jawaban dari soal
                for (const option of question.options) {
                    // insert ke tabel option
					await OptionModel.create(
						{
							question_id: newQst.question_id,
							content: option.content,
							is_selected: option.is_selected,
							is_correct: option.is_correct,
						},
						{ transaction: dbTrx }
					);
				}
			}

            // kalau transaksi lokal, lakukan commit
			if (!dbTrxGlobal) await dbTrx.commit();

            // return data exercise baru yang dibuat
			return newXrc;
		} catch (error) {
			if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();

            // jika error karena ada duplikat, lempar error dengan kode 400
			if (error instanceof Sequelize.UniqueConstraintError) {
				throw Object.assign(new Error(error.errors[0].message), { code: 400 });
			}

			throw error;
		}
    }
    
    async update(data, dbTrxGlobal) {
		let dbTrx;
		try {
			dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

            // update tabel exercise
			const row = await ExerciseModel.update(
                {
                    // waktu latihan selesai
                    end_time: Date.now(),
                    
                    // status setelah user mengirim jawaban
					status: "submitted",
				},
                {
                    // mencari exercise berdasarkan id
                    where: { exercise_id: data.exercise_id },
                    
                    // harus dalam transaksi
					transaction: dbTrx,
				}
			);

            // loop setiap jawaban yang dikirim user
            for (const ans of data.answers) {
                
                // update tabel option
                await OptionModel.update(
                    // menandai user memilih opsi ini
					{ is_selected: true },
                    {
                        // pilihan yang diperbarui harus:
                        // - sesuai dengan question_id yang sedang diproses
                        // - sesuai option_id yang dipilih user
						where: {
							question_id: ans.question_id,
							option_id: ans.option_id,
						},
						transaction: dbTrx,
					}
				);
			}

            // kembalikan hasil update exercise
			return row;
		} catch (error) {
			throw error;
		}
    }
    
    async delete(exerciseId, dbTrxGlobal) {
		let dbTrx;
		try {
			dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

            // menghapus baris exercise berdasarkan exercise_id
            const count = await ExerciseModel.destroy({
                
                // kondisi baris yang akan dihapus
                where: { exercise_id: exerciseId },
                
                // proses dilakukan dalam transaksi
				transaction: dbTrx,
			});

            // jika transaksi dibuat sendiri, commit
			if (!dbTrxGlobal) await dbTrx.commit();

            // return jumlah baris yang terhapus
			return count;
		} catch (error) {
			if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();
			throw error;
		}
	}
}

module.exports = new ExerciseRepository();