const Connection = require("../configs/database.config");
const Sequelize = require("sequelize");
const { UserModel } = require("../models");

class UserRepository {

    async findMany(filters) {
        try {
            // menggunakan UserModel.findAll untuk mencari hasil sesuai dengan
            // kondisi filter yang dikirim ke function pada 'where'
            return await UserModel.findAll({
                where: filters,
                // list kolom yang diambil
                attributes: ["user_id", "name", "email", "role"],
                // mengambil hasil dalam bentuk object js
                raw: true,
            });
        } catch (error) {
            // melempar error ke function yang memanggil
            throw error;
        }
    }

    async findOne(filters) {
        try {
            // menggunakan UserModel.findOne untuk mencari hasil sesuai dengan
            // kondisi filter yang dikirim ke function pada 'where'
            return await UserModel.findOne({
                where: filters,
                raw: true,
            });
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            // mencari satu user berdasarkan email
            return await UserModel.findOne({
                // mengambil data email yang sama seperti yang diminta
                where: { email: email },
            });
        } catch (error) {
            throw error;
        }
    }

    async create(data, dbTrxGlobal) {
        // variabel untuk menyimpan transaksi yang dipakai
        let dbTrx;

        try {
            dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

            // insert data user ke database dan pastikan prosesnya ikut transaksi
            const row = await UserModel.create(data, { transaction: dbTrx });

            // jika transaksi dibuat sendiri, maka di commit disini (dimasukkan ke db)
            if (!dbTrxGlobal) await dbTrx.commit();

            return row;
        } catch (error) {
            // jika ada error dan transaksi kita bikin sendiri, maka tarik transaksinya
            if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();

            // error ini digunakan untuk data duplikat, sequelize akan beri pesan
            // error UniqueConstrainError
            if (error instanceof Sequelize.UniqueConstraintError) {
                throw Object.assign(new Error(error.errors[0].message), { code: 400 });
            }

            // jika errornya bukan duplikat, bisa dilempar langsung ke fungsi yang memanggil
            throw error;
        }
    }

    async update(data, dbTrxGlobal) {
        let dbTrx;

        try {
            dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

            // memisahkan user_id agar tidak diupdate
            // sisanya masuk ke dalam data yang akan diupdate
            const { user_id, ...user } = data;

            // menjalankan update ke tabel user
            const row = await UserModel.update(user, {
                // update berdasarkan id
                where: { user_id: user_id },
                // memasukkan kedalam transaksi
                transaction: dbTrx,
            });

            if (!dbTrxGlobal) await dbTrx.commit();

            return row;
        } catch (error) {
            if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();

			if (error instanceof Sequelize.UniqueConstraintError) {
				throw Object.assign(new Error(error.errors[0].message), { code: 400 });
			}

			throw error;
        }
    }

    async delete(userId, dbTrxGlobal) {
        let dbTrx;
        try {
            dbTrx = dbTrxGlobal ? dbTrxGlobal : await Connection.transaction();

            // menghapus data user berdasarkan id
            // hasil merupakan angka (jumlah row yang kehapus)
            const count = await UserModel.destroy({
                // target user yang mau dihapus
                where: { user_id: userId },
                transaction: dbTrx,
            });

			if (!dbTrxGlobal) await dbTrx.commit();

            return count;
        } catch (error) {
            if (dbTrx && !dbTrxGlobal) await dbTrx.rollback();
			throw error;
        }
    }
}

module.exports = new UserRepository();