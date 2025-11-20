const express = require("express");
const authorization = require("../middlewares/authorization.middleware");
const PageController = require("../controllers/page.controller");

const router = express.Router();

// HOME PAGE
router.get("/", PageController.home);

// LOGIN REGISTER PAGE
router.get("/auth", PageController.auth);

// DASHBOARD
router.get(
    "/dashboard",
    authorization(["admin", "student"]),
    PageController.dashboard
);

// PROFILE
router.get(
    "/profile",
    authorization(["admin", "student"]),
    PageController.profile
);

// EXERCISE
router.get(
	"/exercise",
	authorization(["student"]),
	PageController.exerciseSummary
);
router.get(
	"/exercise/form",
	authorization(["student"]),
	PageController.exerciseForm
);
router.get(
	"/exercise/:exercise_id",
	authorization(["student"]),
	PageController.exerciseDetail
);

module.exports = router;