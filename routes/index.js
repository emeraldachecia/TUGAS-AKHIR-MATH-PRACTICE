const express = require("express");
const router = express.Router();

const pageRoute = require("./page.routes");

router.use("/", pageRoute);

module.exports = router;