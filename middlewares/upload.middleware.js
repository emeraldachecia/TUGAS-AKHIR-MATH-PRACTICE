const multer = require("multer");
const path = require("path");

// Konfigurasi penyimpanan sementara (file akan dipindahkan manual di service)
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images/temp"); // folder sementara
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

// Filter tipe file
const fileFilter = (req, file, cb) => {
	const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
	if (!allowedTypes.includes(file.mimetype)) {
		return cb(new Error("Only JPG, PNG, or WEBP files are allowed."), false);
	}
	cb(null, true);
};

// Batasi ukuran file (misal 2MB)
const limits = { fileSize: 2 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
