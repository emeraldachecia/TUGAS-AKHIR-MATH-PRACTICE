// daftar operator yang bisa muncul, untuk tampilan (content)
const OPERATORS = {
	"+": { content: "+", formula: "+" },
	"-": { content: "-", formula: "-" },
	"*": { content: "x", formula: "*" },
	"/": { content: "÷", formula: "/" },
};

// integer random dalam rentang
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


// format angka agar selalu 2 digit jika desimal
function formatNumber(num) {
	if (Number.isInteger(num)) return String(num);
	return num.toFixed(2);
}

// digunakan untuk mengacak array jawaban
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// mengambil semua placeholder {} dari string
function extractPlaceholders(str) {
    // mencari yang ada di dalam {} dengan regex
    const regex = /\{(.*?)\}/g;
    // set digunakan untuk menghapus duplikasi
    const set = new Set();
    // variabel untuk menyimpan hasil regex
	let match;

    // mencari kecocokan
    while ((match = regex.exec(str)) !== null) {
        // mengambil elemen di dalam {}
		set.add(match[1]);
    }
    // set dikonversi menjadi array
	return Array.from(set);
}

// generate nilai random utk masing-masing placeholder
function generateValueForPlaceholder(name) {
    // jika placeholder mulai dengan "opt", maka ganti dengan operator
    if (name.startsWith("opt")) {
        // ambil semua operator
        const keys = Object.keys(OPERATORS);
        // pilih salah satu secara random
		return keys[randInt(0, keys.length - 1)];
	}

    // jika placeholder adalah angka, maka ganti antar 1 - 20
	return randInt(1, 20);
}

// menghasilkan object yang berisi semua placeholder dengan nilai random
function generatePlaceholderValues(placeholders) {
    // object hasil
	const result = {};

    // untuk semua placeholders
    for (const ph of placeholders) {
        // simpan nilai randomnya
		result[ph] = generateValueForPlaceholder(ph);
	}

	return result;
}

// mengisi content soal dengan nilai placeholder
function applyValuesToContent(str, values) {
    // salin string input
    let out = str;
    
    for (const key in values) {
        // ambil nilai placeholder
        const val = values[key];
        // jika operator maka ambil simbol content
        // jika angka, gunakan format angka
		const replacement = key.startsWith("opt")
			? OPERATORS[val].content
			: formatNumber(val);

        // ganti semua {placeholder} di content
		out = out.replaceAll(`{${key}}`, replacement);
	}
	return out;
}

// mengisi formula dengan nilai placeholder
function applyValuesToFormula(str, values) {
	let out = str;
    for (const key in values) {
        // nilai placeholder
        const val = values[key];
        
        // jika operator, maka gunakan simbol perhitungan asli
        const replacement = key.startsWith("opt")
            ? OPERATORS[val].formula
            : val;

        // ganti semua placeholder di formula
		out = out.replaceAll(`{${key}}`, replacement);
	}
	return out;
}

// menghitung hasil formula
function evaluateFormula(formulaStr) {
    // membuat fungsi dinamis yang mengeksekusi formula
	return Function(`"use strict"; return (${formulaStr});`)();
}

// membuat 4 opsi dengan 1 jawaban benar
function generateOptions(correctAnswer) {
    const correctStr = formatNumber(correctAnswer);
    // set untuk menyimpan opsi
	const set = new Set([correctStr]);

    // tambah opsi hingga jumlahnya 4
    while (set.size < 4) {
        // buat pengecoh jawaban lainnya dengan menambahkan jawaban benar
        // dengan angka antara -10 sampai +10
        const variant = correctAnswer + randInt(-10, 10);
        // format angka
		const formatted = formatNumber(variant);

        // digunakan untuk mengecek nilai opsi jawaban, agar tidak sama
		if (!set.has(formatted)) {
			set.add(formatted);
		}
	}

    // konversi set menjadi array objek
	const arr = Array.from(set).map((content) => ({
		content,
		is_correct: content === correctStr,
	}));

    // acak opsi
	return shuffle(arr);
}

// membuat 10 soal
function generateQuestions(templates) {
    const results = [];
    // list template yang akan dipakai
	let selectedTemplates = [];

    // jika template cukup banyak, pilih 10 secara acak
    if (templates.length >= 10) {
        // acak, lalu ambil 10 pertama
		selectedTemplates = shuffle([...templates]).slice(0, 10);
    } else {
        // jika template kurang dari 10, pilih rando dengan duplikasi
        while (selectedTemplates.length < 10) {
            // pilih template secara acak
			selectedTemplates.push(templates[randInt(0, templates.length - 1)]);
		}
	}

    // untuk setiap template yang terpilih
    for (const tpl of selectedTemplates) {
        // generate nilai placeholder
        const values = generatePlaceholderValues(tpl.placeholders);

        // isi content soal
        const contentFilled = applyValuesToContent(tpl.content, values);

        // isi formula
		const formulaFilled = applyValuesToFormula(tpl.formula, values);

        // hitung jawaban benar
        const answer = evaluateFormula(formulaFilled);

        // buat opsi jawaban
		const options = generateOptions(answer);

        // masukkan ke hasil akhir
		results.push({
			template_id: tpl.template_id,
			content: contentFilled,
			options,
		});
	}

	return results;
}

module.exports = { generateQuestions, extractPlaceholders };
