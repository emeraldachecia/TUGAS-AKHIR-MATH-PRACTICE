// mengambil objek 'Op' dari sequelize
const { Op } = require("sequelize");

// menerima objek 'condition', default objek kosong
function filterHandler(condition = {}) {
    // variable untuk menyimpan hasil filter akhir
    let filters = {};
    // array untuk menyimpan semua kondisi 'AND' yang digabungkan
    const andConditions = [];
  
    // looping semua key yang ada di objek 'condition' sesuai yang dikirim user
    for (const key in condition) {
        // memastikan key adalah properti asli dari objek 'condition'
		if (!Object.hasOwn(condition, key)) continue;

        // membuat objek tiap kondisi
        andConditions.push({
            [key]: {
                // nilai harus sama persis dengan nilai yang dikirim
                [Op.eq]: condition[key]
            },
		});
	}

    // mengumpulkan jika ada minimal 1 kondisi yang berhasil
    if (andConditions.length > 0) {
        // menggabungkan semua kondisi menggunakan operator [Op.and]
		filters = { [Op.and]: andConditions };
	}

	return filters;
}

module.exports = { filterHandler };