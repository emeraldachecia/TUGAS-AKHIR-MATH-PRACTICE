const express = require("express");
const router = express.Router();

const pageRoute = require("./page.routes");
const userRoute = require("./user.route");

router.use("/", pageRoute);
router.use("/api/user", userRoute);

module.exports = router;