// ======================================================================
// OPERATOR DEFINITIONS
// ======================================================================
const OPERATORS = {
	"+": { content: "+", formula: "+" },
	"-": { content: "-", formula: "-" },
	"*": { content: "x", formula: "*" },
	"/": { content: "÷", formula: "/" },
};

// ======================================================================
// RANDOM & NUMBER HELPERS
// ======================================================================

// integer random dalam rentang
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// float random 2 digit
function randFloat(min, max) {
	return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// format angka agar selalu 2 digit jika desimal
function formatNumber(num) {
	if (Number.isInteger(num)) return String(num);
	return num.toFixed(2);
}

// ======================================================================
// SHUFFLE ARRAY (Fisher-Yates)
// ======================================================================
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// ======================================================================
// PLACEHOLDER FUNCTIONS
// ======================================================================

// detect placeholder seperti {a}, {b}, {opt1}, {opt2}, dsb
function extractPlaceholders(str) {
	const regex = /\{(.*?)\}/g;
	const list = [];
	let match;

	while ((match = regex.exec(str)) !== null) {
		list.push(match[1]);
	}
	return list;
}

// generate nilai random utk masing-masing placeholder
function generateValueForPlaceholder(name) {
	if (name.startsWith("opt")) {
		const keys = Object.keys(OPERATORS);
		return keys[randInt(0, keys.length - 1)];
	}

	return randInt(1, 20);
}

function generatePlaceholderValues(placeholders) {
	const result = {};

	for (const ph of placeholders) {
		result[ph] = generateValueForPlaceholder(ph);
	}

	return result;
}

function applyValuesToContent(str, values) {
	let out = str;

	for (const key in values) {
		const val = values[key];

		if (key.startsWith("opt")) {
			const replacement = OPERATORS[val].content;
			out = out.replace(new RegExp(`\\{${key}\\}`, "g"), replacement);
		} else {
			out = out.replace(new RegExp(`\\{${key}\\}`, "g"), formatNumber(val));
		}
	}

	return out;
}

function applyValuesToFormula(str, values) {
	let out = str;

	for (const key in values) {
		const val = values[key];

		if (key.startsWith("opt")) {
			const replacement = OPERATORS[val].formula;
			out = out.replace(new RegExp(`\\{${key}\\}`, "g"), replacement);
		} else {
			out = out.replace(new RegExp(`\\{${key}\\}`, "g"), val);
		}
	}

	return out;
}

// ======================================================================
// FORMULA EVALUATION
// ======================================================================
function evaluateFormula(formulaStr) {
	return Function(`"use strict"; return (${formulaStr});`)();
}

// ======================================================================
// UNIQUE OPTION GENERATOR
// ======================================================================
function generateOptions(correctAnswer) {
	const correctStr = formatNumber(correctAnswer);
	const set = new Set([correctStr]);

	while (set.size < 4) {
		const variant = correctAnswer + randInt(-10, 10);
		const formatted = formatNumber(variant);

		if (!set.has(formatted)) {
			set.add(formatted);
		}
	}

	const arr = Array.from(set).map((content) => ({
		content,
		is_correct: content === correctStr,
	}));

	return shuffle(arr);
}

// ======================================================================
// MAIN GENERATOR FUNCTION
// ======================================================================
function generateQuestions(templates) {
	const results = [];
	let selectedTemplates = [];

	if (templates.length >= 10) {
		selectedTemplates = shuffle([...templates]).slice(0, 10);
	} else {
		while (selectedTemplates.length < 10) {
			selectedTemplates.push(templates[randInt(0, templates.length - 1)]);
		}
	}

	for (const tpl of selectedTemplates) {
		const placeholders = extractPlaceholders(tpl.formula);
		const values = generatePlaceholderValues(placeholders);

		const contentFilled = applyValuesToContent(tpl.content, values);
		const formulaFilled = applyValuesToFormula(tpl.formula, values);

		const answer = evaluateFormula(formulaFilled);
		const options = generateOptions(answer);

		results.push({
			template_id: tpl.template_id, // ← DITAMBAHKAN DI SINI
			content: contentFilled,
			options,
		});
	}

	return results;
}

module.exports = generateQuestions;
