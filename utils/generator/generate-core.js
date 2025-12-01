const { create, all } = require("mathjs");

// membuat instance mathjs tanpa override fungsi bawaan
const math = create(all, {
	number: "number", // hasil berupa number JS biasa (bukan BigNumber)
	precision: 64,
});

const randomInt = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

// Fisher–Yates shuffle
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

const OPERATOR_LIST = ["+", "-", "*", "/", "%"];

// Semua konstanta yang bisa digunakan dalam template
const CONSTANT_MAP = {
	pi: Math.PI,
	phi: (1 + Math.sqrt(5)) / 2,
	e: Math.E,
	sqrt2: Math.SQRT2,
	sqrt3: Math.sqrt(3),
	half: 1 / 2,
	quarter: 1 / 4,
};

function extractPlaceholders(content) {
	return content.match(/{(.*?)}/g) || [];
}

function generateValueForKey(key) {
	if (key.includes("opt")) {
		return OPERATOR_LIST[randomInt(0, OPERATOR_LIST.length - 1)];
	}
	if (CONSTANT_MAP[key] !== undefined) {
		return CONSTANT_MAP[key];
	}
	return randomInt(1, 25);
}

function generateValues(placeholders) {
	const values = {};
	placeholders.forEach((ph) => {
		const key = ph.replace("{", "").replace("}", "");
		values[key] = generateValueForKey(key);
	});
	return values;
}

function buildExpression(formula, values) {
	let expr = formula;

	// Replace operator
	for (const k in values) {
		if (typeof values[k] === "string" && OPERATOR_LIST.includes(values[k])) {
			expr = expr.replaceAll(k, values[k]);
		}
	}

	// Replace numbers & constants
	for (const k in values) {
		if (typeof values[k] === "number") {
			expr = expr.replaceAll(k, values[k]);
		}
	}

	// Replace global constants
	for (const k in CONSTANT_MAP) {
		expr = expr.replaceAll(k, CONSTANT_MAP[k]);
	}

	return expr;
}

function evalFormula(formula, values) {
	const expr = buildExpression(formula, values);

	try {
		// gunakan math.evaluate() yang jauh lebih cepat & aman dibanding Function()
		return math.evaluate(expr);
	} catch (err) {
		console.error("Formula Error:", formula, values, err);
		return null;
	}
}

function optionCountByLevel(level) {
	return level === "easy" ? 3 : level === "medium" ? 4 : 5;
}

function generateOptions(correct, count) {
	const opts = new Set([correct]);

	while (opts.size < count) {
		const noise = randomInt(-10, 10);
		const wrong = correct + noise;
		if (wrong !== correct && wrong >= 0) opts.add(wrong);
	}

	return shuffle(
		[...opts].map((v) => ({
			content: Number.isInteger(v) ? v.toString() : v.toFixed(2),
			is_correct: v === correct,
			is_selected: false,
		}))
	);
}

function distributeTemplates(templates) {
	const total = 10;
	const n = templates.length;

	if (n >= 10) {
		return templates
			.sort(() => Math.random() - 0.5)
			.slice(0, 10)
			.map((t) => ({ tpl: t, count: 1 }));
	}

	const base = Math.floor(total / n);
	const extra = total % n;

	return templates.map((tpl, i) => ({
		tpl,
		count: base + (i < extra ? 1 : 0),
	}));
}

function generateHandler(templates) {
	const distributed = distributeTemplates(templates);
	const totalOptions = optionCountByLevel(templates[0].level);

	const result = { questions: [] };

	for (const dist of distributed) {
		for (let i = 0; i < dist.count; i++) {
			const tpl = dist.tpl;

			const placeholders = extractPlaceholders(tpl.content);
			const values = generateValues(placeholders);

			// replace placeholder → value
			let content = tpl.content;
			for (const key in values) {
				content = content.replaceAll(`{${key}}`, values[key]);
			}

			// hitung jawaban benar
			const correct = tpl.formula ? evalFormula(tpl.formula, values) : null;

			// buat opsi
			const options =
				correct !== null
					? generateOptions(correct, totalOptions)
					: [
							{ content: "-", is_correct: true, is_selected: false },
							...Array(totalOptions - 1).fill({
								content: "-",
								is_correct: false,
								is_selected: false,
							}),
					  ];

			result.questions.push({
				template_id: tpl.template_id,
				content,
				options,
			});
		}
	}

	return result;
}

module.exports = generateHandler;
