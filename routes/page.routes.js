const express = require("express");
const PageController = require("../controllers/page.controller");

const router = express.Router();

// HOME PAGE
router.get("/", PageController.home);

// LOGIN REGISTER PAGE
router.get("/auth", PageController.auth);

module.exports = router;