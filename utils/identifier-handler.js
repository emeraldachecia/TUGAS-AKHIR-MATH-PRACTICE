const { v4: uuidv4 } = require("uuid");

const identifierHandler = (modelCode, randomCodeLength = 6) => {
    if (typeof modelCode !== "string" || !/^[a-zA-Z0-9]+$/.test(modelCode)) {
		throw new Error(
			"Invalid modelCode: It must be a non-empty alphanumeric string."
		);
	}

	const validatedRandomCodeLength = Math.min(Math.max(randomCodeLength, 6), 12);

	const timestamp = Date.now().toString(36).toLowerCase();

	const uuid = uuidv4().replace(/-/g, "").toLowerCase();
	const randomCode = uuid.substring(0, validatedRandomCodeLength);

	return `${modelCode}-${timestamp}-${randomCode}`;
}

module.exports = identifierHandler;