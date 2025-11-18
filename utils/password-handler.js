const crypto = require("crypto");

const passwordHandler = {
    // mengubah password menjadi hash
    encrypt(plainPassword) {
        // mengecek input agar tidak error
        if (!plainPassword || typeof plainPassword !== "string") {
            throw new Error("Password harus berupa string.");
        }

        // hasil berupa hex string (angka-angka + huruf)
        const hash = crypto
            // menggunakan algoritma hash
            .createHash("sha256")
            // memasukkan password asli
            .update(plainPassword)
            // mengeluarkan dalam format hex
            .digest(hex)
        
        // return hasil hash
        return hash;
    },

    // memverifikasi password
    verify(storedHash, plainPassword) {
        if (!storedHash || !plainPassword) return false;

        // hash ulang password yang sudah dimasukkan
        const newHash = crypto
            .createHash("sha256")
            .update(plainPassword)
            .digest(hex)
        
        // membandingkan hash baru dengan hash yang disimpan
        return storedHash === newHash;
    },
};

module.exports = passwordHandler;