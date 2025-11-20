const express = require("express");
const authorization = require("../middlewares/authorization.middleware");
const upload = require("../middlewares/upload.middleware");
const TemplateController = require("../controllers/template.controller");

const router = express.Router();

router.get(
	"/", //
	authorization(["admin"]),
	TemplateController.findSummary
);
router.get(
	"/:template_id", //
	authorization(["admin"]),
	TemplateController.findDetail
);
router.post(
	"/", //
	authorization(["admin"]),
	upload.single("image"),
	TemplateController.create
);
router.patch(
	"/", //
	authorization(["admin"]),
	upload.single("image"),
	TemplateController.update
);
router.delete(
	"/:template_id", //
	authorization(["admin"]),
	TemplateController.delete
);

module.exports = router;
