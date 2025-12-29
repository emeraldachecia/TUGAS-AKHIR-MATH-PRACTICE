const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const Connection = require("./database.config");

/**
 * Konfigurasi session untuk aplikasi Express.
 */
module.exports = session({
	/**
	 * Secret key yang digunakan untuk mengenkripsi session.
	 * Session ini dienkripsi agar tidak bisa dibaca atau dimodifikasi oleh pengguna secara langsung.
	 * Jika tidak ada environment variable SECRET_KEY, maka akan menggunakan nilai default "supersecret".
	 */
	secret: process.env.SECRET_KEY || "supersecret",

	/**
	 * Mengatur apakah session akan disimpan ulang ke database walaupun tidak ada perubahan.
	 * - true  -> Setiap request akan memperbarui sesi, bahkan jika tidak ada perubahan.
	 *           Ini dapat memperpanjang masa aktif sesi, tetapi juga meningkatkan beban database.
	 * - false -> Sesi hanya akan diperbarui ke database jika ada perubahan pada session.
	 *           Ini lebih efisien dan mengurangi beban database.
	 */
	resave: false,

	/**
	 * Menentukan apakah session baru (yang belum diinisialisasi) harus disimpan ke database.
	 * - true  -> Semua session (termasuk yang kosong) akan langsung disimpan ke database.
	 *           Ini tidak efisien dan bisa memenuhi database dengan data tidak berguna.
	 * - false -> Session baru hanya akan disimpan jika sudah ada perubahan data di dalamnya.
	 *           Ini adalah pilihan terbaik untuk menghemat resource database.
	 */
	saveUninitialized: false,

	/**
	 * Mengatur agar session diperpanjang setiap kali user melakukan request.
	 * Jika diaktifkan (true), session akan terus diperpanjang selama user tetap aktif.
	 * Jika dinonaktifkan (false), session akan kedaluwarsa berdasarkan maxAge.
	 */
	rolling: true,

	/**
	 * Menghapus session dari database saat req.session = null.
	 * - "destroy" -> Session benar-benar dihapus dari database.
	 * - "keep"    -> Session tetap ada di database tetapi tidak aktif.
	 */
	unset: "destroy",


	/**
	 * Konfigurasi penyimpanan session di database menggunakan SequelizeStore.
	 * Ini memungkinkan session tetap bertahan meskipun server di-restart.
	 */
	store: new SequelizeStore({
		// Menggunakan koneksi database yang telah dikonfigurasi di models/index.js
		db: Connection,

		// Nama tabel untuk menyimpan session, default name "Sessions"
		tableName: "session",

		/**
		 * Waktu kedaluwarsa session di database.
		 * Dalam hal ini, session akan otomatis dihapus setelah 24 jam = 86400000 ms
		 */
		expiration: 24 * 60 * 60 * 1000,

		/**
		 * Interval waktu untuk memeriksa dan menghapus session yang telah kedaluwarsa.
		 * Dalam hal ini, setiap 15 menit session yang expired akan dihapus dari database.
		 */
		checkExpirationInterval: 15 * 60 * 1000, // 15 menit = 900000 ms
	}),
});
