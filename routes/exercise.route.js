const express = require("express");
const authorization = require("../middlewares/authorization.middleware");
const ExerciseController = require("../controllers/exercise.controller");

const router = express.Router();

router.get(
	"/", //
	authorization(["student"]),
	ExerciseController.findSummary
);
router.get(
	"/active", //
	authorization(["student"]),
	ExerciseController.findActive
);
router.get(
	"/:exercise_id", //
	authorization(["student"]),
	ExerciseController.findDetail
);
router.post(
	"/", //
	authorization(["student"]),
	ExerciseController.create // untuk generate exercise
);
router.patch(
	"/", //
	authorization(["student"]),
	ExerciseController.update // untuk submit exercise
);
router.delete(
	"/:exercise_id", //
	authorization(["student"]),
	ExerciseController.delete
);

module.exports = router;
