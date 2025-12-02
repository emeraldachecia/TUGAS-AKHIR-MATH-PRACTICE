const { create, all } = require("mathjs");

// membuat instance mathjs untuk menghitung formula
const math = create(all, {
    number: "number",
    precision: 64,
});

// random integer biasa
const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// operator yang diperbolehkan
const OPERATOR_LIST = ["+", "-", "*", "/"];

// ambil semua placeholder {a}, {b}, {opt1}, dll
function extractPlaceholders(content) {
    return content.match(/{(.*?)}/g) || [];
}

// generate nilai random untuk setiap placeholder
function generateValueForKey(key) {
    // placeholder operator
    if (key.includes("opt")) {
        return OPERATOR_LIST[randomInt(0, OPERATOR_LIST.length - 1)];
    }

    // selain operator = angka integer saja
    return randomInt(1, 25);
}

// mapping placeholder → value
function generateValues(placeholders) {
    const values = {};
    placeholders.forEach((ph) => {
        const key = ph.replace("{", "").replace("}", "");
        values[key] = generateValueForKey(key);
    });
    return values;
}

// rakit formula jadi string matematika (tanpa konstanta)
function buildExpression(formula, values) {
    let expr = formula;

    // replace semua key dengan value-nya
    for (const k in values) {
        expr = expr.replaceAll(k, values[k]);
    }

    return expr;
}

// evaluasi formula pakai mathjs
function evalFormula(formula, values) {
    const expr = buildExpression(formula, values);

    try {
        return math.evaluate(expr);
    } catch (err) {
        console.error("Formula Error:", formula, values, err);
        return null;
    }
}

// jumlah opsi semua level adalah 4
function optionCount() {
    return 4
}

// generate opsi jawaban
function generateOptions(correct, count) {
    const opts = new Set([correct]);

    // generate angka mirip hasil (supaya tidak terlalu random jauh)
    while (opts.size < count) {
        const noise = randomInt(-10, 10);
        const wrong = correct + noise;
        if (wrong !== correct) opts.add(wrong);
    }

    // convert ke format opsi
    const arr = [...opts].map((v) => ({
        content: Number.isInteger(v) ? v.toString() : v.toFixed(2),
        is_correct: v === correct,
        is_selected: false,
    }));

    // shuffle Fisher-Yates
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

// distribusi template untuk 10 soal
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

// Fungsi Utama
function generateHandler(templates) {
    const distributed = distributeTemplates(templates);
    const totalOptions = optionCount();

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

            // hitung jawaban
            const correct = tpl.formula ? evalFormula(tpl.formula, values) : null;

            // generate opsi
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
