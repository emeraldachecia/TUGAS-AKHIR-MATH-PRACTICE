const express = require("express");
const router = express.Router();

const pageRoute = require("./page.route");
const userRoute = require("./user.route");
const exerciseRoute = require("./exercise.route");
const templateRoute = require("./template.route");

router.use("/", pageRoute);
router.use("/api/user", userRoute);
router.use("/api/exercise", exerciseRoute);
router.use("/api/template", templateRoute);

module.exports = router;