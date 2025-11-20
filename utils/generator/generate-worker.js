const { parentPort } = require("worker_threads");
const generateHandler = require("./generate-core");

parentPort.on("message", (templates) => {
	try {
		const result = generateHandler(templates);
		parentPort.postMessage({ ok: true, result });
	} catch (err) {
		parentPort.postMessage({ ok: false, error: err.message });
	}
});
