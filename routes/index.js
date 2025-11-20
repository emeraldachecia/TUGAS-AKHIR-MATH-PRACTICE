const express = require("express");
const router = express.Router();

const pageRoute = require("./page.route");
const userRoute = require("./user.route");
const exerciseRoute = require("./exercise.route");

router.use("/", pageRoute);
router.use("/api/user", userRoute);
router.use("/api/exercise", exerciseRoute);

module.exports = router;