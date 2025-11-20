const express = require("express");
const authorization = require("../middlewares/authorization.middleware");
const UserController = require("../controllers/user.controller");

const router = express.Router();

// AUTENTIKASI
router.post(
	"/auth/signin", //
	UserController.signin
);
router.post(
	"/auth/signup", //
	UserController.signup
);
router.delete(
	"/auth/signout", //
	UserController.signout
);

// ROOT
router.get(
	"/", //
	authorization(["admin"]),
	UserController.findSummary
);
router.get(
	"/:user_id", //
	authorization(["admin"]),
	UserController.findDetail
);
router.post(
	"/", //
	authorization(["admin"]),
	UserController.create
);
router.patch(
	"/", //
	authorization(["admin", "student"]),
	UserController.update
);
router.delete(
	"/:user_id", //
	authorization(["admin"]),
	UserController.delete
);

module.exports = router;
